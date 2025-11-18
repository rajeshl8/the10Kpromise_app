'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

interface Partner {
  id: string
  user_id: string
  email: string
  display_name: string | null
  first_name: string | null
  last_name: string | null
  hgi_partner_id: string | null
  personal_target: number
  created_at: string
}

export default function PartnersManagementPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPartner, setNewPartner] = useState({ email: '', first_name: '', last_name: '', hgi_partner_id: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPartners()
  }, [])

  useEffect(() => {
    // Filter partners based on search term
    if (!searchTerm) {
      setFilteredPartners(partners)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredPartners(partners.filter(p => 
        p.email?.toLowerCase().includes(term) ||
        p.first_name?.toLowerCase().includes(term) ||
        p.last_name?.toLowerCase().includes(term) ||
        p.hgi_partner_id?.toLowerCase().includes(term) ||
        p.display_name?.toLowerCase().includes(term)
      ))
    }
  }, [searchTerm, partners])

  const loadPartners = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setPartners(data)
    if (error) console.error('Error loading partners:', error)
    setLoading(false)
  }

  const handleEdit = (partner: Partner) => {
    setEditingPartner({ ...partner })
  }

  const handleSave = async () => {
    if (!editingPartner) return

    const { error } = await supabase
      .from('partners')
      .update({
        first_name: editingPartner.first_name?.trim() || null,
        last_name: editingPartner.last_name?.trim() || null,
        hgi_partner_id: editingPartner.hgi_partner_id?.trim().toUpperCase() || null,
        personal_target: editingPartner.personal_target,
        display_name: editingPartner.display_name?.trim() || null,
      })
      .eq('id', editingPartner.id)

    if (error) {
      alert('Error updating partner: ' + error.message)
    } else {
      setEditingPartner(null)
      loadPartners()
    }
  }

  const handleAddPartner = async () => {
    const email = newPartner.email.trim().toLowerCase()
    const firstName = newPartner.first_name.trim()
    const lastName = newPartner.last_name.trim()
    const hgiId = newPartner.hgi_partner_id.trim().toUpperCase()
    
    // Validate all required fields
    if (!email) {
      alert('Email is required')
      return
    }

    if (!firstName) {
      alert('First Name is required')
      return
    }

    if (!lastName) {
      alert('Last Name is required')
      return
    }

    if (!hgiId) {
      alert('HGI Partner ID is required')
      return
    }

    // Basic email validation
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert('Please enter a valid email address')
      return
    }

    // Check if partner already exists
    const { data: existing } = await supabase
      .from('partners')
      .select('email')
      .eq('email', email)
      .limit(1)

    if (existing && existing.length > 0) {
      alert('A partner with this email already exists')
      return
    }

    // Generate a random UUID for user_id (will be updated when they first sign in)
    const { data, error } = await supabase
      .from('partners')
      .insert({
        user_id: crypto.randomUUID(),
        email: email,
        first_name: firstName,
        last_name: lastName,
        hgi_partner_id: hgiId,
        personal_target: 100
      })

    if (error) {
      alert('Error adding partner: ' + error.message)
    } else {
      setShowAddModal(false)
      setNewPartner({ email: '', first_name: '', last_name: '', hgi_partner_id: '' })
      loadPartners()
    }
  }

  const getProtectionCount = (partnerId: string) => {
    // This would ideally come from a join or separate query
    // For now, we'll add it in a future enhancement
    return '—'
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Partner Management</h1>
            <p className="text-slate-600">View and edit all partner information</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-lg px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all text-sm font-semibold shadow-md"
            >
              ➕ Add Partner
            </button>
            <a 
              href="/admin/upload" 
              className="rounded-lg px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              CSV Upload
            </a>
            <a 
              href="/" 
              className="rounded-lg px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              ← Back to Home
            </a>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or HGI Partner ID..."
            className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Partners</p>
          <p className="text-2xl font-bold text-slate-900">{partners.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Complete Profiles</p>
          <p className="text-2xl font-bold text-green-600">
            {partners.filter(p => p.first_name && p.last_name && p.hgi_partner_id).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Incomplete Profiles</p>
          <p className="text-2xl font-bold text-orange-600">
            {partners.filter(p => !p.first_name || !p.last_name || !p.hgi_partner_id).length}
          </p>
        </div>
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-600">Loading partners...</div>
        ) : filteredPartners.length === 0 ? (
          <div className="p-8 text-center text-slate-600">
            {searchTerm ? 'No partners found matching your search.' : 'No partners yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">HGI ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Target</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {partner.first_name && partner.last_name 
                          ? `${partner.first_name} ${partner.last_name}`
                          : partner.display_name || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{partner.email}</td>
                    <td className="px-4 py-3">
                      <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                        {partner.hgi_partner_id || '—'}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{partner.personal_target}</td>
                    <td className="px-4 py-3">
                      {partner.first_name && partner.last_name && partner.hgi_partner_id ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Complete
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          ⚠ Incomplete
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEdit(partner)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingPartner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Edit Partner</h3>
            
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={editingPartner.first_name || ''}
                  onChange={(e) => setEditingPartner({...editingPartner, first_name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={editingPartner.last_name || ''}
                  onChange={(e) => setEditingPartner({...editingPartner, last_name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editingPartner.email}
                  disabled
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                />
              </div>

              {/* HGI Partner ID */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">HGI Partner ID</label>
                <input
                  type="text"
                  value={editingPartner.hgi_partner_id || ''}
                  onChange={(e) => setEditingPartner({...editingPartner, hgi_partner_id: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              {/* Personal Target */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Personal Target</label>
                <input
                  type="number"
                  value={editingPartner.personal_target}
                  onChange={(e) => setEditingPartner({...editingPartner, personal_target: parseInt(e.target.value) || 100})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingPartner(null)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Add New Partner</h3>
            <p className="text-sm text-slate-600 mb-6">Partner will be able to sign in once added</p>
            
            <div className="space-y-4">
              {/* Email (Required) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newPartner.email}
                  onChange={(e) => setNewPartner({...newPartner, email: e.target.value})}
                  placeholder="partner@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-1">Required - Partner will sign in with this email</p>
              </div>

              {/* First Name (Required) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPartner.first_name}
                  onChange={(e) => setNewPartner({...newPartner, first_name: e.target.value})}
                  placeholder="First Name"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Last Name (Required) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPartner.last_name}
                  onChange={(e) => setNewPartner({...newPartner, last_name: e.target.value})}
                  placeholder="Last Name"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* HGI Partner ID (Required) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  HGI Partner ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPartner.hgi_partner_id}
                  onChange={(e) => setNewPartner({...newPartner, hgi_partner_id: e.target.value.toUpperCase()})}
                  placeholder="HGI Partner ID"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewPartner({ email: '', first_name: '', last_name: '', hgi_partner_id: '' })
                }}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPartner}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
              >
                Add Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

