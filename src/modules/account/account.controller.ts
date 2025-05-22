import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CurrentUser } from 'src/common/decorators/request-user.decorator';
import { TokenUserPayload } from '../user/dto/user.dto';
import { CreateAccountDto } from './dto/account.dto';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  async findAllAccountsOfUser(@CurrentUser() user: TokenUserPayload) {
    // return user;
    try {
      return await this.accountService.findAll(user);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Failed to fetch accounts. ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async createAccount(
    @CurrentUser() user: TokenUserPayload,
    @Body() body: CreateAccountDto,
  ) {
    try {
      return await this.accountService.createAccount(user, body);
    } catch (error) {
      throw new HttpException(
        'Failed to create account',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
