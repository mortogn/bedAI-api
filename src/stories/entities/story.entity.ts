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

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  content: string;

  @Column({ nullable: true })
  plot: string;

  @Column({ type: 'enum', enum: StoryState, default: StoryState.PROCESSING })
  state: StoryState;

  @Column({
    type: 'enum',
    enum: StoryVisibility,
    default: StoryVisibility.PRIVATE,
  })
  visibility: StoryVisibility;

  @Column({ select: false })
  promptId: string;

  @OneToOne(() => Prompt, (prompt) => prompt.story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'promptId' })
  prompt: Prompt;
}
