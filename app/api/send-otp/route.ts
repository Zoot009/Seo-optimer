import { NextRequest, NextResponse } from 'next/server'
import { generateAndSendOTP } from '@/lib/otp-service'
import { findUserByEmail } from '@/lib/user-service'
import { createVerificationToken } from '@/lib/jwt-service'
import { z } from 'zod'

const sendOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const { email } = sendOTPSchema.parse(body)
    
    // Check if user exists with this email
    const user = await findUserByEmail(email)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found with this email address'
      }, { status: 404 })
    }
    
    // Check if user is already verified
    if (user.isVerified) {
      return NextResponse.json({
        success: false,
        message: 'Email is already verified'
      }, { status: 400 })
    }
    
    // Generate and send OTP
    await generateAndSendOTP(email, user.firstName)
    
    // Create verification token for the session
    const verificationToken = createVerificationToken(email)
    
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your email',
      verificationToken
    }, { status: 200 })
    
  } catch (error) {
    console.error('Send OTP error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    }, { status: 500 })
  }
}