interface BadgeProps {
  status: string
  label?: string
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'نشط' },
  EXPIRED: { bg: 'bg-red-100', text: 'text-red-800', label: 'منتهي' },
  SUSPENDED: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'معلق' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'ملغي' },
  AVAILABLE: { bg: 'bg-green-100', text: 'text-green-800', label: 'متاح' },
  OCCUPIED: { bg: 'bg-red-100', text: 'text-red-800', label: 'مشغول' },
  RESERVED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'محجوز' },
  MAINTENANCE: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'صيانة' },
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'قيد الانتظار' },
  CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800', label: 'مؤكد' },
  COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'مكتمل' },
  PAID: { bg: 'bg-green-100', text: 'text-green-800', label: 'مدفوع' },
  FAILED: { bg: 'bg-red-100', text: 'text-red-800', label: 'فاشل' },
  DAILY: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'يومي' },
  MONTHLY: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'شهري' },
  YEARLY: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'سنوي' },
  VISITOR: { bg: 'bg-teal-100', text: 'text-teal-800', label: 'زائر' },
  ADMIN: { bg: 'bg-red-100', text: 'text-red-800', label: 'مدير عام' },
  MANAGER: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'مدير' },
  USER: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'مستخدم' },
}

export default function Badge({ status, label }: BadgeProps) {
  const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {label || config.label}
    </span>
  )
}
