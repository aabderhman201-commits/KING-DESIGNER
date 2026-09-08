import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpLeft, CheckCircle2, CircleHelp, Database, ExternalLink, Github, LayoutDashboard, Loader2, RefreshCw, ShieldCheck, Table2, Wifi, XCircle, Zap } from 'lucide-react';
import { EXPECTED_TABLES, supabase } from './lib/supabase';

type TestState = 'idle' | 'loading' | 'success' | 'error';
type Row = Record<string, unknown>;

const projectRef = 'wxgekvzrqnnmacvsbibk';
const repoUrl = 'https://github.com/aabderhman201-commits/KING-DESIGNER';
const features = [
  ['قاعدة بيانات PostgreSQL', 'جداول وعلاقات واستعلامات SQL مع سياسات RLS.'],
  ['مصادقة المستخدمين', 'تسجيل ودخول واستعادة كلمة المرور والجلسات الآمنة.'],
  ['التخزين والوسائط', 'رفع الصور والملفات عبر Storage buckets وروابط عامة أو محمية.'],
  ['التحديثات الفورية', 'Realtime للاستماع إلى تغييرات الجداول وبناء تجربة حية.'],
  ['Edge Functions', 'تشغيل منطق خلفي دون إدارة خادم تقليدي.'],
  ['لوحة SQL وواجهات API', 'إدارة المخطط، migrations، وREST/JS client جاهز.'],
];

