import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  PlayCircle,
  Search,
  X
} from 'lucide-react';
import type { JhsLevel, LearningMaterial, MaterialCategory, SchoolDatabase } from '../shared/types';

interface StudentsCornerPageProps {
  db: SchoolDatabase;
}

export const StudentsCornerPage: React.FC<StudentsCornerPageProps> = ({ db }) => {
  const [activeTab, setActiveTab] = useState<'all' | MaterialCategory | 'videos'>('all');
  const [levelFilter, setLevelFilter] = useState<'All' | JhsLevel>('All');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingItem, setReadingItem] = useState<LearningMaterial | null>(null);

  const filteredMaterials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return db.materials.filter((m) => {
      if (activeTab !== 'all' && activeTab !== 'videos' && m.category !== activeTab) return false;
      if (levelFilter !== 'All' && m.level !== levelFilter && m.level !== 'All JHS') return false;
      if (subjectFilter !== 'All' && m.subject !== subjectFilter) return false;
      if (
        q &&
        !`${m.title} ${m.subject} ${m.description} ${m.contentBody}`.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [db.materials, activeTab, levelFilter, subjectFilter, searchQuery]);

  const filteredVideos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return db.videos.filter((v) => {
      if (levelFilter !== 'All' && v.level !== levelFilter && v.level !== 'All JHS') return false;
      if (subjectFilter !== 'All' && v.subject !== subjectFilter) return false;
      if (q && !`${v.title} ${v.subject} ${v.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [db.videos, levelFilter, subjectFilter, searchQuery]);

  const beceCount = db.materials.filter(
    (m) => m.category === 'BECE Preparation' || m.level === 'JHS 3'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E5DFD3] pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
            Students&apos; Corner · Learning &amp; Revision Hub
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#0F2342]">
            Class Notes, Assignments &amp; BECE Prep
          </h1>
          <p className="text-base text-[#4A5568] leading-relaxed">
            Access study notes, weekly assignments, revision guides, downloadable PDFs, and
            educational video lessons prepared for JHS 1, JHS 2, and JHS 3 students.
          </p>
        </div>

        <div className="bg-[#0F2342] text-white px-5 py-4 rounded-xl flex items-center gap-4 shrink-0">
          <GraduationCap className="w-8 h-8 text-[#E5D399] shrink-0" />
          <div>
            <p className="text-xs font-mono uppercase text-[#E5D399]">BECE Readiness</p>
            <p className="text-sm font-semibold tabular-nums">
              {beceCount} JHS 3 &amp; BECE Study Guides Ready
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', 'All Materials'],
              ['Class Notes', 'Class Notes'],
              ['Assignment', 'Assignments'],
              ['Revision Material', 'Revision Materials'],
              ['BECE Preparation', 'BECE Preparation'],
              ['videos', 'Educational Videos']
            ] as ['all' | MaterialCategory | 'videos', string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === id
                  ? 'bg-[#721C2E] text-white border-[#721C2E]'
                  : 'bg-white text-[#111C30] border-[#E5DFD3] hover:bg-[#F3EFE6]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search + Level + Subject Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-4 rounded-xl border border-[#E5DFD3]">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter notes, assignments, or topics..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md focus:outline-none focus:border-[#721C2E]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              aria-label="Filter by Class Level"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as 'All' | JhsLevel)}
              className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md focus:outline-none focus:border-[#721C2E]"
            >
              <option value="All">All Classes (JHS 1–3)</option>
              <option value="JHS 1">JHS 1</option>
              <option value="JHS 2">JHS 2</option>
              <option value="JHS 3">JHS 3 (BECE)</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              aria-label="Filter by Subject"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md focus:outline-none focus:border-[#721C2E]"
            >
              <option value="All">All 10 Subjects</option>
              {db.subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
              <option value="All Core & Elective Subjects">All Core &amp; Elective Subjects</option>
            </select>
          </div>
        </div>
      </div>

      {/* Downloadable Materials Grid */}
      {activeTab !== 'videos' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-semibold text-[#0F2342]">
              Downloadable PDFs &amp; Study Materials
            </h2>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {filteredMaterials.length} item{filteredMaterials.length === 1 ? '' : 's'}
            </span>
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="bg-white border border-[#E5DFD3] rounded-xl p-10 text-center text-sm text-slate-500">
              No study materials matched your current filter. Try clearing the search box or
              selecting All Classes.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredMaterials.map((item) => (
                <article
                  key={item.id}
                  className="bg-white border border-[#E5DFD3] rounded-xl p-6 flex flex-col justify-between gap-5 shadow-xs"
                >
                  <div className="space-y-2.5">
                    <p className="text-xs font-mono text-[#721C2E]">
                      {item.category} · {item.level} · {item.subject}
                    </p>
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#0F2342] leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#4A5568] leading-relaxed">{item.description}</p>
                    <p className="text-xs text-slate-500 font-mono">
                      Posted by {item.author} · <span className="tabular-nums">{item.datePosted}</span>
                      {item.dueDate ? ` · Due ${item.dueDate}` : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#E5DFD3]">
                    <button
                      type="button"
                      onClick={() => setReadingItem(item)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#FBF9F5] hover:bg-[#F3EFE6] text-[#0F2342] border border-[#D8D1C4] rounded-md transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read Online</span>
                    </button>

                    <a
                      href={`/api/materials/${item.id}/download`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#721C2E] hover:bg-[#581322] text-white rounded-md transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>
                        Download {item.fileName ? item.fileName.split('.').pop()?.toUpperCase() : 'PDF'}
                      </span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Educational Videos Section */}
      {(activeTab === 'all' || activeTab === 'videos') && (
        <section className="space-y-4 pt-4 border-t border-[#E5DFD3]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
                Visual Learning Support
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F2342]">
                Educational Videos
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {filteredVideos.length} video resource{filteredVideos.length === 1 ? '' : 's'}
            </span>
          </div>

          {filteredVideos.length === 0 ? (
            <div className="bg-white border border-[#E5DFD3] rounded-xl p-8 text-center text-sm text-slate-500">
              No educational videos matched your filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {filteredVideos.map((vid) => (
                <div
                  key={vid.id}
                  className="bg-white border border-[#E5DFD3] rounded-xl p-6 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-[#B88B1E]">
                      <span>
                        {vid.level} · {vid.subject}
                      </span>
                      <PlayCircle className="w-4 h-4 text-[#721C2E]" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-[#0F2342]">{vid.title}</h3>
                    <p className="text-sm text-[#4A5568] leading-relaxed">{vid.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#E5DFD3] flex items-center justify-between">
                    <span className="text-xs text-slate-500">{vid.postedBy}</span>
                    <a
                      href={vid.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#721C2E] hover:underline"
                    >
                      <span>Watch Video</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Online Study Reader Modal */}
      {readingItem && (
        <div
          className="fixed inset-0 z-50 bg-[#0F2342]/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setReadingItem(null)}
        >
          <div
            className="w-full max-w-2xl bg-white border border-[#E5DFD3] rounded-xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#0F2342] text-white flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-[#E5D399]">
                  {readingItem.category} · {readingItem.level} · {readingItem.subject}
                </p>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold mt-1">
                  {readingItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReadingItem(null)}
                aria-label="Close reader"
                className="p-1.5 rounded text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-sm text-[#4A5568] italic border-b border-[#E5DFD3] pb-3">
                {readingItem.description}
              </p>
              <div className="text-sm sm:text-base text-[#111C30] leading-relaxed whitespace-pre-line font-sans">
                {readingItem.contentBody}
              </div>
            </div>

            <div className="px-6 py-4 bg-[#FBF9F5] border-t border-[#E5DFD3] flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>{readingItem.author}</span>
              </span>
              <a
                href={`/api/materials/${readingItem.id}/download`}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#721C2E] text-white rounded-md hover:bg-[#581322]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Copy</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
