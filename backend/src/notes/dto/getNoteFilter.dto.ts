import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class GetNotesFilterDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'isArchived must be a boolean (true/false)' })
  isArchived?: boolean;

  @IsOptional()
  @IsString()
  category?: string;
}
