import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  ValidateIf,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType, TransactionStatus } from './transaction.enum';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @Type(() => Number) // Ensure numeric conversion
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @IsBoolean()
  @IsOptional()
  visible?: boolean = true;

  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsUUID()
  @IsNotEmpty()
  account1: string;

  // account2 is required only if type === SELF_DEDUCT
  @ValidateIf((o) => o.type === TransactionType.SELF_DEDUCT)
  @IsUUID()
  account2?: string;
}
