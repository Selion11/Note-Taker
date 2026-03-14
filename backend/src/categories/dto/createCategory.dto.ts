import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString()
  @MaxLength(50, { message: 'Name is too long (max 50 chars)' })
  name: string;
}
