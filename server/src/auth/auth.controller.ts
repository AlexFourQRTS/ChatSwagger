import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// import { CreateAuthDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {

  }

  @Post('register')
  register(@Body() register: RegisterDto) {
    return this.authService.register(register);
  }


  @Post('login')
  login(@Body() register: LoginDto) {
    return this.authService.login(register);
  }

  @Get('test')
  test() {
    return this.authService.test();
  }

}
