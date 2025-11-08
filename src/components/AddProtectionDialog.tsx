'use client'
import { useState, useTransition } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AddProtectionDialog({ partner }: { partner: { id: string, user_id: string } | null }) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [state, setState] = useState('')
  const [product, setProduct] = useState('')
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
        promise_date: date || null,
        status: 'approved',
      })
      if (!error) { setOpen(false); setNotes(''); setState(''); setProduct(''); setDate('') }
      else alert(error.message)
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
              <div className="grid grid-cols-3 gap-3">
                <input 
                  className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Client State" 
                  value={state} 
                  onChange={e=>setState(e.target.value)} 
                />
                <select 
                  className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" 
                  value={product} 
                  onChange={e=>setProduct(e.target.value)}
                >
                  <option value="">Product Type</option>
                  <option value="Will&Trust">Will&Trust</option>
                  <option value="Term Life">Term Life</option>
                </select>
                <input 
                  type="date" 
                  className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={date} 
                  onChange={e=>setDate(e.target.value)} 
                />
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
