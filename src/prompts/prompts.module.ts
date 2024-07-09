import { Module } from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { PromptsController } from './prompts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prompt } from './entities/prompt.entity';
import { PromptPublishListener } from './listeners/prompt-published.listener';
import { StoriesModule } from '@/stories/stories.module';
import { OpenaiModule } from '@/openai/openai.module';

@Module({
  imports: [TypeOrmModule.forFeature([Prompt]), StoriesModule, OpenaiModule],
  controllers: [PromptsController],
  providers: [PromptsService, PromptPublishListener],
  exports: [TypeOrmModule],
})
export class PromptsModule {}
