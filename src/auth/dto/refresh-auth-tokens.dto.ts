import { IsJWT, IsString } from 'class-validator';

export class RefreshAuthTokensDto {
  @IsJWT()
  refreshToken: string;
}
