import { IsEmail, IsUUID } from 'class-validator';

export class CreateUserDto {
  firstName: string;

  lastName: string;

  email: string;

  phone?: string;

  profilePicture?: string;
}

export class TokenUserPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export class CreateViewerDto {
  @IsEmail()
  viewerEmailId: string;
}
