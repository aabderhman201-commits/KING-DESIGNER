#!/usr/bin/env node

/**
 * KING-DESIGNER - Quick Start Script
 * يقوم بإعداد وتشغيل المشروع تلقائياً
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(type, message) {
  const timestamp = new Date().toLocaleTimeString('en-US');
  const prefix = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warning: `${colors.yellow}⚠${colors.reset}`,
    task: `${colors.cyan}▶${colors.reset}`
  }[type] || '';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

async function runCommand(command, args, description) {
  return new Promise((resolve, reject) => {
    log('task', description);
    
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    proc.on('close', (code) => {
      if (code === 0) {
        log('success', `${description} - تم بنجاح`);
        resolve();
      } else {
        log('error', `${description} - فشل`);
        reject(new Error(`${description} failed with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      log('error', `${description} - خطأ: ${err.message}`);
      reject(err);
    });
  });
}

async function main() {
  console.log(`
${colors.cyan}
╔═══════════════════════════════════════════════════════╗
║         🚀 KING-DESIGNER Quick Setup                  ║
║         إعداد سريع للتطبيق                            ║
╚═══════════════════════════════════════════════════════╝
${colors.reset}
  `);

  try {
    // التحقق من Node.js
    log('info', 'التحقق من المتطلبات...');
    const nodeVersion = process.version;
    log('success', `Node.js ${nodeVersion} مثبت`);

    // التحقق من npm
    const npmVersion = require('child_process')
      .execSync('npm --version')
      .toString()
      .trim();
    log('success', `npm ${npmVersion} مثبت`);

    // التحقق من .env
    if (!fs.existsSync('.env')) {
      log('warning', 'ملف .env غير موجود');
      log('info', 'سيتم استخدام القيم الافتراضية');
    } else {
      log('success', 'ملف .env موجود');
    }

    // تثبيت المتطلبات
    console.log('');
    await runCommand('npm', ['install'], '📦 تثبيت المتطلبات');

    // فحص الأنواع
    console.log('');
    log('task', '🔍 فحص أنواع TypeScript');
    try {
      require('child_process').execSync('npm run typecheck', { stdio: 'inherit' });
      log('success', 'فحص الأنواع - بدون أخطاء');
    } catch (e) {
      log('warning', 'توجد تحذيرات في الأنواع (يمكن متابعة العمل)');
    }

    // فحص الأخطاء
    console.log('');
    log('task', '🔍 فحص أخطاء الكود');
    try {
      require('child_process').execSync('npm run lint', { stdio: 'inherit' });
      log('success', 'فحص الأخطاء - بدون مشاكل');
    } catch (e) {
      log('warning', 'توجد تحذيرات (يمكن متابعة العمل)');
    }

    // بناء المشروع
    console.log('');
    await runCommand('npm', ['run', 'build'], '🏗️ بناء النسخة الإنتاجية');

    console.log(`
${colors.green}
╔═══════════════════════════════════════════════════════╗
║           ✅ تم الإعداد بنجاح!                        ║
╚═══════════════════════════════════════════════════════╝
${colors.reset}

${colors.cyan}📋 الأوامر المتاحة:${colors.reset}

  ${colors.green}npm run dev${colors.reset}        - تشغيل خادم التطوير
  ${colors.green}npm run build${colors.reset}      - بناء النسخة الإنتاجية
  ${colors.green}npm run preview${colors.reset}    - معاينة النسخة المبنية
  ${colors.green}npm run lint${colors.reset}       - فحص الأخطاء
  ${colors.green}npm run typecheck${colors.reset}  - فحص الأنواع

${colors.cyan}🌐 لتشغيل التطبيق الآن:${colors.reset}
  
  ${colors.yellow}npm run dev${colors.reset}

${colors.cyan}ثم افتح في المتصفح:${colors.reset}
  
  ${colors.blue}http://localhost:5173${colors.reset}

${colors.cyan}📝 للمزيد من المعلومات:${colors.reset}
  - README-TESTING.md
  - SETUP-GUIDE.md
  - TESTING-CHECKLIST.md
  - DEVELOPMENT-NOTES.md

    `);

  } catch (error) {
    console.error(`
${colors.red}
❌ حدث خطأ أثناء الإعداد:
${error.message}
${colors.reset}
    `);
    process.exit(1);
  }
}

main();
