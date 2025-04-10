import { MailerService } from '@nestjs-modules/mailer';
import { Process } from '@nestjs/bull';

export class AuthProcessor {
  constructor(private readonly mail: MailerService) {}
  @Process('verifyEmailAddress')
  async sendVerificationMail(job: any) {
    const { data } = job;
    try {
      await this.mail.sendMail({
        ...data,
        subject: 'Verify Your Email',
        template: 'verify-email',
        context: {
          otp: data.otp,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
}
