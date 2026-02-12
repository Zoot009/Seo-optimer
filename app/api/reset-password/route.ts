import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt-service'
import { hashPassword } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  resetToken: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const { email, password, resetToken } = resetPasswordSchema.parse(body)
    
    // Verify the reset token
    const tokenPayload = verifyToken(resetToken)
    if (!tokenPayload || tokenPayload.email !== email) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired reset token'
      }, { status: 401 })
    }
    
    // Hash the new password
    const hashedPassword = await hashPassword(password)
    
    // Update user password
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isVerified: true,
      }
    })
    
    // Clean up any remaining password reset OTPs for this email
    await prisma.oTP.deleteMany({
      where: {
        email,
        type: 'password_reset'
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      user
    }, { status: 200 })
    
  } catch (error) {
    console.error('Reset password error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to reset password. Please try again.'
    }, { status: 500 })
  }
}