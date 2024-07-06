import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Brackets, DataSource, Repository } from 'typeorm';
import { Prompt, PromptStatus } from './entities/prompt.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Character } from './entities/character.entity';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { CreateCharacterDto } from './dto/create-character.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PromptPublishedEvent } from './events/prompt-published.event';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { Story, StoryState, StoryVisibility } from './entities/story.entity';

@Injectable()
export class StoriesService {
  private readonly logger = new Logger(StoriesService.name);

  constructor(
    @InjectRepository(Prompt)
    private promptRepository: Repository<Prompt>,

    @InjectRepository(Character)
    private characterRepository: Repository<Character>,

    @InjectRepository(Story)
    private storyRespository: Repository<Story>,

    private dataSource: DataSource,

    private eventEmitter: EventEmitter2,
  ) {}

  async createPrompt(creatorId: string, createPromptDto: CreatePromptDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const prompt = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Prompt)
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

      if (createPromptDto.status === PromptStatus.READY) {
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(Story)
          .values([
            {
              promptId: prompt.raw[0].id,
            },
          ])
          .execute();
      }

      await queryRunner.commitTransaction();

      if (createPromptDto.status === PromptStatus.READY) {
        this.eventEmitter.emit(
          'prompt.published',
          new PromptPublishedEvent(prompt.raw[0].id),
        );
      }

      return { id: prompt.raw[0].id };
    } catch (err) {
      this.logger.error(err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updatePrompt(
    id: string,
    creatorId: string,
    updatePromptDto: UpdatePromptDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //? Prompts that are on `ready` status has already been processed to generate story.
      //? User can only edit the prompts that are not published yet.
      const isPromptUpdatable = await queryRunner.manager
        .getRepository(Prompt)
        .createQueryBuilder('p')
        .select()
        .where('p.id = :id', { id })
        .andWhere('p.status = :status', { status: PromptStatus.DRAFT })
        .andWhere('p.creatorId = :creatorId', { creatorId })
        .getExists();

      if (!isPromptUpdatable) {
        throw new ForbiddenException(
          'Can not update the provided prompt either because the prompt is already published, is not created by user or does not exist.',
        );
      }

      await queryRunner.manager
        .getRepository(Prompt)
        .createQueryBuilder()
        .update()
        .set({
          beginning: updatePromptDto.beginning,
          ending: updatePromptDto.ending,
          plot: updatePromptDto.plot,
          status: updatePromptDto.status,
        })
        .where('id = :id', { id })
        .execute();

      if (updatePromptDto.status === PromptStatus.READY) {
        await queryRunner.manager
          .getRepository(Story)
          .createQueryBuilder()
          .insert()
          .values([{ promptId: id }])
          .execute();
      }

      await queryRunner.commitTransaction();

      if (updatePromptDto.status === PromptStatus.READY) {
        this.eventEmitter.emit(
          'prompt.published',
          new PromptPublishedEvent(id),
        );
      }

      return { id };
    } catch (err) {
      this.logger.error(err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
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
      this.logger.error(err);
      throw err;
    }
  }

  async getPrompts(creatorId: string, take = 20, skip = 0) {
    try {
      const prompts = await this.promptRepository
        .createQueryBuilder('prompt')
        .select([
          'prompt.id',
          'prompt.plot',
          'prompt.status',
          'character.id',
          'character.name',
        ])
        .leftJoinAndSelect('prompt.characters', 'character')
        .where('prompt.creatorId = :creatorId', { creatorId })
        .skip(skip)
        .take(take)
        .getMany();

      return prompts;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async createCharacter(
    creatorId: string,
    createCharacterDto: CreateCharacterDto,
  ) {
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
      this.logger.error(err);
      throw err;
    }
  }

  async getStoriesByUserId(
    creatorId: string,
    currentUserId?: string | undefined,
    take = 10,
    skip = 0,
  ) {
    try {
      const stories = this.storyRespository
        .createQueryBuilder('story')
        .select()
        .leftJoin('story.prompt', 'prompt')
        .where('prompt.creatorId = :creatorId', { creatorId })
        .andWhere('story.state = :state', { state: StoryState.DONE })
        .take(take)
        .skip(skip);

      if (currentUserId && creatorId === currentUserId) {
        return await stories.getMany();
      }

      return await stories
        .andWhere('story.visibility = :visibility', {
          visibility: StoryVisibility.PUBLIC,
        })
        .getMany();
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async getStoryById(storyId: string, currentUserId?: string | undefined) {
    try {
      const story = this.storyRespository
        .createQueryBuilder('story')
        .select([
          'story.id',
          'story.title',
          'story.content',
          'story.visibility',
          'story.completedAt',
          'story.plot',
        ])

        .where('story.id = :storyId', { storyId })
        .andWhere('story.state = :state', { state: StoryState.DONE });

      if (currentUserId) {
        story.leftJoin('story.prompt', 'prompt').andWhere(
          new Brackets((qb) => {
            qb.where('prompt.creatorId = :creatorId', {
              creatorId: currentUserId,
            })
              .orWhere('story.visibility = :visibility', {
                visibility: StoryVisibility.PUBLIC,
              })
              .orWhere('story.visibility = :visibility', {
                visibility: StoryVisibility.UNLISTED,
              });
          }),
        );
      } else {
        story
          .andWhere(
            new Brackets((qb) => {
              qb.where('story.visibility = :visibility', {
                visibility: StoryVisibility.PUBLIC,
              }).orWhere('story.visibility = :visibility', {
                visibility: StoryVisibility.UNLISTED,
              });
            }),
          )
          .andWhere('story.title is not null');
      }

      const dbStory = await story.getOne();

      if (!dbStory) {
        throw new NotFoundException();
      }

      return dbStory;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
