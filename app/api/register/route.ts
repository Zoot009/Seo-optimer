import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/user-service'
import { generateAndSendOTP } from '@/lib/otp-service'
import { createVerificationToken } from '@/lib/jwt-service'
import { z } from 'zod'

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validatedData = registerSchema.parse(body)
    
    // Create user with hashed password
    const user = await createUser(validatedData)
    
    // Generate and send OTP for email verification
    await generateAndSendOTP(user.email, user.firstName)
    
    // Create verification token for the session
    const verificationToken = createVerificationToken(user.email)
    
    return NextResponse.json({
      success: true,
      message: 'User registered successfully. Please check your email for verification code.',
      user,
      verificationToken
    }, { status: 201 })
    
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error
      }, { status: 400 })
    }
    
    // Handle Prisma unique constraint error (duplicate email)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({
        success: false,
        message: 'Email already exists'
      }, { status: 409 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Registration failed'
    }, { status: 500 })
  }
}