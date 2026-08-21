import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsIn, IsOptional, IsString, Matches } from 'class-validator';

@InputType()
export class AdminInvoiceFiltersInput {
  @Field(() => String, {
    nullable: true,
    description: 'mongoId exacto del usuario dueño del ticket',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Búsqueda libre por nombre, apellido, usuario o email',
  })
  @IsOptional()
  @IsString()
  userSearch?: string;

  @Field(() => String, {
    nullable: true,
    description: 'approved | pending | rejected | authorized | cancelled',
  })
  @IsOptional()
  @IsIn(['approved', 'pending', 'rejected', 'authorized', 'cancelled'])
  paymentStatus?: string;

  @Field(() => String, { nullable: true, description: 'Desde (YYYY-MM-DD)' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}/, { message: 'dateFrom debe ser YYYY-MM-DD' })
  dateFrom?: string;

  @Field(() => String, { nullable: true, description: 'Hasta (YYYY-MM-DD)' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}/, { message: 'dateTo debe ser YYYY-MM-DD' })
  dateTo?: string;

  @Field(() => Boolean, {
    nullable: true,
    description: 'true = sólo con factura cargada, false = sólo sin factura',
  })
  @IsOptional()
  @IsBoolean()
  hasFactura?: boolean;
}
