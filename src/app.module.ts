import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './env.validation';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local'],
      validate,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        database: configService.get<string>('db.name'),
        port: configService.get<number>('db.port'),
        username: configService.get<string>('db.user'),
        password: configService.get<string>('db.password'),
        host: configService.get<string>('db.host'),
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService],
})
export class AppModule {}
