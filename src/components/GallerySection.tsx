import React, { useState, useEffect } from 'react';
import { Maximize2, Play, Image as ImageIcon, X, ChevronLeft, ChevronRight, Download, Share2, Check, Sparkles, Archive, Layers, Hash, Eye } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { useScrollReveal } from './useScrollReveal';

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Hackathon' | 'Workshop' | 'Project Expo' | 'Industrial Visit' | string;
  type: 'image' | 'video';
  url: string;
  images?: string[];
  caption: string;
}

export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  { id: 'ARCH-01', title: 'National Autonomous Robotics Expo', category: 'Project Expo', type: 'image', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80', images: ['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80'], caption: 'Autonomous LiDAR rover & obstacle-avoidance demo by 3rd year ECE team.' },
  { id: 'ARCH-02', title: 'SMT Micro-Soldering & 4-Layer PCB Lab', category: 'Workshop', type: 'image', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', caption: 'Students practicing surface mount micro-soldering on 4-layer boards.' },
  { id: 'ARCH-03', title: '24-Hour National Hardware Hackathon', category: 'Hackathon', type: 'image', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80', caption: '50+ teams hacking hardware prototypes round the clock.' },
  { id: 'ARCH-04', title: 'Semiconductor Fabrication Cleanroom Visit', category: 'Industrial Visit', type: 'image', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80', caption: 'Students observing silicon wafer photolithography.' },
  { id: 'ARCH-05', title: 'FPGA Verilog & RISC-V Synthesis Sprint', category: 'Workshop', type: 'image', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', caption: 'Designing custom 32-bit RISC-V cores on Xilinx Artix-7.' },
  { id: 'ARCH-06', title: 'IoT Drone Swarm & Telemetry Testing', category: 'Project Expo', type: 'image', url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80', caption: 'Outdoor field testing of multi-node LoRa mesh telemetry.' },
];

export const GallerySection: React.FC<{ galleryItems?: GalleryItem[] }> = ({ galleryItems }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [subPhotoIndex, setSubPhotoIndex] = useState<number>(0);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const revealRef = useScrollReveal(0.06);

  const activeItems = Array.isArray(galleryItems) && galleryItems.length ? galleryItems : DEFAULT_GALLERY_ITEMS;
  const filteredItems = activeItems.filter((item) => activeCategory === 'All' || item.category === activeCategory);

  const current = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;
  const currentImages = current?.images && current.images.length ? current.images : (current?.url ? [current.url] : []);
  const activeDisplayPhoto = currentImages[subPhotoIndex] || current?.url || '';

  useEffect(() => {
    setSubPhotoIndex(0);
  }, [lightboxIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        soundFx.playClick();
        if (currentImages.length > 1 && subPhotoIndex < currentImages.length - 1) {
          setSubPhotoIndex((p) => p + 1);
        } else {
          setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : 0));
          setSubPhotoIndex(0);
        }
      }
      if (e.key === 'ArrowLeft') {
        soundFx.playClick();
        if (currentImages.length > 1 && subPhotoIndex > 0) {
          setSubPhotoIndex((p) => p - 1);
        } else {
          setLightboxIndex((prev) => (prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
          setSubPhotoIndex(0);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, subPhotoIndex, currentImages.length, filteredItems.length]);

  const handleShare = (item: GalleryItem) => {
    soundFx.playClick();
    navigator.clipboard?.writeText(activeDisplayPhoto || item.url);
    setCopiedToast(`Copied archive link — ${item.title}`);
    setTimeout(() => setCopiedToast(null), 2500);
  };

  const categories = ['All', 'Hackathon', 'Workshop', 'Project Expo', 'Industrial Visit'] as const;

  return (
    <section id="gallery" ref={revealRef} className="relative py-20 lg:py-28 bg-[#08080A] text-[#F5F3EF] overflow-hidden">
      {/* Atelier backdrop */}
      <div className="absolute inset-0 editorial-grid opacity-[0.06] pointer-events-none" />
      <div className="mesh-blob mesh-blob-signal w-[640px] h-[480px] top-10 -left-32 opacity-[0.22]" />
      <div className="mesh-blob mesh-blob-cyan w-[520px] h-[520px] bottom-10 -right-24 opacity-[0.12]" />
      <div className="section-divider absolute top-0 left-0 right-0 opacity-50" />

      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[rgba(16,16,18,0.96)] border border-white/[0.12] text-white text-xs font-mono px-4 py-3 rounded-2xl shadow-glass-xl backdrop-blur-3xl">
          <span className="w-7 h-7 rounded-full bg-[#FF4A15] text-white grid place-items-center shrink-0"><Check className="w-3.5 h-3.5" /></span>
          {copiedToast}
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — archive masthead */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="reveal">
            <div className="section-eyebrow-hud">
              <Archive className="w-3.5 h-3.5" /> 04 — VISUAL ARCHIVE
              <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 pl-2.5 border-l border-[rgba(255,74,21,0.22)] text-white/40 tracking-[0.08em] normal-case">BENTO CATALOG · REF ARC-04 · {activeItems.length} PLATES</span>
            </div>
            <h2 className="mt-4 font-[Syne] font-[800] tracking-[-0.045em] leading-[0.88] text-[32px] sm:text-[42px] lg:text-[48px] text-[#F5F3EF]">
              Labs & <span className="font-[Instrument_Serif] italic font-[400] text-[#FF4A15]">hackathons</span> in action.
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] px-3 py-1.5 text-white/60"><Layers className="w-3 h-3 text-[#FF4A15]" /> ARCHIVE BENTO</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF4A15]/10 border border-[#FF4A15]/20 px-3 py-1.5 text-[#FF4A15] font-bold"><Eye className="w-3 h-3" /> LIGHTBOX ENABLED</span>
            </div>
          </div>
          <p className="text-[13px] leading-relaxed font-mono text-white/45 max-w-[380px] reveal stagger-2 border-l-2 border-[#FF4A15]/30 pl-4">
            Prototyping breakthroughs, silicon cleanrooms, and national championships — filed as editorial plates with dossier metadata.
          </p>
        </div>

        {/* Category Filters — archive tabs */}
        <div className="reveal stagger-1 flex flex-wrap items-center justify-center sm:justify-between gap-3 mb-10">
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-full bg-[#0F0F11] border border-white/[0.06] justify-center">
            {categories.map((cat) => {
              const count = cat === 'All' ? activeItems.length : activeItems.filter((i) => i.category === cat).length;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => { soundFx.playClick(); setActiveCategory(cat); setLightboxIndex(null); }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono border transition-all duration-300 ${
                    isActive
                      ? 'bg-[#FF4A15] text-white border-[#FF4A15] font-bold shadow-[0_6px_18px_rgba(255,74,21,0.35)]'
                      : 'bg-transparent border-transparent text-white/50 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {cat}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${isActive ? 'bg-white text-[#FF4A15]' : 'bg-white/10 text-white/60'}`}>{count}</span>
                </button>
              );
            })}
          </div>
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-white/30">
            <Hash className="w-3.5 h-3.5" /> {filteredItems.length} PLATES · CLICK TO ENLARGE
          </div>
        </div>

        {/* Film Contact Sheet — horizontal runway, not bento */}
        {filteredItems.length === 0 ? (
          <div className="reveal py-16 text-center rounded-[28px] bg-[#0F0F11] border border-dashed border-white/[0.08]">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] grid place-items-center mx-auto"><Archive className="w-6 h-6 text-white/30" /></div>
            <div className="mt-4 font-[Syne] font-[700] tracking-tight text-white">No plates in this archive</div>
            <div className="text-xs font-mono text-white/40 mt-1">Switch category — archive holds {activeItems.length} plates.</div>
          </div>
        ) : (
          <div className="reveal -mx-4 sm:mx-0">
            {/* film sprocket top bar */}
            <div className="hidden sm:flex h-6 bg-[#0A0A0C] border-y border-white/[0.08] items-center justify-between px-3 gap-1">
              {Array.from({ length: 28 }).map((_, i) => (
                <span key={i} className="w-3 h-3 rounded-[2px] bg-[#1A1A1E] border border-white/[0.06] shadow-inner" />
              ))}
              <span className="ml-auto text-[9px] font-mono tracking-[0.14em] text-white/20 whitespace-nowrap hidden lg:inline">CONTACT SHEET — 35MM — ATELIER NO.08</span>
            </div>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-4 sm:px-0 py-4 bg-[#0A0A0C] sm:bg-transparent sm:py-0 border-y sm:border-0 border-white/[0.08] sm:border-transparent">
              {filteredItems.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => { soundFx.playClick(); setLightboxIndex(idx); }}
                  className="group snap-start shrink-0 w-[78vw] sm:w-[340px] lg:w-[380px] bg-[#0F0F11] border border-white/[0.08] rounded-[18px] overflow-hidden cursor-pointer hover:border-white/15 hover:-translate-y-0.5 transition-all duration-300"
                  style={{ transitionDelay: `${(idx % 4) * 60}ms` } as React.CSSProperties}
                >
                  {/* perforation header */}
                  <div className="h-6 bg-[#0A0A0C] border-b border-white/[0.06] flex items-center justify-between px-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.08em] text-white/50"><Hash className="w-3 h-3 text-[#FF4A15]" /> {item.id}</span>
                    <div className="flex items-center gap-1.5">
                      {item.images && item.images.length > 1 && (
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-[#FF4A15]/15 border border-[#FF4A15]/30 text-[#FF4A15] font-bold">
                          📷 {item.images.length} Photos
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/60"><span className={`w-4 h-4 rounded-full grid place-items-center ${item.type === 'video' ? 'bg-[#FF4A15] text-white' : 'bg-white/15 text-white'}`}>{item.type === 'video' ? <Play className="w-2.5 h-2.5 fill-white" /> : <ImageIcon className="w-2.5 h-2.5" />}</span> {item.category}</span>
                    </div>
                  </div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#050507]">
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08080A]/70 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur border border-white/15 px-2.5 py-1 text-[10px] font-mono text-white">{String(idx+1).padStart(2,'0')}/{String(filteredItems.length).padStart(2,'0')} · {item.type.toUpperCase()}</div>
                    <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#FF4A15] text-white hidden group-hover:grid place-items-center shadow-[0_0_14px_rgba(255,74,21,0.4)]"><Maximize2 className="w-3.5 h-3.5" /></span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-[Syne] font-[700] leading-tight tracking-[-0.02em] text-[15px] text-[#F5F3EF] line-clamp-2 group-hover:text-white transition-colors">{item.title}</h3>
                    <p className="text-xs leading-relaxed text-white/50 line-clamp-2 mt-1.5">{item.caption}</p>
                    <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-white/40"><span className="h-px flex-1 bg-white/10 group-hover:bg-[#FF4A15]/25 transition-colors" /><span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" /> {item.images && item.images.length > 1 ? `VIEW ALBUM (${item.images.length})` : 'VIEW'}</span></div>
                  </div>
                  {/* perforation footer */}
                  <div className="h-5 bg-[#0A0A0C] border-t border-white/[0.06] flex items-center justify-between px-2">
                    <span className="flex gap-1">{Array.from({ length: 6 }).map((_, i) => <span key={i} className="w-2 h-2 rounded-[1px] bg-white/10" />)}</span>
                    <span className="text-[9px] font-mono tracking-[0.12em] text-white/20">ATELIER 08 · 35MM</span>
                  </div>
                </div>
              ))}
              <div className="shrink-0 w-4 sm:hidden" aria-hidden />
            </div>
            <div className="hidden sm:flex h-6 bg-[#0A0A0C] border-y border-white/[0.08] items-center justify-between px-3 gap-1 -mt-0">
              {Array.from({ length: 28 }).map((_, i) => (
                <span key={i} className="w-3 h-3 rounded-[2px] bg-[#1A1A1E] border border-white/[0.06]" />
              ))}
              <span className="ml-auto text-[9px] font-mono tracking-[0.14em] text-white/20 hidden lg:inline whitespace-nowrap">— END CONTACT SHEET —</span>
            </div>
          </div>
        )}

        {/* archive footer meta */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-white/30 border-t border-white/[0.06] pt-4 reveal">
          <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#FF4A15] animate-pulse shadow-[0_0_8px_rgba(255,74,21,0.4)]" /> ARCHIVE INDEXED · {filteredItems.length} / {activeItems.length} PLATES VISIBLE</span>
          <span className="text-white/40">© PIET ECE · SPACE × SINC · ATELIER No. 8</span>
        </div>
      </div>

      {/* Lightbox — premium glass with signal accent */}
      {current && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#08080A]/85 backdrop-blur-[20px] animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full rounded-[28px] overflow-hidden bg-[rgba(16,16,18,0.98)] border border-white/[0.10] shadow-[0_24px_64px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl hud-corner"
            onClick={(e) => e.stopPropagation()}
          >
            {/* signal top line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF4A15]/60 to-transparent z-20 pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-[radial-gradient(circle_at_center,_rgba(255,74,21,0.12),_transparent_70%)] pointer-events-none blur-[1px]" />

            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#08080A]/70 backdrop-blur-xl border border-white/15 text-white grid place-items-center hover:bg-white hover:text-black hover:border-white transition-all duration-300"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                if (currentImages.length > 1 && subPhotoIndex > 0) {
                  setSubPhotoIndex((p) => p - 1);
                } else {
                  setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
                  setSubPhotoIndex(0);
                }
              }}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#08080A]/70 backdrop-blur-xl border border-white/15 text-white grid place-items-center hover:bg-[#FF4A15] hover:border-[#FF4A15] hover:text-white transition-all duration-300 shadow-lg"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                if (currentImages.length > 1 && subPhotoIndex < currentImages.length - 1) {
                  setSubPhotoIndex((p) => p + 1);
                } else {
                  setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
                  setSubPhotoIndex(0);
                }
              }}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#08080A]/70 backdrop-blur-xl border border-white/15 text-white grid place-items-center hover:bg-[#FF4A15] hover:border-[#FF4A15] hover:text-white transition-all duration-300 shadow-lg"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="relative aspect-[16/10] sm:aspect-video bg-[#050507] max-h-[55vh] flex items-center justify-center overflow-hidden">
              <img src={activeDisplayPhoto} alt={current.title} className="w-full h-full object-contain" />
              {/* subtle vignette */}
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]" />
              <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/15 px-3 py-1 text-[11px] font-mono text-white">
                <Sparkles className="w-3 h-3 text-[#FF4A15]" /> ARCHIVE PLATE · {current.id}
                {currentImages.length > 1 && (
                  <span className="text-[#00E5CC] font-bold ml-1">· Photo {subPhotoIndex + 1} of {currentImages.length}</span>
                )}
              </div>
              <div className="absolute bottom-3 right-3 hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#FF4A15] text-white px-3 py-1 text-[11px] font-mono font-bold shadow-[0_6px_16px_rgba(255,74,21,0.4)]">
                Event {lightboxIndex + 1} / {filteredItems.length}
              </div>
            </div>

            {/* Sub-photo filmstrip if event contains multiple photos */}
            {currentImages.length > 1 && (
              <div className="px-6 py-2.5 bg-black/80 border-y border-white/[0.08] flex items-center gap-2.5 overflow-x-auto hide-scrollbar">
                <span className="text-[10px] font-mono text-white/40 shrink-0 uppercase flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-[#00E5CC]" /> Album ({currentImages.length}):
                </span>
                {currentImages.map((imgUrl, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => {
                      soundFx.playClick();
                      setSubPhotoIndex(pIdx);
                    }}
                    className={`relative w-12 h-9 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      pIdx === subPhotoIndex
                        ? 'border-[#FF4A15] scale-105 shadow-[0_0_10px_rgba(255,74,21,0.5)]'
                        : 'border-white/10 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Photo ${pIdx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="p-6 sm:p-7 space-y-4 relative">
              <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF4A15]/14 border border-[#FF4A15]/20 px-3 py-1 text-[#FF4A15] font-bold">{current.category}</span>
                  <span className="text-white/30">·</span>
                  <span className="text-white/50">{current.type.toUpperCase()}</span>
                  {currentImages.length > 1 && (
                    <>
                      <span className="text-white/30">·</span>
                      <span className="text-[#00E5CC]">{currentImages.length} Photos in Event</span>
                    </>
                  )}
                </span>
                <span className="sm:hidden text-white/40 font-mono">{lightboxIndex + 1} / {filteredItems.length}</span>
                <span className="hidden sm:inline text-white/30">{current.id} · {String(lightboxIndex+1).padStart(2,'0')}</span>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                <div className="min-w-0">
                  <h3 className="font-[Syne] font-[800] tracking-[-0.02em] text-[20px] sm:text-[22px] leading-tight text-white">{current.title}</h3>
                  <p className="text-[13.5px] leading-relaxed text-white/60 mt-2 max-w-[520px]">{current.caption}</p>
                </div>
                <div className="flex gap-2 shrink-0 lg:pt-1">
                  <a
                    href={activeDisplayPhoto || current.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-signal !px-4 !py-2.5 !text-xs"
                  >
                    <Download className="w-3.5 h-3.5 relative z-10" /> <span className="relative z-10">High-Res</span>
                  </a>
                  <button
                    onClick={() => handleShare(current)}
                    className="btn-glass !px-4 !py-2.5 !text-xs"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
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
