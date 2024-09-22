import { ApiPropertyOptional } from '@nestjs/swagger';

export abstract class PersonalUpdateRequest_SWAGGER {
  @ApiPropertyOptional({
    description: 'Birth date of the user',
    example: '2024-10-10',
    type: String,
  })
  birthDate: string;

  @ApiPropertyOptional({
    description: 'Gender of the user',
    example: " 'M' | 'F | 'X' | 'O' ",
    type: String,
  })
  gender: string;

  @ApiPropertyOptional({
    description: 'Country of the user',
    example: 'Argentina',
    type: String,
  })
  countryRegion: string;

  @ApiPropertyOptional({
    description: 'Description of the user',
    example: 'I like to code',
    type: String,
  })
  description: string;
}
