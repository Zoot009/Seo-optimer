import nodemailer from 'nodemailer'

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send an email
 * @param emailData - Email data including recipient, subject, and content
 */
export async function sendEmail(emailData: EmailData) {
  const { to, subject, html, text } = emailData
  
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      text,
      html,
    })
    
    console.log('Message sent: %s', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email sending failed:', error)
    throw new Error('Failed to send email')
  }
}

/**
 * Send OTP verification email
 * @param email - Recipient email address
 * @param otp - OTP code
 * @param firstName - User's first name
 */
export async function sendOTPEmail(email: string, otp: string, firstName: string) {
  const subject = 'Verify Your Email Address - SEOmaster'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0D6EFD; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f8f9fa; padding: 30px; }
            .otp-code { 
                background-color: #FDB022; 
                color: white; 
                font-size: 32px; 
                font-weight: bold; 
                text-align: center; 
                padding: 20px; 
                margin: 20px 0; 
                border-radius: 8px;
                letter-spacing: 8px;
            }
            .footer { background-color: #e9ecef; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
<h1>Verify Your Email Address - SEOmaster</h1>
                <p>Email Verification</p>
            </div>
            <div class="content">
                <h2>Hi ${firstName}!</h2>
                <p>Thank you for signing up with SEOmaster. To complete your registration, please verify your email address using the OTP code below:</p>
                
                <div class="otp-code">${otp}</div>
                
                <p><strong>This code will expire in 10 minutes.</strong></p>
                
                <p>If you didn't create an account with SEOmaster, please ignore this email.</p>
                
                <p>Best regards,<br>The SEOmaster Team</p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} SEOmaster. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `
  
  const text = `
    Hi ${firstName}!
    
    Thank you for signing up with SEOmaster. To complete your registration, please verify your email address using the OTP code: ${otp}
    
    This code will expire in 10 minutes.
    
    If you didn't create an account with SEOmaster, please ignore this email.
    
    Best regards,
    The SEOmaster Team
  `
  
  await sendEmail({
    to: email,
    subject,
    html,
    text,
  })
}

/**
 * Send password reset OTP email
 * @param email - Recipient email address
 * @param otp - OTP code
 * @param firstName - User's first name
 */
export async function sendPasswordResetOTPEmail(email: string, otp: string, firstName: string) {
  const subject = 'Reset Your Password - SEOmaster'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0D6EFD; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f8f9fa; padding: 30px; }
            .otp-code { 
                background-color: #FDB022; 
                color: white; 
                font-size: 32px; 
                font-weight: bold; 
                text-align: center; 
                padding: 20px; 
                margin: 20px 0; 
                border-radius: 8px;
                letter-spacing: 8px;
            }
            .footer { background-color: #e9ecef; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>SEOmaster</h1>
                <p>Password Reset</p>
            </div>
            <div class="content">
                <h2>Hi ${firstName}!</h2>
                <p>We received a request to reset your password for your SEOmaster account. To continue with the password reset, please use the OTP code below:</p>
                
                <div class="otp-code">${otp}</div>
                
                <p><strong>This code will expire in 10 minutes.</strong></p>
                
                <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
                
                <p>Best regards,<br>The SEOmaster Team</p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} SEOmaster. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `
  
  const text = `
    Hi ${firstName}!
    
    We received a request to reset your password for your SEOmaster account. To continue with the password reset, please use the OTP code: ${otp}
    
    This code will expire in 10 minutes.
    
    If you didn't request this password reset, please ignore this email and your password will remain unchanged.
    
    Best regards,
    The SEOmaster Team
  `
  
  await sendEmail({
    to: email,
    subject,
    html,
    text,
  })
}