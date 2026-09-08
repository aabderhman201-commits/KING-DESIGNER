# ملاحظات التطوير

## 📊 هيكل المشروع الشامل

```
KING-DESIGNER/
├── 📄 الملفات الأساسية
│   ├── index.html              - صفحة HTML الرئيسية
│   ├── main.tsx                - نقطة الدخول
│   ├── App.tsx                 - المكون الرئيسي
│   ├── package.json            - المتطلبات والأوامر
│   ├── vite.config.ts          - إعدادات البناء
│   └── .env                    - متغيرات البيئة
│
├── 🖥️ الصفحات الرئيسية (Pages)
│   ├── HomePage.tsx            - الخط الزمني والمنشورات
│   ├── ProfilePage.tsx         - الملف الشخصي
│   ├── AuthPage.tsx            - المصادقة
│   ├── MessagesPage.tsx        - الرسائل المباشرة
│   ├── AdminPage.tsx           - لوحة التحكم
│   ├── ServiceRequestsPage.tsx - طلبات الخدمات
│   ├── SearchPage.tsx          - البحث
│   ├── FriendsPage.tsx         - قائمة الأصدقاء
│   ├── NotificationsPage.tsx   - الإشعارات
│   ├── PostDetailPage.tsx      - تفاصيل المنشور
│   └── VerificationPage.tsx    - التحقق
│
├── 🎨 المكونات (Components)
│   ├── Avatar.tsx              - صورة الملف الشخصي
│   ├── Layout.tsx              - التخطيط الرئيسي
│   ├── MediaPreview.tsx        - معاينة الوسائط
│   └── MediaStudio.tsx         - محرر الوسائط
│
├── 🔧 السياقات (Context)
│   ├── AuthContext.tsx         - إدارة المصادقة
│   ├── LanguageContext.tsx     - إدارة اللغات
│   └── ThemeContext.tsx        - إدارة المواضيع
│
├── 🛠️ المساعدات والأدوات (Utils)
│   ├── helpers.ts              - دوال مساعدة
│   ├── supabase.ts             - إعدادات قاعدة البيانات
│   ├── useBrowserNotifications.ts - الإشعارات
│   └── translations.ts         - ملفات الترجمة
│
├── 🗄️ قاعدة البيانات (Database)
│   ├── 20260908044114_create_core_schema.sql
│   ├── 20260908044146_create_extended_schema.sql
│   ├── 20260908105241_add_portfolio_folders_and_service_workflow.sql
│   ├── 20260908113518_add_social_blocks_messages_reports.sql
│   ├── 20260908121417_add_splash_message_requests_avatar_frames.sql
│   └── ... (25+ ملف ترحيل)
│
├── 🎨 التصميم والأنماط
│   ├── index.css               - أنماط عامة
│   ├── tailwind.config.js      - إعدادات Tailwind
│   ├── postcss.config.js       - إعدادات PostCSS
│   └── index-DsbaLmpR.css      - أنماط مُنتَجة
│
├── ⚙️ الإعدادات
│   ├── tsconfig.json           - إعدادات TypeScript
│   ├── tsconfig.app.json       - إعدادات التطبيق
│   ├── eslint.config.js        - إعدادات Linting
│   ├── .gitignore              - ملفات مستثناة
│   └── .env                    - متغيرات البيئة
│
└── 📚 التوثيق
    ├── README-TESTING.md       - دليل التجربة
    ├── SETUP-GUIDE.md          - دليل الإعداد
    ├── TESTING-CHECKLIST.md    - قائمة الاختبار
    └── DEVELOPMENT-NOTES.md    - هذا الملف
```

---

## 🔄 دورة الحياة

### البدء
1. المستخدم يفتح التطبيق
2. `main.tsx` يحمل التطبيق
3. `App.tsx` يُهيّئ السياقات
4. `AuthContext` يتحقق من حالة تسجيل الدخول
5. `Layout` يعرض التخطيط الأساسي

### التنقل
1. المستخدم ينقر على رابط
2. التوجيه يغيّر الصفحة
3. الصفحة الجديدة تحمل البيانات من Supabase
4. المكونات تُعاد رسمها

