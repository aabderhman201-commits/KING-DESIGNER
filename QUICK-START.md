# 🚀 KING-DESIGNER - دليل التشغيل السريع بدون Terminal

تم إضافة طرق متعددة لتشغيل المشروع بدون استخدام Terminal مباشرة.

---

## ⚡ الطريقة الأولى: Windows (الأسهل)

### الخطوة 1️⃣
انقر نقراً مزدوجاً على ملف:
```
setup.bat
```

ستظهر نافذة سوداء وسيتم الإعداد تلقائياً ✅

---

## ⚡ الطريقة الثانية: Mac/Linux

### الخطوة 1️⃣
افتح Terminal وشغّل:
```bash
chmod +x setup.sh
./setup.sh
```

أو انقر نقراً مزدوجاً على `setup.sh`

---

## ⚡ الطريقة الثالثة: Windows PowerShell

### الخطوة 1️⃣
افتح PowerShell واكتب:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
node quick-setup.js
```

---

## ⚡ الطريقة الرابعة: استخدام VS Code

### الخطوة 1️⃣
افتح المجلد في VS Code

### الخطوة 2️⃣
افتح Terminal المدمج: `Ctrl + ~`

### الخطوة 3️⃣
اكتب:
```bash
node quick-setup.js
```

---

## 📝 ماذا سيحدث؟

✅ سيتم التحقق من Node.js و npm
✅ سيتم تثبيت جميع المتطلبات
✅ سيتم فحص الأخطاء والأنواع
✅ سيتم بناء المشروع

---

## 🌐 بعد الانتهاء

ستظهر التعليمات:
```
npm run dev        - لتشغيل الخادم
افتح: http://localhost:5173
```

---

## 🆘 إذا حدثت مشاكل

### المشكلة: "Node.js غير مثبت"
**الحل**: [ثبّت Node.js](https://nodejs.org/)

### المشكلة: "الملفات محمية"
**الحل (Mac/Linux)**:
```bash
chmod +x *.sh
./setup.sh
```

### المشكلة: لا شيء يحدث عند النقر المزدوج
**الحل**: 
- استخدم PowerShell على Windows
- استخدم Terminal على Mac/Linux

---

## 📦 البيانات الحالية

| المفتاح | القيمة |
|--------|--------|
| URL | https://wxgekvzrqnnmacvsbibk.supabase.co |
| مفتاح | sb_publishable_NW_rsrnqQzsj7nDRCN_imw_BN3cDhpp |

✅ جاهزة للاستخدام الفوري!

---

## 🎯 الخطوات السريعة:

1️⃣ **Windows**: انقر على `setup.bat` ⭐
2️⃣ **Mac/Linux**: شغّل `./setup.sh`
3️⃣ **أي نظام**: استخدم `node quick-setup.js`
4️⃣ انتظر الانتهاء ✅
5️⃣ اكتب `npm run dev` 🚀
6️⃣ افتح `http://localhost:5173` 🌐

---

**تم الإعداد بنجاح!** 🎉
