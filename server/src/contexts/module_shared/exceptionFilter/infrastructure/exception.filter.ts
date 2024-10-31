import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    // Determinamos si el contexto es GraphQL
    if (host.getType().toString() === 'graphql') {
      this.handleGraphQLException(exception, host);
    } else {
      this.handleHttpException(exception, host);
    }
  }

  private handleHttpException(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    const stack = exception instanceof Error ? exception.stack : '';

    let location = '';
    if (stack) {
      const stackLines = stack.split('\n');
      if (stackLines.length > 1) {
        location = stackLines[1].trim();
      }
    }

    console.log(
      `Error en el servidor. Status: ${status}, message: ${message}, location: ${location}`,
    );
    console.log(message);

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
      location,
    });
  }

  private handleGraphQLException(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    const stack = exception instanceof Error ? exception.stack : '';

    let location = '';
    if (stack) {
      const stackLines = stack.split('\n');
      if (stackLines.length > 1) {
        location = stackLines[1].trim();
      }
    }

    console.log(
      `GraphQL error. Status: ${status}, message: ${message}, location: ${location}`,
    );

    // En GraphQL no usamos response.status, sino que retornamos el error tal cual
    throw new HttpException(
      {
        statusCode: status,
        message,
        location,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}
