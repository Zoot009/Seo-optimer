import { NextRequest, NextResponse } from 'next/server'
import { verifyOTP } from '@/lib/otp-service'
import { verifyToken } from '@/lib/jwt-service'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(4, 'OTP must be 4 digits'),
  verificationToken: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const { email, otp, verificationToken } = verifyOTPSchema.parse(body)
    
    // Verify the verification token
    const tokenPayload = verifyToken(verificationToken)
    if (!tokenPayload || tokenPayload.email !== email) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired verification session'
      }, { status: 401 })
    }
    
    // Verify the OTP
    const isValidOTP = await verifyOTP(email, otp)
    if (!isValidOTP) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired OTP code'
      }, { status: 400 })
    }
    
    // Mark user as verified
    const user = await prisma.user.update({
      where: { email },
      data: { isVerified: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true,
        email: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user
    }, { status: 200 })
    
  } catch (error) {
    console.error('Verify OTP error:', error)
    
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