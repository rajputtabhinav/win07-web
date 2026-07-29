import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'WIN07 - India\'s #1 Gaming Platform',
  description: 'Experience the thrill of Aviator and 15+ popular games with guaranteed payouts, instant withdrawals, and 100% secure transactions.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get theme from cookie to prevent hydration mismatch (async for Next.js 15)
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get('theme')?.value
  const initialTheme = themeCookie === 'dark' ? 'dark' : themeCookie === 'light' ? 'light' : undefined

  return (
    <ClerkProvider>
      <html 
        lang="en" 
        className={initialTheme}
        suppressHydrationWarning
      >
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme={themeCookie ?? 'dark'}
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}