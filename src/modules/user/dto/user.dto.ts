import { IsEmail, IsUUID } from 'class-validator';
import { Account } from 'src/modules/account/account.entity';
import { Transaction } from 'src/modules/transaction/transaction.entity';

export class CreateUserDto {
  firstName: string;

  lastName: string;

  email: string;

  phone?: string;

  profilePicture?: string;
}

export class TokenUserPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export class CreateViewerDto {
  @IsEmail()
  viewerEmailId: string;
}

export class UserResponseDto {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  profilePicture: string;
}

export class SummaryDto {
  totalAccounts: number = 0;
  totalViewers: number = 0;
  totalViewees: number = 0;
  totalTransactions: number = 0;
  totalDebitTransactions: number = 0;
  totalCreditTransactions: number = 0;
  totalSelfDeductTransactions: number = 0;
  totalDebit: string = '0';
  totalCredit: string = '0';
  totalBalance: string = '0';
  totalInvestments: string = '0';
  totalBankBalance: string = '0';
  totalOtherBalance: string = '0';
  totalCashBalance: string = '0';
  accounts: Account[] = [];
  transactions: Transaction[] = [];
}
