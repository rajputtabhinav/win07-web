"use client"

import { usePathname } from 'next/navigation'
import { Footer } from './footer'
import { Chatbot } from './chatbot'

interface ClientWrapperProps {
  children: React.ReactNode
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const pathname = usePathname()
  
  // Pages that should NOT show footer
  const noFooterPages = ['/sign-in', '/signup', '/dashboard', '/games']
  
  // Only show chatbot on home page
  const showChatbot = pathname === '/'
  
  // Don't show footer on auth pages and dashboard
  const showFooter = !noFooterPages.some(page => pathname.startsWith(page))

  return (
    <>
      {children}
      {showFooter && <Footer />}
      {showChatbot && <Chatbot />}
    </>
  )
}
