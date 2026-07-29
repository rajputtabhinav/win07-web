// Secure Games Tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSecureGame } from '@/hooks/useSecureGame'
import { SecureGameWrapper } from '@/components/game/SecureGameWrapper'
import { renderHook, act } from '@testing-library/react'

// Mock Clerk
const mockUser = {
  id: 'test-user-123',
  emailAddresses: [{ emailAddress: 'test@example.com' }]
}

jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isSignedIn: true,
    user: mockUser
  })
}))

describe('Secure Game System', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('useSecureGame Hook', () => {
    test('should handle successful game play', async () => {
      const mockResponse = {
        success: true,
        gameResult: {
          outcome: 'win',
          winAmount: 1000,
          gameData: { result: 'win' }
        },
        balance: {
          cashBalance: 2000,
          bonusBalance: 0,
          indCoins: 899
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { result } = renderHook(() => useSecureGame('teen-patti'))

      await act(async () => {
        const gameResult = await result.current.playGame(500, { gameType: 'teen-patti' })
        expect(gameResult).toEqual(mockResponse.gameResult)
      })

      expect(global.fetch).toHaveBeenCalledWith('/api/game/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: 'teen-patti',
          betAmount: 500,
          gameData: { gameType: 'teen-patti' }
        })
      })
    })

    test('should handle game errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Insufficient balance' })
      })

      const { result } = renderHook(() => useSecureGame('teen-patti'))

      await act(async () => {
        const gameResult = await result.current.playGame(5000)
        expect(gameResult).toBeNull()
      })
    })

    test('should prevent concurrent games', async () => {
      const { result } = renderHook(() => useSecureGame('teen-patti'))

      // Mock a slow API response
      ;(global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, gameResult: {} })
        }), 1000))
      )

      // Start first game
      act(() => {
        result.current.playGame(100)
      })

      // Try to start second game immediately
      await act(async () => {
        const gameResult = await result.current.playGame(200)
        expect(gameResult).toBeNull()
      })
    })
  })

  describe('SecureGameWrapper', () => {
    test('should require authentication', () => {
      // Mock unauthenticated user
      jest.mocked(require('@clerk/nextjs').useUser).mockReturnValue({
        isSignedIn: false,
        user: null
      })

      render(
        <SecureGameWrapper gameName="test-game">
          {() => <div>Game Content</div>}
        </SecureGameWrapper>
      )

      expect(screen.getByText('Authentication Required')).toBeInTheDocument()
      expect(screen.getByText('Please sign in to play test-game')).toBeInTheDocument()
    })

    test('should show loading state', () => {
      // Mock authenticated but loading
      jest.mocked(require('@clerk/nextjs').useUser).mockReturnValue({
        isSignedIn: true,
        user: mockUser
      })

      // Mock balance API to be slow
      ;(global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ cashBalance: 1000 })
        }), 1000))
      )

      render(
        <SecureGameWrapper gameName="test-game">
          {() => <div>Game Content</div>}
        </SecureGameWrapper>
      )

      expect(screen.getByText('Loading test-game...')).toBeInTheDocument()
    })

    test('should render game content when authenticated', async () => {
      // Mock successful balance fetch
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          cashBalance: 1000,
          bonusBalance: 500,
          indCoins: 899
        })
      })

      render(
        <SecureGameWrapper gameName="test-game">
          {({ balance }) => (
            <div>
              <span>Game Content</span>
              <span>Balance: {balance.cashBalance}</span>
            </div>
          )}
        </SecureGameWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Game Content')).toBeInTheDocument()
      })
    })
  })

  describe('Game Security', () => {
    test('should display security indicator', () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ cashBalance: 1000 })
      })

      render(
        <SecureGameWrapper gameName="test-game">
          {() => <div>Game</div>}
        </SecureGameWrapper>
      )

      expect(screen.getByText('Secure Server-Side Gaming')).toBeInTheDocument()
    })

    test('should validate game parameters', async () => {
      const { result } = renderHook(() => useSecureGame('teen-patti'))

      // Test invalid bet amount
      await act(async () => {
        const gameResult = await result.current.playGame(-100)
        expect(gameResult).toBeNull()
      })

      // Test zero bet amount  
      await act(async () => {
        const gameResult = await result.current.playGame(0)
        expect(gameResult).toBeNull()
      })
    })
  })
})
