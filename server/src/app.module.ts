import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { MessageModule } from './message/message.module';


@Module({
  imports: [
    ConfigModule,
    AuthModule, 
    PrismaModule, UserModule, MessageModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppModule]
})
export class AppModule { }
