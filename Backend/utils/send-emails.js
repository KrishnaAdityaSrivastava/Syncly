import transporter, { accountEmail } from '../config/nodemailer.js'
import {  verificationEmail, projectInviteEmail } from './email-template.js';

export const sendVerificationEmail = async({ to, otpCode })=> {
    
    if(!to || !otpCode) throw new Error("Missing required parameters");

    const message = verificationEmail({otpCode});

    const mailOptions = {
        from: accountEmail,
        to: to,
        subject: 'Your Verification Email',
        html: message
    }

    await transporter.sendMail(mailOptions,(error, info) => {
        if (error) return console.error(error, "Error Sending Email");
    })
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

    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) return console.error("Error Sending Invitation:", error);
    });
};
