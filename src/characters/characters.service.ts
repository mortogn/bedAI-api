import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Character } from './entities/character.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCharacterDto } from './dto/create-character.dto';
import { Prompt, PromptStatus } from '@/prompts/entities/prompt.entity';

@Injectable()
export class CharactersService {
  private readonly logger = new Logger(CharactersService.name);

  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,

    @InjectRepository(Prompt)
    private promptRespository: Repository<Prompt>,
  ) {}

  async create(userId: string, createCharacterDto: CreateCharacterDto) {
    try {
      const isCharacterCreatable = await this.promptRespository
        .createQueryBuilder('prompt')
        .select()
        .where('prompt.id = :promptId', {
          promptId: createCharacterDto.promptId,
        })
        .andWhere('prompt.creatorId = :userId', { userId })
        .andWhere('prompt.status = :status', { status: PromptStatus.DRAFT })
        .getExists();

      if (!isCharacterCreatable) {
        throw new ForbiddenException(
          'Can not create character for the provided prompt',
        );
      }

      const character = await this.characterRepository
        .createQueryBuilder()
        .insert()
        .values([
          {
            name: createCharacterDto.name,
            description: createCharacterDto.description,
            promptId: createCharacterDto.promptId,
            priority: createCharacterDto.priority,
          },
        ])
        .returning(['id'])
        .execute();

      return { id: character.raw[0].id };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
