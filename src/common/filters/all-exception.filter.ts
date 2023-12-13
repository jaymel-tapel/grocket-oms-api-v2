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

    let message = exception.message?.replace(/\n/g, '') ?? 'Internal Server Error';
    let stack = exception.stack?.replace(/\n/g, '') ?? null;
    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          statusCode = HttpStatus.CONFLICT;
          break;
        }
        default:
          super.catch(exception, host);
          break;
      }
    }
    else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
    } else {
      // Handle other types of exceptions
      message = exception.message || message; // Use the exception message if available
      stack = exception.stack || stack; // Use the exception stack trace if available
    }

    response.status(statusCode).json({
      statusCode,
      message,
      stack,
      timestamp: new Date().toISOString(),
    });
  }
}
