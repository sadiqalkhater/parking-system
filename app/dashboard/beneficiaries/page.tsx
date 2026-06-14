'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { UserCheck, Plus, Search, Car, FileText } from 'lucide-react'

interface Beneficiary {
  id: string
  name: string
  phone?: string
  email?: string
  nationalId?: string
  department?: string
  notes?: string
  status: string
  createdAt: string
  permitCount: number
  vehicleCount: number
}

export default function BeneficiariesPage() {
  const { token } = useAuth()
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', nationalId: '', department: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetch_ = () => {
    fetch('/api/beneficiaries', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setBeneficiaries(data) })
  }
  useEffect(() => { fetch_() }, [token])

  const filtered = beneficiaries.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.phone?.includes(search) ||
    b.nationalId?.includes(search) ||
    b.department?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const res = await fetch('/api/beneficiaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ name: '', phone: '', email: '', nationalId: '', department: '', notes: '' })
      fetch_()
    } else {
      const d = await res.json(); setError(d.error)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">المستفيدون</h1>
          <p className="text-gray-500 text-sm mt-0.5">المصرح لهم بالوقوف — {beneficiaries.length} مستفيد</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">إضافة مستفيد</span>
          <span className="sm:hidden">إضافة</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">إضافة مستفيد جديد</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أحمد محمد العلي" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الجوال</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="05xxxxxxxx" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهوية</label>
                  <input value={form.nationalId} onChange={e => setForm({...form, nationalId: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1xxxxxxxxx" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="example@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الجهة / القسم</label>
                <input value={form.department} onChange={e => setForm({...form, department: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="الإدارة العامة" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2} placeholder="أي ملاحظات إضافية..." />
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-60">
                  {loading ? 'جارٍ الحفظ...' : 'إضافة المستفيد'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 py-3 rounded-xl text-sm font-medium">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-xl pr-10 pl-4 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="بحث بالاسم أو رقم الهوية أو الجهة..." />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>لا يوجد مستفيدون</p>
          </div>
        ) : filtered.map(b => (
          <div key={b.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-gray-900">{b.name}</p>
                {b.department && <p className="text-xs text-blue-600 mt-0.5">{b.department}</p>}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${b.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {b.status === 'ACTIVE' ? 'نشط' : 'موقوف'}
              </span>
            </div>
            <div className="flex gap-4 text-xs text-gray-500 mb-2">
              {b.phone && <span>📞 {b.phone}</span>}
              {b.nationalId && <span>🪪 {b.nationalId}</span>}
            </div>
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>{b.permitCount || 0} تصريح</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Car className="w-3.5 h-3.5 text-purple-500" />
                <span>{b.vehicleCount || 0} مركبة</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="text-right px-6 py-3">الاسم</th>
              <th className="text-right px-6 py-3">رقم الهوية</th>
              <th className="text-right px-6 py-3">الجوال</th>
              <th className="text-right px-6 py-3">الجهة</th>
              <th className="text-right px-6 py-3">التصاريح</th>
              <th className="text-right px-6 py-3">المركبات</th>
              <th className="text-right px-6 py-3">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>لا يوجد مستفيدون</p>
              </td></tr>
            ) : filtered.map(b => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">{b.name}</p>
                  {b.email && <p className="text-xs text-gray-400">{b.email}</p>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{b.nationalId || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{b.phone || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{b.department || '—'}</td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 text-sm text-blue-600">
                    <FileText className="w-4 h-4" /> {b.permitCount || 0}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 text-sm text-purple-600">
                    <Car className="w-4 h-4" /> {b.vehicleCount || 0}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${b.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {b.status === 'ACTIVE' ? 'نشط' : 'موقوف'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
