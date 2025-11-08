'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { supabase } from '../lib/supabaseClient'
import AddProtectionDialog from '../components/AddProtectionDialog'
import Dashboard from '../components/Dashboard'
import ProfileCompletionModal from '../components/ProfileCompletionModal'
import confetti from 'canvas-confetti'
import logo from './assets/the10kpromiselogo.png'

const GOAL = Number(process.env.NEXT_PUBLIC_GOAL_TOTAL ?? process.env.GOAL_TOTAL ?? '10000')

export default function Page() {
  const [user, setUser] = useState<any>(null)
  const [partner, setPartner] = useState<{ id: string, user_id: string } | null>(null)
  const [partnerData, setPartnerData] = useState<any>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [protectedCount, setProtectedCount] = useState<number | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const prevRemaining = useRef<number | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => { sub.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false)
        return
      }
      const { data } = await supabase.rpc('is_admin')
      setIsAdmin(Boolean(data))
    }
    checkAdmin()
  }, [user])

  useEffect(() => {
    const ensurePartner = async () => {
      if (!user) { 
        setPartner(null)
        setPartnerData(null)
        setShowProfileModal(false)
        return 
      }
      
      const { data: rows } = await supabase.from('partners').select('*').eq('user_id', user.id).limit(1)
      
      if (!rows || rows.length === 0) {
        // Create new partner record with basic info from Google
        await supabase.from('partners').insert({ 
          user_id: user.id, 
          email: user.email, 
          display_name: user.user_metadata?.full_name 
        })
        const { data: again } = await supabase.from('partners').select('*').eq('user_id', user.id).limit(1)
        if (again && again[0]) {
          setPartner({ id: again[0].id, user_id: again[0].user_id })
          setPartnerData(again[0])
          // Check if profile is incomplete
          checkProfileCompletion(again[0])
        }
      } else {
        setPartner({ id: rows[0].id, user_id: rows[0].user_id })
        setPartnerData(rows[0])
        // Check if profile is incomplete
        checkProfileCompletion(rows[0])
      }
    }
    ensurePartner()
  }, [user])

  const checkProfileCompletion = (partnerRecord: any) => {
    // Profile is incomplete if missing first_name, last_name, or hgi_partner_id
    const isIncomplete = !partnerRecord.first_name || 
                        !partnerRecord.last_name || 
                        !partnerRecord.hgi_partner_id
    setShowProfileModal(isIncomplete)
  }

  const handleProfileComplete = async () => {
    // Reload partner data after profile completion
    if (!user) return
    const { data: rows } = await supabase.from('partners').select('*').eq('user_id', user.id).limit(1)
    if (rows && rows[0]) {
      setPartner({ id: rows[0].id, user_id: rows[0].user_id })
      setPartnerData(rows[0])
      setShowProfileModal(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('protection_metrics').select('*').single()
      if (data) setProtectedCount(Number(data.protected_count))
    }
    load()
  }, [])

  useEffect(() => {
    const channel = supabase.channel('realtime:protections')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'protections' }, async () => {
        const { data } = await supabase.from('protection_metrics').select('*').single()
        if (data) setProtectedCount(Number(data.protected_count))
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const remaining = useMemo(() => protectedCount==null? null : Math.max(GOAL - protectedCount, 0), [protectedCount])

  useEffect(() => {
    if (remaining == null) return
    if (prevRemaining.current != null && remaining < prevRemaining.current) {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } })
    }
    prevRemaining.current = remaining
  }, [remaining])

  const signIn = async () => { await supabase.auth.signInWithOAuth({ provider: 'google' }) }
  const signOut = async () => { await supabase.auth.signOut() }

  return (
    <>
      {/* Profile Completion Modal - Shows when profile is incomplete */}
      {showProfileModal && user && (
        <ProfileCompletionModal
          partner={partner}
          displayName={user.user_metadata?.full_name}
          onComplete={handleProfileComplete}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-8">
        <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            The10KPromise
          </h1>
          <div className="flex items-center gap-2">
            {user ? (<>
              <AddProtectionDialog partner={partner} />
              
              {/* Admin Buttons - Only for Admins */}
              {isAdmin && (
                <>
                  <a 
                    href="/admin/partners" 
                    className="hidden sm:inline-block rounded-lg px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
                  >
                    👥 Partners
                  </a>
                  <a 
                    href="/admin/upload" 
                    className="hidden sm:inline-block rounded-lg px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-sm font-medium border border-purple-200"
                  >
                    📁 Upload
                  </a>
                </>
              )}
              
              <button className="rounded-lg px-3 py-2 border border-slate-300 bg-white hover:bg-slate-50 transition-colors" onClick={signOut}>Sign out</button>
            </>) : (
              <button className="rounded-lg px-3 py-2 border border-slate-300 bg-white hover:bg-slate-50 transition-colors" onClick={signIn}>Sign in with Google</button>
            )}
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white shadow-lg p-10 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500 font-semibold">Remaining to protect</p>
          
          {/* Big Counter with Logo */}
          <div className="mt-6 flex items-center justify-center gap-8 sm:gap-12">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image 
                src={logo} 
                alt="The10KPromise Logo" 
                width={200} 
                height={200}
                className="w-32 h-32 sm:w-48 sm:h-48 lg:w-56 lg:h-56 object-contain drop-shadow-2xl"
                priority
              />
            </div>
            
            {/* Count */}
            <div className="sm:text-[8rem] text-[14vw] leading-none font-extrabold tabular-nums bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {remaining == null ? '—' : remaining.toLocaleString()}
            </div>
          </div>
          
          <p className="mt-6 text-slate-600">Out of a goal of {GOAL.toLocaleString()} families in 12 months.</p>
        </div>

        {user && (
          <div className="mt-10">
            <Dashboard partner={partner} />
          </div>
        )}
        </div>
      </div>
    </>
  )
}
