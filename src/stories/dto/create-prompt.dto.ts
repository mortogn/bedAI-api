import { IsEnum, Length } from 'class-validator';
import { Prompt, PromptStatus } from '../entities/prompt.entity';

export class CreatePromptDto {
  @Length(10, 400)
  plot: string;

  @Length(10, 100)
  beginning: string;

  @Length(10, 100)
  ending: string;

  @IsEnum(PromptStatus)
  status: PromptStatus;
}
