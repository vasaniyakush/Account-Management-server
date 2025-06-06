import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { Repository } from 'typeorm';
import { TokenUserPayload } from '../user/dto/user.dto';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { User } from '../user/user.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(user: TokenUserPayload): Promise<Account[]> {
    return this.accountRepository.find({
      //@ts-ignore
      where: { user: { id: user.userId } },
    });
  }

  async createAccount(
    user: TokenUserPayload,
    body: CreateAccountDto,
  ): Promise<Account> {
    const account = this.accountRepository.save({
      ...body,
      //@ts-ignore
      user: { id: user.userId },
    });
    //@ts-ignore
    return account;
  }

  async updateAccount(
    user: TokenUserPayload,
    id: string,
    updateAccountbody: UpdateAccountDto,
  ): Promise<Account> {
    const account = await this.accountRepository.findOne({
      // @ts-ignore
      where: { id, user: { id: user.userId } },
    });
    if (!account) {
      throw new HttpException('Account not found', 404);
    }
    return this.accountRepository.save({ ...account, ...updateAccountbody });
  }

  async deleteAccount(
    accountId: string,
    user: TokenUserPayload,
  ): Promise<void> {
    const account = await this.accountRepository.findOne({
      where: {
        id: accountId, //@ts-ignore
        user: { id: user.userId },
      },
    });
    if (!account) {
      throw new HttpException('Account not found', 404);
    }
    await this.accountRepository.remove(account);
  }
}
