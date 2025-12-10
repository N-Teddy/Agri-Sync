import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import { extname } from 'path';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { AppConfiguration } from 'src/config/configuration';
import { EmailQueueService } from '../email/email-queue.service';
import { GoogleAuthService } from 'src/common/third-party/google-auth.service';
import { CloudinaryService } from 'src/common/third-party/cloudinary.service';
import { LocalStorageService } from 'src/common/services/local-storage.service';
import { User } from 'src/entities';
import { Express } from 'express';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: Record<string, unknown>;
}

@Injectable()
export class AuthService {
  private readonly bcryptRounds = 10;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfiguration>,
    private readonly emailQueueService: EmailQueueService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly localStorageService: LocalStorageService,
  ) {}

  async register(payload: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(
      payload.email.toLowerCase(),
    );
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(payload.password, this.bcryptRounds);
    const verificationToken = randomBytes(32).toString('hex');
    const emailExpiration = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const user = await this.usersService.create({
      email: payload.email.toLowerCase(),
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber,
      passwordHash,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpiresAt: emailExpiration,
    });

    await this.sendVerificationEmail(user.email, verificationToken);

    const tokens = await this.generateTokens(user, payload.rememberMe);

    return { ...tokens, user: this.sanitizeUser(user) };
  }

  async login(payload: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(
      payload.email.toLowerCase(),
    );
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      payload.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user, payload.rememberMe);
    return { ...tokens, user: this.sanitizeUser(user) };
  }

  async googleAuth(payload: GoogleAuthDto): Promise<AuthResponse> {
    const profile = await this.googleAuthService.verifyIdToken(payload.idToken);
    let user =
      (await this.usersService.findByGoogleId(profile.sub)) ??
      (await this.usersService.findByEmail(profile.email));

    if (user) {
      user = await this.usersService.update(user.id, {
        googleId: profile.sub,
        isEmailVerified: profile.emailVerified || user.isEmailVerified,
        emailVerifiedAt: profile.emailVerified
          ? user.emailVerifiedAt ?? new Date()
          : user.emailVerifiedAt,
        avatarUrl: profile.picture ?? user.avatarUrl,
      });
    } else {
      user = await this.usersService.create({
        email: profile.email.toLowerCase(),
        fullName: profile.name ?? profile.email.split('@')[0],
        googleId: profile.sub,
        isEmailVerified: profile.emailVerified,
        emailVerifiedAt: profile.emailVerified ? new Date() : undefined,
        avatarUrl: profile.picture,
      });
    }

    const tokens = await this.generateTokens(user, payload.rememberMe);
    return { ...tokens, user: this.sanitizeUser(user) };
  }

  async verifyEmail(payload: VerifyEmailDto): Promise<{ message: string }> {
    const user = await this.usersService.findByVerificationToken(payload.token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (
      user.emailVerificationExpiresAt &&
      user.emailVerificationExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Verification token expired');
    }

    await this.usersService.update(user.id, {
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
    });

    return { message: 'Email verified successfully' };
  }

  async refreshTokens(
    payload: RefreshTokenDto,
    rememberMe?: boolean,
  ): Promise<AuthResponse> {
    let decoded: { sub: string; email: string; rememberMe?: boolean };
    try {
      decoded = await this.jwtService.verifyAsync(payload.refreshToken, {
        secret: this.configService.get('jwt')?.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(decoded.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matches = await bcrypt.compare(
      payload.refreshToken,
      user.refreshTokenHash,
    );
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user, decoded.rememberMe);
    return { ...tokens, user: this.sanitizeUser(user) };
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.usersService.update(userId, {
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
    });
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string): Promise<Record<string, unknown>> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.sanitizeUser(user);
  }

  async updateProfile(
    userId: string,
    payload: UpdateProfileDto,
  ): Promise<Record<string, unknown>> {
    const updates: Partial<User> = {};
    if (payload.fullName !== undefined) {
      updates.fullName = payload.fullName;
    }
    if (payload.phoneNumber !== undefined) {
      updates.phoneNumber = payload.phoneNumber;
    }
    const user = await this.usersService.update(userId, updates);
    return this.sanitizeUser(user);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const extension = extname(file.originalname) || '.jpg';
    const filename = `${userId}-${Date.now()}${extension}`;
    const localPath = await this.localStorageService.saveFile(file.buffer, filename);
    const appConfig = this.configService.get('app');
    let avatarUrl = localPath;

    if (appConfig?.env === 'production' && this.cloudinaryService.isEnabled()) {
      const response = await this.cloudinaryService.uploadImage(localPath, 'avatars');
      avatarUrl = response.secure_url;
      await fs.unlink(localPath).catch(() => undefined);
    }

    await this.usersService.update(userId, { avatarUrl });
    return { avatarUrl };
  }

  private async generateTokens(
    user: User,
    rememberMe?: boolean,
  ): Promise<AuthTokens> {
    const jwtConfig = this.configService.get('jwt');
    if (!jwtConfig) {
      throw new Error('JWT configuration missing');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: jwtConfig.expiresIn,
      secret: jwtConfig.secret,
    });

    const refreshPayload = {
      ...payload,
      rememberMe: Boolean(rememberMe),
    };
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      expiresIn: rememberMe
        ? jwtConfig.rememberMeRefreshExpiresIn
        : jwtConfig.refreshExpiresIn,
      secret: jwtConfig.refreshSecret,
    });

    await this.storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const decoded = this.jwtService.decode(refreshToken) as { exp?: number };
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : undefined;
    const hashedToken = await bcrypt.hash(refreshToken, this.bcryptRounds);

    await this.usersService.update(userId, {
      refreshTokenHash: hashedToken,
      refreshTokenExpiresAt: expiresAt,
    });
  }

  private sanitizeUser(user: User): Record<string, unknown> {
    const {
      passwordHash,
      refreshTokenHash,
      emailVerificationToken,
      ...safeUser
    } = user;
    return safeUser;
  }

  private async sendVerificationEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const appConfig = this.configService.get('app');
    const baseUrl = appConfig?.webUrl?.replace(/\/$/, '') ?? '';
    const verifyUrl = `${baseUrl}/${appConfig?.globalPrefix ?? 'api'}/auth/verify-email?token=${token}`;
    const html = `
      <p>Hello,</p>
      <p>Please verify your email address to activate your Agri Sync Pro account.</p>
      <p><a href="${verifyUrl}">Click here to verify</a></p>
      <p>If you can't click the link, copy and paste this URL into your browser:</p>
      <p>${verifyUrl}</p>
    `;

    await this.emailQueueService.enqueueEmail({
      to: email,
      subject: 'Verify your Agri Sync Pro account',
      html,
      text: `Verify your account: ${verifyUrl}`,
    });
  }
}
