// Admin Dashboard Tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserManagement } from '@/components/admin/UserManagement'
import { WithdrawalManagement } from '@/components/admin/WithdrawalManagement'
import { DashboardStats } from '@/components/admin/DashboardStats'

// Mock data
const mockUsers = [
  {
    id: 'user1',
    email: 'test@example.com',
    name: 'Test User',
    cashBalance: 1000,
    bonusBalance: 500,
    indCoins: 899,
    referralCount: 5,
    totalDeposits: 2000,
    totalWithdrawals: 500,
    gamesPlayed: 25,
    totalWinnings: 1500,
    totalLosses: 1000,
    tier: 'Bronze',
    lastActivity: new Date().toISOString(),
    status: 'online' as const
  }
]

const mockWithdrawalData = {
  pending: [
    {
      id: 'wd1',
      userId: 'user1',
      userName: 'Test User',
      amount: 1000,
      method: 'upi',
      upiId: 'test@upi',
      requestTime: new Date().toISOString(),
      status: 'pending'
    }
  ],
  processed: []
}

const mockAdminData = {
  summary: {
    totalUsers: 100,
    onlineUsers: 25,
    totalBalance: 50000,
    totalCoins: 89900,
    topUsers: mockUsers
  },
  systemStats: {
    totalGameRevenue: 10000
  },
  liveEvents: []
}

describe('Admin Dashboard Components', () => {
  describe('UserManagement', () => {
    const mockProps = {
      users: mockUsers,
      onUserSelect: jest.fn(),
      onWalletAction: jest.fn(),
      sessionToken: 'test-token'
    }

    test('renders user list correctly', () => {
      render(<UserManagement {...mockProps} />)
      
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
      expect(screen.getByText('₹1,000')).toBeInTheDocument()
    })

    test('filters users by search term', async () => {
      render(<UserManagement {...mockProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search by name or email...')
      fireEvent.change(searchInput, { target: { value: 'test' } })
      
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    test('filters users by tier', () => {
      render(<UserManagement {...mockProps} />)
      
      const tierSelect = screen.getByDisplayValue('All Tiers')
      fireEvent.change(tierSelect, { target: { value: 'Bronze' } })
      
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    test('calls wallet action when button clicked', () => {
      render(<UserManagement {...mockProps} />)
      
      const addCashButton = screen.getByTitle('Add Cash')
      fireEvent.click(addCashButton)
      
      expect(mockProps.onWalletAction).toHaveBeenCalledWith(mockUsers[0], 'cash', 'add')
    })
  })

  describe('WithdrawalManagement', () => {
    const mockProps = {
      withdrawalData: mockWithdrawalData,
      onProcessWithdrawal: jest.fn(),
      onRefresh: jest.fn()
    }

    test('renders pending withdrawals', () => {
      render(<WithdrawalManagement {...mockProps} />)
      
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('₹1,000')).toBeInTheDocument()
      expect(screen.getByText('Approve')).toBeInTheDocument()
      expect(screen.getByText('Reject')).toBeInTheDocument()
    })

    test('calls process withdrawal on approve', () => {
      render(<WithdrawalManagement {...mockProps} />)
      
      const approveButton = screen.getByText('Approve')
      fireEvent.click(approveButton)
      
      expect(mockProps.onProcessWithdrawal).toHaveBeenCalledWith('wd1', 'approved', 'Admin approved')
    })

    test('shows load button when no data', () => {
      render(<WithdrawalManagement {...{ ...mockProps, withdrawalData: null }} />)
      
      expect(screen.getByText('Load Withdrawals')).toBeInTheDocument()
    })
  })

  describe('DashboardStats', () => {
    test('renders statistics correctly', () => {
      render(<DashboardStats adminData={mockAdminData} />)
      
      expect(screen.getByText('100')).toBeInTheDocument() // Total users
      expect(screen.getByText('25 online now')).toBeInTheDocument()
      expect(screen.getByText('₹50,000')).toBeInTheDocument() // Total balance
    })

    test('renders top performers', () => {
      render(<DashboardStats adminData={mockAdminData} />)
      
      expect(screen.getByText('Top Performers')).toBeInTheDocument()
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })
  })
})
