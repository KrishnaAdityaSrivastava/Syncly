export const verificationEmail = ({ otpCode }) =>
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #fafafa;">
        <h2 style="color: #333; text-align: center;">🔐 Email Verification</h2>
        <p style="font-size: 16px; color: #555;">
          Hello,
        </p>
        <p style="font-size: 16px; color: #555;">
          Use the following verification code to complete your process:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #2e86de; background: #f1f5ff; padding: 10px 20px; border-radius: 8px; display: inline-block;">
            ${otpCode}
          </span>
        </div>
        <p style="font-size: 14px; color: #888;">
          ⚠️ This code will expire in 10 minutes. Do not share it with anyone.
        </p>
        <p style="font-size: 14px; color: #888;">
          If you didn’t request this, you can safely ignore this email.
        </p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #aaa; text-align: center;">
          &copy; ${new Date().getFullYear()} Your App Name. All rights reserved.
        </p>
      </div>
    `;

export const projectInviteEmail = ({ projectName, inviteLink }) =>
    `
    <div style="
      font-family: Arial, sans-serif; 
      max-width: 600px; 
      margin: auto; 
      padding: 20px; 
      border: 1px solid #eee; 
      border-radius: 10px; 
      background-color: #fafafa;
    ">
      <h2 style="color: #333; text-align: center;">
        👥 Project Invitation
      </h2>

      <p style="font-size: 16px; color: #444;">
        Hello,
      </p>

      <p style="font-size: 16px; color: #555;">
        You've been invited to join the project:
      </p>

      <div style="text-align: center; margin: 15px 0;">
        <span style="
          font-size: 22px; 
          font-weight: bold; 
          color: #2e86de; 
          background: #f1f5ff; 
          padding: 10px 25px; 
          border-radius: 8px;
          display: inline-block;
        ">
          ${projectName}
        </span>
      </div>

      <p style="font-size: 15px; color: #555;">
        Tap the button below to accept the invitation:
      </p>

      <div style="text-align: center; margin: 25px 0;">
        <a 
          href="${inviteLink}" 
          style="
            background: #2e86de;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            display: inline-block;
          "
        >
          Accept Invitation
        </a>
      </div>

      <p style="font-size: 14px; color: #777;">
        ⚠️ This invitation will expire in 48 hours.  
        If you don't recognize this request, you can safely ignore this email.
      </p>

      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />

      <p style="font-size: 12px; color: #aaa; text-align: center;">
        &copy; ${new Date().getFullYear()} Your App Name. All rights reserved.
      </p>
    </div>
    `;
