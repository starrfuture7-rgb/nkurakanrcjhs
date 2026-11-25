import React, { useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Download, GraduationCap } from 'lucide-react';
import type { JhsLevel, PageId, SchoolDatabase, SubjectCurriculum } from '../shared/types';

interface AcademicsPageProps {
  db: SchoolDatabase;
  onNavigate: (page: PageId) => void;
}

export const AcademicsPage: React.FC<AcademicsPageProps> = ({ db, onNavigate }) => {
  const [selectedLevel, setSelectedLevel] = useState<'JHS 1' | 'JHS 2' | 'JHS 3'>('JHS 1');
  const [selectedSubject, setSelectedSubject] = useState<SubjectCurriculum>(db.subjects[0]);

  const getTopicsForLevel = (subj: SubjectCurriculum, lvl: 'JHS 1' | 'JHS 2' | 'JHS 3') => {
    if (lvl === 'JHS 1') return subj.jhs1Topics;
    if (lvl === 'JHS 2') return subj.jhs2Topics;
    return subj.jhs3Topics;
  };

  const levelMaterials = db.materials.filter(
    (m) =>
      (m.level === selectedLevel || m.level === 'All JHS') &&
      (m.subject.toLowerCase() === selectedSubject.name.toLowerCase() ||
        m.subject === 'All Core & Elective Subjects')
  );

  const levelDescriptions: Record<'JHS 1' | 'JHS 2' | 'JHS 3', string> = {
    'JHS 1':
      'Building strong foundational mastery in literacy, numeracy, scientific inquiry, digital skills, and Catholic moral character.',
    'JHS 2':
      'Advancing intermediate reasoning, applied Career Technology and Creative Arts projects, and Ghanaian civic understanding.',
    'JHS 3':
      'Comprehensive curriculum completion and focused Basic Education Certificate Examination (BECE) readiness across all ten subjects.'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="border-b border-[#E5DFD3] pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
            Academics · Ghana Education Service JHS Programme
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#0F2342]">
            JHS 1, JHS 2 &amp; JHS 3 Learning Tracks
          </h1>
          <p className="text-base text-[#4A5568] leading-relaxed">
            Explore our ten approved Junior High School subjects structured across separate JHS 1,
            JHS 2, and JHS 3 learning sections.
          </p>
        </div>

        {/* Separate Learning Section Switcher */}
        <div
          role="tablist"
          aria-label="Select JHS Year Group"
          className="inline-flex p-1.5 bg-[#F3EFE6] border border-[#E5DFD3] rounded-lg self-start"
        >
          {(['JHS 1', 'JHS 2', 'JHS 3'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              role="tab"
              aria-selected={selectedLevel === lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-[#721C2E] text-white shadow-xs'
                  : 'text-[#0F2342] hover:bg-white/70'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Active Level Summary Banner */}
      <section className="bg-[#0F2342] text-white rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-[#E5D399]">
            <GraduationCap className="w-5 h-5" />
            <span className="text-xs font-mono uppercase tracking-widest">
              Active Learning Section · {selectedLevel}
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
            {selectedLevel} Curriculum Overview
          </h2>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            {levelDescriptions[selectedLevel]}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('students')}
          className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-[#C59B27] hover:bg-[#B28A1E] text-[#0F2342] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Go to Students&apos; Corner</span>
        </button>
      </section>

      {/* Interactive 10-Subject Grid + Topic Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: All 10 Subjects List */}
        <div className="lg:col-span-5 space-y-2.5">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">
            Select a Subject ({db.subjects.length} Approved Subjects)
          </p>
          {db.subjects.map((subj) => {
            const active = selectedSubject.id === subj.id;
            return (
              <button
                key={subj.id}
                type="button"
                onClick={() => setSelectedSubject(subj)}
                className={`w-full text-left p-4 rounded-lg border transition-colors flex items-center justify-between gap-4 cursor-pointer ${
                  active
                    ? 'bg-[#721C2E] text-white border-[#721C2E]'
                    : 'bg-white text-[#111C30] border-[#E5DFD3] hover:border-[#721C2E]/40 hover:bg-[#FBF9F5]'
                }`}
              >
                <div className="min-w-0">
                  <p
                    className={`text-[11px] font-mono uppercase tracking-wider ${
                      active ? 'text-[#E5D399]' : 'text-[#721C2E]'
                    }`}
                  >
                    {subj.code} · {subj.department}
                  </p>
                  <p className="font-semibold text-base truncate">{subj.name}</p>
                </div>
                <ArrowRight
                  className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`}
                />
              </button>
            );
          })}
        </div>

        {/* Right: Detailed Subject Syllabus for Selected Level */}
        <div className="lg:col-span-7 bg-white border border-[#E5DFD3] rounded-xl p-6 sm:p-8 space-y-8 shadow-xs">
          <div className="space-y-2 border-b border-[#E5DFD3] pb-5">
            <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
              {selectedLevel} · {selectedSubject.code} · {selectedSubject.department}
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F2342]">
              {selectedSubject.name}
            </h2>
            <p className="text-sm sm:text-base text-[#4A5568] leading-relaxed">
              {selectedSubject.summary}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold text-[#0F2342]">
              Core Learning Strands for {selectedLevel}
            </h3>
            <ul className="space-y-3">
              {getTopicsForLevel(selectedSubject, selectedLevel).map((topic, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-lg bg-[#FBF9F5] border border-[#E5DFD3] text-sm text-[#111C30]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#721C2E] shrink-0 mt-0.5" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* All 3 Levels Snapshot for Quick Comparison */}
          <div className="space-y-3 pt-4 border-t border-[#E5DFD3]">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500">
              Progression Across All Three JHS Levels
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['JHS 1', 'JHS 2', 'JHS 3'] as JhsLevel[]).map((lvl) => {
                if (lvl === 'All JHS') return null;
                const active = lvl === selectedLevel;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`text-left p-3.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#0F2342] text-white border-[#0F2342]'
                        : 'bg-[#FBF9F5] text-[#2A374D] border-[#E5DFD3] hover:border-[#0F2342]/40'
                    }`}
                  >
                    <p className={`font-semibold ${active ? 'text-[#E5D399]' : 'text-[#0F2342]'}`}>
                      {lvl}
                    </p>
                    <p className="mt-1 line-clamp-2 opacity-90">
                      {getTopicsForLevel(selectedSubject, lvl)[0]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matching Downloadable Materials */}
          <div className="space-y-3 pt-4 border-t border-[#E5DFD3]">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-semibold text-[#0F2342]">
                Available Study Materials ({selectedLevel})
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('students')}
                className="text-xs font-semibold text-[#721C2E] hover:underline cursor-pointer"
              >
                Browse All Materials →
              </button>
            </div>

            {levelMaterials.length === 0 ? (
              <p className="text-sm text-slate-500 py-3">
                Teachers can upload new {selectedLevel} {selectedSubject.name} notes and assignments
                from the Teachers&apos; Corner.
              </p>
            ) : (
              <div className="space-y-2.5">
                {levelMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-4 rounded-lg bg-[#FBF9F5] border border-[#E5DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-[11px] font-mono text-[#721C2E]">
                        {mat.category} · {mat.level}
                      </p>
                      <p className="text-sm font-semibold text-[#0F2342]">{mat.title}</p>
                    </div>
                    <a
                      href={`/api/materials/${mat.id}/download`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#0F2342] text-white rounded-md hover:bg-[#1B3664] transition-colors whitespace-nowrap self-start sm:self-center"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
