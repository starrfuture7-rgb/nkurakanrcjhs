import React from 'react';
import { Bell, Calendar, Info, MessageCircle, Phone, Users } from 'lucide-react';
import type { AuthSession, PageId, SchoolDatabase } from '../shared/types';

interface ParentsCornerPageProps {
  db: SchoolDatabase;
  session: AuthSession | null;
  onOpenPortal: () => void;
  onNavigate: (page: PageId) => void;
}

export const ParentsCornerPage: React.FC<ParentsCornerPageProps> = ({
  db,
  session,
  onOpenPortal,
  onNavigate
}) => {
  const { profile, announcements, calendar } = db;

  const parentNotices = announcements.filter(
    (a) =>
      a.audience === 'Parents' ||
      a.audience === 'All' ||
      a.category === 'PTA Announcement' ||
      a.category === 'School Notice'
  );

  const ptaAnnouncements = announcements.filter((a) => a.category === 'PTA Announcement');

  const whatsappDigits = profile.whatsapp.replace(/\D/g, '').replace(/^0/, '233');
  const telDigits = profile.telephone.replace(/\D/g, '').replace(/^0/, '+233');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="border-b border-[#E5DFD3] pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
            Parents&apos; Corner · Home–School Partnership
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#0F2342]">
            Notices, Academic Calendar &amp; PTA Updates
          </h1>
          <p className="text-base text-[#4A5568] leading-relaxed">
            Stay informed on official school notices, Ghana Education Service term schedules, PTA
            meetings, and essential parent communication channels at Nkurakan R/C JHS.
          </p>
        </div>

        {session?.role === 'admin' && (
          <button
            type="button"
            onClick={onOpenPortal}
            className="px-4 py-2.5 text-xs font-semibold bg-[#721C2E] text-white rounded-md hover:bg-[#581322] self-start cursor-pointer"
          >
            Update Notices &amp; Calendar
          </button>
        )}
      </div>

      {/* School Notices & PTA Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* School Notices */}
        <section className="lg:col-span-7 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[#E5DFD3] pb-3">
            <Bell className="w-5 h-5 text-[#721C2E]" />
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F2342]">
              Official School Notices
            </h2>
          </div>

          <div className="space-y-4">
            {parentNotices.map((notice) => (
              <article
                key={notice.id}
                className="bg-white border border-[#E5DFD3] rounded-xl p-6 space-y-2 shadow-xs"
              >
                <p className="text-xs font-mono text-[#721C2E]">
                  {notice.category} · <span className="tabular-nums">{notice.date}</span>
                </p>
                <h3 className="font-serif text-xl font-semibold text-[#0F2342]">{notice.title}</h3>
                <p className="text-sm text-[#2A374D] leading-relaxed">{notice.body}</p>
                <p className="text-xs text-slate-500 pt-1">Issued by: {notice.postedBy}</p>
              </article>
            ))}
          </div>
        </section>

        {/* PTA Announcements & Important Info */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E5DFD3] rounded-xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-[#E5DFD3] pb-3">
              <Users className="w-5 h-5 text-[#B88B1E]" />
              <h2 className="font-serif text-2xl font-semibold text-[#0F2342]">
                PTA Announcements
              </h2>
            </div>

            {ptaAnnouncements.length === 0 ? (
              <p className="text-sm text-slate-500">No PTA notices posted yet.</p>
            ) : (
              <div className="space-y-4">
                {ptaAnnouncements.map((pta) => (
                  <div key={pta.id} className="space-y-1.5">
                    <p className="text-xs font-mono text-slate-500 tabular-nums">{pta.date}</p>
                    <h3 className="font-semibold text-base text-[#0F2342]">{pta.title}</h3>
                    <p className="text-sm text-[#4A5568] leading-relaxed">{pta.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#0F2342] text-white rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#E5D399]">
              <Info className="w-5 h-5" />
              <h2 className="font-serif text-2xl font-semibold text-white">
                Important Parent Information
              </h2>
            </div>

            <ul className="space-y-3 text-sm text-slate-200 leading-relaxed">
              <li>
                <strong className="text-white">Uniform &amp; Identity:</strong> Students wear the
                approved white-and-yellow trim or blue check school uniform bearing the Nkurakan R/C
                JHS crest.
              </li>
              <li>
                <strong className="text-white">Parish Collaboration:</strong> Our school works
                closely with {profile.parishPartner} for moral and spiritual formation.
              </li>
              <li>
                <strong className="text-white">Direct Parent Line:</strong> Reach the school office
                for attendance, welfare, or academic inquiries.
              </li>
            </ul>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <a
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#C59B27] text-[#0F2342] rounded-md hover:bg-[#B28A1E]"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Office</span>
              </a>
              <a
                href={`tel:${telDigits}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white/10 text-white border border-white/25 rounded-md hover:bg-white/20"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="tabular-nums">Call {profile.telephone}</span>
              </a>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#721C2E] text-white rounded-md hover:bg-[#581322] cursor-pointer"
              >
                <span>Send Message</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Academic Calendar */}
      <section className="space-y-5 pt-4 border-t border-[#E5DFD3]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-[#721C2E]" />
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F2342]">
              Academic Calendar
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Official term dates can be updated by the Headteacher in the Admin Portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {calendar.map((evt) => (
            <div
              key={evt.id}
              className="bg-white border border-[#E5DFD3] rounded-xl p-5 space-y-2.5 shadow-xs"
            >
              <p className="text-xs font-mono uppercase text-[#721C2E]">
                {evt.category} · {evt.term}
              </p>
              <h3 className="font-serif text-xl font-semibold text-[#0F2342]">{evt.title}</h3>
              <p className="text-xs font-mono text-[#B88B1E] font-medium">{evt.dateRange}</p>
              <p className="text-sm text-[#4A5568] leading-relaxed">{evt.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
