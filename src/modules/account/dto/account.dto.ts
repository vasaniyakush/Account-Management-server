import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType } from './account.enums';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  note?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  balance?: number = 0;

  @IsEnum(AccountType)
  @IsOptional()
  accountType?: AccountType = AccountType.BANK;
}

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsEnum(AccountType)
  @IsOptional()
  accountType?: AccountType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
