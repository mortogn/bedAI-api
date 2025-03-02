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
import { Character } from '@/characters/entities/character.entity';

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
  }

  async byId(id: string) {
    const image = await this.imageRepository
      .createQueryBuilder('image')
      .select()
      .where('image.id = :id', { id })
      .getOne();

    if (!image) {
      throw new NotFoundException();
    }

    return image;
  }
}
