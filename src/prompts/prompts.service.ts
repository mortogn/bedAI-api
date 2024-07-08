import {
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Prompt, PromptStatus } from './entities/prompt.entity';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PromptPublishedEvent } from './events/prompt-published.event';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';

@Injectable()
export class PromptsService {
  private readonly logger = new Logger();

  constructor(
    @InjectRepository(Prompt)
    private promptRepository: Repository<Prompt>,

    private eventEmitter: EventEmitter2,
  ) {}

  private emitPromptPublishEvent(promptId: string) {
    const promptPublishEvent = new PromptPublishedEvent();
    promptPublishEvent.promptId = promptId;
    this.eventEmitter.emit('prompt.published', promptPublishEvent);
  }

  async findAll(
    creatorId: string,
    take: number,
    skip: number,
    sort: 'recent' | 'old',
  ) {
    try {
      const prompts = this.promptRepository
        .createQueryBuilder('prompt')
        .select()
        .where('prompt.creatorId = :creatorId', { creatorId })
        .take(take)
        .skip(skip);

      if (sort) {
        switch (sort) {
          case 'recent':
            prompts.orderBy('prompt.createdAt', 'DESC');
            break;
          case 'old':
            prompts.orderBy('prompt.createdAt', 'ASC');
            break;

          default:
            break;
        }
      }

      return await prompts.getMany();

      return prompts;
    } catch (err) {
      this.logger.error(err);
      return err;
    }
  }

  async findById(promptId: string, creatorId: string) {
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
      this.logger.error(err);
      throw err;
    }
  }

  async create(creatorId: string, createPromptDto: CreatePromptDto) {
    try {
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
        .returning(['id'])
        .execute();

      if (createPromptDto.status === PromptStatus.READY) {
        this.emitPromptPublishEvent(prompt.raw[0].id);
      }

      return { id: prompt.raw[0].id };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async update(
    promptId: string,
    creatorId: string,
    updatePromptDto: UpdatePromptDto,
  ) {
    try {
      const isPromptUpdatable = await this.promptRepository
        .createQueryBuilder()
        .select()
        .where('creatorId = :creatorId', { creatorId })
        .andWhere('id = :promptId', { promptId })
        .andWhere('status = :status', { status: PromptStatus.DRAFT })
        .getExists();

      if (!isPromptUpdatable) {
        throw new ForbiddenException();
      }

      await this.promptRepository
        .createQueryBuilder()
        .update()
        .set({
          beginning: updatePromptDto.beginning,
          ending: updatePromptDto.ending,
          plot: updatePromptDto.plot,
          status: updatePromptDto.status,
        })
        .execute();

      if (updatePromptDto.status === PromptStatus.READY) {
        this.emitPromptPublishEvent(promptId);
      }

      return { id: promptId };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
