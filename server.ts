import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import {
  UPLOADS_DIR,
  claimInitialCredentials,
  getAuthStatus,
  readDb,
  updateCredentials,
  verifyLogin,
  writeDb
} from './src/server/db.ts';
import { generateLearningMaterialPdf } from './src/server/pdf.ts';
import type {
  AnnouncementItem,
  CalendarEvent,
  ContactSubmission,
  EducationalVideo,
  GalleryPhoto,
  LearningMaterial,
  NewsArticle,
  UserRole
} from './src/shared/types.ts';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

interface TokenPayload {
  role: UserRole;
  displayName: string;
  exp: number;
}

function signToken(payload: TokenPayload): string {
  const data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token: string): TokenPayload | null {
  if (!token || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  const bufSig = Buffer.from(sig, 'utf8');
  const bufExp = Buffer.from(expected, 'utf8');
  if (bufSig.length !== bufExp.length || !crypto.timingSafeEqual(bufSig, bufExp)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as TokenPayload;
    if (!parsed.exp || Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

interface AuthedRequest extends Request {
  user?: TokenPayload;
}

function getBearerUser(req: Request): TokenPayload | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return verifyToken(auth.slice(7).trim());
}

function requireAuth(allowedRoles: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    const user = getBearerUser(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required. Please sign in.' });
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ error: 'You do not have permission for this action.' });
      return;
    }
    req.user = user;
    next();
  };
}

