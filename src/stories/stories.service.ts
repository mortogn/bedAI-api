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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PromptPublishedEvent } from './events/prompt-published.event';
import { UpdatePromptDto } from './dto/update-prompt.dto';

@Injectable()
export class StoriesService {
  constructor(
    @InjectRepository(Prompt)
    private promptRepository: Repository<Prompt>,

    @InjectRepository(Character)
    private characterRepository: Repository<Character>,

    private eventEmitter: EventEmitter2,
  ) {}

  async createPrompt(creatorId: string, createPromptDto: CreatePromptDto) {
    const prompt = await this.promptRepository
      .createQueryBuilder()
      .insert()
      .values([
        {
          beginning: createPromptDto.beginning,
          ending: createPromptDto.ending,
          plot: createPromptDto.plot,
          status: createPromptDto.status,
          creatorId,
        },
      ])
      .returning('id')
      .execute();

    return { id: prompt.raw[0].id };
  }

  async updatePrompt(id: string, updatePromptDto: UpdatePromptDto) {
    try {
    } catch (err) {}
  }

  async getPrompt(creatorId: string, promptId: string) {
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

    const promptPublishEvent = new PromptPublishedEvent();
    promptPublishEvent.id = promptId;

    this.eventEmitter.emit('prompt.published', promptPublishEvent);

    return prompt;
  }

  async getPrompts(creatorId: string, take = 20, skip = 0) {
    const prompts = await this.promptRepository
      .createQueryBuilder('prompt')
      .select(['prompt.id', 'prompt.plot', 'character.id', 'character.name'])
      .leftJoinAndSelect('prompt.characters', 'character')
      .where('prompt.creatorId = :creatorId', { creatorId })
      .skip(skip)
      .take(take)
      .getMany();

    return prompts;
  }

  async createCharacter(
    creatorId: string,
    createCharacterDto: CreateCharacterDto,
  ) {
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
  }
}
