import { useState, useEffect, useCallback } from 'react';
import { Users, Flag, Shield, Crown, Award, Send, Ban, Clock, Image as ImageIcon, Check, X, Search, FileText, Bell, Star, Upload, Plus, Trash2, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import { Avatar } from '@/components/Avatar';
import { getDisplayName, getNameColor, getRankName, formatTime } from '@/lib/helpers';
import type { Profile, Report, Verification, AvatarFrame } from '@/types';

type AdminTab = 'users' | 'reports' | 'verifications' | 'broadcast' | 'frames' | 'settings';

interface AdminPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export function AdminPage({ onNavigate }: AdminPageProps) {
  const { profile } = useAuth();
  const { t } = useLang();
  const [tab, setTab] = useState<AdminTab>('users');

  if (!profile?.is_admin) {
    return <div className="card p-8 text-center text-gray-500">{t('loading')}</div>;
  }

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'users', label: t('users'), icon: <Users className="w-4 h-4" /> },
    { id: 'reports', label: t('reports'), icon: <Flag className="w-4 h-4" /> },
    { id: 'verifications', label: t('verifications'), icon: <Shield className="w-4 h-4" /> },
    { id: 'frames', label: t('avatarFrames'), icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'broadcast', label: t('broadcast'), icon: <Bell className="w-4 h-4" /> },
    { id: 'settings', label: 'إعدادات التنزيل والبطاقات', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Crown className="w-7 h-7 text-king-500" />
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-king-50">{t('adminPanel')}</h1>
          <p className="text-xs text-gray-500">{t('kingDesignManagement')}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              tab === t.id ? 'bg-king-500 text-white' : 'btn-secondary'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && <UsersManager onNavigate={onNavigate} />}
      {tab === 'reports' && <ReportsManager onNavigate={onNavigate} />}
      {tab === 'verifications' && <VerificationsManager />}
      {tab === 'frames' && <AvatarFramesManager />}
      {tab === 'broadcast' && <BroadcastManager />}
      {tab === 'settings' && <AdminSettingsManager />}
    </div>
  );
}

function UsersManager({ onNavigate }: { onNavigate: (page: string, params?: Record<string, string>) => void }) {
  const { t } = useLang();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const fetchUsers = useCallback(async () => {
    let q = supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
    if (search) {
      const numSearch = parseInt(search);
      if (!isNaN(numSearch)) {
        q = q.eq('king_id', numSearch);
      } else {
        q = q.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
    }
    const { data } = await q;
    setUsers((data as Profile[]) || []);
  }, [search]);

  useEffect(() => {
    fetchUsers().finally(() => setLoading(false));
  }, [fetchUsers]);

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="card p-4 shimmer-bg h-16" />)}</div>;
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('searchUsers')} className="input-field pl-10" />
      </div>

      {users.map((user) => {
        const nameColor = getNameColor(user);
        return (
          <div key={user.id} className="card p-3 flex items-center gap-3">
            <Avatar user={user} size="md" showVerified showAdmin onClick={() => onNavigate('profile', { userId: user.id })} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-medium truncate" style={nameColor ? { color: nameColor } : undefined}>{getDisplayName(user)}</p>
                {user.is_pro && <span className="badge badge-pro text-[10px]">PRO</span>}
                {user.vip_level > 0 && <span className="badge badge-vip text-[10px]">VIP{user.vip_level}</span>}
                {user.designer_rank > 0 && <span className="badge badge-rank text-[10px]">R{user.designer_rank}</span>}
                {user.is_banned && <span className="badge bg-error-500 text-white text-[10px]">{t('banned')}</span>}
              </div>
              <p className="text-xs text-gray-500">{t('id')}: {user.king_id} · {user.account_type}</p>
            </div>
            <button onClick={() => setSelectedUser(user)} className="btn-secondary text-sm">{t('manage')}</button>
          </div>
        );
      })}

      {selectedUser && <UserManagementModal user={selectedUser} onClose={() => { setSelectedUser(null); fetchUsers(); }} />}
    </div>
  );
}

