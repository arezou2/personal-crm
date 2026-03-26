const TAG_COLORS = [
  'bg-violet-500/20 text-violet-300',
  'bg-blue-500/20 text-blue-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-amber-500/20 text-amber-300',
  'bg-pink-500/20 text-pink-300',
  'bg-cyan-500/20 text-cyan-300',
  'bg-orange-500/20 text-orange-300',
  'bg-rose-500/20 text-rose-300',
];

const AVATAR_COLORS = [
  'bg-violet-600',
  'bg-blue-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-pink-600',
  'bg-cyan-600',
  'bg-orange-600',
  'bg-rose-600',
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarColor(name) {
  return AVATAR_COLORS[hashString(name || '') % AVATAR_COLORS.length];
}

export function getTagColor(tag) {
  return TAG_COLORS[hashString(tag || '') % TAG_COLORS.length];
}

export default function Avatar({ contact, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
  };

  if (contact.photo) {
    return (
      <img
        src={`/uploads/${contact.photo}`}
        alt={contact.name}
        className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${getAvatarColor(contact.name)} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}>
      {getInitials(contact.name)}
    </div>
  );
}
