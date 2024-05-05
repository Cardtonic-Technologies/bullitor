import { SessionSerializer } from '@app/auth/session.serializer';
import { ConfigService } from '@app/config';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';

import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [PassportModule.register({ session: true })],
  providers: [AuthService, LocalStrategy, SessionSerializer, ConfigService],
  controllers: [AuthController],
})
export class AuthModule {}
