import React from 'react';
import { BookOpen, Compass, Cross, Edit3, Shield, Users } from 'lucide-react';
import type { AuthSession, SchoolDatabase } from '../shared/types';

interface AboutPageProps {
  db: SchoolDatabase;
  session: AuthSession | null;
  onOpenPortal: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ db, session, onOpenPortal }) => {
  const { profile, about } = db;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14">
      {/* Page Header */}
      <div className="border-b border-[#E5DFD3] pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
            About Our School · {profile.municipality}, {profile.region}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#0F2342] leading-tight">
            {profile.fullName}
          </h1>
          <p className="text-base text-[#4A5568] leading-relaxed">
            {profile.schoolType} · Established {profile.established} ({profile.establishedSource}).
          </p>
        </div>

        {session?.role === 'admin' && (
          <button
            type="button"
            onClick={onOpenPortal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#721C2E] text-white rounded-md hover:bg-[#581322] transition-colors self-start cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit About &amp; Staff in Portal</span>
          </button>
        )}
      </div>

      {/* Crest, Motto & Verified Facts */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-5 bg-white border border-[#E5DFD3] rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-40 h-40 sm:w-48 sm:h-48 bg-[#FBF9F5] border border-[#E5DFD3] rounded-xl p-4 flex items-center justify-center">
            <img
              src={profile.crestUrl}
              alt={`${profile.name} School Crest`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
              Dedicated School Crest &amp; Motto
            </p>
            <h2 className="font-serif text-2xl font-bold text-[#0F2342]">
              &ldquo;{profile.motto}&rdquo;
            </h2>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              {profile.mottoVerifiedNote}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-[#E5DFD3] rounded-xl p-8 space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-widest text-[#B88B1E]">
              Verified Institutional Profile
            </p>
            <h2 className="font-serif text-3xl font-semibold text-[#0F2342]">
              {about.historyTitle}
            </h2>
          </div>

          <p className="text-base text-[#2A374D] leading-relaxed whitespace-pre-line">
            {about.historyBody}
          </p>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E5DFD3] text-sm">
            <div>
              <dt className="text-xs font-mono uppercase text-slate-500">Year Established</dt>
              <dd className="font-semibold text-[#0F2342] mt-0.5 tabular-nums">
                {profile.established} ({profile.establishedSource})
              </dd>
            </div>
            <div>
              <dt className="text-xs font-mono uppercase text-slate-500">School Category</dt>
              <dd className="font-semibold text-[#0F2342] mt-0.5">{profile.schoolType}</dd>
            </div>
            <div>
              <dt className="text-xs font-mono uppercase text-slate-500">Location</dt>
              <dd className="font-semibold text-[#0F2342] mt-0.5">{profile.location}</dd>
            </div>
            <div>
              <dt className="text-xs font-mono uppercase text-slate-500">Parish Association</dt>
              <dd className="font-semibold text-[#0F2342] mt-0.5">{profile.parishPartner}</dd>
            </div>
          </dl>

          <p className="text-xs text-slate-500 italic">{about.historyNote}</p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0F2342] text-white rounded-xl p-8 space-y-3">
          <div className="flex items-center gap-2.5 text-[#E5D399]">
            <Compass className="w-5 h-5" />
            <span className="text-xs font-mono uppercase tracking-widest">Our Vision</span>
          </div>
          <h3 className="font-serif text-2xl font-semibold text-white">Vision Statement</h3>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">{about.vision}</p>
        </div>

        <div className="bg-[#721C2E] text-white rounded-xl p-8 space-y-3">
          <div className="flex items-center gap-2.5 text-[#E5D399]">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-mono uppercase tracking-widest">Our Mission</span>
          </div>
          <h3 className="font-serif text-2xl font-semibold text-white">Mission Statement</h3>
          <p className="text-sm sm:text-base text-white/90 leading-relaxed">{about.mission}</p>
        </div>
      </section>

      {/* School Objectives & Catholic Educational Values */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-white border border-[#E5DFD3] rounded-xl p-8 space-y-5">
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
              Institutional Goals
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F2342]">
              School Objectives
            </h2>
          </div>
          <ol className="space-y-4">
            {about.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-3.5 text-sm text-[#2A374D] leading-relaxed">
                <span className="font-mono text-xs font-semibold text-[#721C2E] bg-[#FBF9F5] border border-[#E5DFD3] w-7 h-7 rounded flex items-center justify-center shrink-0 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span>{obj}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-7 bg-white border border-[#E5DFD3] rounded-xl p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
                Formation &amp; Ethos
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F2342]">
                Catholic Educational Values
              </h2>
            </div>
            <Cross className="w-5 h-5 text-[#B88B1E]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {about.catholicValues.map((val) => (
              <div
                key={val.id}
                className="p-5 rounded-lg bg-[#FBF9F5] border border-[#E5DFD3] space-y-2"
              >
                <h3 className="font-serif text-xl font-semibold text-[#0F2342]">{val.title}</h3>
                <p className="text-sm text-[#4A5568] leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* School Administration */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E5DFD3] pb-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
              Governance &amp; Oversight
            </p>
            <h2 className="font-serif text-3xl font-semibold text-[#0F2342]">
              School Administration
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Editable directory — Headteacher can update official names &amp; titles anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {about.administration.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-[#E5DFD3] rounded-xl p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-center gap-4">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-lg object-cover object-top border border-[#E5DFD3] shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-[#F3EFE6] border border-[#E5DFD3] flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-[#0F2342]" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-mono uppercase text-[#721C2E]">{member.role}</p>
                  <h3 className="font-serif text-xl font-semibold text-[#0F2342] leading-snug">
                    {member.name}
                  </h3>
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500">{member.department}</p>
              <p className="text-sm text-[#4A5568] leading-relaxed">{member.qualificationNote}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Teachers and Staff */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E5DFD3] pb-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
              Educators &amp; Departments
            </p>
            <h2 className="font-serif text-3xl font-semibold text-[#0F2342]">
              Teachers &amp; Staff
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            No staff names are fabricated; add real faculty profiles in the Headteacher Portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {about.teachersAndStaff.map((staff) => (
            <div
              key={staff.id}
              className="bg-white border border-[#E5DFD3] rounded-xl p-6 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-[#0F2342]/8 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-[#0F2342]" />
                </div>
                <div>
                  <p className="text-xs font-mono uppercase text-[#B88B1E]">{staff.department}</p>
                  <h3 className="font-semibold text-base text-[#0F2342]">{staff.name}</h3>
                </div>
              </div>
              <p className="text-xs font-semibold text-[#721C2E]">{staff.role}</p>
              <p className="text-sm text-[#4A5568] leading-relaxed">{staff.qualificationNote}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
