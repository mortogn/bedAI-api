import { IsEnum, IsString, IsUUID, Length } from 'class-validator';
import { CharacterPriority } from '../entities/character.entity';

export class CreateCharacterDto {
  @Length(3, 30)
  name: string;

  @IsEnum(CharacterPriority)
  priority: CharacterPriority;

  @Length(10, 250)
  description: string;

  @IsUUID()
  promptId: string;
}
