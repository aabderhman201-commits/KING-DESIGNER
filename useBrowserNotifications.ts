import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import type { Profile } from '@/types';

interface NotificationPayload {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
}

const NOTIFICATION_TITLES: Record<string, { ar: string; en: string }> = {
  like: { ar: 'إعجاب جديد', en: 'New Like' },
  comment: { ar: 'تعليق جديد', en: 'New Comment' },
  friend_request: { ar: 'طلب صداقة', en: 'Friend Request' },
  friend_accepted: { ar: 'تم قبول الصداقة', en: 'Friend Accepted' },
  message: { ar: 'رسالة جديدة', en: 'New Message' },
  story: { ar: 'قصة جديدة', en: 'New Story' },
  post: { ar: 'منشور جديد', en: 'New Post' },
  reward: { ar: 'مكافأة جديدة', en: 'New Reward' },
  vip: { ar: 'تحديث VIP', en: 'VIP Update' },
  pro: { ar: 'تحديث PRO', en: 'PRO Update' },
  rank: { ar: 'تحديث الرتبة', en: 'Rank Update' },
  ban: { ar: 'تحديث الحظر', en: 'Ban Update' },
  verification: { ar: 'تحديث التوثيق', en: 'Verification Update' },
  report: { ar: 'تحديث البلاغ', en: 'Report Update' },
  default: { ar: 'إشعار جديد', en: 'New Notification' },
};

export function useBrowserNotifications() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const profileRef = useRef<Profile | null>(null);
  profileRef.current = profile;

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  const showNotification = useCallback((title: string, body: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      try {
        const audio = new AudioContext();
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.frequency.value = 660;
        gain.gain.setValueAtTime(0.0001, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.04, audio.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.16);
        oscillator.connect(gain).connect(audio.destination);
        oscillator.start();
        oscillator.stop(audio.currentTime + 0.17);
      } catch { /* audio may require a prior user gesture */ }
      new Notification(title, {
        body,
        icon: '/تصميم_بدون_عنوان.png',
        badge: '/تصميم_بدون_عنوان.png',
        tag: 'king-design',
      });
    } catch {
      // Some browsers require a service worker for notifications
    }
  }, []);

  useEffect(() => {
    if (!profile) return;

    requestPermission();

    const channel = supabase
      .channel('browser-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          const n = payload.new as NotificationPayload;
          const titles = NOTIFICATION_TITLES[n.type] || NOTIFICATION_TITLES.default;
          const title = `King Design - ${titles[lang]}`;
          const actorName = profileRef.current?.display_name || '';
          const body = n.actor_id
            ? `${titles[lang]}${actorName ? ` - ${actorName}` : ''}`
            : titles[lang];
          showNotification(title, body);
        }
      )
      .subscribe();

    // Reconcile missed events when the tab was backgrounded or realtime reconnects.
    const poll = window.setInterval(async () => {
      const { data } = await supabase
        .from('notifications')
        .select('id, user_id, actor_id, type, entity_type, entity_id, is_read, created_at')
        .eq('user_id', profile.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(1);
      const n = data?.[0] as NotificationPayload | undefined;
      if (!n) return;
      const lastSeen = sessionStorage.getItem('king-last-notification');
      if (lastSeen === n.id) return;
      sessionStorage.setItem('king-last-notification', n.id);
      const titles = NOTIFICATION_TITLES[n.type] || NOTIFICATION_TITLES.default;
      showNotification(`King Design - ${titles[lang]}`, n.type === 'message' ? (n as any).content || titles[lang] : titles[lang]);
    }, 10000);

    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(poll);
    };
  }, [profile, lang, requestPermission, showNotification]);

  return { requestPermission };
}
