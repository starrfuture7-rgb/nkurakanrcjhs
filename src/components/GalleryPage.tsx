import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, X } from 'lucide-react';
import type { AuthSession, GalleryCategory, GalleryPhoto, SchoolDatabase } from '../shared/types';

interface GalleryPageProps {
  db: SchoolDatabase;
  session: AuthSession | null;
  onOpenPortal: () => void;
}

const CATEGORIES: ('All Photos' | GalleryCategory)[] = [
  'All Photos',
  'Campus & Assembly',
  'Classrooms & Learning',
  'Teachers & Leadership',
  'Awards & CivicFest',
  'Church & Community'
];

export const GalleryPage: React.FC<GalleryPageProps> = ({ db, session, onOpenPortal }) => {
  const [selectedCategory, setSelectedCategory] = useState<'All Photos' | GalleryCategory>('All Photos');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const visiblePhotos = db.gallery.filter(
    (g) => selectedCategory === 'All Photos' || g.category === selectedCategory
  );

  const activePhoto: GalleryPhoto | null =
    activeIndex !== null && visiblePhotos[activeIndex] ? visiblePhotos[activeIndex] : null;

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev === null ? null : (prev + 1) % visiblePhotos.length));
      }
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) =>
          prev === null ? null : (prev - 1 + visiblePhotos.length) % visiblePhotos.length
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, visiblePhotos.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E5DFD3] pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <p className="text-xs font-mono uppercase tracking-widest text-[#721C2E]">
            School Gallery · Authentic Campus Photography
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#0F2342]">
            Classrooms, Teachers, Awards &amp; Parish Life
          </h1>
          <p className="text-base text-[#4A5568] leading-relaxed">
            Browse verified photographs documenting daily learning, school assemblies, teacher
            mentorship, Ghana Education Service &amp; NCCE activities, and parish life at St.
            Stephen Catholic Church, Nkurakan.
          </p>
        </div>

        {session?.role === 'admin' && (
          <button
            type="button"
            onClick={onOpenPortal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#721C2E] text-white rounded-md hover:bg-[#581322] self-start cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Add Photos to Gallery</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setSelectedCategory(cat);
              setActiveIndex(null);
            }}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#721C2E] text-white border-[#721C2E]'
                : 'bg-white text-[#111C30] border-[#E5DFD3] hover:bg-[#F3EFE6]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visiblePhotos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group text-left bg-white border border-[#E5DFD3] rounded-xl overflow-hidden hover:border-[#721C2E]/50 transition-colors shadow-xs cursor-pointer"
          >
            <div className="aspect-4/3 bg-[#EBE6DF] overflow-hidden">
              <img
                src={photo.imageUrl}
                alt={photo.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-300"
              />
            </div>
            <div className="p-5 space-y-1.5">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#721C2E]">
                {photo.category} · {photo.dateNote}
              </p>
              <h2 className="font-serif text-xl font-semibold text-[#0F2342]">{photo.title}</h2>
              <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">{photo.caption}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-[#0F2342]/92 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              aria-label="Close photo viewer"
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative bg-[#0B172B] flex items-center justify-center max-h-[70vh]">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto object-contain"
              />

              {visiblePhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photograph"
                    onClick={() =>
                      setActiveIndex((activeIndex - 1 + visiblePhotos.length) % visiblePhotos.length)
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/55 text-white hover:bg-black/80 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photograph"
                    onClick={() => setActiveIndex((activeIndex + 1) % visiblePhotos.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/55 text-white hover:bg-black/80 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div className="p-5 sm:p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-[#721C2E]">
                  {activePhoto.category} · {activePhoto.dateNote}
                </p>
                <h3 className="font-serif text-2xl font-semibold text-[#0F2342]">
                  {activePhoto.title}
                </h3>
                <p className="text-sm text-[#4A5568] mt-1">{activePhoto.caption}</p>
              </div>
              <span className="text-xs font-mono text-slate-500 tabular-nums shrink-0">
                {activeIndex + 1} / {visiblePhotos.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
