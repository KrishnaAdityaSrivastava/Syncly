import nodemailer from "nodemailer";

import {
  EMAIL_FROM,
  EMAIL_PASSWORD,
  EMAIL_USER,
  SMTP_CONNECTION_TIMEOUT,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_SERVICE,
} from "./env.js";

export const accountEmail = EMAIL_FROM;

const transportConfig = {
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
  connectionTimeout: SMTP_CONNECTION_TIMEOUT,
  greetingTimeout: SMTP_CONNECTION_TIMEOUT,
  socketTimeout: SMTP_CONNECTION_TIMEOUT,
};

if (SMTP_SERVICE) {
  transportConfig.service = SMTP_SERVICE;
} else {
  transportConfig.host = SMTP_HOST;
  transportConfig.port = SMTP_PORT;
  transportConfig.secure = SMTP_SECURE;
}

const transporter = nodemailer.createTransport(transportConfig);

export default transporter;
