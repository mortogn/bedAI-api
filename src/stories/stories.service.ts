import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Prompt, PromptStatus } from './entities/prompt.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Character } from './entities/character.entity';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { CreateCharacterDto } from './dto/create-character.dto';

@Injectable()
export class StoriesService {
  private readonly logger = new Logger(StoriesService.name);

  constructor(
    @InjectRepository(Prompt)
    private promptRepository: Repository<Prompt>,

    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) {}

  async createPrompt(
    creatorId: string,
    status: PromptStatus,
    createPromptDto: CreatePromptDto,
  ) {
    try {
      const prompt = await this.promptRepository
        .createQueryBuilder()
        .insert()
        .values([
          {
            beginning: createPromptDto.beginning,
            ending: createPromptDto.ending,
            plot: createPromptDto.plot,
            creatorId,
            status,
          },
        ])
        .returning('id')
        .execute();

      return { id: prompt.raw[0].id };
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }

  async getPrompt(creatorId: string, promptId: string) {
    try {
      const prompt = await this.promptRepository
        .createQueryBuilder('prompt')
        .select()
        .leftJoinAndSelect('prompt.characters', 'character')
        .where('prompt.id = :promptId', { promptId })
        .andWhere('prompt.creatorId = :creatorId', { creatorId })
        .getOne();

      if (!prompt) {
        throw new NotFoundException();
      }

      return prompt;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }

  async createCharacter(
    creatorId: string,
    createCharacterDto: CreateCharacterDto,
  ) {
    console.log({ creatorId, createCharacterDto });

    try {
      //? Checking if the logged in user the one who created the provided prompt
      const prompt = await this.promptRepository
        .createQueryBuilder('prompt')
        .select()
        .where('prompt.creatorId = :creatorId', { creatorId })
        .andWhere('prompt.id = :promptId', {
          promptId: createCharacterDto.promptId,
        })
        .getCount();

      if (!prompt) {
        throw new ForbiddenException();
      }

      console.log("Successfully checked, now it's time for character created");

      const character = await this.characterRepository
        .createQueryBuilder()
        .insert()
        .values([
          {
            name: createCharacterDto.name,
            description: createCharacterDto.description,
            promptId: createCharacterDto.promptId,
            priority: createCharacterDto.priority,
          },
        ])
        .returning('id')
        .execute();

      return { id: character.raw[0].id };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      this.logger.error(err);

      throw new InternalServerErrorException();
    }
  }
}
