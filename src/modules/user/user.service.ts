import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/user.dto';
import { OAuth2Client } from 'google-auth-library';
import { Viewer } from './viewer.entity';
@Injectable()
export class UserService {
  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Viewer)
    private viewersRepository: Repository<Viewer>,
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
}
