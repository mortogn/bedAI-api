import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { GenerateDto } from './dto/generate.dto';
import { User } from '@/auth/decorators/user.decorator';

@Controller('images')
export class ImagesController {
  constructor(private imagesService: ImagesService) {}

  @Post('generate')
  generate(@Body() generateDto: GenerateDto, @User('id') id: string) {
    return this.imagesService.generate(id, generateDto);
  }

  @Get(':id')
  byId(@Param('id', ParseUUIDPipe) id: string) {
    return this.imagesService.byId(id);
  }
}
