# دليل إعداد نسخة التجربة

## 📋 المتطلبات الأساسية

- **Node.js**: v18 أو أعلى
- **npm**: v9 أو أعلى (أو yarn)
- **Git**: لإدارة النسخ
- **متصفح حديث**: Chrome, Firefox, Safari

---

## 🔧 خطوات الإعداد

### 1️⃣ استنساخ المشروع

```bash
git clone https://github.com/aabderhman201-commits/KING-DESIGNER.git
cd KING-DESIGNER
```

### 2️⃣ الانتقال لفرع التجربة

```bash
git checkout testing-version
```

### 3️⃣ تثبيت المتطلبات

```bash
npm install
```

### 4️⃣ إعداد متغيرات البيئة

الملف `.env` موجود بالفعل مع الإعدادات:

```dotenv
VITE_SUPABASE_URL=https://azxjqfqgvnorxfzkxppl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **ملاحظة**: تأكد من أن المفاتيح صحيحة وآمنة

### 5️⃣ تشغيل المشروع

```bash
npm run dev
```

سيظهر:
```
  VITE v5.4.2  ready in 123 ms
  ➜  Local:   http://localhost:5173/
  ➜  Press q to quit
```

### 6️⃣ فتح التطبيق

انقر على: http://localhost:5173/

---

## 🧪 الاختبار

### تسجيل دخول تجريبي:

**المسؤول:**
- البريد: admin@test.com
- كلمة المرور: test123456

**مستخدم عادي:**
- البريد: user@test.com
- كلمة المرور: test123456

**مصمم:**
- البريد: designer@test.com
- كلمة المرور: test123456

---

## 🛠️ الأوامر المفيدة

```bash
# تطوير
npm run dev

# البناء للإنتاج
npm run build

# معاينة النسخة المبنية
npm run preview

# فحص الأخطاء
npm run lint

# فحص أنواع TypeScript
npm run typecheck
```

---

## 📁 الملفات المهمة

| الملف | الوصف |
|------|-------|
| `package.json` | المتطلبات والأوامر |
| `.env` | متغيرات البيئة |
| `vite.config.ts` | إعدادات Vite |
| `tailwind.config.js` | إعدادات Tailwind |
| `tsconfig.json` | إعدادات TypeScript |
| `main.tsx` | نقطة الدخول الرئيسية |
| `App.tsx` | المكون الرئيسي |
| `index.html` | صفحة HTML |

---

## 🐛 استكشاف الأخطاء

### المشكلة: Port 5173 قيد الاستخدام

```bash
# الحل: استخدام port مختلف
npm run dev -- --port 3000
```

### المشكلة: خطأ في Supabase

1. تحقق من ملف `.env`
2. تأكد من صحة المفاتيح
3. قم بإعادة تشغيل السيرفر

### المشكلة: خطأ في npm install

```bash
# الحل: حذف node_modules وإعادة التثبيت
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 البناء والنشر

### بناء النسخة الإنتاجية:

```bash
npm run build
```

يتم إنشاء مجلد `dist` بالملفات المحسّنة.

### معاينة النسخة المبنية:

```bash
npm run preview
```

---

## ✅ قائمة التحقق

- [ ] تثبيت Node.js v18+
- [ ] استنساخ المشروع
- [ ] الانتقال لفرع `testing-version`
- [ ] تشغيل `npm install`
- [ ] التحقق من ملف `.env`
- [ ] تشغيل `npm run dev`
- [ ] فتح http://localhost:5173/
- [ ] اختبار تسجيل الدخول
- [ ] التنقل بين الصفحات
- [ ] اختبار الميزات الأساسية

---

## 📚 المراجع

- [توثيق React](https://react.dev)
- [توثيق Vite](https://vitejs.dev)
- [توثيق Tailwind CSS](https://tailwindcss.com)
- [توثيق Supabase](https://supabase.com/docs)
- [توثيق TypeScript](https://www.typescriptlang.org/docs)

---

**هل تواجه مشكلة؟** تحقق من logs في وحدة التحكم (Console)
