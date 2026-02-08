import { IsString, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  postal: string;

  @IsString()
  country: string;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postal?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class AddressResponseDto {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  postal: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}
