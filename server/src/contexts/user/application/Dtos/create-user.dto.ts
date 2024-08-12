// src/application/dto/create-user.dto.ts
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @IsNotEmpty()
  @IsEmail()
  readonly lastName: string;

  @IsNotEmpty()
  @IsString()
  readonly imageUrl: string;

  constructor(firstName: string, lastName: string, imageUrl: string) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.imageUrl = imageUrl;
  }
}
