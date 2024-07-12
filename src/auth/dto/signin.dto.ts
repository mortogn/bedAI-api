import { IsEmail, Length } from 'class-validator';

export class SignInDto {
  @IsEmail(undefined, { message: 'Please enter a valid email address' })
  email: string;

  @Length(6, 30, { message: 'Password must be between 6 and 30 characters' })
  password: string;
}
