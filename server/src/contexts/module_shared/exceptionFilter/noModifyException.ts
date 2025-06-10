export class NotModifyException extends Error {
  statusCode: number; // Declaramos la propiedad statusCode

  constructor() {
    super('NOTIFICATION_ALREADY_EXISTS'); // Llama al constructor de la clase Error
    this.name = 'NotModifyException'; // Asigna un nombre a la excepción
    this.statusCode = 304; // Asigna el código de estado HTTP 304
  }
}
