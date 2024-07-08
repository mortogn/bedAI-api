import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { User } from '@/auth/decorators/user.decorator';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';

@Controller('prompts')
export class PromptsController {
  constructor(private promptsService: PromptsService) {}

  @Get()
  findAll(
    @User('id') userId: string,
    @Query('take') take = 20,
    @Query('skip') skip = 0,
    @Query('sort') sort: 'recent' | 'old' = 'recent',
  ) {
    return this.promptsService.findAll(userId, take, skip, sort);
  }

  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe) promptId: string,
    @User('id') userId: string,
  ) {
    return this.promptsService.findById(promptId, userId);
  }

  @Post()
  create(@User('id') userId: string, @Body() createPromptDto: CreatePromptDto) {
    return this.promptsService.create(userId, createPromptDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) promptId: string,
    @User('id') userId: string,
    @Body() updatePromptDto: UpdatePromptDto,
  ) {
    return this.promptsService.update(promptId, userId, updatePromptDto);
  }
}
