# مؤسسة غزلان الخير — نظام إدارة الطلبات

> نظام متكامل لإدارة طلبات المساعدة الإنسانية وتوثيق الحالات.

---

## 🛠 التقنيات

| | التقنية |
|---|---|
| **Backend** | Laravel 11 + PHP 8.2 |
| **Frontend** | Next.js 14 + TypeScript |
| **Database** | MySQL |
| **Real-time** | Laravel Reverb (WebSockets) |
| **Email** | Resend API |
| **Auth** | Laravel Sanctum |

---

##  الميزات المنجزة

- تقديم طلبات مساعدة بدون تسجيل (طبي، تعليمي، معيشي)
- تتبع الطلب برقم الهاتف أو رقم الطلب
- لوحة تحكم للمدير (إدارة الطلبات، الموظفين، التقارير)
- لوحة تحكم للموظف (متابعة حالاته، توثيق الحالات)
- نظام إشعارات real-time
- تصدير تقارير Excel
- لوحة أداء الموظفين (KPIs)
- صفحة تطوع
- دعم كامل للعربية والإنجليزية
- Dark/Light mode
- واجهة responsive للموبايل

---

##  تشغيل المشروع محلياً

### Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8000
php artisan reverb:start --host=0.0.0.0 --port=8080
```

### Frontend
```bash
cd frontend
npm install
# أنشئ .env.local وأضف:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev
```

---

##  هيكل المشروع

```
├── frontend/          # Next.js
│   ├── app/
│   │   ├── page.tsx           # الصفحة الرئيسية
│   │   ├── apply/             # تقديم طلب
│   │   ├── track/             # تتبع طلب
│   │   ├── volunteer/         # التطوع
│   │   └── dashboard/
│   │       ├── manager/       # لوحة المدير
│   │       ├── employee/      # لوحة الموظف
│   │       └── requests/      # إدارة الطلبات
│   └── components/
│
└── backend/           # Laravel API
    ├── app/Http/Controllers/
    ├── routes/api.php
    └── database/migrations/
```

---

##  الأدوار

| الدور | الصلاحيات |
|---|---|
| **Manager** | إدارة كاملة — موظفين، طلبات، تقارير |
| **Employee** | متابعة الطلبات المسندة إليه فقط |

---

##  التواصل

**مؤسسة غزلان الخير** — info@ghozlan.org