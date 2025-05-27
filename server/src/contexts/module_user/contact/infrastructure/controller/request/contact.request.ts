
import { IsOptional } from 'class-validator';

export class ContactRequestDto_SWAGGER {

  @IsOptional()
  public phone: string;


  @IsOptional()
  public instagram: string;

  @IsOptional()
  public facebook: string;


  @IsOptional()
  public x: string;

  @IsOptional()
  public website: string;
}
