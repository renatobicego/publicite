import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ContactRequestDto_SWAGGER {
  @ApiPropertyOptional({
    description: 'Contact phone',
    example: '+54 9 11 1111 1111',
    type: String,
  })
  @IsOptional()
  public phone: string;

  @ApiPropertyOptional({
    description: 'Instagram',
    example: '@Dutsiland',
    type: String,
  })
  @IsOptional()
  public instagram: string;

  @ApiPropertyOptional({
    description: 'Facebook',
    example: 'Dutsiland Company',
    type: String,
  })
  @IsOptional()
  public facebook: string;

  @ApiPropertyOptional({
    description: 'X (Ex twitter)',
    example: '@Dutsiland',
    type: String,
  })
  @IsOptional()
  public x: string;

  @ApiPropertyOptional({
    description: 'Website',
    example: 'htttps://dutsiland.com',
    type: String,
  })
  @IsOptional()
  public website: string;
}
