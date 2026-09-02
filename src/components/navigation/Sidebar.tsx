"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, BookOpen, Library, TrendingUp, Layers, Calendar, Settings, Brain } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const MAIN_LINKS = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'AI Tutor', href: '/tutor', icon: MessageSquare },
  { name: 'My Learning', href: '/learning', icon: BookOpen },
  { name: 'Library', href: '/library', icon: Library },
];

const STUDY_LINKS = [
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'Flashcards', href: '/flashcards', icon: Layers },
  { name: 'Planner', href: '/planner', icon: Calendar },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAuthStore();

  const renderLinks = (links: any[]) => (
    <div className="space-y-1">
      {links.map((link) => {
        const active = pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              active 
                ? 'bg-hexagon-surface-hover text-hexagon-accent' 
                : 'text-hexagon-text-secondary hover:text-hexagon-text-primary hover:bg-hexagon-surface-hover'
            }`}
          >
            <Icon className={`w-4 h-4 ${active ? 'text-hexagon-accent' : ''}`} />
            {link.name}
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside className="w-64 h-full bg-hexagon-dark border-r border-hexagon-border flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-hexagon-accent flex items-center justify-center">
          <Brain className="w-5 h-5 text-black" />
        </div>
        <span className="font-bold text-lg tracking-widest text-hexagon-text-primary">HEXAGON</span>
      </div>

      <div className="flex-1 px-4 overflow-y-auto space-y-8 pb-6">
        <div>
          <h4 className="text-xs font-semibold text-hexagon-text-secondary/60 uppercase tracking-wider mb-3 px-3">Overview</h4>
          {renderLinks(MAIN_LINKS)}
        </div>
        
        <div>
          <h4 className="text-xs font-semibold text-hexagon-text-secondary/60 uppercase tracking-wider mb-3 px-3">Study Tools</h4>
          {renderLinks(STUDY_LINKS)}
        </div>
      </div>

      <div className="p-4 border-t border-hexagon-border">
        <Link 
          href="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-hexagon-surface-hover transition-colors mb-2"
        >
          <div className="w-8 h-8 rounded-full bg-hexagon-accent/20 flex items-center justify-center text-hexagon-accent text-xs font-bold uppercase">
            {profile?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-hexagon-text-primary truncate">{profile?.name || 'User'}</p>
            <p className="text-xs text-hexagon-text-secondary truncate">{profile?.email || 'user@example.com'}</p>
          </div>
        </Link>
        <Link 
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-hexagon-text-secondary hover:text-hexagon-text-primary hover:bg-hexagon-surface-hover transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
