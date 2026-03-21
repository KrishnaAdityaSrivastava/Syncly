import nodemailer from "nodemailer"

import { EMAIL_PASSWORD } from "./env.js"

export const accountEmail = 'krishnaadityasrivastavaed@gmail.com';
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: accountEmail,
        pass: EMAIL_PASSWORD
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
})

export default transporter;
