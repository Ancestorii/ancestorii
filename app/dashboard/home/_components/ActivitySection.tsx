'use client';

import {
  Users,
  Package,
  Image as ImageIcon,
  Upload,
  Calendar,
} from 'lucide-react';
import type { ExploreStoryPreview } from './FamilyHeader';

export default function ActivitySection({
  activity,
  exploreStories,
}: {
  activity: Array<{
    id: string;
    action: string;
    created_at: string;
  }>;
  exploreStories?: ExploreStoryPreview[];
}) {
  const stories = exploreStories ?? [];

  return (
    <div className="sticky top-0">
      <style>{`.community-sidebar-scroll::-webkit-scrollbar{display:none}`}</style>

      {/* Recent Activity */}
      <div className="px-4 pt-10 pb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#B8924A]">
          Recent Activity
        </p>

        {activity.length > 0 ? (
          <div className="mt-2 flex flex-col">
            {activity.map((item, idx) => {
              const { icon, bg } = getActivityMeta(item.id);

              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 py-4 ${
                    idx !== activity.length - 1 ? 'border-b border-[#EAD8B8]/60' : ''
                  }`}
                >
                  <div
                    className="h-8 w-8 flex-shrink-0 rounded-[8px] flex items-center justify-center"
                    style={{ background: bg }}
                  >
                    {icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#B8924A]">
                      {getActivityLabel(item.id)}
                    </p>
                    <p className="mt-0.5 text-[13px] font-semibold text-[#17120E] leading-snug truncate">
                      {getActivityTitle(item.action)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#9B8E7D]">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 text-center">
            <p className="text-[15px] font-semibold text-[#17120E]">No activity yet.</p>
            <p className="mt-2 text-[13px] text-[#7D6F5F] leading-relaxed">
              Once you start adding memories,
              <br />updates will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function getActivityMeta(id: string) {
  if (id.startsWith('family-'))
    return { icon: <Users className="h-4 w-4 text-[#A9782F]" strokeWidth={1.6} />, bg: '#F5EDD8' };
  if (id.startsWith('timeline-'))
    return { icon: <Calendar className="h-4 w-4 text-[#8B7355]" strokeWidth={1.6} />, bg: '#F0E8D8' };
  if (id.startsWith('capsule-'))
    return { icon: <Package className="h-4 w-4 text-[#A06A1C]" strokeWidth={1.6} />, bg: '#FEF3C7' };
  if (id.startsWith('album-'))
    return { icon: <ImageIcon className="h-4 w-4 text-[#7C8B6A]" strokeWidth={1.6} />, bg: '#EEF0E8' };
  return { icon: <Upload className="h-4 w-4 text-[#8B7355]" strokeWidth={1.6} />, bg: '#F0EBE2' };
}

function getActivityLabel(id: string) {
  if (id.startsWith('family-')) return 'Loved One';
  if (id.startsWith('timeline-')) return 'Timeline';
  if (id.startsWith('capsule-')) return 'Capsule';
  if (id.startsWith('album-')) return 'Album';
  if (id.startsWith('library-')) return 'Library';
  return 'Activity';
}

function getActivityTitle(action: string) {
  if (action.startsWith('Added loved one ')) return action.replace('Added loved one ', '');
  if (action.startsWith('Created timeline ')) return action.replace('Created timeline ', '');
  if (action.startsWith('Created capsule ')) return action.replace('Created capsule ', '');
  if (action.startsWith('Created album ')) return action.replace('Created album ', '');
  if (action.startsWith('Uploaded ')) return action;
  return action;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}