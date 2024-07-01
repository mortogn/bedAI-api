import { IsEmail, Length } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @Length(6, 30)
  password: string;

  @Length(3, 20)
  firstname: string;

  @Length(3, 20)
  lastname: string;

  @Length(3, 20)
  username: string;
}
