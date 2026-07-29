// Jest Setup for WIN07 Gaming Platform
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    },
  }),
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'test-user-id',
  }),
  SignInButton: ({ children }) => children,
  SignUpButton: ({ children }) => children,
}))

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/win07gaming-test'
process.env.ADMIN_PASSWORD = 'test-password'
process.env.ADMIN_JWT_SECRET = 'test-jwt-secret-32-characters-long'

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})
