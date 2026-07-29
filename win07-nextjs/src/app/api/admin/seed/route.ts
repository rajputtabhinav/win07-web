import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { adminPassword } = await req.json()
    
    // Use environment variable for password verification
    const validPassword = process.env.ADMIN_PASSWORD || '24Kittu@24'
    if (adminPassword !== validPassword) {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 403 })
    }

    // Generate sample users and activities for demonstration
    const sampleUsers = [
      {
        id: 'user_1',
        email: 'aarav@example.com',
        name: 'Aarav Sharma',
        signupDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        cashBalance: 5500,
        indCoins: 299,
        referralCount: 5,
        totalDeposits: 10000,
        totalWithdrawals: 2000,
        gamesPlayed: 45,
        totalWinnings: 8500,
        totalLosses: 7500,
        tier: 'Bronze',
        lastActivity: new Date().toISOString(),
        status: 'online' as const
      },
      {
        id: 'user_2',
        email: 'priya@example.com',
        name: 'Priya Patel',
        signupDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        cashBalance: 12500,
        indCoins: 799,
        referralCount: 15,
        totalDeposits: 25000,
        totalWithdrawals: 8000,
        gamesPlayed: 120,
        totalWinnings: 22000,
        totalLosses: 18000,
        tier: 'Gold',
        lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'offline' as const,
        adminAccess: {
          plan: 'premium',
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          notificationsRemaining: 35
        }
      },
      {
        id: 'user_3',
        email: 'rahul@example.com',
        name: 'Rahul Kumar',
        signupDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        cashBalance: 850,
        indCoins: 899,
        referralCount: 1,
        totalDeposits: 1500,
        totalWithdrawals: 0,
        gamesPlayed: 12,
        totalWinnings: 1200,
        totalLosses: 1850,
        tier: 'Basic',
        lastActivity: new Date().toISOString(),
        status: 'online' as const
      },
      {
        id: 'user_4',
        email: 'anita@example.com',
        name: 'Anita Singh',
        signupDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        cashBalance: 45000,
        indCoins: 1299,
        referralCount: 125,
        totalDeposits: 100000,
        totalWithdrawals: 75000,
        gamesPlayed: 450,
        totalWinnings: 150000,
        totalLosses: 130000,
        tier: 'Grandmaster',
        lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: 'online' as const,
        adminAccess: {
          plan: 'ultimate',
          expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          notificationsRemaining: 145
        }
      }
    ]

    const sampleGames = [
      {
        userId: 'user_1',
        userName: 'Aarav Sharma',
        game: 'Aviator',
        betAmount: 500,
        winAmount: 1250,
        profit: 750,
        outcome: 'win' as const
      },
      {
        userId: 'user_2',
        userName: 'Priya Patel',
        game: 'Teen Patti',
        betAmount: 1000,
        winAmount: 0,
        profit: -1000,
        outcome: 'loss' as const
      },
      {
        userId: 'user_3',
        userName: 'Rahul Kumar',
        game: 'Mines',
        betAmount: 200,
        winAmount: 800,
        profit: 600,
        outcome: 'win' as const
      },
      {
        userId: 'user_4',
        userName: 'Anita Singh',
        game: 'Roulette',
        betAmount: 5000,
        winAmount: 15000,
        profit: 10000,
        outcome: 'win' as const
      }
    ]

    const sampleEvents = [
      {
        type: 'signup',
        userId: 'user_5',
        userName: 'Vikram Gupta',
        description: 'Vikram Gupta joined WIN07Pro!',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        type: 'deposit',
        userId: 'user_1',
        userName: 'Aarav Sharma',
        description: 'Aarav Sharma deposited ₹2,000',
        amount: 2000,
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      },
      {
        type: 'withdrawal',
        userId: 'user_2',
        userName: 'Priya Patel',
        description: 'Priya Patel withdrew ₹5,000',
        amount: 5000,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        type: 'referral',
        userId: 'user_4',
        userName: 'Anita Singh',
        description: 'Anita Singh earned ₹30 from referral',
        amount: 30,
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString()
      }
    ]

    // Send sample data to admin agent
    for (const user of sampleUsers) {
      await fetch('http://localhost:3000/api/admin/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateUser',
          data: user,
          adminPassword: '24Kittu@24'
        })
      })
    }

    for (const game of sampleGames) {
      await fetch('http://localhost:3000/api/admin/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addGameActivity',
          data: game,
          adminPassword: '24Kittu@24'
        })
      })
    }

    for (const event of sampleEvents) {
      await fetch('http://localhost:3000/api/admin/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addLiveEvent',
          data: event,
          adminPassword: '24Kittu@24'
        })
      })
    }

    // Add sample withdrawals and deposits
    const sampleWithdrawals = [
      {
        userId: 'user_1',
        userName: 'Aarav Sharma',
        amount: 2000,
        upiId: 'aarav@paytm'
      },
      {
        userId: 'user_2',
        userName: 'Priya Patel',
        amount: 5000,
        upiId: 'priya@phonepe'
      }
    ]

    const sampleDeposits = [
      {
        userId: 'user_3',
        userName: 'Rahul Kumar',
        amount: 1500,
        method: 'UPI',
        screenshot: 'screenshot_url_here'
      },
      {
        userId: 'user_4',
        userName: 'Anita Singh',
        amount: 10000,
        method: 'UPI',
        screenshot: 'screenshot_url_here'
      }
    ]

    const sampleReferrals = [
      {
        referrerId: 'user_4',
        referrerName: 'Anita Singh',
        referredId: 'user_5',
        referredName: 'Vikram Gupta',
        reward: 30
      },
      {
        referrerId: 'user_2',
        referrerName: 'Priya Patel',
        referredId: 'user_6',
        referredName: 'Ravi Kumar',
        reward: 30
      }
    ]

    // Add sample withdrawals
    for (const withdrawal of sampleWithdrawals) {
      await fetch('http://localhost:3000/api/admin/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addPendingWithdrawal',
          data: withdrawal,
          adminPassword: '24Kittu@24'
        })
      })
    }

    // Add sample deposits
    for (const deposit of sampleDeposits) {
      await fetch('http://localhost:3000/api/admin/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addDepositRecord',
          data: deposit,
          adminPassword: '24Kittu@24'
        })
      })
    }

    // Add sample referrals
    for (const referral of sampleReferrals) {
      await fetch('http://localhost:3000/api/admin/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addReferralActivity',
          data: referral,
          adminPassword: '24Kittu@24'
        })
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sample data seeded successfully',
      seeded: {
        users: sampleUsers.length,
        games: sampleGames.length,
        events: sampleEvents.length,
        withdrawals: sampleWithdrawals.length,
        deposits: sampleDeposits.length,
        referrals: sampleReferrals.length
      }
    })
  } catch (error) {
    console.error('Seed data error:', error)
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 })
  }
}
