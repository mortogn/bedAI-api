import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateAccessToken(userId: string) {
    const payload = {
      sub: userId,
    };

    //TODO: EXPIRE TIME SHOULD BE LOWERED AFTER TESTING IS DONE
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: '4h',
    });
  }
  async generateRefreshToken(userId: string) {
    const payload = {
      sub: userId,
    };

    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: '15d',
    });
  }

  async veriftyAccessJWT(token: string) {
    return await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('jwt.secret'),
    });
  }

  async veriftyRefreshJWT(refreshToken: string) {
    return await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
    });
  }

  async signUp({ email, firstname, lastname, password, username }: SignUpDto) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.userRepository
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
        .returning('id')
        .execute();

      //TODO: Return access and refresh token
      return {
        accessToken: await this.generateAccessToken(user.raw[0].id),
        refreshToken: await this.generateRefreshToken(user.raw[0].id),
      };
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

      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new BadRequestException('Invalid credentials');
      }

      //TODO: Return access and refresh token
      return {
        accessToken: await this.generateAccessToken(user.id),
        refreshToken: await this.generateRefreshToken(user.id),
      };
    } catch (err) {
      if (!(err instanceof BadRequestException)) {
        this.logger.error(err);
      }

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }

  /*
  ? Takes refresh token as argument, if the token is valid, regenerate access and refresh token and return them.
  ? Web client will be able to pass a refresh token and get fresh two tokens as response.
  */
  async refreshAuthTokens(refreshToken: string) {
    try {
      const payload = await this.veriftyRefreshJWT(refreshToken);

      return {
        accessToken: await this.generateAccessToken(payload.sub),
        refreshToken: await this.generateRefreshToken(payload.sub),
      };
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
