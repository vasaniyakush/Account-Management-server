import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { Account } from '../account/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Account])],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
