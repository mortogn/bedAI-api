import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async byId(id: string) {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :id', { id })
        .getOne();

      if (!user) {
        throw new NotFoundException();
      }

      return user;
    } catch (err) {
      // Don't want to log not found exception since those are client errors
      if (!(err instanceof NotFoundException)) {
        this.logger.error(err);
      }
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException();
    }
  }
}
