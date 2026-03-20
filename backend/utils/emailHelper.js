import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter;

const IS_PLACEHOLDER = !process.env.SMTP_USER || process.env.SMTP_USER.includes('your_email@gmail.com');

/**
 * Initialize the SMTP transporter
 * Supports real SMTP and an automatic Ethereal fallback for development
 */
const getTransporter = async () => {
    if (transporter) return transporter;

    if (!IS_PLACEHOLDER) {
        // Use real SMTP from .env
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
        return transporter;
    }

    // --- SMART FALLBACK ---
    // If credentials are placeholders, create a temporary Ethereal account
    console.log("🛠️  [SMTP_INIT] Using Ethereal (Test Service) for development...");
    try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log(`✅ [SMTP_INIT] Ethereal account created: ${testAccount.user}`);
        return transporter;
    } catch (error) {
        console.error('❌ [SMTP_INIT] Failed to create Ethereal account:', error);
        return null;
    }
};

/**
 * Send a professional OTP email
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<boolean>} - Success status
 */
export const sendOTPEmail = async (to, otp) => {
    const transporter = await getTransporter();

    if (!transporter) {
        console.error('❌ [SMTP] No transporter available');
        return { success: false, error: 'SYSTEM_ERROR' };
    }

    const fromEmail = IS_PLACEHOLDER ? `"Hiran MS (Test)" <${transporter.options.auth.user}>` : `"Hiran Fabric Textile" <${process.env.SMTP_USER}>`;

    const mailOptions = {
        from: fromEmail,
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
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ OTP Email sent successfully to: ${to}`);
        
        // If using Ethereal, provide the preview URL
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`🔗 PREVIEW URL: ${previewUrl}`);
            return { success: true, previewUrl };
        }

        return { success: true };
    } catch (error) {
        console.error('❌ Failed to send OTP email:', error);
        if (error.responseCode === 535) {
            return { success: false, error: 'AUTH_FAILED' };
        }
        return { success: false, error: 'SYSTEM_ERROR' };
    }
};
