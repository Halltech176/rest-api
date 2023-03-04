const nodemailer = require("nodemailer");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.from = "olayemiayomide642@gmail.com";
    this.url = url;
  }
  newTransport() {
    return nodemailer.createTransport({
      // service: "SendGrid",
      host: "smtpout.secureserver.net",
      port: 465,
      auth: {
        // user: process.env.EMAIL_USER,
        user: "apikey",
        // pass: process.env.EMAIL_PASSWORD,
        pass: "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",
        // pass: "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",
      },
      secure: true,
    });
  }
  async send(template, subject) {
    const mailOptions = {
      to: this.to,
      from: this.from,
      subject: template,
      text: subject,
    };

    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send("welcome", "Welcome to this awesome website");
  }
  async resetPassword(message) {
    await this.send("passowrd reset", message);
  }
};
