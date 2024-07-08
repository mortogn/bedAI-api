import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { StoriesService } from './stories.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { User } from '@/auth/user';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { Public } from '@/auth/public';
import { UpdateStoryDto } from './dto/update-story.dto';

@Controller('stories')
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  @Public()
  @Get()
  list(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
    @Query('sort') sort?: string,
  ) {
    return this.storiesService.getStories(
      sort && sort === 'recent' ? sort : 'recent',
      take ? Number.parseInt(take) : 10,
      skip ? Number.parseInt(skip) : 0,
    );
  }

  @Public()
  @Get(':id')
  byId(
    @Param('id', ParseUUIDPipe) id: string,
    @User('id') userId?: string | undefined,
  ) {
    return this.storiesService.getStoryById(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) storyId: string,
    @Body() updateStoryDto: UpdateStoryDto,
    @User('id') userId: string,
  ) {
    return this.storiesService.updateStory(storyId, userId, updateStoryDto);
  }

  @Get('user/:userId')
  byUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @User('id') currentUserId: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.storiesService.getStoriesByUserId(
      userId,
      currentUserId,
      take ? Number.parseInt(take) : 20,
      skip ? Number.parseInt(skip) : 0,
    );
  }

  // @Post('prompts')
  // createPrompt(
  //   @Body() createPromptDto: CreatePromptDto,
  //   @User('id') id: string,
  // ) {
  //   return this.storiesService.createPrompt(id, createPromptDto);
  // }

  // @Patch('prompts/:id')
  // updatePrompt(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @User('id') userId: string,
  //   @Body() updatePromptDto: UpdatePromptDto,
  // ) {
  //   return this.storiesService.updatePrompt(id, userId, updatePromptDto);
  // }

  // @Get('prompts')
  // getPrompts(
  //   @User('id') id: string,
  //   @Query('skip') skip?: string,
  //   @Query('take') take?: string,
  // ) {
  //   return this.storiesService.getPrompts(
  //     id,
  //     take ? Number.parseInt(take) : 20,
  //     skip ? Number.parseInt(skip) : 0,
  //   );
  // }

  // @Get('prompts/:id')
  // getPrompt(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @User('id') userId: string,
  // ) {
  //   return this.storiesService.getPrompt(userId, id);
  // }

  // @Post('prompts/characters')
  // createCharacter(
  //   @Body() createCharacterDto: CreateCharacterDto,
  //   @User('id') id: string,
  // ) {
  //   return this.storiesService.createCharacter(id, createCharacterDto);
  // }
}
