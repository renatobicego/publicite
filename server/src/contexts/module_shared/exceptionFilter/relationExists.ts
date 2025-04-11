export class RelationExistsException extends Error {
  statusCode: number;

  constructor() {
    super('RELATION_EXISTS');
    this.name = 'RelationExistsException';
    this.statusCode = 304; // Asigna el código de estado HTTP correcto
  }
}
