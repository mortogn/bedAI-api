import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory(errors) {
        let validationErrors: { [key: string]: string } = {};

        errors.forEach((error) => {
          Object.assign(validationErrors, {
            [error.property]:
              error.constraints?.[Object.keys(error.constraints)[0]],
          });
        });

        return new HttpException(
          { error: 'Validation Error', details: validationErrors },
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  );

  const configService = app.get(ConfigService);

  await app.listen(configService.get<number>('port'));
}
bootstrap();
