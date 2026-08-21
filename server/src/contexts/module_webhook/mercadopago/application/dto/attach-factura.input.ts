import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

@InputType()
export class AttachFacturaInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  invoiceId: string;

  @Field(() => String, {
    description: 'URL del PDF/imagen ya subido (UploadThing)',
  })
  @IsNotEmpty()
  @IsUrl({ require_protocol: true }, { message: 'facturaUrl debe ser una URL válida' })
  @MaxLength(1000)
  facturaUrl: string;
}
