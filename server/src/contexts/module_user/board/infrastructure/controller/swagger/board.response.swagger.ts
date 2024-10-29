import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class BoardResponse_swagger {
  @ApiProperty({
    description: 'Identificador único del tablero',
    type: String,
    example: '60b6f4d2f2d3d5333446eb8a',
  })
  _id: Types.ObjectId | undefined;

  @ApiProperty({
    description: 'Array de anotaciones relacionadas con el tablero',
    example: ['Primera anotación', 'Segunda anotación'],
  })
  annotations: string[];

  @ApiProperty({
    description: 'Visibilidad del tablero, ya sea público o privado',
    example: 'public',
    enum: ['public', 'private'],
  })
  visibility: string;

  @ApiProperty({
    description: 'Información del usuario asociado al tablero',
    type: String,
  })
  user: string;

  @ApiProperty({
    description: 'Color representativo del tablero',
    example: '#ff5733',
  })
  color: string;

  @ApiProperty({
    description: 'Palabras clave relacionadas con el tablero',
    example: ['tecnología', 'desarrollo'],
  })
  keywords: string[];
}
