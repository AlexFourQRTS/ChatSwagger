import { 
  Controller, 
  Get,
  Post,
  Body,
  Patch, 
  Param, 
  Delete,
  Request ,
  UseGuards
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMe(@Request() req) {
    return req.user;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get('chats')
  @UseGuards(JwtAuthGuard)
  getUserChats(@Request() req) {
    return this.userService.getUserChats(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get('test')
  test() {
    return this.userService.test();
  }
}
