import { NextRequest, NextResponse } from 'next/server'
import { generateAndSendPasswordResetOTP } from '@/lib/otp-service'
import { findUserByEmail } from '@/lib/user-service'
import { createVerificationToken } from '@/lib/jwt-service'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const { email } = forgotPasswordSchema.parse(body)
    
    // Check if user exists with this email
    const user = await findUserByEmail(email)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'No account found with this email address.'
      }, { status: 404 })
    }
    
    // Check if user is verified (can only reset password if account is verified)
    if (!user.isVerified) {
      return NextResponse.json({
        success: false,
        message: 'Please verify your email address before resetting your password.'
      }, { status: 400 })
    }
    
    // Generate and send password reset OTP
    await generateAndSendPasswordResetOTP(email, user.firstName)
    
    // Create verification token for the password reset session
    const verificationToken = createVerificationToken(email)
    
    return NextResponse.json({
      success: true,
      message: 'Password reset code sent successfully to your email',
      verificationToken
    }, { status: 200 })
    
  } catch (error) {
    console.error('Forgot password error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to process password reset request. Please try again.'
    }, { status: 500 })
  }
}