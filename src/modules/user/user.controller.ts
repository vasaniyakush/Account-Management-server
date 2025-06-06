import {
  Body,
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  CreateViewerDto,
  TokenUserPayload,
} from './dto/user.dto';
import { AuthService } from '../auth/auth.service';
import { CurrentUser } from 'src/common/decorators/request-user.decorator';
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  findAll() {
    console.log('Fetching all users');
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

  // Viewers

  @Get('viewers')
  async getViewers(@CurrentUser() user: TokenUserPayload) {
    try {
      const viewers = await this.userService.getViewers(user.userId);
      return viewers;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch viewers. ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('viewers')
  async createViewer(
    @Body() body: CreateViewerDto,
    @CurrentUser() user: TokenUserPayload,
  ) {
    try {
      // Check if the user is trying to create a viewer for themselves
      // if (user.email == body.viewerEmailId) {
      //   throw new HttpException(
      //     'You cannot create a viewer for yourself',
      //     HttpStatus.BAD_REQUEST,
      //   );
      // }

      // Check if viewer Used exists
      const viewerUser = await this.userService.findOne(body.viewerEmailId);
      if (!viewerUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      //Create viewer
      const viewer = await this.userService.createViewer(
        viewerUser.id,
        user.userId,
      );
      return viewer;
    } catch (error) {
      throw new HttpException(
        'Failed to create viewer. ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('viewers/:viewerId')
  async deleteViewer(
    @Param('viewerId') viewerId: string,
    @CurrentUser() user: TokenUserPayload,
  ) {
    try {
      const viewer = await this.userService.deleteViewer(viewerId, user.userId);
      return viewer;
    } catch (error) {
      throw new HttpException(
        'Failed to delete viewer. ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('viewees')
  async getViewees(@CurrentUser() user: TokenUserPayload) {
    try {
      const viewees = await this.userService.getViewees(user.userId);
      return viewees;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch viewees. ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //TODO: Create request system to request access for a viewee's profile.
  // @Post('viewees')

  @Delete('viewees/:vieweeId')
  async deleteViewee(
    @Param('vieweeId') vieweeId: string,
    @CurrentUser() user: TokenUserPayload,
  ) {
    try {
      const viewee = await this.userService.deleteViewer(user.userId, vieweeId);
      return viewee;
    } catch (error) {
      throw new HttpException(
        'Failed to delete viewee. ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
