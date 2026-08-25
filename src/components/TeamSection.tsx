import React, { useState, useMemo } from 'react';
import { Mail, ExternalLink, Shield, Sparkles, Search, X, Check, Award, ArrowUpRight } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const revealRef = useScrollReveal(0.04);

  const teamMembers: TeamMember[] = [
    {
      name: 'Rohan Virutkar', role: 'President SPACE', category: 'Executive Council', council: 'SPACE', year: '4th Year ECE',
      image: '/team_images/rohit.webp', linkedin: 'https://linkedin.com', email: 'rohan.v@ece-elevate.org',
      quote: 'Driving innovation through hands-on silicon design, embedded systems, and teamwork.',
      specialty: 'Strategic Council Governance & VLSI Prototyping',
    },
    {
      name: 'Makarand Bahmane', role: 'President SINC', category: 'Executive Council', council: 'SINC', year: '4th Year ECE',
      image: '/team_images/makrand.webp', linkedin: 'https://linkedin.com', email: 'makarand.b@ece-elevate.org',
      quote: 'Bridging classroom theory with industry-grade prototyping and robotics innovation.',
      specialty: 'Autonomous Systems & Hardware Prototyping',
    },
    {
      name: 'Samyak Belsare', role: 'Vice President SPACE', category: 'Executive Council', council: 'SPACE', year: '3rd Year ECE',
      image: '/team_images/samyak.webp', linkedin: 'https://linkedin.com', email: 'samyak.b@ece-elevate.org',
      quote: 'Empowering students to publish research papers and dominate national hackathons.',
      specialty: 'Research Publications & IEEE Student Chapters',
    },
    {
      name: 'Atharva Kalbande', role: 'Vice President SPACE', category: 'Executive Council', council: 'SPACE', year: '3rd Year ECE',
      image: '/team_images/atharva.webp', linkedin: 'https://linkedin.com', email: 'atharva.k@ece-elevate.org',
      quote: 'Building inclusive technical wings for autonomous robotics and edge intelligence.',
      specialty: 'Technical Wing Operations & Project Management',
    },
    {
      name: 'Siddhesh Bhandare', role: 'Vice President SINC', category: 'Executive Council', council: 'SINC', year: '3rd Year ECE',
      image: '/team_images/siddhesh.webp', linkedin: 'https://linkedin.com', email: 'siddhesh.b@ece-elevate.org',
      quote: 'Architecting ROS 2 autonomous rovers, LiDAR sensors, and FPGA synthesized cores.',
      specialty: 'ROS 2 Robotics & Embedded Firmware',
    },
    {
      name: 'Saloni Gajghate', role: 'Secretary SPACE', category: 'Executive Council', council: 'SPACE', year: '3rd Year ECE',
      image: '/team_images/saloni.webp', linkedin: 'https://linkedin.com', email: 'saloni.g@ece-elevate.org',
      quote: 'Creating futuristic UI visuals, departmental documentation, and brand identities.',
      specialty: 'Brand Identity & Administrative Oversight',
    },
    {
      name: 'Vinay Masurkar', role: 'Joint Secretary SPACE', category: 'Executive Council', council: 'SPACE', year: '2nd Year ECE',
      image: '/team_images/vinay.webp', linkedin: 'https://linkedin.com', email: 'vinay.m@ece-elevate.org',
      quote: 'Orchestrating smooth logistics and hospitality for 1000+ attendee hackathons.',
      specialty: 'Event Operations & External Relations',
    },
    {
      name: 'Varun Gaikwad', role: 'Joint Secretary SINC', category: 'Executive Council', council: 'SINC', year: '2nd Year ECE',
      image: '/team_images/varun.webp', linkedin: 'https://linkedin.com', email: 'varun.g@ece-elevate.org',
      quote: 'Managing technical communications, member onboarding, and community engagement.',
      specialty: 'Community Growth & Hackathon Management',
    },
    {
      name: 'Priyanshi Nikule', role: 'Treasurer SPACE', category: 'Executive Council', council: 'SPACE', year: '3rd Year ECE',
      image: '/team_images/priyanshi.webp', linkedin: 'https://linkedin.com', email: 'priyanshi.n@ece-elevate.org',
      quote: 'Building embedded IoT solutions and maintaining fiscal transparency.',
      specialty: 'Financial Budgeting & Resource Allocation',
    },
    {
      name: 'Anushka Madankar', role: 'Treasurer SINC', category: 'Design & Media', council: 'SINC', year: '3rd Year ECE',
      image: '/team_images/anushka.webp', linkedin: 'https://linkedin.com', email: 'anushka.m@ece-elevate.org',
      quote: 'Designing slick UI themes, event marketing banners, and visual media.',
      specialty: 'Graphic Design & Visual Identity',
    },
    {
      name: 'Arju Pardhi', role: 'Joint Treasurer SPACE', category: 'Event Management', council: 'SPACE', year: '2nd Year ECE',
      image: '/team_images/arju.webp', linkedin: 'https://linkedin.com', email: 'arju.p@ece-elevate.org',
      quote: 'Managing venue operations and guest speaker coordination.',
      specialty: 'Logistics & Guest Coordination',
    },
    {
      name: 'Vedanti Ramteke', role: 'Joint Treasurer SINC', category: 'Design & Media', council: 'SINC', year: '2nd Year ECE',
      image: '/team_images/vedanti.webp', linkedin: 'https://linkedin.com', email: 'vedanti.r@ece-elevate.org',
      quote: 'Connecting our forum community across all social digital channels.',
      specialty: 'Social Media & Community Broadcasts',
    },
    {
      name: 'Himanshu Hirankhede', role: 'Technical Incharge SINC', category: 'Technical Leads', council: 'SINC', year: '3rd Year ECE',
      image: '/team_images/himanshu.webp', linkedin: 'https://linkedin.com', email: 'himanshu.h@ece-elevate.org',
      quote: 'Leading autonomous drone flight controllers and rover development projects.',
      specialty: 'UAV Flight Controllers & Autonomous Hardware',
    },
    {
      name: 'Abhishek Kahate', role: 'Technical Co-Incharge SINC', category: 'Technical Leads', council: 'SINC', year: '2nd Year ECE',
      image: '/team_images/Abhi.webp', linkedin: 'https://linkedin.com', email: 'abhishek.k@ece-elevate.org',
      quote: 'Developing high-performance modern web platforms and digital forum experiences.',
      specialty: 'Full-Stack Web Architecture & Digital Experiences',
    },
    {
      name: 'Shreya Rathi', role: 'Technical Co-Incharge SINC', category: 'Technical Leads', council: 'SINC', year: '2nd Year ECE',
      image: '/team_images/shreya.webp', linkedin: 'https://linkedin.com', email: 'shreya.r@ece-elevate.org',
      quote: 'Facilitating hands-on microcontroller and VLSI bootcamp workshops.',
      specialty: 'Microcontroller Bootcamps & Hardware Labs',
    },
    {
      name: 'Pranjali Chopde', role: 'Cultural Incharge SPACE', category: 'Event Management', council: 'SPACE', year: '3rd Year ECE',
      image: '/team_images/pranjali.webp', linkedin: 'https://linkedin.com', email: 'pranjali.c@ece-elevate.org',
      quote: 'Organizing engaging cultural events and welcoming freshers for SPACE.',
      specialty: 'Freshers Gala & Cultural Production',
    },
    {
      name: 'Sadiksha Saonerkar', role: 'Cultural Incharge SPACE', category: 'Event Management', council: 'SPACE', year: '3rd Year ECE',
      image: '/team_images/sadiksha.webp', linkedin: 'https://linkedin.com', email: 'sadiksha.s@ece-elevate.org',
      quote: 'Securing industry partnerships, campus networking, and sponsorships.',
      specialty: 'Industry Sponsorships & Student Outreach',
    },
    {
      name: 'Aditi Sharma', role: 'Cultural Incharge SPACE', category: 'Event Management', council: 'SPACE', year: '3rd Year ECE',
      image: '/team_images/aditi.webp', linkedin: 'https://linkedin.com', email: 'aditi.s@ece-elevate.org',
      quote: 'Creating vibrant campus engagements and collaborative networking forums.',
      specialty: 'Event Staging & Student Engagement',
    },
    {
      name: 'Vibhanshu Tiwari', role: 'Cultural Co-Incharge SPACE', category: 'Event Management', council: 'SPACE', year: '2nd Year ECE',
      image: '/team_images/vibhanshu.webp', linkedin: 'https://linkedin.com', email: 'vibhanshu.t@ece-elevate.org',
      quote: 'Managing student outreach, stage presentations, and technical showcases.',
      specialty: 'Stage Operations & Audience Management',
    },
    {
      name: 'Amruta Wankhede', role: 'Sports Incharge SPACE', category: 'Event Management', council: 'SPACE', year: '3rd Year ECE',
      image: '/team_images/amruta.webp', linkedin: 'https://linkedin.com', email: 'amruta.w@ece-elevate.org',
      quote: 'Promoting athletic excellence and annual departmental tournaments.',
      specialty: 'Athletics & Departmental Tournaments',
    },
    {
      name: 'Mohit Kumar', role: 'Sports Incharge SPACE', category: 'Event Management', council: 'SPACE', year: '3rd Year ECE',
      image: '/team_images/mohit.webp', linkedin: 'https://linkedin.com', email: 'mohit.k@ece-elevate.org',
      quote: 'Organizing inter-branch sports leagues, cricket championships, and team building.',
      specialty: 'Sports League Operations & Team Building',
    },
    {
      name: 'Yash Baghele', role: 'Sports Co-Incharge SPACE', category: 'Event Management', council: 'SPACE', year: '2nd Year ECE',
      image: '/team_images/yash.webp', linkedin: 'https://linkedin.com', email: 'yash.b@ece-elevate.org',
      quote: 'Leading sports event coordination and physical wellness initiatives.',
      specialty: 'Tournament Coordination & Fitness Wings',
    },
    {
      name: 'Aditya Bobade', role: 'Media Incharge SPACE', category: 'Design & Media', council: 'SPACE', year: '3rd Year ECE',
      image: '/team_images/aditya.webp', linkedin: 'https://linkedin.com', email: 'aditya.b@ece-elevate.org',
      quote: 'Directing cinematic photography, videography, and event recaps.',
      specialty: 'Cinematography & Visual Production',
    },
    {
      name: 'Mahesh Hedau', role: 'Media Incharge SPACE', category: 'Design & Media', council: 'SPACE', year: '3rd Year ECE',
      image: '/team_images/mahesh.webp', linkedin: 'https://linkedin.com', email: 'mahesh.h@ece-elevate.org',
      quote: 'Producing digital multimedia and high-impact social promotions.',
      specialty: 'Digital Media Production & Broadcasts',
    },
    {
      name: 'Avishkar Nimbekar', role: 'Media Co-Incharge SPACE', category: 'Design & Media', council: 'SPACE', year: '2nd Year ECE',
      image: '/team_images/avishkar.webp', linkedin: 'https://linkedin.com', email: 'avishkar.n@ece-elevate.org',
      quote: 'Creating motion graphics, highlight reels, and event teasers.',
      specialty: 'Motion Graphics & Video Editing',
    },
    {
      name: 'Tejas Shahare', role: 'Social Incharge SPACE', category: 'Design & Media', council: 'SPACE', year: '3rd Year ECE',
      image: '/team_images/tejas.webp', linkedin: 'https://linkedin.com', email: 'tejas.s@ece-elevate.org',
      quote: 'Growing our social media engagement and online student community.',
      specialty: 'Social Media Strategy & Outreach',
    },
    {
      name: 'Niharika Kamble', role: 'Social Co-Incharge SPACE', category: 'Design & Media', council: 'SPACE', year: '2nd Year ECE',
      image: '/team_images/niharika.webp', linkedin: 'https://linkedin.com', email: 'niharika.k@ece-elevate.org',
      quote: 'Connecting with alumni networks and sharing technical breakthroughs.',
      specialty: 'Alumni Relations & Digital Content',
    },
    {
      name: 'Mrunal Bankar', role: 'Magazine Incharge SPACE', category: 'Design & Media', council: 'SPACE', year: '3rd Year ECE',
      image: '/team_images/mrunal.webp', linkedin: 'https://linkedin.com', email: 'mrunal.b@ece-elevate.org',
      quote: 'Publishing the annual departmental technical magazine "ELEKTRONIKOS".',
      specialty: 'Print Editorial & Technical Publications',
    },
    {
      name: 'Pallavi Chattes', role: 'Magazine Incharge SPACE', category: 'Design & Media', council: 'SPACE', year: '3rd Year ECE',
      image: '/team_images/pallavi.webp', linkedin: 'https://linkedin.com', email: 'pallavi.c@ece-elevate.org',
      quote: 'Curating student research papers, technical articles, and faculty interviews.',
      specialty: 'Research Paper Curation & Journalism',
    },
    {
      name: 'Tanhvi Shanware', role: 'Magazine Co-Incharge SPACE', category: 'Design & Media', council: 'SPACE', year: '2nd Year ECE',
      image: '/team_images/tanvi.webp', linkedin: 'https://linkedin.com', email: 'tanvi.s@ece-elevate.org',
      quote: 'Editorial lead for departmental publications and news digests.',
      specialty: 'Editorial Review & News Digests',
    },
  ];

  const tabs = ['All', 'Executive Council', 'Technical Leads', 'Design & Media', 'Event Management'];

  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      const matchesTab = activeTab === 'All' || m.category === activeTab;
      const matchesSearch =
        searchQuery.trim() === '' ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const getCategoryCount = (category: string) => {
    if (category === 'All') return teamMembers.length;
    return teamMembers.filter((m) => m.category === category).length;
  };

  const handleCopyEmail = (email: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFx.playClick();
    navigator.clipboard?.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  return (
    <section
      id="team"
      ref={revealRef}
      className="relative py-28 bg-transparent overflow-hidden"
    >
      {/* Laser Divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-purple/30 to-transparent" />

      {/* Copied Email Toast Notification */}
      {copiedEmail && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-midnight-deep border border-lime text-white text-xs font-mono px-4 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(0,242,254,0.4)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Check className="w-4 h-4 text-cyber-emerald" />
          <span>COPIED EMAIL: <strong className="text-lime">{copiedEmail}</strong></span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 reveal">
            <div className="section-eyebrow-hud">
              <Shield className="w-3.5 h-3.5" />
              <span>06 // STUDENT LEADERSHIP</span>
            </div>
            <h2 className="font-space text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Student Leadership
              <br className="hidden sm:block" />
              Command Council.
            </h2>
          </div>

          <p className="text-xs font-mono text-slate-400 max-w-xs sm:text-right leading-relaxed reveal stagger-2">
            Student leaders driving workshops, competitions, and technical wings for 2026-27.
          </p>
        </div>

        {/* ── Search & Filter Command Bar ──────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 reveal">

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-midnight-deep/80 border border-white/10 rounded-2xl backdrop-blur-md">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { soundFx.playClick(); setActiveTab(tab); }}
                id={`team-tab-${tab.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                className={`filter-pill flex items-center gap-1.5 ${activeTab === tab ? 'active' : ''}`}
              >
                <span>{tab}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${activeTab === tab ? 'bg-midnight text-white font-bold' : 'bg-white/10 text-slate-400'}`}>
                  {getCategoryCount(tab)}
                </span>
              </button>
            ))}
          </div>

          {/* Instant Name & Role Filter Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leader..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-midnight-deep/90 border border-white/12 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-lime transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Team 5-Column Grid ───────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4.5">
          {filteredMembers.map((member) => {
            const isSpace = member.council === 'SPACE';
            const isSinc = member.council === 'SINC';

            return (
              <div
                key={member.name}
                onClick={() => { soundFx.playLaser(); setSelectedMember(member); }}
                onMouseEnter={() => soundFx.playHover()}
                className="glass-cyber-interactive rounded-3xl p-5 flex flex-col items-center text-center space-y-3 group shadow-[0_15px_30px_rgba(0,0,0,0.6)] cursor-pointer relative overflow-hidden animate-in fade-in duration-300"
              >
                {/* Top Council Indicator Dot */}
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${isSpace ? 'bg-amber shadow-[0_0_6px_#FFB800]' : isSinc ? 'bg-lime shadow-[0_0_6px_#00F2FE]' : 'bg-cyber-emerald shadow-[0_0_6px_#00FF9D]'
                      }`}
                  />
                </div>

                {/* Member Avatar */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-lime/60 transition-all duration-400 shadow-md">
                  <OptimizedImage
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    wrapperClassName="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight-deep/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Info Area */}
                <div className="space-y-1 w-full">
                  <span className={`inline-block text-[8px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md tracking-wider border ${isSpace ? 'text-amber border-amber-500/30 bg-amber-500/10' : isSinc ? 'text-lime border-lime/30 bg-lime/10' : 'text-slate-300 border-white/10 bg-white/5'
                    }`}>
                    {member.role}
                  </span>
                  <h3 className="font-space font-extrabold text-sm text-white group-hover:text-lime transition-colors leading-snug truncate">
                    {member.name}
                  </h3>
                  <p className="text-[9px] font-mono text-slate-400">{member.year}</p>
                </div>

                {/* Card Action Row */}
                <div className="pt-2 border-t border-white/10 w-full flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span className="text-lime group-hover:underline flex items-center gap-0.5">
                    <span>BIO</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="LinkedIn"
                      className="p-1 rounded-lg bg-midnight-deep border border-white/10 text-slate-400 hover:text-white hover:border-white/30 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={(e) => handleCopyEmail(member.email, e)}
                      title={`Copy email: ${member.email}`}
                      className="p-1 rounded-lg bg-midnight-deep border border-white/10 text-slate-400 hover:text-lime hover:border-lime/40 transition-colors cursor-pointer"
                    >
                      <Mail className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-16 text-slate-500 font-mono text-xs">
            NO STUDENT LEADERS FOUND MATCHING "{searchQuery.toUpperCase()}"
          </div>
        )}

      </div>

      {/* ── Holographic Member Leadership Dossier Modal ──────── */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#080D1A] border-2 border-lime/50 p-7 sm:p-9 shadow-[0_0_60px_rgba(0,242,254,0.3)] space-y-6 text-left">

            {/* Close Button */}
            <button
              onClick={() => { soundFx.playClick(); setSelectedMember(null); }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-midnight-deep border border-white/15 text-slate-400 hover:text-white hover:border-white/40 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top Eyebrow */}
            <div className="flex items-center gap-2 text-[10px] font-mono text-lime font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-lime" />
              <span>OFFICIAL LEADERSHIP DOSSIER // SESSION 2026-27</span>
            </div>

            {/* Member Identity Block */}
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-lime shrink-0 shadow-lg">
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <span className={`inline-block text-[10px] font-mono font-extrabold px-3 py-1 rounded-xl border ${selectedMember.council === 'SPACE'
                    ? 'text-amber border-amber-500/40 bg-amber-500/10'
                    : 'text-lime border-lime/40 bg-lime/10'
                  }`}>
                  {selectedMember.role}
                </span>
                <h3 className="font-space font-extrabold text-2xl text-white">
                  {selectedMember.name}
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  {selectedMember.year} · Department of ECE
                </p>
              </div>
            </div>

            {/* Core Domain Specialty */}
            {selectedMember.specialty && (
              <div className="p-4 rounded-2xl bg-midnight-deep border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber" />
                  <span>Key Domain Specialty</span>
                </span>
                <p className="text-sm font-space font-bold text-white">
                  {selectedMember.specialty}
                </p>
              </div>
            )}

            {/* Leadership Statement */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                Engineering Statement
              </span>
              <p className="text-sm text-slate-200 italic font-sans leading-relaxed bg-midnight-deep/60 p-4 rounded-2xl border border-white/5">
                "{selectedMember.quote}"
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleCopyEmail(selectedMember.email)}
                className="flex-1 py-3 rounded-2xl bg-white text-midnight font-space font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors cursor-pointer shadow-md"
              >
                <Mail className="w-4 h-4" />
                <span>Copy Email Address</span>
              </button>

              <a
                href={selectedMember.linkedin}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 rounded-2xl bg-midnight-deep border border-white/20 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 hover:border-lime transition-colors"
              >
                <span>LinkedIn</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
