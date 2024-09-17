import { ApiProperty } from '@nestjs/swagger';
import { Types, ObjectId } from 'mongoose';

export class VisibilityDto {
  @ApiProperty({
    description: 'Type 1',
    example: 'example 1',
    type: String,
  })
  type_1: string;

  @ApiProperty({
    description: 'Type 2',
    example: 'example 2',
    type: String,
  })
  type_2: string;

  @ApiProperty({
    description: 'Type 3',
    example: 'example 3',
    type: String,
  })
  type_3: string;
}

export class PostRequestDto {
  @ApiProperty({
    description: 'title of the post',
    example: 'title',
    type: String,
  })
  title: string;

  @ApiProperty({
    description: 'author of the post',
    example: 'mcvetic',
    type: Types.ObjectId,
  })
  author: string;

  @ApiProperty({
    description: 'type of the post',
    example: 'This is a type',
    type: String,
  })
  postType: string;

  @ApiProperty({
    description: 'description of the post',
    example: 'This is a description',
    type: String,
  })
  description: string;

  @ApiProperty({
    description: 'visibility of the post',
    example: 'This is a visibility',
    type: String,
  })
  visibility: string;

  @ApiProperty({
    description: 'recomendations of the post',
    example: '66e608531f76fc4dda965554',
    type: [Types.ObjectId],
  })
  recomendations: ObjectId[];

  @ApiProperty({
    description: 'price of the post',
    example: 10,
    type: Number,
  })
  price: number;

  @ApiProperty({
    description: 'location of the post',
    example: '66e608531f76fc4dda965554',
    type: Types.ObjectId,
  })
  location: ObjectId;

  @ApiProperty({
    description: 'category of the post',
    example: '66e608531f76fc4dda965554',
    type: [Types.ObjectId],
  })
  category: ObjectId[];

  @ApiProperty({
    description: 'comments of the post',
    example: '66e608531f76fc4dda965554',
    type: [Types.ObjectId],
  })
  comments: ObjectId[];

  @ApiProperty({
    description: 'attachedFiles of the post',
    example: '66e608531f76fc4dda965554',
    type: [Types.ObjectId],
  })
  attachedFiles: ObjectId[];

  @ApiProperty({
    description: 'createAt of the post',
    example: '2022-01-01T00:00:00.000Z',
    type: String,
  })
  createAt: string;
}
