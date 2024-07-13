import { Module } from '@nestjs/common';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Story } from './entities/story.entity';

import { OpenaiModule } from '@/openai/openai.module';

@Module({
  imports: [TypeOrmModule.forFeature([Story]), OpenaiModule],
  controllers: [StoriesController],
  providers: [StoriesService],
  exports: [TypeOrmModule, StoriesService],
})
export class StoriesModule {}
