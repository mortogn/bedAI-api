import { Module } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CharactersController } from './characters.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from './entities/character.entity';
import { PromptsModule } from '@/prompts/prompts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Character]), PromptsModule],
  providers: [CharactersService],
  controllers: [CharactersController],
  exports: [TypeOrmModule],
})
export class CharactersModule {}
