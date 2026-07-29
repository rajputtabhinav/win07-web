// Secure Game Tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSecureGame } from '@/hooks/useSecureGame'
import { renderHook, act } from '@testing-library/react'

// Mock fetch
global.fetch = jest.fn()

describe('Secure Game Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should handle successful game play', async () => {
    const mockResponse = {
      success: true,
      gameResult: {
        outcome: 'win',
        winAmount: 1000,
        gameData: { cards: ['A♠', 'K♥', 'Q♦'] }
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

  test('should handle insufficient balance', async () => {
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

  test('should prevent multiple concurrent games', async () => {
    const { result } = renderHook(() => useSecureGame('teen-patti'))

    // Start first game
    act(() => {
      result.current.playGame(100)
    })

    // Try to start second game while first is in progress
    await act(async () => {
      const gameResult = await result.current.playGame(200)
      expect(gameResult).toBeNull()
    })
  })
})
