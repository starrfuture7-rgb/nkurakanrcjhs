import { useCallback, useEffect, useState } from 'react';
import { AboutPage } from './components/AboutPage';
import { AcademicsPage } from './components/AcademicsPage';
import { ContactPage } from './components/ContactPage';
import { Footer } from './components/Footer';
import { GalleryPage } from './components/GalleryPage';
import { HomePage } from './components/HomePage';
import { Navbar } from './components/Navbar';
import { NewsPage } from './components/NewsPage';
import { ParentsCornerPage } from './components/ParentsCornerPage';
import { PortalModal } from './components/PortalModal';
import { SearchModal } from './components/SearchModal';
import { StudentsCornerPage } from './components/StudentsCornerPage';
import { TeachersCornerPage } from './components/TeachersCornerPage';
import type { AuthSession, AuthStatus, PageId, SchoolDatabase } from './shared/types';

const VALID_PAGES: PageId[] = [
  'home',
  'about',
  'academics',
  'students',
  'teachers',
  'parents',
  'news',
  'gallery',
  'contact'
];

function getInitialPage(): PageId {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace('#', '') as PageId;
  return VALID_PAGES.includes(hash) ? hash : 'home';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>(getInitialPage);
  const [db, setDb] = useState<SchoolDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Keep session token safely in React memory (never persisted in localStorage)
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');
  const [portalOpen, setPortalOpen] = useState(false);

  const fetchSchoolData = useCallback(
    async (activeSession: AuthSession | null = session) => {
      try {
        const headers: Record<string, string> = {};
        if (activeSession?.token) {
          headers.Authorization = `Bearer ${activeSession.token}`;
        }
        const [dataRes, statusRes] = await Promise.all([
          fetch('/api/school-data', { headers }),
          fetch('/api/auth/status')
        ]);
        if (!dataRes.ok) throw new Error('Unable to load school information.');
        const data = (await dataRes.json()) as SchoolDatabase;
        setDb(data);
        if (statusRes.ok) {
          setAuthStatus((await statusRes.json()) as AuthStatus);
        }
        setLoadError('');
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Unable to connect to school server.');
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  useEffect(() => {
    void fetchSchoolData(null);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      setCurrentPage(getInitialPage());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (page: PageId) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      window.location.hash = page === 'home' ? '' : `#${page}`;
    }
  };

  const openSearch = (initialQuery = '') => {
    setSearchInitialQuery(initialQuery);
    setSearchOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-2 border-[#721C2E] border-t-transparent animate-spin mx-auto" />
          <p className="font-serif text-xl text-[#0F2342]">Loading NKURAKAN R/C JHS...</p>
        </div>
      </div>
    );
  }

  if (loadError || !db) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-6">
        <div className="max-w-md bg-white border border-[#E5DFD3] rounded-xl p-8 text-center space-y-4">
          <h1 className="font-serif text-2xl font-semibold text-[#0F2342]">
            NKURAKAN R/C JHS Portal
          </h1>
          <p className="text-sm text-red-700">{loadError || 'Unable to load school data.'}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void fetchSchoolData(session);
            }}
            className="px-5 py-2.5 text-sm font-semibold bg-[#721C2E] text-white rounded-md cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#111C30]">
      <Navbar
        profile={db.profile}
        currentPage={currentPage}
        onNavigate={navigate}
        onOpenSearch={() => openSearch('')}
        onOpenPortal={() => setPortalOpen(true)}
        session={session}
      />

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            db={db}
            onNavigate={navigate}
            onOpenSearch={openSearch}
            onOpenPortal={() => setPortalOpen(true)}
            session={session}
          />
        )}
        {currentPage === 'about' && (
          <AboutPage db={db} session={session} onOpenPortal={() => setPortalOpen(true)} />
        )}
        {currentPage === 'academics' && <AcademicsPage db={db} onNavigate={navigate} />}
        {currentPage === 'students' && <StudentsCornerPage db={db} />}
        {currentPage === 'teachers' && (
          <TeachersCornerPage
            db={db}
            session={session}
            onOpenPortal={() => setPortalOpen(true)}
            onRefreshData={() => fetchSchoolData(session)}
          />
        )}
        {currentPage === 'parents' && (
          <ParentsCornerPage
            db={db}
            session={session}
            onOpenPortal={() => setPortalOpen(true)}
            onNavigate={navigate}
          />
        )}
        {currentPage === 'news' && (
          <NewsPage db={db} session={session} onOpenPortal={() => setPortalOpen(true)} />
        )}
        {currentPage === 'gallery' && (
          <GalleryPage db={db} session={session} onOpenPortal={() => setPortalOpen(true)} />
        )}
        {currentPage === 'contact' && <ContactPage db={db} />}
      </main>

      <Footer
        profile={db.profile}
        onNavigate={navigate}
        onOpenPortal={() => setPortalOpen(true)}
      />

      <SearchModal
        isOpen={searchOpen}
        initialQuery={searchInitialQuery}
        onClose={() => setSearchOpen(false)}
        db={db}
        onNavigate={navigate}
      />

      <PortalModal
        isOpen={portalOpen}
        onClose={() => setPortalOpen(false)}
        db={db}
        session={session}
        authStatus={authStatus}
        onAuthSuccess={(newSession) => {
          setSession(newSession);
          void fetchSchoolData(newSession);
        }}
        onLogout={() => {
          setSession(null);
          void fetchSchoolData(null);
        }}
        onRefreshData={() => fetchSchoolData(session)}
        onNavigate={navigate}
      />
    </div>
  );
}
