import React, { useState } from 'react';
import { Award, Check, Copy, Edit3, Share2 } from 'lucide-react';
import type { AuthSession, NewsArticle, SchoolDatabase } from '../shared/types';

interface NewsPageProps {
  db: SchoolDatabase;
  session: AuthSession | null;
  onOpenPortal: () => void;
}

export const NewsPage: React.FC<NewsPageProps> = ({ db, session, onOpenPortal }) => {
  const [filter, setFilter] = useState<'All' | NewsArticle['category']>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredNews = db.news.filter((n) => filter === 'All' || n.category === filter);
  const leadAchievement = db.news.find((n) => n.isVerifiedHighlight) || db.news[0];

  const shareText = (article: NewsArticle) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    return `${article.title} — NKURAKAN R/C JHS (${url})`;
  };

  const handleCopy = async (article: NewsArticle) => {
    try {
      await navigator.clipboard.writeText(shareText(article));
      setCopiedId(article.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard blocked in restricted context
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="border-b border-[#E5DFD3] pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
            News &amp; Achievements · Verified School Record
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#0F2342]">
            School Activities, Competitions &amp; Events
          </h1>
          <p className="text-base text-[#4A5568] leading-relaxed">
            Official news, civic education achievements, Ghana Education Service recognitions, and
            parish community life at Nkurakan R/C JHS.
          </p>
        </div>

        {session?.role === 'admin' && (
          <button
            type="button"
            onClick={onOpenPortal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#721C2E] text-white rounded-md hover:bg-[#581322] self-start cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Publish News Article</span>
          </button>
        )}
      </div>

      {/* Verified Lead Achievement Spotlight */}
      {leadAchievement && (
        <section className="bg-[#0F2342] text-white rounded-xl overflow-hidden border border-[#C59B27]/40 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-6 relative min-h-[280px] bg-[#162F56]">
              <img
                src={leadAchievement.imageUrl}
                alt={leadAchievement.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center lg:absolute lg:inset-0"
              />
            </div>

            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#E5D399]">
                  <Award className="w-5 h-5" />
                  <span className="text-xs font-mono uppercase tracking-widest">
                    Verified Achievement · {leadAchievement.verifiedMetric || leadAchievement.date}
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight text-white">
                  {leadAchievement.title}
                </h2>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line">
                  {leadAchievement.body}
                </p>
              </div>

              <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-300">{leadAchievement.imageCaption}</span>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(shareText(leadAchievement))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-semibold bg-[#C59B27] text-[#0F2342] rounded hover:bg-[#B28A1E]"
                  >
                    Share on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            'All',
            'Verified Achievement',
            'Academic Event',
            'Sports & Civic',
            'Community & Faith',
            'School Activity'
          ] as const
        ).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
              filter === cat
                ? 'bg-[#721C2E] text-white border-[#721C2E]'
                : 'bg-white text-[#111C30] border-[#E5DFD3] hover:bg-[#F3EFE6]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredNews.map((article) => (
          <article
            key={article.id}
            className="bg-white border border-[#E5DFD3] rounded-xl overflow-hidden flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="aspect-16/10 bg-[#EBE6DF] overflow-hidden">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="p-6 space-y-3">
                <p className="text-xs font-mono text-[#721C2E]">
                  {article.category} · <span className="tabular-nums">{article.date}</span>
                  {article.verifiedMetric ? ` · ${article.verifiedMetric}` : ''}
                </p>
                <h3 className="font-serif text-2xl font-semibold text-[#0F2342] leading-snug">
                  {article.title}
                </h3>
                <p className="text-sm text-[#2A374D] leading-relaxed whitespace-pre-line">
                  {article.body}
                </p>
                <p className="text-xs italic text-slate-500 pt-1">{article.imageCaption}</p>
              </div>
            </div>

            {/* Social Media Integration & Share Controls */}
            <div className="px-6 py-4 bg-[#FBF9F5] border-t border-[#E5DFD3] flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <Share2 className="w-3.5 h-3.5 text-[#721C2E]" />
                <span>Share Article</span>
              </span>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareText(article))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-white border border-[#D8D1C4] hover:border-[#721C2E] text-[#0F2342] font-medium"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(article.title)}&u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-white border border-[#D8D1C4] hover:border-[#721C2E] text-[#0F2342] font-medium"
                >
                  Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText(article))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-white border border-[#D8D1C4] hover:border-[#721C2E] text-[#0F2342] font-medium"
                >
                  X
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy(article)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#D8D1C4] hover:border-[#721C2E] text-[#0F2342] font-medium cursor-pointer"
                >
                  {copiedId === article.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
