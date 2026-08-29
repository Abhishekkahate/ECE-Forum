import React, { useState, useMemo, useDeferredValue, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, ExternalLink, Shield, Sparkles, Search, X, Check, Award, ArrowUpRight,
  Users, Layers, Hash, LayoutGrid, List, Zap, Cpu, BookOpen, ChevronRight, Activity
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { OptimizedImage } from './OptimizedImage';
import { useScrollReveal } from './useScrollReveal';

export interface TeamMember {
  name: string;
  role: string;
  category: 'Executive Council' | 'Technical Leads' | 'Design & Media' | 'Event Management' | string;
  council: 'SPACE' | 'SINC' | 'JOINT';
  year: string;
  image: string;
  linkedin: string;
  email: string;
  quote: string;
  specialty?: string;
}

export const TeamSection: React.FC = () => {
  const [councilTab, setCouncilTab] = useState<'SPACE' | 'SINC' | 'All'>('SPACE');
  const [subWingFilter, setSubWingFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'ledger'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const revealRef = useScrollReveal(0.04);

  const teamMembers: TeamMember[] = [
    // ── SPACE COUNCIL (22 Members) ──────────────────────────────────────────
    { name: 'Rohan Virutkar', role: 'President SPACE', category: 'Executive Council', council: 'SPACE', year: '4th Year ECE', image: '/team_images/rohit.webp', linkedin: 'https://linkedin.com', email: 'rohan.v@ece-elevate.org', quote: 'Driving innovation through hands-on silicon design, embedded systems, and teamwork.', specialty: 'Strategic Council Governance & VLSI Prototyping' },
    { name: 'Samyak Belsare', role: 'Vice President SPACE', category: 'Executive Council', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/samyak.webp', linkedin: 'https://linkedin.com', email: 'samyak.b@ece-elevate.org', quote: 'Empowering students to publish research papers and dominate hackathons.', specialty: 'Research Publications & IEEE Chapters' },
    { name: 'Atharva Kalbande', role: 'Vice President SPACE', category: 'Executive Council', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/atharva.webp', linkedin: 'https://linkedin.com', email: 'atharva.k@ece-elevate.org', quote: 'Building inclusive technical wings for robotics and edge intelligence.', specialty: 'Technical Wing Operations' },
    { name: 'Saloni Gajghate', role: 'Secretary SPACE', category: 'Executive Council', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/saloni.webp', linkedin: 'https://linkedin.com', email: 'saloni.g@ece-elevate.org', quote: 'Creating futuristic UI visuals, documentation, and brand identities.', specialty: 'Brand Identity & Admin' },
    { name: 'Vinay Masurkar', role: 'Joint Secretary SPACE', category: 'Executive Council', council: 'SPACE', year: '2nd Year ECE', image: '/team_images/vinay.webp', linkedin: 'https://linkedin.com', email: 'vinay.m@ece-elevate.org', quote: 'Orchestrating smooth logistics and hospitality for 1000+ attendee hackathons.', specialty: 'Event Operations & External Relations' },
    { name: 'Priyanshi Nikule', role: 'Treasurer SPACE', category: 'Executive Council', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/priyanshi.webp', linkedin: 'https://linkedin.com', email: 'priyanshi.n@ece-elevate.org', quote: 'Building embedded IoT solutions and fiscal transparency.', specialty: 'Financial Budgeting' },
    { name: 'Arju Pardhi', role: 'Joint Treasurer SPACE', category: 'Event Management', council: 'SPACE', year: '2nd Year ECE', image: '/team_images/arju.webp', linkedin: 'https://linkedin.com', email: 'arju.p@ece-elevate.org', quote: 'Managing venue operations and guest speaker coordination.', specialty: 'Logistics & Guest Coordination' },
    { name: 'Pranjali Chopde', role: 'Cultural Incharge SPACE', category: 'Event Management', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/pranjali.webp', linkedin: 'https://linkedin.com', email: 'pranjali.c@ece-elevate.org', quote: 'Organizing engaging cultural events and welcoming freshers.', specialty: 'Freshers Gala' },
    { name: 'Sadiksha Saonerkar', role: 'Cultural Incharge SPACE', category: 'Event Management', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/sadiksha.webp', linkedin: 'https://linkedin.com', email: 'sadiksha.s@ece-elevate.org', quote: 'Securing industry partnerships, campus networking, and sponsorships.', specialty: 'Industry Sponsorships' },
    { name: 'Aditi Sharma', role: 'Cultural Incharge SPACE', category: 'Event Management', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/aditi.webp', linkedin: 'https://linkedin.com', email: 'aditi.s@ece-elevate.org', quote: 'Creating vibrant campus engagements and collaborative forums.', specialty: 'Event Staging & Engagement' },
    { name: 'Vibhanshu Tiwari', role: 'Cultural Co-Incharge SPACE', category: 'Event Management', council: 'SPACE', year: '2nd Year ECE', image: '/team_images/vibhanshu.webp', linkedin: 'https://linkedin.com', email: 'vibhanshu.t@ece-elevate.org', quote: 'Managing student outreach, stage presentations, and showcases.', specialty: 'Stage Operations' },
    { name: 'Amruta Wankhede', role: 'Sports Incharge SPACE', category: 'Event Management', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/amruta.webp', linkedin: 'https://linkedin.com', email: 'amruta.w@ece-elevate.org', quote: 'Promoting athletic excellence and departmental tournaments.', specialty: 'Athletics & Tournaments' },
    { name: 'Mohit Kumar', role: 'Sports Incharge SPACE', category: 'Event Management', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/mohit.webp', linkedin: 'https://linkedin.com', email: 'mohit.k@ece-elevate.org', quote: 'Organizing inter-branch leagues, cricket championships, and team building.', specialty: 'Sports League Operations' },
    { name: 'Yash Baghele', role: 'Sports Co-Incharge SPACE', category: 'Event Management', council: 'SPACE', year: '2nd Year ECE', image: '/team_images/yash.webp', linkedin: 'https://linkedin.com', email: 'yash.b@ece-elevate.org', quote: 'Leading sports coordination and wellness initiatives.', specialty: 'Tournament Coordination' },
    { name: 'Aditya Bobade', role: 'Media Incharge SPACE', category: 'Design & Media', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/aditya.webp', linkedin: 'https://linkedin.com', email: 'aditya.b@ece-elevate.org', quote: 'Directing cinematic photography, videography, and event recaps.', specialty: 'Cinematography' },
    { name: 'Mahesh Hedau', role: 'Media Incharge SPACE', category: 'Design & Media', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/mahesh.webp', linkedin: 'https://linkedin.com', email: 'mahesh.h@ece-elevate.org', quote: 'Producing digital multimedia and high-impact promotions.', specialty: 'Digital Media Production' },
    { name: 'Avishkar Nimbekar', role: 'Media Co-Incharge SPACE', category: 'Design & Media', council: 'SPACE', year: '2nd Year ECE', image: '/team_images/avishkar.webp', linkedin: 'https://linkedin.com', email: 'avishkar.n@ece-elevate.org', quote: 'Creating motion graphics, highlight reels, and teasers.', specialty: 'Motion Graphics & Video Editing' },
    { name: 'Tejas Shahare', role: 'Social Incharge SPACE', category: 'Design & Media', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/tejas.webp', linkedin: 'https://linkedin.com', email: 'tejas.s@ece-elevate.org', quote: 'Growing social media engagement and community.', specialty: 'Social Strategy' },
    { name: 'Niharika Kamble', role: 'Social Co-Incharge SPACE', category: 'Design & Media', council: 'SPACE', year: '2nd Year ECE', image: '/team_images/niharika.webp', linkedin: 'https://linkedin.com', email: 'niharika.k@ece-elevate.org', quote: 'Connecting with alumni networks and sharing breakthroughs.', specialty: 'Alumni Relations' },
    { name: 'Mrunal Bankar', role: 'Magazine Incharge SPACE', category: 'Design & Media', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/mrunal.webp', linkedin: 'https://linkedin.com', email: 'mrunal.b@ece-elevate.org', quote: 'Publishing the annual technical magazine "ELEKTRONIKOS".', specialty: 'Print Editorial' },
    { name: 'Pallavi Chattes', role: 'Magazine Incharge SPACE', category: 'Design & Media', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/pallavi.webp', linkedin: 'https://linkedin.com', email: 'pallavi.c@ece-elevate.org', quote: 'Curating student research papers, technical articles, and faculty interviews.', specialty: 'Research Paper Curation' },
    { name: 'Tanhvi Shanware', role: 'Magazine Co-Incharge SPACE', category: 'Design & Media', council: 'SPACE', year: '2nd Year ECE', image: '/team_images/tanvi.webp', linkedin: 'https://linkedin.com', email: 'tanvi.s@ece-elevate.org', quote: 'Editorial lead for departmental publications and news digests.', specialty: 'Editorial Review' },

    // ── SINC COUNCIL (8 Members) ──────────────────────────────────────────
    { name: 'Makarand Bahmane', role: 'President SINC', category: 'Executive Council', council: 'SINC', year: '4th Year ECE', image: '/team_images/makrand.webp', linkedin: 'https://linkedin.com', email: 'makarand.b@ece-elevate.org', quote: 'Bridging classroom theory with industry-grade prototyping and robotics innovation.', specialty: 'Autonomous Systems & Hardware Prototyping' },
    { name: 'Siddhesh Bhandare', role: 'Vice President SINC', category: 'Executive Council', council: 'SINC', year: '3rd Year ECE', image: '/team_images/siddhesh.webp', linkedin: 'https://linkedin.com', email: 'siddhesh.b@ece-elevate.org', quote: 'Architecting ROS 2 autonomous rovers, LiDAR sensors, and FPGA cores.', specialty: 'ROS 2 Robotics & Firmware' },
    { name: 'Varun Gaikwad', role: 'Joint Secretary SINC', category: 'Executive Council', council: 'SINC', year: '2nd Year ECE', image: '/team_images/varun.webp', linkedin: 'https://linkedin.com', email: 'varun.g@ece-elevate.org', quote: 'Managing technical communications, member onboarding, and community engagement.', specialty: 'Community Growth & Hackathon Mgmt' },
    { name: 'Anushka Madankar', role: 'Treasurer SINC', category: 'Design & Media', council: 'SINC', year: '3rd Year ECE', image: '/team_images/anushka.webp', linkedin: 'https://linkedin.com', email: 'anushka.m@ece-elevate.org', quote: 'Designing slick UI themes, event marketing banners, and visual media.', specialty: 'Graphic Design & Visual Identity' },
    { name: 'Vedanti Ramteke', role: 'Joint Treasurer SINC', category: 'Design & Media', council: 'SINC', year: '2nd Year ECE', image: '/team_images/vedanti.webp', linkedin: 'https://linkedin.com', email: 'vedanti.r@ece-elevate.org', quote: 'Connecting forum community across digital channels.', specialty: 'Social Media' },
    { name: 'Himanshu Hirankhede', role: 'Technical Incharge SINC', category: 'Technical Leads', council: 'SINC', year: '3rd Year ECE', image: '/team_images/himanshu.webp', linkedin: 'https://linkedin.com', email: 'himanshu.h@ece-elevate.org', quote: 'Leading autonomous drone flight controllers and rover projects.', specialty: 'UAV Flight Controllers' },
    { name: 'Abhishek Kahate', role: 'Technical Co-Incharge SINC', category: 'Technical Leads', council: 'SINC', year: '2nd Year ECE', image: '/team_images/Abhi.webp', linkedin: 'https://linkedin.com', email: 'abhishek.k@ece-elevate.org', quote: 'Developing high-performance web platforms and digital forum experiences.', specialty: 'Full-Stack Web Architecture' },
    { name: 'Shreya Rathi', role: 'Technical Co-Incharge SINC', category: 'Technical Leads', council: 'SINC', year: '2nd Year ECE', image: '/team_images/shreya.webp', linkedin: 'https://linkedin.com', email: 'shreya.r@ece-elevate.org', quote: 'Facilitating hands-on microcontroller and VLSI bootcamps.', specialty: 'MCU Bootcamps' },
  ];

  // Lock body scroll and pause Lenis smoothly when modal is active
  useEffect(() => {
    if (selectedMember) {
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.stop();
      }
      document.body.style.overflow = 'hidden';
      if (modalScrollRef.current) {
        modalScrollRef.current.scrollTop = 0;
      }
      const onEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setSelectedMember(null);
      };
      window.addEventListener('keydown', onEsc);
      return () => {
        if (typeof window !== 'undefined' && (window as any).__lenis) {
          (window as any).__lenis.start();
        }
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onEsc);
      };
    } else {
      if (typeof window !== 'undefined' && (window as any).__lenis) {
        (window as any).__lenis.start();
      }
      document.body.style.overflow = '';
    }
  }, [selectedMember]);

  // Sub-wings for each council
  const subWings = useMemo(() => {
    if (councilTab === 'SPACE') {
      return ['All Wings', 'Executive Council', 'Design & Media', 'Event Management'];
    }
    if (councilTab === 'SINC') {
      return ['All Wings', 'Executive Council', 'Technical Leads', 'Design & Media'];
    }
    return ['All Wings', 'Executive Council', 'Technical Leads', 'Design & Media', 'Event Management'];
  }, [councilTab]);

  // Filtered member list
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      const matchesCouncil = councilTab === 'All' || m.council === councilTab;
      const matchesSubWing = subWingFilter === 'All' || subWingFilter === 'All Wings' || m.category === subWingFilter;
      const q = deferredQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.specialty?.toLowerCase().includes(q);
      return matchesCouncil && matchesSubWing && matchesSearch;
    });
  }, [councilTab, subWingFilter, deferredQuery]);

  const spaceCount = teamMembers.filter((m) => m.council === 'SPACE').length;
  const sincCount = teamMembers.filter((m) => m.council === 'SINC').length;

  const handleCopy = (email: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFx.playClick();
    navigator.clipboard?.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  return (
    <section id="team" ref={revealRef} className="relative py-20 lg:py-28 bg-[#08080A] text-[#F5F3EF] overflow-hidden border-t border-white/[0.06]">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 editorial-grid opacity-[0.04] pointer-events-none" />
      <div className="mesh-blob mesh-blob-signal w-[600px] h-[600px] top-[10%] -left-[100px] opacity-[0.12] pointer-events-none" />
      <div className="mesh-blob mesh-blob-cyan w-[500px] h-[500px] bottom-[5%] -right-[80px] opacity-[0.10] pointer-events-none" />
      <div className="section-divider absolute top-0 left-0 right-0 opacity-40" />

      {copiedEmail && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[rgba(16,16,18,0.96)] border border-white/[0.12] text-white text-xs font-mono px-4 py-3 rounded-2xl shadow-glass-xl backdrop-blur-3xl">
          <span className="w-7 h-7 rounded-full bg-[#FF4A15] text-white grid place-items-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </span>
          Copied email — {copiedEmail}
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div className="reveal max-w-[640px]">
            <div className="section-eyebrow-hud">
              <Shield className="w-3.5 h-3.5 text-[#FF4A15]" /> 06 — COMMAND COUNCIL
              <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 pl-2.5 border-l border-[rgba(255,74,21,0.22)] text-white/40 tracking-[0.08em] normal-case">
                30 DOSSIERS · VERIFIED ROSTER 2026–27
              </span>
            </div>
            <h2 className="mt-4 font-[Syne] font-[800] tracking-[-0.05em] leading-[0.88] text-[34px] sm:text-[44px] lg:text-[52px] text-[#F5F3EF]">
              Student <span className="font-['Instrument_Serif'] italic font-[400] text-[#FF4A15]">leadership.</span>
            </h2>
            <div className="mt-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.12em] text-white/40">
              <span className="h-px w-8 bg-white/15" />
              <span>OFFICIAL APPOINTED COUNCIL // DEPT OF ECE // PIET</span>
            </div>
          </div>
          <p className="reveal stagger-2 max-w-[400px] text-[13.5px] leading-relaxed font-mono text-white/55 border-l-2 border-[#FF4A15]/40 pl-4">
            30 student leaders across executive, technical, design &amp; event wings — clearly separated into SPACE (Academic) and SINC (Hardware) councils.
          </p>
        </div>

        {/* Primary Council Navigation Bar */}
        <div className="reveal mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 rounded-[22px] bg-[#0F0F11] border border-white/[0.08] backdrop-blur-2xl">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                soundFx.playClick();
                setCouncilTab('SPACE');
                setSubWingFilter('All Wings');
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                councilTab === 'SPACE'
                  ? 'bg-[#F5F3EF] text-[#08080A] shadow-[0_4px_16px_rgba(245,243,239,0.2)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>SPACE Council</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${councilTab === 'SPACE' ? 'bg-[#08080A] text-white' : 'bg-white/10 text-white/70'}`}>
                {spaceCount}
              </span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setCouncilTab('SINC');
                setSubWingFilter('All Wings');
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                councilTab === 'SINC'
                  ? 'bg-[#FF4A15] text-white shadow-[0_4px_20px_rgba(255,74,21,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>SINC Council</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${councilTab === 'SINC' ? 'bg-white text-[#FF4A15]' : 'bg-white/10 text-white/70'}`}>
                {sincCount}
              </span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setCouncilTab('All');
                setSubWingFilter('All Wings');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                councilTab === 'All'
                  ? 'bg-white/20 text-white font-bold'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All 30 Leaders</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 shrink-0 p-1 rounded-full bg-black/40 border border-white/[0.06] self-end sm:self-auto">
            <button
              onClick={() => { soundFx.playClick(); setViewMode('grid'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                viewMode === 'grid' ? 'bg-[#FF4A15] text-white font-bold shadow' : 'text-white/40 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </button>
            <button
              onClick={() => { soundFx.playClick(); setViewMode('ledger'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                viewMode === 'ledger' ? 'bg-[#FF4A15] text-white font-bold shadow' : 'text-white/40 hover:text-white'
              }`}
              title="Ledger View"
            >
              <List className="w-3.5 h-3.5" /> Ledger
            </button>
          </div>
        </div>

        {/* Council Spotlight Info Header */}
        <div className="reveal mb-8 p-5 sm:p-6 rounded-[24px] bg-[#0F0F11]/80 border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl grid place-items-center shrink-0 border ${
              councilTab === 'SPACE'
                ? 'bg-[#F5F3EF] text-black border-white shadow-md'
                : councilTab === 'SINC'
                ? 'bg-[#FF4A15] text-white border-[#FF4A15] shadow-[0_0_20px_rgba(255,74,21,0.3)]'
                : 'bg-white/10 text-white border-white/20'
            }`}>
              {councilTab === 'SPACE' ? <BookOpen className="w-7 h-7" /> : councilTab === 'SINC' ? <Cpu className="w-7 h-7" /> : <Users className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-[Syne] font-[800] text-[20px] text-white">
                  {councilTab === 'SPACE' ? 'SPACE Council — Research & Academics' : councilTab === 'SINC' ? 'SINC Council — Hardware & Innovation' : 'Joint ECE Student Leadership Council'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                  {councilTab === 'SPACE' ? 'ESTD 2012' : councilTab === 'SINC' ? 'ESTD 2018' : '30 LEADERS'}
                </span>
              </div>
              <p className="text-xs font-mono text-white/50 mt-1">
                {councilTab === 'SPACE'
                  ? 'Faculty Incharge: Dr. Sunita N. Parihar · Council President: Rohan Virutkar'
                  : councilTab === 'SINC'
                  ? 'Faculty Incharge: Ms. V. V. Shirpurkar · Council President: Makarand Bahmane'
                  : 'Operating under Dept of Electronics & Communication Engineering, PIET.'}
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leader, role, skill…"
              className="w-full pl-10 pr-4 py-2.5 rounded-full glass-input text-xs font-mono text-white placeholder:text-white/30 focus:outline-none"
            />
          </div>
        </div>

        {/* Sub-Wing Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full bg-[#0F0F11] border border-white/[0.06] w-fit mb-8 reveal">
          {subWings.map((w) => {
            const active = subWingFilter === w || (w === 'All Wings' && subWingFilter === 'All');
            return (
              <button
                key={w}
                onClick={() => {
                  soundFx.playClick();
                  setSubWingFilter(w);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                  active
                    ? 'bg-[#FF4A15] text-white font-bold shadow-md'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {w}
              </button>
            );
          })}
        </div>

        {/* Members Grid / Ledger */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-16 text-xs font-mono text-white/40 rounded-[24px] bg-[#0F0F11] border border-dashed border-white/10 reveal">
            <Users className="w-8 h-8 mx-auto mb-3 text-white/20" />
            No leaders match “{searchQuery}” in this wing. Try selecting another wing or council.
          </div>
        ) : viewMode === 'ledger' ? (
          /* LEDGER VIEW */
          <div className="border border-white/[0.08] rounded-[24px] overflow-hidden bg-[#0F0F11]/90 backdrop-blur-2xl divide-y divide-white/[0.06] reveal">
            <div className="hidden sm:flex items-center gap-4 px-6 py-3 bg-white/[0.03] text-[10px] font-mono tracking-[0.12em] text-white/40">
              <span className="w-[64px]">PHOTO</span>
              <span className="flex-1">LEADER &amp; ROLE</span>
              <span className="hidden lg:inline w-[260px]">SPECIALTY FOCUS</span>
              <span className="hidden sm:inline w-[160px] text-right">CONTACT</span>
            </div>
            {filteredMembers.map((member, idx) => {
              const isSpace = member.council === 'SPACE';
              return (
                <div
                  key={member.name}
                  onClick={() => { soundFx.playLaser(); setSelectedMember(member); }}
                  className="group relative flex flex-col sm:flex-row sm:items-center gap-4 px-5 sm:px-6 py-4 hover:bg-white/[0.03] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-[60px] h-[60px] rounded-[16px] overflow-hidden bg-white/[0.06] border border-white/[0.08] shrink-0 group-hover:border-[#FF4A15]/40 transition-colors">
                      <OptimizedImage src={member.image} alt={member.name} className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
                      <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-white/20 ${isSpace ? 'bg-[#F5F3EF]' : 'bg-[#FF4A15] shadow-[0_0_8px_rgba(255,74,21,0.6)]'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-[Syne] font-[800] text-[15px] text-white truncate">{member.name}</h3>
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${isSpace ? 'bg-[#F5F3EF] text-black border-white' : 'bg-[#FF4A15] text-white border-[#FF4A15]'}`}>
                          {member.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-white/50">
                        <span>{member.council}</span>
                        <span>·</span>
                        <span>{member.year}</span>
                        <span className="hidden sm:inline">·</span>
                        <span className="hidden sm:inline text-white/30">{member.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block w-[260px] text-xs font-mono text-white/50 line-clamp-2">{member.specialty}</div>
                  <div className="flex sm:w-[160px] items-center justify-between sm:justify-end gap-2 shrink-0">
                    <button
                      onClick={(e) => handleCopy(member.email, e)}
                      className="w-8 h-8 rounded-full bg-[#FF4A15] text-white grid place-items-center hover:bg-[#FF4A15]/80 transition-colors shadow-md"
                      title="Copy email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-white/40 group-hover:text-[#FF4A15] transition-colors">
                      DOSSIER <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* BENTO GRID VIEW */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5 reveal">
            {filteredMembers.map((member) => {
              const isSpace = member.council === 'SPACE';
              return (
                <div
                  key={member.name}
                  onClick={() => { soundFx.playLaser(); setSelectedMember(member); }}
                  className="group relative bg-[#0F0F11] border border-white/[0.08] rounded-[24px] p-5 flex flex-col items-center text-center gap-3 cursor-pointer hover:border-[#FF4A15]/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-lg"
                >
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-[#FF4A15]/40 transition-colors" />

                  {/* Council dot */}
                  <span
                    className={`absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full border border-white/20 ${
                      isSpace ? 'bg-[#F5F3EF] shadow-[0_0_10px_rgba(245,243,239,0.35)]' : 'bg-[#FF4A15] shadow-[0_0_10px_rgba(255,74,21,0.6)]'
                    }`}
                    title={member.council}
                  />

                  {/* Avatar */}
                  <div className="relative w-[84px] h-[84px] rounded-[20px] overflow-hidden bg-white/[0.06] border border-white/10 group-hover:border-[#FF4A15]/30 transition-colors shadow-inner shrink-0">
                    <OptimizedImage src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500" wrapperClassName="w-full h-full" />
                  </div>

                  {/* Role Stamp */}
                  <span className={`inline-flex items-center justify-center text-center text-[10px] font-mono font-bold tracking-[0.04em] px-3 py-1 rounded-full border max-w-full truncate ${
                    isSpace ? 'bg-[#F5F3EF] text-black border-white' : 'bg-[#FF4A15] text-white border-[#FF4A15] shadow-md'
                  }`}>
                    {member.role}
                  </span>

                  {/* Name */}
                  <h3 className="font-[Syne] font-[800] text-[14.5px] leading-tight text-white line-clamp-1 w-full">
                    {member.name}
                  </h3>

                  <p className="text-[10.5px] font-mono text-white/40 -mt-1">{member.year}</p>

                  <p className="text-[11px] font-mono leading-snug text-white/50 line-clamp-2 min-h-[32px] w-full">
                    {member.specialty}
                  </p>

                  <div className="w-full pt-3 mt-1 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-white/50 group-hover:text-[#FF4A15] transition-colors">
                      DOSSIER <ArrowUpRight className="w-3 h-3" />
                    </span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.08] grid place-items-center text-white/60 hover:bg-white hover:text-black transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={(e) => handleCopy(member.email, e)}
                        className="w-7 h-7 rounded-full bg-[#FF4A15] text-white grid place-items-center hover:bg-[#FF4A15]/80 transition-colors shadow-md"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Portal-Mounted Dossier Modal — Rendered directly to <body> so it is ALWAYS fixed in center of viewport */}
      {selectedMember && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#08080A]/85 backdrop-blur-[24px] animate-in fade-in duration-200"
          onClick={() => setSelectedMember(null)}
        >
          <div
            ref={modalScrollRef}
            className="relative w-full max-w-[560px] rounded-[28px] overflow-hidden bg-[#0F0F11] border border-white/[0.12] shadow-[0_24px_64px_rgba(0,0,0,0.7)] max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF4A15]/60 to-transparent" />

            <button
              onClick={() => { soundFx.playClick(); setSelectedMember(null); }}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.1] text-white grid place-items-center hover:bg-white hover:text-black transition-colors z-20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="relative p-6 sm:p-7 border-b border-white/[0.08] bg-[rgba(255,74,21,0.04)]">
              <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.14em] font-bold text-[#FF4A15]">
                <Sparkles className="w-3.5 h-3.5" /> LEADERSHIP DOSSIER · 2026–27
              </div>
              <div className="mt-4 flex gap-4 items-center">
                <div className="w-20 h-20 sm:w-[84px] sm:h-[84px] rounded-[20px] overflow-hidden bg-white/[0.06] border border-white/[0.12] shrink-0">
                  <img src={selectedMember.image} alt={selectedMember.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <span className={`inline-flex text-[10px] font-mono font-bold tracking-[0.06em] px-3 py-1 rounded-full border ${
                    selectedMember.council === 'SPACE' ? 'bg-[#F5F3EF] text-black border-white' : 'bg-[#FF4A15] text-white border-[#FF4A15]'
                  }`}>
                    {selectedMember.role}
                  </span>
                  <h3 className="mt-2 font-[Syne] font-[800] tracking-[-0.02em] text-[22px] sm:text-[24px] text-white leading-tight">
                    {selectedMember.name}
                  </h3>
                  <div className="text-[11px] font-mono text-white/50 mt-1 flex items-center gap-2">
                    <span>{selectedMember.year}</span>
                    <span>·</span>
                    <span className="text-[#FF4A15] font-bold">{selectedMember.council} COUNCIL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-7 space-y-4">
              {selectedMember.specialty && (
                <div className="rounded-2xl bg-[rgba(255,74,21,0.06)] border border-[rgba(255,74,21,0.12)] p-4">
                  <div className="text-[10px] font-mono tracking-[0.14em] font-bold text-[#FF4A15] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> FOCUS &amp; SPECIALTY
                  </div>
                  <div className="font-[Syne] font-bold text-white mt-1 text-[15px] leading-snug">
                    {selectedMember.specialty}
                  </div>
                  <div className="text-[11px] font-mono text-white/40 mt-1">
                    {selectedMember.category} · {selectedMember.council} Council
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-[#08080A] border border-white/[0.08] p-4">
                <div className="text-[10px] font-mono tracking-[0.12em] font-bold text-white/40">LEADER STATEMENT</div>
                <p className="text-[13px] leading-relaxed italic text-white/75 mt-1.5">“{selectedMember.quote}”</p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-mono tracking-[0.12em] font-bold text-white/40">CONTACT EMAIL</div>
                  <div className="text-[12px] font-mono font-medium text-white truncate mt-0.5">{selectedMember.email}</div>
                </div>
                <button
                  onClick={() => handleCopy(selectedMember.email)}
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black font-mono font-bold text-[11px] hover:bg-white/90 cursor-pointer"
                >
                  {copiedEmail === selectedMember.email ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Mail className="w-3.5 h-3.5" />}
                  {copiedEmail === selectedMember.email ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleCopy(selectedMember.email)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#FF4A15] text-white font-mono font-bold text-xs py-3 hover:bg-[#FF4A15]/90 transition-all cursor-pointer shadow-lg"
                >
                  <Mail className="w-4 h-4" /> Copy Email Address
                </button>
                <a
                  href={selectedMember.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-full bg-white/[0.06] border border-white/[0.1] text-white font-mono font-bold text-xs inline-flex items-center gap-1.5 hover:bg-white hover:text-black transition-colors"
                >
                  LinkedIn <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};
