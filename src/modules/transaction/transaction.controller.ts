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
  Query,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { create } from 'domain';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { TokenUserPayload } from '../user/dto/user.dto';
import { CurrentUser } from 'src/common/decorators/request-user.decorator';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async findAllTransactionsOfUser(@CurrentUser() user: TokenUserPayload) {
    try {
      return await this.transactionService.findAll(user);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Failed to fetch transactions. ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async createTransaction(
    @Body() body: CreateTransactionDto,
    @CurrentUser() user: TokenUserPayload,
  ) {
    try {
      return await this.transactionService.createTransaction(body, user);
    } catch (error) {
      throw new HttpException(
        'Failed to create transaction. ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':transactionId')
  async deleteTransaction(
    @CurrentUser() user: TokenUserPayload,
    @Param('transactionId') transactionId: string,
    @Query('revert_acconunt') revertAccount: boolean = false,
  ) {
    try {
      return await this.transactionService.deleteTransaction(
        transactionId,
        user,
        revertAccount,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to delete transaction. ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // @Put(':transactionId')
  // async updateTransaction(
  //   @Body() body: UpdateTransactionDto,
  //   @CurrentUser() user: TokenUserPayload,
  //   @Param('transactionId') transactionId: string,
  // ) {
  // }
}
