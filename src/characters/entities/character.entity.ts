import {
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Prompt } from '@/prompts/entities/prompt.entity';

export enum CharacterPriority {
  MAIN = 'main',
  SIDE = 'side',
  BACKGROUND = 'background',
}

@Entity()
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: CharacterPriority,
  })
  priority: CharacterPriority;

  @Column({ select: false })
  promptId: string;

  @ManyToOne(() => Prompt, (prompt) => prompt.characters)
  @JoinTable({ name: 'promptId' })
  prompt: Prompt;
}
