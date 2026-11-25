import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { SchoolDatabase, UserRole } from '../shared/types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
export const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const DB_FILE = path.resolve(DATA_DIR, 'school-db.json');
const AUTH_FILE = path.resolve(DATA_DIR, 'auth-store.json');

interface AuthStore {
  adminHash?: string;
  adminSalt?: string;
  teacherHash?: string;
  teacherSalt?: string;
  claimedAt?: string;
}

function ensureDirs(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function createInitialDb(): SchoolDatabase {
  return {
    profile: {
      name: 'NKURAKAN R/C JHS',
      fullName: 'Nkurakan Roman Catholic Junior High School',
      location: 'Nkurakan, Yilo Krobo Municipality, Eastern Region, Ghana',
      municipality: 'Yilo Krobo Municipality',
      region: 'Eastern Region',
      country: 'Ghana',
      schoolType: 'Public Roman Catholic Junior High School',
      established: '2008',
      establishedSource: '2019 National Inspectorate Board (NIB) Report',
      motto: 'Knowledge is Power',
      mottoVerifiedNote:
        'As displayed on the school crest. The Headteacher may edit or update the official motto and crest directly from the School Portal.',
      crestUrl: '/assets/aistudio/file_00000000314c8210800e343683f8932f_46cfaa06.png',
      whatsapp: '0244 599 014',
      telephone: '0245 023 827',
      email: 'Update official school email in Admin Portal',
      parishPartner: 'St. Stephen Catholic Church, Nkurakan',
      headteacher: {
        name: 'Bernice Arkor Nyako',
        title: 'Headteacher, Nkurakan R/C JHS',
        photoUrl: '/assets/aistudio/IMG-20260905-WA0082_d5b7ea9e.jpg',
        welcomeTitle: 'Welcome to Nkurakan Roman Catholic Junior High School',
        welcomeMessage:
          'On behalf of the teaching staff, students, and school management committee of Nkurakan R/C JHS, we warmly welcome parents, learners, alumni, and visitors to our official educational portal. Situated in Nkurakan within the Yilo Krobo Municipality of the Eastern Region, our school continues its commitment—established in 2008—to nurturing disciplined, curious, and morally grounded young citizens through quality public Roman Catholic education.'
      },
      socialLinks: {
        facebook: '',
        youtube: '',
        instagram: ''
      }
    },
    about: {
      historyTitle: 'Our Founding & Institutional Heritage',
      historyBody:
        'Nkurakan Roman Catholic Junior High School (Nkurakan R/C JHS) is a public Roman Catholic basic school serving the Nkurakan community in the Yilo Krobo Municipality of the Eastern Region of Ghana. According to the 2019 National Inspectorate Board (NIB) inspection report, the school was established in 2008. Operating in partnership with the Ghana Education Service and the Catholic Education Unit alongside St. Stephen Catholic Church, Nkurakan, the school delivers the national Basic Education Certificate Examination (BECE) Junior High School curriculum across JHS 1, JHS 2, and JHS 3. Additional historical milestones, alumni records, and founding leadership archives can be added by the Headteacher at any time through the management portal.',
      historyNote:
        'Verified baseline: Public Roman Catholic Junior High School, established 2008 (2019 National Inspectorate Board Report). Editable by the Headteacher.',
      vision:
        'Editable Vision Statement: To raise academically diligent, morally upright, and civic-minded Junior High School graduates prepared for Senior High School and lifelong service in Yilo Krobo and Ghana. (Update in Headteacher Portal)',
      mission:
        'Editable Mission Statement: To provide inclusive, values-based public Junior High School education anchored in Roman Catholic discipline, effective classroom instruction, and strong parent-school-church collaboration. (Update in Headteacher Portal)',
      objectives: [
        'Deliver thorough instruction across all ten Ghana Education Service / NaCCA Junior High School subjects from JHS 1 to JHS 3.',
        'Prepare JHS 3 candidates systematically and ethically for the Basic Education Certificate Examination (BECE).',
        'Cultivate civic responsibility, environmental stewardship, and Catholic moral character in daily school life.',
        'Strengthen transparent communication between teachers, parents, the PTA, and the wider Nkurakan community.'
      ],
      catholicValues: [
        {
          id: 'val-1',
          title: 'Faith & Moral Integrity',
          description:
            'Guided by Roman Catholic spiritual formation and respect for human dignity in partnership with St. Stephen Catholic Church, Nkurakan.'
        },
        {
          id: 'val-2',
          title: 'Academic Diligence',
          description:
            'Encouraging consistent study habits, curiosity, and pride in learning—reflecting our school motto, "Knowledge is Power."'
        },
        {
          id: 'val-3',
          title: 'Civic & Environmental Stewardship',
          description:
            'Active student participation in national civic education and environmental responsibility across Nkurakan and Yilo Krobo.'
        },
        {
          id: 'val-4',
          title: 'Community & Service',
          description:
            'Fostering mutual respect among students, educators, parents, and community leaders for collective growth.'
        }
      ],
      administration: [
        {
          id: 'adm-1',
          name: 'Bernice Arkor Nyako',
          role: 'Headteacher',
          department: 'School Administration',
          qualificationNote: 'Overall academic leadership, GES & Catholic Education Unit liaison.',
          photoUrl: '/assets/aistudio/IMG-20260905-WA0082_d5b7ea9e.jpg',
          isPlaceholder: false
        },
        {
          id: 'adm-2',
          name: 'Assistant Headteacher (Update Name in Portal)',
          role: 'Assistant Headteacher',
          department: 'Academic & Curriculum Supervision',
          qualificationNote: 'Timetabling, scheme-of-learning review, and student welfare coordination.',
          isPlaceholder: true
        },
        {
          id: 'adm-3',
          name: 'PTA & SMC Leadership (Update Names in Portal)',
          role: 'PTA Chairperson & Local Manager',
          department: 'School Governance & Parish Partnership',
          qualificationNote: 'Parent-Teacher Association and St. Stephen Catholic Church local school oversight.',
          isPlaceholder: true
        }
      ],
      teachersAndStaff: [
        {
          id: 'stf-1',
          name: 'Languages & Humanities Faculty (Update Staff Names)',
          role: 'English, Ghanaian Language, French & RME',
          department: 'Languages & Moral Education',
          qualificationNote: 'Update individual teacher names, assigned classes, and office hours via the Headteacher Portal.',
          isPlaceholder: true
        },
        {
          id: 'stf-2',
          name: 'Mathematics & Science Faculty (Update Staff Names)',
          role: 'Mathematics, Integrated Science & Computing',
          department: 'STEM & Digital Literacy',
          qualificationNote: 'Update individual teacher names and subject specializations via the Headteacher Portal.',
          isPlaceholder: true
        },
        {
          id: 'stf-3',
          name: 'Social, Career & Creative Faculty (Update Staff Names)',
          role: 'Social Studies, Career Technology & Creative Arts',
          department: 'Social & Applied Arts',
          qualificationNote: 'Update individual teacher names and JHS form masters via the Headteacher Portal.',
          isPlaceholder: true
        }
      ]
    },
    subjects: [
      {
        id: 'subj-english',
        name: 'English Language',
        code: 'ENG',
        department: 'Languages',
        summary: 'Oral communication, grammar usage, reading comprehension, literature, and structured essay writing.',
        jhs1Topics: [
          'Parts of speech, sentence structure & punctuation',
          'Reading comprehension & vocabulary building',
          'Narrative & descriptive paragraph composition',
          'Oral English: listening & conversational fluency'
        ],
        jhs2Topics: [
          'Complex clauses, tenses & reported speech',
          'Formal and informal letter writing',
          'Summary skills & prose analysis',
          'Debates, speeches & reading fluency'
        ],
        jhs3Topics: [
          'BECE composition mastery (essays, articles, speeches)',
          'Comprehension inference & literary devices',
          'Lexis and structure intensive practice',
          'Mock BECE Paper 1 & Paper 2 past question drills'
        ]
      },
      {
        id: 'subj-math',
        name: 'Mathematics',
        code: 'MTH',
        department: 'STEM',
        summary: 'Number sense, algebraic reasoning, geometry, measurement, and data handling aligned with the NaCCA JHS standards.',
        jhs1Topics: [
          'Number & numeration systems, operations & properties',
          'Fractions, decimals, percentages & ratios',
          'Introduction to algebraic expressions & linear equations',
          'Angles, plane shapes & basic statistics'
        ],
        jhs2Topics: [
          'Linear inequalities, relations & mappings',
          'Pythagoras theorem, perimeter, area & volume',
          'Vectors, transformations & geometric constructions',
          'Probability & data interpretation (bar/pie charts)'
        ],
        jhs3Topics: [
          'Simultaneous linear equations & algebraic word problems',
          'Coordinate geometry, bearings & rigid motion',
          'Business mathematics (profit, loss, interest, VAT)',
          'BECE Paper 1 objective & Paper 2 problem-solving drills'
        ]
      },
      {
        id: 'subj-science',
        name: 'Science',
        code: 'SCI',
        department: 'STEM',
        summary: 'Integrated exploration of diversity of matter, cycles, systems, energy, and interactions of matter.',
        jhs1Topics: [
          'Introduction to integrated science & measurement',
          'Living cells, classification & properties of matter',
          'Water cycle, soil conservation & crop production',
          'Forms of energy & basic electrical circuits'
        ],
        jhs2Topics: [
          'Mixtures, separation techniques & chemical symbols',
          'Human respiratory, circulatory & digestive systems',
          'Photosynthesis, ecosystems & food chains',
          'Forces, simple machines & heat transfer'
        ],
        jhs3Topics: [
          'Acids, bases, salts & rusting prevention',
          'Electronics, magnetism & domestic wiring safety',
          'Reproduction, heredity & public health education',
          'BECE practicals, diagrams & integrated science revision'
        ]
      },
      {
        id: 'subj-social',
        name: 'Social Studies',
        code: 'SOC',
        department: 'Humanities & Civic Education',
        summary: 'Ghanaian environment, governance, citizenship, national heritage, and socio-economic development.',
        jhs1Topics: [
          'Self-identity, adolescent development & family life',
          'Our physical environment & environmental sanitation',
          'Mapping skills, landmarks & Ghana’s regions',
          'Culture, festivals & national symbols'
        ],
        jhs2Topics: [
          'Conflict prevention, peacebuilding & community leadership',
          'Ghana’s independence struggle & constitutional democracy',
          'Natural resources, agriculture & productivity',
          'Rights and responsibilities of the Ghanaian citizen'
        ],
        jhs3Topics: [
          'Arms of government, rule of law & civic institutions (NCCE, CHRAJ)',
          'Population growth, entrepreneurship & sustainable development',
          'Ghana and international cooperation (ECOWAS, AU, UN)',
          'BECE Social Studies essay framing & source analysis'
        ]
      },
      {
        id: 'subj-computing',
        name: 'Computing',
        code: 'CMP',
        department: 'STEM & Digital Literacy',
        summary: 'Computer hardware, productivity tools, internet safety, computational thinking, and basic programming.',
        jhs1Topics: [
          'Generations of computers, hardware & peripheral devices',
          'Operating systems, file management & keyboarding',
          'Introduction to word processing & formatting',
          'Digital citizenship & safe ergonomics'
        ],
        jhs2Topics: [
          'Spreadsheets (formulas, functions & charts)',
          'Presentation software & multimedia design',
          'Computer networks, internet & online safety',
          'Algorithms, flowcharts & visual block coding'
        ],
        jhs3Topics: [
          'Database concepts & structured information management',
          'Web technologies, HTML basics & ethical computing',
          'Introduction to text-based programming logic',
          'BECE Computing practical scenarios & theory revision'
        ]
      },
      {
        id: 'subj-career-tech',
        name: 'Career Technology',
        code: 'CTH',
        department: 'Applied & Technical Arts',
        summary: 'Practical pre-technical, home economics, materials, tools, and entrepreneurial design skills.',
        jhs1Topics: [
          'Personal hygiene, food safety & kitchen tools',
          'Basic compliant & resistant materials (wood, metal, textiles)',
          'Workshop safety rules & measuring instruments',
          'Sketching & simple technical drawing'
        ],
        jhs2Topics: [
          'Food preparation methods & balanced meal planning',
          'Garment construction, stitches & seams',
          'Joining, finishing & basic woodwork/metalwork processes',
          'Small-scale enterprise planning & costing'
        ],
        jhs3Topics: [
          'Designing & producing functional artefacts from briefs',
          'Structures, mechanisms & basic electrical maintenance',
          'Entrepreneurship, marketing & portfolio presentation',
          'BECE Career Technology integrated assessment prep'
        ]
      },
      {
        id: 'subj-creative-arts',
        name: 'Creative Arts and Design',
        code: 'CAD',
        department: 'Creative Arts',
        summary: 'Visual arts, design thinking, music, dance, drama, and Ghanaian cultural expression.',
        jhs1Topics: [
          'Elements and principles of design in nature & culture',
          'Drawing, shading, colour theory & pattern making',
          'Traditional Ghanaian rhythms, folk songs & instruments',
          'Introduction to dramatic storytelling'
        ],
        jhs2Topics: [
          'Graphic design, poster making & lettering',
          'Sculpture, pottery & basketry using local materials',
          'Musical notation, harmony & choral performance',
          'Stagecraft, mime & cultural dance choreography'
        ],
        jhs3Topics: [
          'Design process for community awareness projects',
          'Critiquing indigenous and contemporary Ghanaian artists',
          'Ensemble performance & creative portfolio curation',
          'BECE Creative Arts & Design theory & practical review'
        ]
      },
      {
        id: 'subj-rme',
        name: 'Religious and Moral Education',
        code: 'RME',
        department: 'Languages & Moral Education',
        summary: 'Moral values, comparative study of major religions in Ghana, Christian virtues, and ethical decision-making.',
        jhs1Topics: [
          'God’s creation & stewardship of the environment',
          'Attributes of God across Christianity, Islam & African Traditional Religion',
          'Obedience, honesty, humility & family responsibilities',
          'Sacred writings & places of worship'
        ],
        jhs2Topics: [
          'Prayer, worship & religious festivals in Ghana',
          'Rites of passage (naming, puberty, marriage, death)',
          'Moral teachings of religious leaders & parables',
          'Respect for authority, peers & community property'
        ],
        jhs3Topics: [
          'Work ethic, money, bribery & corruption prevention',
          'Leisure, chastity, substance abuse awareness & peer pressure',
          'Peaceful coexistence & religious tolerance in Ghana',
          'BECE RME structured essay & moral case analysis'
        ]
      },
      {
        id: 'subj-ghanaian-lang',
        name: 'Ghanaian Language',
        code: 'GHL',
        department: 'Languages',
        summary: 'Literacy, oral literature, proverbs, customs, and composition in the approved local Ghanaian language.',
        jhs1Topics: [
          'Orthography, vowels, consonants & tonal awareness',
          'Greetings, kinship terms & polite expressions',
          'Short story reading & comprehension',
          'Traditional customs & local festivals'
        ],
        jhs2Topics: [
          'Grammar: nouns, verbs, adjectives & sentence construction',
          'Proverbs, idioms & oral poetry appreciation',
          'Letter writing & guided narrative composition',
          'Traditional governance & chieftaincy institutions'
        ],
        jhs3Topics: [
          'Advanced comprehension & translation skills',
          'Creative essay writing & proverbs in context',
          'Cultural heritage, riddles & traditional occupations',
          'BECE Ghanaian Language Paper 1 & Paper 2 revision'
        ]
      },
      {
        id: 'subj-french',
        name: 'French',
        code: 'FRN',
        department: 'Languages',
        summary: 'Foundational French listening, speaking, reading, and guided writing for everyday communication.',
        jhs1Topics: [
          'Salutations, introducing oneself & classroom objects',
          'Numbers, days of the week, months & telling time',
          'Definite/indefinite articles & present tense (-er verbs)',
          'Family members, colours & describing people'
        ],
        jhs2Topics: [
          'Daily routines, school subjects & hobbies',
          'Food, shopping at the market & polite requests',
          'Possessive adjectives, prepositions & common irregular verbs',
          'Short dialogue comprehension & guided paragraphs'
        ],
        jhs3Topics: [
          'Past (passé composé) & near future (futur proche) tenses',
          'Travel, health, weather & giving directions',
          'Writing short letters & picture-guided compositions',
          'BECE French comprehension, structure & essay drills'
        ]
      }
    ],
    materials: [
      {
        id: 'mat-1',
        title: 'BECE English Language Paper 2 Essay Structure Guide',
        subject: 'English Language',
        level: 'JHS 3',
        category: 'BECE Preparation',
        description:
          'Step-by-step guide covering formal letters, articles for publication, speeches, and narrative essays for BECE candidates.',
        contentBody:
          'OBJECTIVE:\nPrepare JHS 3 candidates to plan, organize, and proofread high-scoring Paper 2 compositions.\n\nSECTION 1: ESSAY PLANNING (10 MINUTES)\n1. Read all three questions carefully and select the topic you understand best.\n2. Identify the audience, purpose, and required format (Formal Letter, Semi-Formal Letter, Article, Speech, or Story).\n3. Draft 4 clear paragraph points before writing.\n\nSECTION 2: PARAGRAPH DISCIPLINE\n- Introduction: State the purpose clearly without repeating the prompt word-for-word.\n- Body Paragraphs (3 paragraphs): One main idea per paragraph with concrete Ghanaian examples.\n- Conclusion: Summarize your main stance or closing call to action.\n\nSECTION 3: MECHANICS CHECKLIST\n- Check subject-verb agreement, tense consistency, punctuation, and spelling.\n- Avoid slang or SMS abbreviations in formal writing.',
        author: 'Languages Department (Editable)',
        datePosted: '2026-10-12'
      },
      {
        id: 'mat-2',
        title: 'Linear Equations & Algebraic Word Problems Worksheet',
        subject: 'Mathematics',
        level: 'JHS 2',
        category: 'Assignment',
        description:
          'Practice exercises on translating word statements into linear equations and solving step by step.',
        contentBody:
          'INSTRUCTIONS: Show all working steps clearly in your Mathematics exercise book.\n\nPART A: SOLVE FOR X\n1. 3x + 7 = 22\n2. 5(x - 2) = 3x + 6\n3. (2x / 3) + 4 = 10\n4. 7 - 2x = 19\n\nPART B: WORD PROBLEMS\n5. A number is multiplied by 4 and 9 is subtracted. The result is 27. Find the number.\n6. Kwame has twice as many exercise books as Ama. Together they have 18 books. How many books does each student have?\n7. The perimeter of a rectangle is 36 cm. If its length is 4 cm longer than its width, find the dimensions.',
        author: 'Mathematics Department (Editable)',
        datePosted: '2026-11-02',
        dueDate: '2026-11-30'
      },
      {
        id: 'mat-3',
        title: 'States of Matter & Separation of Mixtures Study Notes',
        subject: 'Science',
        level: 'JHS 1',
        category: 'Class Notes',
        description:
          'Clear summary notes comparing solids, liquids, and gases alongside filtration, evaporation, and distillation.',
        contentBody:
          'TOPIC: DIVERSITY OF MATTER\n\n1. STATES OF MATTER\n- Solids: Fixed shape and fixed volume; particles tightly packed.\n- Liquids: Fixed volume but takes the shape of the container; particles slide past one another.\n- Gases: No fixed shape or volume; particles move rapidly and freely.\n\n2. SEPARATING MIXTURES\n- Filtration: Separates an insoluble solid from a liquid (e.g., sand and water).\n- Evaporation: Recovers a dissolved solid from a solution (e.g., salt from salt water).\n- Magnetic Separation: Separates magnetic substances (iron filings) from non-magnetic materials (sand).\n- Decantation: Carefully pouring off a clear liquid from settled sediment.\n\nREVIEW QUESTION:\nExplain which separation method you would use to obtain clean water from muddy stream water, listing the materials required.',
        author: 'Science Department (Editable)',
        datePosted: '2026-10-20'
      },
      {
        id: 'mat-4',
        title: 'Constitutional Democracy & Civic Institutions in Ghana',
        subject: 'Social Studies',
        level: 'JHS 3',
        category: 'Revision Material',
        description:
          'Revision notes on the 1992 Constitution, arms of government, and civic bodies including the NCCE.',
        contentBody:
          'TOPIC: GOVERNANCE AND CITIZENSHIP\n\n1. ARMS OF GOVERNMENT\n- The Executive: Implements laws and national policy.\n- The Legislature (Parliament): Makes laws and approves national budgets.\n- The Judiciary: Interprets laws and administers justice independently.\n\n2. KEY CIVIC INSTITUTIONS\n- NCCE (National Commission for Civic Education): Educates citizens on constitutional rights, civic duties, and democratic participation.\n- Electoral Commission (EC): Conducts and supervises public elections and referenda.\n- CHRAJ: Protects fundamental human rights and investigates administrative injustice.\n\n3. DUTIES OF A RESPONSIBLE STUDENT CITIZEN\n- Respecting national symbols, protecting public property, maintaining environmental cleanliness, and participating constructively in civic life.',
        author: 'Social Studies Department (Editable)',
        datePosted: '2026-10-28'
      },
      {
        id: 'mat-5',
        title: 'Spreadsheet Formulas & Cell Referencing Guide',
        subject: 'Computing',
        level: 'JHS 2',
        category: 'Teaching Resource',
        description:
          'Teacher & student guide introducing SUM, AVERAGE, MIN, MAX, and basic chart creation in spreadsheets.',
        contentBody:
          'COMPUTING LESSON GUIDE: SPREADSHEETS\n\n1. BASIC TERMINOLOGY\n- Workbook, Worksheet, Column (Letters A, B, C), Row (Numbers 1, 2, 3), Cell (e.g., B4).\n\n2. ESSENTIAL FORMULAS (ALWAYS START WITH =)\n- Addition: =SUM(B2:B6)\n- Mean score: =AVERAGE(B2:B6)\n- Highest score: =MAX(B2:B6)\n- Lowest score: =MIN(B2:B6)\n\nCLASS ACTIVITY:\nCreate a 5-subject score table for a JHS 2 student, compute total and average marks, and insert a column chart.',
        author: 'Computing Department (Editable)',
        datePosted: '2026-11-05'
      },
      {
        id: 'mat-6',
        title: 'BECE Mock Examination Preparation Checklist (All Subjects)',
        subject: 'All Core & Elective Subjects',
        level: 'JHS 3',
        category: 'Examination Material',
        description:
          'Weekly study timetable framework and exam-room readiness checklist for JHS 3 BECE candidates.',
        contentBody:
          'BECE EXAMINATION READINESS FRAMEWORK\n\n1. WEEKLY REVISION ROTATION\n- Monday: English Language & Social Studies\n- Tuesday: Mathematics & Computing\n- Wednesday: Integrated Science & Career Technology\n- Thursday: RME & Ghanaian Language\n- Friday: French, Creative Arts & Past Question Timed Practice\n\n2. EXAMINATION CONDUCT\n- Arrive 30 minutes early with approved mathematical set, pencils, pens, and index slip.\n- Read all instructions on both Paper 1 (Objective) and Paper 2 (Essay/Structured) before beginning.\n- Manage time carefully and review all shaded OMR circles.',
        author: 'Academic Board (Editable)',
        datePosted: '2026-11-10'
      }
    ],
    videos: [
      {
        id: 'vid-1',
        title: 'Understanding Algebraic Expressions & Linear Equations (JHS)',
        subject: 'Mathematics',
        level: 'JHS 1',
        description: 'Clear step-by-step lesson template. Teachers can attach verified YouTube or local educational video links in Teachers’ Corner.',
        videoUrl: 'https://www.youtube.com/results?search_query=ghana+jhs+mathematics+linear+equations',
        duration: 'Lesson Resource Link',
        postedBy: 'Mathematics Department',
        datePosted: '2026-10-18'
      },
      {
        id: 'vid-2',
        title: 'Integrated Science: Separation of Mixtures & Lab Safety',
        subject: 'Science',
        level: 'JHS 2',
        description: 'Guided visual search & classroom demonstration link for JHS Integrated Science.',
        videoUrl: 'https://www.youtube.com/results?search_query=ghana+jhs+integrated+science+mixtures',
        duration: 'Lesson Resource Link',
        postedBy: 'Science Department',
        datePosted: '2026-10-25'
      },
      {
        id: 'vid-3',
        title: 'BECE English Comprehension & Summary Techniques',
        subject: 'English Language',
        level: 'JHS 3',
        description: 'Video lesson slot editable by English teachers with direct embedded or YouTube classroom videos.',
        videoUrl: 'https://www.youtube.com/results?search_query=bece+english+language+comprehension+ghana',
        duration: 'Lesson Resource Link',
        postedBy: 'Languages Department',
        datePosted: '2026-11-01'
      }
    ],
    announcements: [
      {
        id: 'ann-1',
        title: 'Nkurakan R/C JHS Celebrates October 2025 NCCE CivicFest Victory (256 Points)',
        audience: 'All',
        category: 'School Notice',
        date: '2025-10-24',
        body:
          'We congratulate our students and civic education patrons on winning the October 2025 NCCE CivicFest competition with 256 points. We thank parents, teachers, and the Yilo Krobo Municipal NCCE office for supporting civic literacy and student excellence.',
        postedBy: 'Bernice Arkor Nyako, Headteacher'
      },
      {
        id: 'ann-2',
        title: 'JHS 3 Intensive BECE Preparation & Extra Study Schedule',
        audience: 'Students',
        category: 'Academic Announcement',
        date: '2026-11-12',
        body:
          'All JHS 3 candidates are reminded to download the weekly BECE preparation materials in Students’ Corner and report punctually for morning revision classes.',
        postedBy: 'Academic Committee'
      },
      {
        id: 'ann-3',
        title: 'PTA General Meeting & Term Academic Review Notice',
        audience: 'Parents',
        category: 'PTA Announcement',
        date: '2026-11-15',
        body:
          'Parents and guardians are warmly invited to check the Parents’ Corner regularly for confirmed PTA meeting dates, uniform guidelines, and end-of-term assessment schedules. Please edit exact upcoming term dates in the Headteacher Portal.',
        postedBy: 'PTA & School Administration'
      },
      {
        id: 'ann-4',
        title: 'Teacher Resource & Class Notes Submission Reminder',
        audience: 'Teachers',
        category: 'Important Information',
        date: '2026-11-18',
        body:
          'Subject teachers across JHS 1, JHS 2, and JHS 3 can log into the Teachers’ Corner to upload weekly PDF class notes, assignments, and exam preparation guides directly for students.',
        postedBy: 'Bernice Arkor Nyako, Headteacher'
      }
    ],
    calendar: [
      {
        id: 'cal-1',
        title: 'Reopening & Academic Orientation (Editable Term Date)',
        term: 'GES Term Schedule',
        dateRange: 'Update exact GES term reopening date in Portal',
        description: 'General assembly, class allocation, and distribution of term schemes of learning.',
        category: 'Term Date'
      },
      {
        id: 'cal-2',
        title: 'Mid-Term Continuous Assessment Week',
        term: 'GES Term Schedule',
        dateRange: 'Week 6 of Term (Editable)',
        description: 'Class exercises, project work, and continuous assessment across all 10 NaCCA subjects.',
        category: 'Examination'
      },
      {
        id: 'cal-3',
        title: 'PTA Meeting & Open Day Consultation',
        term: 'School & Community',
        dateRange: 'Scheduled per Term (Editable)',
        description: 'Parents meet form teachers to review student attendance, discipline, and academic progress.',
        category: 'PTA & Community'
      },
      {
        id: 'cal-4',
        title: 'St. Stephen Catholic Church Parish School Mass & Civic Activities',
        term: 'Catholic Formation',
        dateRange: 'Termly Liturgical Calendar (Editable)',
        description: 'School liturgical celebration and civic awareness programs with our parish and community.',
        category: 'Liturgical & Civic'
      }
    ],
    news: [
      {
        id: 'news-1',
        title: 'Nkurakan R/C JHS Wins October 2025 NCCE CivicFest with 256 Points',
        category: 'Verified Achievement',
        date: '2025-10-20',
        summary:
          'Nkurakan Roman Catholic Junior High School emerged victorious at the October 2025 National Commission for Civic Education (NCCE) CivicFest competition, scoring an impressive 256 points.',
        body:
          'In October 2025, students representing Nkurakan R/C JHS demonstrated outstanding knowledge of Ghana’s 1992 Constitution, democratic governance, civic responsibilities, and environmental stewardship at the NCCE CivicFest, securing first place with 256 points.\n\nThis achievement reflects the dedication of our students, the guidance of our Social Studies and civic patron teachers, and the enduring encouragement of parents and the Nkurakan community. True to our motto, "Knowledge is Power," the school remains committed to nurturing informed, ethical young citizens in the Yilo Krobo Municipality.',
        imageUrl: '/assets/aistudio/images_b04ef0c8.jpeg',
        imageCaption: 'Nkurakan R/C JHS students in school uniform participating in NCCE civic and environmental advocacy.',
        isVerifiedHighlight: true,
        verifiedMetric: 'October 2025 · 256 Points'
      },
      {
        id: 'news-2',
        title: 'Ghana Education Service Nkurakan Circuit Certificate Recognition',
        category: 'Academic Event',
        date: '2023-06-08',
        summary:
          'Presentation of Ghana Education Service Nkurakan Circuit Zone certificates recognizing active participation and school engagement.',
        body:
          'Staff and student representatives at Nkurakan R/C JHS received Ghana Education Service (Nkurakan Circuit Zone) certificates during school presentation ceremonies held on campus. Photographs from the occasion are preserved in our School Gallery.',
        imageUrl: '/assets/aistudio/20230531_135400_89e878c1.jpg',
        imageCaption: 'Certificate presentation with Nkurakan R/C JHS teachers and uniformed students.'
      },
      {
        id: 'news-3',
        title: 'Environmental Stewardship: Beat Plastic Pollution & Zero Waste Advocacy',
        category: 'Sports & Civic',
        date: '2025-10-15',
        summary:
          'Students advocate for Reduce, Reuse, and Recycle practices during NCCE environmental awareness outreach.',
        body:
          'Working alongside the National Commission for Civic Education (NCCE), Nkurakan R/C JHS students joined the "Beat Plastic Pollution — Zero Waste" awareness campaign, promoting clean school grounds and sustainable habits across Nkurakan.',
        imageUrl: '/assets/aistudio/images__1__8591100e.jpeg',
        imageCaption: 'Students holding the NCCE Environmental Change awareness frame.'
      },
      {
        id: 'news-4',
        title: 'Catholic Faith & Parish Life at St. Stephen Catholic Church, Nkurakan',
        category: 'Community & Faith',
        date: '2022-12-14',
        summary:
          'Students participate in liturgy, scripture readings, and parish harvest celebrations at St. Stephen Catholic Church, Nkurakan.',
        body:
          'As a Roman Catholic Junior High School, Nkurakan R/C JHS maintains a close spiritual bond with St. Stephen Catholic Church, Nkurakan. Students regularly participate in readings, cultural presentations, and annual harvest thanksgiving services.',
        imageUrl: '/assets/aistudio/20221214_112130_265ab756.jpg',
        imageCaption: 'Student in traditional Kente cloth reading at the lectern in St. Stephen Catholic Church, Nkurakan.'
      }
    ],
    gallery: [
      {
        id: 'gal-1',
        title: 'Whole-School Assembly Under the Campus Tree',
        caption: 'Students gathered in white-and-yellow and blue check uniforms in front of the main classroom block.',
        category: 'Campus & Assembly',
        imageUrl: '/assets/aistudio/20220527_113124_54f20b3d.jpg',
        dateNote: 'Campus Archive'
      },
      {
        id: 'gal-2',
        title: 'Headteacher Bernice Arkor Nyako on Campus',
        caption: 'Headteacher Bernice Arkor Nyako on the landscaped grounds of Nkurakan.',
        category: 'Teachers & Leadership',
        imageUrl: '/assets/aistudio/IMG-20260905-WA0082_d5b7ea9e.jpg',
        dateNote: 'Leadership Archive'
      },
      {
        id: 'gal-3',
        title: 'NCCE Environmental Advocacy (White & Yellow Uniforms)',
        caption: 'Students wearing the Nkurakan R/C JHS crest on their uniforms during the NCCE Zero Waste campaign.',
        category: 'Awards & CivicFest',
        imageUrl: '/assets/aistudio/images_b04ef0c8.jpeg',
        dateNote: 'NCCE Outreach'
      },
      {
        id: 'gal-4',
        title: 'NCCE Beat Plastic Pollution Campaign',
        caption: 'Female students holding the NCCE "I’m an advocate for Environmental Change!" frame.',
        category: 'Awards & CivicFest',
        imageUrl: '/assets/aistudio/images__1__8591100e.jpeg',
        dateNote: 'NCCE Outreach'
      },
      {
        id: 'gal-5',
        title: 'GES Nkurakan Circuit Zone Certificate Presentation',
        caption: 'Teachers and students receiving a Ghana Education Service Nkurakan Circuit Zone certificate.',
        category: 'Awards & CivicFest',
        imageUrl: '/assets/aistudio/20230531_135400_89e878c1.jpg',
        dateNote: 'May 2023'
      },
      {
        id: 'gal-6',
        title: 'Campus Certificate Handover',
        caption: 'Presentation of a Ghana Education Service certificate outside the classroom block.',
        category: 'Awards & CivicFest',
        imageUrl: '/assets/aistudio/20230608_081116_7b006d14.jpg',
        dateNote: 'June 2023'
      },
      {
        id: 'gal-7',
        title: 'Interactive Classroom Instruction',
        caption: 'Teacher engaging students at their wooden desks inside the classroom.',
        category: 'Classrooms & Learning',
        imageUrl: '/assets/aistudio/20221130_081639_3958facb.jpg',
        dateNote: 'Classroom Life'
      },
      {
        id: 'gal-8',
        title: 'Social Studies Atlas & Textbook Study',
        caption: 'Students studying with their Social Studies Atlas during class.',
        category: 'Classrooms & Learning',
        imageUrl: '/assets/aistudio/20221130_081552_eea25e73.jpg',
        dateNote: 'Classroom Life'
      },
      {
        id: 'gal-9',
        title: 'Focused Classroom Listening',
        caption: 'Students attentively following classroom instruction.',
        category: 'Classrooms & Learning',
        imageUrl: '/assets/aistudio/20221130_081631_7d541def.jpg',
        dateNote: 'Classroom Life'
      },
      {
        id: 'gal-10',
        title: 'Teacher Supervising Desk Work',
        caption: 'Educator overseeing independent student reading and exercises.',
        category: 'Classrooms & Learning',
        imageUrl: '/assets/aistudio/20221130_081645_f0e4a50b.jpg',
        dateNote: 'Classroom Life'
      },
      {
        id: 'gal-11',
        title: 'Classroom Teaching Session',
        caption: 'Instructor guiding students during morning lessons.',
        category: 'Classrooms & Learning',
        imageUrl: '/assets/aistudio/20221130_081844_5d656a3a.jpg',
        dateNote: 'Classroom Life'
      },
      {
        id: 'gal-12',
        title: 'Faculty Consultation on the Verandah',
        caption: 'Teachers conferring outside the classroom block.',
        category: 'Teachers & Leadership',
        imageUrl: '/assets/aistudio/20220527_113137_b7ee9ac4.jpg',
        dateNote: 'Campus Archive'
      },
      {
        id: 'gal-13',
        title: 'Liturgical Reading at St. Stephen Catholic Church',
        caption: 'Student reading at the lectern inside St. Stephen Catholic Church, Nkurakan.',
        category: 'Church & Community',
        imageUrl: '/assets/aistudio/20221214_110418_b7a775dc.jpg',
        dateNote: 'Parish Celebration'
      },
      {
        id: 'gal-14',
        title: 'Kente Cultural Presentation at Parish Harvest',
        caption: 'Student dressed in traditional Kente cloth addressing the congregation at St. Stephen Catholic Church, Nkurakan.',
        category: 'Church & Community',
        imageUrl: '/assets/aistudio/20221214_112130_265ab756.jpg',
        dateNote: 'Parish Celebration'
      }
    ],
    contactMessages: []
  };
}

export function readDb(): SchoolDatabase {
  ensureDirs();
  if (!fs.existsSync(DB_FILE)) {
    const initial = createInitialDb();
    writeDb(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as SchoolDatabase;
    let migrated = false;

    if (parsed.profile?.headteacher?.name === 'Office of the Headteacher') {
      parsed.profile.headteacher.name = 'Bernice Arkor Nyako';
      migrated = true;
    }

    if (Array.isArray(parsed.about?.administration)) {
      for (const member of parsed.about.administration) {
        if (member.id === 'adm-1' && member.name === 'Headteacher (Update Name in Portal)') {
          member.name = 'Bernice Arkor Nyako';
          member.qualificationNote = 'Overall academic leadership, GES & Catholic Education Unit liaison.';
          member.isPlaceholder = false;
          migrated = true;
        }
      }
    }

    if (Array.isArray(parsed.announcements)) {
      for (const ann of parsed.announcements) {
        if (ann.postedBy === 'Office of the Headteacher') {
          ann.postedBy = 'Bernice Arkor Nyako, Headteacher';
          migrated = true;
        }
      }
    }

    if (Array.isArray(parsed.gallery)) {
      for (const item of parsed.gallery) {
        if (item.id === 'gal-2' && item.title === 'School Leadership Portrait on Campus') {
          item.title = 'Headteacher Bernice Arkor Nyako on Campus';
          item.caption = 'Headteacher Bernice Arkor Nyako on the landscaped grounds of Nkurakan.';
          migrated = true;
        }
      }
    }

    if (migrated) {
      writeDb(parsed);
    }

    return parsed;
  } catch {
    const initial = createInitialDb();
    writeDb(initial);
    return initial;
  }
}

export function writeDb(db: SchoolDatabase): void {
  ensureDirs();
  const tmpFile = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
}

function readAuthStore(): AuthStore {
  ensureDirs();
  if (!fs.existsSync(AUTH_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8')) as AuthStore;
  } catch {
    return {};
  }
}

function writeAuthStore(store: AuthStore): void {
  ensureDirs();
  const tmpFile = `${AUTH_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(store, null, 2), 'utf8');
  fs.renameSync(tmpFile, AUTH_FILE);
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function constantTimeMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function getAuthStatus(): {
  claimed: boolean;
  envConfigured: boolean;
  teacherPasscodeConfigured: boolean;
} {
  const envAdmin = (process.env.HEADTEACHER_PASSCODE || '').trim();
  const envTeacher = (process.env.TEACHER_PASSCODE || '').trim();
  const store = readAuthStore();
  return {
    claimed: Boolean(envAdmin || store.adminHash),
    envConfigured: Boolean(envAdmin),
    teacherPasscodeConfigured: Boolean(envTeacher || store.teacherHash)
  };
}

export function claimInitialCredentials(
  adminPassword: string,
  teacherPasscode?: string
): { ok: boolean; error?: string } {
  const status = getAuthStatus();
  if (status.claimed) {
    return { ok: false, error: 'Portal credentials have already been configured.' };
  }
  if (!adminPassword || adminPassword.length < 6) {
    return { ok: false, error: 'Headteacher password must be at least 6 characters.' };
  }
  const adminSalt = crypto.randomBytes(16).toString('hex');
  const adminHash = hashPassword(adminPassword, adminSalt);

  const nextStore: AuthStore = {
    adminSalt,
    adminHash,
    claimedAt: new Date().toISOString()
  };

  if (teacherPasscode && teacherPasscode.trim().length >= 4) {
    const teacherSalt = crypto.randomBytes(16).toString('hex');
    nextStore.teacherSalt = teacherSalt;
    nextStore.teacherHash = hashPassword(teacherPasscode.trim(), teacherSalt);
  }

  writeAuthStore(nextStore);
  return { ok: true };
}

export function updateCredentials(
  newAdminPassword?: string,
  newTeacherPasscode?: string
): void {
  const store = readAuthStore();
  if (newAdminPassword && newAdminPassword.trim().length >= 6) {
    const adminSalt = crypto.randomBytes(16).toString('hex');
    store.adminSalt = adminSalt;
    store.adminHash = hashPassword(newAdminPassword.trim(), adminSalt);
  }
  if (newTeacherPasscode && newTeacherPasscode.trim().length >= 4) {
    const teacherSalt = crypto.randomBytes(16).toString('hex');
    store.teacherSalt = teacherSalt;
    store.teacherHash = hashPassword(newTeacherPasscode.trim(), teacherSalt);
  }
  writeAuthStore(store);
}

export function verifyLogin(role: UserRole, passcode: string): boolean {
  if (!passcode) return false;
  const envAdmin = (process.env.HEADTEACHER_PASSCODE || '').trim();
  const envTeacher = (process.env.TEACHER_PASSCODE || '').trim();
  const store = readAuthStore();

  if (role === 'admin') {
    if (envAdmin) {
      return constantTimeMatch(passcode, envAdmin);
    }
    if (store.adminHash && store.adminSalt) {
      const candidate = hashPassword(passcode, store.adminSalt);
      return constantTimeMatch(candidate, store.adminHash);
    }
    return false;
  }

  if (role === 'teacher') {
    if (envTeacher) {
      return constantTimeMatch(passcode, envTeacher);
    }
    if (store.teacherHash && store.teacherSalt) {
      const candidate = hashPassword(passcode, store.teacherSalt);
      return constantTimeMatch(candidate, store.teacherHash);
    }
    // Allow Headteacher password to also access Teacher tools if no separate teacher code was set
    if (envAdmin) {
      return constantTimeMatch(passcode, envAdmin);
    }
    if (store.adminHash && store.adminSalt) {
      const candidate = hashPassword(passcode, store.adminSalt);
      return constantTimeMatch(candidate, store.adminHash);
    }
  }
  return false;
}
