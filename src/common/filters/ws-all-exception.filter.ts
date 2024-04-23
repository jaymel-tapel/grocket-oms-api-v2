import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsAllExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    let error: string | object;

    let message = 'Internal Server Error';
    let stack = exception.stack?.replace(/\n/g, '') ?? null;
    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof WsException) {
      error = exception.getError();
    } else {
      // Handle other types of exceptions
      message = exception.message || message; // Use the exception message if available
      stack = exception.stack || stack; // Use the exception stack trace if available
    }

    let details: object;

    if (error) {
      details = error instanceof Object ? { ...error } : { message: error };
    } else {
      details = {
        message,
        stack,
        statusCode,
      };
    }

    client.emit('error', {
      event: 'error',
      ...details,
      ...(!error && { stack }),
    });
  }
}
