export class PreviousIdMissingException extends Error {
    statusCode: number; // Declaramos la propiedad statusCode

    constructor() {
        super('PREVIOUS_ID_MISSING'); // Llama al constructor de la clase Error
        this.name = 'PreviousIdMissingException'; // Asigna un nombre a la excepción
        this.statusCode = 404; // Asigna el código de estado HTTP 304
    }
}
