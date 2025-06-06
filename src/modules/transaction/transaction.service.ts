import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Account } from '../account/account.entity';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/transaction.dto';
import { TokenUserPayload } from '../user/dto/user.dto';
import { TransactionType } from './dto/transaction.enum';
import { Decimal } from 'decimal.js';
@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    private dataSource: DataSource,
  ) {}

  async findAll(user: TokenUserPayload): Promise<Transaction[]> {
    const userAccounts = await this.accountRepository.find({
      // @ts-ignore
      where: { user: { id: user.userId } },
      relations: ['user'],
    });
    const accountIds = userAccounts.map((account) => account.id);

    return this.transactionRepository.find({
      where: [
        { account1: { id: In(accountIds) } },
        { account2: { id: In(accountIds) } },
      ],
      relations: ['account1', 'account2'],
      order: { timestamp: 'DESC' },
    });
  }

  async createTransaction(
    transactionBody: CreateTransactionDto,
    user: TokenUserPayload,
  ): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const account1 = await queryRunner.manager.findOne(Account, {
        where: {
          id: transactionBody.account1,
          //@ts-ignore
          user: { id: user.userId },
          isActive: true,
        },
      });

      if (!account1) {
        throw new Error('Account not found');
      }
      //update amount from account1
      if (transactionBody.type === TransactionType.CREDIT) {
        account1.balance = new Decimal(account1.balance)
          .add(transactionBody.amount)
          .toString();
        await queryRunner.manager.save(account1);
      } else if (
        transactionBody.type === TransactionType.DEBIT ||
        transactionBody.type === TransactionType.SELF_DEDUCT
      ) {
        account1.balance = new Decimal(account1.balance)
          .sub(transactionBody.amount)
          .toString();
        await queryRunner.manager.save(account1);
      }

      // If transaction type is SELF_DEDUCT, we need to add the amount to account2
      if (transactionBody.type == TransactionType.SELF_DEDUCT) {
        if (transactionBody.account2) {
          throw new Error(
            'Account2 should not be provided for SELF_DEDUCT transaction',
          );
        }
        const account2 = await queryRunner.manager.findOne(Account, {
          where: {
            id: transactionBody.account2,
            //@ts-ignore
            user: { id: user.userId },
            isActive: true,
          },
        });
        if (!account2) {
          throw new Error('Account2 not found for SELF_DEDUCT transaction');
        }
        // Add amount to account2
        account2.balance = new Decimal(account2.balance)
          .add(transactionBody.amount)
          .toString();
        await queryRunner.manager.save(account2);
      }

      // Create the transaction
      const transaction = queryRunner.manager.create(Transaction, {
        account1: { id: account1.id },
        ...(transactionBody.type === TransactionType.SELF_DEDUCT
          ? { account2: { id: transactionBody.account2 } }
          : {}),
        message: transactionBody.message,
        note: transactionBody.note,
        category: transactionBody.category,
        type: transactionBody.type,
        amount: transactionBody.amount,
        visible: transactionBody.visible ?? false,
        status: transactionBody.status,
        timestamp: new Date(),
      });

      const savedTransaction = await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteTransaction(
    transactionId: string,
    user: TokenUserPayload,
    revert_account: boolean,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const transaction = await queryRunner.manager.findOne(Transaction, {
        //@ts-ignore
        where: { id: transactionId, account1: { user: { id: user.userId } } },
        relations: ['account1', 'account2'],
      });

      if (!transaction) {
        throw new HttpException(
          'Transaction not found',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (
        !transaction.account1.isActive ||
        (transaction.type === TransactionType.SELF_DEDUCT &&
          !transaction.account2?.isActive)
      ) {
        throw new HttpException(
          'Transaction account is not active',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Check if the user owns the accounts involved in the transaction
      const account1 = await queryRunner.manager.findOne(Account, {
        where: {
          id: transaction.account1.id,
          //@ts-ignore
          user: { id: user.userId },
          isActive: true,
        },
      });
      if (!account1) {
        throw new HttpException(
          'Account1 not found or does not belong to the user',
          HttpStatus.BAD_REQUEST,
        );
      }
      let account2: Account | null = null;
      if (transaction.type === TransactionType.SELF_DEDUCT) {
        account2 = await queryRunner.manager.findOne(Account, {
          where: {
            id: transaction.account2?.id,
            //@ts-ignore
            user: { id: user.userId },
            isActive: true,
          },
        });
        if (!account2) {
          throw new HttpException(
            'Account2 not found or does not belong to the user',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (revert_account) {
        // Revert the amount in account1
        if (transaction.type === TransactionType.CREDIT) {
          account1.balance = new Decimal(account1.balance)
            .sub(transaction.amount)
            .toString();
        } else if (
          transaction.type === TransactionType.DEBIT ||
          transaction.type === TransactionType.SELF_DEDUCT
        ) {
          account1.balance = new Decimal(account1.balance)
            .add(transaction.amount)
            .toString();
        }

        if (transaction.type === TransactionType.SELF_DEDUCT && account2) {
          account2.balance = new Decimal(account2.balance)
            .sub(transaction.amount)
            .toString();
          await queryRunner.manager.save(account2);
        }
        await queryRunner.manager.save(account1);
      }

      // If it's a SELF_DEDUCT transaction, revert the amount in account2 as well
      if (
        transaction.type === TransactionType.SELF_DEDUCT &&
        transaction.account2
      ) {
        const account2 = await queryRunner.manager.findOne(Account, {
          where: {
            id: transaction.account2.id,
            //@ts-ignore
            user: { id: user.userId },
            isActive: true,
          },
        });
        if (!account2) {
          throw new Error('Account2 not found or does not belong to the user');
        }
        account2.balance = new Decimal(account2.balance)
          .sub(transaction.amount)
          .toString();
        await queryRunner.manager.save(account2);
      }

      // Delete the transaction
      await queryRunner.manager.remove(transaction);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
