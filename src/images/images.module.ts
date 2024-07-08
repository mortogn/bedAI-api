import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { UsersModule } from '@/users/users.module';
import { StoriesModule } from '@/stories/stories.module';
import { CharactersModule } from '@/characters/characters.module';

@Module({
  imports: [TypeOrmModule.forFeature([Image]), UsersModule, CharactersModule],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
