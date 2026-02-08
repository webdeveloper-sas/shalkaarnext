import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  basePrice: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class ProductQueryDto {
  skip?: number;
  take?: number;
  categoryId?: string;
}

export class ProductResponseDto {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
