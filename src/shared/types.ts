export type PageId =
  | 'home'
  | 'about'
  | 'academics'
  | 'students'
  | 'teachers'
  | 'parents'
  | 'news'
  | 'gallery'
  | 'contact';

export type JhsLevel = 'JHS 1' | 'JHS 2' | 'JHS 3' | 'All JHS';

export type MaterialCategory =
  | 'Class Notes'
  | 'Assignment'
  | 'Revision Material'
  | 'BECE Preparation'
  | 'Examination Material'
  | 'Teaching Resource';

export type GalleryCategory =
  | 'Campus & Assembly'
  | 'Classrooms & Learning'
  | 'Teachers & Leadership'
  | 'Awards & CivicFest'
  | 'Church & Community';

export type UserRole = 'admin' | 'teacher';

export interface AuthSession {
  token: string;
  role: UserRole;
  displayName: string;
}

export interface AuthStatus {
  claimed: boolean;
  envConfigured: boolean;
  teacherPasscodeConfigured: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  qualificationNote: string;
  photoUrl?: string;
  isPlaceholder?: boolean;
}

export interface SchoolProfile {
  name: string;
  fullName: string;
  location: string;
  municipality: string;
  region: string;
  country: string;
  schoolType: string;
  established: string;
  establishedSource: string;
  motto: string;
  mottoVerifiedNote: string;
  crestUrl: string;
  whatsapp: string;
  telephone: string;
  email: string;
  parishPartner: string;
  headteacher: {
    name: string;
    title: string;
    photoUrl: string;
    welcomeTitle: string;
    welcomeMessage: string;
  };
  socialLinks: {
    facebook: string;
    youtube: string;
    instagram: string;
  };
}

export interface SchoolAbout {
  historyTitle: string;
  historyBody: string;
  historyNote: string;
  vision: string;
  mission: string;
  objectives: string[];
  catholicValues: {
    id: string;
    title: string;
    description: string;
  }[];
  administration: StaffMember[];
  teachersAndStaff: StaffMember[];
}

export interface SubjectCurriculum {
  id: string;
  name: string;
  code: string;
  department: string;
  summary: string;
  jhs1Topics: string[];
  jhs2Topics: string[];
  jhs3Topics: string[];
}

export interface LearningMaterial {
  id: string;
  title: string;
  subject: string;
  level: JhsLevel;
  category: MaterialCategory;
  description: string;
  contentBody: string;
  author: string;
  datePosted: string;
  dueDate?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
}

export interface EducationalVideo {
  id: string;
  title: string;
  subject: string;
  level: JhsLevel;
  description: string;
  videoUrl: string;
  duration: string;
  postedBy: string;
  datePosted: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  audience: 'All' | 'Students' | 'Teachers' | 'Parents';
  category: 'School Notice' | 'Academic Announcement' | 'PTA Announcement' | 'Important Information';
  date: string;
  body: string;
  postedBy: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  term: string;
  dateRange: string;
  description: string;
  category: 'Term Date' | 'Examination' | 'PTA & Community' | 'Liturgical & Civic';
}

export interface NewsArticle {
  id: string;
  title: string;
  category: 'Verified Achievement' | 'Academic Event' | 'School Activity' | 'Community & Faith' | 'Sports & Civic';
  date: string;
  summary: string;
  body: string;
  imageUrl: string;
  imageCaption: string;
  isVerifiedHighlight?: boolean;
  verifiedMetric?: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  caption: string;
  category: GalleryCategory;
  imageUrl: string;
  dateNote: string;
}

export interface ContactSubmission {
  id: string;
  senderName: string;
  phoneOrEmail: string;
  role: 'Parent / Guardian' | 'Student' | 'Community Member' | 'GES / Official' | 'Other';
  subject: string;
  message: string;
  submittedAt: string;
  status: 'New' | 'Reviewed';
}

export interface SchoolDatabase {
  profile: SchoolProfile;
  about: SchoolAbout;
  subjects: SubjectCurriculum[];
  materials: LearningMaterial[];
  videos: EducationalVideo[];
  announcements: AnnouncementItem[];
  calendar: CalendarEvent[];
  news: NewsArticle[];
  gallery: GalleryPhoto[];
  contactMessages: ContactSubmission[];
}
