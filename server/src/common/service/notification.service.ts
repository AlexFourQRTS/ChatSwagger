import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NotificationService {
  constructor(private eventEmitter: EventEmitter2) {}

  notifyNewUser(user: any) {
    this.eventEmitter.emit('user.registered', user);
  }

  notifyUserLogin(user: any) {
    this.eventEmitter.emit('user.login', user);
  }
} 