import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, Search, ShieldCheck, X } from 'lucide-react';
import type { AuthSession, PageId, SchoolProfile } from '../shared/types';

interface NavbarProps {
  profile: SchoolProfile;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenSearch: () => void;
  onOpenPortal: () => void;
  session: AuthSession | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  currentPage,
  onNavigate,
  onOpenSearch,
  onOpenPortal,
  session
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'corners' | 'campus' | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const go = (page: PageId) => {
    onNavigate(page);
    setOpenDropdown(null);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCornersActive = ['students', 'teachers', 'parents'].includes(currentPage);
  const isCampusActive = ['news', 'gallery', 'contact'].includes(currentPage);

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#E5DFD3]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line institutional wordmark + Crest */}
        <button
          type="button"
          onClick={() => go('home')}
          className="flex items-center gap-3 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#721C2E] rounded"
        >
          <img
            src={profile.crestUrl}
            alt={`${profile.name} Crest`}
            referrerPolicy="no-referrer"
            className="w-9 h-9 object-contain shrink-0"
          />
          <span className="font-serif text-xl font-bold tracking-tight text-[#0F2342] whitespace-nowrap">
            {profile.name}
          </span>
        </button>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#2A374D]"
        >
          <button
            type="button"
            onClick={() => go('home')}
            className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
              currentPage === 'home'
                ? 'border-[#721C2E] text-[#721C2E] font-semibold'
                : 'border-transparent hover:text-[#721C2E]'
            }`}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => go('about')}
            className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
              currentPage === 'about'
                ? 'border-[#721C2E] text-[#721C2E] font-semibold'
                : 'border-transparent hover:text-[#721C2E]'
            }`}
          >
            About
          </button>

          <button
            type="button"
            onClick={() => go('academics')}
            className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
              currentPage === 'academics'
                ? 'border-[#721C2E] text-[#721C2E] font-semibold'
                : 'border-transparent hover:text-[#721C2E]'
            }`}
          >
            Academics
          </button>

          {/* Corners Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'corners' ? null : 'corners')}
              aria-expanded={openDropdown === 'corners'}
              className={`flex items-center gap-1 py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                isCornersActive
                  ? 'border-[#721C2E] text-[#721C2E] font-semibold'
                  : 'border-transparent hover:text-[#721C2E]'
              }`}
            >
              <span>Portals</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-150 ${
                  openDropdown === 'corners' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openDropdown === 'corners' && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-[#E5DFD3] rounded-lg shadow-lg py-1.5 z-50">
                <button
                  type="button"
                  onClick={() => go('students')}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    currentPage === 'students'
                      ? 'bg-[#FBF9F5] text-[#721C2E] font-semibold'
                      : 'text-[#111C30] hover:bg-[#FBF9F5]'
                  }`}
                >
                  Students&apos; Corner
                </button>
                <button
                  type="button"
                  onClick={() => go('teachers')}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    currentPage === 'teachers'
                      ? 'bg-[#FBF9F5] text-[#721C2E] font-semibold'
                      : 'text-[#111C30] hover:bg-[#FBF9F5]'
                  }`}
                >
                  Teachers&apos; Corner
                </button>
                <button
                  type="button"
                  onClick={() => go('parents')}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    currentPage === 'parents'
                      ? 'bg-[#FBF9F5] text-[#721C2E] font-semibold'
                      : 'text-[#111C30] hover:bg-[#FBF9F5]'
                  }`}
                >
                  Parents&apos; Corner
                </button>
              </div>
            )}
          </div>

          {/* Campus Life Dropdown (News, Gallery, Contact) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'campus' ? null : 'campus')}
              aria-expanded={openDropdown === 'campus'}
              className={`flex items-center gap-1 py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                isCampusActive
                  ? 'border-[#721C2E] text-[#721C2E] font-semibold'
                  : 'border-transparent hover:text-[#721C2E]'
              }`}
            >
              <span>School Life</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-150 ${
                  openDropdown === 'campus' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openDropdown === 'campus' && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-[#E5DFD3] rounded-lg shadow-lg py-1.5 z-50">
                <button
                  type="button"
                  onClick={() => go('news')}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    currentPage === 'news'
                      ? 'bg-[#FBF9F5] text-[#721C2E] font-semibold'
                      : 'text-[#111C30] hover:bg-[#FBF9F5]'
                  }`}
                >
                  News &amp; Achievements
                </button>
                <button
                  type="button"
                  onClick={() => go('gallery')}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    currentPage === 'gallery'
                      ? 'bg-[#FBF9F5] text-[#721C2E] font-semibold'
                      : 'text-[#111C30] hover:bg-[#FBF9F5]'
                  }`}
                >
                  School Gallery
                </button>
                <button
                  type="button"
                  onClick={() => go('contact')}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    currentPage === 'contact'
                      ? 'bg-[#FBF9F5] text-[#721C2E] font-semibold'
                      : 'text-[#111C30] hover:bg-[#FBF9F5]'
                  }`}
                >
                  Contact Us
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Zone 3: 1 Primary Action + Mobile Menu Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenPortal}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide text-white bg-[#721C2E] hover:bg-[#581322] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{session ? (session.role === 'admin' ? 'Headteacher Desk' : 'Teacher Desk') : 'Staff Portal'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden p-2.5 rounded-md border border-[#E5DFD3] bg-white text-[#0F2342] hover:bg-[#F3EFE6] min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-[#E5DFD3] px-4 py-4 space-y-1 max-h-[82vh] overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onOpenSearch();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-3 mb-2 text-sm text-[#4A5568] bg-[#FBF9F5] border border-[#E5DFD3] rounded-md"
          >
            <Search className="w-4 h-4 text-[#721C2E]" />
            <span>Search subjects, notes, news...</span>
          </button>

          {(
            [
              ['home', 'Home'],
              ['about', 'About Our School'],
              ['academics', 'Academics (JHS 1 – 3)'],
              ['students', "Students' Corner"],
              ['teachers', "Teachers' Corner"],
              ['parents', "Parents' Corner"],
              ['news', 'News & Achievements'],
              ['gallery', 'School Gallery'],
              ['contact', 'Contact Us']
            ] as [PageId, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => go(id)}
              className={`w-full text-left px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                currentPage === id
                  ? 'bg-[#721C2E]/10 text-[#721C2E] font-semibold'
                  : 'text-[#111C30] hover:bg-[#FBF9F5]'
              }`}
            >
              {label}
            </button>
          ))}

          <div className="pt-3 mt-2 border-t border-[#E5DFD3]">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenPortal();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-[#721C2E] rounded-md"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {session
                  ? session.role === 'admin'
                    ? 'Open Headteacher Desk'
                    : 'Open Teacher Desk'
                  : 'Headteacher & Teacher Login'}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
