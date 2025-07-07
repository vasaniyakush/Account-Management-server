import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User as UserEntity } from './user.entity';
import { Account } from '../account/account.entity';
import { AuthModule } from '../auth/auth.module';
import { Viewer } from './viewer.entity';
import { Transaction } from '../transaction/transaction.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, Account, Viewer, Transaction]),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
