import FormData from "form-data";
import Mailgun from "mailgun.js";
import { verificationEmail, projectInviteEmail } from './email-template.js';

const mailgun = new Mailgun(FormData);

const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
});

const DOMAIN = process.env.MAILGUN_DOMAIN;
const FROM_EMAIL = process.env.FROM_EMAIL;

const handleEmailError = (error) => {
    const serviceError = new Error(
        error?.message || 'Failed to send email'
    );
    serviceError.statusCode = 503;
    throw serviceError;
};

export const sendVerificationEmail = async ({ to, otpCode }) => {
    if (!to || !otpCode) throw new Error("Missing required parameters");

    const message = verificationEmail({ otpCode });

    try {
        await mg.messages.create(DOMAIN, {
            from: FROM_EMAIL,
            to: [to],
            subject: 'Your Verification Email',
            html: message,
        });
    } catch (error) {
        handleEmailError(error);
    }
};

export const sendProjectInviteEmail = async ({ to, projectName, inviteLink }) => {
    if (!to || !projectName || !inviteLink) {
        throw new Error("Missing required parameters for invitation email");
    }

    const message = projectInviteEmail({
        projectName,
        inviteLink
    });

    try {
        await mg.messages.create(DOMAIN, {
            from: FROM_EMAIL,
            to: [to],
            subject: `You're Invited to Join ${projectName}!`,
            html: message,
        });
    } catch (error) {
        handleEmailError(error);
    }
};
