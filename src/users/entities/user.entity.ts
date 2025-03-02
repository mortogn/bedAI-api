import { Image } from '@/images/entities/image.entity';
import { Prompt } from '@/prompts/entities/prompt.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ unique: true })
  username: string;

  @OneToMany(() => Prompt, (prompt) => prompt.creator)
  prompts: Prompt[];

  @OneToMany(() => Image, (image) => image.creator)
  images: Image[];
}
