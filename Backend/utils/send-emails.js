import transporter, { accountEmail } from '../config/nodemailer.js'
import { verificationEmail, projectInviteEmail } from './email-template.js';

const handleEmailError = (error) => {
    if (error?.code === 'ETIMEDOUT') {
        const serviceError = new Error('Email server connection timed out while using the Gmail transporter.');
        serviceError.statusCode = 503;
        throw serviceError;
    }

    const serviceError = new Error(error?.message || 'Failed to send email');
    serviceError.statusCode = 503;
    throw serviceError;
};

export const sendVerificationEmail = async({ to, otpCode })=> {
    if(!to || !otpCode) throw new Error("Missing required parameters");

    const message = verificationEmail({otpCode});

    const mailOptions = {
        from: accountEmail,
        to,
        subject: 'Your Verification Email',
        html: message
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        handleEmailError(error);
    }
}

export const sendProjectInviteEmail = async ({ to, projectName, inviteLink }) => {
    if (!to || !projectName || !inviteLink) {
        throw new Error("Missing required parameters for invitation email");
    }

    const message = projectInviteEmail({
        projectName,
        inviteLink
    });

    const mailOptions = {
        from: accountEmail,
        to,
        subject: `You're Invited to Join ${projectName}!`,
        html: message,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        handleEmailError(error);
    }
};
