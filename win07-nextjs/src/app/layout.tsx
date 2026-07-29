import { Inter } from 'next/font/google'
import './globals.css'
import '../styles/clerk.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ClerkProvider } from '@clerk/nextjs'
import { WalletProvider } from '@/contexts/wallet-context'
import { LiveNotifications } from '@/components/live-notifications'
import { ClientWrapper } from '@/components/client-wrapper'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'WIN07 - India\'s #1 Gaming Platform',
  description: 'Experience the thrill of Aviator and 15+ popular games with guaranteed payouts, instant withdrawals, and 100% secure transactions.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      className="dark"
      suppressHydrationWarning
    >
      <body className={inter.className}>
        <ErrorBoundary>
          <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            appearance={{
              baseTheme: undefined,
              layout: {
                unsafe_disableDevelopmentModeWarnings: true,
                logoImageUrl: '/favicon.ico',
                logoLinkUrl: '/',
                logoPlacement: 'inside',
                socialButtonsPlacement: 'top',
                socialButtonsVariant: 'blockButton',
                showOptionalFields: true
              },
            variables: {
              colorPrimary: '#8B5CF6',
              colorBackground: '#0F172A',
              colorInput: '#1E293B',
              colorInputForeground: '#F8FAFC',
              colorForeground: '#F8FAFC',
              colorMutedForeground: '#CBD5E1',
              colorNeutral: '#64748B',
              colorDanger: '#EF4444',
              colorSuccess: '#10B981',
              colorWarning: '#F59E0B',
              borderRadius: '0.75rem',
              fontFamily: 'Inter, sans-serif'
            },
            elements: {
              formButtonPrimary: {
                background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                }
              },
              card: {
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
              },
              headerTitle: {
                color: '#F8FAFC',
                fontSize: '1.75rem',
                fontWeight: '700',
                textAlign: 'center'
              },
              headerSubtitle: {
                color: '#CBD5E1',
                textAlign: 'center'
              },
              socialButtonsBlockButton: {
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                color: '#F8FAFC',
                '&:hover': {
                  background: 'rgba(51, 65, 85, 0.8)'
                }
              },
              formFieldInput: {
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                color: '#F8FAFC',
                '&:focus': {
                  borderColor: '#8B5CF6',
                  boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)'
                }
              },
              footerAction: {
                '& > a': {
                  color: '#8B5CF6',
                  '&:hover': {
                    color: '#7C3AED'
                  }
                }
              },
              identityPreviewText: {
                color: '#CBD5E1'
              },
              identityPreviewEditButton: {
                color: '#8B5CF6'
              }
            }
          }}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <WalletProvider>
              <ClientWrapper>
                {children}
              </ClientWrapper>
              <LiveNotifications />
              <Toaster />
            </WalletProvider>
          </ThemeProvider>
        </ClerkProvider>
        </ErrorBoundary>
        
        {/* Hide React DevTools message, Clerk warnings, and other dev messages */}
        <Script id="hide-dev-messages" strategy="beforeInteractive">
          {`
            if (typeof window !== 'undefined') {
              // Disable React DevTools hook
              window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { isDisabled: true };
              
              // Override console methods to filter development messages
              const originalConsoleLog = console.log;
              const originalConsoleWarn = console.warn;
              const originalConsoleError = console.error;
              
              console.log = function(...args) {
                const message = args.join(' ');
                if (!message.includes('Download the React DevTools') && 
                    !message.includes('Clerk has been loaded with development keys') &&
                    !message.includes('Audio failed to load')) {
                  originalConsoleLog.apply(console, args);
                }
              };
              
              console.warn = function(...args) {
                const message = args.join(' ');
                if (!message.includes('Clerk') && 
                    !message.includes('development keys') &&
                    !message.includes('strict usage limits')) {
                  originalConsoleWarn.apply(console, args);
                }
              };
              
              console.error = function(...args) {
                const message = args.join(' ');
                if (!message.includes('Failed to load resource') &&
                    !message.includes('audio')) {
                  originalConsoleError.apply(console, args);
                }
              };
            }
          `}
        </Script>
      </body>
    </html>
  )
}