import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter;

/**
 * Initialize the SMTP transporter
 * Optimized for Gmail SMTP with real credentials
 */
const getTransporter = async () => {
    if (transporter) return transporter;

    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.replace(/\s/g, '') : '';

    // Check if credentials are missing or still placeholders
    if (!user || !pass || user.includes('your_email@gmail.com')) {
        console.error('❌ [SMTP_INIT] Valid SMTP credentials not found in .env');
        return null;
    }

    // Use Gmail service for automatic optimization
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass,
        },
    });

    console.log(`📡 [SMTP_INIT] Gmail transporter initialized for: ${user}`);
    return transporter;
};

/**
 * Send a professional OTP email
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<Object>} - Success status and error details
 */
export const sendOTPEmail = async (to, otp) => {
    const transporter = await getTransporter();

    if (!transporter) {
        return { success: false, error: 'CONFIG_MISSING' };
    }

    const mailOptions = {
        from: `"Hiran Fabric Textile" <${process.env.SMTP_USER}>`,
        to: to,
        subject: 'Your Password Reset Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #001a66; text-align: center;">Hiran Fabric Textile</h2>
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;">
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hello,</p>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">You requested a password reset for your account. Please use the following 6-digit verification code to proceed:</p>
                <div style="background: #f8fafc; padding: 20px; text-align: center; margin: 30px 0; border: 2px dashed #001a66; border-radius: 8px;">
                    <span style="font-size: 32px; font-weight: 900; color: #001a66; letter-spacing: 12px;">${otp}</span>
                </div>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6;">This code will expire in 15 minutes. If you did not request this reset, please ignore this email or contact support if you have concerns.</p>
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;">
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2026 Hiran Fabric Textile. All rights reserved.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP Email sent successfully to: ${to}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to send OTP email:', error);
        if (error.responseCode === 535) {
            return { success: false, error: 'AUTH_FAILED' };
        }
        return { success: false, error: 'SYSTEM_ERROR' };
    }
};
