import React, { useState, useEffect } from 'react';
import { Maximize2, Play, Image as ImageIcon, X, ChevronLeft, ChevronRight, Download, Share2, Check } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { useScrollReveal } from './useScrollReveal';

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Hackathon' | 'Workshop' | 'Project Expo' | 'Industrial Visit' | string;
  type: 'image' | 'video';
  url: string;
  caption: string;
}

export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'ARCH-01',
    title: 'National Autonomous Robotics Expo',
    category: 'Project Expo',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    caption: 'Autonomous LiDAR rover & obstacle-avoidance demonstration by 3rd year ECE engineering team.',
  },
  {
    id: 'ARCH-02',
    title: 'SMT Micro-Soldering & 4-Layer PCB Lab',
    category: 'Workshop',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    caption: 'Students practicing surface mount micro-soldering and impedance matching on 4-layer boards.',
  },
  {
    id: 'ARCH-03',
    title: '24-Hour National Hardware Hackathon',
    category: 'Hackathon',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    caption: 'Over 50 teams hacking hardware prototypes round the clock in the central innovation auditorium.',
  },
  {
    id: 'ARCH-04',
    title: 'Semiconductor Fabrication Cleanroom Visit',
    category: 'Industrial Visit',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    caption: 'Department students observing silicon wafer photolithography and cleanroom chemical etching.',
  },
  {
    id: 'ARCH-05',
    title: 'FPGA Verilog & RISC-V Synthesis Sprint',
    category: 'Workshop',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    caption: 'Designing custom 32-bit RISC-V processor cores synthesized onto Xilinx Artix-7 FPGA boards.',
  },
  {
    id: 'ARCH-06',
    title: 'IoT Drone Swarm & Telemetry Testing',
    category: 'Project Expo',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    caption: 'Outdoor field testing of multi-node LoRa mesh telemetry communication for quadcopters.',
  },
];

interface GallerySectionProps {
  galleryItems?: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  galleryItems,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const revealRef = useScrollReveal(0.06);

  const activeItems = Array.isArray(galleryItems) ? galleryItems : DEFAULT_GALLERY_ITEMS;

  const filteredItems = activeItems.filter(
    (item) => activeCategory === 'All' || item.category === activeCategory
  );

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        soundFx.playClick();
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : 0));
      }
      if (e.key === 'ArrowLeft') {
        soundFx.playClick();
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  const currentLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  const handleShareImage = (item: GalleryItem) => {
    soundFx.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(item.url);
      setCopiedToast(`Copied image link for "${item.title}"`);
      setTimeout(() => setCopiedToast(null), 2500);
    }
  };

  return (
    <section
      id="gallery"
      ref={revealRef}
      className="relative py-28 bg-transparent overflow-hidden"
    >
      {/* Laser Divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-purple/30 to-transparent" />

      {/* Copied Link Toast Notification */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-midnight-deep border border-lime text-white text-xs font-mono px-4 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(0,242,254,0.4)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Check className="w-4 h-4 text-cyber-emerald" />
          <span>{copiedToast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-6">
          <div className="space-y-3 reveal">
            <div className="section-eyebrow-hud">
              03 // VISUAL ARCHIVE &amp; LAB MEMORIES
            </div>
            <h2 className="font-space text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Hardware Labs &amp;
              <br className="hidden sm:block" />
              Hackathons in Action.
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 max-w-xs sm:text-right leading-relaxed reveal stagger-2">
            Documenting student prototyping breakthroughs, industrial semiconductor tours, and national hackathon championships.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 reveal">
          {['All', 'Hackathon', 'Workshop', 'Project Expo', 'Industrial Visit'].map((cat) => {
            const count = cat === 'All'
              ? activeItems.length
              : activeItems.filter((item) => item.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => { soundFx.playClick(); setActiveCategory(cat); setLightboxIndex(null); }}
                id={`gallery-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                className={`filter-pill flex items-center gap-1.5 ${activeCategory === cat ? 'active' : ''}`}
              >
                <span>{cat}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${activeCategory === cat ? 'bg-midnight text-white font-bold' : 'bg-white/10 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Gallery Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => { soundFx.playClick(); setLightboxIndex(idx); }}
              onMouseEnter={() => soundFx.playHover()}
              className="group cursor-pointer relative rounded-3xl overflow-hidden border border-white/10 hover:border-lime/50 transition-all duration-500 shadow-[0_15px_35px_rgba(0,0,0,0.7)] animate-in fade-in duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-midnight-deep">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#04060C] via-[#04060C]/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-400" />

                {/* Top Corner Floating Badges */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-midnight-deep/90 backdrop-blur-md border border-white/15 px-3 py-1 rounded-xl shadow-md">
                    {item.type === 'video' ? (
                      <Play className="w-3 h-3 fill-white text-white" />
                    ) : (
                      <ImageIcon className="w-3 h-3 text-lime" />
                    )}
                    <span className="text-[9px] font-mono font-bold text-white uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-midnight-deep/90 backdrop-blur-md border border-lime/40 p-2 rounded-xl text-lime shadow-[0_0_15px_rgba(0,242,254,0.3)]">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Bottom Caption Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono text-lime font-bold tracking-widest uppercase">
                      {item.id}
                    </span>
                  </div>
                  <h3 className="font-space font-extrabold text-base text-white leading-snug mb-1.5 group-hover:text-lime transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 font-sans opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.caption}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cinematic Fullscreen Lightbox Modal with Next/Prev Controls */}
      {currentLightboxItem && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020306]/95 backdrop-blur-2xl animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#070B16] border border-white/15 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              id="gallery-lightbox-close"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-midnight-deep/90 border border-white/20 text-slate-300 hover:text-white hover:border-lime flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Prev / Next Nav Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick();
                setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-2xl bg-midnight-deep/90 border border-white/20 text-white hover:border-lime flex items-center justify-center transition-all cursor-pointer shadow-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick();
                setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-2xl bg-midnight-deep/90 border border-white/20 text-white hover:border-lime flex items-center justify-center transition-all cursor-pointer shadow-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Main Image */}
            <div className="aspect-video w-full overflow-hidden bg-midnight-deep relative group">
              <img
                src={currentLightboxItem.url}
                alt={currentLightboxItem.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Metadata Footer with Action Buttons */}
            <div className="p-7 space-y-3 border-t border-white/10">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-lime font-extrabold uppercase tracking-widest flex items-center gap-2">
                  <span>{currentLightboxItem.category}</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-amber">{currentLightboxItem.type.toUpperCase()}</span>
                </span>
                <span className="text-slate-400 font-bold">
                  {lightboxIndex + 1} / {filteredItems.length} · DOC REF: {currentLightboxItem.id}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-space font-extrabold text-xl text-white">{currentLightboxItem.title}</h3>
                  <p className="text-sm text-slate-300 font-sans leading-relaxed">{currentLightboxItem.caption}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={currentLightboxItem.url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="p-2.5 rounded-xl bg-midnight-deep border border-white/15 text-slate-300 hover:text-white hover:border-lime transition-colors flex items-center gap-1.5 text-xs font-mono"
                    title="Open Full Resolution"
                  >
                    <Download className="w-4 h-4 text-lime" />
                    <span className="hidden sm:inline">Hi-Res</span>
                  </a>

                  <button
                    onClick={() => handleShareImage(currentLightboxItem)}
                    className="p-2.5 rounded-xl bg-midnight-deep border border-white/15 text-slate-300 hover:text-amber hover:border-amber-400/50 transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer"
                    title="Copy Image Link"
                  >
                    <Share2 className="w-4 h-4 text-amber" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
};
