import prisma from './prisma'
import { sendOTPEmail, sendPasswordResetOTPEmail } from './email-service'
import crypto from 'crypto'

/**
 * Generate a 4-digit OTP code
 */
export function generateOTP(): string {
  return crypto.randomInt(1000, 9999).toString()
}

/**
 * Generate and send OTP to user's email for email verification
 * @param email - User's email address
 * @param firstName - User's first name for personalization
 * @returns OTP record
 */
export async function generateAndSendOTP(email: string, firstName: string) {
  return await generateAndSendOTPByType(email, firstName, 'email_verification')
}

/**
 * Generate and send OTP to user's email for password reset
 * @param email - User's email address
 * @param firstName - User's first name for personalization
 * @returns OTP record
 */
export async function generateAndSendPasswordResetOTP(email: string, firstName: string) {
  return await generateAndSendOTPByType(email, firstName, 'password_reset')
}

/**
 * Generate and send OTP by type
 * @param email - User's email address
 * @param firstName - User's first name for personalization
 * @param type - OTP type ('email_verification' or 'password_reset')
 * @returns OTP record
 */
async function generateAndSendOTPByType(email: string, firstName: string, type: 'email_verification' | 'password_reset') {
  // Delete any existing OTPs for this email and type
  await prisma.oTP.deleteMany({
    where: { 
      email,
      type
    }
  })
  
  // Generate new OTP
  const otpCode = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  
  // Store OTP in database
  const otp = await prisma.oTP.create({
    data: {
      email,
      code: otpCode,
      type,
      expiresAt,
    }
  })
  
  // Send appropriate email based on type
  if (type === 'email_verification') {
    await sendOTPEmail(email, otpCode, firstName)
  } else if (type === 'password_reset') {
    await sendPasswordResetOTPEmail(email, otpCode, firstName)
  }
  
  return otp
}

/**
 * Verify OTP code for email verification
 * @param email - User's email address
 * @param code - OTP code to verify
 * @returns Whether OTP is valid and not expired
 */
export async function verifyOTP(email: string, code: string): Promise<boolean> {
  return await verifyOTPByType(email, code, 'email_verification')
}

/**
 * Verify OTP code for password reset
 * @param email - User's email address
 * @param code - OTP code to verify
 * @returns Whether OTP is valid and not expired
 */
export async function verifyPasswordResetOTP(email: string, code: string): Promise<boolean> {
  return await verifyOTPByType(email, code, 'password_reset')
}

/**
 * Verify OTP code by type
 * @param email - User's email address
 * @param code - OTP code to verify
 * @param type - OTP type ('email_verification' or 'password_reset')
 * @returns Whether OTP is valid and not expired
 */
async function verifyOTPByType(email: string, code: string, type: 'email_verification' | 'password_reset'): Promise<boolean> {
  // Find the OTP record
  const otp = await prisma.oTP.findFirst({
    where: {
      email,
      code,
      type,
      verified: false,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  if (!otp) {
    return false // OTP not found or already verified
  }
  
  // Check if OTP has expired
  if (otp.expiresAt < new Date()) {
    // Clean up expired OTP
    await prisma.oTP.delete({
      where: { id: otp.id }
    })
    return false
  }
  
  // Mark OTP as verified
  await prisma.oTP.update({
    where: { id: otp.id },
    data: { verified: true }
  })
  
  return true
}

/**
 * Clean up expired OTPs
 */
export async function cleanupExpiredOTPs() {
  await prisma.oTP.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  })
}