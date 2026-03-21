import { Resend } from 'resend';
import { verificationEmail, projectInviteEmail } from './email-template.js';

const resend = new Resend(process.env.RESEND_API_KEY);

// You can set this in env instead of accountEmail
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

const handleEmailError = (error) => {
    const serviceError = new Error(error?.message || 'Failed to send email');
    serviceError.statusCode = 503;
    throw serviceError;
};

export const sendVerificationEmail = async ({ to, otpCode }) => {
    if (!to || !otpCode) throw new Error("Missing required parameters");

    const message = verificationEmail({ otpCode });

    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to,
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
        await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: `You're Invited to Join ${projectName}!`,
            html: message,
        });
    } catch (error) {
        handleEmailError(error);
    }
};