import { Length } from 'class-validator';

export class CreatePromptDto {
  @Length(10, 400)
  plot: string;

  @Length(10, 100)
  beginning: string;

  @Length(10, 100)
  ending: string;
}
