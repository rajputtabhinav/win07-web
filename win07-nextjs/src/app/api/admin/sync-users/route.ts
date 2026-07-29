import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth'
import { connectToCouchDB } from '@/lib/couchdb'
import { CouchUser } from '@/models/CouchModels'
import { clerkClient } from '@clerk/nextjs/server'

// POST /api/admin/sync-users - Sync all users from Clerk to CouchDB
export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    await connectToCouchDB()
    
    console.log('🔄 Starting user sync from Clerk to CouchDB...')
    
    // Initialize the Clerk client
    const client = await clerkClient()
    
    // Get all users from Clerk (paginated)
    let hasMore = true
    let offset = 0
    const limit = 100
    let totalSynced = 0
    let totalCreated = 0
    let totalUpdated = 0

    while (hasMore) {
      const response = await client.users.getUserList({
        limit,
        offset
      })
      
      const clerkUsers = response.data
      hasMore = clerkUsers.length === limit
      offset += limit

      console.log(`📥 Processing ${clerkUsers.length} users from Clerk (offset: ${offset - limit})`)

      for (const clerkUser of clerkUsers) {
        try {
          const userEmail = clerkUser.emailAddresses?.[0]?.emailAddress
          const userName = clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'User'
          
          if (!userEmail) {
            console.log(`⚠️ Skipping user ${clerkUser.id} - no email address`)
            continue
          }

          // Check if user exists in CouchDB
          let couchUser = await CouchUser.findByClerkId(clerkUser.id)
          
          if (couchUser) {
            // Update existing user
            await CouchUser.updateUser(couchUser._id!, {
              userName,
              userEmail: userEmail,
              lastLoginAt: clerkUser.lastActiveAt ? new Date(clerkUser.lastActiveAt).toISOString() : new Date().toISOString()
            })
            totalUpdated++
            console.log(`✏️ Updated user: ${userName} (${userEmail})`)
          } else {
            // Create new user
            couchUser = await CouchUser.create({
              clerkUserId: clerkUser.id,
              userName,
              userEmail: userEmail,
              tier: 'Basic',
              cashBalance: 0,
              bonusBalance: 0,
              totalDeposits: 0,
              totalWithdrawals: 0,
              totalWon: 0,
              totalLost: 0,
              hasWithdrawnBasic: false,
              lastLoginAt: clerkUser.lastActiveAt ? new Date(clerkUser.lastActiveAt).toISOString() : new Date().toISOString()
            })
            
            totalCreated++
            console.log(`➕ Created user: ${userName} (${userEmail})`)
          }
          
          totalSynced++
        } catch (userError) {
          console.error(`❌ Error processing user ${clerkUser.id}:`, userError)
        }
      }
    }

    console.log(`✅ User sync completed!`)
    console.log(`📊 Total processed: ${totalSynced}`)
    console.log(`📊 Created: ${totalCreated}`)
    console.log(`📊 Updated: ${totalUpdated}`)

    return NextResponse.json({
      success: true,
      message: 'User sync completed successfully',
      stats: {
        totalSynced,
        totalCreated,
        totalUpdated
      }
    })

  } catch (error) {
    console.error('❌ User sync error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to sync users from Clerk'
    }, { status: 500 })
  }
})

// GET /api/admin/sync-users - Get sync status
export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    await connectToCouchDB()
    
    // Get total user counts (simplified for CouchDB)
    const couchUserCount = 0 // CouchDB doesn't have easy count without views
    
    // Get recent synced users (simplified for CouchDB)
    const recentUsers: any[] = [] // Would need to implement a view for this

    return NextResponse.json({
      success: true,
      data: {
        couchUserCount,
        recentUsers
      }
    })

  } catch (error) {
    console.error('Error getting sync status:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get sync status'
    }, { status: 500 })
  }
})
