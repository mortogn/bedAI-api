import { User } from '@/users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ImageState {
  DONE = 'done',
  PROCESSING = 'processing',
  ERROR = 'error',
}

export enum ImageEntity {
  STORY = 'story',
  CHARACTER = 'character',
  USER = 'user',
}

@Entity()
@Index(['entity', 'entityId'])
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  path: string;

  @Column()
  prompt: string;

  @Column({ type: 'enum', enum: ImageState, default: ImageState.PROCESSING })
  status: ImageState;

  @Column()
  creatorId: string;

  @ManyToOne(() => User, (user) => user.images)
  creator: User;

  @Column({ type: 'enum', enum: ImageEntity })
  entity: ImageEntity;

  @Column()
  entityId: string;
}
