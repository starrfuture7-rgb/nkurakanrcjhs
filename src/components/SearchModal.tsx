import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowRight, BookOpen, Calendar, FileText, Image, Megaphone, Newspaper, Search, X } from 'lucide-react';
import type { PageId, SchoolDatabase } from '../shared/types';

interface SearchModalProps {
  isOpen: boolean;
  initialQuery?: string;
  onClose: () => void;
  db: SchoolDatabase;
  onNavigate: (page: PageId) => void;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  sectionLabel: string;
  page: PageId;
  icon: 'subject' | 'material' | 'news' | 'announcement' | 'calendar' | 'gallery';
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  initialQuery = '',
  onClose,
  db,
  onNavigate
}) => {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    const list: SearchResult[] = [];

    db.subjects.forEach((s) => {
      const hay = `${s.name} ${s.code} ${s.summary} ${s.jhs1Topics.join(' ')} ${s.jhs2Topics.join(' ')} ${s.jhs3Topics.join(' ')}`.toLowerCase();
      if (!q || hay.includes(q)) {
        list.push({
          id: s.id,
          title: s.name,
          subtitle: `${s.department} · JHS 1, JHS 2 & JHS 3 Curriculum`,
          sectionLabel: 'Academics',
          page: 'academics',
          icon: 'subject'
        });
      }
    });

    db.materials.forEach((m) => {
      const hay = `${m.title} ${m.subject} ${m.level} ${m.category} ${m.description}`.toLowerCase();
      if (!q || hay.includes(q)) {
        list.push({
          id: m.id,
          title: m.title,
          subtitle: `${m.level} · ${m.subject} · ${m.category}`,
          sectionLabel: "Students' Corner",
          page: 'students',
          icon: 'material'
        });
      }
    });

    db.news.forEach((n) => {
      const hay = `${n.title} ${n.category} ${n.summary} ${n.body}`.toLowerCase();
      if (!q || hay.includes(q)) {
        list.push({
          id: n.id,
          title: n.title,
          subtitle: `${n.category} · ${n.date}`,
          sectionLabel: 'News & Achievements',
          page: 'news',
          icon: 'news'
        });
      }
    });

    db.announcements.forEach((a) => {
      const hay = `${a.title} ${a.category} ${a.audience} ${a.body}`.toLowerCase();
      if (!q || hay.includes(q)) {
        list.push({
          id: a.id,
          title: a.title,
          subtitle: `${a.category} · Audience: ${a.audience}`,
          sectionLabel: a.audience === 'Parents' ? "Parents' Corner" : 'Notices',
          page: a.audience === 'Parents' ? 'parents' : 'home',
          icon: 'announcement'
        });
      }
    });

    db.calendar.forEach((c) => {
      const hay = `${c.title} ${c.term} ${c.dateRange} ${c.description}`.toLowerCase();
      if (!q || hay.includes(q)) {
        list.push({
          id: c.id,
          title: c.title,
          subtitle: `${c.term} · ${c.dateRange}`,
          sectionLabel: "Parents' Corner",
          page: 'parents',
          icon: 'calendar'
        });
      }
    });

    db.gallery.forEach((g) => {
      const hay = `${g.title} ${g.caption} ${g.category}`.toLowerCase();
      if (q && hay.includes(q)) {
        list.push({
          id: g.id,
          title: g.title,
          subtitle: `${g.category} · ${g.caption}`,
          sectionLabel: 'School Gallery',
          page: 'gallery',
          icon: 'gallery'
        });
      }
    });

    return list.slice(0, 18);
  }, [query, db]);

  if (!isOpen) return null;

  const renderIcon = (icon: SearchResult['icon']) => {
    switch (icon) {
      case 'subject':
        return <BookOpen className="w-4 h-4 text-[#721C2E]" />;
      case 'material':
        return <FileText className="w-4 h-4 text-[#0F2342]" />;
      case 'news':
        return <Newspaper className="w-4 h-4 text-[#721C2E]" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-[#B88B1E]" />;
      case 'calendar':
        return <Calendar className="w-4 h-4 text-[#0F2342]" />;
      case 'gallery':
        return <Image className="w-4 h-4 text-[#721C2E]" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F2342]/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white border border-[#E5DFD3] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E5DFD3]">
          <Search className="w-5 h-5 text-[#721C2E] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, BECE notes, CivicFest news, PTA notices..."
            className="w-full text-sm sm:text-base text-[#111C30] placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-1.5 rounded-md text-slate-500 hover:text-[#111C30] hover:bg-[#F3EFE6]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#F0ECE3]">
          {results.length === 0 ? (
            <div className="py-12 px-6 text-center text-sm text-slate-500">
              No school records matched &ldquo;{query}&rdquo;. Try searching for Mathematics, Science, BECE, CivicFest, or PTA.
            </div>
          ) : (
            results.map((item) => (
              <button
                key={`${item.icon}-${item.id}`}
                type="button"
                onClick={() => {
                  onNavigate(item.page);
                  onClose();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full text-left px-5 py-3.5 hover:bg-[#FBF9F5] transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 shrink-0">{renderIcon(item.icon)}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#111C30] truncate">{item.title}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {item.sectionLabel} · {item.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
