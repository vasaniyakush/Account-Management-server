import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CurrentUser } from 'src/common/decorators/request-user.decorator';
import { TokenUserPayload } from '../user/dto/user.dto';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';

@Controller()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('accounts')
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

  @Post('accounts')
  async createAccount(
    @CurrentUser() user: TokenUserPayload,
    @Body() body: CreateAccountDto,
  ) {
    try {
      return await this.accountService.createAccount(user, body);
    } catch (error) {
      throw new HttpException(
        'Failed to create account. ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('accounts/:accountId')
  async updateAccount(
    @CurrentUser() user: TokenUserPayload,
    @Body() body: UpdateAccountDto,
    @Param('accountId') accountId: string,
  ) {
    try {
      return await this.accountService.updateAccount(user, accountId, body);
    } catch (error) {
      throw new HttpException(
        'Failed to update account. ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('accounts/:accountId')
  async deleteAccount(
    @CurrentUser() user: TokenUserPayload,
    @Param('accountId') accountId: string,
  ) {
    try {
      return await this.accountService.deleteAccount(accountId, user);
    } catch (error) {
      throw new HttpException(
        'Failed to delete account. ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