### تحديث البيانات
1. حدث من المستخدم (كتابة، إرسال، إلخ)
2. طلب يُرسل إلى Supabase
3. قاعدة البيانات تُحدّث البيانات
4. Listeners تستقبل التحديثات
5. State يُحدّث وتُعاد الرسم

---

## 🔐 الأمان

### المصادقة
- استخدام Supabase Auth
- JWT tokens
- refresh tokens
- session management

### سياسات الأمان (RLS)
- جدول المستخدمين: فقط البيانات الخاصة
- المنشورات: العام يراها الجميع
- الرسائل: فقط المرسل والمُستقبل
- الملفات الشخصية: عام ولكن التعديل للمالك

### البيانات الحساسة
- كلمات المرور: مشفرة في Supabase
- Tokens: في localStorage (آمن للـ HTTP فقط)
- البيانات الشخصية: محمية بـ RLS

---

## 🎨 نظام التصميم

### الألوان الأساسية
- Primary: `#3B82F6` (أزرق)
- Success: `#10B981` (أخضر)
- Warning: `#F59E0B` (برتقالي)
- Error: `#EF4444` (أحمر)
- Dark: `#1F2937` (رمادي داكن)

### الخطوط
- الجسم: `system-ui, sans-serif`
- العنوانات: `bold` weights

### المسافات
- Base unit: `4px`
- مسافات: `4px, 8px, 16px, 24px, 32px`

---

## 📦 المكتبات الخارجية

### الأساسيات
- **react** - واجهة المستخدم
- **react-dom** - DOM rendering
- **typescript** - أمان النوع

### المرافق
- **@supabase/supabase-js** - قاعدة البيانات
- **lucide-react** - الرموز

### التطوير
- **vite** - البناء السريع
- **tailwindcss** - التصميم
- **eslint** - فحص الكود
- **autoprefixer** - CSS compatibility

---

## 🚀 الأداء

### تحسينات
- Code splitting بـ Vite
- Lazy loading للصور
- Caching بـ Supabase
- Minification للإنتاج

### القياس
- استخدم DevTools
- قياس Core Web Vitals
- تتبع أداء API

---

## 🧪 الاختبار

### أنواع الاختبار
1. **Unit Tests**: اختبار الدوال الفردية
2. **Integration Tests**: اختبار التفاعل بين المكونات
3. **E2E Tests**: اختبار سيناريوهات المستخدم الكاملة
4. **Manual Testing**: الاختبار اليدوي

### الاختبار المحلي
```bash
# الاختبار اليدوي
npm run dev
# ثم اختبر الميزات يدويًا

# فحص الأخطاء
npm run lint

# فحص الأنواع
npm run typecheck
```

---

## 🐛 الأخطاء الشائعة

### 1. خطأ Supabase
```
Error: Invalid API key
```
**الحل**: تحقق من ملف `.env`

### 2. خطأ Port
```
Error: Port 5173 is already in use
```
**الحل**: استخدم port مختلف

### 3. خطأ TypeScript
```
Type 'X' is not assignable to type 'Y'
```
**الحل**: تحقق من الأنواع والواجهات

### 4. خطأ الترجمة
```
Missing translation key: 'button.submit'
```
**الحل**: أضف المفتاح في `translations.ts`

---

## 📋 قائمة المهام

### المرحلة الأولى ✅
- [x] إعداد المشروع
- [x] إنشاء الصفحات الأساسية
- [x] إعداد المصادقة
- [x] تصميم قاعدة البيانات

### المرحلة الثانية 🔄
- [ ] إضافة الاختبارات
- [ ] تحسين الأداء
- [ ] إضافة المزيد من الميزات
- [ ] التوثيق الشامل

### المرحلة الثالثة 📅
- [ ] النشر إلى الإنتاج
- [ ] مراقبة الأداء
- [ ] جمع التعليقات
- [ ] التحديثات والتحسينات

---

## 🔗 الروابط المهمة

- [GitHub Repository](https://github.com/aabderhman201-commits/KING-DESIGNER)
- [Supabase Dashboard](https://supabase.com)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

## 📞 جهات الاتصال

- **المطور**: aabderhman201-commits
- **البريد**: [البريد الإلكتروني]
- **الهاتف**: [رقم الهاتف]

---

**آخر تحديث:** 2026-09-08
**النسخة:** 1.0.0
