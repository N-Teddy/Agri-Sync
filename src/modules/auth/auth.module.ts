import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStorageService } from '../../common/services/local-storage.service';
import { CloudinaryService } from '../../common/third-party/cloudinary.service';
import { GoogleAuthService } from '../../common/third-party/google-auth.service';
import { AppConfiguration } from '../../config/configuration';

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
        const expiresIn = jwtConfig.expiresIn as JwtSignOptions['expiresIn'];
        return {
          secret: jwtConfig.secret,
          signOptions: {
            expiresIn,
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
export class AuthModule { }
