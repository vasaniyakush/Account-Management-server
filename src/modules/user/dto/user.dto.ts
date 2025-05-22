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
