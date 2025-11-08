'use client'
import { useState } from 'react'
import Papa from 'papaparse'
import { supabase } from '../../../lib/supabaseClient'

export default function UploadPage() {
  const [rows, setRows] = useState<any[]>([])
  const [msg, setMsg] = useState('')

  const onFile = (file: File) => {
    setMsg('Parsing…')
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const cleaned = (res.data as any[]).map((r) => {
          const d = (r['Promise Date'] || '').toString().trim()
          let iso = ''
          if (/^\d{4}-\d{2}-\d{2}$/.test(d)) iso = d
          else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(d)) {
            const [m,n,y] = d.split('/')
            const yy = y.length === 2 ? ('20'+y) : y
            const mm = m.padStart(2, '0')
            const dd = n.padStart(2, '0')
            iso = `${yy.padStart(4, '0')}-${mm}-${dd}`
          }
          return {
            partner_first_name: r['Partner First Name'] || null,
            partner_last_name:  r['Partner Last Name'] || null,
            hgi_partner_id:    r['HGI Partner ID'] || null,
            partner_email:     r['Partner Email'] || null,
            client_state:      r['Client State'] || null,
            product_type:      r['Product Type'] || null,
            promise_date:      iso || null,
            family_notes:      r['Family Notes'] || null,
          }
        })
        setRows(cleaned)
        setMsg(`Parsed ${cleaned.length} rows. Click "Upload to staging".`)
      }
    })
  }

  const upload = async () => {
    setMsg('Uploading…')
    const { error } = await supabase.from('staging_protections').insert(rows)
    setMsg(error ? 'Upload error: '+error.message : 'Uploaded to staging. Now click "Promote to production".')
  }

  const promote = async () => {
    setMsg('Promoting…')
    const { data, error } = await supabase.rpc('promote_staging_protections')
    setMsg(error ? 'Promote error: '+error.message : `Promoted. Inserted count: ${JSON.stringify(data)}`)
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
            <p className="text-slate-600">Upload and manage protection records</p>
          </div>
          <div className="flex gap-2">
            <a 
              href="/admin/partners" 
              className="rounded-lg px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              Manage Partners
            </a>
            <a 
              href="/" 
              className="rounded-lg px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📁</span>
            <h2 className="text-xl font-bold text-slate-900">Upload</h2>
          </div>
          <a 
            href="/sample-upload.csv"
            download="The10KPromise-Sample.csv"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
          >
            📥 Download Sample CSV
          </a>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select CSV File
            </label>
            <input 
              type="file" 
              accept=".csv" 
              onChange={e=>e.target.files && onFile(e.target.files[0])}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          <div className="flex gap-3">
            <button 
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors font-medium" 
              onClick={upload}
              disabled={rows.length === 0}
            >
              1. Upload to Staging
            </button>
            <button 
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md" 
              onClick={promote}
            >
              2. Promote to Production
            </button>
          </div>

          {msg && (
            <div className={`p-4 rounded-lg border ${
              msg.includes('error') || msg.includes('Error')
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              <p className="text-sm font-medium">{msg}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
