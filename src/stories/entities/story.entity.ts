import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Prompt } from './prompt.entity';

export enum StoryState {
  PROCESSING = 'processing',
  DONE = 'done',
  ERROR = 'error',
}

export enum StoryVisibility {
  PUBLIC = 'public',
  UNLISTED = 'unlisted',
  PRIVATE = 'private',
}

@Entity()
export class Story {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz', default: new Date() })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column()
  content: string;

  @Column({ type: 'enum', enum: StoryState })
  state: StoryState;

  @Column({ type: 'enum', enum: StoryVisibility })
  visibility: StoryVisibility;

  @Column({ select: false })
  promptId: string;

  @OneToOne(() => Prompt, (prompt) => prompt.story)
  @JoinColumn({ name: 'promptId' })
  prompt: Prompt;
}
