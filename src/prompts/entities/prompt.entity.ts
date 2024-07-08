import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Character } from '@/characters/entities/character.entity';
import { User } from '@/users/entities/user.entity';
import { Story } from '@/stories/entities/story.entity';

export enum PromptStatus {
  READY = 'ready',
  DRAFT = 'draft',
}

@Entity()
export class Prompt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz', default: new Date() })
  createdAt: Date;

  @Column()
  plot: string;

  @Column()
  beginning: string;

  @Column()
  ending: string;

  @Column({ type: 'enum', enum: PromptStatus })
  status: PromptStatus;

  @OneToMany(() => Character, (character) => character.prompt, {
    onDelete: 'CASCADE',
  })
  characters: Character[];

  @Column({ select: false })
  creatorId: string;

  @ManyToOne(() => User, (user) => user.prompts, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @OneToOne(() => Story, (story) => story.prompt, { onDelete: 'RESTRICT' })
  story: Story;
}
