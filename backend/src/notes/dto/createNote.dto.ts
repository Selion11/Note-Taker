import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @IsString()
  @MaxLength(100, { message: 'Title is too long (max 100 chars)' })
  title: string;

  @IsNotEmpty({ message: 'Content cannot be empty' })
  @IsString()
  @MaxLength(4000, { message: 'Content exceeds 4000 chars' })
  content: string;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({each: true})
  categoryIds?: number[];
}