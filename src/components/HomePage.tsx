import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Camera,
  Edit3,
  GraduationCap,
  MapPin,
  Megaphone,
  MessageCircle,
  Phone,
  Search,
  Users
} from 'lucide-react';
import type { AuthSession, PageId, SchoolDatabase } from '../shared/types';

interface HomePageProps {
  db: SchoolDatabase;
  onNavigate: (page: PageId) => void;
  onOpenSearch: (initialQuery?: string) => void;
  onOpenPortal: () => void;
  session: AuthSession | null;
}

export const HomePage: React.FC<HomePageProps> = ({
  db,
  onNavigate,
  onOpenSearch,
  onOpenPortal,
  session
}) => {
  const [searchDraft, setSearchDraft] = useState('');
  const { profile, announcements, news, subjects, gallery } = db;

  const verifiedLeadNews = news.find((n) => n.isVerifiedHighlight) || news[0];
  const previewPhotos = gallery.slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenSearch(searchDraft);
  };

  return (
    <div>
      {/* 1. Welcome Hero Banner */}
      <section className="bg-[#0F2342] text-white border-b-4 border-[#C59B27]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Institutional Column */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 px-5 sm:px-8 lg:px-12 py-12 lg:py-16 flex flex-col justify-between gap-8"
          >
            <div className="space-y-6">
              {/* Crest & Identity Lockup */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg p-1.5 shadow-sm shrink-0 flex items-center justify-center">
                  <img
                    src={profile.crestUrl}
                    alt={`${profile.name} Official Crest`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono tracking-widest uppercase text-[#E5D399]">
                    {profile.schoolType} · Est. {profile.established}
                  </p>
                  <p className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {profile.name}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Motto: <span className="text-[#E5D399] font-medium">&ldquo;{profile.motto}&rdquo;</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="font-serif text-3xl sm:text-5xl font-semibold leading-[1.12] tracking-tight text-white">
                  Forming minds and character in Nkurakan since {profile.established}.
                </h1>
                <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
                  {profile.fullName} serves families across Nkurakan in the Yilo Krobo Municipality,
                  Eastern Region, Ghana—uniting public Junior High School education with Roman
                  Catholic values and academic discipline.
                </p>
              </div>
            </div>

            <div className="space-y-5 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('academics')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-[#721C2E] hover:bg-[#581322] text-white rounded-md transition-colors cursor-pointer"
                >
                  <span>Explore Academics (JHS 1–3)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('students')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/25 rounded-md transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#E5D399]" />
                  <span>Students&apos; Corner</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300 pt-2 border-t border-white/15">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E5D399]" />
                  <span>Nkurakan, Yilo Krobo Municipality</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">Tel: {profile.telephone}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">WhatsApp: {profile.whatsapp}</span>
              </div>
            </div>
          </motion.div>

          {/* Right Authentic Campus Photograph */}
          <div className="lg:col-span-5 relative min-h-[280px] sm:min-h-[360px] lg:min-h-full bg-[#162F56] overflow-hidden">
            <img
              src="/assets/aistudio/20220527_113124_54f20b3d.jpg"
              alt="Students of Nkurakan R/C JHS gathered during outdoor school assembly"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center lg:absolute lg:inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F2342]/85 via-[#0F2342]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              <p className="text-xs font-mono uppercase tracking-wider text-[#E5D399]">
                Campus Assembly · Nkurakan, Eastern Region
              </p>
              <p className="text-sm text-white/95 mt-1">
                Students gathered on campus in front of the main classroom block.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Navigation & Live Search Strip */}
      <section className="bg-white border-b border-[#E5DFD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Search JHS 1–3 subjects, BECE notes, CivicFest news, PTA notices..."
                className="w-full pl-10 pr-24 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md text-[#111C30] placeholder:text-slate-500 focus:outline-none focus:border-[#721C2E]"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-semibold bg-[#0F2342] text-white rounded hover:bg-[#1B3664] transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <a
                href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '').replace(/^0/, '233')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 font-semibold bg-[#0F2342]/5 hover:bg-[#0F2342]/10 text-[#0F2342] border border-[#D8D1C4] rounded-md transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#721C2E]" />
                <span className="tabular-nums">WhatsApp {profile.whatsapp}</span>
              </a>
              <a
                href={`tel:${profile.telephone.replace(/\D/g, '').replace(/^0/, '+233')}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 font-semibold bg-[#0F2342]/5 hover:bg-[#0F2342]/10 text-[#0F2342] border border-[#D8D1C4] rounded-md transition-colors whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5 text-[#721C2E]" />
                <span className="tabular-nums">Call {profile.telephone}</span>
              </a>
            </div>
          </div>

          {/* Quick Navigation Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {(
              [
                ['about', 'About School', Users],
                ['academics', 'Academics', GraduationCap],
                ['students', "Students' Corner", BookOpen],
                ['teachers', "Teachers' Corner", Edit3],
                ['parents', "Parents' Corner", Calendar],
                ['news', 'News & Awards', Award],
                ['gallery', 'School Gallery', Camera],
                ['contact', 'Contact Us', Phone]
              ] as [PageId, string, React.FC<{ className?: string }>][]
            ).map(([pageId, label, Icon]) => (
              <button
                key={pageId}
                type="button"
                onClick={() => {
                  onNavigate(pageId);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-[#111C30] bg-[#FBF9F5] hover:bg-[#721C2E] hover:text-white border border-[#E5DFD3] rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Headteacher's Welcome Message */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
        <div className="bg-white border border-[#E5DFD3] rounded-xl overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-4 relative min-h-[320px] bg-[#F3EFE6]">
              <img
                src={profile.headteacher.photoUrl}
                alt={profile.headteacher.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top lg:absolute lg:inset-0"
              />
            </div>

            <div className="lg:col-span-8 p-6 sm:p-10 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
                    Welcome Address · {profile.headteacher.title}
                  </p>
                  {session?.role === 'admin' && (
                    <button
                      type="button"
                      onClick={onOpenPortal}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#721C2E] hover:underline cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Welcome Message</span>
                    </button>
                  )}
                </div>

                <h2 className="font-serif text-2xl sm:text-4xl font-semibold text-[#0F2342] leading-tight">
                  {profile.headteacher.welcomeTitle}
                </h2>

                <div className="border-t border-[#E5DFD3] pt-4">
                  <p className="text-base text-[#2A374D] leading-relaxed whitespace-pre-line">
                    {profile.headteacher.welcomeMessage}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#E5DFD3]">
                <div>
                  <p className="font-serif text-lg font-bold text-[#0F2342]">
                    {profile.headteacher.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {profile.headteacher.title} · {profile.parishPartner}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#721C2E] hover:text-[#581322] cursor-pointer"
                >
                  <span>Read School History &amp; Leadership</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Verified CivicFest Achievement & Latest Announcements */}
      <section className="bg-[#F3EFE6]/70 border-y border-[#E5DFD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Lead Verified Achievement */}
            {verifiedLeadNews && (
              <div className="lg:col-span-7 bg-white border border-[#E5DFD3] rounded-xl overflow-hidden shadow-xs">
                <div className="aspect-16/10 bg-[#0F2342] relative overflow-hidden">
                  <img
                    src={verifiedLeadNews.imageUrl}
                    alt={verifiedLeadNews.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 text-white">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#E5D399]">
                      {verifiedLeadNews.category} · {verifiedLeadNews.verifiedMetric || verifiedLeadNews.date}
                    </p>
                    <h3 className="font-serif text-2xl sm:text-3xl font-semibold mt-1">
                      {verifiedLeadNews.title}
                    </h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm sm:text-base text-[#2A374D] leading-relaxed">
                    {verifiedLeadNews.summary}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#E5DFD3]">
                    <span className="text-xs text-slate-500">
                      Verified Achievement · National Commission for Civic Education (NCCE)
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate('news')}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#721C2E] hover:underline cursor-pointer"
                    >
                      <span>View News &amp; Achievements</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Latest Announcements */}
            <div className="lg:col-span-5 bg-white border border-[#E5DFD3] rounded-xl p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-4">
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
                    School Noticeboard
                  </p>
                  <h3 className="font-serif text-2xl font-semibold text-[#0F2342] mt-0.5">
                    Latest Announcements
                  </h3>
                </div>
                <Megaphone className="w-5 h-5 text-[#B88B1E]" />
              </div>

              <div className="divide-y divide-[#ECE7DC]">
                {announcements.slice(0, 4).map((ann) => (
                  <article key={ann.id} className="py-4 first:pt-1 last:pb-1 space-y-1.5">
                    <p className="text-xs text-slate-500 font-mono">
                      {ann.category} · {ann.audience} · <span className="tabular-nums">{ann.date}</span>
                    </p>
                    <h4 className="text-sm sm:text-base font-semibold text-[#111C30]">
                      {ann.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed line-clamp-3">
                      {ann.body}
                    </p>
                  </article>
                ))}
              </div>

              <div className="pt-2 border-t border-[#E5DFD3] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => onNavigate('parents')}
                  className="font-semibold text-[#0F2342] hover:text-[#721C2E] cursor-pointer"
                >
                  Parents&apos; Corner Notices →
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('students')}
                  className="font-semibold text-[#721C2E] hover:underline cursor-pointer"
                >
                  Students&apos; Corner →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Academic Highlights (JHS 1, JHS 2, JHS 3 + 10 Subjects) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5DFD3] pb-5">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
              Ghana Education Service / NaCCA Curriculum
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F2342] mt-1">
              Academic Highlights
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('academics')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#721C2E] hover:underline cursor-pointer"
          >
            <span>Open Full JHS 1–3 Curriculum</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 JHS Year Groups */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              level: 'JHS 1',
              subtitle: 'Foundation Year',
              desc: 'Transition into Junior High School across all ten core and elective subjects with strong literacy, numeracy, and moral habits.'
            },
            {
              level: 'JHS 2',
              subtitle: 'Consolidation & Inquiry',
              desc: 'Deepening analytical reasoning, practical science, computing skills, career technology projects, and civic awareness.'
            },
            {
              level: 'JHS 3',
              subtitle: 'BECE Readiness',
              desc: 'Structured revision, past question workshops, mock examinations, and Senior High School transition guidance.'
            }
          ].map((track) => (
            <div
              key={track.level}
              className="bg-white border border-[#E5DFD3] rounded-xl p-6 flex flex-col justify-between gap-5 shadow-xs"
            >
              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-wider text-[#B88B1E] font-medium">
                  {track.subtitle}
                </p>
                <h3 className="font-serif text-2xl font-bold text-[#0F2342]">{track.level}</h3>
                <p className="text-sm text-[#4A5568] leading-relaxed">{track.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('academics')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#721C2E] hover:underline cursor-pointer"
              >
                <span>View {track.level} Subjects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* All 10 Subjects Strip */}
        <div className="bg-[#0F2342] text-white rounded-xl p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#E5D399]">
              Ten Approved JHS Subjects Offered
            </h3>
            <span className="text-xs text-slate-300">
              {subjects.length} Subjects · Class Notes &amp; BECE Guides Available
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {subjects.map((subj) => (
              <button
                key={subj.id}
                type="button"
                onClick={() => onNavigate('academics')}
                className="text-left px-3.5 py-2.5 rounded-md bg-white/8 hover:bg-white/16 border border-white/15 transition-colors cursor-pointer"
              >
                <p className="text-[11px] font-mono text-[#E5D399]">{subj.code}</p>
                <p className="text-sm font-medium text-white truncate">{subj.name}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Authentic Campus Photographs Preview */}
      <section className="bg-white border-t border-[#E5DFD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
                Campus &amp; Parish Life
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F2342] mt-1">
                Life at Nkurakan R/C JHS
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('gallery')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#721C2E] hover:underline cursor-pointer"
            >
              <span>Open Full School Gallery ({gallery.length} Photos)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {previewPhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => onNavigate('gallery')}
                className="group text-left bg-[#FBF9F5] border border-[#E5DFD3] rounded-xl overflow-hidden hover:border-[#721C2E]/40 transition-colors cursor-pointer"
              >
                <div className="aspect-4/3 overflow-hidden bg-[#EBE6DF]">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[#721C2E]">
                    {photo.category}
                  </p>
                  <p className="text-sm font-semibold text-[#0F2342] line-clamp-1">{photo.title}</p>
                  <p className="text-xs text-slate-600 line-clamp-2">{photo.caption}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