function UserManagementModal({ user, onClose }: { user: Profile; onClose: () => void }) {
  const { t } = useLang();
  const [vipLevel, setVipLevel] = useState(user.vip_level);
  const [isPro, setIsPro] = useState(user.is_pro);
  const [proColor, setProColor] = useState(user.pro_color || '#F59E0B');
  const [designerRank, setDesignerRank] = useState(user.designer_rank);
  const [banType, setBanType] = useState<'permanent' | 'temporary' | 'photo' | null>(user.ban_type);
  const [banDuration, setBanDuration] = useState('24');
  const [rewardText, setRewardText] = useState('');
  const [notifText, setNotifText] = useState('');
  const [frameUrl, setFrameUrl] = useState(user.avatar_frame_url || '');
  const [gifUrl, setGifUrl] = useState(user.avatar_gif_url || '');
  const [gradientColors, setGradientColors] = useState<string[]>(
    user.name_gradient ? (() => { try { return JSON.parse(user.name_gradient) as string[]; } catch { return []; } })() : []
  );
  const [saving, setSaving] = useState(false);

  const handleUploadAsset = async (file: File, kind: 'frame' | 'gif') => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (kind === 'frame' && extension !== 'gif') return;
    if (kind === 'gif' && extension !== 'gif') return;
    const path = `admin-avatar-assets/${user.id}-${kind}-${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true });
    if (error) return;
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
    if (kind === 'frame') setFrameUrl(publicUrl);
    else setGifUrl(publicUrl);
  };

  const handleSave = async () => {
    setSaving(true);
    let banUntil: string | null = null;
    let isBanned = false;
    let photoBanned = false;

    if (banType === 'permanent') {
      isBanned = true;
      banUntil = null;
    } else if (banType === 'temporary') {
      isBanned = true;
      banUntil = new Date(Date.now() + parseInt(banDuration) * 3600000).toISOString();
    } else if (banType === 'photo') {
      photoBanned = true;
    }

    await supabase.from('profiles').update({
      vip_level: vipLevel,
      is_pro: isPro,
      pro_color: proColor,
      designer_rank: designerRank,
      ban_type: banType,
      ban_until: banUntil,
      is_banned: isBanned,
      photo_banned: photoBanned,
      avatar_frame_url: frameUrl || null,
      avatar_gif_url: gifUrl || null,
      name_gradient: gradientColors.length > 0 ? JSON.stringify(gradientColors) : null,
    }).eq('id', user.id);

    if (banType && banType !== user.ban_type) {
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'ban',
        content: `Your account has been ${banType === 'permanent' ? 'permanently banned' : banType === 'temporary' ? `temporarily banned for ${banDuration} hours` : 'photo-banned'}.`,
      });
    }

    setSaving(false);
    onClose();
  };

  const handleUnban = async () => {
    setSaving(true);
    await supabase.from('profiles').update({
      ban_type: null,
      ban_until: null,
      is_banned: false,
      photo_banned: false,
    }).eq('id', user.id);
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'unban',
      content: 'Your account restriction has been lifted.',
    });
    setSaving(false);
    onClose();
  };

  const handleReward = async () => {
    if (!rewardText.trim()) return;
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'reward',
      content: `You received a reward: ${rewardText}`,
    });
    setRewardText('');
  };

  const handleSendNotif = async () => {
    if (!notifText.trim()) return;
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'admin_notification',
      content: notifText,
    });
    setNotifText('');
  };

  const handleVerify = async () => {
    await supabase.from('profiles').update({ is_verified: true }).eq('id', user.id);
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'verification_approved',
      content: 'Your account has been verified by the admin.',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-surface-dark-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-surface-dark-card z-10">
          <div className="flex items-center gap-3">
            <Avatar user={user} size="md" showVerified showAdmin />
            <div>
              <h2 className="font-display font-bold text-gray-900 dark:text-king-50">{getDisplayName(user)}</h2>
              <p className="text-xs text-gray-500">{t('id')}: {user.king_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-king-100 dark:hover:bg-surface-dark-alt rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-5">
          {/* VIP Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('vipLevel')}</label>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setVipLevel(lvl)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    vipLevel === lvl ? 'bg-king-500 text-white' : 'bg-king-100 dark:bg-surface-dark-alt text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* PRO Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('proStatus')}</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPro(!isPro)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${isPro ? 'bg-king-500 text-white' : 'btn-secondary'}`}
              >
                {isPro ? t('proActive') : t('proInactive')}
              </button>
              {isPro && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{t('color')}:</span>
                  <input type="color" value={proColor} onChange={(e) => setProColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                </div>
              )}
            </div>
          </div>

          {/* Name Gradient */}
          <div className="pt-3 border-t border-king-100 dark:border-surface-dark-border">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('nameGradient')}</label>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {gradientColors.map((color, i) => (
                <div key={i} className="flex items-center gap-1">
                  <input type="color" value={color} onChange={(e) => setGradientColors(gradientColors.map((c, idx) => idx === i ? e.target.value : c))} className="w-7 h-7 rounded cursor-pointer" />
                  <button onClick={() => setGradientColors(gradientColors.filter((_, idx) => idx !== i))} className="text-error-500"><X className="w-3 h-3" /></button>
                </div>
              ))}
              {gradientColors.length < 4 && (
                <button onClick={() => setGradientColors([...gradientColors, '#F59E0B'])} className="text-xs text-king-500 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> {t('addColor')}
                </button>
              )}
            </div>
            {gradientColors.length >= 2 && (
              <div className="text-sm font-medium" style={{
                backgroundImage: `linear-gradient(135deg, ${gradientColors.join(', ')})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {getDisplayName(user)}
              </div>
            )}
            {gradientColors.length === 1 && <p className="text-xs text-gray-500">{t('singleColor')}</p>}
            {gradientColors.length >= 2 && <p className="text-xs text-gray-500">{t('gradientColor')}</p>}
          </div>

          {/* Designer Rank */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('designerRank')}</label>
            <div className="flex gap-1 flex-wrap">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rank) => (
                <button
                  key={rank}
                  onClick={() => setDesignerRank(rank)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    designerRank === rank ? 'bg-king-600 text-white' : 'bg-king-100 dark:bg-surface-dark-alt text-gray-600 dark:text-gray-400'
                  }`}
                  title={getRankName(rank)}
                >
                  {rank}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('current')}: {getRankName(designerRank)}</p>
          </div>

          {/* Ban Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('banControl')}</label>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setBanType('permanent')} className={`btn text-sm flex items-center gap-1 ${banType === 'permanent' ? 'bg-error-500 text-white' : 'btn-secondary'}`}>
                <Ban className="w-3.5 h-3.5" /> {t('permanent')}
              </button>
              <button onClick={() => setBanType('temporary')} className={`btn text-sm flex items-center gap-1 ${banType === 'temporary' ? 'bg-error-500 text-white' : 'btn-secondary'}`}>
                <Clock className="w-3.5 h-3.5" /> {t('temporary')}
              </button>
              <button onClick={() => setBanType('photo')} className={`btn text-sm flex items-center gap-1 ${banType === 'photo' ? 'bg-error-500 text-white' : 'btn-secondary'}`}>
                <ImageIcon className="w-3.5 h-3.5" /> {t('photoBan')}
              </button>
              {user.is_banned && (
                <button onClick={handleUnban} className="btn text-sm bg-success-500 text-white flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {t('unban')}
                </button>
              )}
            </div>
            {banType === 'temporary' && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">{t('duration')}:</span>
                <input type="number" value={banDuration} onChange={(e) => setBanDuration(e.target.value)} className="input-field text-sm w-24 py-1.5" />
              </div>
            )}
          </div>

          {/* Avatar assets */}
          <div className="pt-3 border-t border-king-100 dark:border-surface-dark-border space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('customFrame')}</label>
            <label className="btn-secondary text-sm flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" /> {t('uploadGifAvatar')}
              <input type="file" accept="image/gif,.gif" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUploadAsset(file, 'frame'); }} />
            </label>
            {frameUrl && (
              <div className="relative w-16 h-16 mx-auto">
                <img src={frameUrl} alt="frame" className="w-16 h-16 object-contain" />
                <button onClick={() => setFrameUrl('')} className="absolute -top-1 -right-1 bg-error-500 text-white rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('uploadGifAvatar')}</label>
            <label className={`btn-secondary text-sm flex items-center justify-center gap-2 cursor-pointer ${user.vip_level < 3 ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload className="w-4 h-4" /> {user.vip_level < 3 ? t('gifVipRequired') : t('uploadGifAvatar')}
              <input type="file" accept="image/gif,.gif" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUploadAsset(file, 'gif'); }} />
            </label>
            {gifUrl && user.vip_level >= 3 && <img src={gifUrl} alt="gif avatar" className="w-16 h-16 rounded-full object-cover mx-auto" />}
          </div>

          {/* Verify */}
          <div>
            <button onClick={handleVerify} disabled={user.is_verified} className="btn-secondary text-sm flex items-center gap-1.5 w-full justify-center">
              <Shield className="w-4 h-4" /> {user.is_verified ? t('alreadyVerified') : t('verifyUser')}
            </button>
          </div>

          {/* Reward */}
          <div className="pt-3 border-t border-king-100 dark:border-surface-dark-border">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-king-500" /> {t('sendReward')}
            </label>
            <div className="flex gap-2">
              <input value={rewardText} onChange={(e) => setRewardText(e.target.value)} placeholder={t('rewardDescription')} className="input-field text-sm" />
              <button onClick={handleReward} className="btn-primary text-sm px-3"><Send className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Admin Notification */}
          <div className="pt-3 border-t border-king-100 dark:border-surface-dark-border">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-king-500" /> {t('sendAdminNotification')}
            </label>
            <div className="flex gap-2">
              <input value={notifText} onChange={(e) => setNotifText(e.target.value)} placeholder={t('notificationMessage')} className="input-field text-sm" />
              <button onClick={handleSendNotif} className="btn-primary text-sm px-3"><Send className="w-4 h-4" /></button>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
            {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : t('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportsManager({ onNavigate }: { onNavigate: (page: string, params?: Record<string, string>) => void }) {
  const { t } = useLang();
  const [reports, setReports] = useState<(Report & { reporter: Profile | null; reported_user: Profile | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [defaultReply, setDefaultReply] = useState('Thank you for your report. We will take action after reviewing.');

  const fetchReports = useCallback(async () => {
    const { data } = await supabase
      .from('reports')
      .select('*, reporter:profiles!reports_reporter_id_fkey(*), reported_user:profiles!reports_reported_user_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setReports(data as (Report & { reporter: Profile | null; reported_user: Profile | null })[]);
  }, []);

  useEffect(() => {
    fetchReports().finally(() => setLoading(false));
  }, [fetchReports]);

  const handleReply = async (reportId: string, reporterId: string, status: 'actioned' | 'dismissed') => {
    const reply = replyText[reportId] || defaultReply;
    await supabase.from('reports').update({
      admin_reply: reply,
      status,
      replied_at: new Date().toISOString(),
    }).eq('id', reportId);
    await supabase.from('notifications').insert({
      user_id: reporterId,
      type: 'report_reply',
      content: `Report update: ${reply}`,
    });
    setReplyText({ ...replyText, [reportId]: '' });
    fetchReports();
  };

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="card p-4 shimmer-bg h-24" />)}</div>;
  }

  return (
    <div className="space-y-3">
      <div className="card p-3">
        <label className="text-xs text-gray-500 block mb-1">{t('defaultReplyMessage')}</label>
        <input value={defaultReply} onChange={(e) => setDefaultReply(e.target.value)} className="input-field text-sm" />
      </div>

      {reports.length === 0 ? (
        <div className="card p-8 text-center text-gray-500"><Flag className="w-12 h-12 mx-auto mb-2 opacity-30" />{t('noReports')}</div>
      ) : (
        reports.map((report) => (
          <div key={report.id} className="card p-4">
            <div className="flex items-start gap-3 mb-3">
              <Avatar user={report.reporter} size="sm" />
              <div className="flex-1">
                <p className="text-sm font-medium">{getDisplayName(report.reporter)}</p>
                <p className="text-xs text-gray-500">reported {report.entity_type} · {formatTime(report.created_at)}</p>
              </div>
              <span className={`badge text-[10px] ${
                report.status === 'pending' ? 'bg-king-100 dark:bg-surface-dark-alt text-king-600 dark:text-king-400' :
                report.status === 'actioned' ? 'bg-success-100 dark:bg-success-700/30 text-success-600' :
                'bg-gray-100 dark:bg-surface-dark-border text-gray-500'
              }`}>{report.status}</span>
            </div>

            <div className="bg-king-50 dark:bg-surface-dark-alt rounded-xl p-3 mb-2">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">{t('reason')}:</span> {report.reason}
              </p>
              {report.reported_user && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-king-100 dark:border-surface-dark-border">
                  <Avatar user={report.reported_user} size="sm" showVerified showAdmin />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{getDisplayName(report.reported_user)}</p>
                    <p className="text-xs text-gray-500">{t('id')}: {report.reported_user.king_id}</p>
                  </div>
                  <button onClick={() => onNavigate('profile', { userId: report.reported_user!.id })} className="text-xs text-king-500 hover:text-king-600">
                    {t('viewProfile')}
                  </button>
                </div>
              )}
              {report.video_url && (
                <a href={report.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-king-500 hover:text-king-600 mt-2">
                  <Play className="w-3.5 h-3.5" /> {t('videoAttached')}
                </a>
              )}
            </div>

            {report.status === 'pending' && (
              <div className="space-y-2">
                <input
                  value={replyText[report.id] || ''}
                  onChange={(e) => setReplyText({ ...replyText, [report.id]: e.target.value })}
                  placeholder={defaultReply}
                  className="input-field text-sm"
                />
                <div className="flex gap-2">
                  <button onClick={() => handleReply(report.id, report.reporter_id, 'actioned')} className="btn-primary text-sm flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {t('actionTaken')}
                  </button>
                  <button onClick={() => handleReply(report.id, report.reporter_id, 'dismissed')} className="btn-secondary text-sm flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> {t('dismiss')}
                  </button>
                </div>
              </div>
            )}

            {report.admin_reply && (
              <div className="mt-2 text-xs text-gray-500">
                <span className="font-medium">{t('adminReply')}:</span> {report.admin_reply}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function AvatarFramesManager() {
  const { t } = useLang();
  const [frames, setFrames] = useState<AvatarFrame[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchFrames = useCallback(async () => {
    const { data } = await supabase.from('avatar_frames').select('*').order('created_at', { ascending: false });
    if (data) setFrames(data as AvatarFrame[]);
  }, []);

  useEffect(() => {
    fetchFrames().finally(() => setLoading(false));
  }, [fetchFrames]);

  const handleUpload = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'gif') return;
    const path = `avatar-frames/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('media').upload(path, file);
    if (error) return;
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
    setNewUrl(publicUrl);
  };

  const handleAdd = async () => {
    if (!newUrl || !newName.trim()) return;
    setSaving(true);
    await supabase.from('avatar_frames').insert({ name: newName.trim(), frame_url: newUrl, is_active: true });
    setSaving(false);
    setNewName('');
    setNewUrl('');
    setShowAdd(false);
    fetchFrames();
  };

  const handleToggle = async (frame: AvatarFrame) => {
    await supabase.from('avatar_frames').update({ is_active: !frame.is_active, updated_at: new Date().toISOString() }).eq('id', frame.id);
    fetchFrames();
  };

  const handleReplace = async (frame: AvatarFrame, file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'gif') return;
    const path = `avatar-frames/${frame.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(path, file);
    if (error) return;
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
    await supabase.from('avatar_frames').update({ frame_url: publicUrl, updated_at: new Date().toISOString() }).eq('id', frame.id);
    fetchFrames();
  };

  const handleDelete = async (frame: AvatarFrame) => {
    await supabase.from('avatar_frames').delete().eq('id', frame.id);
    fetchFrames();
  };

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="card p-4 shimmer-bg h-24" />)}</div>;
  }

  return (
    <div className="space-y-3">
      <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2">
        <Plus className="w-4 h-4" /> {t('addFrame')}
      </button>

      {showAdd && (
        <div className="card p-4 space-y-3">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t('frameName')} className="input-field" />
          <label className="block border-2 border-dashed border-king-200 dark:border-surface-dark-border rounded-xl p-3 text-center text-xs text-gray-500 cursor-pointer">
            {newUrl ? t('videoAttached').replace('فيديو', 'إطار') : t('uploadFrame')}
            <input type="file" accept="image/gif,.gif" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
          </label>
          {newUrl && <img src={newUrl} alt="preview" className="w-16 h-16 object-contain mx-auto" />}
          <button onClick={handleAdd} disabled={saving || !newUrl || !newName.trim()} className="btn-primary w-full">
            {saving ? t('loading') : t('addFrame')}
          </button>
        </div>
      )}

      {frames.length === 0 ? (
        <div className="card p-8 text-center text-gray-500"><ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />{t('noFrames')}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {frames.map((frame) => (
            <div key={frame.id} className="card p-3 text-center">
              <div className="relative inline-block mb-2">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-surface-dark-alt mx-auto" />
                <img src={frame.frame_url} alt={frame.name} className="absolute inset-0 w-16 h-16 object-contain mx-auto pointer-events-none" />
              </div>
              <p className="text-sm font-medium truncate">{frame.name}</p>
              <span className={`badge text-[10px] mb-2 inline-block ${frame.is_active ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-500'}`}>
                {frame.is_active ? t('frameActive') : t('frameInactive')}
              </span>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <button onClick={() => handleToggle(frame)} className={`text-xs px-2 py-1 rounded-lg ${frame.is_active ? 'bg-gray-100 text-gray-600' : 'bg-success-100 text-success-600'}`}>
                  {frame.is_active ? t('deactivateFrame') : t('activateFrame')}
                </button>
                <label className="text-xs px-2 py-1 rounded-lg bg-king-100 text-king-600 cursor-pointer">
                  {t('replaceFrame')}
                  <input type="file" accept="image/gif,.gif" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReplace(frame, f); }} />
                </label>
                <button onClick={() => handleDelete(frame)} className="text-error-500 hover:text-error-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VerificationsManager() {
  const { t } = useLang();
  const [verifications, setVerifications] = useState<(Verification & { user: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVerifications = useCallback(async () => {
    const { data } = await supabase
      .from('verifications')
      .select('*, user:profiles!verifications_user_id_fkey(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (data) setVerifications(data as (Verification & { user: Profile })[]);
  }, []);

  useEffect(() => {
    fetchVerifications().finally(() => setLoading(false));
  }, [fetchVerifications]);

  const handleApprove = async (verif: Verification) => {
    await supabase.from('verifications').update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
    }).eq('id', verif.id);
    await supabase.from('profiles').update({ is_verified: true }).eq('id', verif.user_id);
    await supabase.from('notifications').insert({
      user_id: verif.user_id,
      type: 'verification_approved',
      content: 'Your identity verification has been approved. You now have a verified badge!',
    });
    fetchVerifications();
  };

  const handleReject = async (verif: Verification, note: string) => {
    await supabase.from('verifications').update({
      status: 'rejected',
      admin_note: note,
      reviewed_at: new Date().toISOString(),
    }).eq('id', verif.id);
    await supabase.from('notifications').insert({
      user_id: verif.user_id,
      type: 'verification_rejected',
      content: `Your verification was not approved. ${note}`,
    });
    fetchVerifications();
  };

  if (loading) {
    return <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="card p-4 shimmer-bg h-24" />)}</div>;
  }

  return (
    <div className="space-y-3">
      {verifications.length === 0 ? (
        <div className="card p-8 text-center text-gray-500"><Shield className="w-12 h-12 mx-auto mb-2 opacity-30" />{t('noPendingVerifications')}</div>
      ) : (
        verifications.map((verif) => (
          <div key={verif.id} className="card p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar user={verif.user} size="md" />
              <div className="flex-1">
                <p className="font-medium">{getDisplayName(verif.user)}</p>
                <p className="text-xs text-gray-500">{t('id')}: {verif.user.king_id} · {formatTime(verif.created_at)}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <a href={verif.id_card_front_url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs flex items-center justify-center gap-1">
                <FileText className="w-3.5 h-3.5" /> {t('idCardFront')}
              </a>
              <a href={verif.id_card_back_url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs flex items-center justify-center gap-1">
                <FileText className="w-3.5 h-3.5" /> {t('idCardBack')}
              </a>
              <a href={verif.cv_url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs flex items-center justify-center gap-1">
                <FileText className="w-3.5 h-3.5" /> {t('cv')}
              </a>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleApprove(verif)} className="btn-primary text-sm flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {t('approve')}
              </button>
              <button onClick={() => handleReject(verif, 'Documents do not meet requirements.')} className="btn-secondary text-sm flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> {t('rejectBtn')}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function BroadcastManager() {
  const { t } = useLang();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleBroadcast = async () => {
    if (!message.trim()) return;
    setSending(true);
    const adminId = '00000000-0000-0000-0000-000000000010';
    const { data: users } = await supabase.from('profiles').select('id').neq('is_admin', true);
    if (users) {
      const notifications = users.map((u) => ({
        user_id: u.id,
        type: 'admin_notification',
        content: message.trim(),
      }));
      for (let i = 0; i < notifications.length; i += 100) {
        await supabase.from('notifications').insert(notifications.slice(i, i + 100));
      }

      const msgText = message.trim();
      for (const u of users) {
        const user1Id = u.id < adminId ? u.id : adminId;
        const user2Id = u.id < adminId ? adminId : u.id;
        const { data: conv } = await supabase
          .from('conversations')
          .select('id')
          .eq('user1_id', user1Id)
          .eq('user2_id', user2Id)
          .maybeSingle();
        if (conv) {
          await supabase.from('messages').insert({
            conversation_id: conv.id,
            sender_id: adminId,
            content: msgText,
            status: 'sent',
          });
        }
      }
    }
    setSending(false);
    setSent(true);
    setMessage('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="font-display font-bold text-lg text-gray-900 dark:text-king-50">{t('broadcastNotification')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('sendToAllUsers')}</p>
      </div>
      <div className="card p-5">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('notificationMessage')}
          rows={5}
          className="input-field resize-none mb-3"
        />
        {sent && <div className="text-success-500 text-sm mb-2 flex items-center gap-1"><Check className="w-4 h-4" /> {t('broadcastSent')}</div>}
        <button onClick={handleBroadcast} disabled={sending || !message.trim()} className="btn-primary w-full flex items-center justify-center gap-2">
          {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> {t('sendToAllUsers')}</>}
        </button>
      </div>
    </div>
  );
}


function AdminSettingsManager() {
  const [enabled, setEnabled] = useState(true);
  const [watermarkText, setWatermarkText] = useState('KING DESIGNER');
  const [opacity, setOpacity] = useState('0.65');
  const [cardDays, setCardDays] = useState('30');
  const [badgeDays, setBadgeDays] = useState('30');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('admin_settings').select('key,value').in('key', ['post_download_watermark', 'profile_card_defaults', 'id_badge_defaults']).then(({ data }) => {
      for (const row of data || []) {
        const value = row.value as Record<string, unknown>;
        if (row.key === 'post_download_watermark') {
          setEnabled(Boolean(value.enabled));
          setWatermarkText(String(value.text || 'KING DESIGNER'));
          setOpacity(String(value.opacity || 0.65));
        }
        if (row.key === 'profile_card_defaults') setCardDays(String(value.duration_days || 30));
        if (row.key === 'id_badge_defaults') setBadgeDays(String(value.duration_days || 30));
      }
    });
  }, []);

  const save = async () => {
    await Promise.all([
      supabase.from('admin_settings').upsert({ key: 'post_download_watermark', value: { enabled, text: watermarkText, opacity: Number(opacity), position: 'bottom-right' } }),
      supabase.from('admin_settings').upsert({ key: 'profile_card_defaults', value: { enabled: true, duration_days: Number(cardDays) } }),
      supabase.from('admin_settings').upsert({ key: 'id_badge_defaults', value: { enabled: true, duration_days: Number(badgeDays) } }),
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="card p-5 space-y-5">
      <div><h2 className="font-display font-bold text-lg">التحكم في تنزيل المنشورات</h2><p className="text-xs text-gray-500 mt-1">إعدادات العلامة المائية وبطاقات الهوية.</p></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> تفعيل العلامة المائية</label>
      <div className="grid md:grid-cols-2 gap-3">
        <label className="text-sm">النص<input value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="input-field mt-1" /></label>
        <label className="text-sm">الشفافية<input type="number" min="0" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(e.target.value)} className="input-field mt-1" /></label>
      </div>
      <div className="border-t border-king-100 dark:border-surface-dark-border pt-4 grid md:grid-cols-2 gap-3">
        <label className="text-sm">مدة بطاقة الملف (بالأيام)<input type="number" min="1" value={cardDays} onChange={(e) => setCardDays(e.target.value)} className="input-field mt-1" /></label>
        <label className="text-sm">مدة شارة ID (بالأيام)<input type="number" min="1" value={badgeDays} onChange={(e) => setBadgeDays(e.target.value)} className="input-field mt-1" /></label>
      </div>
      <button onClick={save} className="btn-primary">{saved ? 'تم الحفظ' : 'حفظ الإعدادات'}</button>
    </div>
  );
}
