# 🚗 نظام إدارة تصاريح وحجوزات السيارات

نظام متكامل لإدارة مواقف السيارات، التصاريح، والحجوزات مبني بـ **Next.js 14** و **PostgreSQL**.

## 🛠️ التقنيات المستخدمة

| الطبقة | التقنية |
|--------|---------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Font | Cairo (عربي) |

## 📦 الوحدات

- ✅ **لوحة التحكم** - إحصاءات شاملة وآخر الحجوزات
- ✅ **المستخدمون** - إدارة كاملة بصلاحيات متعددة
- ✅ **المركبات** - تسجيل وإدارة المركبات
- ✅ **التصاريح** - إصدار وإدارة التصاريح (يومي/شهري/سنوي/زائر)
- ✅ **الحجوزات** - حجز مواقف مع منع التعارضات
- ✅ **مواقف السيارات** - إدارة المناطق والمواقف
- ✅ **التقارير** - إحصاءات وتقارير الأداء

## 🚀 تشغيل المشروع

### 1. تثبيت المكتبات
```bash
npm install
```

### 2. إعداد المتغيرات البيئية
```bash
cp .env.example .env.local
```
ثم عدّل `DATABASE_URL` في ملف `.env.local`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/parking_db"
```

### 3. إنشاء قاعدة البيانات
```bash
npx prisma db push
```

### 4. إدخال البيانات التجريبية
```bash
npm install -D ts-node
npx prisma db seed
```

### 5. تشغيل الخادم
```bash
npm run dev
```

ثم افتح: [http://localhost:3000](http://localhost:3000)

## 🔑 بيانات الدخول التجريبية

| الدور | البريد الإلكتروني | كلمة المرور |
|-------|------------------|-------------|
| مدير عام | admin@parking.com | admin123 |
| مستخدم | user@parking.com | user123 |

## 📁 هيكل المشروع

```
parking-system/
├── app/
│   ├── api/
│   │   ├── auth/login/
│   │   ├── auth/register/
│   │   ├── users/
│   │   ├── vehicles/
│   │   ├── permits/
│   │   ├── reservations/
│   │   ├── parking-zones/
│   │   └── dashboard/
│   ├── login/
│   └── dashboard/
│       ├── page.tsx          (لوحة التحكم)
│       ├── users/
│       ├── vehicles/
│       ├── permits/
│       ├── reservations/
│       ├── parking-zones/
│       └── reports/
├── components/
│   ├── layout/Sidebar.tsx
│   └── ui/Badge.tsx
├── context/AuthContext.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── utils.ts
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

## 🔐 الصلاحيات

| الوحدة | مدير عام | مدير | مستخدم |
|--------|---------|------|--------|
| لوحة التحكم | ✅ | ✅ | ✅ |
| المستخدمون | ✅ | ❌ | ❌ |
| المركبات | ✅ كل | ✅ كل | ✅ ملكه |
| التصاريح | ✅ كل | ✅ كل | ✅ ملكه |
| الحجوزات | ✅ كل | ✅ كل | ✅ ملكه |
| المواقف | ✅ | ✅ | ❌ |
| التقارير | ✅ | ✅ | ❌ |

## 📝 ملاحظات
- API محمي بـ JWT Token
- كلمات المرور مشفرة بـ bcrypt
- التحقق من التعارضات في الحجوزات تلقائي
- واجهة عربية بالكامل (RTL)
