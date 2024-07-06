import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PromptPublishedEvent } from '../events/prompt-published.event';
import { InjectRepository } from '@nestjs/typeorm';
import { Prompt } from '../entities/prompt.entity';
import { Repository } from 'typeorm';
import { Story, StoryState } from '../entities/story.entity';
import { OpenaiService } from '@/openai/openai.service';

@Injectable()
export class PromptPublishListener {
  private readonly logger = new Logger(PromptPublishListener.name);

  constructor(
    @InjectRepository(Prompt)
    private promptRespository: Repository<Prompt>,

    @InjectRepository(Story)
    private storyRepository: Repository<Story>,

    private openaiService: OpenaiService,
  ) {}

  @OnEvent('prompt.published')
  async handlePromptPublishEvent(payload: PromptPublishedEvent) {
    this.logger.log('Started processing the prompt ' + payload.id);

    try {
      const prompt = await this.promptRespository
        .createQueryBuilder('prompt')
        .select()
        .innerJoinAndSelect('prompt.characters', 'characters')
        .where('prompt.id = :id', { id: payload.id })
        .getOne();

      if (!prompt) {
        throw new Error('No prompt found for the provided id: ' + prompt.id);
      }

      //? Convert the character data to a basic and easy to understand prompt for LLM
      let charactersString: string = '';

      //? Some prompts might not have any characters to them. In that case we let the LLM handle everything.
      if (prompt.characters) {
        prompt.characters.forEach((c, i) => {
          charactersString += `${i + 1}. ${c.name}: ${c.description}; Character priority: ${c.priority};\n`;
        });
      }

      let instruction = `PLOT: ${prompt.plot};\nBEGINNING: ${prompt.beginning};\nENDING: ${prompt.ending};`;

      if (!!charactersString) {
        instruction += `\nCHARACTERS: \n${charactersString}`;
      }

      const storyContent = await this.openaiService.generateStory(instruction);

      await this.storyRepository
        .createQueryBuilder()
        .update()
        .set({
          content: storyContent,
          state: StoryState.DONE,
          completedAt: new Date(),
        })
        .where('promptId = :promptId', { promptId: payload.id })
        .execute();

      this.logger.log(`Generated story for the prompt ${payload.id}`);

      // TODO: Add a notification system notify the user that the generation is done.
    } catch (err) {
      this.logger.error(err);
      await this.storyRepository
        .createQueryBuilder()
        .update()
        .set({ state: StoryState.ERROR })
        .where('promptId = :promptId', { promptId: payload.id })
        .execute();
    }
  }
}
