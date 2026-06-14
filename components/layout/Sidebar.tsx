'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Car, FileText, CalendarClock,
  ParkingSquare, Users, BarChart3, LogOut, Shield
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', roles: ['ADMIN', 'MANAGER', 'USER'] },
  { href: '/dashboard/vehicles', icon: Car, label: 'المركبات', roles: ['ADMIN', 'MANAGER', 'USER'] },
  { href: '/dashboard/permits', icon: FileText, label: 'التصاريح', roles: ['ADMIN', 'MANAGER', 'USER'] },
  { href: '/dashboard/reservations', icon: CalendarClock, label: 'الحجوزات', roles: ['ADMIN', 'MANAGER', 'USER'] },
  { href: '/dashboard/parking-zones', icon: ParkingSquare, label: 'مواقف السيارات', roles: ['ADMIN', 'MANAGER'] },
  { href: '/dashboard/users', icon: Users, label: 'المستخدمون', roles: ['ADMIN'] },
  { href: '/dashboard/reports', icon: BarChart3, label: 'التقارير', roles: ['ADMIN', 'MANAGER'] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const filtered = navItems.filter(item => user && item.roles.includes(user.role))

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen" dir="rtl">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">نظام المواقف</h1>
            <p className="text-slate-400 text-xs">إدارة التصاريح والحجوزات</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filtered.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === href ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{user?.name}</p>
            <p className="text-slate-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}
