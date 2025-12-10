import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStorageService } from 'src/common/services/local-storage.service';
import { CloudinaryService } from 'src/common/third-party/cloudinary.service';
import { GoogleAuthService } from 'src/common/third-party/google-auth.service';
import { AppConfiguration } from 'src/config/configuration';

import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    EmailModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfiguration>) => {
        const jwtConfig = configService.get<AppConfiguration['jwt']>('jwt');
        if (!jwtConfig) {
          throw new Error('JWT configuration missing');
        }
        return {
          secret: jwtConfig.secret,
          signOptions: {
            expiresIn: jwtConfig.expiresIn,
          },
        };
      },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleAuthService,
    CloudinaryService,
    LocalStorageService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
