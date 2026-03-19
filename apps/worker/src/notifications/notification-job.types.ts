import {
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

export type NotificationJobData = WelcomeEmailJobData | VerifyEmailJobData;
