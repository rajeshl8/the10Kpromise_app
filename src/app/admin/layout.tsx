'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Not logged in, redirect to home
        router.push('/')
        return
      }

      // Check if user is admin
      const { data, error } = await supabase.rpc('is_admin')
      
      if (error || !data) {
        // Not an admin, redirect to home
        router.push('/')
        return
      }

      setIsAdmin(true)
    } catch (error) {
      console.error('Admin check failed:', error)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Show nothing if not admin (will redirect)
  if (!isAdmin) {
    return null
  }

  // Render admin content
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {children}
    </div>
  )
}

