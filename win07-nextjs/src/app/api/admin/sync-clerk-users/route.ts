import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { databaseService } from '@/lib/database-service'
import { adminSessionManager } from '@/lib/admin-session'

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = req.headers.get('authorization')
    let isAuthorized = false

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      isAuthorized = await adminSessionManager.verifySession(token)
    } else {
      const { adminPassword } = await req.json()
      const validPassword = process.env.ADMIN_PASSWORD || '24Kittu@24'
      isAuthorized = adminPassword === validPassword
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    }

    console.log('🔄 Starting Clerk user sync...')
    
    // Get all Clerk users
    const clerkUsers = await clerkClient.users.getUserList({ 
      limit: 500 // Adjust as needed
    })
    
    let syncedCount = 0
    let errors = []

    // Sync each Clerk user with admin agent
    for (const clerkUser of clerkUsers.data) {
      try {
        const userData = {
          id: clerkUser.id,
          email: clerkUser.emailAddresses?.[0]?.emailAddress || 'no-email@win07pro.com',
          name: clerkUser.username || clerkUser.firstName || 'Anonymous Player',
          fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Anonymous Player',
          signupDate: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
          lastLogin: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt).toISOString() : new Date().toISOString(),
          cashBalance: 0, // Real users start with 0 - must deposit real money
          bonusBalance: 0,
          indCoins: 899, // Default trial coins
          referralCount: 0,
          referralEarnings: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
          gamesPlayed: 0,
          totalWinnings: 0,
          totalLosses: 0,
          tier: 'Basic',
          lastActivity: new Date().toISOString(),
          status: clerkUser.lastSignInAt && 
                  (new Date().getTime() - new Date(clerkUser.lastSignInAt).getTime()) < 5 * 60 * 1000 
                  ? 'online' : 'offline',
          adminAccess: undefined,
          withdrawnToday: 0,
          lastWithdrawalDate: null,
          totalTransactions: 0,
          profileImage: clerkUser.imageUrl,
          phoneNumber: clerkUser.phoneNumbers?.[0]?.phoneNumber,
          emailVerified: clerkUser.emailAddresses?.[0]?.verification?.status === 'verified'
        }

        // Update user in admin agent
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/agent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'updateUser',
            data: userData,
            adminPassword: '24Kittu@24'
          })
        })

        if (response.ok) {
          syncedCount++
          console.log(`✅ Synced user: ${userData.name} (${userData.id})`)
        } else {
          errors.push(`Failed to sync user ${userData.name}: ${response.statusText}`)
        }
      } catch (error) {
        errors.push(`Error syncing user ${clerkUser.id}: ${error}`)
        console.error(`❌ Error syncing user ${clerkUser.id}:`, error)
      }
    }

    console.log(`🎉 Sync complete! Synced ${syncedCount} users`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedCount} Clerk users`,
      syncedCount,
      totalClerkUsers: clerkUsers.data.length,
      errors: errors.length > 0 ? errors : undefined
    })
    
  } catch (error) {
    console.error('Clerk sync error:', error)
    return NextResponse.json({ 
      error: 'Failed to sync Clerk users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const password = url.searchParams.get('password')
    
    if (password !== '24Kittu@24') {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 403 })
    }

    // Get Clerk user count for comparison
    const clerkUsers = await clerkClient.users.getUserList({ limit: 1 })
    
    return NextResponse.json({
      success: true,
      totalClerkUsers: clerkUsers.totalCount,
      message: 'Use POST to sync users'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get user count' }, { status: 500 })
  }
}
