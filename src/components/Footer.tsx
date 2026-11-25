import React from 'react';
import { ExternalLink, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import type { PageId, SchoolProfile } from '../shared/types';

interface FooterProps {
  profile: SchoolProfile;
  onNavigate: (page: PageId) => void;
  onOpenPortal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ profile, onNavigate, onOpenPortal }) => {
  const go = (page: PageId) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappDigits = profile.whatsapp.replace(/\D/g, '').replace(/^0/, '233');
  const telDigits = profile.telephone.replace(/\D/g, '').replace(/^0/, '+233');

  return (
    <footer className="bg-[#0F2342] text-white border-t-4 border-[#C59B27]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: School Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={profile.crestUrl}
                alt={`${profile.name} Crest`}
                referrerPolicy="no-referrer"
                className="w-12 h-12 object-contain bg-white/95 rounded p-1 shrink-0"
              />
              <div>
                <p className="font-serif text-xl font-bold tracking-tight text-white">
                  {profile.name}
                </p>
                <p className="text-xs text-[#E5D399] tracking-wide">{profile.motto}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {profile.fullName}. {profile.schoolType} established in {profile.established} (
              {profile.establishedSource}).
            </p>
            <p className="text-xs text-slate-400 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#C59B27] shrink-0 mt-0.5" />
              <span>{profile.location}</span>
            </p>
          </div>

          {/* Column 2: Explore School */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#E5D399] mb-4">
              School Pages
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              {(
                [
                  ['home', 'Home'],
                  ['about', 'About Our School'],
                  ['academics', 'Academics (JHS 1–3)'],
                  ['news', 'News & Achievements'],
                  ['gallery', 'School Gallery']
                ] as [PageId, string][]
              ).map(([id, label]) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => go(id)}
                    className="hover:text-[#E5D399] transition-colors text-left"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Community Portals */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#E5D399] mb-4">
              School Corners
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              {(
                [
                  ['students', "Students' Corner"],
                  ['teachers', "Teachers' Corner"],
                  ['parents', "Parents' Corner"],
                  ['contact', 'Contact Us']
                ] as [PageId, string][]
              ).map(([id, label]) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => go(id)}
                    className="hover:text-[#E5D399] transition-colors text-left"
                  >
                    {label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={onOpenPortal}
                  className="inline-flex items-center gap-1.5 text-[#E5D399] hover:text-white transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Headteacher &amp; Staff Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Direct Contact & Social */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#E5D399]">
              Direct Contact
            </h3>
            <div className="space-y-2.5 text-sm">
              <a
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-slate-200 hover:text-[#E5D399] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#C59B27] shrink-0" />
                <span className="tabular-nums">WhatsApp: {profile.whatsapp}</span>
              </a>
              <a
                href={`tel:${telDigits}`}
                className="flex items-center gap-2.5 text-slate-200 hover:text-[#E5D399] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#C59B27] shrink-0" />
                <span className="tabular-nums">Telephone: {profile.telephone}</span>
              </a>
            </div>

            {(profile.socialLinks.facebook ||
              profile.socialLinks.youtube ||
              profile.socialLinks.instagram) && (
              <div className="pt-2 flex flex-wrap gap-3 text-xs text-slate-300">
                {profile.socialLinks.facebook && (
                  <a
                    href={profile.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-[#E5D399]"
                  >
                    <span>Facebook</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {profile.socialLinks.youtube && (
                  <a
                    href={profile.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-[#E5D399]"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {profile.socialLinks.instagram && (
                  <a
                    href={profile.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-[#E5D399]"
                  >
                    <span>Instagram</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} {profile.fullName} · {profile.location}
          </p>
          <p>Public Roman Catholic Junior High School · Ghana Education Service</p>
        </div>
      </div>
    </footer>
  );
};
