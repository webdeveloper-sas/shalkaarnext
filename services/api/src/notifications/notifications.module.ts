import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

/**
 * Notifications Module
 * Handles email and notification services
 */
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
