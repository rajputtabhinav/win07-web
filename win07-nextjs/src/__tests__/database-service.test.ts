// Database Service Tests
import { databaseService } from '@/lib/database-service'

// Mock MongoDB connection
jest.mock('@/lib/mongodb', () => ({
  connectMongoose: jest.fn().mockResolvedValue({}),
}))

// Mock models
jest.mock('@/models', () => ({
  User: {
    findByClerkId: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
  Transaction: {
    findByClerkUserId: jest.fn(),
    aggregate: jest.fn(),
  },
  Withdrawal: {
    getPendingWithdrawals: jest.fn(),
    findById: jest.fn(),
  },
}))

describe('DatabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Management', () => {
    test('should get user by clerk ID', async () => {
      const mockUser = { clerkUserId: 'test-123', name: 'Test User' }
      require('@/models').User.findByClerkId.mockResolvedValue(mockUser)

      const result = await databaseService.getUser('test-123')
      
      expect(result).toEqual(mockUser)
      expect(require('@/models').User.findByClerkId).toHaveBeenCalledWith('test-123')
    })

    test('should create new user with default values', async () => {
      const userData = {
        clerkUserId: 'new-user-123',
        email: 'test@example.com',
        name: 'New User'
      }

      const mockSave = jest.fn().mockResolvedValue({ ...userData, _id: 'mongo-id' })
      require('@/models').User.mockImplementation(() => ({
        save: mockSave
      }))

      const result = await databaseService.createUser(userData)
      
      expect(mockSave).toHaveBeenCalled()
    })

    test('should update user balance correctly', async () => {
      const mockUser = {
        clerkUserId: 'test-123',
        cashBalance: 1000,
        save: jest.fn().mockResolvedValue({})
      }
      
      require('@/models').User.findOne.mockResolvedValue(mockUser)

      await databaseService.updateUserWallet(
        'test-123',
        500,
        'add',
        'cash',
        'Test deposit',
        'admin-123'
      )

      expect(mockUser.cashBalance).toBe(1500)
    })
  })

  describe('Transaction Management', () => {
    test('should create transaction with proper data', async () => {
      const transactionData = {
        userId: 'user-123',
        clerkUserId: 'clerk-123',
        type: 'deposit',
        amount: 1000,
        walletType: 'cash',
        description: 'Test deposit'
      }

      const mockSave = jest.fn().mockResolvedValue({ ...transactionData, _id: 'txn-id' })
      require('@/models').Transaction.mockImplementation(() => ({
        save: mockSave
      }))

      await databaseService.createTransaction(transactionData)
      
      expect(mockSave).toHaveBeenCalled()
    })
  })

  describe('Admin Statistics', () => {
    test('should calculate admin stats correctly', async () => {
      // Mock aggregation results
      require('@/models').User.countDocuments
        .mockResolvedValueOnce(100) // total users
        .mockResolvedValueOnce(25)  // active users
        .mockResolvedValueOnce(5)   // today registrations

      require('@/models').Transaction.aggregate
        .mockResolvedValueOnce([{ total: 50000 }]) // deposits
        .mockResolvedValueOnce([{ total: 10000 }]) // withdrawals

      const stats = await databaseService.calculateAdminStats()

      expect(stats.totalUsers).toBe(100)
      expect(stats.activeUsers).toBe(25)
      expect(stats.totalDeposits).toBe(50000)
      expect(stats.totalWithdrawals).toBe(10000)
    })
  })
})
