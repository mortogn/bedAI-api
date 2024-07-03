import { IsEnum, IsUUID, Length } from 'class-validator';
import { ImageEntity } from '../entities/image.entity';

export class GenerateDto {
  @Length(10, 150)
  prompt: string;

  @IsEnum(ImageEntity)
  entity: ImageEntity;

  @IsUUID()
  entityId: string;
}
