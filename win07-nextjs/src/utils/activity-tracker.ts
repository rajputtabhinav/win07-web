// Global activity tracker for cross-user notifications
interface GlobalActivity {
  userId: string
  userName: string
  action: 'win' | 'big_win' | 'jackpot' | 'deposit' | 'referral'
  amount: number
  game?: string
  timestamp: Date
}

class ActivityTracker {
  private static instance: ActivityTracker
  private activities: GlobalActivity[] = []
  private listeners: ((activity: GlobalActivity) => void)[] = []

  static getInstance(): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker()
    }
    return ActivityTracker.instance
  }

  // Subscribe to activity updates
  subscribe(listener: (activity: GlobalActivity) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Track user activity
  trackActivity(activity: Omit<GlobalActivity, 'timestamp'>) {
    const fullActivity: GlobalActivity = {
      ...activity,
      timestamp: new Date()
    }

    this.activities.unshift(fullActivity)
    this.activities = this.activities.slice(0, 1000) // Keep last 1000 activities

    // Notify all listeners
    this.listeners.forEach(listener => listener(fullActivity))

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('globalActivities', JSON.stringify(this.activities.slice(0, 100)))
    }
  }

  // Load activities from localStorage
  loadStoredActivities() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('globalActivities')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          this.activities = parsed.map((a: any) => ({
            ...a,
            timestamp: new Date(a.timestamp)
          }))
        } catch (error) {
          console.error('Failed to load stored activities:', error)
        }
      }
    }
  }

  // Get recent activities
  getRecentActivities(limit = 50): GlobalActivity[] {
    return this.activities.slice(0, limit)
  }

  // Generate fake activity for demonstration
  generateFakeActivity() {
    const names = [
      'Aarav Sharma', 'Vivaan Singh', 'Aditya Kumar', 'Vihaan Gupta', 'Arjun Patel', 'Sai Reddy', 'Reyansh Jain', 'Ayaan Khan', 'Krishna Yadav', 'Ishaan Verma',
      'Shaurya Agarwal', 'Atharv Mishra', 'Aadhya Sharma', 'Anaya Singh', 'Kavya Kumar', 'Aanya Gupta', 'Kiara Patel', 'Diya Reddy', 'Pihu Jain', 'Myra Khan',
      'Prisha Yadav', 'Anvi Verma', 'Aarohi Agarwal', 'Riya Mishra', 'Rajesh Kumar', 'Suresh Singh', 'Ramesh Sharma', 'Mahesh Gupta', 'Dinesh Patel', 'Rakesh Reddy'
    ]
    
    const games = ['Aviator', 'Mines', 'Wheel', 'Teen Patti', 'Andar Bahar', 'Limbo', 'Blackjack', 'Baccarat', 'Crazy Time', 'Crash']
    
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomGame = games[Math.floor(Math.random() * games.length)]
    
    // Random win amounts with realistic distribution
    const rand = Math.random()
    let amount: number
    let action: GlobalActivity['action'] = 'win'
    
    // Generate realistic win amounts for demo notifications
    if (rand < 0.1) { // 10% chance for big wins
      amount = Math.floor(Math.random() * 200000) + 50000 // ₹50K - ₹250K
      action = rand < 0.02 ? 'jackpot' : 'big_win'
    } else if (rand < 0.3) { // 20% chance for medium wins
      amount = Math.floor(Math.random() * 45000) + 5000 // ₹5K - ₹50K
      action = 'win'
    } else { // 70% chance for regular wins
      amount = Math.floor(Math.random() * 4500) + 500 // ₹500 - ₹5K
      action = 'win'
    }

    this.trackActivity({
      userId: `fake_${Math.random().toString(36).substr(2, 9)}`,
      userName: randomName,
      action,
      amount,
      game: randomGame
    })
  }

  // Start generating fake activities
  startFakeActivityGeneration() {
    const generate = () => {
      this.generateFakeActivity()
      // Random interval between 2-6 seconds
      const nextDelay = Math.random() * 4000 + 2000
      setTimeout(generate, nextDelay)
    }

    // Start after 1 second
    setTimeout(generate, 1000)
  }
}

export const activityTracker = ActivityTracker.getInstance()

// Auto-start fake activity generation
if (typeof window !== 'undefined') {
  activityTracker.loadStoredActivities()
  activityTracker.startFakeActivityGeneration()
}
