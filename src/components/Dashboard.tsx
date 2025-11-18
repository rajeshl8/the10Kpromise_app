'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import AddProtectionDialog from './AddProtectionDialog'

interface PartnerStats {
  id: string
  user_id: string
  full_name: string
  personal_target: number
  completed_count: number
}

interface LeaderboardEntry {
  id: string
  name: string
  personal_target: number
  completed_count: number
  completion_percentage: number
}

type DateFilter = 'all' | '7days' | '30days' | 'custom'

export default function Dashboard({ partner }: { partner: { id: string, user_id: string } | null }) {
  const [stats, setStats] = useState<PartnerStats | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [editingTarget, setEditingTarget] = useState(false)
  const [newTarget, setNewTarget] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [showCustomDates, setShowCustomDates] = useState(false)

  useEffect(() => {
    if (!partner) return
    loadStats()
    loadLeaderboard()
    checkAdmin()
  }, [partner])

  useEffect(() => {
    loadLeaderboard()
  }, [dateFilter, customStartDate, customEndDate])

  useEffect(() => {
    // Subscribe to realtime changes
    const channel = supabase.channel('dashboard:updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'protections' }, () => {
        loadStats()
        loadLeaderboard()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partners' }, () => {
        loadStats()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [partner])

  const loadStats = async () => {
    if (!partner) return
    const { data } = await supabase
      .from('partner_stats')
      .select('*')
      .eq('user_id', partner.user_id)
      .single()
    if (data) setStats(data)
  }

  const loadLeaderboard = async () => {
    let startDate: string | null = null
    let endDate: string | null = null

    const today = new Date()
    
    if (dateFilter === '7days') {
      const date7DaysAgo = new Date(today)
      date7DaysAgo.setDate(today.getDate() - 7)
      startDate = date7DaysAgo.toISOString().split('T')[0]
      endDate = today.toISOString().split('T')[0]
    } else if (dateFilter === '30days') {
      const date30DaysAgo = new Date(today)
      date30DaysAgo.setDate(today.getDate() - 30)
      startDate = date30DaysAgo.toISOString().split('T')[0]
      endDate = today.toISOString().split('T')[0]
    } else if (dateFilter === 'custom') {
      startDate = customStartDate || null
      endDate = customEndDate || null
    }

    const { data } = await supabase.rpc('get_leaderboard_filtered', {
      start_date: startDate,
      end_date: endDate,
      limit_count: 10
    })
    
    if (data) setLeaderboard(data)
  }

  const checkAdmin = async () => {
    const { data } = await supabase.rpc('is_admin')
    setIsAdmin(Boolean(data))
  }

  const updateTarget = async () => {
    if (!partner || !newTarget) return
    const targetNum = parseInt(newTarget)
    if (isNaN(targetNum) || targetNum < 1) return
    
    await supabase
      .from('partners')
      .update({ personal_target: targetNum })
      .eq('user_id', partner.user_id)
    
    setEditingTarget(false)
    setNewTarget('')
    loadStats()
  }

  if (!stats) return <div className="text-center py-8">Loading dashboard...</div>

  const progressPercentage = stats.personal_target > 0 
    ? Math.min((stats.completed_count / stats.personal_target) * 100, 100)
    : 0

  const isCurrentUser = (userId: string) => userId === partner?.user_id

  const firstName = stats.full_name?.split(' ')[0] || 'Partner'

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Personal Stats Card */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Welcome, {firstName}! 👋
              </h2>
              <p className="text-sm text-slate-600 mt-1">Track your accomplishments</p>
            </div>
            <AddProtectionDialog 
              partner={partner} 
              onSuccess={() => {
                loadStats()
                loadLeaderboard()
              }}
            />
          </div>

          {/* Completed Count - Centered */}
          <div className="max-w-md mx-auto mt-6">
            <div className="text-center p-8 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 shadow-sm">
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">Families Protected</p>
              <p className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {stats.completed_count}
              </p>
              <p className="text-sm text-slate-600 mt-3">Keep up the great work!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="lg:col-span-1">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 sticky top-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏆</span>
            <h2 className="text-xl font-bold text-slate-900">Leaderboard</h2>
          </div>
          <p className="text-sm text-slate-600 mb-3">Most families protected</p>

          {/* Date Filter Dropdown */}
          <div className="mb-4">
            <select 
              value={dateFilter}
              onChange={(e) => {
                const value = e.target.value as DateFilter
                setDateFilter(value)
                setShowCustomDates(value === 'custom')
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
            
            {/* Custom Date Range Inputs */}
            {showCustomDates && (
              <div className="mt-2 space-y-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  placeholder="Start Date"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  placeholder="End Date"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            {leaderboard.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No data yet</p>
            ) : (
              leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isCurrentUser(entry.id) 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200' 
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-slate-300 text-slate-700' :
                    index === 2 ? 'bg-orange-400 text-orange-900' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${
                      isCurrentUser(entry.id) ? 'text-blue-900' : 'text-slate-900'
                    }`}>
                      {entry.name}
                      {isCurrentUser(entry.id) && <span className="ml-1 text-blue-600">(You)</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {entry.completed_count}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

