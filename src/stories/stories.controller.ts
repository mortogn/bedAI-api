import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { User } from '@/auth/user';
import { PromptStatus } from './entities/prompt.entity';
import { CreateCharacterDto } from './dto/create-character.dto';

@Controller('stories')
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  @Post('prompts')
  createPrompt(
    @Body() createPromptDto: CreatePromptDto,
    @User('id') id: string,
  ) {
    return this.storiesService.createPrompt(
      id,
      PromptStatus.DRAFT,
      createPromptDto,
    );
  }
  //   @Get("prompts")
  //   getPrompts() {

  //   }

  @Get('prompts/:id')
  getPrompt(@Param('id') id: string, @User('id') userId: string) {
    return this.storiesService.getPrompt(userId, id);
  }

  @Post('prompts/characters')
  createCharacter(
    @Body() createCharacterDto: CreateCharacterDto,
    @User('id') id: string,
  ) {
    return this.storiesService.createCharacter(id, createCharacterDto);
  }
}
