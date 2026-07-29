"use client"

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              card: "bg-slate-800/90 backdrop-blur-sm border border-slate-700",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-300"
            }
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}
