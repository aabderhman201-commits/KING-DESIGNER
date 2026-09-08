import { getInitials, getAvatarUrl, getNameColor, getDisplayName } from '@/lib/helpers';
import { Shield, Crown, Star, Award } from 'lucide-react';
import type { Profile } from '@/types';

interface AvatarProps {
  user: Profile | null | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showRing?: boolean;
  showVerified?: boolean;
  showAdmin?: boolean;
  showBadges?: boolean;
  onClick?: () => void;
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
  '2xl': 'w-28 h-28 text-3xl',
};

function getFrameClass(user: Profile | null | undefined): string {
  if (!user) return '';
  if (user.designer_rank === 10) return 'avatar-frame-king';
  if (user.is_pro) return 'avatar-frame-pro';
  if (user.is_verified) return 'avatar-frame-verified';
  return '';
}

export function Avatar({ user, size = 'md', showRing = false, showVerified = false, showAdmin = false, showBadges = false, onClick }: AvatarProps) {
  const avatarUrl = getAvatarUrl(user);
  const gifUrl = user?.avatar_gif_url;
  const nameColor = getNameColor(user);
  const displayName = getDisplayName(user);
  const initials = getInitials(displayName);
  const frameClass = showRing ? getFrameClass(user) : '';
  const showGif = gifUrl && (user?.vip_level ?? 0) >= 3;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${sizeMap[size]} ${frameClass} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {avatarUrl && !user?.photo_banned ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className={`w-full h-full rounded-full object-cover ${showRing ? 'p-0.5' : ''}`}
        />
      ) : showGif ? (
        <img
          src={gifUrl}
          alt={displayName}
          className={`w-full h-full rounded-full object-cover ${showRing ? 'p-0.5' : ''}`}
        />
      ) : (
        <div
          className={`w-full h-full rounded-full flex items-center justify-center font-semibold ${showRing ? 'p-0.5' : ''} bg-king-100 dark:bg-surface-dark-border`}
          style={nameColor ? { color: nameColor, backgroundColor: nameColor + '20' } : undefined}
        >
          <span className={showRing ? 'p-0.5' : ''}>{initials}</span>
        </div>
      )}
      {showVerified && user?.is_verified && (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success-500 rounded-full border-2 border-white dark:border-surface-dark-card flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      {showAdmin && user?.is_admin && (
        <div className="absolute -top-0.5 -left-0.5 w-4 h-4 bg-king-600 rounded-full border-2 border-white dark:border-surface-dark-card flex items-center justify-center" title="Admin">
          <Shield className="w-2.5 h-2.5 text-white" />
        </div>
      )}
      {showBadges && (user?.vip_level || 0) > 0 && (
        <div className="absolute -top-1 -right-1 badge-vip-tag">
          <Crown className="w-2 h-2" /> V{user?.vip_level}
        </div>
      )}
      {showBadges && user?.is_pro && (user?.vip_level || 0) === 0 && (
        <div className="absolute -top-1 -right-1 badge-pro-tag">
          <Star className="w-2 h-2" /> PRO
        </div>
      )}
      {showBadges && (user?.designer_rank || 0) > 0 && !user?.is_pro && (user?.vip_level || 0) === 0 && (
        <div className="absolute -top-1 -right-1 badge-rank-tag">
          <Award className="w-2 h-2" /> R{user?.designer_rank}
        </div>
      )}
    </div>
  );
}
