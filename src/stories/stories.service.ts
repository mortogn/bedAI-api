import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Story, StoryState, StoryVisibility } from './entities/story.entity';
import { UpdateStoryDto } from './dto/update-story.dto';

@Injectable()
export class StoriesService {
  private readonly logger = new Logger(StoriesService.name);

  constructor(
    @InjectRepository(Story)
    private storyRespository: Repository<Story>,
  ) {}

  async getStoriesByUserId(
    take: number,
    skip: number,
    creatorId: string,
    currentUserId?: string | undefined,
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
      const story = await this.storyRespository
        .createQueryBuilder('story')
        .select([
          'story.id',
          'story.title',
          'story.content',
          'story.visibility',
          'story.completedAt',
          'story.plot',
          'story.state',
        ])
        .leftJoinAndSelect('story.prompt', 'prompt')
        .leftJoinAndSelect('prompt.creator', 'creator')
        .where('story.id = :storyId', { storyId })
        .andWhere(
          new Brackets((qb) => {
            qb.where('story.visibility = :public', {
              public: StoryVisibility.PUBLIC,
            }).orWhere('story.visibility = :unlisted', {
              unlisted: StoryVisibility.UNLISTED,
            });
          }),
        )
        .getOne();

      if (
        ((!story || story.state !== StoryState.DONE) && !currentUserId) ||
        (currentUserId && story.prompt.creatorId === currentUserId)
      ) {
        throw new NotFoundException();
      }

      const processedStory = { ...story, creator: story.prompt.creator };

      // Email should not be returned to the public users
      delete processedStory.creator.email;

      // Do not include unwanted informations to public users.
      delete processedStory.prompt;

      return processedStory;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async getStories(sort: 'popular' | 'recent', take: number, skip: number) {
    try {
      const stories = this.storyRespository
        .createQueryBuilder('story')
        .select([
          'story.id',
          'story.completedAt',
          'story.plot',
          'story.visibility',
          'story.title',
        ])
        .where('story.visibility = :visibility', {
          visibility: StoryVisibility.PUBLIC,
        })
        .andWhere('story.title IS NOT NULL')
        .andWhere('story.state = :state', { state: StoryState.DONE });

      if (sort === 'recent') {
        stories.orderBy('story.completedAt');
      }

      return await stories.take(take).skip(skip).getMany();
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async updateStory(
    storyId: string,
    userId: string,
    updateStoryDto: UpdateStoryDto,
  ) {
    try {
      const isStoryEditable = await this.storyRespository
        .createQueryBuilder('story')
        .select()
        .leftJoin('story.prompt', 'prompt')
        .where('story.id = :storyId', { storyId })
        .andWhere('prompt.creatorId = :creatorId', { creatorId: userId })
        .getExists();

      if (!isStoryEditable) {
        throw new ForbiddenException('Story can not be updated.');
      }

      await this.storyRespository
        .createQueryBuilder()
        .update()
        .set({
          title: updateStoryDto.title,
          plot: updateStoryDto.plot,
          visibility: updateStoryDto.visibility,
        })
        .where('id = :storyId', { storyId })
        .execute();
      return { id: storyId };
    } catch (err) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
      this.logger.error(err);
      throw err;
    }
  }
}
