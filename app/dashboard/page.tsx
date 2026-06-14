'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Users, Car, FileText, CalendarCheck, ParkingSquare, TrendingUp } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface DashboardData {
  stats: {
    totalUsers: number
    totalVehicles: number
    totalPermits: number
    activePermits: number
    totalReservations: number
    todayReservations: number
    totalSlots: number
    occupiedSlots: number
    availableSlots: number
  }
  recentReservations: Array<{
    id: string
    status: string
    startTime: string
    user: { name: string }
    vehicle: { plateNumber: string }
    slot: { slotNumber: string; zone: { name: string } }
  }>
}

const StatCard = ({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: number; sub?: string; color: string }) => (
  <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs md:text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl md:text-3xl font-bold text-gray-900">{value.toLocaleString('ar')}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`${color} p-2.5 md:p-3 rounded-xl shrink-0 mr-3`}>
        <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </div>
    </div>
  </div>
)

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

  const { stats, recentReservations } = data

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-500 text-sm mt-0.5">نظرة عامة على النظام</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={Users} label="المستخدمون" value={stats.totalUsers} color="bg-blue-500" />
        <StatCard icon={Car} label="المركبات" value={stats.totalVehicles} color="bg-purple-500" />
        <StatCard icon={FileText} label="التصاريح النشطة" value={stats.activePermits} sub={`من ${stats.totalPermits} إجمالي`} color="bg-green-500" />
        <StatCard icon={CalendarCheck} label="حجوزات اليوم" value={stats.todayReservations} sub={`${stats.totalReservations} إجمالي`} color="bg-orange-500" />
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <ParkingSquare className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-900">حالة المواقف</h2>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm text-gray-500 shrink-0">الإشغال</span>
          <div className="flex-1 bg-gray-100 rounded-full h-3">
            <div className="bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: stats.totalSlots > 0 ? `${(stats.occupiedSlots / stats.totalSlots) * 100}%` : '0%' }} />
          </div>
          <span className="text-sm font-medium text-gray-700 shrink-0">{stats.occupiedSlots}/{stats.totalSlots}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 md:gap-3 mt-4">
          <div className="text-center p-2.5 md:p-3 bg-green-50 rounded-xl">
            <p className="text-xl md:text-2xl font-bold text-green-600">{stats.availableSlots}</p>
            <p className="text-xs text-green-600 mt-0.5">متاح</p>
          </div>
          <div className="text-center p-2.5 md:p-3 bg-red-50 rounded-xl">
            <p className="text-xl md:text-2xl font-bold text-red-600">{stats.occupiedSlots}</p>
            <p className="text-xs text-red-600 mt-0.5">مشغول</p>
          </div>
          <div className="text-center p-2.5 md:p-3 bg-blue-50 rounded-xl">
            <p className="text-xl md:text-2xl font-bold text-blue-600">{stats.totalSlots}</p>
            <p className="text-xs text-blue-600 mt-0.5">إجمالي</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 p-4 md:p-6 border-b">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-900">آخر الحجوزات</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="text-right px-4 md:px-6 py-3">المستخدم</th>
                <th className="text-right px-4 md:px-6 py-3">المركبة</th>
                <th className="text-right px-4 md:px-6 py-3 hidden md:table-cell">الموقف</th>
                <th className="text-right px-4 md:px-6 py-3 hidden md:table-cell">الوقت</th>
                <th className="text-right px-4 md:px-6 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentReservations.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">لا توجد حجوزات بعد</td></tr>
              ) : recentReservations.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 md:px-6 py-3 text-sm font-medium text-gray-900">{r.user.name}</td>
                  <td className="px-4 md:px-6 py-3 text-sm text-blue-600 font-medium">{r.vehicle.plateNumber}</td>
                  <td className="px-4 md:px-6 py-3 text-sm text-gray-600 hidden md:table-cell">{r.slot.zone.name} - {r.slot.slotNumber}</td>
                  <td className="px-4 md:px-6 py-3 text-sm text-gray-600 hidden md:table-cell">{new Date(r.startTime).toLocaleDateString('ar-SA')}</td>
                  <td className="px-4 md:px-6 py-3"><Badge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
