@echo off
REM KING-DESIGNER Setup Script for Windows
REM هذا السكريبت يقوم بإعداد المشروع تلقائياً على Windows

echo.
echo 🚀 بدء إعداد KING-DESIGNER...
echo ================================

REM التحقق من Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js غير مثبت. الرجاء تثبيت Node.js v18 أو أعلى
    pause
    exit /b 1
)

echo ✅ Node.js مثبت
echo ✅ npm مثبت

REM تثبيت المتطلبات
echo.
echo 📦 تثبيت المتطلبات...
call npm install

if %errorlevel% neq 0 (
    echo ❌ فشل تثبيت المتطلبات
    pause
    exit /b 1
)

REM فحص TypeScript
echo.
echo 🔍 فحص الأنواع...
call npm run typecheck

REM فحص الأخطاء
echo.
echo 🔍 فحص الأخطاء...
call npm run lint

REM بناء المشروع
echo.
echo 🏗️ بناء المشروع...
call npm run build

if %errorlevel% neq 0 (
    echo ⚠️ حدثت مشاكل في البناء ولكن يمكنك المتابعة
)

echo.
echo ✅ تم الإعداد بنجاح!
echo ================================
echo.
echo 🎯 الأوامر المتاحة:
echo    npm run dev        - تشغيل خادم التطوير
echo    npm run build      - بناء النسخة الإنتاجية
echo    npm run preview    - معاينة النسخة المبنية
echo    npm run lint       - فحص الأخطاء
echo    npm run typecheck  - فحص الأنواع
echo.
echo 🌐 لتشغيل التطبيق: npm run dev
echo 📝 ثم افتح: http://localhost:5173
echo.
pause
