// Wallet Integration Tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WalletProvider, useWallet } from '@/contexts/wallet-context'
import { renderHook } from '@testing-library/react'

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    user: {
      id: 'test-user-123',
      emailAddresses: [{ emailAddress: 'test@example.com' }]
    }
  })
}))

// Mock API responses
const mockBalanceResponse = {
  cashBalance: 1000,
  bonusBalance: 500,
  indCoins: 899,
  user: {
    totalWinnings: 2000,
    totalLosses: 1500,
    gamesPlayed: 10,
    tier: 'Bronze'
  }
}

describe('Wallet Integration', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockClear()
  })

  test('should initialize wallet data on mount', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBalanceResponse)
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WalletProvider>{children}</WalletProvider>
    )

    const { result } = renderHook(() => useWallet(), { wrapper })

    await waitFor(() => {
      expect(result.current.cashBalance).toBe(1000)
      expect(result.current.bonusBalance).toBe(500)
      expect(result.current.indCoins).toBe(899)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/wallet/balance')
  })

  test('should handle deposit successfully', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBalanceResponse)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          cashBalance: 1500,
          bonusBalance: 500,
          indCoins: 899
        })
      })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WalletProvider>{children}</WalletProvider>
    )

    const { result } = renderHook(() => useWallet(), { wrapper })

    await waitFor(() => {
      expect(result.current.cashBalance).toBe(1000)
    })

    await act(async () => {
      const success = await result.current.deposit(500)
      expect(success).toBe(true)
    })

    expect(global.fetch).toHaveBeenLastCalledWith('/api/wallet/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 500 })
    })
  })

  test('should handle withdrawal with validation', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBalanceResponse)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          cashBalance: 500,
          bonusBalance: 500,
          indCoins: 899,
          message: 'Withdrawal request submitted'
        })
      })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WalletProvider>{children}</WalletProvider>
    )

    const { result } = renderHook(() => useWallet(), { wrapper })

    await waitFor(() => {
      expect(result.current.cashBalance).toBe(1000)
    })

    await act(async () => {
      const success = await result.current.withdraw(500, 'upi', { upiId: 'test@upi' })
      expect(success).toBe(true)
    })

    expect(global.fetch).toHaveBeenLastCalledWith('/api/wallet/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 500,
        method: 'upi',
        accountDetails: { upiId: 'test@upi' }
      })
    })
  })

  test('should validate insufficient balance', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ cashBalance: 100, bonusBalance: 0, indCoins: 899 })
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WalletProvider>{children}</WalletProvider>
    )

    const { result } = renderHook(() => useWallet(), { wrapper })

    await waitFor(() => {
      expect(result.current.canAfford(500)).toBe(false)
    })
  })

  test('should format currency correctly', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WalletProvider>{children}</WalletProvider>
    )

    const { result } = renderHook(() => useWallet(), { wrapper })

    expect(result.current.formatCurrency(1000)).toBe('₹1,000')
    expect(result.current.formatCurrency(50000)).toBe('₹50,000')
  })
})
