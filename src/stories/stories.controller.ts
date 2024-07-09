import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { StoriesService } from './stories.service';
import { User } from '@/auth/user';
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
    @Query('take') take = 20,
    @Query('skip') skip = 0,
  ) {
    return this.storiesService.getStoriesByUserId(
      take,
      skip,
      userId,
      currentUserId,
    );
  }
}
