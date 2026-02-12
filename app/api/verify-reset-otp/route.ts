import { NextRequest, NextResponse } from 'next/server'
import { verifyPasswordResetOTP } from '@/lib/otp-service'
import { verifyToken, createAuthToken } from '@/lib/jwt-service'
import { findUserByEmail } from '@/lib/user-service'
import { z } from 'zod'

const verifyResetOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(4, 'OTP must be 4 digits'),
  verificationToken: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const { email, otp, verificationToken } = verifyResetOTPSchema.parse(body)
    
    // Verify the verification token
    const tokenPayload = verifyToken(verificationToken)
    if (!tokenPayload || tokenPayload.email !== email) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired verification session'
      }, { status: 401 })
    }
    
    // Check if user exists
    const user = await findUserByEmail(email)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }
    
    // Verify the password reset OTP
    const isValidOTP = await verifyPasswordResetOTP(email, otp)
    if (!isValidOTP) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired OTP code'
      }, { status: 400 })
    }
    
    // Create a special reset token that will be used for password update
    const resetToken = createAuthToken(user.id, email)
    
    return NextResponse.json({
      success: true,
      message: 'Password reset OTP verified successfully',
      resetToken
    }, { status: 200 })
    
  } catch (error) {
    console.error('Verify reset OTP error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    }, { status: 500 })
  }
}