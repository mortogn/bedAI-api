import { IsEmail, Length } from 'class-validator';

export class SignUpDto {
  @IsEmail(undefined, { message: 'Please enter a valid email address' })
  email: string;

  @Length(6, 30, {
    message:
      'Please enter a password of at least 6 characters and at most 30 characters',
  })
  password: string;

  @Length(3, 20, {
    message:
      'Please enter a first name of at least 3 characters and at most 20 characters',
  })
  firstname: string;

  @Length(3, 20, {
    message:
      'Please enter a last name of at least 3 characters and at most 20 characters',
  })
  lastname: string;

  @Length(3, 20, {
    message:
      'Please enter a username of at least 3 characters and at most 20 characters',
  })
  username: string;
}
