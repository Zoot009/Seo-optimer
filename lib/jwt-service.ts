import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

/**
 * Create a JWT token
 * @param payload - Data to encode in the token
 * @param expiresIn - Token expiration time (default: 24h)
 * @returns JWT token string
 */
export function createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn: string = '24h'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions)
}

/**
 * Verify and decode JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Create a verification token for email verification process
 * @param email - User's email address
 * @returns JWT token for verification
 */
export function createVerificationToken(email: string): string {
  return createToken({ userId: '', email }, '1h')
}

/**
 * Create an auth token after successful login
 * @param userId - User's ID
 * @param email - User's email address
 * @returns JWT token for authentication
 */
export function createAuthToken(userId: string, email: string): string {
  return createToken({ userId, email }, '7d')
}