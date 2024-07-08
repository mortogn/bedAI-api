import { IsEnum, IsOptional, Length } from 'class-validator';
import { StoryVisibility } from '../entities/story.entity';

export class UpdateStoryDto {
  @IsOptional()
  @Length(10, 120)
  title?: string;

  @IsOptional()
  @Length(10, 250)
  plot?: string;

  @IsOptional()
  @IsEnum(StoryVisibility)
  visibility?: StoryVisibility;
}
