import { ApiPropertyOptional } from '@nestjs/swagger';

export class UP_publiciteUpdateRequestDto {
  @ApiPropertyOptional({
    description: 'Birth date of the user',
    example: '2024-10-10',
    type: String,
  })
  readonly birthDate: string;

  @ApiPropertyOptional({
    description: 'Gender of the user',
    example: " 'M' | 'F | 'X' | 'O' ",
    type: String,
  })
  readonly gender: string;

  @ApiPropertyOptional({
    description: 'Country of the user',
    example: 'Argentina',
    type: String,
  })
  readonly countryRegion: string;

  @ApiPropertyOptional({
    description: 'Description of the user',
    example: 'I like to code',
    type: String,
  })
  readonly description: string;

  constructor(
    birthDate: string,
    gender: string,
    countryRegion: string,
    description: string,
  ) {
    this.birthDate = birthDate;
    this.gender = gender;
    this.countryRegion = countryRegion;
    this.description = description;
  }
}
