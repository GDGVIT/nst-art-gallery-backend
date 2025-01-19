const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: process.env.SMTP_SERVER,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});
async function mailSender(to, subject, content) {
  transporter.sendMail({
    from: "Art Gallery",
    to: to,
    subject: subject,
    html: content,
  });
}

module.exports = mailSender;
