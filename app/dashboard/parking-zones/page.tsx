'use client'
import { useEffect, useState } from 'react'
import { ParkingSquare, Plus } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface Zone {
  id: string
  name: string
  description?: string
  totalSlots: number
  floor?: string
  type: string
  slots: Array<{ id: string; slotNumber: string; status: string }>
}

const zoneTypes = [
  { value: 'REGULAR', label: 'عادي' },
  { value: 'VIP', label: 'VIP' },
  { value: 'DISABLED', label: 'ذوو إعاقة' },
  { value: 'LARGE', label: 'مركبات كبيرة' },
]

export default function ParkingZonesPage() {
  const [zones, setZones] = useState<Zone[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', totalSlots: '10', floor: '', type: 'REGULAR' })
  const [loading, setLoading] = useState(false)

  const fetch_ = () => fetch('/api/parking-zones').then(r => r.json()).then(setZones)
  useEffect(() => { fetch_() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const res = await fetch('/api/parking-zones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, totalSlots: parseInt(form.totalSlots) }),
    })
    if (res.ok) { setShowForm(false); fetch_() }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مواقف السيارات</h1>
          <p className="text-gray-500 text-sm mt-1">{zones.length} منطقة مواقف</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> إضافة منطقة
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">إضافة منطقة مواقف</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[{ key: 'name', label: 'اسم المنطقة', placeholder: 'A' }, { key: 'floor', label: 'الطابق', placeholder: 'الأرضي' }, { key: 'description', label: 'الوصف', placeholder: 'وصف اختياري' }].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input value={form[key as keyof typeof form]} onChange={e => setForm({...form, [key]: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={placeholder} required={key === 'name'} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  {zoneTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عدد المواقف</label>
                <input type="number" min="1" max="200" value={form.totalSlots} onChange={e => setForm({...form, totalSlots: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60">
                  {loading ? 'جارٍ الإنشاء...' : 'إنشاء'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 py-2.5 rounded-xl text-sm font-medium">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {zones.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ParkingSquare className="w-16 h-16 mx-auto mb-3 opacity-20" />
          <p>لا توجد مناطق مواقف بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {zones.map(zone => {
            const available = zone.slots.filter(s => s.status === 'AVAILABLE').length
            const occupied = zone.slots.filter(s => s.status === 'OCCUPIED').length
            const pct = zone.totalSlots > 0 ? ((zone.totalSlots - available) / zone.totalSlots) * 100 : 0
            return (
              <div key={zone.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">منطقة {zone.name}</h3>
                    {zone.floor && <p className="text-gray-500 text-sm">الطابق: {zone.floor}</p>}
                  </div>
                  <Badge status={zone.type} label={zoneTypes.find(t => t.value === zone.type)?.label} />
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>الإشغال</span>
                    <span>{Math.round(pct)}%</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-green-50 rounded-xl p-2">
                    <p className="font-bold text-green-600">{available}</p>
                    <p className="text-xs text-green-600">متاح</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-2">
                    <p className="font-bold text-red-600">{occupied}</p>
                    <p className="text-xs text-red-600">مشغول</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-2">
                    <p className="font-bold text-blue-600">{zone.totalSlots}</p>
                    <p className="text-xs text-blue-600">إجمالي</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
