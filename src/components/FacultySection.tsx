import React from 'react';
import { BookOpen, FlaskConical, ArrowUpRight, GraduationCap, Shield, Cpu } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { useScrollReveal } from './useScrollReveal';

export const FacultySection: React.FC = () => {
  const revealRef = useScrollReveal(0.08);

  const faculty = [
    {
      code: 'FAC-01',
      name: 'Dr. A. P. Rathkanthiwar',
      role: 'Professor & Head of Department',
      dept: 'Electronics & Communication Engineering',
      interests: ['VLSI Design', 'FPGA Architecture', 'Wireless Systems'],
      pubs: '28+ Yrs Experience · 48+ Publications',
      badge: 'HEAD OF DEPARTMENT',
      image: '/faculty_images/hod.webp',
      accent: 'from-[#FF4A15]/18',
    },
    {
      code: 'FAC-02',
      name: 'Dr. Sunita N Parihar',
      role: 'Associate Professor · SPACE Incharge',
      dept: 'Electronics & Communication Engineering',
      interests: ['Embedded Systems', 'IoT Smart Grids', 'TinyML'],
      pubs: '20+ Yrs Experience · 28+ Publications',
      badge: 'SPACE INCHARGE',
      image: '/faculty_images/parihar.webp',
      accent: 'from-[#FF4A15]/12',
    },
    {
      code: 'FAC-03',
      name: 'Ms. V. V. Shirpurkar',
      role: 'Assistant Professor · SINC Incharge',
      dept: 'Electronics & Communication Engineering',
      interests: ['Autonomous Robotics', 'ROS 2 Systems', 'LiDAR & Sensors'],
      pubs: '15+ Yrs Experience · 12+ Publications',
      badge: 'SINC INCHARGE',
      image: '/faculty_images/shirpurkar.webp',
      accent: 'from-[#FF4A15]/10',
    },
  ];

  return (
    <section id="faculty" ref={revealRef} className="relative py-16 lg:py-24 bg-[#08080A] text-[#F5F3EF] overflow-hidden border-t border-white/[0.06]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 editorial-grid opacity-[0.06]" />
        <div className="absolute -top-20 right-0 w-[720px] h-[420px] rounded-full blur-[90px] opacity-[0.07]" style={{ background: 'radial-gradient(ellipse at center, #FF4A15 0%, transparent 68%)' }} />
      </div>
      <div className="section-divider-subtle absolute top-0 left-0 right-0" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF4A15]/18 to-transparent" />

      {/* LEFT RAIL — vertical technical border text */}
      <div className="hidden lg:flex absolute left-0 top-0 bottom-0 w-[56px] border-r border-white/[0.06] bg-[rgba(10,10,12,0.45)] backdrop-blur-xl flex-col items-center py-8 z-20 pointer-events-none">
        <span className="text-[10px] font-mono tracking-[0.22em] text-white/30 [writing-mode:vertical-rl] rotate-180">
          ACADEMIC BOARD — CH 06
        </span>
        <span className="mt-auto text-[10px] font-mono tracking-[0.18em] text-[#FF4A15] font-bold [writing-mode:vertical-rl] rotate-180">
          INVESTIGATORS — FAC 006
        </span>
        <span className="mt-4 w-px h-16 bg-gradient-to-b from-[#FF4A15]/60 to-transparent" />
        <span className="mt-4 w-2 h-2 rounded-full bg-[#FF4A15] shadow-[0_0_10px_rgba(255,74,21,0.6)] animate-pulse" />
      </div>

      {/* RIGHT RAIL — vertical margin ruler on ultrawide */}
      <div className="hidden 2xl:flex absolute right-0 top-0 bottom-0 w-[48px] border-l border-white/[0.06] bg-[rgba(10,10,12,0.25)] flex-col items-center py-8 z-20 pointer-events-none">
        <span className="text-[9.5px] font-mono tracking-[0.20em] text-white/20 [writing-mode:vertical-rl] rotate-180">
          RESEARCH LAB DIRECTORS // PIET
        </span>
        <span className="mt-auto text-[9.5px] font-mono tracking-[0.16em] text-white/30 [writing-mode:vertical-rl] rotate-180">
          SCALE 1:1 // 2026
        </span>
      </div>

      <div className="relative lg:pl-[56px] 2xl:pr-[48px]">
        {/* faint blueprint watermark */}
        <div className="pointer-events-none absolute top-2 left-4 right-4 select-none hidden xl:block overflow-hidden opacity-[0.018]">
          <span className="font-[Syne] font-[800] tracking-[-0.06em] leading-none text-[120px] text-white whitespace-nowrap">
            FACULTY LEADERSHIP &amp; LAB DIRECTORS — ATELIER No.08
          </span>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
            <div className="reveal max-w-[620px]">
              <div className="section-eyebrow-hud">
                <Shield className="w-3.5 h-3.5 text-[#FF4A15]" /> 06 — ACADEMIC BOARD &amp; ADVISORS
                <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 pl-2.5 border-l border-[rgba(255,74,21,0.22)] text-white/40 tracking-[0.08em] normal-case">
                  ATELIER DOSSIERS · PIET ECE
                </span>
              </div>
              <h2 className="mt-4 font-[Syne] font-[800] tracking-[-0.05em] leading-[0.88] text-[34px] sm:text-[44px] lg:text-[52px] text-[#F5F3EF]">
                Faculty <span className="font-['Instrument_Serif'] italic font-[400] text-[#FF4A15]">leadership</span>
                <span className="block text-white/90"> &amp; research labs.</span>
              </h2>
              <div className="mt-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.12em] text-white/40">
                <span className="h-px w-8 bg-white/15" />
                <span>PRINCIPAL INVESTIGATORS &amp; LAB DIRECTORS · PIET AUTONOMOUS</span>
              </div>
            </div>
            <p className="reveal stagger-2 max-w-[380px] text-[13.5px] leading-relaxed font-mono text-white/55 border-l-2 border-[#FF4A15]/40 pl-4">
              Academic mentors directing research laboratories, patent filings and the atelier&apos;s scholarly rigour — each dossier is a lab in itself.
            </p>
          </div>

        {/* PREMIUM GLASS CARDS — 3-col grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {faculty.map((f, idx) => (
            <div
              key={f.code}
              className="reveal glass-card-premium rounded-[24px] overflow-hidden flex flex-col group bg-[rgba(14,14,16,0.72)] border border-white/[0.08] hover:border-[rgba(255,74,21,0.22)] hover:-translate-y-1.5 transition-all duration-500"
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              {/* top image header with gradient */}
              <div className="relative h-[232px] sm:h-[248px] overflow-hidden shrink-0">
                <OptimizedImage
                  src={f.image}
                  alt={f.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                  wrapperClassName="absolute inset-0 w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08080A] via-[#08080A]/40 to-transparent" />
                <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} to-transparent opacity-60 pointer-events-none`} />
                <div className="absolute inset-0 opacity-40 mix-blend-overlay" style={{ background: 'radial-gradient(520px circle at 50% 0%, rgba(255,74,21,0.16), transparent 62%)' }} />
                {/* header badges */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-start justify-between gap-2">
                  <span className="inline-flex text-[10px] font-mono tracking-[0.08em] px-2.5 py-1 rounded-full bg-[#FF4A15] text-white font-bold shadow-[0_4px_14px_rgba(255,74,21,0.4)]">
                    {f.badge}
                  </span>
                  <span className="text-[10px] font-mono tracking-[0.12em] text-white/75 bg-black/35 backdrop-blur-md border border-white/10 px-2 py-1 rounded-full">
                    {f.code}
                  </span>
                </div>
                {/* hover accent line */}
                <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF4A15]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* subtle Shield watermark for premium feel */}
                <Shield className="absolute bottom-3 right-3 w-8 h-8 text-white/10 group-hover:text-white/15 transition-colors" strokeWidth={1.2} />
              </div>

              {/* body */}
              <div className="flex-1 flex flex-col p-5 sm:p-6 gap-3.5">
                <div>
                  <h3 className="font-[Syne] font-[800] leading-none tracking-[-0.02em] text-[18px] sm:text-[19px] text-[#F5F3EF]">
                    {f.name}
                  </h3>
                  <div className="mt-1.5 text-[12px] font-mono font-semibold text-[#FF4A15] leading-snug">{f.role}</div>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-mono text-white/45">
                    <Cpu className="w-3 h-3 text-white/30 shrink-0" /> {f.dept}
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 text-[11px] font-mono text-white/60 bg-[rgba(255,74,21,0.06)] border border-[rgba(255,74,21,0.12)] rounded-full px-3 py-1.5 w-fit">
                  <BookOpen className="w-3.5 h-3.5 text-[#FF4A15] shrink-0" /> {f.pubs}
                </div>

                <div className="pt-3.5 mt-1 border-t border-white/[0.06]">
                  <div className="text-[10px] font-mono tracking-[0.12em] text-white/30 flex items-center gap-1.5 mb-2.5">
                    <FlaskConical className="w-3.5 h-3.5 text-[#FF4A15]/60" /> RESEARCH DOMAINS
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {f.interests.map((i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.07] text-white/70 group-hover:bg-white/[0.08] group-hover:border-white/[0.10] transition-colors"
                      >
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* bottom border footer */}
              <div className="px-5 sm:px-6 py-3.5 border-t border-white/[0.06] bg-white/[0.02] flex items-center justify-between group-hover:bg-white/[0.04] transition-colors">
                <span className="text-[10px] font-mono tracking-[0.12em] text-white/25 inline-flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-white/20" /> {f.code} — DOSSIER
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold tracking-[0.06em] text-white/40 group-hover:text-[#FF4A15] transition-colors">
                  VIEW <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* footnote */}
        <div
          className="reveal mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur px-4 py-3 flex flex-wrap items-center gap-3 text-[11px] font-mono text-white/40"
          style={{ transitionDelay: '260ms' }}
        >
          <span className="inline-flex items-center gap-2 text-[#FF4A15] font-bold tracking-[0.08em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A15]" /> LAB HOURS
          </span>
          <span>Mon–Sat · ECE Block · Research cells open for dossier review &amp; project mentorship.</span>
          <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/20" />
          <span className="text-white/25">Contact via department office.</span>
        </div>
      </div>
      </div>
    </section>
  );
};
