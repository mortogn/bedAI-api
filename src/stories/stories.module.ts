import { Module } from '@nestjs/common';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prompt } from './entities/prompt.entity';
import { Character } from './entities/character.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prompt, Character])],
  controllers: [StoriesController],
  providers: [StoriesService],
})
export class StoriesModule {}
