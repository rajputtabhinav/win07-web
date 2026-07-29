// Secure Admin Session Management
import { SignJWT, jwtVerify } from 'jose'

interface AdminSession {
  phone: string
  isAuthenticated: boolean
  loginTime: number
  expiresAt: number
}

class AdminSessionManager {
  private secret = new TextEncoder().encode(
    process.env.ADMIN_JWT_SECRET || 'your-secret-key-change-in-production'
  )
  private sessions = new Map<string, AdminSession>()

  // Create secure admin session
  async createSession(phone: string): Promise<string> {
    const now = Date.now()
    const expiresAt = now + (24 * 60 * 60 * 1000) // 24 hours
    
    const session: AdminSession = {
      phone,
      isAuthenticated: true,
      loginTime: now,
      expiresAt
    }

    // Create JWT token
    const token = await new SignJWT({ phone, expiresAt })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(this.secret)

    this.sessions.set(token, session)
    return token
  }

  // Verify admin session
  async verifySession(token: string): Promise<boolean> {
    try {
      const { payload } = await jwtVerify(token, this.secret)
      const session = this.sessions.get(token)
      
      if (!session) return false
      if (session.expiresAt < Date.now()) {
        this.sessions.delete(token)
        return false
      }

      return session.isAuthenticated
    } catch (error) {
      return false
    }
  }

  // Invalidate session
  async invalidateSession(token: string): Promise<void> {
    this.sessions.delete(token)
  }

  // Clean expired sessions
  cleanExpiredSessions(): void {
    const now = Date.now()
    for (const [token, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(token)
      }
    }
  }
}

export const adminSessionManager = new AdminSessionManager()

// Middleware to verify admin authentication
export function withSecureAdminAuth(handler: Function) {
  return async (req: any) => {
    try {
      const authHeader = req.headers.get('authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const token = authHeader.substring(7)
      const isValid = await adminSessionManager.verifySession(token)
      
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Invalid session' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return handler(req)
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}
