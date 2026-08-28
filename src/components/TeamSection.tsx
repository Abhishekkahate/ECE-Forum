import React, { useState, useMemo, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ExternalLink, Shield, Sparkles, Search, X, Check, Award, ArrowUpRight, Users, Layers, Hash, LayoutGrid, List, Zap } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { OptimizedImage } from './OptimizedImage';
import { useScrollReveal } from './useScrollReveal';

interface TeamMember {
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
  const [activeTab, setActiveTab] = useState('All');
  const [councilFilter, setCouncilFilter] = useState<'All' | 'SPACE' | 'SINC'>('All');
  const [viewMode, setViewMode] = useState<'ledger' | 'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const revealRef = useScrollReveal(0.04);

  const teamMembers: TeamMember[] = [
    { name: 'Rohan Virutkar', role: 'President SPACE', category: 'Executive Council', council: 'SPACE', year: '4th Year ECE', image: '/team_images/rohit.webp', linkedin: 'https://linkedin.com', email: 'rohan.v@ece-elevate.org', quote: 'Driving innovation through hands-on silicon design, embedded systems, and teamwork.', specialty: 'Strategic Council Governance & VLSI Prototyping' },
    { name: 'Makarand Bahmane', role: 'President SINC', category: 'Executive Council', council: 'SINC', year: '4th Year ECE', image: '/team_images/makrand.webp', linkedin: 'https://linkedin.com', email: 'makarand.b@ece-elevate.org', quote: 'Bridging classroom theory with industry-grade prototyping and robotics innovation.', specialty: 'Autonomous Systems & Hardware Prototyping' },
    { name: 'Samyak Belsare', role: 'Vice President SPACE', category: 'Executive Council', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/samyak.webp', linkedin: 'https://linkedin.com', email: 'samyak.b@ece-elevate.org', quote: 'Empowering students to publish research papers and dominate hackathons.', specialty: 'Research Publications & IEEE Chapters' },
    { name: 'Atharva Kalbande', role: 'Vice President SPACE', category: 'Executive Council', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/atharva.webp', linkedin: 'https://linkedin.com', email: 'atharva.k@ece-elevate.org', quote: 'Building inclusive technical wings for robotics and edge intelligence.', specialty: 'Technical Wing Operations' },
    { name: 'Siddhesh Bhandare', role: 'Vice President SINC', category: 'Executive Council', council: 'SINC', year: '3rd Year ECE', image: '/team_images/siddhesh.webp', linkedin: 'https://linkedin.com', email: 'siddhesh.b@ece-elevate.org', quote: 'Architecting ROS 2 autonomous rovers, LiDAR sensors, and FPGA cores.', specialty: 'ROS 2 Robotics & Firmware' },
    { name: 'Saloni Gajghate', role: 'Secretary SPACE', category: 'Executive Council', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/saloni.webp', linkedin: 'https://linkedin.com', email: 'saloni.g@ece-elevate.org', quote: 'Creating futuristic UI visuals, documentation, and brand identities.', specialty: 'Brand Identity & Admin' },
    { name: 'Vinay Masurkar', role: 'Joint Secretary SPACE', category: 'Executive Council', council: 'SPACE', year: '2nd Year ECE', image: '/team_images/vinay.webp', linkedin: 'https://linkedin.com', email: 'vinay.m@ece-elevate.org', quote: 'Orchestrating smooth logistics and hospitality for 1000+ attendee hackathons.', specialty: 'Event Operations & External Relations' },
    { name: 'Varun Gaikwad', role: 'Joint Secretary SINC', category: 'Executive Council', council: 'SINC', year: '2nd Year ECE', image: '/team_images/varun.webp', linkedin: 'https://linkedin.com', email: 'varun.g@ece-elevate.org', quote: 'Managing technical communications, member onboarding, and community engagement.', specialty: 'Community Growth & Hackathon Mgmt' },
    { name: 'Priyanshi Nikule', role: 'Treasurer SPACE', category: 'Executive Council', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/priyanshi.webp', linkedin: 'https://linkedin.com', email: 'priyanshi.n@ece-elevate.org', quote: 'Building embedded IoT solutions and fiscal transparency.', specialty: 'Financial Budgeting' },
    { name: 'Anushka Madankar', role: 'Treasurer SINC', category: 'Design & Media', council: 'SINC', year: '3rd Year ECE', image: '/team_images/anushka.webp', linkedin: 'https://linkedin.com', email: 'anushka.m@ece-elevate.org', quote: 'Designing slick UI themes, event marketing banners, and visual media.', specialty: 'Graphic Design & Visual Identity' },
    { name: 'Arju Pardhi', role: 'Joint Treasurer SPACE', category: 'Event Management', council: 'SPACE', year: '2nd Year ECE', image: '/team_images/arju.webp', linkedin: 'https://linkedin.com', email: 'arju.p@ece-elevate.org', quote: 'Managing venue operations and guest speaker coordination.', specialty: 'Logistics & Guest Coordination' },
    { name: 'Vedanti Ramteke', role: 'Joint Treasurer SINC', category: 'Design & Media', council: 'SINC', year: '2nd Year ECE', image: '/team_images/vedanti.webp', linkedin: 'https://linkedin.com', email: 'vedanti.r@ece-elevate.org', quote: 'Connecting forum community across digital channels.', specialty: 'Social Media' },
    { name: 'Himanshu Hirankhede', role: 'Technical Incharge SINC', category: 'Technical Leads', council: 'SINC', year: '3rd Year ECE', image: '/team_images/himanshu.webp', linkedin: 'https://linkedin.com', email: 'himanshu.h@ece-elevate.org', quote: 'Leading autonomous drone flight controllers and rover projects.', specialty: 'UAV Flight Controllers' },
    { name: 'Abhishek Kahate', role: 'Technical Co-Incharge SINC', category: 'Technical Leads', council: 'SINC', year: '2nd Year ECE', image: '/team_images/Abhi.webp', linkedin: 'https://linkedin.com', email: 'abhishek.k@ece-elevate.org', quote: 'Developing high-performance web platforms and digital forum experiences.', specialty: 'Full-Stack Web Architecture' },
    { name: 'Shreya Rathi', role: 'Technical Co-Incharge SINC', category: 'Technical Leads', council: 'SINC', year: '2nd Year ECE', image: '/team_images/shreya.webp', linkedin: 'https://linkedin.com', email: 'shreya.r@ece-elevate.org', quote: 'Facilitating hands-on microcontroller and VLSI bootcamps.', specialty: 'MCU Bootcamps' },
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
  ];

  const tabs = ['All', 'Executive Council', 'Technical Leads', 'Design & Media', 'Event Management'];

  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      const matchesTab = activeTab === 'All' || m.category === activeTab;
      const matchesCouncil = councilFilter === 'All' || m.council === councilFilter;
      const q = deferredQuery.trim().toLowerCase();
      const matchesSearch = q === '' || m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q) || m.specialty?.toLowerCase().includes(q);
      return matchesTab && matchesCouncil && matchesSearch;
    });
  }, [activeTab, councilFilter, deferredQuery]);

  const getCount = (c: string) => (c === 'All' ? teamMembers.length : teamMembers.filter((m) => m.category === c).length);
  const councilCount = (c: 'SPACE' | 'SINC') => teamMembers.filter((m) => m.council === c).length;

  const handleCopy = (email: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFx.playClick();
    navigator.clipboard?.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  // lock body scroll + ESC when dossier open — smoother feel
  React.useEffect(() => {
    if (selectedMember) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedMember(null); };
      window.addEventListener('keydown', onEsc);
      return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onEsc); };
    } else {
      document.body.style.overflow = '';
    }
  }, [selectedMember]);

  return (
    <section id="team" ref={revealRef} className="relative py-20 lg:py-28 bg-[#08080A] text-[#F5F3EF] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 editorial-grid opacity-[0.05]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,74,21,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,74,21,0.08) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>
      <div className="section-divider-subtle absolute top-0 left-0 right-0" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF4A15]/20 to-transparent" />

      {copiedEmail && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0F0F11] border border-white/[0.10] text-[#F5F3EF] text-xs font-mono px-4 py-3 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <span className="w-6 h-6 rounded-full bg-[#FF4A15] text-white grid place-items-center"><Check className="w-3.5 h-3.5" /></span>
          Copied — {copiedEmail}
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — with council stats */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8">
          <div className="reveal max-w-[640px]">
            <div className="inline-flex items-center gap-2.5 rounded-full bg-[rgba(255,74,21,0.08)] border border-[rgba(255,74,21,0.18)] px-3.5 py-1.5 backdrop-blur-xl">
              <Shield className="w-3.5 h-3.5 text-[#FF4A15]" />
              <span className="text-[10.5px] font-mono tracking-[0.16em] font-bold text-[#FF4A15]">06 — COMMAND COUNCIL</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono tracking-[0.10em] px-2 py-0.5 rounded-full bg-[#08080A] border border-white/10 text-white/60">30 DOSSIERS — 2026–27</span>
            </div>
            <h2 className="mt-5 font-display font-[800] tracking-[-0.05em] leading-[0.88] text-[32px] sm:text-[42px] lg:text-[52px] text-[#F5F3EF]">
              Student <span className="font-serif italic font-[400] tracking-[-0.04em] text-[#FF4A15]">leadership.</span>
            </h2>
            <div className="mt-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.12em] text-white/35">
              <span className="h-px w-8 bg-white/15" />
              <span>COUNCIL GRID — ATELIER No.08 — VERIFIED ROSTER</span>
            </div>
            {/* council stats inline */}
            <div className="mt-4 hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-full bg-[#F5F3EF] text-[#08080A] font-bold"><span className="w-2 h-2 rounded-full bg-[#08080A]" /> SPACE · {councilCount('SPACE')}</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-full bg-[#FF4A15] text-white font-bold"><span className="w-2 h-2 rounded-full bg-white" /> SINC · {councilCount('SINC')}</span>
              <span className="text-[11px] font-mono text-white/30">· {filteredMembers.length} shown</span>
            </div>
          </div>
          <p className="reveal stagger-2 max-w-[360px] text-[13px] leading-relaxed font-mono text-white/55 border-l-2 border-[#FF4A15]/30 pl-4">
            30 student leaders across executive, technical, design &amp; event management wings — filtered by wing and council, ledger or card view.
          </p>
        </div>

        {/* Controls — atelier control bar: tabs + council + search + view toggle */}
        <div className="reveal flex flex-col gap-3 mb-8">
          {/* row 1: wing tabs */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5 p-1.5 rounded-full bg-[#0F0F11]/80 border border-white/[0.07] backdrop-blur-xl overflow-x-auto hide-scrollbar">
              {tabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => { soundFx.playClick(); setActiveTab(tab); }}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-mono tracking-[0.04em] border transition-all whitespace-nowrap ${isActive ? 'bg-[#FF4A15] text-white border-[#FF4A15] font-bold shadow-[0_6px_18px_rgba(255,74,21,0.35)]' : 'bg-transparent text-white/55 border-transparent hover:text-white hover:bg-white/[0.06]'}`}
                  >
                    <Hash className={`w-3 h-3 ${isActive ? 'text-white/80' : 'text-white/25'}`} /> {tab}
                    <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white text-[#FF4A15]' : 'bg-white/10 text-white/60 border border-white/10'}`}>{getCount(tab)}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* council filter */}
              <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.07]">
                {(['All','SPACE','SINC'] as const).map((c) => (
                  <button key={c} onClick={() => { soundFx.playClick(); setCouncilFilter(c); }} className={`px-3 py-1.5 rounded-full text-[11px] font-mono font-bold tracking-[0.04em] border transition-all ${councilFilter===c ? (c==='SPACE' ? 'bg-[#F5F3EF] text-[#08080A] border-white' : c==='SINC' ? 'bg-[#FF4A15] text-white border-[#FF4A15] shadow-[0_4px_12px_rgba(255,74,21,0.3)]' : 'bg-white text-black border-white') : 'bg-transparent text-white/40 border-transparent hover:text-white hover:bg-white/[0.06]'}`}>
                    {c} {c!=='All' && <span className={`ml-1 text-[10px] px-1 py-0.5 rounded-full ${councilFilter===c ? (c==='SPACE' ? 'bg-black text-white' : 'bg-white text-[#FF4A15]') : 'bg-white/10'}`}>{c==='SPACE'?councilCount('SPACE'):councilCount('SINC')}</span>}
                  </button>
                ))}
              </div>
              {/* view toggle — kept polished, grid default */}
              <div className="hidden sm:flex items-center gap-1 p-1 rounded-full bg-[#0F0F11] border border-white/[0.07]">
                <button onClick={() => { soundFx.playClick(); setViewMode('ledger'); }} aria-label="Ledger view" title="Ledger view" className={`w-8 h-8 rounded-full grid place-items-center transition-all ${viewMode==='ledger' ? 'bg-[#FF4A15] text-white shadow-[0_4px_12px_rgba(255,74,21,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/[0.06]'}`}><List className="w-4 h-4" /></button>
                <button onClick={() => { soundFx.playClick(); setViewMode('grid'); }} aria-label="Grid view" title="Grid view" className={`w-8 h-8 rounded-full grid place-items-center transition-all ${viewMode==='grid' ? 'bg-[#FF4A15] text-white shadow-[0_4px_12px_rgba(255,74,21,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/[0.06]'}`}><LayoutGrid className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          {/* row 2: search + meta */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-mono text-white/30">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-1.5"><Zap className="w-3 h-3 text-[#FF4A15]" /> {filteredMembers.length} / {teamMembers.length} DOSSIERS</span>
              <span className="hidden sm:inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FF4A15]" /> SPACE<span className="w-px h-3 bg-white/10 mx-1" /> SINC</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-white/20 border border-white/10 rounded-full px-2 py-1 text-[10px] tracking-[0.08em]"><Layers className="w-3 h-3" /> GRID · CARDS</span>
            </div>
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search leader, role or skill…" className="w-full pl-10 pr-10 py-2.5 rounded-full bg-[rgba(15,15,17,0.8)] border border-white/[0.08] backdrop-blur text-[12px] font-mono text-[#F5F3EF] placeholder:text-white/30 focus:outline-none focus:border-[rgba(255,74,21,0.35)] transition-all" />
              {searchQuery ? <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 text-white/60 hover:bg-white hover:text-black grid place-items-center"><X className="w-3 h-3" /></button> : <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono tracking-[0.08em] text-white/20 border border-white/10 rounded-full px-2 py-1 hidden sm:inline-flex">⌘ K</span>}
            </div>
          </div>
        </div>

        {/* Roster — ledger or polished grid */}
        {viewMode === 'ledger' ? (
          <div className="border border-white/[0.08] rounded-[20px] overflow-hidden bg-[rgba(14,14,16,0.72)] backdrop-blur-xl divide-y divide-white/[0.06]">
            <div className="hidden sm:flex items-center gap-4 px-5 py-2.5 bg-white/[0.03] text-[10px] font-mono tracking-[0.12em] text-white/30">
              <span className="w-[64px]">PLATE</span><span className="flex-1">DOSSIER — NAME & ROLE</span><span className="hidden lg:inline w-[260px]">SPECIALTY</span><span className="hidden sm:inline w-[160px] text-right">CONTACT</span>
            </div>
            {filteredMembers.map((member, idx) => {
              const isSpace = member.council === 'SPACE';
              return (
                <div key={member.name} onClick={() => { soundFx.playLaser(); setSelectedMember(member); }} className="group relative flex flex-col sm:flex-row sm:items-center gap-4 px-4 sm:px-5 py-4 hover:bg-white/[0.02] cursor-pointer transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#FF4A15] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative w-[64px] h-[64px] rounded-[14px] overflow-hidden bg-white/[0.06] border border-white/[0.08] shrink-0 group-hover:border-[#FF4A15]/20 transition-colors">
                      <OptimizedImage src={member.image} alt={member.name} className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
                      <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-white/20 ${isSpace ? 'bg-[#F5F3EF]' : 'bg-[#FF4A15] shadow-[0_0_8px_rgba(255,74,21,0.6)]'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-[Syne] font-[800] text-[14.5px] tracking-[-0.01em] text-[#F5F3EF] truncate">{member.name}</h3>
                        <span className={`inline-flex max-w-full truncate text-[10px] font-mono font-black tracking-[0.06em] px-2 py-0.5 rounded-full border ${isSpace ? 'bg-[#F5F3EF] text-[#08080A] border-white' : 'bg-[#FF4A15] text-white border-[#FF4A15]'}`}>{member.role}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono">
                        <span className="inline-flex items-center gap-1 text-white/45"><span className={`w-1.5 h-1.5 rounded-full ${isSpace ? 'bg-[#F5F3EF]' : 'bg-[#FF4A15]'}`} /> {member.council} · {member.year}</span>
                        <span className="hidden sm:inline w-px h-3 bg-white/10" /><span className="hidden sm:inline text-white/30 tracking-[0.04em]">{member.category}</span>
                      </div>
                      <div className="sm:hidden mt-1.5 text-[11px] font-mono text-white/40 line-clamp-1">{member.specialty}</div>
                    </div>
                  </div>
                  <div className="hidden lg:block w-[260px] text-[11px] font-mono leading-snug text-white/40 line-clamp-2">{member.specialty || '—'}</div>
                  <div className="flex sm:w-[160px] items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-0 border-white/[0.06] pt-3 sm:pt-0">
                    <span className="text-[11px] font-mono font-bold text-white/30 sm:hidden">{member.council} · {String(idx+1).padStart(2,'0')}</span>
                    <div className="flex gap-1.5">
                      <a href={member.linkedin} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/70 grid place-items-center hover:bg-white hover:text-black transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>
                      <button onClick={(e) => handleCopy(member.email, e)} className="w-8 h-8 rounded-full bg-[#FF4A15] text-white grid place-items-center hover:bg-[#E63E0F]"><Mail className="w-3.5 h-3.5" /></button>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono font-bold text-white/30 group-hover:text-[#FF4A15]">DOSSIER <ArrowUpRight className="w-3 h-3" /></span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
            {filteredMembers.map((member) => {
              const isSpace = member.council === 'SPACE';
              return (
                <div
                  key={member.name}
                  onClick={() => { soundFx.playLaser(); setSelectedMember(member); }}
                  className="group relative glass-card-premium rounded-[22px] p-5 flex flex-col items-center text-center gap-3 cursor-pointer hover:border-[rgba(255,74,21,0.22)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.55),0_0_22px_rgba(255,74,21,0.08)] hover:-translate-y-1"
                >
                  {/* top hairline — intensifies on hover via ::before */}
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-[#FF4A15]/30 transition-colors" />

                  {/* council dot — top-right signature */}
                  <span className={`absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full border border-white/15 ${isSpace ? 'bg-[#F5F3EF] shadow-[0_0_10px_rgba(245,243,239,0.35)]' : 'bg-[#FF4A15] shadow-[0_0_10px_rgba(255,74,21,0.6)]'}`} title={member.council} />

                  {/* avatar — 84px */}
                  <div className="relative w-[84px] h-[84px] rounded-[18px] overflow-hidden bg-white/[0.06] border border-white/10 group-hover:border-[#FF4A15]/20 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] shrink-0">
                    <OptimizedImage src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" wrapperClassName="w-full h-full" />
                    {/* subtle inner vignette */}
                    <div className="absolute inset-0 pointer-events-none rounded-[18px] shadow-[inset_0_0_22px_rgba(0,0,0,0.25)]" />
                  </div>

                  {/* role stamp */}
                  <span className={`inline-flex items-center justify-center text-center text-[10px] font-mono font-black tracking-[0.06em] leading-none px-3 py-1.5 rounded-full border max-w-full truncate ${isSpace ? 'bg-[#F5F3EF] text-[#08080A] border-white' : 'bg-[#FF4A15] text-white border-[#FF4A15] shadow-[0_4px_12px_rgba(255,74,21,0.25)]'}`}>
                    {member.role}
                  </span>

                  {/* name */}
                  <h3 className="font-[Syne] font-[800] text-[14px] leading-tight tracking-[-0.02em] text-[#F5F3EF] line-clamp-1 w-full">{member.name}</h3>

                  {/* year */}
                  <p className="text-[10.5px] font-mono tracking-[0.04em] text-white/35 -mt-1">{member.year}</p>

                  {/* specialty — two lines, fixed height */}
                  <p className="text-[11px] font-mono leading-snug text-white/40 line-clamp-2 min-h-[32px] w-full">{member.specialty}</p>

                  {/* council + category meta */}
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.06em] text-white/25">
                    <span className={`w-1.5 h-1.5 rounded-full ${isSpace ? 'bg-[#F5F3EF]' : 'bg-[#FF4A15]'}`} /> {member.council}
                    <span className="w-px h-3 bg-white/10 mx-1" />
                    <span className="truncate max-w-[90px]">{member.category}</span>
                  </div>

                  {/* actions — dossier + icons */}
                  <div className="w-full pt-3 mt-1 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold tracking-[0.04em] text-white/45 group-hover:text-[#FF4A15] transition-colors">
                      DOSSIER <ArrowUpRight className="w-3 h-3" />
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`LinkedIn ${member.name}`}
                        className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.08] grid place-items-center text-white/60 hover:bg-white hover:text-black hover:border-white transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={(e) => handleCopy(member.email, e)}
                        aria-label={`Copy email ${member.name}`}
                        className="w-7 h-7 rounded-full bg-[#FF4A15] text-white grid place-items-center hover:bg-[#E63E0F] transition-colors shadow-[0_4px_12px_rgba(255,74,21,0.25)]"
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

        {filteredMembers.length === 0 && (
          <div className="text-center py-14 text-xs font-mono text-white/40 rounded-[20px] bg-[rgba(14,14,16,0.6)] border border-dashed border-white/10 mt-4">
            <Users className="w-8 h-8 mx-auto mb-3 text-white/15" /> No dossiers match “{searchQuery}” — try another wing or council.
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2 text-[10px] font-mono tracking-[0.08em] text-white/25">
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FF4A15]" /> SPACE</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F5F3EF] border border-white/20" /> SINC</span>
          <span className="hidden sm:inline text-white/15 ml-1">— click any card or row to open dossier · copy email directly</span>
        </div>
      </div>

      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#08080A]/80 backdrop-blur-[12px]"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', damping: 26, stiffness: 340, mass: 0.8 }}
              className="relative w-full max-w-[560px] rounded-[28px] overflow-hidden bg-[#0F0F11] border border-white/[0.10] shadow-[0_24px_64px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.07)] max-h-[92vh] overflow-y-auto hide-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF4A15]/35 to-transparent" />
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,74,21,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,74,21,0.12) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
            <button onClick={() => { soundFx.playClick(); setSelectedMember(null); }} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] text-white grid place-items-center hover:bg-white hover:text-black transition-colors z-10"><X className="w-4 h-4" /></button>
            <div className="relative px-7 sm:px-8 pt-7 pb-5 border-b border-white/[0.08] bg-[rgba(255,74,21,0.04)]">
              <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.14em] font-bold text-[#FF4A15]"><Sparkles className="w-3.5 h-3.5" /> LEADERSHIP DOSSIER · 2026–27 — ATELIER No.08</div>
              <div className="mt-4 flex gap-4 items-center">
                <div className="w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-[18px] overflow-hidden bg-white/[0.06] border border-white/[0.12] shrink-0"><img src={selectedMember.image} alt={selectedMember.name} className="w-full h-full object-cover" /></div>
                <div className="min-w-0">
                  <span className={`inline-flex text-[10px] font-mono font-black tracking-[0.08em] px-2.5 py-1 rounded-full border ${selectedMember.council==='SPACE'?'bg-[#F5F3EF] text-[#08080A] border-white':'bg-[#FF4A15] text-white border-[#FF4A15]'}`}>{selectedMember.role}</span>
                  <h3 className="mt-2 font-display font-[800] tracking-[-0.03em] text-[22px] sm:text-[24px] leading-none text-[#F5F3EF]">{selectedMember.name}</h3>
                  <div className="text-[11px] font-mono tracking-[0.06em] text-white/45 mt-1 flex flex-wrap items-center gap-2"><span>{selectedMember.year} · Dept of ECE</span><span className="w-1 h-1 rounded-full bg-white/20 hidden sm:inline-block" /><span className="inline-flex items-center gap-1 text-[#FF4A15] font-bold"><Hash className="w-3 h-3" /> {selectedMember.council} COUNCIL</span></div>
                </div>
              </div>
            </div>
            <div className="relative p-7 sm:p-8 space-y-4">
              {selectedMember.specialty && <div className="rounded-2xl bg-[rgba(255,74,21,0.06)] border border-[rgba(255,74,21,0.12)] p-4"><div className="text-[10px] font-mono tracking-[0.14em] font-bold text-[#FF4A15] flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> FOCUS & SPECIALTY</div><div className="font-display font-bold text-[#F5F3EF] mt-1.5 text-[14px] leading-snug">{selectedMember.specialty}</div><div className="text-[11px] font-mono text-white/40 mt-1">{selectedMember.category} · {selectedMember.council}</div></div>}
              <div className="rounded-2xl bg-[#08080A] border border-white/[0.08] p-4"><div className="text-[10px] font-mono tracking-[0.12em] font-bold text-white/30">DOSSIER NOTE</div><p className="text-[13px] leading-relaxed italic text-white/75 mt-2">“{selectedMember.quote}”</p></div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 flex items-center justify-between gap-3">
                <div className="min-w-0"><div className="text-[10px] font-mono tracking-[0.12em] font-bold text-white/30">CONTACT — EMAIL</div><div className="text-[12px] font-mono font-medium text-[#F5F3EF] truncate mt-1">{selectedMember.email}</div></div>
                <button onClick={() => handleCopy(selectedMember.email)} className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black font-mono font-bold text-[11px] hover:bg-white/90">{copiedEmail===selectedMember.email ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Mail className="w-3.5 h-3.5" />}{copiedEmail===selectedMember.email ? 'Copied' : 'Copy'}</button>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => handleCopy(selectedMember.email)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#FF4A15] text-white font-mono font-bold tracking-[0.06em] text-[12px] py-3 hover:bg-[#E63E0F]"><Mail className="w-4 h-4" /> Copy Email</button>
                <a href={selectedMember.linkedin} target="_blank" rel="noreferrer" className="px-6 py-3 rounded-full bg-white/[0.06] border border-white/[0.10] text-white font-mono font-bold text-[12px] inline-flex items-center gap-1.5 hover:bg-white hover:text-black">LinkedIn <ExternalLink className="w-4 h-4" /></a>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono tracking-[0.12em] text-white/20 pt-2 border-t border-white/[0.06]"><span>ATELIER DOSSIER — {selectedMember.council} — {selectedMember.category.toUpperCase()}</span><span>{selectedMember.year}</span></div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </section>
  );
};
