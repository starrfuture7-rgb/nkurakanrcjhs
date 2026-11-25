import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ImagePlus,
  Inbox,
  KeyRound,
  LogOut,
  Megaphone,
  Newspaper,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  X
} from 'lucide-react';
import type {
  AnnouncementItem,
  AuthSession,
  AuthStatus,
  CalendarEvent,
  GalleryCategory,
  NewsArticle,
  PageId,
  SchoolAbout,
  SchoolDatabase,
  SchoolProfile,
  StaffMember,
  UserRole
} from '../shared/types';

interface PortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: SchoolDatabase;
  session: AuthSession | null;
  authStatus: AuthStatus | null;
  onAuthSuccess: (session: AuthSession) => void;
  onLogout: () => void;
  onRefreshData: () => Promise<void>;
  onNavigate: (page: PageId) => void;
}

type AdminTab = 'identity' | 'about' | 'news' | 'notices' | 'inbox';

export const PortalModal: React.FC<PortalModalProps> = ({
  isOpen,
  onClose,
  db,
  session,
  authStatus,
  onAuthSuccess,
  onLogout,
  onRefreshData,
  onNavigate
}) => {
  // Auth forms
  const [loginRole, setLoginRole] = useState<UserRole>('admin');
  const [loginPasscode, setLoginPasscode] = useState('');
  const [setupAdminPass, setSetupAdminPass] = useState('');
  const [setupTeacherPass, setSetupTeacherPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  // Admin CMS state
  const [activeTab, setActiveTab] = useState<AdminTab>('identity');
  const [saveNotice, setSaveNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [profileDraft, setProfileDraft] = useState<SchoolProfile>(db.profile);
  const [aboutDraft, setAboutDraft] = useState<SchoolAbout>(db.about);

  // News composer
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState<NewsArticle['category']>('School Activity');
  const [newsDate, setNewsDate] = useState(new Date().toISOString().slice(0, 10));
  const [newsSummary, setNewsSummary] = useState('');
  const [newsBody, setNewsBody] = useState('');
  const [newsImageUrl, setNewsImageUrl] = useState('/assets/aistudio/20220527_113124_54f20b3d.jpg');
  const [newsCaption, setNewsCaption] = useState('');

  // Gallery composer
  const [galTitle, setGalTitle] = useState('');
  const [galCategory, setGalCategory] = useState<GalleryCategory>('Campus & Assembly');
  const [galCaption, setGalCaption] = useState('');
  const [galImageUrl, setGalImageUrl] = useState('');

  // Notice & Calendar composers
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<AnnouncementItem['category']>('School Notice');
  const [noticeAudience, setNoticeAudience] = useState<AnnouncementItem['audience']>('Parents');
  const [noticeBody, setNoticeBody] = useState('');

  const [calTitle, setCalTitle] = useState('');
  const [calTerm, setCalTerm] = useState('GES Term Schedule');
  const [calDateRange, setCalDateRange] = useState('');
  const [calCategory, setCalCategory] = useState<CalendarEvent['category']>('Term Date');
  const [calDesc, setCalDesc] = useState('');

  // Credential update
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newTeacherPasscode, setNewTeacherPasscode] = useState('');

  useEffect(() => {
    setProfileDraft(db.profile);
    setAboutDraft(db.about);
  }, [db]);

  if (!isOpen) return null;

  const notify = (type: 'ok' | 'err', text: string) => {
    setSaveNotice({ type, text });
    if (type === 'ok') {
      setTimeout(() => setSaveNotice(null), 4000);
    }
  };

  const handleSetupClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: setupAdminPass,
          teacherPasscode: setupTeacherPass
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Setup failed.');
      onAuthSuccess(data);
      setSetupAdminPass('');
      setSetupTeacherPass('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Unable to claim portal credentials.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: loginRole, passcode: loginPasscode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign-in failed.');
      onAuthSuccess(data);
      setLoginPasscode('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setAuthBusy(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!session) return null;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) {
      notify('err', data.error || 'Image upload failed.');
      return null;
    }
    return data.fileUrl as string;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`
      },
      body: JSON.stringify(profileDraft)
    });
    const data = await res.json();
    if (!res.ok) {
      notify('err', data.error || 'Failed to save school identity.');
      return;
    }
    await onRefreshData();
    notify('ok', 'School identity, crest, motto, and Headteacher message updated.');
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const res = await fetch('/api/about', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`
      },
      body: JSON.stringify(aboutDraft)
    });
    const data = await res.json();
    if (!res.ok) {
      notify('err', data.error || 'Failed to save About & Staff directory.');
      return;
    }
    await onRefreshData();
    notify('ok', 'About Our School, Objectives, Administration & Staff updated.');
  };

  const handlePublishNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const res = await fetch('/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`
      },
      body: JSON.stringify({
        title: newsTitle,
        category: newsCategory,
        date: newsDate,
        summary: newsSummary,
        body: newsBody,
        imageUrl: newsImageUrl,
        imageCaption: newsCaption || newsTitle
      })
    });
    const data = await res.json();
    if (!res.ok) {
      notify('err', data.error || 'Failed to publish news.');
      return;
    }
    setNewsTitle('');
    setNewsSummary('');
    setNewsBody('');
    setNewsCaption('');
    await onRefreshData();
    notify('ok', 'News article published to News & Achievements.');
  };

  const handleAddGalleryPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`
      },
      body: JSON.stringify({
        title: galTitle,
        category: galCategory,
        caption: galCaption,
        imageUrl: galImageUrl
      })
    });
    const data = await res.json();
    if (!res.ok) {
      notify('err', data.error || 'Failed to add gallery photo.');
      return;
    }
    setGalTitle('');
    setGalCaption('');
    setGalImageUrl('');
    await onRefreshData();
    notify('ok', 'Photograph added to School Gallery.');
  };

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`
      },
      body: JSON.stringify({
        title: noticeTitle,
        category: noticeCategory,
        audience: noticeAudience,
        body: noticeBody,
        postedBy: profileDraft.headteacher.name
      })
    });
    const data = await res.json();
    if (!res.ok) {
      notify('err', data.error || 'Failed to post notice.');
      return;
    }
    setNoticeTitle('');
    setNoticeBody('');
    await onRefreshData();
    notify('ok', 'Notice published.');
  };

  const handleAddCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const res = await fetch('/api/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`
      },
      body: JSON.stringify({
        title: calTitle,
        term: calTerm,
        dateRange: calDateRange,
        category: calCategory,
        description: calDesc
      })
    });
    const data = await res.json();
    if (!res.ok) {
      notify('err', data.error || 'Failed to add calendar event.');
      return;
    }
    setCalTitle('');
    setCalDateRange('');
    setCalDesc('');
    await onRefreshData();
    notify('ok', 'Academic calendar event added.');
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const res = await fetch('/api/auth/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`
      },
      body: JSON.stringify({ newAdminPassword, newTeacherPasscode })
    });
    const data = await res.json();
    if (!res.ok) {
      notify('err', data.error || 'Unable to update passcodes.');
      return;
    }
    setNewAdminPassword('');
    setNewTeacherPasscode('');
    notify('ok', 'Portal access credentials updated.');
  };

  const addStaffRow = (bucket: 'administration' | 'teachersAndStaff') => {
    const newRow: StaffMember = {
      id: `${bucket === 'administration' ? 'adm' : 'stf'}-${Date.now()}`,
      name: '',
      role: '',
      department: '',
      qualificationNote: '',
      isPlaceholder: false
    };
    setAboutDraft((prev) => ({
      ...prev,
      [bucket]: [...prev[bucket], newRow]
    }));
  };

  const updateStaffRow = (
    bucket: 'administration' | 'teachersAndStaff',
    id: string,
    field: keyof StaffMember,
    value: string
  ) => {
    setAboutDraft((prev) => ({
      ...prev,
      [bucket]: prev[bucket].map((row) =>
        row.id === id ? { ...row, [field]: value, isPlaceholder: false } : row
      )
    }));
  };

  const removeStaffRow = (bucket: 'administration' | 'teachersAndStaff', id: string) => {
    setAboutDraft((prev) => ({
      ...prev,
      [bucket]: prev[bucket].filter((row) => row.id !== id)
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F2342]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-[#FBF9F5] border border-[#E5DFD3] rounded-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0F2342] text-white flex items-center justify-between gap-4 border-b-2 border-[#C59B27]">
          <div className="flex items-center gap-3 min-w-0">
            <ShieldCheck className="w-5 h-5 text-[#E5D399] shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#E5D399]">
                Nkurakan R/C JHS · School Management
              </p>
              <h2 className="font-serif text-xl font-semibold truncate">
                {session ? session.displayName : 'Headteacher & Teacher Portal'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {session && (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close portal"
              className="p-1.5 rounded text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-7">
          {/* Case 1: Not signed in */}
          {!session && (
            <div className="max-w-md mx-auto py-4 space-y-6">
              {authError && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-900">
                  {authError}
                </div>
              )}

              {authStatus && !authStatus.claimed ? (
                <form
                  onSubmit={handleSetupClaim}
                  className="bg-white border border-[#E5DFD3] rounded-xl p-6 space-y-4 shadow-xs"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-mono uppercase text-[#721C2E]">
                      First-Time Portal Setup
                    </p>
                    <h3 className="font-serif text-2xl font-semibold text-[#0F2342]">
                      Set Headteacher &amp; Staff Passcodes
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Claim administrator access so the Headteacher can update school details,
                      news, staff, and calendar without programming.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                      Headteacher Administrator Password (min. 6 characters) *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={setupAdminPass}
                      onChange={(e) => setSetupAdminPass(e.target.value)}
                      placeholder="Create Headteacher password"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                      Teacher Contributor Passcode (optional, min. 4 characters)
                    </label>
                    <input
                      type="password"
                      minLength={4}
                      value={setupTeacherPass}
                      onChange={(e) => setSetupTeacherPass(e.target.value)}
                      placeholder="For teachers uploading class notes"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authBusy}
                    className="w-full py-3 text-sm font-semibold bg-[#721C2E] hover:bg-[#581322] text-white rounded-md cursor-pointer disabled:opacity-60"
                  >
                    {authBusy ? 'Saving Credentials...' : 'Activate School Portal'}
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={handleLogin}
                  className="bg-white border border-[#E5DFD3] rounded-xl p-6 space-y-5 shadow-xs"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-mono uppercase text-[#721C2E]">Authorized Access</p>
                    <h3 className="font-serif text-2xl font-semibold text-[#0F2342]">
                      Sign In to School Portal
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#F3EFE6] rounded-lg">
                    <button
                      type="button"
                      onClick={() => setLoginRole('admin')}
                      className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        loginRole === 'admin'
                          ? 'bg-[#721C2E] text-white'
                          : 'text-[#0F2342] hover:bg-white/60'
                      }`}
                    >
                      Headteacher / Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginRole('teacher')}
                      className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        loginRole === 'teacher'
                          ? 'bg-[#721C2E] text-white'
                          : 'text-[#0F2342] hover:bg-white/60'
                      }`}
                    >
                      Teacher Contributor
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                      {loginRole === 'admin' ? 'Headteacher Password' : 'Teacher Access Code'}
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPasscode}
                      onChange={(e) => setLoginPasscode(e.target.value)}
                      placeholder="Enter access code"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authBusy}
                    className="w-full py-3 text-sm font-semibold bg-[#0F2342] hover:bg-[#1B3664] text-white rounded-md cursor-pointer disabled:opacity-60"
                  >
                    {authBusy ? 'Verifying...' : 'Sign In'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Case 2: Signed in as Teacher */}
          {session?.role === 'teacher' && (
            <div className="max-w-lg mx-auto py-8 text-center space-y-5">
              <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
              <div className="space-y-2">
                <h3 className="font-serif text-3xl font-semibold text-[#0F2342]">
                  Teacher Access Active
                </h3>
                <p className="text-sm text-[#4A5568]">
                  You can now upload class notes, assignments, examination materials, educational
                  videos, and academic announcements directly in the Teachers&apos; Corner.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('teachers');
                }}
                className="px-6 py-3 text-sm font-semibold bg-[#721C2E] hover:bg-[#581322] text-white rounded-md cursor-pointer"
              >
                Open Teachers&apos; Corner Workbench
              </button>
            </div>
          )}

          {/* Case 3: Signed in as Headteacher (Admin) */}
          {session?.role === 'admin' && (
            <div className="space-y-6">
              {saveNotice && (
                <div
                  className={`p-3.5 rounded-lg border text-sm font-medium ${
                    saveNotice.type === 'ok'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  {saveNotice.text}
                </div>
              )}

              {/* Admin Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-[#E5DFD3] pb-4">
                {(
                  [
                    ['identity', 'Identity, Crest & Welcome', ShieldCheck],
                    ['about', 'About, History & Staff', Users],
                    ['news', 'News & Gallery', Newspaper],
                    ['notices', 'Notices & Calendar', Megaphone],
                    ['inbox', `Inbox (${db.contactMessages.length}) & Security`, Inbox]
                  ] as [AdminTab, string, React.FC<{ className?: string }>][]
                ).map(([id, label, Icon]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                      activeTab === id
                        ? 'bg-[#721C2E] text-white border-[#721C2E]'
                        : 'bg-white text-[#0F2342] border-[#E5DFD3] hover:bg-[#F3EFE6]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* TAB 1: Identity & Welcome */}
              {activeTab === 'identity' && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-6 rounded-xl border border-[#E5DFD3]">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                        Short School Name
                      </label>
                      <input
                        type="text"
                        value={profileDraft.name}
                        onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                        Official School Motto
                      </label>
                      <input
                        type="text"
                        value={profileDraft.motto}
                        onChange={(e) => setProfileDraft({ ...profileDraft, motto: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                        WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={profileDraft.whatsapp}
                        onChange={(e) =>
                          setProfileDraft({ ...profileDraft, whatsapp: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                        Telephone Number
                      </label>
                      <input
                        type="text"
                        value={profileDraft.telephone}
                        onChange={(e) =>
                          setProfileDraft({ ...profileDraft, telephone: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#E5DFD3]">
                      <div className="flex items-center gap-3">
                        <img
                          src={profileDraft.crestUrl}
                          alt="School Crest"
                          className="w-14 h-14 object-contain border border-[#E5DFD3] rounded bg-[#FBF9F5] p-1"
                        />
                        <div className="text-xs">
                          <p className="font-semibold text-[#0F2342]">School Crest Image</p>
                          <p className="text-slate-500">Upload a replacement crest PNG/JPG if needed.</p>
                        </div>
                      </div>
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-[#0F2342] text-white rounded cursor-pointer self-start">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Crest</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const url = await uploadImage(f);
                            if (url) setProfileDraft({ ...profileDraft, crestUrl: url });
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Headteacher Details */}
                  <div className="bg-white p-6 rounded-xl border border-[#E5DFD3] space-y-4">
                    <h3 className="font-serif text-xl font-semibold text-[#0F2342]">
                      Headteacher Profile &amp; Welcome Message
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                          Headteacher Name
                        </label>
                        <input
                          type="text"
                          value={profileDraft.headteacher.name}
                          onChange={(e) =>
                            setProfileDraft({
                              ...profileDraft,
                              headteacher: { ...profileDraft.headteacher, name: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                          Welcome Headline
                        </label>
                        <input
                          type="text"
                          value={profileDraft.headteacher.welcomeTitle}
                          onChange={(e) =>
                            setProfileDraft({
                              ...profileDraft,
                              headteacher: {
                                ...profileDraft.headteacher,
                                welcomeTitle: e.target.value
                              }
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                        Welcome Message
                      </label>
                      <textarea
                        rows={4}
                        value={profileDraft.headteacher.welcomeMessage}
                        onChange={(e) =>
                          setProfileDraft({
                            ...profileDraft,
                            headteacher: {
                              ...profileDraft.headteacher,
                              welcomeMessage: e.target.value
                            }
                          })
                        }
                        className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#E5DFD3]">
                      <div>
                        <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                          Facebook Page URL
                        </label>
                        <input
                          type="url"
                          value={profileDraft.socialLinks.facebook}
                          onChange={(e) =>
                            setProfileDraft({
                              ...profileDraft,
                              socialLinks: {
                                ...profileDraft.socialLinks,
                                facebook: e.target.value
                              }
                            })
                          }
                          placeholder="https://facebook.com/..."
                          className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                          YouTube Channel URL
                        </label>
                        <input
                          type="url"
                          value={profileDraft.socialLinks.youtube}
                          onChange={(e) =>
                            setProfileDraft({
                              ...profileDraft,
                              socialLinks: {
                                ...profileDraft.socialLinks,
                                youtube: e.target.value
                              }
                            })
                          }
                          placeholder="https://youtube.com/..."
                          className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                          Instagram URL
                        </label>
                        <input
                          type="url"
                          value={profileDraft.socialLinks.instagram}
                          onChange={(e) =>
                            setProfileDraft({
                              ...profileDraft,
                              socialLinks: {
                                ...profileDraft.socialLinks,
                                instagram: e.target.value
                              }
                            })
                          }
                          placeholder="https://instagram.com/..."
                          className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 text-sm font-semibold bg-[#721C2E] hover:bg-[#581322] text-white rounded-md cursor-pointer"
                  >
                    Save School Identity &amp; Welcome
                  </button>
                </form>
              )}

              {/* TAB 2: About, History & Staff */}
              {activeTab === 'about' && (
                <form onSubmit={handleSaveAbout} className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-[#E5DFD3] space-y-4">
                    <h3 className="font-serif text-xl font-semibold text-[#0F2342]">
                      History, Vision &amp; Mission
                    </h3>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                        School History
                      </label>
                      <textarea
                        rows={4}
                        value={aboutDraft.historyBody}
                        onChange={(e) =>
                          setAboutDraft({ ...aboutDraft, historyBody: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                          Vision Statement
                        </label>
                        <textarea
                          rows={3}
                          value={aboutDraft.vision}
                          onChange={(e) => setAboutDraft({ ...aboutDraft, vision: e.target.value })}
                          className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                          Mission Statement
                        </label>
                        <textarea
                          rows={3}
                          value={aboutDraft.mission}
                          onChange={(e) =>
                            setAboutDraft({ ...aboutDraft, mission: e.target.value })
                          }
                          className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Administration Directory */}
                  <div className="bg-white p-6 rounded-xl border border-[#E5DFD3] space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-xl font-semibold text-[#0F2342]">
                        School Administration Directory
                      </h3>
                      <button
                        type="button"
                        onClick={() => addStaffRow('administration')}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#721C2E] hover:underline cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Administrator</span>
                      </button>
                    </div>
                    <div className="space-y-3">
                      {aboutDraft.administration.map((adm) => (
                        <div
                          key={adm.id}
                          className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-lg bg-[#FBF9F5] border border-[#E5DFD3]"
                        >
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={adm.name}
                            onChange={(e) =>
                              updateStaffRow('administration', adm.id, 'name', e.target.value)
                            }
                            className="sm:col-span-3 px-2.5 py-1.5 text-xs bg-white border border-[#D8D1C4] rounded"
                          />
                          <input
                            type="text"
                            placeholder="Role / Title"
                            value={adm.role}
                            onChange={(e) =>
                              updateStaffRow('administration', adm.id, 'role', e.target.value)
                            }
                            className="sm:col-span-3 px-2.5 py-1.5 text-xs bg-white border border-[#D8D1C4] rounded"
                          />
                          <input
                            type="text"
                            placeholder="Department / Notes"
                            value={adm.qualificationNote}
                            onChange={(e) =>
                              updateStaffRow(
                                'administration',
                                adm.id,
                                'qualificationNote',
                                e.target.value
                              )
                            }
                            className="sm:col-span-5 px-2.5 py-1.5 text-xs bg-white border border-[#D8D1C4] rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeStaffRow('administration', adm.id)}
                            className="sm:col-span-1 flex items-center justify-center text-red-700 hover:bg-red-50 rounded cursor-pointer"
                            aria-label="Remove entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Teachers & Staff Directory */}
                  <div className="bg-white p-6 rounded-xl border border-[#E5DFD3] space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-xl font-semibold text-[#0F2342]">
                        Teachers &amp; Staff Directory
                      </h3>
                      <button
                        type="button"
                        onClick={() => addStaffRow('teachersAndStaff')}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#721C2E] hover:underline cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Teacher / Staff</span>
                      </button>
                    </div>
                    <div className="space-y-3">
                      {aboutDraft.teachersAndStaff.map((stf) => (
                        <div
                          key={stf.id}
                          className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 rounded-lg bg-[#FBF9F5] border border-[#E5DFD3]"
                        >
                          <input
                            type="text"
                            placeholder="Teacher Name"
                            value={stf.name}
                            onChange={(e) =>
                              updateStaffRow('teachersAndStaff', stf.id, 'name', e.target.value)
                            }
                            className="sm:col-span-3 px-2.5 py-1.5 text-xs bg-white border border-[#D8D1C4] rounded"
                          />
                          <input
                            type="text"
                            placeholder="Subjects / Class"
                            value={stf.role}
                            onChange={(e) =>
                              updateStaffRow('teachersAndStaff', stf.id, 'role', e.target.value)
                            }
                            className="sm:col-span-3 px-2.5 py-1.5 text-xs bg-white border border-[#D8D1C4] rounded"
                          />
                          <input
                            type="text"
                            placeholder="Department"
                            value={stf.department}
                            onChange={(e) =>
                              updateStaffRow(
                                'teachersAndStaff',
                                stf.id,
                                'department',
                                e.target.value
                              )
                            }
                            className="sm:col-span-5 px-2.5 py-1.5 text-xs bg-white border border-[#D8D1C4] rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeStaffRow('teachersAndStaff', stf.id)}
                            className="sm:col-span-1 flex items-center justify-center text-red-700 hover:bg-red-50 rounded cursor-pointer"
                            aria-label="Remove teacher"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 text-sm font-semibold bg-[#721C2E] hover:bg-[#581322] text-white rounded-md cursor-pointer"
                  >
                    Save About &amp; Staff Changes
                  </button>
                </form>
              )}

              {/* TAB 3: News & Gallery */}
              {activeTab === 'news' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <form
                    onSubmit={handlePublishNews}
                    className="bg-white p-6 rounded-xl border border-[#E5DFD3] space-y-4"
                  >
                    <h3 className="font-serif text-xl font-semibold text-[#0F2342]">
                      Publish News Article
                    </h3>
                    <input
                      type="text"
                      required
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      placeholder="Headline"
                      className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={newsCategory}
                        onChange={(e) =>
                          setNewsCategory(e.target.value as NewsArticle['category'])
                        }
                        className="px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                      >
                        <option value="School Activity">School Activity</option>
                        <option value="Academic Event">Academic Event</option>
                        <option value="Sports & Civic">Sports &amp; Civic</option>
                        <option value="Community & Faith">Community &amp; Faith</option>
                        <option value="Verified Achievement">Verified Achievement</option>
                      </select>
                      <input
                        type="date"
                        value={newsDate}
                        onChange={(e) => setNewsDate(e.target.value)}
                        className="px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                      />
                    </div>
                    <input
                      type="text"
                      required
                      value={newsSummary}
                      onChange={(e) => setNewsSummary(e.target.value)}
                      placeholder="Short summary"
                      className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                    />
                    <textarea
                      rows={4}
                      required
                      value={newsBody}
                      onChange={(e) => setNewsBody(e.target.value)}
                      placeholder="Full article details..."
                      className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500 truncate">
                        Photo: {newsImageUrl.split('/').pop()}
                      </span>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0F2342] text-white rounded cursor-pointer shrink-0">
                        <ImagePlus className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const url = await uploadImage(f);
                            if (url) setNewsImageUrl(url);
                          }}
                        />
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 text-xs font-semibold bg-[#721C2E] text-white rounded-md cursor-pointer"
                    >
                      Publish News
                    </button>
                  </form>

                  <form
                    onSubmit={handleAddGalleryPhoto}
                    className="bg-white p-6 rounded-xl border border-[#E5DFD3] space-y-4"
                  >
                    <h3 className="font-serif text-xl font-semibold text-[#0F2342]">
                      Add Photo to School Gallery
                    </h3>
                    <input
                      type="text"
                      required
                      value={galTitle}
                      onChange={(e) => setGalTitle(e.target.value)}
                      placeholder="Photo Title"
                      className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                    />
                    <select
                      value={galCategory}
                      onChange={(e) => setGalCategory(e.target.value as GalleryCategory)}
                      className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                    >
                      <option value="Campus & Assembly">Campus &amp; Assembly</option>
                      <option value="Classrooms & Learning">Classrooms &amp; Learning</option>
                      <option value="Teachers & Leadership">Teachers &amp; Leadership</option>
                      <option value="Awards & CivicFest">Awards &amp; CivicFest</option>
                      <option value="Church & Community">Church &amp; Community</option>
                    </select>
                    <input
                      type="text"
                      value={galCaption}
                      onChange={(e) => setGalCaption(e.target.value)}
                      placeholder="Photo caption"
                      className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                    />
                    <div className="p-4 rounded-lg bg-[#FBF9F5] border border-dashed border-[#C59B27] flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-600 truncate">
                        {galImageUrl ? `Uploaded: ${galImageUrl.split('/').pop()}` : 'Select image file'}
                      </span>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0F2342] text-white rounded cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const url = await uploadImage(f);
                            if (url) setGalImageUrl(url);
                          }}
                        />
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 text-xs font-semibold bg-[#0F2342] text-white rounded-md cursor-pointer"
                    >
                      Add to Gallery
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 4: Notices & Calendar */}
              {activeTab === 'notices' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <form
                    onSubmit={handleAddNotice}
                    className="bg-white p-6 rounded-xl border border-[#E5DFD3] space-y-4"
                  >
                    <h3 className="font-serif text-xl font-semibold text-[#0F2342]">
                      Post School or PTA Notice
                    </h3>
                    <input
                      type="text"
                      required
                      value={noticeTitle}
                      onChange={(e) => setNoticeTitle(e.target.value)}
                      placeholder="Notice Headline"
                      className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={noticeCategory}
                        onChange={(e) =>
                          setNoticeCategory(e.target.value as AnnouncementItem['category'])
                        }
                        className="px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                      >
                        <option value="School Notice">School Notice</option>
                        <option value="PTA Announcement">PTA Announcement</option>
                        <option value="Academic Announcement">Academic Announcement</option>
                        <option value="Important Information">Important Information</option>
                      </select>
                      <select
                        value={noticeAudience}
                        onChange={(e) =>
                          setNoticeAudience(e.target.value as AnnouncementItem['audience'])
                        }
                        className="px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                      >
                        <option value="Parents">Parents</option>
                        <option value="All">All Community</option>
                        <option value="Students">Students</option>
                        <option value="Teachers">Teachers</option>
                      </select>
                    </div>
                    <textarea
                      rows={3}
                      required
                      value={noticeBody}
                      onChange={(e) => setNoticeBody(e.target.value)}
                      placeholder="Notice message..."
                      className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 text-xs font-semibold bg-[#721C2E] text-white rounded-md cursor-pointer"
                    >
                      Publish Notice
                    </button>
                  </form>

                  <form
                    onSubmit={handleAddCalendar}
                    className="bg-white p-6 rounded-xl border border-[#E5DFD3] space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#721C2E]" />
                      <h3 className="font-serif text-xl font-semibold text-[#0F2342]">
                        Add Academic Calendar Event
                      </h3>
                    </div>
                    <input
                      type="text"
                      required
                      value={calTitle}
                      onChange={(e) => setCalTitle(e.target.value)}
                      placeholder="Event Title (e.g. Term 2 Reopening)"
                      className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        value={calDateRange}
                        onChange={(e) => setCalDateRange(e.target.value)}
                        placeholder="Date or Range"
                        className="px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                      />
                      <select
                        value={calCategory}
                        onChange={(e) =>
                          setCalCategory(e.target.value as CalendarEvent['category'])
                        }
                        className="px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                      >
                        <option value="Term Date">Term Date</option>
                        <option value="Examination">Examination</option>
                        <option value="PTA & Community">PTA &amp; Community</option>
                        <option value="Liturgical & Civic">Liturgical &amp; Civic</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={calTerm}
                      onChange={(e) => setCalTerm(e.target.value)}
                      placeholder="Term Label"
                      className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                    />
                    <textarea
                      rows={2}
                      value={calDesc}
                      onChange={(e) => setCalDesc(e.target.value)}
                      placeholder="Description..."
                      className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 text-xs font-semibold bg-[#0F2342] text-white rounded-md cursor-pointer"
                    >
                      Add Calendar Event
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 5: Inbox & Security */}
              {activeTab === 'inbox' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-[#E5DFD3] space-y-4">
                    <h3 className="font-serif text-xl font-semibold text-[#0F2342]">
                      Contact Form Inquiries ({db.contactMessages.length})
                    </h3>
                    {db.contactMessages.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No messages submitted via the Contact Us page yet.
                      </p>
                    ) : (
                      <div className="divide-y divide-[#ECE7DC]">
                        {db.contactMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <p className="text-xs font-mono text-[#721C2E]">
                                {msg.status} · {msg.role} · {msg.senderName} ({msg.phoneOrEmail})
                              </p>
                              <p className="text-sm font-semibold text-[#0F2342]">{msg.subject}</p>
                              <p className="text-sm text-[#4A5568]">{msg.message}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={async () => {
                                  await fetch(`/api/contact/${msg.id}`, {
                                    method: 'PATCH',
                                    headers: { Authorization: `Bearer ${session.token}` }
                                  });
                                  await onRefreshData();
                                }}
                                className="px-2.5 py-1 text-xs font-semibold border border-[#D8D1C4] rounded hover:bg-[#F3EFE6] cursor-pointer"
                              >
                                Toggle Status
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await fetch(`/api/contact/${msg.id}`, {
                                    method: 'DELETE',
                                    headers: { Authorization: `Bearer ${session.token}` }
                                  });
                                  await onRefreshData();
                                }}
                                className="p-1.5 text-red-700 hover:bg-red-50 rounded cursor-pointer"
                                aria-label="Delete message"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <form
                    onSubmit={handleUpdateCredentials}
                    className="bg-white p-6 rounded-xl border border-[#E5DFD3] space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#721C2E]" />
                      <h3 className="font-serif text-xl font-semibold text-[#0F2342]">
                        Update Portal Passcodes
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="password"
                        minLength={6}
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="New Headteacher Password (optional)"
                        className="px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                      />
                      <input
                        type="password"
                        minLength={4}
                        value={newTeacherPasscode}
                        onChange={(e) => setNewTeacherPasscode(e.target.value)}
                        placeholder="New Teacher Access Code (optional)"
                        className="px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-xs font-semibold bg-[#0F2342] text-white rounded-md cursor-pointer"
                    >
                      Save New Passcodes
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
