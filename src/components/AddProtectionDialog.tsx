'use client'
import { useState, useTransition } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AddProtectionDialog({ 
  partner,
  onSuccess
}: { 
  partner: { id: string, user_id: string } | null
  onSuccess?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [state, setState] = useState('')
  const [product, setProduct] = useState('')
  const [source, setSource] = useState('')
  const [date, setDate] = useState('')
  const [isPending, startTransition] = useTransition()
  
  // State for "on behalf of" feature
  const [isOnBehalfOf, setIsOnBehalfOf] = useState(false)
  const [otherPartnerName, setOtherPartnerName] = useState('')
  const [otherPartnerCode, setOtherPartnerCode] = useState('')
  const [lookupError, setLookupError] = useState('')

  const onSubmit = async () => {
    if (!partner) return
    
    let targetPartnerId = partner.id
    let targetPartnerUserId = partner.user_id
    
    // If entering on behalf of another partner, look them up or create them
    if (isOnBehalfOf) {
      if (!otherPartnerCode.trim()) {
        setLookupError('Partner Code is required')
        return
      }
      
      // Try to find existing partner
      const { data: otherPartner, error: lookupErr } = await supabase
        .from('partners')
        .select('id, user_id')
        .eq('hgi_partner_id', otherPartnerCode.trim())
        .single()
      
      if (otherPartner) {
        // Partner exists, use their details
        targetPartnerId = otherPartner.id
        targetPartnerUserId = otherPartner.user_id
        setLookupError('')
      } else {
        // Partner not found - create them as a junior partner
        if (!otherPartnerName.trim()) {
          setLookupError('Partner not found. Please provide Partner Name to create a new entry.')
          return
        }
        
        // Parse name (simple split by space)
        const nameParts = otherPartnerName.trim().split(' ')
        const firstName = nameParts[0]
        const lastName = nameParts.slice(1).join(' ') || firstName
        
        // Create new junior partner with placeholder user_id
        const { data: newPartner, error: createErr } = await supabase
          .from('partners')
          .insert({
            user_id: crypto.randomUUID(), // Placeholder user_id (not linked to auth)
            email: `${otherPartnerCode.toLowerCase()}@junior.placeholder`,
            first_name: firstName,
            last_name: lastName,
            hgi_partner_id: otherPartnerCode.trim(),
            personal_target: 100
          })
          .select('id, user_id')
          .single()
        
        if (createErr || !newPartner) {
          setLookupError('Failed to create partner: ' + (createErr?.message || 'Unknown error'))
          return
        }
        
        targetPartnerId = newPartner.id
        targetPartnerUserId = newPartner.user_id
        setLookupError('')
      }
    }
    
    startTransition(async () => {
      const { error } = await supabase.from('protections').insert({
        partner_id: targetPartnerId,
        partner_user_id: targetPartnerUserId,
        family_notes: notes || null,
        client_state: state || null,
        product_type: product || null,
        client_source: source || null,
        promise_date: date || null,
        status: 'approved',
      })
      if (!error) { 
        setOpen(false)
        setNotes('')
        setState('')
        setProduct('')
        setSource('')
        setDate('')
        setIsOnBehalfOf(false)
        setOtherPartnerName('')
        setOtherPartnerCode('')
        setLookupError('')
        // Call onSuccess callback to refresh dashboard
        if (onSuccess) onSuccess()
      } else {
        alert(error.message)
      }
    })
  }

  return (
    <>
      <button onClick={()=>setOpen(true)} className="rounded-lg px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg">+ Protect Family</button>
      {open && (
        <div className="fixed inset-0 grid place-items-center bg-black/50 backdrop-blur-sm p-4 z-50" onClick={()=>setOpen(false)}>
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl p-6" onClick={e=>e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-slate-900">Log a protected family</h3>
            <div className="grid gap-4">
              
              {/* On Behalf Of Toggle */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <input 
                  type="checkbox" 
                  id="onBehalfOf"
                  checked={isOnBehalfOf}
                  onChange={(e) => {
                    setIsOnBehalfOf(e.target.checked)
                    setLookupError('')
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="onBehalfOf" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Enter entry for another Partner?
                </label>
              </div>

              {/* Other Partner Fields (conditional) */}
              {isOnBehalfOf && (
                <div className="grid gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Other Partner Details</p>
                  <input 
                    className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="Partner Name (optional)" 
                    value={otherPartnerName} 
                    onChange={e => setOtherPartnerName(e.target.value)} 
                  />
                  <input 
                    className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="Partner Code (HGI Partner ID) *" 
                    value={otherPartnerCode} 
                    onChange={e => {
                      setOtherPartnerCode(e.target.value)
                      setLookupError('')
                    }} 
                  />
                  {lookupError && (
                    <p className="text-sm text-red-600 font-medium">{lookupError}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <select 
                  className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" 
                  value={state} 
                  onChange={e=>setState(e.target.value)}
                >
                  <option value="">Client State</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
                  <option value="DC">Washington DC</option>
                </select>
                <input 
                  type="date" 
                  className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={date} 
                  onChange={e=>setDate(e.target.value)} 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select 
                  className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" 
                  value={product} 
                  onChange={e=>setProduct(e.target.value)}
                >
                  <option value="">Product Type</option>
                  <option value="Legacy Plan">Legacy Plan</option>
                  <option value="Financial Security Plan">Financial Security Plan</option>
                </select>
                <select 
                  className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" 
                  value={source} 
                  onChange={e=>setSource(e.target.value)}
                >
                  <option value="">Source of Client</option>
                  <option value="Personal">Personal</option>
                  <option value="Friends & Family">Friends & Family</option>
                  <option value="Neighbor">Neighbor</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Stall/Event/Booth/Webinar">Stall/Event/Booth/Webinar</option>
                </select>
              </div>
              <input 
                className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Notes (optional)" 
                value={notes} 
                onChange={e=>setNotes(e.target.value)} 
              />
              <div className="flex justify-end gap-2 mt-2">
                <button 
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium" 
                  onClick={()=>setOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={isPending} 
                  onClick={onSubmit}
                >
                  {isPending?'Saving…':'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
