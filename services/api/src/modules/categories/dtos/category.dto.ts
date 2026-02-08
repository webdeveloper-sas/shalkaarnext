import { IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;
}

export class CategoryResponseDto {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
