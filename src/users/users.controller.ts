import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@/auth/user';
import { StoriesService } from '@/stories/stories.service';
import { UserStoriesQueryDto } from './dto/user-stories-query.dto';

@Controller('users')
export class UsersController {
  constructor(
    private usersServices: UsersService,
    private storiesService: StoriesService,
  ) {}

  @Get('@me')
  me(@User('id') currentUserId: string) {
    return this.usersServices.byId(currentUserId);
  }

  @Get('@me/stories')
  myStories(
    @Query() query: UserStoriesQueryDto,
    @User('id') currentUserId: string,
  ) {
    return this.storiesService.byUserId(
      query.take || 20,
      query.skip || 0,
      currentUserId,
      currentUserId,
    );
  }

  @Get(':id')
  byId(@Param('id', ParseUUIDPipe) userId: string) {
    return this.usersServices.byId(userId);
  }

  @Get(':id/stories')
  stories(
    @Param('id', ParseUUIDPipe) userId: string,
    @Query() query: UserStoriesQueryDto,
  ) {
    return this.storiesService.byUserId(
      query.take || 20,
      query.skip || 0,
      userId,
    );
  }
}
