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

  const onSubmit = async () => {
    if (!partner) return
    startTransition(async () => {
      const { error } = await supabase.from('protections').insert({
        partner_id: partner.id,
        partner_user_id: partner.user_id,
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
                  <option value="Referral">Referral</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Personal">Personal</option>
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
