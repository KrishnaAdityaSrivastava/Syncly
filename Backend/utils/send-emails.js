import sgMail from '@sendgrid/mail';
import { verificationEmail, projectInviteEmail } from './email-template.js';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL; // your verified email

const handleEmailError = (error) => {
    const serviceError = new Error(
        error?.response?.body?.errors?.[0]?.message || error.message || 'Failed to send email'
    );
    serviceError.statusCode = 503;
    throw serviceError;
};

export const sendVerificationEmail = async ({ to, otpCode }) => {
    if (!to || !otpCode) throw new Error("Missing required parameters");

    const message = verificationEmail({ otpCode });

    try {
        await sgMail.send({
            to,
            from: FROM_EMAIL,
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

    const message = projectInviteEmail({ projectName, inviteLink });

    try {
        await sgMail.send({
            to,
            from: FROM_EMAIL,
            subject: `You're Invited to Join ${projectName}!`,
            html: message,
        });
    } catch (error) {
        handleEmailError(error);
    }
};
