import { Field, Float, InputType } from '@nestjs/graphql';

@InputType({
  description:
    'Peso de una foto o video subido al anuncio (cuenta para el almacenamiento del plan)',
})
export class PostMediaSizeInput {
  @Field(() => String, {
    description: 'Key tal como se guarda en imagesUrls (con el sufijo "video" si es video)',
  })
  key: string;

  @Field(() => Float, { description: 'Tamaño en bytes' })
  sizeBytes: number;
}
