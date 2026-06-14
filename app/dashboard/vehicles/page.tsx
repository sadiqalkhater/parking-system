'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Car, Plus, Search } from 'lucide-react'

interface Vehicle {
  id: string
  plateNumber: string
  brand: string
  model: string
  color: string
  createdAt: string
  user: { name: string; email: string }
}

export default function VehiclesPage() {
  const { token } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ plateNumber: '', brand: '', model: '', color: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchVehicles = () => {
    fetch('/api/vehicles', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setVehicles)
  }
  useEffect(() => { fetchVehicles() }, [token])

  const filtered = vehicles.filter(v =>
    v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
    v.brand.toLowerCase().includes(search.toLowerCase()) ||
    v.user?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    })
    if (res.ok) { setShowForm(false); setForm({ plateNumber: '', brand: '', model: '', color: '' }); fetchVehicles() }
    else { const d = await res.json(); setError(d.error) }
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">المركبات</h1>
          <p className="text-gray-500 text-sm mt-0.5">{vehicles.length} مركبة</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">إضافة مركبة</span>
          <span className="sm:hidden">إضافة</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">إضافة مركبة جديدة</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: 'plateNumber', label: 'رقم اللوحة', placeholder: 'أ ب ج 1234' },
                { key: 'brand', label: 'الماركة', placeholder: 'تويوتا' },
                { key: 'model', label: 'الموديل', placeholder: 'كامري' },
                { key: 'color', label: 'اللون', placeholder: 'أبيض' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input value={form[key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={placeholder} required />
                </div>
              ))}
              {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-60">
                  {loading ? 'جارٍ الحفظ...' : 'حفظ'}
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
          placeholder="بحث برقم اللوحة أو الماركة..." />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Car className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>لا توجد مركبات</p>
          </div>
        ) : filtered.map(v => (
          <div key={v.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-blue-600">{v.plateNumber}</span>
              <span className="text-xs text-gray-400">{new Date(v.createdAt).toLocaleDateString('ar-SA')}</span>
            </div>
            <p className="text-sm text-gray-900 font-medium">{v.brand} {v.model}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500">{v.color}</span>
              <span className="text-sm text-gray-600">{v.user?.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="text-right px-6 py-3">رقم اللوحة</th>
              <th className="text-right px-6 py-3">الماركة والموديل</th>
              <th className="text-right px-6 py-3">اللون</th>
              <th className="text-right px-6 py-3">المالك</th>
              <th className="text-right px-6 py-3">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">
                <Car className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>لا توجد مركبات</p>
              </td></tr>
            ) : filtered.map(v => (
              <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-blue-600">{v.plateNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{v.brand} {v.model}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{v.color}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{v.user?.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(v.createdAt).toLocaleDateString('ar-SA')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
