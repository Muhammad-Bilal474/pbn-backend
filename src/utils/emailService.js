import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendWelcomeEmail = async (email, name, tempPassword) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to PBN Platform - Your Login Credentials',
      html: `
        <h2>Welcome to PBN Content Automation Platform!</h2>
        <p>Hi ${name},</p>
        <p>Your account has been created. Here are your login credentials:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        </div>
        <p>Please change your password immediately after logging in.</p>
        <p><a href="${process.env.FRONTEND_URL}/login">Click here to login</a></p>
        <p>Best regards,<br/>PBN Platform Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send welcome email');
  }
};

export const sendResetPasswordEmail = async (email, resetToken) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset - PBN Platform',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password (valid for 1 hour):</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send reset email');
  }
};

export const sendPostNotificationEmail = async (email, postTitle, sites) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Post Published: ${postTitle}`,
      html: `
        <h2>Your Post Has Been Published!</h2>
        <p>Post: <strong>${postTitle}</strong></p>
        <p>Posted to ${sites.length} site(s)</p>
        <p>Check your dashboard for more details.</p>
        <p><a href="${process.env.FRONTEND_URL}/dashboard">View Dashboard</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send notification email');
  }
};

export default {
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendPostNotificationEmail,
};
