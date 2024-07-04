import { Module } from '@nestjs/common';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prompt } from './entities/prompt.entity';
import { Character } from './entities/character.entity';
import { Story } from './entities/story.entity';
import { PromptPublishListener } from './listeners/prompt-published.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Prompt, Character, Story])],
  controllers: [StoriesController],
  providers: [StoriesService, PromptPublishListener],
  exports: [TypeOrmModule],
})
export class StoriesModule {}
