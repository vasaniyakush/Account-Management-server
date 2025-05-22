import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { Repository } from 'typeorm';
import { TokenUserPayload } from '../user/dto/user.dto';
import { CreateAccountDto } from './dto/account.dto';
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
}
