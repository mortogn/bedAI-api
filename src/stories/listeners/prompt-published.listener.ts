import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PromptPublishedEvent } from '../events/prompt-published.event';

@Injectable()
export class PromptPublishListener {
  @OnEvent('prompt.published')
  async handlePromptPublishEvent(payload: PromptPublishedEvent) {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    console.log('running from events', payload.id);
  }
}
