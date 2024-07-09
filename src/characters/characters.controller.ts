import { Body, Controller, Post } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { User } from '@/auth/decorators/user.decorator';
import { CreateCharacterDto } from './dto/create-character.dto';

@Controller('characters')
export class CharactersController {
  constructor(private charactersService: CharactersService) {}

  @Post()
  create(
    @User('id') userId: string,
    @Body() createCharacterDto: CreateCharacterDto,
  ) {
    return this.charactersService.create(userId, createCharacterDto);
  }
}
