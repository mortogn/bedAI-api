import {
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Story } from './story.entity';
import { Prompt } from './prompt.entity';

export enum CharacterPriority {
  MAIN,
  SIDE,
  BACKGROUND,
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

  @Column()
  promptId: string;

  @ManyToOne(() => Prompt, (prompt) => prompt.characters)
  @JoinTable({ name: 'promptId' })
  prompt: Prompt;
}
