import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Character } from './character.entity';

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

  @OneToMany(() => Character, (character) => character.prompt)
  characters: Character[];
}
