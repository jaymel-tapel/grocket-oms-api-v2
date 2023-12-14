import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let message = 'Internal Server Error';
    let stack = exception.stack?.replace(/\n/g, '') ?? null;
    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        message = (exceptionResponse as { message: string }).message;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(exception.code);
      switch (exception.code) {
        case 'P2002': {
          statusCode = HttpStatus.CONFLICT;
          message = `Unique constraint failed on the fields: ${exception.meta.target}`;
          break;
        }
        case 'P2003': {
          statusCode = HttpStatus.BAD_REQUEST;
          message = exception.message;
          break;
        }
        default:
          console.error(exception);
          break;
      }
    } else {
      // Handle other types of exceptions
      message = exception.message || message; // Use the exception message if available
      stack = exception.stack || stack; // Use the exception stack trace if available
    }

    response.status(statusCode).json({
      statusCode,
      message: message.replace(/\n/g, ''),
      stack,
      timestamp: new Date().toISOString(),
    });
  }
}
