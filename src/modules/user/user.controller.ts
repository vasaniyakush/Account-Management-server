import {
  Body,
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.dto';
import { AuthService } from '../auth/auth.service';
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }
  @Post()
  async create(@Body() user: CreateUserDto) {
    return await this.userService.create(user);
  }

  @Post('auth/google')
  async googleAuth(@Query('idToken') idToken: string) {
    try {
      const [user, created, isVerified] =
        await this.userService.googleAuth(idToken);

      return {
        data: user,
        created,
        isVerified,
        token: this.authService.login(user),
      };
    } catch (error) {
      throw new HttpException(
        'Failed to authenticate with Google. ' + error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //TODO: DELETE THIS LATER
  @Get('/auth/token')
  async getToken(@Query('email') email: string) {
    const user = await this.userService.findOne(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const token = this.authService.login(user);
    return { user, token };
  }
}
