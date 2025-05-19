import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User as UserEntity } from './user.entity';
import { Account } from '../account/account.entity';
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, Account])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
