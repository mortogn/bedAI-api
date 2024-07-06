import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [OpenaiService, ConfigService],
  exports: [OpenaiService],
})
export class OpenaiModule {}