function sanitizeText(val: unknown, maxLen = 4000): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function isSafeUrl(raw: unknown): boolean {
  if (typeof raw !== 'string') return false;
  const trimmed = raw.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('/assets/') || trimmed.startsWith('/uploads/')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.webp']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const id = crypto.randomBytes(6).toString('hex');
    cb(null, `${Date.now()}_${id}_${base || 'file'}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(new Error('Unsupported file type. Allowed: PDF, DOC, DOCX, TXT, PNG, JPG, WEBP.'));
      return;
    }
    cb(null, true);
  }
});

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/auth/status', (_req, res) => {
    res.json(getAuthStatus());
  });

  app.post('/api/auth/setup', (req, res) => {
    const adminPassword = sanitizeText(req.body?.adminPassword, 128);
    const teacherPasscode = sanitizeText(req.body?.teacherPasscode, 128);
    const result = claimInitialCredentials(adminPassword, teacherPasscode);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    const token = signToken({
      role: 'admin',
      displayName: 'Headteacher / Administrator',
      exp: Date.now() + 12 * 60 * 60 * 1000
    });
    res.json({
      token,
      role: 'admin',
      displayName: 'Headteacher / Administrator'
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const role: UserRole = req.body?.role === 'teacher' ? 'teacher' : 'admin';
    const passcode = sanitizeText(req.body?.passcode, 128);
    if (!verifyLogin(role, passcode)) {
      res.status(401).json({ error: 'Incorrect access code. Please check and try again.' });
      return;
    }
    const displayName = role === 'admin' ? 'Headteacher / Administrator' : 'Teacher Contributor';
    const token = signToken({
      role,
      displayName,
      exp: Date.now() + 12 * 60 * 60 * 1000
    });
    res.json({ token, role, displayName });
  });

  app.post('/api/auth/credentials', requireAuth(['admin']), (req, res) => {
    const newAdminPassword = sanitizeText(req.body?.newAdminPassword, 128);
    const newTeacherPasscode = sanitizeText(req.body?.newTeacherPasscode, 128);
    if (newAdminPassword && newAdminPassword.length < 6) {
      res.status(400).json({ error: 'New Headteacher password must be at least 6 characters.' });
      return;
    }
    if (newTeacherPasscode && newTeacherPasscode.length < 4) {
      res.status(400).json({ error: 'Teacher passcode must be at least 4 characters.' });
      return;
    }
    updateCredentials(newAdminPassword || undefined, newTeacherPasscode || undefined);
    res.json({ ok: true, status: getAuthStatus() });
  });

  app.get('/api/school-data', (req, res) => {
    const db = readDb();
    const user = getBearerUser(req);
    res.json({
      ...db,
      contactMessages: user?.role === 'admin' ? db.contactMessages : []
    });
  });

  app.put('/api/profile', requireAuth(['admin']), (req, res) => {
    const db = readDb();
    const incoming = req.body;
    if (!incoming || typeof incoming !== 'object') {
      res.status(400).json({ error: 'Invalid profile payload.' });
      return;
    }

    const crestUrl = sanitizeText(incoming.crestUrl, 500) || db.profile.crestUrl;
    const headPhotoUrl = sanitizeText(incoming.headteacher?.photoUrl, 500) || db.profile.headteacher.photoUrl;
    if (!isSafeUrl(crestUrl) || !isSafeUrl(headPhotoUrl)) {
      res.status(400).json({ error: 'Invalid image URL provided.' });
      return;
    }

    const fb = sanitizeText(incoming.socialLinks?.facebook, 300);
    const yt = sanitizeText(incoming.socialLinks?.youtube, 300);
    const ig = sanitizeText(incoming.socialLinks?.instagram, 300);
    if (!isSafeUrl(fb) || !isSafeUrl(yt) || !isSafeUrl(ig)) {
      res.status(400).json({ error: 'Invalid social media URL.' });
      return;
    }

    db.profile = {
      ...db.profile,
      name: sanitizeText(incoming.name, 120) || db.profile.name,
      fullName: sanitizeText(incoming.fullName, 180) || db.profile.fullName,
      location: sanitizeText(incoming.location, 220) || db.profile.location,
      motto: sanitizeText(incoming.motto, 140) || db.profile.motto,
      mottoVerifiedNote: sanitizeText(incoming.mottoVerifiedNote, 300) || db.profile.mottoVerifiedNote,
      crestUrl,
      whatsapp: sanitizeText(incoming.whatsapp, 40) || db.profile.whatsapp,
      telephone: sanitizeText(incoming.telephone, 40) || db.profile.telephone,
      email: sanitizeText(incoming.email, 120) || db.profile.email,
      parishPartner: sanitizeText(incoming.parishPartner, 180) || db.profile.parishPartner,
      headteacher: {
        name: sanitizeText(incoming.headteacher?.name, 140) || db.profile.headteacher.name,
        title: sanitizeText(incoming.headteacher?.title, 140) || db.profile.headteacher.title,
        photoUrl: headPhotoUrl,
        welcomeTitle: sanitizeText(incoming.headteacher?.welcomeTitle, 200) || db.profile.headteacher.welcomeTitle,
        welcomeMessage: sanitizeText(incoming.headteacher?.welcomeMessage, 3000) || db.profile.headteacher.welcomeMessage
      },
      socialLinks: {
        facebook: fb,
        youtube: yt,
        instagram: ig
      }
    };

    writeDb(db);
    res.json(db.profile);
  });

  app.put('/api/about', requireAuth(['admin']), (req, res) => {
    const db = readDb();
    const incoming = req.body;
    if (!incoming || typeof incoming !== 'object') {
      res.status(400).json({ error: 'Invalid about payload.' });
      return;
    }

    db.about = {
      ...db.about,
      historyTitle: sanitizeText(incoming.historyTitle, 200) || db.about.historyTitle,
      historyBody: sanitizeText(incoming.historyBody, 5000) || db.about.historyBody,
      historyNote: sanitizeText(incoming.historyNote, 300) || db.about.historyNote,
      vision: sanitizeText(incoming.vision, 1000) || db.about.vision,
      mission: sanitizeText(incoming.mission, 1000) || db.about.mission,
      objectives: Array.isArray(incoming.objectives)
        ? incoming.objectives.map((o: unknown) => sanitizeText(o, 400)).filter(Boolean).slice(0, 12)
        : db.about.objectives,
      catholicValues: Array.isArray(incoming.catholicValues)
        ? incoming.catholicValues
            .map((v: Record<string, unknown>, idx: number) => ({
              id: sanitizeText(v?.id, 40) || `val-${idx + 1}`,
              title: sanitizeText(v?.title, 100),
              description: sanitizeText(v?.description, 400)
            }))
            .filter((v: { title: string }) => Boolean(v.title))
            .slice(0, 8)
        : db.about.catholicValues,
      administration: Array.isArray(incoming.administration)
        ? incoming.administration
            .map((s: Record<string, unknown>, idx: number) => ({
              id: sanitizeText(s?.id, 40) || `adm-${Date.now()}-${idx}`,
              name: sanitizeText(s?.name, 140),
              role: sanitizeText(s?.role, 120),
              department: sanitizeText(s?.department, 120),
              qualificationNote: sanitizeText(s?.qualificationNote, 300),
              photoUrl: isSafeUrl(s?.photoUrl) ? sanitizeText(s?.photoUrl, 400) : '',
              isPlaceholder: Boolean(s?.isPlaceholder)
            }))
            .filter((s: { name: string }) => Boolean(s.name))
            .slice(0, 20)
        : db.about.administration,
      teachersAndStaff: Array.isArray(incoming.teachersAndStaff)
        ? incoming.teachersAndStaff
            .map((s: Record<string, unknown>, idx: number) => ({
              id: sanitizeText(s?.id, 40) || `stf-${Date.now()}-${idx}`,
              name: sanitizeText(s?.name, 140),
              role: sanitizeText(s?.role, 120),
              department: sanitizeText(s?.department, 120),
              qualificationNote: sanitizeText(s?.qualificationNote, 300),
              photoUrl: isSafeUrl(s?.photoUrl) ? sanitizeText(s?.photoUrl, 400) : '',
              isPlaceholder: Boolean(s?.isPlaceholder)
            }))
            .filter((s: { name: string }) => Boolean(s.name))
            .slice(0, 40)
        : db.about.teachersAndStaff
    };

    writeDb(db);
    res.json(db.about);
  });

  app.post('/api/upload', requireAuth(['admin', 'teacher']), (req, res) => {
    upload.single('file')(req, res, (err: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : 'File upload failed.';
        res.status(400).json({ error: message });
        return;
      }
      if (!req.file) {
        res.status(400).json({ error: 'No file selected.' });
        return;
      }
      const sizeKb = Math.max(1, Math.round(req.file.size / 1024));
      const sizeLabel = sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
      res.json({
        fileUrl: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        fileSize: sizeLabel
      });
    });
  });

  app.get('/uploads/:filename', (req, res) => {
    const safeName = path.basename(req.params.filename || '');
    const resolved = path.resolve(UPLOADS_DIR, safeName);
    if (!resolved.startsWith(UPLOADS_DIR + path.sep) || !fs.existsSync(resolved)) {
      res.status(404).json({ error: 'File not found.' });
      return;
    }
    res.sendFile(resolved);
  });

  app.post('/api/materials', requireAuth(['admin', 'teacher']), (req, res) => {
    const db = readDb();
    const title = sanitizeText(req.body?.title, 180);
    const subject = sanitizeText(req.body?.subject, 100);
    const level = sanitizeText(req.body?.level, 20) as LearningMaterial['level'];
    const category = sanitizeText(req.body?.category, 40) as LearningMaterial['category'];
    const description = sanitizeText(req.body?.description, 600);
    const contentBody = sanitizeText(req.body?.contentBody, 8000);
    const author = sanitizeText(req.body?.author, 120) || 'Teaching Staff';
    const dueDate = sanitizeText(req.body?.dueDate, 30);
    const fileUrl = sanitizeText(req.body?.fileUrl, 400);
    const fileName = sanitizeText(req.body?.fileName, 200);
    const fileSize = sanitizeText(req.body?.fileSize, 40);

    if (!title || !subject || !description) {
      res.status(400).json({ error: 'Title, subject, and summary description are required.' });
      return;
    }
    if (fileUrl && !isSafeUrl(fileUrl)) {
      res.status(400).json({ error: 'Invalid file URL.' });
      return;
    }

    const item: LearningMaterial = {
      id: `mat-${Date.now()}`,
      title,
      subject,
      level: ['JHS 1', 'JHS 2', 'JHS 3', 'All JHS'].includes(level) ? level : 'All JHS',
      category: [
        'Class Notes',
        'Assignment',
        'Revision Material',
        'BECE Preparation',
        'Examination Material',
        'Teaching Resource'
      ].includes(category)
        ? category
        : 'Class Notes',
      description,
      contentBody: contentBody || description,
      author,
      datePosted: new Date().toISOString().slice(0, 10),
      dueDate: dueDate || undefined,
      fileUrl: fileUrl || undefined,
      fileName: fileName || undefined,
      fileSize: fileSize || undefined
    };

    db.materials.unshift(item);
    writeDb(db);
    res.status(201).json(item);
  });

  app.delete('/api/materials/:id', requireAuth(['admin', 'teacher']), (req, res) => {
    const db = readDb();
    const before = db.materials.length;
    db.materials = db.materials.filter((m) => m.id !== req.params.id);
    if (db.materials.length === before) {
      res.status(404).json({ error: 'Material not found.' });
      return;
    }
    writeDb(db);
    res.json({ ok: true });
  });

  app.get('/api/materials/:id/download', (req, res) => {
    const db = readDb();
    const item = db.materials.find((m) => m.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Learning material not found.' });
      return;
    }

    if (item.fileUrl && item.fileUrl.startsWith('/uploads/')) {
      const safeName = path.basename(item.fileUrl);
      const resolved = path.resolve(UPLOADS_DIR, safeName);
      if (resolved.startsWith(UPLOADS_DIR + path.sep) && fs.existsSync(resolved)) {
        res.download(resolved, item.fileName || safeName);
        return;
      }
    }

    const pdfBuffer = generateLearningMaterialPdf({
      schoolName: db.profile.fullName,
      location: db.profile.location,
      title: item.title,
      subtitle: `${item.level} · ${item.subject} · ${item.category}`,
      metaLine: `Prepared by: ${item.author} · Posted: ${item.datePosted}${item.dueDate ? ` · Due: ${item.dueDate}` : ''}`,
      body: `${item.description}\n\n${item.contentBody}`
    });

    const slug = item.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${slug || 'nkurakan-rc-jhs-material'}.pdf"`);
    res.send(pdfBuffer);
  });

  app.post('/api/videos', requireAuth(['admin', 'teacher']), (req, res) => {
    const db = readDb();
    const title = sanitizeText(req.body?.title, 180);
    const subject = sanitizeText(req.body?.subject, 100);
    const level = sanitizeText(req.body?.level, 20) as EducationalVideo['level'];
    const description = sanitizeText(req.body?.description, 500);
    const videoUrl = sanitizeText(req.body?.videoUrl, 400);
    const duration = sanitizeText(req.body?.duration, 40) || 'Lesson Video';
    const postedBy = sanitizeText(req.body?.postedBy, 120) || 'Teaching Staff';

    if (!title || !subject || !videoUrl || !isSafeUrl(videoUrl)) {
      res.status(400).json({ error: 'Valid title, subject, and http(s) video URL are required.' });
      return;
    }

    const video: EducationalVideo = {
      id: `vid-${Date.now()}`,
      title,
      subject,
      level: ['JHS 1', 'JHS 2', 'JHS 3', 'All JHS'].includes(level) ? level : 'All JHS',
      description,
      videoUrl,
      duration,
      postedBy,
      datePosted: new Date().toISOString().slice(0, 10)
    };

    db.videos.unshift(video);
    writeDb(db);
    res.status(201).json(video);
  });

  app.delete('/api/videos/:id', requireAuth(['admin', 'teacher']), (req, res) => {
    const db = readDb();
    db.videos = db.videos.filter((v) => v.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  app.post('/api/announcements', requireAuth(['admin', 'teacher']), (req, res) => {
    const db = readDb();
    const title = sanitizeText(req.body?.title, 200);
    const body = sanitizeText(req.body?.body, 2500);
    const audience = sanitizeText(req.body?.audience, 30) as AnnouncementItem['audience'];
    const category = sanitizeText(req.body?.category, 40) as AnnouncementItem['category'];
    const postedBy = sanitizeText(req.body?.postedBy, 120) || 'School Administration';

    if (!title || !body) {
      res.status(400).json({ error: 'Announcement title and message are required.' });
      return;
    }

    const item: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      title,
      audience: ['All', 'Students', 'Teachers', 'Parents'].includes(audience) ? audience : 'All',
      category: ['School Notice', 'Academic Announcement', 'PTA Announcement', 'Important Information'].includes(category)
        ? category
        : 'School Notice',
      date: new Date().toISOString().slice(0, 10),
      body,
      postedBy
    };

    db.announcements.unshift(item);
    writeDb(db);
    res.status(201).json(item);
  });

  app.delete('/api/announcements/:id', requireAuth(['admin', 'teacher']), (req, res) => {
    const db = readDb();
    db.announcements = db.announcements.filter((a) => a.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  app.post('/api/calendar', requireAuth(['admin']), (req, res) => {
    const db = readDb();
    const title = sanitizeText(req.body?.title, 180);
    const term = sanitizeText(req.body?.term, 80) || 'Academic Calendar';
    const dateRange = sanitizeText(req.body?.dateRange, 100);
    const description = sanitizeText(req.body?.description, 500);
    const category = sanitizeText(req.body?.category, 40) as CalendarEvent['category'];

    if (!title || !dateRange) {
      res.status(400).json({ error: 'Event title and date are required.' });
      return;
    }

    const event: CalendarEvent = {
      id: `cal-${Date.now()}`,
      title,
      term,
      dateRange,
      description,
      category: ['Term Date', 'Examination', 'PTA & Community', 'Liturgical & Civic'].includes(category)
        ? category
        : 'Term Date'
    };

    db.calendar.push(event);
    writeDb(db);
    res.status(201).json(event);
  });

  app.delete('/api/calendar/:id', requireAuth(['admin']), (req, res) => {
    const db = readDb();
    db.calendar = db.calendar.filter((c) => c.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  app.post('/api/news', requireAuth(['admin']), (req, res) => {
    const db = readDb();
    const title = sanitizeText(req.body?.title, 200);
    const category = sanitizeText(req.body?.category, 40) as NewsArticle['category'];
    const date = sanitizeText(req.body?.date, 30) || new Date().toISOString().slice(0, 10);
    const summary = sanitizeText(req.body?.summary, 500);
    const body = sanitizeText(req.body?.body, 5000);
    const imageUrl = sanitizeText(req.body?.imageUrl, 400) || '/assets/aistudio/20220527_113124_54f20b3d.jpg';
    const imageCaption = sanitizeText(req.body?.imageCaption, 240);

    if (!title || !summary || !body) {
      res.status(400).json({ error: 'Headline, summary, and full article body are required.' });
      return;
    }
    if (!isSafeUrl(imageUrl)) {
      res.status(400).json({ error: 'Invalid image URL.' });
      return;
    }

    const article: NewsArticle = {
      id: `news-${Date.now()}`,
      title,
      category: [
        'Verified Achievement',
        'Academic Event',
        'School Activity',
        'Community & Faith',
        'Sports & Civic'
      ].includes(category)
        ? category
        : 'School Activity',
      date,
      summary,
      body,
      imageUrl,
      imageCaption: imageCaption || title
    };

    db.news.unshift(article);
    writeDb(db);
    res.status(201).json(article);
  });

  app.delete('/api/news/:id', requireAuth(['admin']), (req, res) => {
    const db = readDb();
    db.news = db.news.filter((n) => n.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  app.post('/api/gallery', requireAuth(['admin']), (req, res) => {
    const db = readDb();
    const title = sanitizeText(req.body?.title, 160);
    const caption = sanitizeText(req.body?.caption, 320);
    const category = sanitizeText(req.body?.category, 40) as GalleryPhoto['category'];
    const imageUrl = sanitizeText(req.body?.imageUrl, 400);
    const dateNote = sanitizeText(req.body?.dateNote, 60) || new Date().toISOString().slice(0, 10);

    if (!title || !imageUrl || !isSafeUrl(imageUrl)) {
      res.status(400).json({ error: 'Photo title and valid image upload/URL are required.' });
      return;
    }

    const photo: GalleryPhoto = {
      id: `gal-${Date.now()}`,
      title,
      caption: caption || title,
      category: [
        'Campus & Assembly',
        'Classrooms & Learning',
        'Teachers & Leadership',
        'Awards & CivicFest',
        'Church & Community'
      ].includes(category)
        ? category
        : 'Campus & Assembly',
      imageUrl,
      dateNote
    };

    db.gallery.unshift(photo);
    writeDb(db);
    res.status(201).json(photo);
  });

  app.delete('/api/gallery/:id', requireAuth(['admin']), (req, res) => {
    const db = readDb();
    db.gallery = db.gallery.filter((g) => g.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  app.post('/api/contact', (req, res) => {
    const db = readDb();
    const senderName = sanitizeText(req.body?.senderName, 120);
    const phoneOrEmail = sanitizeText(req.body?.phoneOrEmail, 120);
    const role = sanitizeText(req.body?.role, 40) as ContactSubmission['role'];
    const subject = sanitizeText(req.body?.subject, 160);
    const message = sanitizeText(req.body?.message, 2500);

    if (!senderName || !phoneOrEmail || !message) {
      res.status(400).json({ error: 'Name, phone number or email, and message are required.' });
      return;
    }

    const entry: ContactSubmission = {
      id: `msg-${Date.now()}`,
      senderName,
      phoneOrEmail,
      role: ['Parent / Guardian', 'Student', 'Community Member', 'GES / Official', 'Other'].includes(role)
        ? role
        : 'Parent / Guardian',
      subject: subject || 'General School Inquiry',
      message,
      submittedAt: new Date().toISOString(),
      status: 'New'
    };

    db.contactMessages.unshift(entry);
    writeDb(db);
    res.status(201).json({ ok: true, id: entry.id });
  });

  app.patch('/api/contact/:id', requireAuth(['admin']), (req, res) => {
    const db = readDb();
    const msg = db.contactMessages.find((m) => m.id === req.params.id);
    if (!msg) {
      res.status(404).json({ error: 'Message not found.' });
      return;
    }
    msg.status = msg.status === 'New' ? 'Reviewed' : 'New';
    writeDb(db);
    res.json(msg);
  });

  app.delete('/api/contact/:id', requireAuth(['admin']), (req, res) => {
    const db = readDb();
    db.contactMessages = db.contactMessages.filter((m) => m.id !== req.params.id);
    writeDb(db);
    res.json({ ok: true });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nkurakan R/C JHS server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
