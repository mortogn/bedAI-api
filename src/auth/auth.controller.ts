import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { Public } from './decorators/public.decorator';
import { RefreshAuthTokensDto } from './dto/refresh-auth-tokens.dto';
import { JwtPayload, User } from './decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Public()
  @Post('/signin')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Public()
  @Post('token/refresh')
  refreshAuthTokens(@Body() refreshAuthTokensDto: RefreshAuthTokensDto) {
    return this.authService.refreshAuthTokens(
      refreshAuthTokensDto.refreshToken,
    );
  }

  @Get('session')
  session(@User() user: JwtPayload) {
    delete user.id;
    return user;
  }
}
