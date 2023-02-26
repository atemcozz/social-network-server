const nodemailer = require("nodemailer");
class MailService {
  transporter = nodemailer.createTransport({
    port: process.env.SMTP_PORT,
    host: process.env.SMTP_HOST,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  async sendPasswordRecoveryMail(to, newPassword) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "[Falco] Восстановление пароля",
      text: "",
      html: /*html */ `
       <div style="background: #303030; color: white; padding: 16px;">
          <h1 style="margin: 0; padding: 0; color: white">Ваш новый пароль для доступа на сайт:</h1>
          <div style="padding: 8px; margin: 12px 0; background: #454545; font-size: 24px; color: #0ea5e9; border-radius: 0.5rem;"   ><strong>${newPassword}</strong></div>
          <div style="margin: 0; padding: 0; color: white">Вы по прежнему можете изменить ваш пароль в разделе редактирования информации об аккаунте</div>
        </div>
        `,
    });
  }
}
module.exports = new MailService();
