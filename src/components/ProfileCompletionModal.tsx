'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

interface ProfileCompletionModalProps {
  partner: { id: string, user_id: string } | null
  displayName?: string
  onComplete: () => void
}

// Helper function to split display name
function splitDisplayName(displayName: string): { firstName: string, lastName: string } {
  if (!displayName) return { firstName: '', lastName: '' }
  
  const parts = displayName.trim().split(' ')
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }
  
  const firstName = parts[0]
  const lastName = parts.slice(1).join(' ')
  return { firstName, lastName }
}

export default function ProfileCompletionModal({ partner, displayName, onComplete }: ProfileCompletionModalProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [hgiPartnerId, setHgiPartnerId] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Auto-populate first and last names from display name
    if (displayName) {
      const { firstName: fn, lastName: ln } = splitDisplayName(displayName)
      setFirstName(fn)
      setLastName(ln)
    }
  }, [displayName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!firstName.trim()) {
      setError('First name is required')
      return
    }
    if (!lastName.trim()) {
      setError('Last name is required')
      return
    }
    if (!hgiPartnerId.trim()) {
      setError('HGI Partner ID is required')
      return
    }

    if (!partner) return

    setIsSubmitting(true)

    try {
      // Update partner record with complete information
      const { error: updateError } = await supabase
        .from('partners')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          hgi_partner_id: hgiPartnerId.trim().toUpperCase(), // Store in uppercase for consistency
        })
        .eq('user_id', partner.user_id)

      if (updateError) {
        // Check if it's a unique constraint violation
        if (updateError.message.includes('hgi_partner_id') || updateError.code === '23505') {
          setError('This HGI Partner ID is already in use. Please check and try again.')
        } else {
          setError(updateError.message)
        }
        setIsSubmitting(false)
        return
      }

      // Success! Call the completion callback
      onComplete()
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <span className="text-3xl">👋</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to The10KPromise!</h2>
          <p className="text-slate-600">Please complete your profile to get started</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Smith"
              required
            />
          </div>

          {/* HGI Partner ID */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              HGI Partner ID *
            </label>
            <input
              type="text"
              value={hgiPartnerId}
              onChange={(e) => setHgiPartnerId(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              placeholder="HGI12345"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Your unique HGI Partner identifier</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-xs text-center text-slate-500 mt-4">
          * All fields are required to access your dashboard
        </p>
      </div>
    </div>
  )
}

