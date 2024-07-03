import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image, ImageEntity } from './entities/image.entity';
import { DataSource, Repository } from 'typeorm';
import { GenerateDto } from './dto/generate.dto';
import { User } from '@/users/entities/user.entity';
import { Character } from '@/stories/entities/character.entity';
import { Story } from '@/stories/entities/story.entity';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Character)
    private characterRepository: Repository<Character>,

    private datasource: DataSource,
  ) {}

  async generate(creatorId: string, generateDto: GenerateDto) {
    let canGenerate = false;

    switch (generateDto.entity) {
      case ImageEntity.USER:
        canGenerate = creatorId === generateDto.entityId;
        break;

      case ImageEntity.CHARACTER:
        const character = await this.characterRepository
          .createQueryBuilder('c')
          .select()
          .leftJoin('c.prompt', 'prompt')
          .where('prompt.creatorId = :creatorId', { creatorId })
          .andWhere('c.id = :cId', { cId: generateDto.entityId })
          .limit(1)
          .getCount();

        canGenerate = character > 0;
        break;

      // case ImageEntity.STORY:
      default:
        canGenerate = false;
        break;
    }

    if (!canGenerate) {
      throw new ForbiddenException();
    }

    try {
      const image = await this.imageRepository
        .createQueryBuilder()
        .insert()
        .values([
          {
            creatorId,
            entity: generateDto.entity,
            entityId: generateDto.entityId,
            prompt: generateDto.prompt,
          },
        ])
        .returning(['id'])
        .execute();

      return { id: image.raw[0].id };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      this.logger.error(err);

      throw new InternalServerErrorException();
    }
  }

  async byId(id: string) {
    try {
      const image = await this.imageRepository
        .createQueryBuilder('image')
        .select()
        .where('image.id = :id', { id })
        .getOne();

      if (!image) {
        throw new NotFoundException();
      }

      return image;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }
}
