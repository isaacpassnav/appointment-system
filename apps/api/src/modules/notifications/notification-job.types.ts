import {
  NOTIFICATION_JOB_APPOINTMENT_CONFIRMATION_EMAIL,
  NOTIFICATION_JOB_APPOINTMENT_REMINDER_EMAIL,
  NOTIFICATION_JOB_VERIFY_EMAIL,
  NOTIFICATION_JOB_WELCOME_EMAIL,
} from './notifications.constants';

export type WelcomeEmailJobData = {
  type: typeof NOTIFICATION_JOB_WELCOME_EMAIL;
  to: string;
  fullName: string;
};

export type VerifyEmailJobData = {
  type: typeof NOTIFICATION_JOB_VERIFY_EMAIL;
  to: string;
  fullName: string;
  verifyUrl: string;
};

export type AppointmentConfirmationEmailJobData = {
  type: typeof NOTIFICATION_JOB_APPOINTMENT_CONFIRMATION_EMAIL;
  to: string;
  fullName: string;
  startsAtIso: string;
};

export type AppointmentReminderEmailJobData = {
  type: typeof NOTIFICATION_JOB_APPOINTMENT_REMINDER_EMAIL;
  to: string;
  fullName: string;
  startsAtIso: string;
  reminderOffsetHours: 24 | 1;
};

export type NotificationJobData =
  | WelcomeEmailJobData
  | VerifyEmailJobData
  | AppointmentConfirmationEmailJobData
  | AppointmentReminderEmailJobData;
