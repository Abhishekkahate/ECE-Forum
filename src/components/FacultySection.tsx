import React from 'react';
import { BookOpen, FlaskConical, ChevronRight } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { OptimizedImage } from './OptimizedImage';
import { useScrollReveal } from './useScrollReveal';

interface FacultyMember {
  code: string;
  name: string;
  designation: string;
  department: string;
  researchInterests: string[];
  publications: string;
  badge: string;
  image: string;
}

export const FacultySection: React.FC = () => {
  const revealRef = useScrollReveal(0.08);

  const faculty: FacultyMember[] = [
    {
      code: 'FAC-01',
      name: 'Dr. A. P. Rathkanthiwar',
      designation: 'Professor & Head of Department',
      department: 'Electronics & Communication Engineering',
      researchInterests: ['VLSI Microelectronics', 'FPGA Architecture', 'Wireless Comm'],
      publications: '28+ Years Exp · 48+ Publications',
      badge: 'HEAD OF DEPARTMENT',
      image: '/faculty_images/hod.webp',
    },
    {
      code: 'FAC-02',
      name: 'Dr. Sunita N Parihar',
      designation: 'Associate Professor & SPACE Incharge',
      department: 'Electronics & Communication Engineering',
      researchInterests: ['Embedded Systems', 'IoT Smart Grids', 'TinyML Sensors'],
      publications: '20+ Years Exp · 28+ Publications',
      badge: 'SPACE INCHARGE',
      image: '/faculty_images/parihar.webp',
    },
    {
      code: 'FAC-03',
      name: 'Ms. V. V. Shirpurkar',
      designation: 'Assistant Professor & SINC Incharge',
      department: 'Electronics & Communication Engineering',
      researchInterests: ['Autonomous Robotics', 'ROS 2', 'LiDAR Kinematics'],
      publications: '15+ Years Exp · 12+ Publications',
      badge: 'SINC INCHARGE',
      image: '/faculty_images/shirpurkar.webp',
    },
  ];

  const badgeColors: Record<string, string> = {
    'HEAD OF DEPARTMENT': 'text-amber border-amber-500/40 bg-amber-500/10 shadow-[0_0_15px_rgba(255,184,0,0.2)]',
    'SPACE INCHARGE':     'text-lime border-lime/40 bg-lime/10 shadow-[0_0_15px_rgba(0,242,254,0.2)]',
    'SINC INCHARGE':      'text-cyber-purple border-purple-500/40 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
  };

  return (
    <section
      id="faculty"
      ref={revealRef}
      className="relative py-28 bg-transparent overflow-hidden"
    >
      {/* Laser Gradient Dividers */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-purple/30 to-transparent" />

      {/* Ambient Lighting */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyber-purple/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 reveal">
            <div className="section-eyebrow-hud">
              07 // FACULTY ADVISORS
            </div>
            <h2 className="font-space text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Faculty Leadership
              <br className="hidden sm:block" />
              &amp; Laboratory Guidance.
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 max-w-xs sm:text-right leading-relaxed reveal stagger-2">
            Distinguished faculty directing laboratories, student research, and academic excellence.
          </p>
        </div>

        {/* Faculty Dossiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {faculty.map((f, idx) => (
            <div
              key={f.code}
              onMouseEnter={() => soundFx.playHover()}
              className={`reveal stagger-${idx + 1} glass-cyber-interactive p-8 rounded-3xl flex flex-col justify-between space-y-6 group shadow-[0_20px_50px_rgba(0,0,0,0.7)]`}
            >
              <div className="space-y-5">
                {/* Badge + Code */}
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-mono font-extrabold px-3 py-1 rounded-xl border tracking-widest ${badgeColors[f.badge] || 'text-slate-300 border-white/10 bg-midnight-deep'}`}>
                    {f.badge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">{f.code}</span>
                </div>

                {/* Avatar & Info */}
                <div className="flex items-center gap-4">
                  <div className="relative w-18 h-18 rounded-2xl overflow-hidden border-2 border-white/15 shrink-0 bg-midnight-deep shadow-md group-hover:border-lime/60 transition-colors">
                    <OptimizedImage
                      src={f.image}
                      alt={f.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      wrapperClassName="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight-deep/50 to-transparent" />
                  </div>
                  <div>
                    <h3 className="font-space font-extrabold text-base sm:text-lg text-white group-hover:text-lime transition-colors leading-snug">
                      {f.name}
                    </h3>
                    <p className="text-xs font-mono text-amber font-semibold mt-1">{f.designation}</p>
                    <p className="text-[11px] font-sans text-slate-400 mt-0.5">{f.department}</p>
                  </div>
                </div>

                {/* Publications & Experience */}
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300 border-t border-white/10 pt-4">
                  <BookOpen className="w-4 h-4 text-lime shrink-0" />
                  <span>{f.publications}</span>
                </div>

                {/* Research Interests Tags */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                    <FlaskConical className="w-3.5 h-3.5 text-amber" />
                    Specialized Research Domains
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {f.researchInterests.map((interest, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-midnight-deep border border-white/10 text-slate-300 group-hover:border-white/20 transition-colors"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="tracking-wider">PIET ECE DEPT</span>
                <span className="text-lime font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>VIEW DOSSIER</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
