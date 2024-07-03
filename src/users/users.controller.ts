import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@/auth/user';

@Controller('users')
export class UsersController {
  constructor(private usersServices: UsersService) {}

  @Get('@me')
  me(@User('id') id: string) {
    return this.usersServices.byId(id);
  }
}
