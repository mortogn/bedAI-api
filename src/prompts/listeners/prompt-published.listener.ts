import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PromptPublishedEvent } from '../events/prompt-published.event';
import { InjectRepository } from '@nestjs/typeorm';
import { Prompt } from '../entities/prompt.entity';
import { Repository } from 'typeorm';
import { Story, StoryState } from '@/stories/entities/story.entity';
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
    this.logger.log('Started processing the prompt ' + payload.promptId);

    try {
      const prompt = await this.promptById(payload.promptId);

      if (!prompt) {
        throw new Error('No prompt found for the provided id: ' + prompt.id);
      }

      const instruction = this.getInstruction(prompt);

      const storyContent = await this.openaiService.generateStory(instruction);

      await this.updateStory(
        payload.promptId,
        storyContent,
        StoryState.DONE,
        new Date(),
      );

      this.logger.log(`Generated story for the prompt ${payload.promptId}`);

      // TODO: Add a notification system notify the user that the generation is done.
    } catch (err) {
      this.logger.error(err);
      await this.updateStory(payload.promptId, undefined, StoryState.ERROR);
    }
  }

  promptById(promptId: string) {
    return this.promptRespository
      .createQueryBuilder('prompt')
      .select()
      .innerJoinAndSelect('prompt.characters', 'characters')
      .where('prompt.id = :promptId', { promptId })
      .getOne();
  }

  getInstruction(prompt: Prompt) {
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

    return instruction;
  }

  updateStory(
    promptId: string,
    content?: string,
    state?: StoryState,
    completedAt?: Date,
  ) {
    return this.storyRepository
      .createQueryBuilder()
      .update()
      .set({
        content,
        state,
        completedAt,
      })
      .where('promptId = :promptId', { promptId })
      .execute();
  }
}
