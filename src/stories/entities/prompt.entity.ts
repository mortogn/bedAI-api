import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Character } from './character.entity';
import { User } from '@/users/entities/user.entity';

export enum PromptStatus {
  READY = 'ready',
  DRAFT = 'draft',
}

@Entity()
export class Prompt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  plot: string;

  @Column()
  beginning: string;

  @Column()
  ending: string;

  @Column({ type: 'enum', enum: PromptStatus })
  status: PromptStatus;

  @OneToMany(() => Character, (character) => character.prompt)
  characters: Character[];

  @Column({ select: false })
  creatorId: string;

  @ManyToOne(() => User, (user) => user.prompts)
  @JoinColumn({ name: 'creatorId' })
  creator: User;
}
