import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class BoardRequest_swagger {
  @ApiProperty({
    description: 'Array de anotaciones para el tablero',
    example: ['nota1', 'nota2'],
  })
  annotations: string[];

  @ApiProperty({
    description: 'Visibilidad del tablero, puede ser público o privado',
    example: 'public',
    enum: ['public', 'private'],
  })
  visibility: string;

  @ApiProperty({
    description: 'ID del usuario asociado al tablero',
    type: String,
    example: '60b6f4d2f2d3d5333446eb8a',
  })
  user: Types.ObjectId;

  @ApiProperty({
    description: 'Color representativo del tablero',
    example: '#ff5733',
  })
  color: string;

  @ApiProperty({
    description:
      'Palabras clave asociadas al tablero para facilitar la búsqueda',
    example: ['tecnología', 'programación'],
  })
  keywords: string[];

  @ApiProperty({
    description: 'Término de búsqueda asociado al tablero',
    example: 'inteligencia artificial',
  })
  searchTerm: string;
}
