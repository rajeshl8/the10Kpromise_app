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
          
          // Parse protection count (1.0 for full credit, 0.5 for shared credit)
          let protectionCount = 1.0
          const countStr = r['Protection Count']?.toString().trim()
          if (countStr) {
            const parsed = parseFloat(countStr)
            if (!isNaN(parsed) && parsed > 0 && parsed <= 1.0) {
              protectionCount = parsed
            }
          }
          
          return {
            partner_first_name: r['Partner First Name'] || null,
            partner_last_name:  r['Partner Last Name'] || null,
            hgi_partner_id:    r['HGI Partner ID'] || null,
            partner_email:     r['Partner Email'] || null,
            client_state:      r['Client State'] || null,
            product_type:      productType,
            client_source:     r['Source of Client'] || null,
            protection_count:  protectionCount,
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
            // Need at least email OR HGI ID, plus first and last name
            if (!row.partner_email && !row.hgi_partner_id) {
              errorCount++
              errors.push(`Row missing both Email AND HGI ID. Need at least one. Names: ${row.partner_first_name || 'N/A'} ${row.partner_last_name || 'N/A'}`)
              continue
            }

            if (!row.partner_first_name || !row.partner_last_name) {
              errorCount++
              errors.push(`Missing First or Last Name for partner: ${row.partner_email || row.hgi_partner_id || 'Unknown'}`)
              continue
            }

            // Generate email if missing (using HGI ID)
            const partnerEmail = row.partner_email || `${row.hgi_partner_id}@temp.the10kpromise.com`

            // Generate a unique user_id for this admin-created partner
            // When they login with Google later, we'll update this user_id to their real auth user_id
            const tempUserId = crypto.randomUUID()
            
            const { data: newPartner, error: partnerError } = await supabase
              .from('partners')
              .insert({
                user_id: tempUserId,
                email: partnerEmail,
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
              errors.push(`Failed to create partner ${partnerEmail}: ${partnerError?.message || 'Unknown error'}`)
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
              protection_count: row.protection_count,
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
              href="/admin/protections" 
              className="rounded-lg px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-semibold shadow-md"
            >
              📊 View All Protections
            </a>
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
              ℹ️ Partners will be automatically created if they don't exist. <strong>Required:</strong> First Name, Last Name, (Email OR HGI ID), Source of Client.
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

      {/* Preview Section */}
      {rows.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-lg p-8 mt-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>👀</span> Data Preview ({rows.length} rows)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">First Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Last Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Email</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">HGI ID</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">State</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Product</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Source</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className={`hover:bg-slate-50 ${
                    (!row.partner_email && !row.hgi_partner_id) || !row.partner_first_name || !row.partner_last_name || !row.client_source
                      ? 'bg-red-50'
                      : ''
                  }`}>
                    <td className="px-3 py-2 text-slate-700">
                      {row.partner_first_name || <span className="text-red-600">❌ Missing</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.partner_last_name || <span className="text-red-600">❌ Missing</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.partner_email || <span className="text-yellow-600">⚠️ None</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.hgi_partner_id || <span className="text-yellow-600">⚠️ None</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{row.client_state || '—'}</td>
                    <td className="px-3 py-2 text-slate-700">{row.product_type || '—'}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {row.client_source || <span className="text-red-600">❌ Missing</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{row.promise_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 10 && (
              <p className="mt-3 text-sm text-slate-500 text-center">
                Showing first 10 of {rows.length} rows
              </p>
            )}
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Required Fields:</strong> First Name, Last Name, (Email OR HGI ID), Source of Client<br/>
              <strong>Legend:</strong> <span className="text-red-600">❌ Missing (Required)</span> | <span className="text-yellow-600">⚠️ Empty (OK if other ID present)</span> | Red rows will fail
            </p>
          </div>
        </div>
      )}

    </div>
  )
}
