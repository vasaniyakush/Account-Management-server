import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, SummaryDto } from './dto/user.dto';
import { OAuth2Client } from 'google-auth-library';
import { Viewer } from './viewer.entity';
import { Transaction } from '../transaction/transaction.entity';
import { Account } from '../account/account.entity';
import { TransactionType } from '../transaction/dto/transaction.enum';
import Decimal from 'decimal.js';
import { AccountType } from '../account/dto/account.enums';
@Injectable()
export class UserService {
  private client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Viewer)
    private viewersRepository: Repository<Viewer>,

    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,

    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profilePicture: true,
      },
      where: { isActive: true },
    });
  }

  async findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['accounts'],
    });
  }

  create(user: CreateUserDto): Promise<User> {
    return this.usersRepository.save(user);
  }

  async googleAuth(idToken: string): Promise<[User | any, boolean, boolean]> {
    console.log('Google ID Token:', idToken);
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new HttpException('Invalid ID token', HttpStatus.UNAUTHORIZED);
    }
    if (payload.aud != process.env.GOOGLE_CLIENT_ID) {
      throw new HttpException('Invalid ID token', HttpStatus.UNAUTHORIZED);
    }
    const {
      email,
      name,
      given_name,
      family_name,
      sub: googleId,
      picture,
    } = payload;
    console.log('Google ID:', googleId);
    console.log('Google Email:', email);
    console.log('Google Name:', name);
    console.log('Google Given Name:', given_name);
    console.log('Google Family Name:', family_name);
    console.log('Google Profile:', picture);
    console.log('Google Payload:', payload);

    let user = await this.usersRepository.findOne({ where: { email } });
    if (user) {
      if (picture) {
        if (user.profilePicture != picture) {
          user.profilePicture = picture;
          user = await this.usersRepository.save(user);
        }
      }

      return [user, false, user.isActive];
    } else {
      const newUser: User = await this.usersRepository.save({
        email,
        firstName: given_name,
        lastName: family_name,
        profilePicture: picture,
      });
      return [newUser, true, newUser.isActive];
    }
  }

  async getViewers(vieweeId: string): Promise<Viewer[]> {
    const viewers = await this.viewersRepository.find({
      where: { viewee: { id: vieweeId } },
      relations: ['viewer'],
    });
    return viewers;
  }

  async createViewer(viewerId: string, vieweeId: string): Promise<Viewer> {
    // Check if the viewer already exists
    const existingViewer = await this.viewersRepository.findOne({
      where: { viewer: { id: viewerId }, viewee: { id: vieweeId } },
    });
    if (existingViewer) {
      throw new HttpException('Viewer already exists', HttpStatus.BAD_REQUEST);
    }
    const viewer = await this.viewersRepository.save({
      viewer: { id: viewerId },
      viewee: { id: vieweeId },
    });
    return viewer;
  }

  async deleteViewer(viewerId: string, vieweeId: string): Promise<Viewer> {
    const viewer = await this.viewersRepository.findOne({
      where: { viewer: { id: viewerId }, viewee: { id: vieweeId } },
    });
    if (!viewer) {
      throw new HttpException('Viewer not found', HttpStatus.NOT_FOUND);
    }
    await this.viewersRepository.remove(viewer);
    return viewer;
  }

  async getViewees(viewerId: string): Promise<Viewer[]> {
    const viewees = await this.viewersRepository.find({
      where: { viewer: { id: viewerId } },
      relations: ['viewee'],
    });
    return viewees;
  }

  async getSummary(userId: string): Promise<SummaryDto> {
    const transactions = await this.transactionsRepository.find({
      //@ts-ignore
      where: { account1: { user: { id: userId } } },
      relations: ['account1', 'account2'],
      order: { timestamp: 'DESC' },
    });
    const accounts = await this.accountsRepository.find({
      //@ts-ignore
      where: { user: { id: userId } },
    });

    const summary = new SummaryDto();
    summary.totalAccounts = accounts.length;

    summary.totalTransactions = transactions.length;

    summary.totalViewers = await this.viewersRepository.count({
      where: { viewee: { id: userId } },
    });
    summary.totalViewees = await this.viewersRepository.count({
      where: { viewer: { id: userId } },
    });
    for (const transaction of transactions) {
      if (transaction.type == TransactionType.DEBIT) {
        summary.totalDebitTransactions++;
        summary.totalDebit = new Decimal(summary.totalDebit)
          .add(transaction.amount)
          .toString();
      }

      if (transaction.type == TransactionType.CREDIT) {
        summary.totalCreditTransactions++;
        summary.totalCredit = new Decimal(summary.totalCredit)
          .add(transaction.amount)
          .toString();
      }

      if (transaction.type == TransactionType.SELF_DEDUCT) {
        summary.totalSelfDeductTransactions++;
      }
    }

    for (const account of accounts) {
      if (account.accountType == AccountType.BANK) {
        summary.totalBankBalance = new Decimal(summary.totalBankBalance)
          .add(account.balance)
          .toString();
      }
      if (account.accountType == AccountType.INVESTMENT) {
        summary.totalInvestments = new Decimal(summary.totalInvestments)
          .add(account.balance)
          .toString();
      }

      if (account.accountType == AccountType.OTHER) {
        summary.totalOtherBalance = new Decimal(summary.totalOtherBalance)
          .add(account.balance)
          .toString();
      }

      if (account.accountType == AccountType.CASH) {
        summary.totalCashBalance = new Decimal(summary.totalCashBalance)
          .add(account.balance)
          .toString();
      }

      summary.totalBalance = new Decimal(summary.totalBalance)
        .add(account.balance)
        .toString();
    }
    summary.accounts = accounts;
    summary.transactions = transactions.slice(0, 5);

    // summary.totalDebit = transactions
    //   .filter((transaction) => transaction.type == TransactionType.DEBIT)
    //   .reduce((acc, transaction) => {
    //     return Decimal.add(acc, transaction.amount);
    //   }, new Decimal(0))
    //   .toString();
    // summary.totalIncome = transactions
    //   .filter((transaction) => transaction.type == TransactionType.CREDIT)
    //   .reduce((acc, transaction) => {
    //     return Decimal.add(acc, transaction.amount);
    //   }, new Decimal(0))
    //   .toString();

    return summary;
  }
}
