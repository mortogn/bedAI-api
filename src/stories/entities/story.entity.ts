import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Prompt } from './prompt.entity';

export enum StoryStatus {
  PROCESSING = 'processing',
  DONE = 'done',
  ERROR = 'error',
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

  @Column({ type: 'enum', enum: StoryStatus })
  status: StoryStatus;

  @Column({ select: false })
  promptId: string;

  @OneToOne(() => Prompt, (prompt) => prompt.story)
  @JoinColumn({ name: 'promptId' })
  prompt: Prompt;
}
