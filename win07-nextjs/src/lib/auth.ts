import { createClerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

type Handler = (req: NextRequest) => Promise<Response>

// Initialize Clerk client with proper configuration
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY || 'sk_test_placeholder',
})

export const withAuth = (handler: Handler) => {
  return async (req: NextRequest) => {
    try {
      const { userId } = await auth()

      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Use try-catch for user fetching to handle potential errors
      let user = null
      try {
        user = await clerkClient.users.getUser(userId)
      } catch (error) {
        console.warn('Could not fetch user from Clerk:', error)
        // Create a basic user object if Clerk fails
        user = { id: userId, emailAddresses: [{ emailAddress: 'user@win07pro.com' }], firstName: 'User' }
      }

      ;(req as any).auth = { userId, user }
      return handler(req)
    } catch (error) {
      console.error('Auth error:', error)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
  }
}

export const withAdminAuth = (handler: Handler) => {
  return withAuth(async (req: NextRequest) => {
    const { sessionClaims } = (req as any).auth

    if (sessionClaims?.metadata.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return handler(req)
  })
}
