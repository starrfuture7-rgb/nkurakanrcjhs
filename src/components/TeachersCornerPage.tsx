import React, { useState } from 'react';
import {
  Download,
  FilePlus2,
  Lock,
  Megaphone,
  Trash2,
  Upload,
  Video
} from 'lucide-react';
import type {
  AuthSession,
  JhsLevel,
  MaterialCategory,
  SchoolDatabase
} from '../shared/types';

interface TeachersCornerPageProps {
  db: SchoolDatabase;
  session: AuthSession | null;
  onOpenPortal: () => void;
  onRefreshData: () => Promise<void>;
}

export const TeachersCornerPage: React.FC<TeachersCornerPageProps> = ({
  db,
  session,
  onOpenPortal,
  onRefreshData
}) => {
  const canContribute = session?.role === 'teacher' || session?.role === 'admin';

  // Material upload form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(db.subjects[0]?.name || 'English Language');
  const [level, setLevel] = useState<JhsLevel>('JHS 1');
  const [category, setCategory] = useState<MaterialCategory>('Class Notes');
  const [description, setDescription] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [author, setAuthor] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{
    fileUrl: string;
    fileName: string;
    fileSize: string;
  } | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submittingMaterial, setSubmittingMaterial] = useState(false);

  // Announcement form state
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annAudience, setAnnAudience] = useState<'All' | 'Students' | 'Teachers' | 'Parents'>('Students');

  // Video form state
  const [vidTitle, setVidTitle] = useState('');
  const [vidSubject, setVidSubject] = useState(db.subjects[0]?.name || 'Mathematics');
  const [vidLevel, setVidLevel] = useState<JhsLevel>('JHS 3');
  const [vidUrl, setVidUrl] = useState('');
  const [vidDesc, setVidDesc] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const teachingResources = db.materials.filter(
    (m) => m.category === 'Teaching Resource' || m.category === 'Examination Material'
  );
  const academicAnnouncements = db.announcements.filter(
    (a) => a.audience === 'Teachers' || a.category === 'Academic Announcement'
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    setUploadingFile(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'File upload failed.');
      setUploadedFile(data);
      setFeedback({ type: 'ok', text: `Attached ${data.fileName} (${data.fileSize}).` });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to upload file.'
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handlePublishMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setSubmittingMaterial(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({
          title,
          subject,
          level,
          category,
          description,
          contentBody: contentBody || description,
          author: author || session.displayName,
          dueDate: dueDate || undefined,
          fileUrl: uploadedFile?.fileUrl,
          fileName: uploadedFile?.fileName,
          fileSize: uploadedFile?.fileSize
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not publish material.');
      setTitle('');
      setDescription('');
      setContentBody('');
      setDueDate('');
      setUploadedFile(null);
      setFeedback({
        type: 'ok',
        text: 'Published! Students can now read and download it in Students’ Corner.'
      });
      await onRefreshData();
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Submission error.'
      });
    } finally {
      setSubmittingMaterial(false);
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setFeedback(null);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({
          title: annTitle,
          body: annBody,
          audience: annAudience,
          category: 'Academic Announcement',
          postedBy: author || session.displayName
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not post announcement.');
      setAnnTitle('');
      setAnnBody('');
      setFeedback({ type: 'ok', text: 'Academic announcement posted.' });
      await onRefreshData();
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to post announcement.'
      });
    }
  };

  const handlePublishVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setFeedback(null);
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`
        },
        body: JSON.stringify({
          title: vidTitle,
          subject: vidSubject,
          level: vidLevel,
          videoUrl: vidUrl,
          description: vidDesc,
          postedBy: author || session.displayName
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not add educational video.');
      setVidTitle('');
      setVidUrl('');
      setVidDesc('');
      setFeedback({ type: 'ok', text: 'Educational video added to Students’ Corner.' });
      await onRefreshData();
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to save video.'
      });
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!session) return;
    await fetch(`/api/materials/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.token}` }
    });
    await onRefreshData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="border-b border-[#E5DFD3] pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
            Teachers&apos; Corner · Faculty Workbench &amp; Resources
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#0F2342]">
            Teaching Resources &amp; Academic Publishing
          </h1>
          <p className="text-base text-[#4A5568] leading-relaxed">
            Access examination materials, schemes, and teaching guides—or sign in with Teacher or
            Headteacher credentials to upload class notes, assignments, and academic notices.
          </p>
        </div>

        {!canContribute && (
          <button
            type="button"
            onClick={onOpenPortal}
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-[#721C2E] hover:bg-[#581322] text-white rounded-md transition-colors self-start cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Sign In to Upload Notes &amp; Exams</span>
          </button>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-lg border text-sm font-medium ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Teacher Contributor Workbench (Visible when authenticated) */}
      {canContribute ? (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upload Class Notes / Assignments / Exam Materials */}
          <form
            onSubmit={handlePublishMaterial}
            className="lg:col-span-7 bg-white border border-[#E5DFD3] rounded-xl p-6 sm:p-8 space-y-5 shadow-xs"
          >
            <div className="flex items-center gap-2.5 border-b border-[#E5DFD3] pb-4">
              <FilePlus2 className="w-5 h-5 text-[#721C2E]" />
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#0F2342]">
                  Upload Class Notes, Assignments or Exam Papers
                </h2>
                <p className="text-xs text-slate-500">
                  Attach a PDF/DOCX file or type notes directly—both are downloadable as PDFs.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                  Resource Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                >
                  <option value="Class Notes">Class Notes</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Revision Material">Revision Material</option>
                  <option value="BECE Preparation">BECE Preparation</option>
                  <option value="Examination Material">Examination Material</option>
                  <option value="Teaching Resource">Teaching Resource</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                  Class Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as JhsLevel)}
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                >
                  <option value="JHS 1">JHS 1</option>
                  <option value="JHS 2">JHS 2</option>
                  <option value="JHS 3">JHS 3</option>
                  <option value="All JHS">All JHS</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F2342] mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                >
                  {db.subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                  <option value="All Core & Elective Subjects">All Core &amp; Elective Subjects</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                  Teacher / Author Name
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Science Department"
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                  Material Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Week 4 Fractions & Ratios Worksheet"
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                Short Summary *
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief overview for students and parents..."
                className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                Full Notes / Assignment Questions (Optional if uploading PDF)
              </label>
              <textarea
                rows={4}
                value={contentBody}
                onChange={(e) => setContentBody(e.target.value)}
                placeholder="Type structured notes, examples, or questions here..."
                className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
              />
            </div>

            <div className="p-4 rounded-lg bg-[#FBF9F5] border border-dashed border-[#C59B27] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-[#2A374D]">
                <p className="font-semibold">Attach Document (PDF, DOCX, TXT, Image)</p>
                <p className="text-slate-500">
                  {uploadedFile
                    ? `Attached: ${uploadedFile.fileName} (${uploadedFile.fileSize})`
                    : 'Max 12 MB. Optional if you entered text notes above.'}
                </p>
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#0F2342] text-white rounded-md hover:bg-[#1B3664] cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingFile ? 'Uploading...' : 'Choose File'}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submittingMaterial}
              className="w-full py-3 text-sm font-semibold bg-[#721C2E] hover:bg-[#581322] text-white rounded-md transition-colors cursor-pointer disabled:opacity-60"
            >
              {submittingMaterial ? 'Publishing Material...' : 'Publish to Students & Teachers'}
            </button>
          </form>

          {/* Right Column: Post Announcement & Add Video */}
          <div className="lg:col-span-5 space-y-6">
            <form
              onSubmit={handlePublishAnnouncement}
              className="bg-white border border-[#E5DFD3] rounded-xl p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-center gap-2 border-b border-[#E5DFD3] pb-3">
                <Megaphone className="w-4 h-4 text-[#721C2E]" />
                <h3 className="font-serif text-xl font-semibold text-[#0F2342]">
                  Post Academic Announcement
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2342] mb-1">
                  Target Audience
                </label>
                <select
                  value={annAudience}
                  onChange={(e) =>
                    setAnnAudience(e.target.value as 'All' | 'Students' | 'Teachers' | 'Parents')
                  }
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                >
                  <option value="Students">Students</option>
                  <option value="Teachers">Teachers</option>
                  <option value="Parents">Parents</option>
                  <option value="All">All School Community</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2342] mb-1">Headline</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. JHS 3 Mock Exam Timetable"
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2342] mb-1">Message</label>
                <textarea
                  rows={3}
                  required
                  value={annBody}
                  onChange={(e) => setAnnBody(e.target.value)}
                  placeholder="Enter announcement details..."
                  className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold bg-[#0F2342] hover:bg-[#1B3664] text-white rounded-md transition-colors cursor-pointer"
              >
                Publish Announcement
              </button>
            </form>

            <form
              onSubmit={handlePublishVideo}
              className="bg-white border border-[#E5DFD3] rounded-xl p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-center gap-2 border-b border-[#E5DFD3] pb-3">
                <Video className="w-4 h-4 text-[#721C2E]" />
                <h3 className="font-serif text-xl font-semibold text-[#0F2342]">
                  Add Educational Video Link
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={vidLevel}
                  onChange={(e) => setVidLevel(e.target.value as JhsLevel)}
                  className="px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                >
                  <option value="JHS 1">JHS 1</option>
                  <option value="JHS 2">JHS 2</option>
                  <option value="JHS 3">JHS 3</option>
                  <option value="All JHS">All JHS</option>
                </select>
                <select
                  value={vidSubject}
                  onChange={(e) => setVidSubject(e.target.value)}
                  className="px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
                >
                  {db.subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                required
                value={vidTitle}
                onChange={(e) => setVidTitle(e.target.value)}
                placeholder="Video Lesson Title"
                className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
              />
              <input
                type="url"
                required
                value={vidUrl}
                onChange={(e) => setVidUrl(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
              />
              <input
                type="text"
                value={vidDesc}
                onChange={(e) => setVidDesc(e.target.value)}
                placeholder="Short lesson summary"
                className="w-full px-3 py-2 text-sm bg-[#FBF9F5] border border-[#D8D1C4] rounded-md"
              />
              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold bg-[#721C2E] hover:bg-[#581322] text-white rounded-md transition-colors cursor-pointer"
              >
                Save Video Resource
              </button>
            </form>
          </div>
        </section>
      ) : (
        <section className="bg-[#0F2342] text-white rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-widest text-[#E5D399]">
              Teacher Contributor Access
            </p>
            <h2 className="font-serif text-2xl font-semibold">
              Are you a Teacher at Nkurakan R/C JHS?
            </h2>
            <p className="text-sm text-slate-200">
              Sign in with the Teacher Access Code or Headteacher Password to upload weekly class
              notes, assignments, examination materials, and academic announcements.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenPortal}
            className="px-5 py-3 text-sm font-semibold bg-[#C59B27] hover:bg-[#B28A1E] text-[#0F2342] rounded-md whitespace-nowrap shrink-0 cursor-pointer"
          >
            Sign In as Teacher
          </button>
        </section>
      )}

      {/* Teaching Resources & Examination Materials + Academic Announcements */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F2342] border-b border-[#E5DFD3] pb-3">
            Teaching &amp; Examination Materials
          </h2>

          <div className="space-y-3">
            {(canContribute ? db.materials : teachingResources).map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E5DFD3] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="text-xs font-mono text-[#721C2E]">
                    {item.category} · {item.level} · {item.subject}
                  </p>
                  <h3 className="font-semibold text-base text-[#0F2342]">{item.title}</h3>
                  <p className="text-xs text-slate-500">
                    {item.author} · {item.datePosted}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`/api/materials/${item.id}/download`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#0F2342] text-white rounded-md hover:bg-[#1B3664]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                  {canContribute && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMaterial(item.id)}
                      aria-label={`Delete ${item.title}`}
                      className="p-2 text-red-700 hover:bg-red-50 border border-red-200 rounded-md cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F2342] border-b border-[#E5DFD3] pb-3">
            Academic Announcements
          </h2>
          <div className="space-y-3">
            {academicAnnouncements.map((ann) => (
              <article
                key={ann.id}
                className="bg-white border border-[#E5DFD3] rounded-xl p-5 space-y-2"
              >
                <p className="text-xs font-mono text-[#B88B1E]">
                  {ann.audience} · <span className="tabular-nums">{ann.date}</span>
                </p>
                <h3 className="font-semibold text-base text-[#0F2342]">{ann.title}</h3>
                <p className="text-sm text-[#4A5568] leading-relaxed">{ann.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
