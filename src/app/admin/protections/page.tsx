'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import Link from 'next/link'

interface Protection {
  id: string
  protection_id: string
  partner_id: string
  client_state: string
  product_type: string
  client_source: string
  promise_date: string
  family_notes: string
  status: string
  created_at: string
  partners: {
    display_name: string
    first_name: string
    last_name: string
    email: string
    hgi_partner_id: string
  }
}

export default function AdminProtectionsPage() {
  const [protections, setProtections] = useState<Protection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPartner, setFilterPartner] = useState('')
  const [filterProduct, setFilterProduct] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [filterState, setFilterState] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [partners, setPartners] = useState<any[]>([])
  
  const PAGE_SIZE = 50

  useEffect(() => {
    loadPartners()
    loadProtections()
  }, [currentPage, filterPartner, filterProduct, filterSource, filterState])

  const loadPartners = async () => {
    const { data } = await supabase
      .from('partners')
      .select('id, display_name, first_name, last_name, hgi_partner_id')
      .order('display_name')
    
    if (data) setPartners(data)
  }

  const loadProtections = async () => {
    setLoading(true)
    
    let query = supabase
      .from('protections')
      .select(`
        *,
        partners (
          display_name,
          first_name,
          last_name,
          email,
          hgi_partner_id
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (filterPartner) query = query.eq('partner_id', filterPartner)
    if (filterProduct) query = query.eq('product_type', filterProduct)
    if (filterSource) query = query.eq('client_source', filterSource)
    if (filterState) query = query.eq('client_state', filterState)

    // Pagination
    const from = (currentPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (!error && data) {
      setProtections(data as Protection[])
      setTotalCount(count || 0)
    }
    
    setLoading(false)
  }

  // Client-side search filtering
  const filteredProtections = protections.filter(p => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    const partnerName = p.partners?.display_name || 
                       `${p.partners?.first_name || ''} ${p.partners?.last_name || ''}`.trim()
    const hgiId = p.partners?.hgi_partner_id || ''
    const notes = p.family_notes || ''
    const protectionId = p.protection_id || ''
    
    return (
      partnerName.toLowerCase().includes(term) ||
      hgiId.toLowerCase().includes(term) ||
      notes.toLowerCase().includes(term) ||
      protectionId.toLowerCase().includes(term) ||
      p.client_state?.toLowerCase().includes(term)
    )
  })

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const clearFilters = () => {
    setFilterPartner('')
    setFilterProduct('')
    setFilterSource('')
    setFilterState('')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const exportToCSV = () => {
    const headers = [
      'Protection ID',
      'Partner Name',
      'HGI ID',
      'Partner Email',
      'Client State',
      'Product Type',
      'Source',
      'Promise Date',
      'Status',
      'Notes',
      'Created At'
    ]
    
    const rows = filteredProtections.map(p => [
      p.protection_id,
      p.partners?.display_name || `${p.partners?.first_name || ''} ${p.partners?.last_name || ''}`.trim(),
      p.partners?.hgi_partner_id || '',
      p.partners?.email || '',
      p.client_state || '',
      p.product_type || '',
      p.client_source || '',
      p.promise_date || '',
      p.status || '',
      (p.family_notes || '').replace(/"/g, '""'),
      new Date(p.created_at).toLocaleString()
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `protections-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">All Protections</h1>
            <p className="text-slate-600 mt-1">View and manage all protection records</p>
          </div>
          <Link 
            href="/"
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredProtections.length}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalCount}</span> total protections
          </div>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
          >
            📥 Export to CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Filters</h3>
          {(filterPartner || filterProduct || filterSource || filterState || searchTerm) && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Search by name, ID, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Partner Filter */}
          <select
            value={filterPartner}
            onChange={(e) => { setFilterPartner(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Partners</option>
            {partners.map(p => (
              <option key={p.id} value={p.id}>
                {p.display_name || `${p.first_name || ''} ${p.last_name || ''}`.trim()} 
                {p.hgi_partner_id && ` (${p.hgi_partner_id})`}
              </option>
            ))}
          </select>

          {/* Product Type Filter */}
          <select
            value={filterProduct}
            onChange={(e) => { setFilterProduct(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Product Types</option>
            <option value="Legacy Plan">Legacy Plan</option>
            <option value="Financial Security Plan">Financial Security Plan</option>
          </select>

          {/* Source Filter */}
          <select
            value={filterSource}
            onChange={(e) => { setFilterSource(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Sources</option>
            <option value="Referral">Referral</option>
            <option value="Social Media">Social Media</option>
            <option value="Personal">Personal</option>
            <option value="Stall/Event/Booth/Webinar">Stall/Event/Booth/Webinar</option>
          </select>

          {/* State Filter */}
          <select
            value={filterState}
            onChange={(e) => { setFilterState(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All States</option>
            <option value="CA">California</option>
            <option value="TX">Texas</option>
            <option value="NY">New York</option>
            <option value="FL">Florida</option>
            <option value="IL">Illinois</option>
            {/* Add more states as needed */}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading protections...</p>
          </div>
        ) : filteredProtections.length === 0 ? (
          <div className="p-12 text-center text-slate-600">
            No protections found matching your criteria.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Partner</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">State</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredProtections.map((protection) => (
                    <tr key={protection.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                          {protection.protection_id}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">
                          {protection.partners?.display_name || 
                           `${protection.partners?.first_name || ''} ${protection.partners?.last_name || ''}`.trim() ||
                           '—'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {protection.partners?.hgi_partner_id || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {protection.client_state || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {protection.product_type || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {protection.client_source || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {protection.promise_date ? new Date(protection.promise_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">
                        {protection.family_notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-slate-200 px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

