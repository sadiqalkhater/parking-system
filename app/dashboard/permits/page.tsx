'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { FileText, Plus, Search, QrCode, X, Download, Printer } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface Permit {
  id: string
  permitNumber: string
  type: string
  status: string
  startDate: string
  endDate: string
  price: number
  zoneAccess?: string
  user: { name: string; email: string }
  vehicle: { plateNumber: string; brand: string; model: string }
}
interface Vehicle { id: string; plateNumber: string; brand: string; model: string }

const permitTypes = [
  { value: 'DAILY', label: 'يومي' },
  { value: 'MONTHLY', label: 'شهري' },
  { value: 'YEARLY', label: 'سنوي' },
  { value: 'VISITOR', label: 'زائر' },
]

const typeLabels: Record<string, string> = {
  DAILY: 'يومي', MONTHLY: 'شهري', YEARLY: 'سنوي', VISITOR: 'زائر'
}
const statusLabels: Record<string, string> = {
  ACTIVE: 'نشط', EXPIRED: 'منتهي', SUSPENDED: 'معلق', CANCELLED: 'ملغي'
}

export default function PermitsPage() {
  const { token } = useAuth()
  const [permits, setPermits] = useState<Permit[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showQR, setShowQR] = useState<{ permit: Permit; qr: string } | null>(null)
  const [loadingQR, setLoadingQR] = useState<string | null>(null)
  const [form, setForm] = useState({ vehicleId: '', type: 'MONTHLY', startDate: '', endDate: '', zoneAccess: '', price: '' })
  const [loading, setLoading] = useState(false)

  const fetch_ = () => {
    fetch('/api/permits', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setPermits)
    fetch('/api/vehicles', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setVehicles)
  }
  useEffect(() => { fetch_() }, [token])

  const filtered = permits.filter(p =>
    p.permitNumber?.toLowerCase().includes(search.toLowerCase()) ||
    p.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.vehicle?.plateNumber?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const res = await fetch('/api/permits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
    })
    if (res.ok) { setShowForm(false); fetch_() }
    setLoading(false)
  }

  const handleShowQR = async (permit: Permit) => {
    setLoadingQR(permit.id)
    try {
      const res = await fetch(`/api/permits/${permit.id}/qr`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setShowQR({ permit, qr: data.qr })
    } catch (e) {
      console.error(e)
    }
    setLoadingQR(null)
  }

  const handlePrint = () => {
    if (!showQR) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تصريح - ${showQR.permit.vehicle?.plateNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
          .card { border: 2px solid #1e293b; border-radius: 12px; padding: 24px; max-width: 400px; margin: 0 auto; }
          .header { background: #1e293b; color: white; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
          .qr { text-align: center; margin: 20px 0; }
          .info { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .info-item { background: #f8fafc; padding: 10px; border-radius: 8px; }
          .label { font-size: 11px; color: #64748b; margin-bottom: 4px; }
          .value { font-size: 14px; font-weight: bold; color: #1e293b; }
          .status { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; display: inline-block; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h2 style="margin:0; font-size: 20px;">🅿️ نظام إدارة المواقف</h2>
            <p style="margin:4px 0 0; opacity:0.8; font-size: 13px;">تصريح وقوف السيارات</p>
          </div>
          <div class="qr">
            <img src="${showQR.qr}" width="200" height="200" />
          </div>
          <div class="info">
            <div class="info-item">
              <div class="label">اسم المالك</div>
              <div class="value">${showQR.permit.user?.name}</div>
            </div>
            <div class="info-item">
              <div class="label">رقم اللوحة</div>
              <div class="value">${showQR.permit.vehicle?.plateNumber}</div>
            </div>
            <div class="info-item">
              <div class="label">نوع التصريح</div>
              <div class="value">${typeLabels[showQR.permit.type] || showQR.permit.type}</div>
            </div>
            <div class="info-item">
              <div class="label">الحالة</div>
              <div class="value"><span class="status">${statusLabels[showQR.permit.status] || showQR.permit.status}</span></div>
            </div>
            <div class="info-item">
              <div class="label">تاريخ البدء</div>
              <div class="value">${new Date(showQR.permit.startDate).toLocaleDateString('ar-SA')}</div>
            </div>
            <div class="info-item">
              <div class="label">تاريخ الانتهاء</div>
              <div class="value">${new Date(showQR.permit.endDate).toLocaleDateString('ar-SA')}</div>
            </div>
          </div>
          <div style="text-align:center; margin-top: 16px; font-size: 11px; color: #94a3b8;">
            رقم التصريح: ${showQR.permit.permitNumber?.slice(0, 16)}...
          </div>
        </div>
      </body>
      </html>
    `)
    win.document.close()
    win.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التصاريح</h1>
          <p className="text-gray-500 text-sm mt-1">{permits.length} تصريح</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> إصدار تصريح
        </button>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-slate-900 p-5 text-white text-center">
              <p className="text-xs text-slate-400 mb-1">نظام إدارة المواقف</p>
              <h2 className="text-lg font-bold">تصريح وقوف السيارات</h2>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-5">
                <img src={showQR.qr} alt="QR Code" className="w-52 h-52 rounded-xl border-4 border-slate-100" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">المالك</p>
                  <p className="text-sm font-bold text-slate-900">{showQR.permit.user?.name}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">رقم اللوحة</p>
                  <p className="text-sm font-bold text-blue-600">{showQR.permit.vehicle?.plateNumber}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">النوع</p>
                  <p className="text-sm font-bold text-slate-900">{typeLabels[showQR.permit.type]}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">الانتهاء</p>
                  <p className="text-sm font-bold text-slate-900">{new Date(showQR.permit.endDate).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                  <Printer className="w-4 h-4" /> طباعة
                </button>
                <button onClick={() => {
                  const a = document.createElement('a')
                  a.href = showQR.qr
                  a.download = `permit-${showQR.permit.vehicle?.plateNumber}.png`
                  a.click()
                }}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                  <Download className="w-4 h-4" /> تنزيل
                </button>
                <button onClick={() => setShowQR(null)}
                  className="p-2.5 border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">إصدار تصريح جديد</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المركبة</label>
                <select value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">اختر المركبة</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} - {v.brand}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع التصريح</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  {permitTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البدء</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السعر (ريال)</label>
                <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60">
                  {loading ? 'جارٍ الإصدار...' : 'إصدار التصريح'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 py-2.5 rounded-xl text-sm font-medium">
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
          className="w-full border border-gray-300 rounded-xl pr-10 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="بحث برقم التصريح أو المستخدم..." />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="text-right px-6 py-3">المركبة</th>
              <th className="text-right px-6 py-3">المالك</th>
              <th className="text-right px-6 py-3">النوع</th>
              <th className="text-right px-6 py-3">الانتهاء</th>
              <th className="text-right px-6 py-3">السعر</th>
              <th className="text-right px-6 py-3">الحالة</th>
              <th className="text-right px-6 py-3">QR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>لا توجد تصاريح</p>
              </td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-blue-600">{p.vehicle?.plateNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{p.user?.name}</td>
                <td className="px-6 py-4"><Badge status={p.type} /></td>
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(p.endDate).toLocaleDateString('ar-SA')}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.price?.toLocaleString('ar')} ر.س</td>
                <td className="px-6 py-4"><Badge status={p.status} /></td>
                <td className="px-6 py-4">
                  <button onClick={() => handleShowQR(p)} disabled={loadingQR === p.id}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                    <QrCode className="w-3.5 h-3.5" />
                    {loadingQR === p.id ? '...' : 'QR'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
