import type { CSSProperties } from 'react';
import type { Profile } from '@/types';

export function getDisplayName(user: Profile | null | undefined): string {
  if (!user) return 'Unknown';
  return user.display_name || user.username || `User ${user.king_id}`;
}

export function getAvatarUrl(user: Profile | null | undefined): string | null {
  if (!user) return null;
  return user.avatar_url;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getNameColor(user: Profile | null | undefined): string | undefined {
  if (!user) return undefined;
  if (user.is_pro && user.pro_color) return user.pro_color;
  if (user.vip_level > 0 && user.vip_colors && user.vip_colors.length > 0) {
    return user.vip_colors[0];
  }
  return undefined;
}

export function getNameGradient(user: Profile | null | undefined): string[] | undefined {
  if (!user) return undefined;
  if (user.name_gradient) {
    try {
      const colors = JSON.parse(user.name_gradient);
      if (Array.isArray(colors) && colors.length > 0) return colors;
    } catch { /* invalid JSON */ }
  }
  if (user.is_pro && user.pro_color) return [user.pro_color];
  if (user.vip_level > 0 && user.vip_colors && user.vip_colors.length > 0) {
    return user.vip_colors;
  }
  return undefined;
}

export function shouldUseAnimatedName(user: Profile | null | undefined): boolean {
  if (!user) return false;
  return user.vip_level > 0 || user.is_pro || (user.designer_rank > 0 && user.designer_rank >= 8);
}

export function getNameStyle(user: Profile | null | undefined): CSSProperties | undefined {
  if (!user) return undefined;
  const gradient = getNameGradient(user);
  if (gradient && gradient.length >= 2) {
    const gradientStr = gradient.join(', ');
    return {
      backgroundImage: `linear-gradient(135deg, ${gradientStr})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    };
  }
  if (shouldUseAnimatedName(user)) {
    return undefined;
  }
  const color = getNameColor(user);
  return color ? { color } : undefined;
}

export function getRankName(rank: number): string {
  if (rank === 10) return 'King of Designers';
  const names = ['', 'Novice', 'Beginner', 'Junior', 'Intermediate', 'Skilled', 'Senior', 'Expert', 'Master', 'Grandmaster', 'King of Designers'];
  return names[rank] || 'Unranked';
}

export function getVipBadge(level: number): string {
  if (level === 0) return '';
  return `VIP ${level}`;
}

export function formatTime(dateStr: string, lang: 'ar' | 'en' = 'en'): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (lang === 'ar') {
    if (seconds < 60) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return date.toLocaleDateString('ar-EG');
  }
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function formatLastSeen(dateStr: string | null, lang: 'ar' | 'en' = 'en'): string {
  if (!dateStr) return lang === 'ar' ? 'غير معروف' : 'Unknown';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return lang === 'ar' ? 'متصل الآن' : 'Online now';
  if (lang === 'ar') {
    if (minutes < 60) return `آخر ظهور منذ ${minutes} دقيقة`;
    if (hours < 24) return `آخر ظهور منذ ${hours} ساعة`;
    return `آخر ظهور ${date.toLocaleDateString('ar-EG')}`;
  }
  if (minutes < 60) return `Last seen ${minutes}m ago`;
  if (hours < 24) return `Last seen ${hours}h ago`;
  return `Last seen ${date.toLocaleDateString()}`;
}

export function formatPrice(price: number, currency: string): string {
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', SAR: '﷼', EGP: 'E£', AED: 'د.إ' };
  const symbol = symbols[currency] || currency + ' ';
  return `${symbol}${price.toFixed(2)}`;
}

export function getFileType(filename: string): 'image' | 'video' | 'audio' | 'pdf' | 'gif' | 'file' {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext)) return 'audio';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'gif') return 'gif';
  if (ext === 'svga') return 'gif';
  return 'file';
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export const ENCOURAGEMENT_MESSAGES_EN = [
  'Your creativity lights up the world!',
  'Every design tells a story — what will yours say?',
  'Great designers are made, not born. Keep creating!',
  'The best designs come from the heart.',
  'Your next masterpiece is just one click away.',
  'Design is not just what it looks like — it\'s how it works.',
  'Create with passion, design with purpose.',
  'Every pixel matters. Every color speaks.',
  'You are one design away from greatness.',
  'Let your imagination run wild today!',
  'The world needs your creativity.',
  'Design is the silent ambassador of your brand.',
  'Good design is obvious. Great design is transparent.',
  'Keep pushing boundaries — you\'re doing amazing!',
  'Your art inspires someone right now.',
];

export const ENCOURAGEMENT_MESSAGES_AR = [
  'إبداعك ينير العالم!',
  'كل تصميم يحكي قصة — ماذا ستقول قصتك؟',
  'المصممون العظماء يُصنعون لا يُولدون. استمر في الإبداع!',
  'أفضل التصاميم تأتي من القلب.',
  'تحفتك الفنية القادمة على بُعد نقرة واحدة.',
  'التصميم ليس فقط كيف يبدو — بل كيف يعمل.',
  'أبدع بشغف، صمم بهدف.',
  'كل بكسل مهم. كل لون يتحدث.',
  'أنت على بُعد تصميم واحد من العظمة.',
  'دع خيالك يجري بحرية اليوم!',
  'العالم يحتاج إبداعك.',
  'التصميم هو السفير الصامت لعلامتك التجارية.',
  'التصميم الجيد واضح. التصميم العظيم شفاف.',
  'استمر في تجاوز الحدود — أنت تبلي بلاءً رائعاً!',
  'فنك يلهم شخصاً ما في هذه اللحظة.',
];

export function getEncouragementMessages(lang: 'ar' | 'en'): string[] {
  return lang === 'ar' ? ENCOURAGEMENT_MESSAGES_AR : ENCOURAGEMENT_MESSAGES_EN;
}
