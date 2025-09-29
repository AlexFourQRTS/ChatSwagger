import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationService } from './service/notification.service';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class CommonModule {}
