export class PreviousIdMissingException extends Error {
    statusCode: number;

    constructor() {
        super('PREVIOUS_ID_MISSING');
        this.name = 'PreviousIdMissingException';
        this.statusCode = 404; // Asigna el código de estado HTTP correcto
    }
}
