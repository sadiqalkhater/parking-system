'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Users, FileText, ParkingSquare, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface DashboardData {
  stats: {
    totalUsers: number
    totalPermits: number
    activePermits: number
    expiredPermits: number
    totalSlots: number
    availableSlots: number
    occupiedSlots: number
  }
  recentPermits: Array<{
    id: string
    permitNumber: string
    beneficiaryName: string
    plateNumber: string
    type: string
    status: string
    endDate: string
    parkingSlot?: string
    price: number
  }>
  zoneStats: Array<{
    name: string
    type: string
    total: number
    available: number
    occupied: number
    reserved: number
  }>
}

const typeLabels: Record<string, string> = { DAILY: 'يومي', MONTHLY: 'شهري', YEARLY: 'سنوي', VISITOR: 'زائر' }

export default function DashboardPage() {
  const { token } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData)
  }, [token])

  if (!data) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  const { stats, recentPermits, zoneStats } = data
  const occupancyPct = stats.totalSlots > 0 ? Math.round((stats.occupiedSlots / stats.totalSlots) * 100) : 0

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-500 text-sm mt-0.5">نظرة عامة على النظام</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">المستخدمون</p>
            <div className="bg-blue-100 p-1.5 rounded-lg"><Users className="w-4 h-4 text-blue-600" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">التصاريح النشطة</p>
            <div className="bg-green-100 p-1.5 rounded-lg"><CheckCircle className="w-4 h-4 text-green-600" /></div>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.activePermits}</p>
          <p className="text-xs text-gray-400 mt-0.5">من {stats.totalPermits} إجمالي</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">تصاريح منتهية</p>
            <div className="bg-red-100 p-1.5 rounded-lg"><AlertCircle className="w-4 h-4 text-red-600" /></div>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.expiredPermits}</p>
          <p className="text-xs text-gray-400 mt-0.5">تحتاج تجديد</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">المواقف المتاحة</p>
            <div className="bg-purple-100 p-1.5 rounded-lg"><ParkingSquare className="w-4 h-4 text-purple-600" /></div>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.availableSlots}</p>
          <p className="text-xs text-gray-400 mt-0.5">من {stats.totalSlots} إجمالي</p>
        </div>
      </div>

      {/* Zone Stats */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <ParkingSquare className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-900">حالة المواقف</h2>
          <span className="mr-auto text-sm text-gray-500">{occupancyPct}% مشغول</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
          <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${occupancyPct}%` }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {zoneStats.map(zone => (
            <div key={zone.name} className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900">منطقة {zone.name}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {zone.type === 'VIP' ? 'VIP' : zone.type === 'DISABLED' ? 'إعاقة' : 'عادي'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center text-xs">
                <div className="bg-green-100 rounded-lg p-1.5">
                  <p className="font-bold text-green-700">{zone.available}</p>
                  <p className="text-green-600">متاح</p>
                </div>
                <div className="bg-red-100 rounded-lg p-1.5">
                  <p className="font-bold text-red-700">{zone.occupied}</p>
                  <p className="text-red-600">مشغول</p>
                </div>
                <div className="bg-blue-100 rounded-lg p-1.5">
                  <p className="font-bold text-blue-700">{zone.reserved}</p>
                  <p className="text-blue-600">محجوز</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Permits */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-900">آخر التصاريح</h2>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-100">
          {recentPermits.map(p => (
            <div key={p.id} className="p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{p.beneficiaryName}</p>
                  <p className="text-blue-600 font-bold">{p.plateNumber}</p>
                </div>
                <Badge status={p.status === 'ACTIVE' && new Date(p.endDate) < new Date() ? 'EXPIRED' : p.status} />
              </div>
              <div className="flex gap-3 text-xs text-gray-500 mt-1">
                <span>{typeLabels[p.type]}</span>
                <span>•</span>
                <span>{p.parkingSlot || '—'}</span>
                <span>•</span>
                <span>{p.price} ر.س</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="text-right px-5 py-3">المستفيد</th>
                <th className="text-right px-5 py-3">المركبة</th>
                <th className="text-right px-5 py-3">النوع</th>
                <th className="text-right px-5 py-3">الموقف</th>
                <th className="text-right px-5 py-3">الانتهاء</th>
                <th className="text-right px-5 py-3">الرسوم</th>
                <th className="text-right px-5 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentPermits.map(p => {
                const isExpired = p.status === 'ACTIVE' && new Date(p.endDate) < new Date()
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{p.beneficiaryName}</td>
                    <td className="px-5 py-3 text-sm font-bold text-blue-600">{p.plateNumber}</td>
                    <td className="px-5 py-3"><Badge status={p.type} /></td>
                    <td className="px-5 py-3 text-sm text-gray-600">{p.parkingSlot || '—'}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{new Date(p.endDate).toLocaleDateString('ar-SA')}</td>
                    <td className="px-5 py-3 text-sm font-medium text-green-600">{p.price} ر.س</td>
                    <td className="px-5 py-3"><Badge status={isExpired ? 'EXPIRED' : p.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
