// Wallet service to interact with secure API endpoints
// This replaces the localStorage-based wallet management

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface WalletBalance {
  cashBalance: number
  bonusBalance: number
}

interface UserData {
  id: string
  userName: string
  email: string
  emoji: string
  tier: string
  totalWon: number
  totalLost: number
  totalDeposits: number
  totalWithdrawals: number
  hasWithdrawnBasic: boolean
}

interface Transaction {
  id: string
  type: string
  amount: number
  walletType: string
  game?: string
  description: string
  status: string
  createdAt: string
  metadata?: any
}

class WalletService {
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
    try {
      const response = await fetch(`/api/wallet${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return { success: true, ...data }
    } catch (error) {
      console.error(`Wallet API error (${endpoint}):`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Get wallet balance and user data
  async getBalance(): Promise<{ balance?: WalletBalance; user?: UserData; error?: string }> {
    const response = await this.makeRequest('/balance')
    
    if (!response.success) {
      return { error: response.error }
    }

    return {
      balance: {
        cashBalance: response.cashBalance,
        bonusBalance: response.bonusBalance,
      },
      user: response.user,
    }
  }

  // Place a bet
  async placeBet(amount: number, game: string, betDetails?: any): Promise<{ success: boolean; newBalance?: WalletBalance; error?: string }> {
    const response = await this.makeRequest('/bet', {
      method: 'POST',
      body: JSON.stringify({ amount, game, betDetails })
    })

    if (!response.success) {
      return { success: false, error: response.error }
    }

    return {
      success: true,
      newBalance: response.newBalance
    }
  }

  // Add winnings
  async addWinnings(amount: number, game: string, winDetails?: any): Promise<{ success: boolean; newBalance?: WalletBalance; error?: string }> {
    const response = await this.makeRequest('/win', {
      method: 'POST',
      body: JSON.stringify({ amount, game, winDetails })
    })

    if (!response.success) {
      return { success: false, error: response.error }
    }

    return {
      success: true,
      newBalance: response.newBalance
    }
  }

  // Make a deposit
  async deposit(amount: number, paymentData?: any, verified: boolean = false): Promise<{ success: boolean; newBalance?: WalletBalance; error?: string; message?: string }> {
    const response = await this.makeRequest('/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentData, verified })
    })

    if (!response.success) {
      return { success: false, error: response.error }
    }

    return {
      success: true,
      newBalance: response.newBalance,
      message: response.message
    }
  }

  // Request withdrawal
  async withdraw(amount: number, method: 'bank' | 'upi', accountDetails: any): Promise<{ success: boolean; newBalance?: WalletBalance; error?: string; message?: string }> {
    const response = await this.makeRequest('/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, method, accountDetails })
    })

    if (!response.success) {
      return { success: false, error: response.error }
    }

    return {
      success: true,
      newBalance: response.newBalance,
      message: response.message
    }
  }

  // Get transaction history
  async getTransactions(options: {
    page?: number;
    limit?: number;
    type?: string;
    game?: string;
    status?: string;
  } = {}): Promise<{ transactions?: Transaction[]; error?: string }> {
    const response = await this.makeRequest(`/transactions`)

    if (!response.success) {
      return { error: response.error }
    }

    return {
      transactions: response.transactions,
    }
  }
}

// Create a singleton instance
export const walletService = new WalletService()

// Export types for TypeScript
export type { WalletBalance, UserData, Transaction }
