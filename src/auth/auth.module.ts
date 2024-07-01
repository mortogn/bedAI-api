import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [ConfigModule, UsersModule],
  providers: [AuthService, ConfigService],
  controllers: [AuthController],
})
export class AuthModule {}
