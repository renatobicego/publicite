import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
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

    // Extraemos la traza de la pila (stack trace)
    const stack = exception instanceof Error ? exception.stack : '';

    let location = '';
    if (stack) {
      const stackLines = stack.split('\n');
      if (stackLines.length > 1) {
        // Esto típicamente contiene la línea con el archivo y la línea de código donde ocurrió el error
        location = stackLines[1].trim();
      }
    }
    console.log(
      `Error en el servidor. Status: ${status}, message: ${message}, location: ${location}`,
    );
    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
      location,
    });
  }
}
