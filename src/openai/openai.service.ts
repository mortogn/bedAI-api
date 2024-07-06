import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';

@Injectable()
export class OpenaiService {
  public openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('openai.apiKey'),
    });
  }

  async generateStory(instruction: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a story generating AI. When user prompts comes it, it may or may not contain plot hint, characters, beginning hint, ending hint. Try and generate a story based on the prompt. The format should be of a bedtime story. The story will be read by mostly 6-16 years old. Make it long and interesting and try to follow the plot.',
        },
        { role: 'user', content: instruction },
      ],
      max_tokens: 4096,
    });

    if (response.choices[0].finish_reason !== 'stop') {
      throw new Error('Failed to generate the story. Response: ' + response);
    }

    return response.choices[0].message.content;
  }
}
