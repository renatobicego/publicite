import { IsOptional } from 'class-validator';
import { Visibility } from '../../../domain/entity/visibility.enum';

class ProfesionDto {
  label?: string;
  visibility?: Visibility;
}

class CurriculumDto {
  ref?: string;
  visibility?: Visibility;
}

class DescriptionDto {
  text?: string;
  visibility?: Visibility;
}

class LinkItemDto {
  url?: string;
  label?: string;
  visibility?: Visibility;
}

export class ContactRequestDto_SWAGGER {
  @IsOptional()
  public phone?: string;
  @IsOptional()
  public phoneVisibility?: Visibility;

  @IsOptional()
  public instagram?: string;
  @IsOptional()
  public instagramVisibility?: Visibility;

  @IsOptional()
  public facebook?: string;
  @IsOptional()
  public facebookVisibility?: Visibility;

  @IsOptional()
  public x?: string;
  @IsOptional()
  public xVisibility?: Visibility;

  @IsOptional()
  public website?: string;
  @IsOptional()
  public websiteVisibility?: Visibility;

  @IsOptional()
  public profesion?: ProfesionDto;

  @IsOptional()
  public curriculum?: CurriculumDto;

  @IsOptional()
  public description?: DescriptionDto;

  @IsOptional()
  public links?: LinkItemDto[];
}
