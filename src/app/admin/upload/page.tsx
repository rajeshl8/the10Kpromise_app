'use client'
import { useState } from 'react'
import Papa from 'papaparse'
import { supabase } from '../../../lib/supabaseClient'

export default function UploadPage() {
  const [rows, setRows] = useState<any[]>([])
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)

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
          // Map old product names to new ones for backwards compatibility
          let productType = r['Product Type'] || null
          if (productType === 'Will&Trust') productType = 'Legacy Plan'
          if (productType === 'Term Life') productType = 'Financial Security Plan'
          
          return {
            partner_first_name: r['Partner First Name'] || null,
            partner_last_name:  r['Partner Last Name'] || null,
            hgi_partner_id:    r['HGI Partner ID'] || null,
            partner_email:     r['Partner Email'] || null,
            client_state:      r['Client State'] || null,
            product_type:      productType,
            client_source:     r['Source of Client'] || null,
            promise_date:      iso || null,
            family_notes:      r['Family Notes'] || null,
          }
        })
        setRows(cleaned)
        setMsg(`✅ Parsed ${cleaned.length} rows. Ready to upload!`)
      }
    })
  }

  const uploadDirectly = async () => {
    if (rows.length === 0) {
      setMsg('❌ No data to upload')
      return
    }

    setUploading(true)
    setMsg('⏳ Uploading protections...')

    try {
      let successCount = 0
      let errorCount = 0
      let partnersCreated = 0
      const errors: string[] = []

      // Process each row
      for (const row of rows) {
        try {
          // 1. Find or create partner
          let partnerId: string | null = null
          let partnerUserId: string | null = null

          if (row.partner_email) {
            // Try to find partner by email first
            const { data: partnerByEmail } = await supabase
              .from('partners')
              .select('id, user_id')
              .eq('email', row.partner_email)
              .single()

            if (partnerByEmail) {
              partnerId = partnerByEmail.id
              partnerUserId = partnerByEmail.user_id
            }
          }

          if (!partnerId && row.hgi_partner_id) {
            // Try to find by HGI ID
            const { data: partnerByHGI } = await supabase
              .from('partners')
              .select('id, user_id')
              .eq('hgi_partner_id', row.hgi_partner_id)
              .single()

            if (partnerByHGI) {
              partnerId = partnerByHGI.id
              partnerUserId = partnerByHGI.user_id
            }
          }

          // If partner doesn't exist, create them!
          if (!partnerId || !partnerUserId) {
            if (!row.partner_email || !row.hgi_partner_id) {
              errorCount++
              errors.push(`Missing email or HGI ID for partner: ${row.partner_first_name} ${row.partner_last_name}`)
              continue
            }

            // Generate a unique user_id for this admin-created partner
            // When they login with Google later, we'll update this user_id to their real auth user_id
            const tempUserId = crypto.randomUUID()
            
            const { data: newPartner, error: partnerError } = await supabase
              .from('partners')
              .insert({
                user_id: tempUserId,
                email: row.partner_email,
                first_name: row.partner_first_name,
                last_name: row.partner_last_name,
                display_name: `${row.partner_first_name || ''} ${row.partner_last_name || ''}`.trim(),
                hgi_partner_id: row.hgi_partner_id,
                personal_target: 100,
              })
              .select('id, user_id')
              .single()

            if (partnerError || !newPartner) {
              errorCount++
              errors.push(`Failed to create partner ${row.partner_email}: ${partnerError?.message || 'Unknown error'}`)
              continue
            }

            partnerId = newPartner.id
            partnerUserId = newPartner.user_id
            partnersCreated++
          }

          // 2. Validate required fields
          if (!row.client_source) {
            errorCount++
            errors.push(`Missing Source of Client for partner: ${row.partner_email}`)
            continue
          }

          // 3. Insert protection directly
          const { error: insertError } = await supabase
            .from('protections')
            .insert({
              partner_id: partnerId,
              partner_user_id: partnerUserId,
              client_state: row.client_state,
              product_type: row.product_type,
              client_source: row.client_source,
              promise_date: row.promise_date,
              family_notes: row.family_notes,
              status: 'approved',
            })

          if (insertError) {
            errorCount++
            errors.push(`Failed to insert: ${insertError.message}`)
          } else {
            successCount++
          }
        } catch (err: any) {
          errorCount++
          errors.push(`Row error: ${err.message}`)
        }
      }

      // Show results
      if (errorCount === 0) {
        const partnerMsg = partnersCreated > 0 ? ` (${partnersCreated} new partner${partnersCreated > 1 ? 's' : ''} created)` : ''
        setMsg(`🎉 Success! Uploaded ${successCount} protection${successCount > 1 ? 's' : ''}${partnerMsg}.`)
      } else {
        const partnerMsg = partnersCreated > 0 ? `\n✅ Created ${partnersCreated} new partner${partnersCreated > 1 ? 's' : ''}\n` : ''
        setMsg(
          `⚠️ Partial success: ${successCount} uploaded, ${errorCount} failed.${partnerMsg}\n\nErrors:\n${errors.slice(0, 5).join('\n')}${
            errors.length > 5 ? `\n...and ${errors.length - 5} more` : ''
          }`
        )
      }
    } catch (err: any) {
      setMsg(`❌ Upload failed: ${err.message}`)
    } finally {
      setUploading(false)
    }
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
            <p className="mt-2 text-xs text-slate-500">
              ℹ️ Partners will be automatically created if they don't exist. Make sure each row has Email, HGI ID, First Name, and Last Name.
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={uploadDirectly}
              disabled={rows.length === 0 || uploading}
            >
              {uploading ? '⏳ Uploading...' : '🚀 Upload to Production'}
            </button>
          </div>

          {msg && (
            <div className={`p-4 rounded-lg border ${
              msg.includes('❌') || msg.includes('error') || msg.includes('Error')
                ? 'bg-red-50 border-red-200 text-red-800'
                : msg.includes('⚠️')
                ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              <p className="text-sm font-medium whitespace-pre-line">{msg}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
