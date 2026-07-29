import { useUser } from '@clerk/nextjs'
import { useWallet } from '@/contexts/wallet-context'

interface AdminUser {
  isAdmin: boolean
  adminLevel: 'none' | 'moderator' | 'admin' | 'super_admin'
  hasAdminAccess: boolean
}

export function useAdmin(): AdminUser {
  const { user } = useUser()
  const wallet = useWallet()

  // Get admin emails from environment (client-side check for UI only)
  // Server-side validation happens in middleware
  const adminEmails = [
    'admin@win07pro.com',
    'abhinavrajput2424@gmail.com'
  ]

  const superAdminEmails = [
    'admin@win07pro.com'
  ]

  const userEmail = user?.emailAddresses[0]?.emailAddress

  // Check admin status
  const isAdmin = Boolean(
    userEmail && (
      adminEmails.includes(userEmail) ||
      superAdminEmails.includes(userEmail) ||
      user?.id === 'admin' ||
      wallet.getUserTier().name === 'Grandmaster'
    )
  )

  // Determine admin level
  let adminLevel: AdminUser['adminLevel'] = 'none'
  
  if (userEmail && superAdminEmails.includes(userEmail)) {
    adminLevel = 'super_admin'
  } else if (userEmail && adminEmails.includes(userEmail)) {
    adminLevel = 'admin'
  } else if (wallet.getUserTier().name === 'Grandmaster') {
    adminLevel = 'moderator'
  }

  return {
    isAdmin,
    adminLevel,
    hasAdminAccess: isAdmin
  }
}
