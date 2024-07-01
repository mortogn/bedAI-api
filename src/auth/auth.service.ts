import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async signUp({ email, firstname, lastname, password, username }: SignUpDto) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      await this.userRepository
        .createQueryBuilder()
        .insert()
        .values([
          {
            email,
            firstname,
            lastname,
            username,
            password: hashedPassword,
          },
        ])
        .execute();

      //TODO: Return access and refresh token
      return true;
    } catch (err) {
      this.logger.error(err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }

  async signIn({ email, password }: SignInDto) {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .select(['user.email', 'user.password', 'user.id'])
        .where('user.email = :email', { email })
        .getOne();

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new BadRequestException('Invalid credentials');
      }

      //TODO: Return access and refresh token
      return user;
    } catch (err) {
      this.logger.error(err);

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }
}
