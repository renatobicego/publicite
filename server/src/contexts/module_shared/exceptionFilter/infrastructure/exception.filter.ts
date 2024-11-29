import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { Response } from 'express';
import { NotModifyException } from '../noModifyException';


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

  private handleHttpException(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let location = '';

    // Si es una instancia de NotModifyException, manejamos este caso especial
    if (exception instanceof NotModifyException) {
      status = exception.statusCode as any; // Usamos el código 304 que definiste en la excepción
      message = exception.message as any;   // Usamos el mensaje de la excepción personalizada
    }
    // Si es una instancia de HttpException, obtenemos el estado y el mensaje
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse() as any;
    }
    // Si es un error genérico
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // Obtener el stack trace si está disponible
    const stack = exception instanceof Error ? exception.stack : '';
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

  private handleGraphQLException(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let location = '';

    // Si es una instancia de NotModifyException, manejamos este caso especial
    if (exception instanceof NotModifyException) {
      status = exception.statusCode; // Usamos el código 304 que definiste en la excepción
      message = exception.message;   // Usamos el mensaje de la excepción personalizada
    }
    // Si es una instancia de HttpException, obtenemos el estado y el mensaje
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse() as any;
    }
    // Si es un error genérico
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // Obtener el stack trace si está disponible
    const stack = exception instanceof Error ? exception.stack : '';
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