function formatValue(value: unknown) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function App() {
  const [state, setState] = useState<TestState>('idle');
  const [message, setMessage] = useState('لم يبدأ الاختبار بعد');
  const [testedAt, setTestedAt] = useState<string | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [sample, setSample] = useState<Row[]>([]);
  const [activeSection, setActiveSection] = useState<'overview' | 'data' | 'guide'>('overview');

  const runTest = useCallback(async () => {
    setState('loading');
    setMessage('جارٍ الاتصال بـ Supabase وقراءة مخطط public…');
    setSample([]);
    try {
      const { data, error } = await supabase.from('profiles').select('*').limit(5);
      if (error) {
        if (error.code === '42P01' || /relation .* does not exist/i.test(error.message)) {
          setTables([]);
          setState('success');
          setMessage('تم الوصول إلى المشروع، لكن مخطط public لا يحتوي جداول بعد.');
        } else {
          throw error;
        }
      } else {
        setTables(['profiles']);
        setSample((data as Row[]) ?? []);
        setState('success');
        setMessage('تم الاتصال وقراءة جدول profiles بنجاح.');
      }
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'تعذر إكمال الاختبار.');
    } finally {
      setTestedAt(new Date().toLocaleString('ar-EG'));
    }
  }, []);

  useEffect(() => { void runTest(); }, [runTest]);

  const status = useMemo(() => ({
    label: state === 'loading' ? 'جارٍ الاختبار' : state === 'success' ? 'متصل' : state === 'error' ? 'يحتاج مراجعة' : 'جاهز للاختبار',
    color: state === 'error' ? 'text-rose-300' : state === 'success' ? 'text-emerald-300' : 'text-cyan-300',
  }), [state]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#07111f] text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-50 [background-image:radial-gradient(circle_at_15%_10%,#164e63_0,transparent_35%),radial-gradient(circle_at_85%_85%,#172554_0,transparent_34%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20"><Database size={22} /></div>
            <div><p className="text-lg font-extrabold tracking-tight">KING DESIGNER</p><p className="text-xs text-slate-400">مركز التحكم والاختبار</p></div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> بيئة جاهزة للمراجعة</div>
        </header>

        <main className="grid flex-1 gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="panel h-fit p-3 lg:sticky lg:top-5">
            <div className="mb-3 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Workspace</div>
            {([['overview', 'نظرة عامة', LayoutDashboard], ['data', 'البيانات المسترجعة', Table2], ['guide', 'طريقة الاستخدام', CircleHelp]] as const).map(([id, label, Icon]) => (
              <button key={id} onClick={() => setActiveSection(id)} className={`mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-right text-sm font-semibold transition ${activeSection === id ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}><Icon size={18} />{label}</button>
            ))}
            <div className="mt-5 border-t border-white/10 pt-4"><p className="px-3 text-xs text-slate-500">المشروع المتصل</p><p className="px-3 pt-1 text-sm font-bold text-slate-200">KING-DESIGNER</p><p className="px-3 text-xs text-slate-500">{projectRef}</p></div>
          </aside>

          <section className="space-y-6">
            <div className="panel relative overflow-hidden p-6 sm:p-8"><div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end"><div className="max-w-2xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200"><Zap size={14} /> لوحة تكامل موثوقة</div><h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">كل بياناتك، في <span className="text-cyan-300">مكان واحد.</span></h1><p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">اختبر اتصال Supabase، راقب حالة المخطط، وافهم بالضبط ما الذي تم جلبه من مشروعك. الواجهة مصممة للعمل بسلاسة على الهاتف والكمبيوتر.</p></div><button className="primary-button flex items-center justify-center gap-2" onClick={() => void runTest()} disabled={state === 'loading'}>{state === 'loading' ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />} إعادة الاختبار</button></div>
            </div>

            {activeSection === 'overview' && <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={<Wifi />} label="حالة الاتصال" value={status.label} detail={testedAt ?? 'بانتظار الاختبار'} tone={status.color} /><Metric icon={<Table2 />} label="الجداول المكتشفة" value={String(tables.length)} detail={`من ${EXPECTED_TABLES.length} متوقعة`} tone="text-cyan-300" /><Metric icon={<Activity />} label="آخر نتيجة" value={state === 'error' ? 'فشل' : state === 'success' ? 'ناجح' : '—'} detail="قراءة مباشرة من العميل" tone={status.color} /><Metric icon={<ShieldCheck />} label="المشروع" value="ACTIVE" detail="Supabase project" tone="text-emerald-300" /></div>
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"><div className="panel p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold">نتيجة اختبار الموصل</h2><p className="mt-1 text-xs text-slate-500">قراءة آمنة بحد أقصى 5 سجلات</p></div>{state === 'success' ? <CheckCircle2 className="text-emerald-300" /> : state === 'error' ? <XCircle className="text-rose-300" /> : <Activity className="text-cyan-300" />}</div><div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-slate-300">{message}</div>{testedAt && <p className="mt-3 text-xs text-slate-500">وقت الاختبار: {testedAt}</p>}{state === 'success' && tables.length === 0 && <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-7 text-amber-100">الاتصال يعمل، لكن قاعدة البيانات الحالية فارغة من جداول public. طبّق ملفات SQL الموجودة في المستودع عبر Supabase migrations، ثم أعد الاختبار.</div>}</div><div className="panel p-6"><h2 className="mb-4 font-bold">مزامنة GitHub</h2><div className="space-y-4 text-sm"><InfoRow label="المستودع" value="KING-DESIGNER" /><InfoRow label="الفرع" value="main" /><InfoRow label="آخر commit" value="0b72b6a" /><a className="soft-button flex items-center justify-center gap-2" href={repoUrl} target="_blank" rel="noreferrer">فتح المستودع <ExternalLink size={15} /></a></div></div></div>
              <div className="panel p-6"><h2 className="mb-5 font-bold">قدرات Supabase المستخدمة</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{features.map(([title, description]) => <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><h3 className="text-sm font-bold text-cyan-200">{title}</h3><p className="mt-2 text-xs leading-6 text-slate-400">{description}</p></div>)}</div></div>
            </>}

            {activeSection === 'data' && <DataSection tables={tables} sample={sample} />}
            {activeSection === 'guide' && <GuideSection />}
          </section>
        </main>
        <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-white/10 py-5 text-xs text-slate-500 sm:flex-row"><span>Supabase Connector · KING DESIGNER</span><a className="flex items-center gap-1 hover:text-cyan-300" href={repoUrl} target="_blank" rel="noreferrer"><Github size={14} /> GitHub repository <ArrowUpLeft size={14} /></a></footer>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, detail, tone }: { icon: React.ReactNode; label: string; value: string; detail: string; tone: string }) { return <div className="panel p-5"><div className="mb-4 flex items-center justify-between text-slate-500"><span className="text-xs">{label}</span><span className={tone}>{icon}</span></div><p className={`text-2xl font-extrabold ${tone}`}>{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>; }
function InfoRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3"><span className="text-slate-500">{label}</span><span className="font-semibold text-slate-200">{value}</span></div>; }
function DataSection({ tables, sample }: { tables: string[]; sample: Row[] }) { return <div className="space-y-6"><div className="panel p-6"><h2 className="text-xl font-bold">البيانات التي تم جلبها</h2><p className="mt-2 text-sm leading-7 text-slate-400">هذه الشاشة لا تعرض بيانات وهمية. ما يظهر هنا هو ناتج الاستعلام الحقيقي من Supabase في آخر اختبار.</p>{sample.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-slate-500">لا توجد سجلات مقروءة حاليًا. عند وجود جدول profiles وبيانات مسموح بها عبر RLS ستظهر هنا.</div> : <pre className="mt-6 max-h-96 overflow-auto rounded-2xl bg-black/30 p-4 text-left text-xs leading-6 text-cyan-100" dir="ltr">{JSON.stringify(sample, null, 2)}</pre>}</div><div className="panel p-6"><h2 className="mb-4 font-bold">الجداول المكتشفة في هذا الاختبار</h2>{tables.length ? <div className="flex flex-wrap gap-2">{tables.map(table => <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200" key={table}>{table}</span>)}</div> : <p className="text-sm text-slate-500">لم يُكتشف أي جدول عبر العميل العام؛ تحقّق من تطبيق migrations وRLS.</p>}</div></div>; }
function GuideSection() { return <div className="space-y-6"><div className="panel p-6"><h2 className="text-xl font-bold">كيفية استخدام الموصل</h2><div className="mt-5 space-y-4 text-sm leading-8 text-slate-300"><p><b className="text-cyan-200">1. الاختبار:</b> اضغط «إعادة الاختبار»؛ يقرأ التطبيق جدول <code className="rounded bg-white/10 px-1.5">profiles</code> بحد أقصى خمسة سجلات باستخدام مفتاح العميل العام.</p><p><b className="text-cyan-200">2. عرض البيانات:</b> افتح «البيانات المسترجعة» لرؤية JSON الفعلي الذي سمحت به سياسات RLS. إذا كانت النتيجة فارغة فهذا لا يعني أن الاتصال فشل.</p><p><b className="text-cyan-200">3. تجهيز الجداول:</b> طبّق ملفات SQL الموجودة في جذر المستودع بالترتيب داخل Supabase SQL Editor أو عبر migrations، ثم أعد الاختبار.</p><p><b className="text-cyan-200">4. ربط GitHub:</b> المستودع مرتبط بالمشروع عبر ملفات migrations وملف البيئة المحلي. أي تغيير في المخطط يجب حفظه في SQL داخل GitHub ثم تطبيقه على المشروع.</p></div></div><div className="panel p-6"><h2 className="mb-4 font-bold">ملاحظة أمنية</h2><p className="text-sm leading-7 text-slate-400">المفتاح الموجود في الواجهة هو publishable/anon key فقط. لا تضع service role key في المتصفح. احمِ كل جدول بسياسات Row Level Security، واستخدم Edge Functions للعمليات الحساسة.</p></div></div>; }

export default App;
