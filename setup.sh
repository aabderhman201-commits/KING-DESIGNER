#!/bin/bash

# KING-DESIGNER Setup Script
# هذا السكريبت يقوم بإعداد المشروع تلقائياً

echo "🚀 بدء إعداد KING-DESIGNER..."
echo "================================"

# التحقق من Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. الرجاء تثبيت Node.js v18 أو أعلى"
    exit 1
fi

echo "✅ Node.js مثبت: $(node --version)"
echo "✅ npm مثبت: $(npm --version)"

# تثبيت المتطلبات
echo ""
echo "📦 تثبيت المتطلبات..."
npm install

# فحص TypeScript
echo ""
echo "🔍 فحص الأنواع..."
npm run typecheck

# فحص الأخطاء
echo ""
echo "🔍 فحص الأخطاء..."
npm run lint

# بناء المشروع
echo ""
echo "🏗️ بناء المشروع..."
npm run build

echo ""
echo "✅ تم الإعداد بنجاح!"
echo "================================"
echo ""
echo "🎯 الأوامر المتاحة:"
echo "   npm run dev        - تشغيل خادم التطوير"
echo "   npm run build      - بناء النسخة الإنتاجية"
echo "   npm run preview    - معاينة النسخة المبنية"
echo "   npm run lint       - فحص الأخطاء"
echo "   npm run typecheck  - فحص الأنواع"
echo ""
echo "🌐 لتشغيل التطبيق: npm run dev"
echo "📝 ثم افتح: http://localhost:5173"
