import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class ExceptionFilter implements ExceptionFilter {
  constructor(private httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    let httpStatus: number;
    let httpResponse: Object;

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      httpResponse = exception.getResponse();
    } else {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      httpResponse = { message: 'Internal server error' };
    }

    const res = host.switchToHttp().getResponse();

    const responseBody = {
      statusCode: httpStatus,
    };

    if (typeof httpResponse === 'object') {
      Object.assign(responseBody, { ...httpResponse });
    }

    return httpAdapter.reply(res, responseBody, httpStatus);
  }
}
