import { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useInView, useVelocity } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei'
import Lenis from 'lenis'
import {
  Cpu, Bot, Radio, Brain, Zap, Terminal, Clock, Shield, Ticket, VolumeX, Menu, X, ChevronRight, ArrowRight, ArrowDown, ArrowUp, ArrowUpRight,
  Calendar, MapPin, Flame, Compass, Trophy, FileCheck2, Award, Briefcase, BookOpen, FlaskConical, Search, Mail, ExternalLink, Sparkles, Activity, Users, Wrench, Star, ShieldCheck, Globe, Send, Check, Share2, Maximize2, Image as ImageIcon, Play, ChevronLeft, Download, Timer, Eye, Heart, Layers, Smartphone, Command, ArrowLeft, Hexagon, Waves
} from 'lucide-react'
import { forumApi } from './services/api'
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom'
import { RegisterPage } from './pages/RegisterPage'
import { AdminPage } from './pages/AdminPage'
import DeveloperPage from './pages/DeveloperPage'
import { useAuth } from './context/AuthContext'
import { GoogleAuthModal } from './components/GoogleAuthModal'
import { MyPassesModal } from './components/MyPassesModal'

// --- GLOBAL UX HOOKS ---
function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable <= 0) {
        setProgress(0)
        return
      }
      const scrolled = window.scrollY / scrollable
      setProgress(Math.min(1, Math.max(0, scrolled)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return progress
}
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActive('#' + e.target.id) })
    }, { rootMargin: '-30% 0px -30% 0px', threshold: 0 })
    ids.forEach(id => { const el = document.querySelector(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [ids])
  return active
}
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= breakpoint
  })
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const onChange = () => setIsMobile(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [breakpoint])
  return isMobile
}
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mql.matches)
    const onChange = () => setReduced(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return reduced
}
function ScrollDot({ progress, index, total }) {
  const scaleX = useTransform(progress, [index / total, (index + 1) / total], [0, 1])
  return <span className="w-8 h-1 rounded-full bg-white/10 overflow-hidden"><motion.span style={{ scaleX }} className="block h-full bg-[#CCFF00] origin-left" /></span>
}
function ProcessDot({ progress, index }) {
  const opacity = useTransform(progress, [index*0.25, index*0.25+0.15], [0.25, 1])
  const scale = useTransform(progress, [index*0.25, index*0.25+0.15], [0.9, 1])
  return <motion.div style={{ opacity, scale }} className="w-11 h-11 rounded-full bg-[#111] border border-white/10 grid place-items-center"><span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] shadow-[0_0_10px_#CCFF00]" /></motion.div>
}

// --- SIGNATURE MOTION PRIMITIVES ---
function useMarqueeSkew() {
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const smooth = useSpring(velocity, { stiffness: 140, damping: 42, mass: 0.6 })
  return useTransform(smooth, [-1500, 0, 1500], [-7, 0, 7], { clamp: true })
}

function KineticLine({ children, delay = 0, className = '' }) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span className="block will-change-transform" initial={{ y: '112%' }} animate={{ y: 0 }} transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1], delay }}>
        {children}
      </motion.span>
    </span>
  )
}

const SCRAMBLE_GLYPHS = '!<>-_[]{}=+*^?#01'
function ScrambleText({ text, className = '', duration = 850 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-30px' })
  const reduced = usePrefersReducedMotion()
  const [out, setOut] = useState(text)
  useEffect(() => {
    if (!inView || reduced) return
    let raf
    const start = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration)
      const settled = Math.floor(p * text.length)
      let s = ''
      for (let i = 0; i < text.length; i++) {
        s += (i < settled || text[i] === ' ') ? text[i] : SCRAMBLE_GLYPHS[(i * 7 + Math.floor(p * 26)) % SCRAMBLE_GLYPHS.length]
      }
      setOut(s)
      if (p < 1) raf = requestAnimationFrame(tick)
      else setOut(text)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduced, text, duration])
  return <span ref={ref} className={className}>{out}</span>
}

function FlipUnit({ k, value, hl = false }) {
  return (
    <div className="text-center">
      <div className="text-[9px] font-mono tracking-widest text-white/40 mb-1">{k}</div>
      <div className={`relative w-[50px] xs:w-14 sm:w-16 h-[50px] xs:h-14 sm:h-16 rounded-2xl border flex items-center justify-center overflow-hidden font-display font-black text-xl xs:text-2xl sm:text-3xl ${hl ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.4)]' : 'bg-white/5 border-white/10 text-white backdrop-blur'}`}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={value} initial={{ y: '-85%' }} animate={{ y: 0 }} exit={{ y: '85%' }} transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 grid place-items-center">{value}</motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}

// --- MOBILE FLOATING DOCK NAV (app-like quick jump + haptics) ---
function MobileDock() {
  const [visible, setVisible] = useState(false)
  const items = [
    { id: '#hero', label: 'Home', icon: Hexagon },
    { id: '#events', label: 'Events', icon: Calendar },
    { id: '#gallery', label: 'Archive', icon: ImageIcon },
    { id: '#team', label: 'Team', icon: Users },
    { id: '#contact', label: 'Contact', icon: Send },
  ]
  const active = useActiveSection(items.map(i => i.id))
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const go = (id) => {
    try { navigator.vibrate && navigator.vibrate(8) } catch {}
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <div className="fixed inset-x-0 z-40 lg:hidden flex justify-center pointer-events-none" style={{ bottom: 'max(14px, calc(env(safe-area-inset-bottom) + 10px))' }} aria-hidden={false}>
      <motion.nav
        initial={false}
        animate={{ y: visible ? 0 : 110, opacity: visible ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className="pointer-events-auto flex items-center gap-0.5 p-1.5 rounded-full bg-[#0C0C0E]/85 backdrop-blur-2xl border border-white/12 shadow-[0_16px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)]"
        aria-label="Quick navigation"
      >
        {items.map(it => {
          const Icon = it.icon
          const isActive = active === it.id
          return (
            <button key={it.id} onClick={() => go(it.id)} aria-label={it.label} aria-current={isActive ? 'page' : undefined} className={`relative w-11 h-11 rounded-full grid place-items-center transition-colors ${isActive ? 'bg-[#CCFF00] text-black shadow-[0_0_18px_rgba(204,255,0,0.5)]' : 'text-white/55 active:bg-white/10'}`}>
              <Icon className="w-[18px] h-[18px]" />
              {isActive && <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#CCFF00]" aria-hidden />}
            </button>
          )
        })}
        <span className="w-px h-6 bg-white/10 mx-0.5" aria-hidden />
        <button onClick={() => { try { navigator.vibrate && navigator.vibrate(8) } catch {} window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-label="Back to top" className="w-11 h-11 rounded-full grid place-items-center text-white/55 active:bg-white/10 transition-colors">
          <ArrowUp className="w-[18px] h-[18px]" />
        </button>
      </motion.nav>
    </div>
  )
}

// --- SPOTLIGHT ---
function Spotlight() {
  const ref = useRef(null)
  const isMobile = useIsMobile(1024)
  const reduced = usePrefersReducedMotion()
  useEffect(() => {
    if (isMobile || reduced) return
    const el = ref.current
    if (!el) return
    let raf = 0
    const onMove = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--x', e.clientX + 'px')
        el.style.setProperty('--y', e.clientY + 'px')
        el.classList.add('active')
      })
    }
    const onLeave = () => el.classList.remove('active')
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerleave', onLeave); cancelAnimationFrame(raf) }
  }, [isMobile, reduced])
  if (isMobile || reduced) return null
  return <div ref={ref} className="spotlight" aria-hidden />
}

// --- GLARE WRAPPER ---
function GlareCard({ children, className = '' }) {
  const ref = useRef(null)
  const isMobile = useIsMobile()
  const onMove = (e) => {
    if (isMobile) return
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const x = ((e.clientX - r.left) / r.width) * 100
    const y = ((e.clientY - r.top) / r.height) * 100
    ref.current.style.setProperty('--gx', x + '%')
    ref.current.style.setProperty('--gy', y + '%')
  }
  return <div ref={ref} onMouseMove={onMove} className={`glare-card ${className}`}>{children}</div>
}

// --- COMMAND PALETTE ---
function CommandPalette({ open, setOpen }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef(null)
  const items = [
    { id: '#hero', label: 'Overview — Hero & Silicon Core', icon: Hexagon, kbd: '0' },
    { id: '#stats', label: 'Department Telemetry — Metrics', icon: Activity, kbd: '1' },
    { id: '#about', label: 'Dual Council — SPACE × SINC', icon: Layers, kbd: '2' },
    { id: '#events', label: 'Events & Countdown — Registration', icon: Calendar, kbd: '3' },
    { id: '#gallery', label: 'Visual Archive — Labs & Hackathons', icon: ImageIcon, kbd: '4' },
    { id: '#achievements', label: 'Prestige — Patents & Awards', icon: Trophy, kbd: '5' },
    { id: '#faculty', label: 'Faculty — Advisors & Leadership', icon: BookOpen, kbd: '6' },
    { id: '#team', label: 'Team — 30 Leaders Command', icon: Users, kbd: '7' },
    { id: '#contact', label: 'Contact — Dispatch & Coordinates', icon: Send, kbd: '8' },
  ]
  const filtered = q.trim() ? items.filter(i => i.label.toLowerCase().includes(q.toLowerCase())) : items
  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 40); setSel(0); setQ('') }
  }, [open])
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => (s + 1) % filtered.length) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => (s - 1 + filtered.length) % filtered.length) }
      if (e.key === 'Enter') { const it = filtered[sel]; if (it) { setOpen(false); document.querySelector(it.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) } }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, filtered, sel, setOpen])
  if (!open) return null
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-start justify-center pt-[10vh] sm:pt-[18vh] p-4">
        <div className="absolute inset-0 bg-[#04060A]/70 cmd-backdrop" onClick={() => setOpen(false)} aria-hidden />
        <motion.div initial={{ y: 16, scale: 0.98, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 8, scale: 0.98, opacity: 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} className="relative w-full max-w-[640px] rounded-[24px] bg-[#0F0F0F] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="flex items-center gap-3 px-4 sm:px-5 h-[56px] border-b border-white/10">
            <Search className="w-4 h-4 text-white/40 shrink-0" aria-hidden />
            <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Jump to section…  (try 'patent' or 'team')" className="flex-1 bg-transparent outline-none text-[15px] sm:text-[14px] placeholder:text-white/30 text-white" aria-label="Command palette search" />
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-white/30 border border-white/10 rounded-full px-2.5 py-1">ESC</span>
          </div>
          <div data-lenis-prevent className="p-2 max-h-[50dvh] overflow-y-auto overscroll-contain">
            {filtered.length ? filtered.map((it, idx) => {
              const Icon = it.icon
              const active = idx === sel
              return (
                <button key={it.id} aria-selected={active} onMouseEnter={() => setSel(idx)} onClick={() => { setOpen(false); document.querySelector(it.id)?.scrollIntoView({ behavior: 'smooth' }) }} className="cmd-item w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-colors">
                  <span className={`w-9 h-9 rounded-xl grid place-items-center border shrink-0 ${active ? 'bg-black/10 border-black/15 text-black' : 'bg-white/5 border-white/10 text-white/70'}`}><Icon className="w-4 h-4" /></span>
                  <span className={`flex-1 text-sm font-medium leading-tight ${active ? 'text-black' : 'text-white'}`}>{it.label}</span>
                  <span className={`cmd-kbd hidden sm:inline-flex w-7 h-7 rounded-full border text-[11px] font-mono font-bold grid place-items-center shrink-0 ${active ? '' : 'bg-white/5 border-white/10 text-white/40'}`}>{it.kbd}</span>
                </button>
              )
            }) : <div className="py-10 text-center text-sm text-white/40">No matches for “{q}”</div>}
          </div>
          <div className="h-px bg-white/10" />
          <div className="px-4 py-2.5 flex items-center justify-between text-[11px] font-mono text-white/30">
            <span className="flex items-center gap-2"><Command className="w-3 h-3" /> + K to open • ↑↓ navigate • ↵ jump</span>
            <span className="hidden sm:inline">SPACE × SINC — PIET</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ==================== DATA FROM ORIGINAL WEBSITE (no code copied, only data) ====================
const HERO_CONFIG = {
  heroSession: 'SYS.2026-27',
  heroForumTitle: 'PIET ECE FORUM',
  flagshipBadge: 'Flagship Event Initialization',
  flagshipTitle: 'SPACE & SINC Installation',
  flagshipSubTitle: '& TARANG 2K26 Fiesta',
  flagshipDescription: 'The grand induction of the 2026-27 departmental executive council followed by the TARANG freshers tech gala. Join faculty advisors, alumni, and 500+ student engineers.',
  flagshipTargetDate: '2026-08-30T10:00:00',
  flagshipTargetVenue: 'PIET AUDITORIUM',
  flagshipButtonText: 'Register With Razorpay',
}

const STATS = [
  { index: '01', icon: Users, value: 1500, suffix: '+', label: 'Active Student Members', desc: 'Departmental undergrad & postgrad engineers across workshops.', color: '#CCFF00', tag: 'GROWTH +38%', percent: 94 },
  { index: '02', icon: Calendar, value: 80, suffix: '+', label: 'Events & Tech Symposia', desc: 'National hackathons, hardware exhibitions & flagship installs.', color: '#7000FF', tag: 'ANNUAL HIGH', percent: 88 },
  { index: '03', icon: Wrench, value: 45, suffix: '+', label: 'Hardware Workshops', desc: 'Silicon synthesis, PCB impedance routing & MCU bootcamps.', color: '#00D9FF', tag: 'HANDS-ON LABS', percent: 92 },
  { index: '04', icon: Cpu, value: 120, suffix: '+', label: 'Silicon & IoT Prototypes', desc: 'Autonomous rovers, LoRaWAN mesh grids & RISC-V edge cores.', color: '#CCFF00', tag: 'HARDWARE BUILDS', percent: 96 },
  { index: '05', icon: Award, value: 30, suffix: '+', label: 'Industry Mentors', desc: 'Global semiconductor leads & alumni tech researchers.', color: '#FF3B30', tag: 'TIER-1 SILICON', percent: 85 },
  { index: '06', icon: Trophy, value: 12, suffix: '+', label: 'National Championships', desc: 'Hackathon 1st prize victories & Indian Patents.', color: '#FFB800', tag: 'PATENT GRANTED', percent: 100 },
]

const EVENTS = [
  {
    id: 'evt-1',
    title: 'SPACE & SINC Forum Installation Ceremony',
    category: 'Installation',
    status: 'Upcoming',
    date: 'July 30, 2026',
    time: '10:00 AM IST',
    venue: 'PIET Auditorium',
    description: 'Official installation ceremony for SPACE & SINC departmental councils for session 2026-27.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80',
    badge: 'FLAGSHIP CEREMONY',
    price: 150,
    participationType: 'both',
  },
  {
    id: 'evt-2',
    title: 'TARANG 2K26 Freshers Gala & Tech Fiesta',
    category: 'Workshop',
    status: 'Upcoming',
    date: 'July 30, 2026',
    time: '10:30 AM IST',
    venue: 'PIET Auditorium',
    description: 'Annual welcoming fiesta and hardware ice-breaker for 2nd year electronics students.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&q=80',
    badge: 'FRESHERS CELEBRATION',
    price: 200,
    participationType: 'both',
  },
]

const GALLERY = [
  { id: 'ARCH-01', title: 'National Autonomous Robotics Expo', category: 'Project Expo', type: 'image', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80', caption: 'Autonomous LiDAR rover & obstacle-avoidance demo by 3rd year ECE team.' },
  { id: 'ARCH-02', title: 'SMT Micro-Soldering & 4-Layer PCB Lab', category: 'Workshop', type: 'image', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', caption: 'Students practicing surface mount micro-soldering on 4-layer boards.' },
  { id: 'ARCH-03', title: '24-Hour National Hardware Hackathon', category: 'Hackathon', type: 'image', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80', caption: '50+ teams hacking hardware prototypes round the clock.' },
  { id: 'ARCH-04', title: 'Semiconductor Fabrication Cleanroom Visit', category: 'Industrial Visit', type: 'image', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80', caption: 'Students observing silicon wafer photolithography.' },
  { id: 'ARCH-05', title: 'FPGA Verilog & RISC-V Synthesis Sprint', category: 'Workshop', type: 'image', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', caption: 'Designing custom 32-bit RISC-V cores on Xilinx Artix-7.' },
  { id: 'ARCH-06', title: 'IoT Drone Swarm & Telemetry Testing', category: 'Project Expo', type: 'image', url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80', caption: 'Outdoor field testing of multi-node LoRa mesh telemetry.' },
]

const ACHIEVEMENTS = [
  { index: '01', type: 'NATIONAL HACKATHON CHAMPION', title: '1st Prize — National Smart Hardware Expo', team: 'Autonomous Rover Wing', desc: 'Autonomous LiDAR search & rescue rover powered by RISC-V SoC won 1st prize among 120+ colleges.', metric: '₹1,00,000 Prize', icon: Trophy, color: '#FFB800' },
  { index: '02', type: 'INDIAN PATENT GRANTED', title: 'Govt Patent: Low-Power Edge IoT Mesh', team: 'ECE Research Cell', desc: 'Indian patent granted for an ultra-low power LoRaWAN mesh communication node.', metric: 'Patent No. 492026/IN', icon: FileCheck2, color: '#CCFF00' },
  { index: '03', type: 'INSTITUTIONAL HONOUR', title: 'Outstanding Student Chapter Award', team: 'Executive Council', desc: 'IEEE & IETE regional excellence award for hosting 45+ workshops and publications.', metric: 'Top 1% Chapter', icon: Award, color: '#7000FF' },
  { index: '04', type: 'SEMICONDUCTOR PLACEMENTS', title: 'Tier-1 Silicon Placements & Internships', team: 'Department Placement Cell', desc: 'Student leaders placed across Texas Instruments, Qualcomm, Intel, Cadence, Synopsys.', metric: '24 LPA Peak', icon: Briefcase, color: '#00D9FF' },
]

const FACULTY = [
  { code: 'FAC-01', name: 'Dr. A. P. Rathkanthiwar', designation: 'Professor & Head of Department', dept: 'Electronics & Communication Engineering', interests: ['VLSI Microelectronics', 'FPGA Architecture', 'Wireless Comm'], pubs: '28+ Years Exp · 48+ Publications', badge: 'HEAD OF DEPARTMENT', color: '#FFB800', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80' },
  { code: 'FAC-02', name: 'Dr. Sunita N Parihar', designation: 'Associate Professor & SPACE Incharge', dept: 'Electronics & Communication Engineering', interests: ['Embedded Systems', 'IoT Smart Grids', 'TinyML Sensors'], pubs: '20+ Years Exp · 28+ Publications', badge: 'SPACE INCHARGE', color: '#CCFF00', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80' },
  { code: 'FAC-03', name: 'Ms. V. V. Shirpurkar', designation: 'Assistant Professor & SINC Incharge', dept: 'Electronics & Communication Engineering', interests: ['Autonomous Robotics', 'ROS 2', 'LiDAR Kinematics'], pubs: '15+ Years Exp · 12+ Publications', badge: 'SINC INCHARGE', color: '#7000FF', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80' },
]

const TEAM = [
  { name: 'Rohan Virutkar', role: 'President SPACE', cat: 'Executive Council', council: 'SPACE', year: '4th Year ECE', image: '/team_images/rohit.webp', email: 'rohan.v@ece-elevate.org', quote: 'Driving innovation through hands-on silicon design, embedded systems, and teamwork.', specialty: 'Strategic Council Governance & VLSI Prototyping' },
  { name: 'Makarand Bahmane', role: 'President SINC', cat: 'Executive Council', council: 'SINC', year: '4th Year ECE', image: '/team_images/makrand.webp', email: 'makarand.b@ece-elevate.org', quote: 'Bridging classroom theory with industry-grade prototyping and robotics innovation.', specialty: 'Autonomous Systems & Hardware Prototyping' },
  { name: 'Samyak Belsare', role: 'Vice President SPACE', cat: 'Executive Council', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/samyak.webp', email: 'samyak.b@ece-elevate.org', quote: 'Empowering students to publish research papers and dominate hackathons.', specialty: 'Research Publications & IEEE Chapters' },
  { name: 'Atharva Kalbande', role: 'Vice President SPACE', cat: 'Executive Council', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/atharva.webp', email: 'atharva.k@ece-elevate.org', quote: 'Building inclusive technical wings for robotics and edge intelligence.', specialty: 'Technical Wing Operations' },
  { name: 'Siddhesh Bhandare', role: 'Vice President SINC', cat: 'Executive Council', council: 'SINC', year: '3rd Year ECE', image: '/team_images/siddhesh.webp', email: 'siddhesh.b@ece-elevate.org', quote: 'Architecting ROS 2 autonomous rovers, LiDAR sensors, and FPGA cores.', specialty: 'ROS 2 Robotics & Firmware' },
  { name: 'Saloni Gajghate', role: 'Secretary SPACE', cat: 'Executive Council', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/saloni.webp', email: 'saloni.g@ece-elevate.org', quote: 'Creating futuristic UI visuals, documentation, and brand identities.', specialty: 'Brand Identity & Admin' },
  { name: 'Vinay Masurkar', role: 'Joint Secretary SPACE', cat: 'Executive Council', council: 'SPACE', year: '2nd Year ECE', image: '/team_images/vinay.webp', email: 'vinay.m@ece-elevate.org', quote: 'Orchestrating smooth logistics and hospitality for 1000+ attendee hackathons.', specialty: 'Event Operations & External Relations' },
  { name: 'Varun Gaikwad', role: 'Joint Secretary SINC', cat: 'Executive Council', council: 'SINC', year: '2nd Year ECE', image: '/team_images/varun.webp', email: 'varun.g@ece-elevate.org', quote: 'Managing technical communications, member onboarding, and community engagement.', specialty: 'Community Growth & Hackathon Mgmt' },
  { name: 'Priyanshi Nikule', role: 'Treasurer SPACE', cat: 'Executive Council', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/priyanshi.webp', email: 'priyanshi.n@ece-elevate.org', quote: 'Building embedded IoT solutions and fiscal transparency.', specialty: 'Financial Budgeting' },
  { name: 'Anushka Madankar', role: 'Treasurer SINC', cat: 'Design & Media', council: 'SINC', year: '3rd Year ECE', image: '/team_images/anushka.webp', email: 'anushka.m@ece-elevate.org', quote: 'Designing slick UI themes, event marketing banners, and visual media.', specialty: 'Graphic Design & Visual Identity' },
  { name: 'Arju Pardhi', role: 'Joint Treasurer SPACE', cat: 'Event Management', council: 'SPACE', year: '2nd Year ECE', image: '/team_images/arju.webp', email: 'arju.p@ece-elevate.org', quote: 'Managing venue operations and guest speaker coordination.', specialty: 'Logistics & Guest Coordination' },
  { name: 'Vedanti Ramteke', role: 'Joint Treasurer SINC', cat: 'Design & Media', council: 'SINC', year: '2nd Year ECE', image: '/team_images/vedanti.webp', email: 'vedanti.r@ece-elevate.org', quote: 'Connecting forum community across digital channels.', specialty: 'Social Media' },
  { name: 'Himanshu Hirankhede', role: 'Technical Incharge SINC', cat: 'Technical Leads', council: 'SINC', year: '3rd Year ECE', image: '/team_images/himanshu.webp', email: 'himanshu.h@ece-elevate.org', quote: 'Leading autonomous drone flight controllers and rover projects.', specialty: 'UAV Flight Controllers' },
  { name: 'Abhishek Kahate', role: 'Technical Co-Incharge SINC', cat: 'Technical Leads', council: 'SINC', year: '2nd Year ECE', image: 'https://i.pravatar.cc/300?img=32', email: 'abhishek.k@ece-elevate.org', quote: 'Developing high-performance web platforms and digital forum experiences.', specialty: 'Full-Stack Web Architecture' },
  { name: 'Shreya Rathi', role: 'Technical Co-Incharge SINC', cat: 'Technical Leads', council: 'SINC', year: '2nd Year ECE', image: '/team_images/shreya.webp', email: 'shreya.r@ece-elevate.org', quote: 'Facilitating hands-on microcontroller and VLSI bootcamps.', specialty: 'MCU Bootcamps' },
  { name: 'Pranjali Chopde', role: 'Cultural Incharge SPACE', cat: 'Event Management', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/pranjali.webp', email: 'pranjali.c@ece-elevate.org', quote: 'Organizing engaging cultural events and welcoming freshers.', specialty: 'Freshers Gala' },
  { name: 'Sadiksha Saonerkar', role: 'Cultural Incharge SPACE', cat: 'Event Management', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/sadiksha.webp', email: 'sadiksha.s@ece-elevate.org', quote: 'Securing industry partnerships, campus networking, and sponsorships.', specialty: 'Industry Sponsorships' },
  { name: 'Aditi Sharma', role: 'Cultural Incharge SPACE', cat: 'Event Management', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/aditi.webp', email: 'aditi.s@ece-elevate.org', quote: 'Creating vibrant campus engagements and collaborative forums.', specialty: 'Event Staging & Engagement' },
  { name: 'Vibhanshu Tiwari', role: 'Cultural Co-Incharge SPACE', cat: 'Event Management', council: 'SPACE', year: '2nd Year ECE', image: '/team_images/vibhanshu.webp', email: 'vibhanshu.t@ece-elevate.org', quote: 'Managing student outreach, stage presentations, and showcases.', specialty: 'Stage Operations' },
  { name: 'Amruta Wankhede', role: 'Sports Incharge SPACE', cat: 'Event Management', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/amruta.webp', email: 'amruta.w@ece-elevate.org', quote: 'Promoting athletic excellence and departmental tournaments.', specialty: 'Athletics & Tournaments' },
  { name: 'Mohit Kumar', role: 'Sports Incharge SPACE', cat: 'Event Management', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/mohit.webp', email: 'mohit.k@ece-elevate.org', quote: 'Organizing inter-branch leagues, cricket championships, and team building.', specialty: 'Sports League Operations' },
  { name: 'Yash Baghele', role: 'Sports Co-Incharge SPACE', cat: 'Event Management', council: 'SPACE', year: '2nd Year ECE', image: '/team_images/yash.webp', email: 'yash.b@ece-elevate.org', quote: 'Leading sports coordination and wellness initiatives.', specialty: 'Tournament Coordination' },
  { name: 'Aditya Bobade', role: 'Media Incharge SPACE', cat: 'Design & Media', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/aditya.webp', email: 'aditya.b@ece-elevate.org', quote: 'Directing cinematic photography, videography, and event recaps.', specialty: 'Cinematography' },
  { name: 'Mahesh Hedau', role: 'Media Incharge SPACE', cat: 'Design & Media', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/mahesh.webp', email: 'mahesh.h@ece-elevate.org', quote: 'Producing digital multimedia and high-impact promotions.', specialty: 'Digital Media Production' },
  { name: 'Avishkar Nimbekar', role: 'Media Co-Incharge SPACE', cat: 'Design & Media', council: 'SPACE', year: '2nd Year ECE', image: '/team_images/avishkar.webp', email: 'avishkar.n@ece-elevate.org', quote: 'Creating motion graphics, highlight reels, and teasers.', specialty: 'Motion Graphics & Video Editing' },
  { name: 'Tejas Shahare', role: 'Social Incharge SPACE', cat: 'Design & Media', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/tejas.webp', email: 'tejas.s@ece-elevate.org', quote: 'Growing social media engagement and community.', specialty: 'Social Strategy' },
  { name: 'Niharika Kamble', role: 'Social Co-Incharge SPACE', cat: 'Design & Media', council: 'SPACE', year: '2nd Year ECE', image: 'https://i.pravatar.cc/300?img=27', email: 'niharika.k@ece-elevate.org', quote: 'Connecting with alumni networks and sharing breakthroughs.', specialty: 'Alumni Relations' },
  { name: 'Mrunal Bankar', role: 'Magazine Incharge SPACE', cat: 'Design & Media', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/mrunal.webp', email: 'mrunal.b@ece-elevate.org', quote: 'Publishing the annual technical magazine "ELEKTRONIKOS".', specialty: 'Print Editorial' },
  { name: 'Pallavi Chattes', role: 'Magazine Incharge SPACE', cat: 'Design & Media', council: 'SPACE', year: '3rd Year ECE', image: '/team_images/pallavi.webp', email: 'pallavi.c@ece-elevate.org', quote: 'Curating student research papers, technical articles, and faculty interviews.', specialty: 'Research Paper Curation' },
  { name: 'Tanhvi Shanware', role: 'Magazine Co-Incharge SPACE', cat: 'Design & Media', council: 'SPACE', year: '2nd Year ECE', image: '/team_images/tanvi.webp', email: 'tanvi.s@ece-elevate.org', quote: 'Editorial lead for departmental publications and news digests.', specialty: 'Editorial Review' },
]

// --- TOAST SYSTEM ---
const ToastContext = useMemo ? null : null // placeholder to avoid unused
function ToastProvider({ children, toasts, setToasts }) {
  return children
}
function GlobalToast({ toasts }) {
  return (
    <div className="fixed left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[100] space-y-2 pointer-events-none" style={{ bottom: 'max(16px, env(safe-area-inset-bottom))' }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className={`pointer-events-auto px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] flex items-start gap-3 text-sm ${t.type === 'success' ? 'bg-[#0F1A0F] border-[#00FF88]/30 text-white' : t.type === 'error' ? 'bg-[#1A0F0F] border-[#FF3B30]/30 text-white' : 'bg-[#111] border-white/10 text-white'}`}>
            <span className={`mt-0.5 w-7 h-7 rounded-full grid place-items-center shrink-0 ${t.type === 'success' ? 'bg-[#00FF88] text-black' : 'bg-[#CCFF00] text-black'}`}>{t.type === 'success' ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}</span>
            <div className="flex-1 leading-snug"><div className="font-bold text-[13px]">{t.title}</div><div className="text-xs text-white/60">{t.msg}</div></div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// --- MAGNETIC + TILT ---
function MagneticButton({ children, className = '', strength = 0.28, ...props }) {
  const ref = useRef(null)
  const x = useMotionValue(0), y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 220, damping: 18 }), springY = useSpring(y, { stiffness: 220, damping: 18 })
  const onMove = (e) => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    x.set(dx * strength); y.set(dy * strength)
  }
  const onLeave = () => { x.set(0); y.set(0) }
  return (
    <motion.button ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ x: springX, y: springY }} className={`magnetic will-change-transform ${className}`} {...props}>
      {children}
    </motion.button>
  )
}
function TiltCard({ children, className = '', intensity = 10, disabledOnMobile = true }) {
  const ref = useRef(null)
  const isMobile = useIsMobile()
  const [style, setStyle] = useState({})
  if (disabledOnMobile && isMobile) return <div className={className}>{children}</div>
  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setStyle({ transform: `perspective(900px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) translateZ(0)` })
  }
  const onLeave = () => setStyle({ transform: 'perspective(900px) rotateY(0) rotateX(0)' })
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={style} className={`${className} transition-transform duration-200 will-change-transform`}>{children}</div>
}

// --- SCROLL PROGRESS ---
function ScrollProgressBar() {
  const progress = useScrollProgress()
  return (
    <div className="scroll-progress" aria-hidden>
      <motion.div className="scroll-progress-bar" style={{ scaleX: progress }} />
    </div>
  )
}
function ScrollToTopFab() {
  const [visible, setVisible] = useState(false)
  const progress = useScrollProgress()
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  if (!visible) return null
  const circumference = 2 * Math.PI * 18
  const offset = circumference - progress * circumference
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="fixed z-40 w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-full bg-[#CCFF00] text-black grid place-items-center shadow-[0_10px_30px_rgba(204,255,0,0.35)] hover:scale-105 active:scale-95 transition-transform max-lg:hidden glow-pulse"
      style={{ bottom: 'max(16px, env(safe-area-inset-bottom))', right: 'max(16px, env(safe-area-inset-right))' }}
    >
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="2.5" />
        <circle cx="22" cy="22" r="18" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.15s linear' }} />
      </svg>
      <ArrowUp className="w-5 h-5 relative z-10" />
    </motion.button>
  )
}

// --- 3D (mobile-optimized) ---
function FloatingShape() {
  const meshRef = useRef()
  const isMobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  useFrame((state) => {
    if (reduced) return
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * (isMobile ? 0.08 : 0.15)
      meshRef.current.rotation.y = state.clock.elapsedTime * (isMobile ? 0.12 : 0.22)
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * (isMobile ? 0.15 : 0.25)
    }
  })
  if (reduced) return null
  return (
    <Float speed={isMobile ? 0.8 : 1.5} rotationIntensity={isMobile ? 0.4 : 0.8} floatIntensity={isMobile ? 0.8 : 1.5}>
      <mesh ref={meshRef} scale={isMobile ? 1.25 : 1.7}>
        <torusKnotGeometry args={[1, 0.28, isMobile ? 48 : 128, isMobile ? 12 : 32]} />
        <MeshDistortMaterial color="#CCFF00" roughness={0.08} metalness={0.95} distort={isMobile ? 0.2 : 0.35} speed={isMobile ? 1.2 : 1.8} emissive="#CCFF00" emissiveIntensity={0.15} />
      </mesh>
    </Float>
  )
}
function ParticleField() {
  const pointsRef = useRef()
  const isMobile = useIsMobile()
  const reduced = usePrefersReducedMotion()
  const count = isMobile ? 250 : 1600
  const particles = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) { arr[i * 3] = (Math.random() - 0.5) * 22; arr[i * 3 + 1] = (Math.random() - 0.5) * 22; arr[i * 3 + 2] = (Math.random() - 0.5) * 22 }
    return arr
  }, [count])
  useFrame((state) => { if (reduced) return; if (pointsRef.current) { pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015; pointsRef.current.rotation.x = state.clock.elapsedTime * 0.008 } })
  if (reduced) return null
  return (
    <points ref={pointsRef}>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={particles} itemSize={3} /></bufferGeometry>
      <pointsMaterial size={isMobile ? 0.025 : 0.018} color="#7000FF" sizeAttenuation transparent opacity={isMobile ? 0.4 : 0.55} />
    </points>
  )
}

// --- PRELOADER ---
function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); setTimeout(onComplete, 500); return 100 }
        return p + Math.random() * 13
      })
    }, 70)
    return () => clearInterval(interval)
  }, [onComplete])
  return (
    <motion.div initial={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }} className="fixed inset-0 z-[999] bg-[#08080A] flex flex-col items-center justify-center">
      <div className="absolute inset-0 overflow-hidden opacity-[0.07]">
        <div className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, #CCFF00 40px, #CCFF00 41px)` }} />
      </div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] tracking-[0.4em] text-white/40 font-mono mb-6">PIET ECE FORUM — SPACE × SINC</motion.p>
      <div className="relative">
        <h1 className="text-[14vw] font-display font-800 leading-none tracking-tighter flex">
          <span className="text-white">{Math.floor(Math.min(progress, 100))}</span><span className="text-stroke-lime">%</span>
        </h1>
        <motion.div className="h-[2px] bg-[#CCFF00] mt-4 origin-left" style={{ width: `${Math.min(progress, 100)}%` }} />
        <p className="text-center text-[10px] tracking-[0.3em] text-white/30 font-mono mt-3">ARCHITECTING TOMORROW&apos;S SILICON</p>
      </div>
      <div className="absolute bottom-8 left-6 right-6 flex justify-between text-[10px] tracking-widest text-white/30 font-mono">
        <span>©2026 / SPACE & SINC — PIET NAGPUR</span><span>LOADING FORUM EXPERIENCE</span>
      </div>
    </motion.div>
  )
}

// --- CURSOR (disabled on touch / reduced motion / mobile) ---
function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isLight, setIsLight] = useState(false)
  const mouseX = useMotionValue(0), mouseY = useMotionValue(0)
  const cursorX = useSpring(mouseX, { damping: 25, stiffness: 300 }), cursorY = useSpring(mouseY, { damping: 25, stiffness: 300 })
  const isMobile = useIsMobile(1024)
  const reduced = usePrefersReducedMotion()
  useEffect(() => {
    if (isMobile || reduced) return
    const handleMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY }); mouseX.set(e.clientX); mouseY.set(e.clientY)
      const overLight = !!e.target.closest('#about')
      setIsLight(overLight)
    }
    const handleEnter = (e) => { if (e.target.closest('a, button, [data-cursor]')) setIsHovering(true) }
    const handleLeave = (e) => { if (e.target.closest('a, button, [data-cursor]')) setIsHovering(false) }
    window.addEventListener('mousemove', handleMove); document.addEventListener('mouseover', handleEnter); document.addEventListener('mouseout', handleLeave)
    return () => { window.removeEventListener('mousemove', handleMove); document.removeEventListener('mouseover', handleEnter); document.removeEventListener('mouseout', handleLeave) }
  }, [isMobile, reduced])
  if (isMobile || reduced) return null
  return (
    <>
      <motion.div className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999] hidden lg:block mix-blend-difference" style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%', backgroundColor: isLight ? '#0A0A0A' : '#CCFF00' }} />
      <motion.div className="fixed top-0 left-0 border rounded-full pointer-events-none z-[9999] hidden lg:block" animate={{ x: mousePos.x - 20, y: mousePos.y - 20, scale: isHovering ? 1.6 : 1, backgroundColor: isHovering ? (isLight ? 'rgba(10,10,10,0.08)' : 'rgba(204,255,0,0.08)') : 'transparent', borderColor: isHovering ? (isLight ? 'rgba(10,10,10,0.35)' : 'rgba(204,255,0,0.5)') : isLight ? 'rgba(10,10,10,0.18)' : 'rgba(255,255,255,0.18)' }} transition={{ type: 'spring', damping: 20, stiffness: 200 }} style={{ width: 40, height: 40 }} />
    </>
  )
}

// --- NAVBAR (scrollspy + magnetic CTA + mobile sheet + Google Auth) ---
function Navbar({ onToast, onOpenGoogleAuth, onOpenMyPasses, onOpenAdmin, isAuthenticated, user, onLogout }) {
  const [scrolled, setScrolled] = useState(false), [menuOpen, setMenuOpen] = useState(false)
  const links = [
    { label: 'Overview', href: '#hero', num: '00' },
    { label: 'About', href: '#about', num: '01' },
    { label: 'Events', href: '#events', num: '02' },
    { label: 'Archive', href: '#gallery', num: '03' },
    { label: 'Prestige', href: '#achievements', num: '04' },
    { label: 'Faculty', href: '#faculty', num: '05' },
    { label: 'Team', href: '#team', num: '06' },
    { label: 'Contact', href: '#contact', num: '07' },
  ]
  const active = useActiveSection(links.map(l => l.href))
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 40); window.addEventListener('scroll', onScroll, { passive: true }); return () => window.removeEventListener('scroll', onScroll) }, [])
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
      if (!e.ctrlKey && !e.metaKey && /^[0-7]$/.test(e.key)) {
        const idx = parseInt(e.key); if (links[idx]) { e.preventDefault(); document.querySelector(links[idx].href)?.scrollIntoView({ behavior: 'smooth' }) }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => { document.body.style.overflow = menuOpen ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [menuOpen])
  return (
    <>
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ delay: 0.4, duration: 0.8, ease: [0.76, 0, 0.24, 1] }} className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 transition-all duration-500 ${scrolled ? 'bg-[#08080A]/85 backdrop-blur-2xl py-3 border-b border-white/[0.06]' : 'bg-transparent'}`}>
        <div className="flex items-center gap-6">
          <a href="#hero" className="flex items-center gap-2.5 group">
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
              <div className="w-8 h-8 rounded-xl bg-black border border-amber-500/30 p-1 flex items-center justify-center"><img src="/space_logo.png" alt="SPACE" className="w-full h-full object-contain" /></div>
              <span className="text-white/30 text-[9px]">×</span>
              <div className="w-8 h-8 rounded-xl bg-black border border-[#CCFF00]/30 p-1 flex items-center justify-center"><img src="/sinc_logo.png" alt="SINC" className="w-full h-full object-contain" /></div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 leading-none"><span className="font-display font-black text-[15px] tracking-tight">ECE FORUM</span><span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#CCFF00] text-black font-black">2026-27</span></div>
              <span className="text-[10px] font-mono text-white/40 tracking-widest">PIET • SPACE × SINC</span>
            </div>
          </a>
          <nav className="hidden xl:flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur" aria-label="Primary">
            {links.map(l => {
              const isActive = active === l.href
              return <a key={l.label} href={l.href} aria-current={isActive ? 'page' : undefined} className={`px-3 py-1.5 rounded-xl text-[11px] font-mono tracking-widest flex items-center gap-1.5 transition-all ${isActive ? 'bg-white text-black font-black shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'}`}><span className={`text-[9px] ${isActive ? 'text-black/50' : 'text-[#CCFF00]/60'}`}>{l.num}</span>{l.label.toUpperCase()}</a>
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onOpenMyPasses} className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono font-bold text-white/70 hover:text-white hover:bg-white/10 hover:border-white/15 transition-colors min-h-[44px]">
            <Ticket className="w-3.5 h-3.5 text-[#CCFF00]" /> MY PASSES
          </button>
          <button onClick={onOpenAdmin} className="hidden xl:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono font-bold text-white/60 hover:text-white hover:bg-white/10 transition-colors min-h-[44px]" title="Admin Console">
            <Shield className="w-3.5 h-3.5 text-[#FFB800]" /> ADMIN
          </button>
          {isAuthenticated && user ? (
            <div className="hidden md:flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-white/5 border border-white/10">
              <img src={user.photoURL || `https://i.pravatar.cc/100?u=${encodeURIComponent(user.email)}`} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-white/10" />
              <span className="text-xs font-bold max-w-[90px] truncate hidden lg:inline">{user.name.split(' ')[0]}</span>
              <button onClick={onLogout} className="w-7 h-7 rounded-full bg-white/10 grid place-items-center hover:bg-white hover:text-black transition-colors" title="Sign out"><X className="w-3 h-3" /></button>
            </div>
          ) : (
            <button onClick={onOpenGoogleAuth} className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-black font-black text-xs hover:bg-[#CCFF00] transition-colors min-h-[44px]">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
              GOOGLE LOGIN
            </button>
          )}
          <MagneticButton className="hidden xl:inline-flex items-center gap-2 bg-[#CCFF00] text-black px-5 py-2.5 rounded-full text-[12px] font-black tracking-wide hover:bg-white transition-colors min-h-[44px]" onClick={() => document.querySelector('#events')?.scrollIntoView({ behavior: 'smooth' })} aria-label="Register for events">
            REGISTER NOW <span className="w-6 h-6 rounded-full bg-black text-white grid place-items-center text-xs" aria-hidden>↗</span>
          </MagneticButton>
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-menu" className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/10 backdrop-blur border border-white/10 grid place-items-center xl:hidden active:scale-95 transition-transform">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-white/40" aria-live="polite">
            <span className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse" aria-hidden /> 1,500+ MEMBERS
          </div>
        </div>
      </motion.nav>
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden" aria-hidden />
            <motion.div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ ease: [0.76, 0, 0.24, 1], duration: 0.45 }} className="fixed inset-y-0 right-0 w-[84%] max-w-[360px] z-50 bg-[#0a0a0a] border-l border-white/10 p-6 pt-20 xl:hidden flex flex-col overflow-y-auto overscroll-contain" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
              <div className="flex-1 flex flex-col gap-1">
                {links.map(l => {
                  const isActive = active === l.href
                  return <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className={`flex justify-between items-center py-4 px-4 rounded-2xl text-[15px] font-bold tracking-tight min-h-[52px] ${isActive ? 'bg-[#CCFF00] text-black' : 'bg-white/[0.04] border border-white/10 text-white hover:bg-white/10'}`}>{l.label} <span className={`text-xs font-mono px-2 py-1 rounded-full ${isActive ? 'bg-black text-white' : 'bg-white/10 text-white/60'}`}>{l.num}</span></a>
                })}
              </div>
              <div className="mt-6 space-y-3">
                {isAuthenticated && user ? (
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <img src={user.photoURL || `https://i.pravatar.cc/100?u=${encodeURIComponent(user.email)}`} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                    <div className="flex-1 min-w-0"><div className="font-bold text-sm truncate">{user.name}</div><div className="text-xs text-white/50 truncate">{user.email}</div></div>
                    <button onClick={()=>{ onLogout(); setMenuOpen(false)}} className="px-3 py-2 rounded-full bg-white/10 text-xs font-bold hover:bg-white hover:text-black transition-colors">Logout</button>
                  </div>
                ) : (
                  <button onClick={()=>{ setMenuOpen(false); onOpenGoogleAuth()}} className="w-full flex items-center justify-center gap-2 bg-white text-black py-4 rounded-2xl text-[15px] font-black min-h-[52px] active:scale-[0.98] transition-transform">
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                    Continue with Google
                  </button>
                )}
                <button onClick={()=>{ setMenuOpen(false); onOpenMyPasses()}} className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white py-3 rounded-2xl text-[14px] font-bold min-h-[52px]"><Ticket className="w-4 h-4 text-[#CCFF00]" /> MY PASSES</button>
                <button onClick={()=>{ setMenuOpen(false); onOpenAdmin()}} className="w-full flex items-center justify-center gap-2 bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] py-3 rounded-2xl text-[14px] font-bold min-h-[52px]"><Shield className="w-4 h-4" /> ADMIN CONSOLE</button>
                <a href="#events" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 bg-[#CCFF00] text-black py-4 rounded-2xl text-[15px] font-black min-h-[52px] active:scale-[0.98] transition-transform">REGISTER NOW <span className="w-7 h-7 rounded-full bg-black text-white grid place-items-center">↗</span></a>
                <p className="text-center text-[11px] font-mono tracking-widest text-white/30 pt-1">PIET NAGPUR • PRESS 0-6 TO JUMP</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// --- HERO (mobile-optimized + typewriter + magnetic CTA) ---
function useTypewriter(text, speed = 35, startDelay = 600) {
  const [display, setDisplay] = useState('')
  const reduced = usePrefersReducedMotion()
  useEffect(() => {
    if (reduced) { setDisplay(text); return }
    let i = 0, t
    const start = setTimeout(() => {
      t = setInterval(() => {
        i++; setDisplay(text.slice(0, i))
        if (i >= text.length) clearInterval(t)
      }, speed)
    }, startDelay)
    return () => { clearTimeout(start); clearInterval(t) }
  }, [text, speed, startDelay, reduced])
  return display
}
function Hero({ onToast, heroConfig: propHero, announcement: propAnn }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]), opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const [liveTime, setLiveTime] = useState('')
  const typedLine = useTypewriter("Tomorrow's", 60, 900)
  const heroConfig = propHero || HERO_CONFIG
  const topAnn = propAnn || null
  useEffect(() => {
    const upd = () => setLiveTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }))
    upd(); const t = setInterval(upd, 1000); return () => clearInterval(t)
  }, [])
  const reduced = usePrefersReducedMotion()
  const isMobile = useIsMobile()
  const marqueeSkew = useMarqueeSkew()
  return (
    <section ref={ref} id="hero" className="relative min-h-[88svh] sm:min-h-[92svh] overflow-hidden bg-[#08080A] flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* 3D BG - hidden on very small or reduced motion, dpr capped */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, isMobile ? 1 : 1.75]} gl={{ antialias: !isMobile, powerPreference: isMobile ? 'low-power' : 'high-performance' }} className="!absolute inset-0 pointer-events-none">
          <ambientLight intensity={0.5} /><directionalLight position={[5, 5, 5]} intensity={1} /><pointLight position={[-5, -5, -5]} color="#7000FF" intensity={2} />
          <ParticleField /><FloatingShape /><Environment preset="city" />
        </Canvas>
        <div className="absolute inset-0 bg-gradient-to-b from-[#08080A]/10 via-transparent to-[#08080A]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_#08080A_78%)]" />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: isMobile ? '60px 60px' : '80px 80px' }} />
      {/* Kinetic orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="hero-orb w-[520px] h-[520px] bg-[#CCFF00]/18 -top-32 -left-32" />
        <div className="hero-orb w-[720px] h-[720px] bg-[#7000FF]/14 top-1/2 -right-48" />
        <div className="hero-orb w-[600px] h-[600px] bg-[#00D9FF]/10 bottom-0 left-1/3" />
      </div>

      <motion.div style={reduced ? {} : { y, opacity }} className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 pb-6 sm:pb-8 max-w-[1600px] mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-wrap items-center gap-2 sm:gap-3 mb-5 sm:mb-6 text-[11px] font-mono">
          <span className="px-3 py-2 sm:py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur flex items-center gap-2 text-white/70 min-h-[36px]">
            <span className="w-2 h-2 bg-[#CCFF00] rounded-full animate-ping" aria-hidden /> {heroConfig.heroSession} • {heroConfig.heroForumTitle}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-full bg-black/40 border border-white/10 text-white/50 min-h-[36px]"><Clock className="w-3 h-3 text-[#CCFF00]" aria-hidden /> IST <strong className="text-white">{liveTime}</strong></span>
          <span className="px-3 py-2 sm:py-1.5 rounded-full bg-[#CCFF00] text-black font-black tracking-widest text-[10px] min-h-[36px] flex items-center">1,500+ STUDENTS</span>
        </motion.div>

        <div className="max-w-4xl">
          <div className="min-w-0">
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="font-display font-[800] leading-[0.88] tracking-[-0.04em] text-[9.6vw] xs:text-[10vw] sm:text-[9vw] lg:text-[68px] xl:text-[80px]">
              <KineticLine delay={0.2} className="text-white">Architecting</KineticLine>
              <span className="block text-gradient-animate min-h-[1.1em]" aria-label="Tomorrow's">{typedLine}<span className="inline-block w-[3px] h-[0.85em] bg-[#CCFF00] ml-1 animate-pulse align-middle" aria-hidden /></span>
              <KineticLine delay={0.34} className="text-stroke">Silicon &amp;</KineticLine>
              <KineticLine delay={0.48} className="text-white"><span className="flex flex-wrap items-center gap-3 sm:gap-4">Systems. <span className="hidden sm:inline-flex w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-[#CCFF00]/40 items-center justify-center text-[8px] sm:text-[9px] font-mono text-white/50 shrink-0" aria-hidden>● SCROLL</span></span></KineticLine>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-3 sm:mt-4 text-[15px] sm:text-[16px] md:text-[17px] leading-relaxed text-white/65 max-w-[560px] text-pretty">
              Advancing <span className="text-white font-semibold">hardware prototyping, autonomous robotics, VLSI design, and edge intelligence</span> at PIET — where SPACE & SINC build tomorrow&apos;s engineers.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="flex flex-wrap gap-2 mt-4 sm:mt-5">
              {[
                { icon: Cpu, label: 'VLSI Silicon', c: 'border-[#CCFF00]/30 text-[#CCFF00]' },
                { icon: Bot, label: 'Robotics', c: 'border-[#7000FF]/30 text-[#7000FF]' },
                { icon: Radio, label: 'IoT & LoRaWAN', c: 'border-[#FFB800]/30 text-[#FFB800]' },
                { icon: Brain, label: 'Edge AI', c: 'border-[#00D9FF]/30 text-[#00D9FF]' },
              ].map(p => <span key={p.label} className={`inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl bg-white/[0.04] border ${p.c} text-[11px] font-mono font-bold tracking-wide backdrop-blur min-h-[36px]`}><p.icon className="w-3.5 h-3.5" aria-hidden />{p.label}</span>)}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-3 max-w-[460px] mt-5 sm:mt-6">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-amber-500/20 backdrop-blur hover:border-amber-400/40 transition-colors min-h-[64px]">
                <div className="w-11 h-11 rounded-xl bg-black border border-amber-500/30 p-1.5 flex items-center justify-center shrink-0"><img src="/space_logo.png" alt="SPACE forum logo" className="w-full h-full object-contain" loading="lazy" decoding="async" /></div>
                <div className="min-w-0"><div className="font-display font-black text-xs leading-none truncate">SPACE FORUM</div><div className="text-[10px] font-mono text-white/50 truncate">Academic & Research</div></div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-[#CCFF00]/20 backdrop-blur hover:border-[#CCFF00]/40 transition-colors min-h-[64px]">
                <div className="w-11 h-11 rounded-xl bg-black border border-[#CCFF00]/30 p-1.5 flex items-center justify-center shrink-0"><img src="/sinc_logo.png" alt="SINC council logo" className="w-full h-full object-contain" loading="lazy" decoding="async" /></div>
                <div className="min-w-0"><div className="font-display font-black text-xs leading-none truncate">SINC COUNCIL</div><div className="text-[10px] font-mono text-white/50 truncate">Innovation & Prototyping</div></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="flex flex-col sm:flex-row gap-3 mt-5 sm:mt-6">
              <MagneticButton onClick={() => document.querySelector('#events')?.scrollIntoView({ behavior: 'smooth' })} className="btn-sheen inline-flex items-center justify-center gap-2 bg-[#CCFF00] text-black px-7 py-3.5 sm:py-3 rounded-full font-black text-[14px] sm:text-[13px] tracking-wide hover:bg-white transition-colors shadow-[0_0_30px_rgba(204,255,0,0.35)] min-h-[52px] sm:min-h-[48px] w-full sm:w-auto">
                <Zap className="w-4 h-4" aria-hidden /> Explore Events <ChevronRight className="w-4 h-4" aria-hidden />
              </MagneticButton>
              <a href="#about" className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur border border-white/15 text-white px-7 py-3.5 sm:py-3 rounded-full font-bold text-[14px] sm:text-[13px] hover:bg-white hover:text-black transition-colors min-h-[52px] sm:min-h-[48px] w-full sm:w-auto">
                <Terminal className="w-4 h-4 text-[#CCFF00]" aria-hidden /> About Forum <ArrowRight className="w-3.5 h-3.5" aria-hidden />
              </a>
            </motion.div>
            <div className="flex flex-wrap gap-4 text-[11px] font-mono text-white/40 mt-4">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full" /> DEPT: <strong className="text-white">ECE</strong></span><span>•</span><span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#FFB800] rounded-full" /> CAMPUS: <strong className="text-white">PIET</strong></span><span>•</span><span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#7000FF] rounded-full" /> STUDENTS: <strong className="text-white">1,500+</strong></span>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex flex-col items-center mt-8 gap-2 text-white/30">
          <span className="text-[9px] font-mono tracking-[0.25em]">SCROLL TO EXPLORE ARCHITECTURE</span>
          <div className="w-px h-10 bg-white/10 overflow-hidden relative"><div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#CCFF00] to-transparent animate-pulse" style={{ animationDuration: '1.5s' }} /></div>
          <ArrowDown className="w-3.5 h-3.5 text-[#CCFF00] animate-bounce" />
        </div>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} className="flex lg:hidden justify-center mt-7 text-white/40">
          <span className="flex flex-col items-center gap-1"><span className="text-[9px] font-mono tracking-[0.3em]">SCROLL</span><ArrowDown className="w-4 h-4 text-[#CCFF00]" /></span>
        </motion.div>
      </motion.div>
      <div className="relative z-10 border-y border-white/10 bg-[#CCFF00] text-black overflow-hidden py-2.5">
        <motion.div style={{ skewX: marqueeSkew }} className="will-change-transform">
          <div className="flex whitespace-nowrap animate-marquee" style={{ width: 'max-content' }}>
            {[...Array(6)].map((_, i) => <span key={i} className="flex items-center gap-6 px-6 text-[13px] font-black tracking-widest"><span>◆</span> VLSI SILICON <span className="opacity-20">—</span> ROBOTICS <span className="opacity-20">—</span> IoT • LoRaWAN <span className="opacity-20">—</span> EDGE AI <span className="opacity-20">—</span> IEEE RESEARCH <span className="opacity-20">—</span> HARDWARE HACKATHONS</span>)}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function MarqueeTicker({ announcement: propAnn }) {
  const fallback = '⚡ LIVE: Registrations open for SPACE & SINC Installation 2026 • TARANG 2K26 Freshers Gala • 1,500+ Engineers • PIET Nagpur'
  const announcement = propAnn && propAnn.trim() ? propAnn : fallback
  const skew = useMarqueeSkew()
  return (
    <div className="bg-black border-y border-white/10 overflow-hidden py-3 relative z-20">
      <motion.div style={{ skewX: skew }} className="will-change-transform">
        <div className="flex whitespace-nowrap animate-marquee marquee" style={{ width: 'max-content' }}>
          {[...Array(4)].map((_, i) => <span key={i} className="flex items-center gap-4 px-6 text-xs font-mono tracking-widest text-white/70"><span className="px-2 py-1 rounded bg-[#CCFF00] text-black font-black text-[10px]">LIVE DISPATCH</span>{announcement}<span className="w-1.5 h-1.5 bg-[#FF3B30] rounded-full animate-pulse" /></span>)}
        </div>
      </motion.div>
    </div>
  )
}

// --- HORIZONTAL LABS PINNED SHOWCASE ---
function LabsPin() {
  const wrapRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] })
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-72%"])
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])
  const isMobile = useIsMobile(1024)
  const labs = [
    { icon: Cpu, title: 'VLSI SILICON', sub: '45nm • RISC-V • FPGA', desc: 'Custom 32-bit cores on Artix-7, synthesis to tape-out mindset.', color: '#CCFF00', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80', stats: '120+ PROTOTYPES' },
    { icon: Bot, title: 'ROBOTICS ARENA', sub: 'ROS 2 • LiDAR • ROVER', desc: 'Autonomous rovers, obstacle avoidance, search & rescue demos.', color: '#7000FF', img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&q=80', stats: '24H HACKATHON' },
    { icon: Radio, title: 'IoT MESH', sub: 'LoRaWAN • EDGE • MESH', desc: 'Low-power mesh nodes, patented 492026/IN, field telemetry.', color: '#FFB800', img: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=900&q=80', stats: 'PATENT GRANTED' },
    { icon: Brain, title: 'EDGE AI LAB', sub: 'TinyML • SENSORS • VISION', desc: 'On-device inference, smart grids, sensor fusion at edge.', color: '#00D9FF', img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&q=80', stats: '45+ WORKSHOPS' },
  ]
  if (isMobile) {
    return (
      <section className="bg-[#08080A] py-12 sm:py-16 relative overflow-hidden">
        <div className="px-4 sm:px-6">
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-[#CCFF00] mb-3"><Waves className="w-3.5 h-3.5" /> LABS — SWIPE TO EXPLORE</div>
          <h2 className="font-display font-[800] text-[32px] sm:text-[40px] leading-none tracking-tighter"><span className="text-white">FOUR LABS.</span> <span className="text-stroke">ONE MISSION.</span></h2>
        </div>
        <div className="mt-6 flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-4 sm:px-6 pb-4 touch-pan-x">
          {labs.map(l => {
            const Icon = l.icon
            return (
              <div key={l.title} className="snap-center shrink-0 w-[84vw] max-w-[360px] rounded-[24px] overflow-hidden bg-[#111] border border-white/10 shadow-lg">
                <div className="h-44 relative overflow-hidden"><img src={l.img} alt={l.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" /><span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur border border-white/15 text-[10px] font-black tracking-widest text-white">{l.sub}</span><span className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white text-black grid place-items-center"><Icon className="w-4 h-4" /></span></div>
                <div className="p-5"><div className="text-[11px] font-mono tracking-widest" style={{ color: l.color }}>{l.stats}</div><h3 className="font-display font-black text-xl leading-none mt-1">{l.title}</h3><p className="text-sm text-white/60 mt-2 leading-relaxed">{l.desc}</p></div>
              </div>
            )
          })}
        </div>
      </section>
    )
  }
  return (
    <section ref={wrapRef} className="pin-wrap bg-[#08080A] relative">
      <div className="pin-sticky">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="h-full flex flex-col">
          <div className="px-6 md:px-8 pt-8 flex items-end justify-between gap-6 max-w-[1600px] mx-auto w-full">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-3 py-1 rounded-full"><Waves className="w-3 h-3" /> LABS — HORIZONTAL SCROLL</div>
              <h2 className="font-display font-[800] leading-none tracking-tighter text-[44px] mt-3"><span className="text-white">FOUR LABS.</span> <span className="text-stroke">ONE MISSION.</span></h2>
            </div>
            <div className="hidden md:flex items-center gap-3 text-xs font-mono text-white/40"><span>SCROLL TO DRIVE</span><span className="w-32 h-[2px] bg-white/10 rounded-full overflow-hidden"><motion.span style={{ scaleX }} className="block h-full bg-[#CCFF00] origin-left" /></span><span>04</span></div>
          </div>
          <div className="flex-1 flex items-center overflow-hidden">
            <motion.div style={{ x }} className="flex gap-6 pl-[6vw] pr-[6vw] will-change-transform">
              {labs.map(l => {
                const Icon = l.icon
                return (
                  <GlareCard key={l.title} className="shrink-0 w-[560px] h-[380px] rounded-[32px] overflow-hidden bg-[#111] border border-white/10 flex">
                    <div className="w-[52%] relative overflow-hidden">
                      <img src={l.img} alt={l.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20" />
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur border border-white/15 text-[10px] font-black tracking-widest text-white">{l.sub}</span>
                    </div>
                    <div className="flex-1 p-7 flex flex-col justify-between">
                      <div>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-black tracking-widest px-2.5 py-1 rounded-full border" style={{ color: l.color, borderColor: l.color + '30', background: l.color + '15' }}>{l.stats}</span>
                        <h3 className="font-display font-black text-[28px] leading-none tracking-tight mt-3">{l.title}</h3>
                        <p className="text-sm text-white/60 leading-relaxed mt-3">{l.desc}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="w-10 h-10 rounded-full border border-white/10 grid place-items-center"><Icon className="w-4 h-4" style={{ color: l.color }} /></span>
                        <span className="text-xs font-mono tracking-widest text-white/30">0{labs.indexOf(l) + 1} / 04</span>
                      </div>
                    </div>
                  </GlareCard>
                )
              })}
              <div className="shrink-0 w-[360px] h-[380px] rounded-[32px] border-2 border-dashed border-white/15 bg-white/[0.02] grid place-items-center p-8 text-center">
                <div><div className="w-14 h-14 rounded-full bg-[#CCFF00] text-black grid place-items-center mx-auto"><ArrowRight className="w-6 h-6" /></div><h4 className="font-display font-black text-xl mt-4">EXPLORE ALL LABS</h4><p className="text-sm text-white/50 mt-2">Book a lab tour — PIET Nagpur</p><a href="#contact" className="inline-block mt-4 px-6 py-3 rounded-full bg-white text-black font-black text-sm">GET ACCESS →</a></div>
              </div>
            </motion.div>
          </div>
          <div className="px-6 md:px-8 pb-6 flex justify-center gap-2">
            {[0, 1, 2, 3].map(i => <ScrollDot key={i} progress={scrollYProgress} index={i} total={4} />)}
          </div>
        </div>
      </div>
    </section>
  )
}

// --- STATS (mobile-optimized + tilt + a11y) ---
function StatsSection() {
  const ref = useRef(null), isInView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <section id="stats" ref={ref} className="bg-[#08080A] py-12 sm:py-16 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[#7000FF]/[0.05] rounded-full blur-[120px]" aria-hidden /></div>
      <div className="px-4 sm:px-6 md:px-8 max-w-[1600px] mx-auto relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-3 py-2 sm:py-1 rounded-full"><Sparkles className="w-3 h-3" aria-hidden /> <ScrambleText text="01 // DEPARTMENT TELEMETRY & SCALE" /></p>
            <h2 className="font-display font-[800] leading-none tracking-tighter text-[8.5vw] sm:text-[7vw] md:text-[44px] mt-3 break-words"><span className="block text-white">Real-World Metrics &</span><span className="block text-stroke">Engineering Impact.</span></h2>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs font-mono tracking-widest text-white/40">OFFICIAL RECORDS // 2020 – 2026</p>
            <p className="text-[11px] font-black tracking-widest text-[#CCFF00]">ALL METRICS AUDITED & VERIFIED ✓</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="rounded-[20px] sm:rounded-[24px] bg-[#111] border border-white/10 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 overflow-hidden">
            <Activity className="w-5 h-5 text-[#00FF88] animate-pulse shrink-0" aria-hidden />
            <div className="flex-1 h-[36px] sm:h-[40px] flex items-end gap-[2px] opacity-60" aria-hidden>
              {[...Array(40)].map((_, i) => <div key={i} className="flex-1 bg-[#CCFF00] rounded-sm" style={{ height: `${30 + Math.sin(i * 0.8) * 50 + Math.random() * 20}%`, opacity: 0.3 + (i % 3) * 0.3 }} />)}
            </div>
            <span className="text-[11px] sm:text-xs font-mono text-white/50 hidden sm:block whitespace-nowrap">LIVE SPECTRUM • VERIFIED</span>
            <span className="text-[10px] font-mono text-white/50 sm:hidden">LIVE</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {STATS.map((s, idx) => {
            const Icon = s.icon
            return (
              <GlareCard className="h-full rounded-[24px]"><motion.div key={s.index} initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: idx * 0.05, duration: 0.5, ease: [0.76, 0, 0.24, 1] }} className="glare-card group relative h-full rounded-[24px] bg-[#0F0F0F] border border-white/10 p-6 md:p-7 overflow-hidden hover:border-white/15 hover:bg-[#141414] transition-colors">
                <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-mono tracking-widest text-white/30">// SYS_METRIC.{s.index}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black px-2 py-1 rounded-full border tracking-widest" style={{ background: `${s.color}15`, borderColor: `${s.color}30`, color: s.color }}>{s.tag}</span>
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 grid place-items-center"><Icon className="w-4 h-4" style={{ color: s.color }} /></div>
                  </div>
                </div>
                <div className="text-5xl font-display font-black leading-none tracking-tight flex items-baseline gap-1">
                  <CountUp value={s.value} inView={isInView} /> <span style={{ color: s.color }}>{s.suffix}</span>
                </div>
                <div className="font-display font-bold text-[15px] mt-2">{s.label}</div>
                <div className="text-xs text-white/50 leading-relaxed mt-1">{s.desc}</div>
                <div className="mt-6 pt-4 border-t border-white/5">
                  <div className="flex justify-between text-[10px] font-mono tracking-widest text-white/30 mb-2"><span>EFFICIENCY INDEX</span><span style={{ color: s.color }}>{s.percent}% NOMINAL</span></div>
                  <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5"><motion.div initial={{ width: 0 }} animate={isInView ? { width: `${s.percent}%` } : {}} transition={{ duration: 1.2, delay: 0.3 + idx * 0.05, ease: [0.76, 0, 0.24, 1] }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${s.color}, #CCFF00)` }} /></div>
                </div>
              </motion.div></GlareCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
function CountUp({ value, inView }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    let start = 0, duration = 1400, step = 16, inc = Math.ceil(value / (duration / step))
    const t = setInterval(() => { start += inc; if (start >= value) { setCount(value); clearInterval(t) } else setCount(start) }, step)
    return () => clearInterval(t)
  }, [inView, value])
  return <span>{count.toLocaleString()}</span>
}

// --- ABOUT — REIMAGINED v2 (premium, editorial, interactive, with image collage) ---
function AboutSection() {
  const ref = useRef(null), isInView = useInView(ref, { once: true, margin: "-80px" })
  const { scrollYProgress: aboutProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const xWatermark = useTransform(aboutProgress, [0, 1], ["-6%", "6%"])
  const [hovered, setHovered] = useState(null)
  const [counted, setCounted] = useState(false)
  useEffect(() => { if (isInView) setTimeout(()=>setCounted(true), 300) }, [isInView])
  return (
    <section id="about" ref={ref} className="bg-[#F4F4F0] text-black relative overflow-hidden py-16 md:py-24">
      {/* Watermark with parallax */}
      <motion.div style={{ x: xWatermark }} className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden will-change-transform" aria-hidden>
        <span className="font-display font-[800] text-[28vw] leading-none tracking-tighter text-black/[0.025] whitespace-nowrap">SPACE × SINC</span>
      </motion.div>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `repeating-linear-gradient(90deg,#000 0 1px,transparent 1px 80px)` }} />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent opacity-60" />
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-[380px] h-[380px] bg-[#CCFF00]/10 rounded-full blur-[80px] pointer-events-none" aria-hidden />
      <div className="absolute -bottom-20 -left-20 w-[420px] h-[420px] bg-[#7000FF]/5 rounded-full blur-[90px] pointer-events-none" aria-hidden />
      <div className="px-4 md:px-8 max-w-[1600px] mx-auto relative">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="relative max-w-[720px]">
            <p className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] bg-black text-white px-3 py-1.5 rounded-full"><Compass className="w-3.5 h-3.5 text-[#CCFF00]" /> <ScrambleText text="01 // ABOUT THE COUNCILS" /></p>
            <h2 className="font-display font-[800] leading-[0.9] tracking-tighter text-[9vw] md:text-[52px] mt-4"><span className="block">Dual-Council Ecosystem &</span><span className="block relative">Department Governance.<span className="absolute -right-4 -top-2 hidden lg:block w-3 h-3 bg-[#CCFF00] rounded-full animate-pulse shadow-[0_0_12px_#CCFF00]" /></span></h2>
            <p className="mt-4 text-[13px] leading-relaxed text-black/60 max-w-[560px]">Two councils, one mission — <span className="font-bold text-black">SPACE</span> drives research & academic excellence, <span className="font-bold text-black">SINC</span> ships hardware & products. Together they form PIET ECE’s student-led governance.</p>
          </div>
          <div className="lg:text-right">
            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-black/10 shadow-sm">
              <div className="flex -space-x-2">
                <img src="/team_images/samyak.webp" alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white" loading="lazy" />
                <img src="/team_images/saloni.webp" alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white" loading="lazy" />
                <img src="/team_images/himanshu.webp" alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white" loading="lazy" />
              </div>
              <div className="text-left"><div className="text-xs font-black leading-none">1,500+ Members</div><div className="text-[11px] text-black/50">Across 4 years • PIET Nagpur</div></div>
              <span className="hidden sm:inline-flex w-8 h-8 rounded-full bg-black text-white grid place-items-center"><ArrowUpRight className="w-4 h-4" /></span>
            </div>
          </div>
        </div>

        {/* Central collage + dual cards */}
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
          {/* Left: collage */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }} className="relative rounded-[32px] bg-white border border-black/10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black text-white text-[10px] font-black tracking-widest">ESTD 2012 • 2018</span>
              <span className="px-3 py-1 rounded-full bg-[#CCFF00] text-black text-[10px] font-black tracking-widest">SPACE × SINC</span>
            </div>
            <div className="grid grid-cols-2 gap-0">
              <div className="relative h-[220px] sm:h-[280px] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80" alt="VLSI Lab" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-black tracking-widest">VLSI • FPGA</span>
              </div>
              <div className="relative h-[220px] sm:h-[280px] overflow-hidden border-l border-white/50">
                <img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80" alt="Robotics" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-black tracking-widest">ROBOTICS • ROS</span>
              </div>
              <div className="relative h-[180px] sm:h-[200px] overflow-hidden border-t border-white/50">
                <img src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80" alt="PCB Lab" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-black tracking-widest">PCB • SMT</span>
              </div>
              <div className="relative h-[180px] sm:h-[200px] overflow-hidden border-t border-l border-white/50">
                <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80" alt="Hackathon" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-black tracking-widest">HACKATHON • 24H</span>
              </div>
            </div>
            <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 bg-[#FDFDFB]">
              <div className="flex items-center gap-2 text-xs font-mono"><span className="w-2 h-2 bg-[#CCFF00] rounded-full animate-pulse" /> Live Labs • 03 Active • PIET Campus</div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-black/60"><span className="w-6 h-px bg-black/15" /> Hover cards →</div>
            </div>
          </motion.div>

          {/* Right: dual council cards stacked */}
          <div className="grid gap-6">
            {[
              {
                title: 'SPACE FORUM', sub: "Student's Progressive Assoc.", est: 'ESTD. 2012', desc: 'Research, IEEE, papers, ELEKTRONIKOS magazine, TARANG gala. The academic engine.', tags: ['IEEE Chapter', 'Papers', 'TARANG'], incharge: 'Dr. Sunita N Parihar', pres: 'Rohan Virutkar', logo: '/space_logo.png', accent: '#FFB800', border: 'border-amber-500/30 hover:border-amber-500/50', bg: 'from-white to-[#FFFBEB]', stats: '12 YRS • 40+ PAPERS'
              },
              {
                title: 'SINC COUNCIL', sub: 'Student Innovation Council', est: 'ESTD. 2018', desc: 'Rapid prototyping, robotics, patents, hackathons. The shipping engine.', tags: ['Hardware Labs', 'Patents', 'Arena'], incharge: 'Ms. V. V. Shirpurkar', pres: 'Makarand Bahmane', logo: '/sinc_logo.png', accent: '#CCFF00', border: 'border-[#CCFF00]/30 hover:border-[#CCFF00]/50', bg: 'from-white to-[#F6FFEB]', stats: '45+ BUILDS • 1 PATENT'
              }
            ].map((c, idx) => (
              <motion.div key={c.title} onHoverStart={() => setHovered(idx)} onHoverEnd={() => setHovered(null)} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 + idx * 0.12, duration: 0.6, ease: [0.16,1,0.3,1] }} className={`group relative rounded-[28px] bg-gradient-to-br ${c.bg} border-2 ${c.border} p-6 flex flex-col gap-4 shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all ${hovered!==null && hovered!==idx ? 'opacity-60 scale-[0.985]' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-black p-1.5 flex items-center justify-center shadow-sm"><img src={c.logo} alt={c.title} className="w-full h-full object-contain" loading="lazy" /></div>
                    <div><h3 className="font-display font-black text-[18px] leading-none tracking-tight">{c.title}</h3><p className="text-[11px] font-mono font-bold" style={{ color: c.accent }}>{c.sub}</p></div>
                  </div>
                  <span className="text-[10px] font-black tracking-widest px-3 py-1 rounded-full bg-black text-white">{c.est}</span>
                </div>
                <p className="text-[13px] leading-relaxed text-black/60 line-clamp-3">{c.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map(t => <span key={t} className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-black text-white border border-black">{t}</span>)}
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white border border-black/10 text-black/60">{c.stats}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-black/10 text-xs font-mono">
                  <div className="rounded-xl bg-black/[0.04] border border-black/5 p-3"><div className="text-[10px] tracking-widest text-black/40">INCHARGE</div><div className="font-bold leading-tight">{c.incharge}</div></div>
                  <div className="rounded-xl bg-black text-white border border-black p-3"><div className="text-[10px] tracking-widest text-white/50">PRESIDENT</div><div className="font-black leading-tight" style={{ color: c.accent }}>{c.pres}</div></div>
                </div>
                <div className="flex justify-between items-center text-xs font-mono font-bold pt-1">
                  <span className="flex items-center gap-1.5" style={{ color: c.accent }}>{idx===0 ? <Flame className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />} View Leadership</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom stats with count-up */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { k: 'SPACE × SINC', v: '2', s: 'Councils', sub: 'One mission' },
            { k: '1,500+', v: counted ? '1,500+' : '0', s: 'Members', sub: 'Across 4 years' },
            { k: 'PIET NAGPUR', v: '2012', s: 'Since', sub: 'Campus base' },
            { k: '2026-27', v: '14th', s: 'Session', sub: 'Current' },
          ].map(b => (
            <div key={b.k} className="rounded-[20px] bg-white border border-black/10 p-4 sm:p-5 flex flex-col gap-2 shadow-sm hover:shadow-md hover:border-black/15 transition-all">
              <div className="text-[10px] font-mono tracking-widest text-black/40">{b.k}</div>
              <div className="font-display font-black text-2xl leading-none">{b.v}</div>
              <div className="text-xs font-bold">{b.s} <span className="font-normal text-black/50">• {b.sub}</span></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- PROCESS — NEW CREATIVE TIMELINE WITH SCROLL-DRAWN LINE ---
function ProcessSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.35"] })
  const pathLength = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), { stiffness: 90, damping: 30 })
  const steps = [
    { n: '01', title: 'DISCOVER', desc: 'Research • IEEE papers • field visits', icon: Eye, color: '#CCFF00' },
    { n: '02', title: 'PROTOTYPE', desc: 'PCB • VLSI • ROS • 3D printing', icon: Cpu, color: '#7000FF' },
    { n: '03', title: 'VALIDATE', desc: 'Tests • patents • peer reviews', icon: ShieldCheck, color: '#FFB800' },
    { n: '04', title: 'LAUNCH', desc: 'Expo • hackathon • industry', icon: Trophy, color: '#00D9FF' },
  ]
  return (
    <section ref={ref} className="bg-[#0A0A0A] py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
      <div className="px-4 md:px-8 max-w-[1600px] mx-auto relative">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-3 py-1 rounded-full"><Layers className="w-3 h-3" /> PROCESS — HOW WE BUILD</p>
            <h2 className="font-display font-[800] leading-none tracking-tighter text-[9vw] md:text-[52px] mt-3 text-white"><span className="block">From Idea to</span><span className="block text-stroke">Silicon in 4.</span></h2>
          </div>
          <p className="text-xs font-mono text-white/40 max-w-[340px] lg:text-right">Scroll — the line draws, steps light up. Pure senior craft.</p>
        </div>
        <div className="relative grid lg:grid-cols-[88px_1fr] gap-6">
          <div className="hidden lg:block relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-white/10 rounded-full" />
            <svg className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] h-full" viewBox="0 0 2 1000" preserveAspectRatio="none" aria-hidden>
              <motion.line x1="1" y1="0" x2="1" y2="1000" stroke="#CCFF00" strokeWidth="2" strokeLinecap="round" style={{ pathLength }} />
            </svg>
            <div className="sticky top-28 flex flex-col gap-[88px] py-4">
              {steps.map((s, i) => (
                <ProcessDot key={s.n} progress={scrollYProgress} index={i} />
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {steps.map((s, idx) => {
              const Icon = s.icon
              return (
                <GlareCard key={s.n} className="rounded-[24px]">
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: idx*0.08, duration: 0.5, ease: [0.16,1,0.3,1] }} className="glare-card group relative rounded-[24px] bg-[#111] border border-white/10 p-6 md:p-7 flex flex-col gap-4 hover:border-white/15 hover:bg-[#141414] transition-colors overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-mono font-black tracking-widest px-3 py-1 rounded-full border" style={{ background: s.color+'15', borderColor: s.color+'30', color: s.color }}>{s.n} • STEP</span>
                    <span className="w-10 h-10 rounded-xl bg-white text-black grid place-items-center group-hover:bg-[#CCFF00] transition-colors"><Icon className="w-5 h-5" /></span>
                  </div>
                  <h3 className="font-display font-black text-xl leading-none tracking-tight">{s.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{s.desc}</p>
                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-2 text-[11px] font-mono text-white/30"><span className="w-6 h-px bg-white/15" /> 0{idx+1} → 04</div>
                </motion.div>
                </GlareCard>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

// --- EVENTS (backend wired) ---
function EventsSection({ eventsList: propEvents, onRegister }) {
  const [filter, setFilter] = useState('All'), [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const ref = useRef(null), isInView = useInView(ref, { once: true, margin: "-60px" })
  const liveEvents = Array.isArray(propEvents) && propEvents.length ? propEvents : EVENTS
  const targetDate = useMemo(() => new Date(HERO_CONFIG.flagshipTargetDate).getTime(), [])
  useEffect(() => {
    const calc = () => {
      const diff = targetDate - Date.now()
      if (diff > 0) setTimeLeft({ days: Math.floor(diff / 86400000), hours: Math.floor(diff / 3600000) % 24, minutes: Math.floor(diff / 60000) % 60, seconds: Math.floor(diff / 1000) % 60 })
      else setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    }
    calc(); const i = setInterval(calc, 1000); return () => clearInterval(i)
  }, [targetDate])
  const pad = (n) => String(n).padStart(2, '0')
  const filtered = liveEvents.filter(e => filter === 'All' ? true : filter === 'Upcoming' ? e.status === 'Upcoming' : e.category === filter)
  return (
    <section id="events" ref={ref} className="bg-[#08080A] py-16 md:py-24 relative overflow-hidden">
      <div className="beam absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CCFF00]/20 to-transparent" />
      <div className="px-4 md:px-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-3 py-1 rounded-full"><Ticket className="w-3 h-3" /> <ScrambleText text="02 // EVENTS & WORKSHOPS" /></p>
            <h2 className="font-display font-[800] leading-none tracking-tighter text-[9vw] md:text-[52px] mt-3 text-white"><span className="block">Event Calendar &</span><span className="block text-stroke">Live Registration.</span></h2>
          </div>
          <p className="text-xs font-mono text-white/40 max-w-[320px] md:text-right">Department ceremonies, hardware workshops, and hackathons.</p>
        </div>

        {/* Countdown Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} className="rounded-[32px] bg-gradient-to-br from-[#0F0F0F] to-black border border-[#FFB800]/30 overflow-hidden relative mb-8">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFB800] to-transparent" />
          <div className="grid lg:grid-cols-12 gap-8 p-6 md:p-10 relative">
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] text-[10px] font-black tracking-widest"><span className="w-2 h-2 bg-[#FFB800] rounded-full animate-ping" />{HERO_CONFIG.flagshipBadge}</span>
              <h3 className="font-display font-black text-2xl md:text-4xl leading-none text-white">{HERO_CONFIG.flagshipTitle}<br /><span className="text-[#FFB800]">{HERO_CONFIG.flagshipSubTitle}</span></h3>
              <p className="text-sm text-white/60 leading-relaxed max-w-[520px]">{HERO_CONFIG.flagshipDescription}</p>
              <button onClick={()=> onRegister && liveEvents[0] && onRegister(liveEvents[0])} className="btn-sheen inline-flex items-center gap-2 bg-[#FFB800] text-black px-6 py-3 rounded-full font-black text-xs tracking-wide hover:bg-white transition-colors min-h-[44px]"><ShieldCheck className="w-4 h-4" /> {HERO_CONFIG.flagshipButtonText} <ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {[
                  { k: 'DAYS', v: pad(timeLeft.days) },
                  { k: 'HOURS', v: pad(timeLeft.hours) },
                  { k: 'MINS', v: pad(timeLeft.minutes) },
                  { k: 'SECS', v: pad(timeLeft.seconds), hl: true },
                ].map((b, i) => <div key={b.k} className="flex items-center gap-1.5 sm:gap-2">
                  <FlipUnit k={b.k} value={b.v} hl={b.hl} />{i < 3 && <span className="text-[#FFB800] font-black text-lg sm:text-xl mt-5">:</span>}
                </div>)}
              </div>
              <div className="mt-3 text-[11px] font-mono text-white/40 flex items-center gap-1.5"><Timer className="w-3.5 h-3.5 text-[#FFB800]" /> TARGET: {HERO_CONFIG.flagshipTargetDate.replace('T', ' · ')} · {HERO_CONFIG.flagshipTargetVenue}</div>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center sm:overflow-visible" role="tablist" aria-label="Event filters">
          {['All', 'Upcoming', 'Installation', 'Workshop'].map(cat => {
            const count = cat === 'All' ? EVENTS.length : EVENTS.filter(e => e.category === cat || e.status === cat).length
            if (count === 0 && cat !== 'All' && cat !== 'Upcoming') return null
            return <button key={cat} role="tab" aria-selected={filter === cat} onClick={() => setFilter(cat)} className={`snap-start shrink-0 px-4 py-2.5 sm:py-2 rounded-full text-xs font-mono font-bold border flex items-center gap-2 min-h-[44px] sm:min-h-0 whitespace-nowrap transition-colors ${filter === cat ? 'bg-[#CCFF00] text-black border-[#CCFF00]' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white active:scale-95'}`}>{cat} <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === cat ? 'bg-black text-white' : 'bg-white/10'}`}>{count}</span></button>
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-[900px] mx-auto">
          {filtered.map((evt, idx) => (
            <motion.div key={evt.id} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: idx * 0.1 }} className="group rounded-[24px] overflow-hidden bg-[#111] border border-white/10 hover:border-white/20 transition-colors flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img src={evt.image} alt={evt.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur border border-white/15 text-[10px] font-black tracking-widest text-white">{evt.badge}</span>
                <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[11px] font-mono text-white flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#FFB800]" />{evt.date}</span>
              </div>
              <div className="p-6 flex-1 flex flex-col gap-3">
                <div className="flex justify-between text-[11px] font-mono text-white/50">
                  <span className="flex items-center gap-1 text-[#CCFF00]"><Clock className="w-3.5 h-3.5" />{evt.time}</span>
                  <span className="flex items-center gap-1 text-[#FFB800]"><MapPin className="w-3.5 h-3.5" />{evt.venue}</span>
                </div>
                <h3 className="font-display font-black text-lg leading-tight group-hover:text-[#CCFF00] transition-colors">{evt.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{evt.description}</p>
                <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                  <div><div className="text-[10px] font-mono tracking-widest text-white/30">FEE</div><div className="font-mono font-black text-white">₹{evt.price} INR</div></div>
                  <button onClick={()=> onRegister && onRegister(evt)} className="px-5 py-2.5 rounded-full bg-white text-black font-black text-xs flex items-center gap-1 hover:bg-[#CCFF00] active:scale-95 transition-all min-h-[44px]">Register <ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- GALLERY ---
function GallerySection({ galleryList: propGallery }) {
  const [activeCat, setActiveCat] = useState('All'), [lightbox, setLightbox] = useState(null)
  const ref = useRef(null), isInView = useInView(ref, { once: true, margin: "-60px" })
  const isMobileGal = useIsMobile(768)
  const pinGalRef = useRef(null)
  const { scrollYProgress: galProgress } = useScroll({ target: pinGalRef, offset: ["start start", "end end"] })
  const xGalRaw = useTransform(galProgress, [0, 1], ["0%", "-49%"])
  const xGal = useSpring(xGalRaw, { stiffness: 90, damping: 30, mass: 0.6 })
  const scaleGal = useSpring(useTransform(galProgress, [0, 1], [0, 1]), { stiffness: 80, damping: 25 })
  const sourceGallery = Array.isArray(propGallery) && propGallery.length ? propGallery : GALLERY
  const filtered = sourceGallery.filter(i => activeCat === 'All' || i.category === activeCat)
  useEffect(() => {
    const onKey = (e) => {
      if (lightbox === null) return
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox(p => (p + 1) % filtered.length)
      if (e.key === 'ArrowLeft') setLightbox(p => (p - 1 + filtered.length) % filtered.length)
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, filtered.length])
  return (
    <section id="gallery" ref={ref} className="bg-[#08080A] relative">
      {/* Mobile: bento grid */}
      <div className="md:hidden py-16 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7000FF]/20 to-transparent" />
        <div className="px-4 max-w-[1600px] mx-auto">
          <div className="flex flex-col gap-6 mb-8">
            <p className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-3 py-1 rounded-full w-fit">03 // VISUAL ARCHIVE & LAB MEMORIES</p>
            <h2 className="font-display font-[800] leading-none tracking-tighter text-[9vw] text-white"><span className="block">Hardware Labs &</span><span className="block text-stroke">Hackathons in Action.</span></h2>
            <p className="text-xs font-mono text-white/40">Swipe the archive →</p>
          </div>
          <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-2 -mx-4 px-4">
            {['All', 'Hackathon', 'Workshop', 'Project Expo', 'Industrial Visit'].map(cat => {
              const count = cat === 'All' ? sourceGallery.length : sourceGallery.filter(i => i.category === cat).length
              return <button key={cat} role="tab" aria-selected={activeCat === cat} onClick={() => setActiveCat(cat)} className={`snap-start shrink-0 px-4 py-2.5 rounded-full text-xs font-mono font-bold border flex items-center gap-2 min-h-[44px] whitespace-nowrap ${activeCat === cat ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/60'}`}>{cat} <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCat === cat ? 'bg-black text-white' : 'bg-white/10'}`}>{count}</span></button>
            })}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((item, idx) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 28, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, margin: '-30px' }} transition={{ delay: (idx % 3) * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }} onClick={() => setLightbox(idx)} className="group cursor-pointer rounded-[20px] overflow-hidden bg-[#111] border border-white/10">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={item.url} alt={item.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur border border-white/15 text-[10px] font-black tracking-widest text-white">{item.category}</span>
                  <div className="absolute bottom-0 left-0 right-0 p-4"><div className="text-[10px] font-mono tracking-widest text-[#CCFF00]">{item.id}</div><h3 className="font-display font-black text-[15px] leading-tight text-white">{item.title}</h3></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      {/* Desktop: pinned horizontal — SAME AS ACHIEVEMENTS / LABS — NO BLANK GAP */}
      <div ref={pinGalRef} className="hidden md:block pin-wrap !h-[245vh]">
        <div className="pin-sticky">
          <div className="beam absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7000FF]/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[480px] bg-[#7000FF]/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="h-full flex flex-col">
            <div className="px-6 md:px-8 pt-10 flex items-end justify-between gap-6 max-w-[1600px] mx-auto w-full">
              <div>
                <p className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-3 py-1 rounded-full">03 // <ScrambleText text="VISUAL ARCHIVE — HORIZONTAL GALLERY" /></p>
                <h2 className="font-display font-[800] leading-none tracking-tighter text-[44px] mt-3"><span className="text-white">Hardware Labs &</span> <span className="text-stroke">Hackathons.</span></h2>
              </div>
              <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-white/40"><span>SCROLL TO EXPLORE</span><span className="w-28 h-[2px] bg-white/10 rounded-full overflow-hidden"><motion.span style={{ scaleX: scaleGal }} className="block h-full bg-[#CCFF00] origin-left" /></span><span>{filtered.length.toString().padStart(2,'0')}</span></div>
            </div>
            {/* Filters inside pin */}
            <div className="px-6 md:px-8 mt-4 flex gap-2 justify-center">
              {['All', 'Hackathon', 'Workshop', 'Project Expo', 'Industrial Visit'].map(cat => {
                const count = cat === 'All' ? sourceGallery.length : sourceGallery.filter(i => i.category === cat).length
                return <button key={cat} onClick={() => setActiveCat(cat)} className={`px-3.5 py-2 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${activeCat === cat ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>{cat} <span className={`text-[10px] px-1 py-0.5 rounded-full ${activeCat === cat ? 'bg-black text-white' : 'bg-white/10'}`}>{count}</span></button>
              })}
            </div>
            <div className="flex-1 flex items-center overflow-hidden">
              <motion.div style={{ x: xGal }} className="flex gap-5 pl-[4vw] pr-[8vw] will-change-transform">
                {filtered.map((item, idx) => {
                  const featured = idx === 0
                  return (
                    <GlareCard key={item.id} className={`shrink-0 rounded-[28px] overflow-hidden bg-[#111] border border-white/10 ${featured ? 'w-[560px] h-[380px]' : 'w-[440px] h-[360px]'}`}>
                    <div onClick={() => setLightbox(idx)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && setLightbox(idx)} className="glare-card group cursor-pointer w-full h-full relative overflow-hidden">
                      <img src={item.url} alt={item.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                      {featured && <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#CCFF00] text-black text-[10px] font-black tracking-widest">★ FEATURED</span>}
                      <span className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white text-black grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"><Maximize2 className="w-4 h-4" /></span>
                      <div className="absolute top-4 left-4 right-16 hidden sm:flex gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur border border-white/15 text-[10px] font-black tracking-widest text-white">{item.category}</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="text-[10px] font-mono tracking-widest text-[#CCFF00]">{item.id} • {item.category}</div>
                        <h3 className={`font-display font-black leading-tight text-white ${featured ? 'text-xl' : 'text-lg'}`}>{item.title}</h3>
                        <p className="text-xs text-white/60 line-clamp-2 mt-1">{item.caption}</p>
                      </div>
                    </div>
                    </GlareCard>
                  )
                })}
                <div className="shrink-0 w-[360px] h-[360px] rounded-[28px] border-2 border-dashed border-white/15 bg-white/[0.02] grid place-items-center p-8 text-center">
                  <div><div className="w-12 h-12 rounded-full bg-[#CCFF00] text-black grid place-items-center mx-auto"><ImageIcon className="w-6 h-6" /></div><h4 className="font-display font-black text-lg mt-3">ARCHIVE COMPLETE</h4><p className="text-xs text-white/50 mt-1">{sourceGallery.length} labs • workshops • expos</p></div>
                </div>
              </motion.div>
            </div>
            <div className="px-6 md:px-8 pb-6 flex justify-center gap-2">
              {[0,1,2,3,4,5].slice(0, Math.min(6, filtered.length)).map(i => <ScrollDot key={i} progress={galProgress} index={i} total={filtered.length} />)}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4" onClick={() => setLightbox(null)} onTouchStart={e => e.currentTarget.dataset.sx = e.touches[0].clientX} onTouchEnd={e => { const sx = parseFloat(e.currentTarget.dataset.sx || '0'); const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 60) { if (dx < 0) setLightbox((lightbox + 1) % filtered.length); else setLightbox((lightbox - 1 + filtered.length) % filtered.length) } }} role="dialog" aria-modal="true" aria-label="Gallery lightbox">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} data-lenis-prevent className="relative max-w-4xl w-full rounded-[24px] overflow-hidden bg-[#0F0F0F] border border-white/10 max-h-[90dvh] overflow-y-auto overscroll-contain" onClick={e => e.stopPropagation()}>
              <button onClick={() => setLightbox(null)} aria-label="Close lightbox" className="absolute top-3 right-3 sm:top-4 sm:right-4 w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-black/60 backdrop-blur border border-white/15 text-white grid place-items-center hover:bg-white hover:text-black transition-colors z-10"><X className="w-5 h-5" /></button>
              <button onClick={() => setLightbox((lightbox - 1 + filtered.length) % filtered.length)} aria-label="Previous image" className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-black/60 backdrop-blur border border-white/15 text-white grid place-items-center hover:bg-white hover:text-black transition-colors z-10"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setLightbox((lightbox + 1) % filtered.length)} aria-label="Next image" className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-black/60 backdrop-blur border border-white/15 text-white grid place-items-center hover:bg-white hover:text-black transition-colors z-10"><ChevronRight className="w-5 h-5" /></button>
              <img src={filtered[lightbox].url} alt={filtered[lightbox].title} className="w-full aspect-video object-cover" />
              <div className="p-4 sm:p-6">
                <div className="flex justify-between text-xs font-mono"><span className="text-[#CCFF00] font-black tracking-widest">{filtered[lightbox].category} / {filtered[lightbox].id}</span><span className="text-white/40">{lightbox + 1} / {filtered.length}</span></div>
                <h3 className="font-display font-black text-xl mt-2">{filtered[lightbox].title}</h3>
                <p className="text-sm text-white/60 mt-1">{filtered[lightbox].caption}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// --- ACHIEVEMENTS — NOW WITH HORIZONTAL PINNED SCROLL (like Labs) ---
function AchievementsSection() {
  const [patentOpen, setPatentOpen] = useState(false), ref = useRef(null), isInView = useInView(ref, { once: true, margin: "-60px" })
  const isMobileAch = useIsMobile(768)
  const pinRef = useRef(null)
  const { scrollYProgress: achProgress } = useScroll({ target: pinRef, offset: ["start start", "end end"] })
  const xAchRaw = useTransform(achProgress, [0, 1], ["0%", "-36%"])
  const xAch = useSpring(xAchRaw, { stiffness: 90, damping: 30, mass: 0.6 })
  const scaleAch = useSpring(useTransform(achProgress, [0, 1], [0, 1]), { stiffness: 80, damping: 25 })
  return (
    <section id="achievements" ref={ref} className="bg-[#0A0A0A] relative">
      {/* Mobile: classic grid */}
      <div className="md:hidden py-16 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CCFF00]/20 to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#FFB800]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="px-4 max-w-[1600px] mx-auto relative">
          <div className="flex flex-col gap-6 mb-8">
            <p className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-3 py-1 rounded-full w-fit">04 // PRESTIGE & ACHIEVEMENTS</p>
            <h2 className="font-display font-[800] leading-none tracking-tighter text-[9vw] text-white"><span className="block">Verified Engineering</span><span className="block text-stroke">Victories & Honours.</span></h2>
            <p className="text-xs font-mono text-white/40">Swipe the prestige wall →</p>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-4 -mx-4 px-4">
            {ACHIEVEMENTS.map((a, idx) => {
              const Icon = a.icon, isPatent = a.index === '02'
              return (
                <div key={a.index} onClick={() => isPatent && setPatentOpen(true)} className={`snap-center shrink-0 w-[84vw] max-w-[360px] rounded-[24px] bg-[#111] border border-white/10 p-6 flex flex-col gap-5 ${isPatent ? 'border-[#CCFF00]/20' : ''}`}>
                  <div className="flex justify-between items-start gap-2"><span className="text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">{a.type}</span><span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full bg-white text-black"><Star className="w-3 h-3 text-[#FFB800] fill-[#FFB800]" />{a.metric}</span></div>
                  <div className="flex gap-3"><div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 grid place-items-center shrink-0"><Icon className="w-6 h-6" style={{ color: a.color }} /></div><div><h3 className="font-display font-black text-[15px] leading-tight">{a.title}</h3><p className="text-xs font-mono font-bold text-[#CCFF00] mt-1">{a.team}</p></div></div>
                  <p className="text-xs text-white/60 leading-relaxed flex-1">{a.desc}</p>
                  <div className="pt-3 border-t border-white/10 flex justify-between text-[11px] font-mono text-white/30"><span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#00FF88] rounded-full animate-pulse" /> VERIFIED</span><ExternalLink className="w-3.5 h-3.5" /></div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {/* Desktop: pinned horizontal — like Four Labs — FIXED GAP */}
      <div ref={pinRef} className="hidden md:block pin-wrap !h-[195vh]">
        <div className="pin-sticky">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CCFF00]/20 to-transparent" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-[#FFB800]/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="h-full flex flex-col">
            <div className="px-6 md:px-8 pt-10 flex items-end justify-between gap-6 max-w-[1600px] mx-auto w-full">
              <div>
                <p className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-3 py-1 rounded-full">04 // <ScrambleText text="PRESTIGE & ACHIEVEMENTS — HORIZONTAL WALL" /></p>
                <h2 className="font-display font-[800] leading-none tracking-tighter text-[44px] mt-3"><span className="text-white">Verified Engineering</span> <span className="text-stroke">Victories.</span></h2>
              </div>
              <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-white/40"><span>DRAG → SCROLL TO EXPLORE</span><span className="w-28 h-[2px] bg-white/10 rounded-full overflow-hidden"><motion.span style={{ scaleX: scaleAch }} className="block h-full bg-[#CCFF00] origin-left" /></span></div>
            </div>
            <div className="flex-1 flex items-center overflow-hidden">
              <motion.div style={{ x: xAch }} className="flex gap-6 pl-[4vw] pr-[8vw] will-change-transform">
                {ACHIEVEMENTS.map((a, idx) => {
                  const Icon = a.icon, isPatent = a.index === '02'
                  return (
                    <TiltCard key={a.index} intensity={6} className="shrink-0">
                    <GlareCard className="shrink-0 w-[480px] h-[360px] rounded-[32px]">
                    <div onClick={() => isPatent && setPatentOpen(true)} className={`glare-card group relative w-full h-full rounded-[32px] bg-[#111] border p-7 flex flex-col gap-5 overflow-hidden cursor-pointer ${isPatent ? 'border-[#CCFF00]/30 hover:border-[#CCFF00]/50' : 'border-white/10 hover:border-white/20'}`}>
                      <div className="absolute bottom-0 right-3 text-[110px] font-display font-black leading-none text-white/[0.03] group-hover:text-white/[0.06] select-none">{a.index}</div>
                      <div className="flex justify-between items-start gap-2"><span className="text-[10px] font-black tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">{a.type}</span><span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full bg-white text-black"><Star className="w-3.5 h-3.5 text-[#FFB800] fill-[#FFB800]" />{a.metric}</span></div>
                      <div className="flex gap-4"><div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 grid place-items-center shrink-0 group-hover:bg-[#CCFF00] group-hover:border-[#CCFF00] transition-colors"><Icon className="w-7 h-7" style={{ color: a.color }} /></div><div><h3 className="font-display font-black text-[18px] leading-tight">{a.title}</h3><p className="text-xs font-mono font-bold text-[#CCFF00] mt-1">{a.team}</p></div></div>
                      <p className="text-sm text-white/60 leading-relaxed flex-1">{a.desc}</p>
                      <div className="pt-4 border-t border-white/10 flex justify-between text-xs font-mono text-white/30"><span className="flex items-center gap-2"><span className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse" /> VERIFIED MILESTONE {isPatent && '• CLICK TO STAMP'}</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div>
                    </div>
                    </GlareCard>
                    </TiltCard>
                  )
                })}
                <div className="shrink-0 w-[360px] h-[360px] rounded-[32px] border-2 border-dashed border-white/15 bg-white/[0.02] grid place-items-center p-8 text-center">
                  <div><div className="w-12 h-12 rounded-full bg-[#CCFF00] text-black grid place-items-center mx-auto"><Trophy className="w-6 h-6" /></div><h4 className="font-display font-black text-lg mt-3">MORE HONOURS</h4><p className="text-xs text-white/50 mt-1">12+ championships & counting</p><div className="mt-4 h-1 w-20 bg-[#CCFF00] rounded-full mx-auto" /></div>
                </div>
              </motion.div>
            </div>
            <div className="px-6 md:px-8 pb-6 flex justify-center gap-2">
              {[0,1,2,3].map(i => <ScrollDot key={i} progress={achProgress} index={i} total={4} />)}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {patentOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setPatentOpen(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} data-lenis-prevent className="w-full max-w-md max-h-[90dvh] overflow-y-auto overscroll-contain rounded-[24px] bg-[#0F0F0F] border-2 border-[#CCFF00]/30 p-5 sm:p-7 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-[#CCFF00] text-xs font-black tracking-widest"><ShieldCheck className="w-4 h-4" /> OFFICIAL PATENT RECORD</div>
              <button onClick={() => setPatentOpen(false)} className="w-8 h-8 rounded-full bg-white/10 grid place-items-center hover:bg-white hover:text-black transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div><h3 className="font-display font-black text-2xl">Indian Patent Granted</h3><span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#FFB800]/15 border border-[#FFB800]/30 text-[#FFB800] text-xs font-black">PATENT NO. 492026/IN</span></div>
            <div className="space-y-2 text-xs font-mono bg-black rounded-2xl p-4 border border-white/5">
              <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-white/40">Title:</span><strong className="text-white">Low-Power Edge IoT Mesh</strong></div>
              <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-white/40">Inventors:</span><strong className="text-[#CCFF00]">ECE Research Cell</strong></div>
              <div className="flex justify-between"><span className="text-white/40">Jurisdiction:</span><strong>Govt of India</strong></div>
            </div>
            <button onClick={() => setPatentOpen(false)} className="w-full py-3 rounded-full bg-white text-black font-black text-sm hover:bg-[#CCFF00] transition-colors">Close Record</button>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </section>
  )
}

// --- FACULTY ---
function FacultySection() {
  const ref = useRef(null), isInView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <section id="faculty" ref={ref} className="bg-[#08080A] py-16 md:py-24 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-[#7000FF]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="px-4 md:px-8 max-w-[1600px] mx-auto relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
                <p className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-3 py-1 rounded-full">05 // <ScrambleText text="FACULTY ADVISORS" /></p>
            <h2 className="font-display font-[800] leading-none tracking-tighter text-[9vw] md:text-[52px] mt-3 text-white"><span className="block">Faculty Leadership</span><span className="block text-stroke">& Laboratory Guidance.</span></h2>
          </div>
          <p className="text-xs font-mono text-white/40 max-w-[320px] md:text-right">Distinguished faculty directing labs, research, and academic excellence.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 md:gap-6 items-start">
          {FACULTY.map((f, idx) => (
            <div key={f.code} className="sticky" style={{ top: `calc(84px + ${idx * 14}px)` }}>
            <TiltCard intensity={6} className="h-full">
            <GlareCard className="h-full rounded-[24px]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: idx * 0.09, duration: 0.6, ease: [0.16,1,0.3,1] }} className="glare-card group relative h-full rounded-[24px] bg-[#111] border border-white/10 p-0 flex flex-col gap-0 hover:border-white/15 hover:bg-[#141414] transition-colors overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
              {/* Top image with duotone */}
              <div className="relative h-[112px] overflow-hidden">
                <img src={f.image} alt={f.name} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/60 to-transparent" />
                <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ background: `linear-gradient(120deg, ${f.color} 0%, transparent 60%)` }} />
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                  <span className="text-[10px] font-black tracking-widest px-3 py-1 rounded-full border backdrop-blur shadow-sm" style={{ background: `${f.color}18`, borderColor: `${f.color}35`, color: f.color }}>{f.badge}</span>
                  <span className="text-[11px] font-mono text-white/70 font-bold bg-black/60 backdrop-blur border border-white/10 px-2 py-1 rounded-full">{f.code}</span>
                </div>
                <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#111] shadow-[0_8px_20px_rgba(0,0,0,0.4)] bg-[#111]"><img src={f.image} alt={f.name} className="w-full h-full object-cover" loading="lazy" /></div>
              </div>
              <div className="p-6 pt-8 flex flex-col gap-4 flex-1">
                <div><h3 className="font-display font-black text-[17px] leading-tight group-hover:text-[#CCFF00] transition-colors">{f.name}</h3><p className="text-xs font-mono font-bold text-[#FFB800] mt-1 line-clamp-1">{f.designation}</p><p className="text-[11px] text-white/40 line-clamp-1">{f.dept}</p></div>
                <div className="flex items-center gap-2 text-xs font-mono text-white/60 bg-white/5 border border-white/5 rounded-full px-3 py-2"><BookOpen className="w-4 h-4 text-[#CCFF00] shrink-0" />{f.pubs}</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-white/40"><FlaskConical className="w-3.5 h-3.5 text-[#FFB800]" /> RESEARCH DOMAINS</div>
                  <div className="flex flex-wrap gap-1.5">{f.interests.map(i => <span key={i} className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 group-hover:border-white/15 group-hover:bg-white/10 transition-colors">{i}</span>)}</div>
                </div>
              </div>
              <div className="mx-6 mb-6 pt-4 border-t border-white/10 flex justify-between text-xs font-mono text-white/30"><span>PIET ECE</span><span className="text-[#CCFF00] font-bold flex items-center gap-1 group-hover:gap-1.5 transition-all">VIEW DOSSIER <ChevronRight className="w-3 h-3" /></span></div>
            </motion.div>
            </GlareCard>
            </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- TEAM ---
function TeamSection() {
  const [activeTab, setActiveTab] = useState('All'), [search, setSearch] = useState(''), [selected, setSelected] = useState(null), [copied, setCopied] = useState(null)
  const ref = useRef(null), isInView = useInView(ref, { once: true, margin: "-40px" })
  const tabs = ['All', 'Executive Council', 'Technical Leads', 'Design & Media', 'Event Management']
  const filtered = useMemo(() => TEAM.filter(m => {
    const matchTab = activeTab === 'All' || m.cat === activeTab
    const q = search.trim().toLowerCase()
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q) || m.specialty.toLowerCase().includes(q)
    return matchTab && matchSearch
  }), [activeTab, search])
  const featuredTeam = useMemo(() => TEAM.slice(0, 6), [])
  const pinTeamRef = useRef(null)
  const { scrollYProgress: teamProgress } = useScroll({ target: pinTeamRef, offset: ["start start", "end end"] })
  const [activeTeamIdx, setActiveTeamIdx] = useState(0)
  useEffect(() => {
    const unsub = teamProgress.on("change", (v) => {
      const idx = Math.min(featuredTeam.length - 1, Math.max(0, Math.floor(v * featuredTeam.length + 0.0001)))
      setActiveTeamIdx(idx)
    })
    return () => unsub()
  }, [teamProgress, featuredTeam.length])
  const copyEmail = (email, e) => { e?.stopPropagation(); navigator.clipboard?.writeText(email); setCopied(email); setTimeout(() => setCopied(null), 2200) }
  const quoteSkew = useMarqueeSkew()
  return (
    <section id="team" ref={ref} className="bg-[#0A0A0A] py-16 md:py-24 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="px-4 md:px-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-3 py-1 rounded-full"><Shield className="w-3.5 h-3.5" /> 06 // STUDENT LEADERSHIP — 30 CREATIVES</p>
            <h2 className="font-display font-[800] leading-none tracking-tighter text-[9vw] md:text-[52px] mt-3 text-white"><span className="block">Student Leadership</span><span className="block text-stroke">Command Council.</span></h2>
          </div>
          <p className="text-xs font-mono text-white/40 max-w-[320px] md:text-right">Every leader equal — hover to reveal quote, click for dossier. 30 distinct voices.</p>
        </div>
        {/* Team quote marquee — creative for ALL */}
        <div className="mb-6 rounded-[16px] bg-[#0F0F0F] border border-white/10 overflow-hidden py-2.5">
          <motion.div style={{ skewX: quoteSkew }} className="will-change-transform">
            <div className="flex whitespace-nowrap animate-marquee marquee" style={{ width: 'max-content' }}>
              {[...Array(2)].map((_, r) => (
                <span key={r} className="flex items-center gap-6 px-4">
                  {TEAM.slice(0, 10).map(m => (
                    <span key={m.name + r} className="inline-flex items-center gap-2 text-xs font-mono text-white/50"><span className="w-1 h-1 bg-[#CCFF00] rounded-full" /> “{m.quote.slice(0, 56)}…” <span className="text-white font-bold">— {m.name.split(' ')[0]}</span> <span className="opacity-20">•</span></span>
                  ))}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Pinned scroll intro — each member appears as you scroll (desktop) */}
        <div ref={pinTeamRef} className="hidden lg:block pin-wrap !h-[320vh] -mx-4 md:-mx-8">
          <div className="pin-sticky bg-[#0A0A0A] border-y border-white/5">
            <div className="h-full max-w-[1600px] mx-auto px-4 md:px-8 flex items-center py-8">
              <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 w-full items-center">
                <div className="relative h-[440px] rounded-[32px] overflow-hidden bg-[#0F0F0F] border border-white/10">
                  <AnimatePresence mode="wait">
                    <motion.div key={activeTeamIdx} initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -28, scale: 0.97 }} transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }} className="absolute inset-0 p-1">
                      <div className="h-full rounded-[28px] overflow-hidden bg-gradient-to-br from-[#111] to-black border border-white/10 flex shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
                        <div className="w-[46%] relative overflow-hidden">
                          <img src={featuredTeam[activeTeamIdx].image} alt={featuredTeam[activeTeamIdx].name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20" />
                          <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur border border-white/15 text-[10px] font-black tracking-widest text-white">{featuredTeam[activeTeamIdx].council} • {featuredTeam[activeTeamIdx].year}</span>
                          <span className="absolute bottom-4 left-4 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest border backdrop-blur" style={{ background: (featuredTeam[activeTeamIdx].council==='SPACE'?'#FFB800':'#CCFF00')+'18', borderColor: (featuredTeam[activeTeamIdx].council==='SPACE'?'#FFB800':'#CCFF00')+'35', color: featuredTeam[activeTeamIdx].council==='SPACE'?'#FFB800':'#CCFF00' }}>{featuredTeam[activeTeamIdx].role}</span>
                        </div>
                        <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between min-w-0">
                          <div>
                            <h3 className="font-display font-black text-[26px] leading-none tracking-tight">{featuredTeam[activeTeamIdx].name}</h3>
                            <p className="text-xs font-mono font-bold mt-1" style={{ color: featuredTeam[activeTeamIdx].council==='SPACE'?'#FFB800':'#CCFF00' }}>{featuredTeam[activeTeamIdx].specialty}</p>
                            <p className="text-[13px] leading-relaxed text-white/60 mt-4 line-clamp-4">“{featuredTeam[activeTeamIdx].quote}”</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-mono text-white/40">
                            <span className="w-8 h-px bg-white/15" /> {String(activeTeamIdx+1).padStart(2,'0')} / {String(featuredTeam.length).padStart(2,'0')} — SCROLL TO MEET NEXT
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {featuredTeam.map((_, i) => <span key={i} className={`h-1 rounded-full transition-all duration-300 ${i===activeTeamIdx ? 'w-8 bg-[#CCFF00]' : i < activeTeamIdx ? 'w-6 bg-[#CCFF00]/40' : 'w-6 bg-white/15'}`} />)}
                  </div>
                </div>
                <div className="py-2">
                  <p className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-3 py-1 rounded-full">TEAM SCROLL — 30 LEADERS</p>
                  <h3 className="font-display font-[800] text-[38px] leading-none tracking-tighter mt-3"><span className="text-white">Scroll to</span> <span className="text-stroke">meet each</span> <span className="text-white">leader.</span></h3>
                  <p className="text-sm text-white/50 mt-3 leading-relaxed">Pinned storytelling — photo + role + quote appear as you scroll. 30 distinct voices, one council.</p>
                  <div className="mt-6 w-full h-[2px] bg-white/10 rounded-full overflow-hidden"><motion.div style={{ scaleX: teamProgress }} className="h-full bg-[#CCFF00] origin-left" /></div>
                  <p className="text-[11px] font-mono tracking-widest text-white/30 mt-2 flex items-center gap-2"><span className="w-2 h-2 bg-[#CCFF00] rounded-full animate-pulse" /> {featuredTeam[activeTeamIdx].name} • {featuredTeam[activeTeamIdx].council}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href="#team-grid" onClick={e => { e.preventDefault(); document.getElementById('team-grid')?.scrollIntoView({ behavior: 'smooth' }) }} className="px-5 py-2.5 rounded-full bg-white text-black font-black text-xs hover:bg-[#CCFF00] transition-colors">VIEW FULL GRID ↓</a>
                    <Link to="/developer" className="px-5 py-2.5 rounded-full bg-[#CCFF00] text-black font-black text-xs inline-flex items-center gap-1.5 hover:bg-white transition-colors shadow-[0_0_20px_rgba(204,255,0,0.35)]">Meet the developer <ArrowUpRight className="w-3.5 h-3.5" /></Link>
                    <span className="px-4 py-2.5 rounded-full border border-white/10 text-white/60 text-xs font-mono hidden sm:inline-flex items-center gap-1.5">SCROLL <ArrowDown className="w-3 h-3" /></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="team-grid" className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 overflow-x-auto hide-scrollbar snap-x snap-mandatory w-full lg:w-fit" role="tablist" aria-label="Team categories">
            {tabs.map(t => {
              const count = t === 'All' ? TEAM.length : TEAM.filter(m => m.cat === t).length
              return <button key={t} role="tab" aria-selected={activeTab === t} onClick={() => setActiveTab(t)} className={`snap-start shrink-0 px-3.5 py-2.5 sm:py-2 rounded-xl text-[11px] font-mono font-black flex items-center gap-1.5 min-h-[44px] sm:min-h-0 whitespace-nowrap transition-colors ${activeTab === t ? 'bg-[#CCFF00] text-black' : 'text-white/60 hover:text-white hover:bg-white/10 active:scale-95'}`}>{t} <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === t ? 'bg-black text-white' : 'bg-white/10'}`}>{count}</span></button>
            })}
          </div>
          <div className="relative w-full">
            <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leader, role, specialty... (press / to focus)" autoComplete="off" inputMode="search" className="w-full pl-10 pr-10 py-3 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 text-[16px] sm:text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]/40 focus:bg-white/10 transition-colors min-h-[48px] sm:min-h-0" aria-label="Search team members" />
            {search && <button onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center text-white/40 hover:text-white rounded-full hover:bg-white/10"><X className="w-4 h-4" /></button>}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 auto-rows-fr">
          {filtered.map((m, idx) => {
            const isSpace = m.council === 'SPACE', isSinc = m.council === 'SINC'
            const accent = isSpace ? '#FFB800' : isSinc ? '#CCFF00' : '#7000FF'
            return (
              <TiltCard key={m.name} intensity={7} className="h-full">
              <GlareCard className="h-full rounded-[24px]">
              <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: (idx % 14) * 0.02, duration: 0.4, ease: [0.16,1,0.3,1] }} onClick={() => setSelected(m)} className="glare-card group cursor-pointer h-full rounded-[24px] bg-[#0F0F0F] border border-white/10 p-[1px] flex flex-col overflow-hidden hover:border-white/15 hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)] active:scale-[0.98] transition-all relative">
                <div className="rounded-[23px] bg-[#111] flex-1 flex flex-col p-4 sm:p-5 gap-3 relative overflow-hidden">
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} aria-hidden />
                  {/* Council dot + role */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full border backdrop-blur" style={{ color: accent, borderColor: accent+'30', background: accent+'12' }}><span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} aria-hidden />{m.council}</span>
                    <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} aria-hidden />
                  </div>
                  {/* Avatar with creative ring */}
                  <div className="relative mx-auto">
                    <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-white/10 to-transparent blur-[1px]" aria-hidden />
                    <div className="relative w-[88px] h-[88px] sm:w-[92px] sm:h-[92px] rounded-[20px] overflow-hidden border-2 border-white/10 group-hover:border-white/20 transition-colors p-[2px] bg-[#0A0A0A]">
                      <div className="w-full h-full rounded-[16px] overflow-hidden relative">
                        <img src={m.image} alt={m.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[700ms]" loading="lazy" decoding="async" />
                        {/* Hover quote overlay - creative for ALL */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
                          <p className="text-[10px] leading-snug text-white font-medium line-clamp-3">“{m.quote}”</p>
                        </div>
                      </div>
                    </div>
                    {/* Specialty pill peek */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-full bg-black border border-white/10 text-[9px] font-mono font-bold text-white/80 shadow-lg opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 hidden sm:flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-[#CCFF00]" />{m.specialty.split(' ')[0]}
                    </div>
                  </div>
                  <div className="text-center space-y-1 flex-1">
                    <span className="inline-block text-[9px] font-black tracking-widest px-2 py-1 rounded-full bg-white text-black border border-white shadow-sm max-w-full truncate">{m.role}</span>
                    <h3 className="font-display font-black text-[13px] sm:text-sm leading-tight truncate group-hover:text-[#CCFF00] transition-colors">{m.name}</h3>
                    <p className="text-[10px] font-mono text-white/40">{m.year} • {m.council}</p>
                    <p className="text-[11px] font-mono text-white/30 line-clamp-1 hidden sm:block">{m.specialty}</p>
                  </div>
                  <div className="w-full pt-3 border-t border-white/5 flex justify-between items-center text-[10px] font-mono">
                    <span className="text-white/60 group-hover:text-[#CCFF00] flex items-center gap-1 font-bold transition-colors">VIEW <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></span>
                    <div className="flex gap-1.5">
                      <a href={m.linkedin || '#'} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} aria-label="LinkedIn" className="w-7 h-7 rounded-full bg-white text-black grid place-items-center hover:bg-[#CCFF00] hover:text-black transition-colors"><ExternalLink className="w-3 h-3" /></a>
                      <button onClick={e => copyEmail(m.email, e)} aria-label="Copy email" className="w-7 h-7 rounded-full bg-white/5 border border-white/10 grid place-items-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-colors"><Mail className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
              </GlareCard>
              </TiltCard>
            )
          })}
        </div>
        {filtered.length === 0 && <div className="text-center py-16 text-white/30 font-mono text-xs">NO LEADERS FOUND FOR &quot;{search.toUpperCase()}&quot;</div>}
        {copied && <div className="fixed z-50 left-4 right-4 sm:left-auto sm:right-6 bg-[#111] border border-[#CCFF00] text-white text-xs font-mono px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2" style={{ bottom: 'max(24px, calc(env(safe-area-inset-bottom) + 16px))' }}><Check className="w-4 h-4 text-[#00FF88] shrink-0" /> <span className="truncate">COPIED: <strong className="text-[#CCFF00]">{copied}</strong></span></div>}
      </div>

      <AnimatePresence>
        {selected && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} data-lenis-prevent className="w-full max-w-lg max-h-[90dvh] overflow-y-auto overscroll-contain rounded-[32px] bg-[#0F0F0F] border-2 border-[#CCFF00]/20 p-6 sm:p-7 md:p-8 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center gap-2 text-[#CCFF00] text-[11px] font-black tracking-widest"><Sparkles className="w-3.5 h-3.5 shrink-0" /> OFFICIAL DOSSIER // 2026-27</div>
              <button onClick={() => setSelected(null)} aria-label="Close dossier" className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-white/10 grid place-items-center hover:bg-white hover:text-black transition-colors shrink-0"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
              <img src={selected.image} alt={selected.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#CCFF00] shrink-0" />
              <div className="min-w-0 flex-1"><span className={`text-[11px] font-black tracking-widest px-3 py-1 rounded-full border ${selected.council === 'SPACE' ? 'text-[#FFB800] border-[#FFB800]/30 bg-[#FFB800]/10' : 'text-[#CCFF00] border-[#CCFF00]/30 bg-[#CCFF00]/10'}`}>{selected.role}</span><h3 className="font-display font-black text-xl sm:text-2xl mt-1.5 leading-none break-words">{selected.name}</h3><p className="text-xs font-mono text-white/40 mt-1">{selected.year} · Dept of ECE</p></div>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
              <div className="text-[10px] font-black tracking-widest text-white/30 flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-[#FFB800]" /> KEY DOMAIN SPECIALTY</div>
              <div className="font-display font-bold mt-1">{selected.specialty}</div>
            </div>
            <div className="rounded-2xl bg-black border border-white/5 p-4"><div className="text-[10px] font-black tracking-widest text-white/30">ENGINEERING STATEMENT</div><p className="text-sm text-white/70 italic leading-relaxed mt-1">&quot;{selected.quote}&quot;</p></div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => copyEmail(selected.email)} className="flex-1 py-3 rounded-full bg-[#CCFF00] text-black font-black text-xs flex items-center justify-center gap-2 hover:bg-white transition-colors min-h-[48px]"><Mail className="w-4 h-4" /> Copy Email</button>
              <a href={`mailto:${selected.email}`} className="px-6 py-3 rounded-full bg-white/10 border border-white/10 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-white hover:text-black transition-colors min-h-[48px]">Email <ExternalLink className="w-3.5 h-3.5" /></a>
            </div>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </section>
  )
}

// --- CONTACT ---
function Contact() {
  const [email, setEmail] = useState(''), [subscribed, setSubscribed] = useState(false), [form, setForm] = useState({ name: '', mail: '', budget: 'General Inquiry', msg: '' }), [sent, setSent] = useState(false)
  return (
    <section id="contact" className="bg-[#08080A] py-16 md:py-24 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-[#7000FF]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[#CCFF00]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="px-4 md:px-8 max-w-[1600px] mx-auto relative">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-3 py-1 rounded-full">● LET&apos;S CONNECT</p>
            <h2 className="font-display font-[800] leading-[0.85] tracking-tighter text-[11vw] md:text-[68px] mt-4">
              <span className="block text-white">Engineering</span><span className="block text-stroke">Tomorrow&apos;s</span><span className="block text-[#CCFF00]">Silicon —</span>
            </h2>
            <p className="mt-4 text-sm text-white/60 max-w-[460px] leading-relaxed">The official student forum powering silicon synthesis, robotics, edge AI, and IEEE excellence at PIET.</p>
            <div className="mt-6 grid sm:grid-cols-2 gap-3 max-w-[520px]">
              <a href="mailto:ece.forum@piet.edu" className="rounded-2xl bg-white text-black p-5 flex justify-between items-center group hover:bg-[#CCFF00] transition-colors">
                <div><div className="text-[10px] font-mono tracking-widest opacity-60">EMAIL US</div><div className="font-black text-sm">ece.forum@piet.edu</div></div><span className="w-9 h-9 rounded-full bg-black text-white grid place-items-center group-hover:rotate-45 transition-transform">↗</span>
              </a>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <div className="text-[10px] font-mono tracking-widest text-white/40">VISIT US</div><div className="font-bold text-sm text-white">PIET Campus, ECE Dept</div><div className="text-xs text-white/40">Nagpur, India · 440034</div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs font-mono text-white/50">
              <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#CCFF00]" /> PIET Campus, ECE Department, Nagpur, India</div>
              <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#FFB800]" /> ece.forum@piet.edu</div>
            </div>
            <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="text-[11px] font-black tracking-widest text-white flex items-center gap-2"><Send className="w-3.5 h-3.5 text-[#7000FF]" /> DISPATCH RADAR — SUBSCRIBE</div>
              <p className="text-xs text-white/50 mt-1">Get hackathon alerts, silicon bootcamps, and forum announcements.</p>
              <form onSubmit={e => { e.preventDefault(); if (!email) return; setSubscribed(true); setTimeout(() => { setSubscribed(false); setEmail('') }, 3000) }} className="flex gap-2 mt-3">
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="student@college.edu" required type="email" inputMode="email" autoComplete="email" className="flex-1 px-4 py-3 rounded-xl bg-black border border-white/10 text-[16px] sm:text-sm placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]/40 text-white min-h-[44px]" />
                <button type="submit" className="px-5 py-3 rounded-xl bg-[#CCFF00] text-black font-black text-xs hover:bg-white transition-colors min-h-[44px] min-w-[64px] active:scale-95">JOIN</button>
              </form>
              {subscribed && <p className="text-xs font-mono text-[#00FF88] mt-2 flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Dispatch locked! You are registered.</p>}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-[32px] bg-[#111] border border-white/10 p-6 md:p-8">
              <div className="flex flex-wrap justify-between gap-3 items-center mb-6">
                <h3 className="font-display font-black text-xl">SEND A DISPATCH</h3><span className="text-[11px] font-black tracking-widest px-3 py-1 rounded-full bg-[#00FF88]/15 border border-[#00FF88]/30 text-[#00FF88] flex items-center gap-1.5"><span className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse" /> AVG REPLY: 2 HOURS</span>
              </div>
              {!sent ? (
                <form onSubmit={e => { e.preventDefault(); setSent(true); setTimeout(() => setSent(false), 3000) }} className="space-y-4" noValidate>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="space-y-1.5"><span className="text-[11px] font-mono tracking-widest text-white/40">YOUR NAME *</span><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Alex Morgan" autoComplete="name" className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-[16px] sm:text-sm placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]/40 focus:bg-white/10 transition-colors min-h-[48px]" /></label>
                    <label className="space-y-1.5"><span className="text-[11px] font-mono tracking-widest text-white/40">EMAIL *</span><input required type="email" inputMode="email" autoComplete="email" value={form.mail} onChange={e => setForm({ ...form, mail: e.target.value })} placeholder="alex@piet.edu" className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-[16px] sm:text-sm placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]/40 focus:bg-white/10 transition-colors min-h-[48px]" /></label>
                  </div>
                  <label className="space-y-1.5 block">
                    <span className="text-[11px] font-mono tracking-widest text-white/40">INQUIRY TYPE</span>
                    <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
                      {['General Inquiry', 'Join Forum', 'Sponsorship'].map(b => <button type="button" key={b} onClick={() => setForm({ ...form, budget: b })} className={`py-3.5 sm:py-3 rounded-xl border text-xs sm:text-xs font-bold transition-colors min-h-[44px] ${form.budget === b ? 'bg-[#CCFF00] text-black border-[#CCFF00]' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 active:scale-95'}`}>{b}</button>)}
                    </div>
                  </label>
                  <label className="space-y-1.5 block"><span className="text-[11px] font-mono tracking-widest text-white/40">MESSAGE</span><textarea value={form.msg} onChange={e => setForm({ ...form, msg: e.target.value })} rows={4} placeholder="Tell us about your interest, project idea, or question..." className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-[16px] sm:text-sm placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]/40 focus:bg-white/10 transition-colors resize-none min-h-[110px]" /></label>
                  <button type="submit" className="w-full py-4 rounded-full bg-[#CCFF00] text-black font-black tracking-wide hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[52px]">SEND DISPATCH <span className="w-7 h-7 rounded-full bg-black text-white grid place-items-center text-xs" aria-hidden>→</span></button>
                  <p className="text-[11px] text-center text-white/30 font-mono">We reply within 2 hours · PIET ECE FORUM</p>
                </form>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="py-14 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#CCFF00] text-black grid place-items-center text-2xl mx-auto">✓</div>
                  <h4 className="font-display font-black text-2xl mt-4">DISPATCH SENT!</h4><p className="text-white/50 mt-1">We&apos;ll reply within 2 hours.</p>
                </motion.div>
              )}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              {[{ v: '48h', l: 'Discovery' }, { v: '2-3d', l: 'Proposal' }, { v: '7d', l: 'Kickoff' }].map(s => <div key={s.l} className="rounded-2xl bg-white/5 border border-white/5 py-3"><div className="font-black text-[#CCFF00]">{s.v}</div><div className="text-[11px] font-mono text-white/40 tracking-wide">{s.l}</div></div>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const skew = useMarqueeSkew()
  return (
    <footer className="bg-black border-t border-white/10 overflow-hidden">
      {/* Massive editorial typography - Awwwards impression */}
      <div className="relative border-b border-white/10 overflow-hidden select-none" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#CCFF00]/[0.06] via-transparent to-transparent pointer-events-none" />
        <div className="px-4 md:px-8 max-w-[1600px] mx-auto py-8 sm:py-10">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono tracking-[0.2em] text-white/40 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#CCFF00] text-black font-black">©2026 — PIET NAGPUR</span>
            <span className="hidden sm:inline">SPACE × SINC • ARCHITECTING TOMORROW&apos;S SILICON</span>
            <span className="ml-auto hidden md:inline-flex items-center gap-2"><span className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse" /> SYSTEM NOMINAL — ALL LABS ONLINE</span>
          </div>
          <h2 className="massive-text text-[min(10vw,170px)] whitespace-nowrap leading-none -mx-2 sm:mx-0">
            PIET<span className="text-stroke"> — </span>ECE<span className="text-[#CCFF00]" style={{ WebkitTextFillColor: '#CCFF00' }}>•</span>FORUM
          </h2>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-white/30">
            <span>EST. 2012 (SPACE) • EST. 2018 (SINC) — 1,500+ ENGINEERS</span>
            <span className="flex items-center gap-2">BUILT WITH OBSESSION — NAGPUR, INDIA <span className="hidden sm:inline">•</span> <span className="w-6 h-px bg-white/20 hidden sm:block" /></span>
          </div>
        </div>
      </div>
      <div className="px-4 md:px-8 max-w-[1600px] mx-auto">
        <div className="py-10 flex flex-col lg:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-black border border-amber-500/30 p-1 flex items-center justify-center"><img src="/space_logo.png" alt="SPACE" className="w-full h-full object-contain" /></div>
                <span className="text-white/20 text-[10px]">×</span>
                <div className="w-8 h-8 rounded-lg bg-black border border-[#CCFF00]/30 p-1 flex items-center justify-center"><img src="/sinc_logo.png" alt="SINC" className="w-full h-full object-contain" /></div>
              </div>
              <div><div className="font-display font-black text-sm leading-none">SPACE & SINC FORUM</div><div className="text-[10px] font-mono tracking-widest text-[#CCFF00] font-bold">DEPT OF ELECTRONICS & COMMUNICATION</div></div>
            </div>
            <p className="text-xs text-white/40 mt-3 max-w-[380px] leading-relaxed">Building tomorrow&apos;s engineers through silicon synthesis, IoT, and robotics innovation at PIET Nagpur.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-xs">
            <div>
              <div className="font-mono text-[11px] tracking-widest text-white/30 mb-3 flex items-center gap-1.5"><Cpu className="w-3 h-3 text-[#CCFF00]" /> COMMAND INDEX</div>
              <div className="space-y-2 font-mono text-white/50">
                <a href="#hero" className="block hover:text-white">00 Overview</a>
                <a href="#about" className="block hover:text-white">01 Architecture</a>
                <a href="#events" className="block hover:text-white">02 Calendar</a>
                <a href="#gallery" className="block hover:text-white">03 Archive</a>
                <a href="#achievements" className="block hover:text-white">04 Prestige</a>
                <a href="#faculty" className="block hover:text-white">05 Faculty</a>
                <a href="#team" className="block hover:text-white">06 Team</a>
                <a href="#contact" className="block hover:text-white">07 Dispatch</a>
              </div>
            </div>
            <div>
              <div className="font-mono text-[11px] tracking-widest text-white/30 mb-3 flex items-center gap-1.5"><Globe className="w-3 h-3 text-[#FFB800]" /> COORDINATES</div>
              <div className="space-y-2 text-white/50">
                <div className="flex gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#CCFF00] shrink-0" /> PIET Campus, Nagpur</div>
                <div className="flex gap-1.5"><Mail className="w-3.5 h-3.5 text-[#FFB800] shrink-0" /> ece.forum@piet.edu</div>
              </div>
            </div>
            <div>
              <div className="font-mono text-[11px] tracking-widest text-white/30 mb-3">DEPARTMENT</div>
              <div className="space-y-2 text-white/50">
                <div className="block">SPACE Forum (Estd. 2012)</div>
                <div className="block">SINC Council (Estd. 2018)</div>
                <div className="block">PIET Nagpur • ECE Dept.</div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 flex flex-col md:flex-row justify-between gap-3 text-[11px] font-mono tracking-widest text-white/30">
          <span className="flex items-center gap-2"><span className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse" /> © 2026 SPACE & SINC ECE FORUM. ALL RIGHTS RESERVED.</span>
          <span className="flex flex-wrap gap-4">
            <Link to="/register" className="hover:text-[#CCFF00] flex items-center gap-1">Registration Portal <ArrowUpRight className="w-3 h-3" /></Link>
            <Link to="/admin" className="hover:text-[#FFB800] flex items-center gap-1">Admin Console <ArrowUpRight className="w-3 h-3" /></Link>
            <Link to="/developer" className="hover:text-[#00D9FF] flex items-center gap-1">Developer Dossier <ArrowUpRight className="w-3 h-3" /></Link>
          </span>
        </div>
      </div>
      <div className="overflow-hidden border-t border-white/5 bg-[#CCFF00] py-2">
        <motion.div style={{ skewX: skew }} className="will-change-transform">
          <div className="flex animate-marquee whitespace-nowrap text-black font-black tracking-[0.2em] text-xs" style={{ width: 'max-content' }}>
            {[...Array(8)].map((_, i) => <span key={i} className="px-8">SPACE & SINC × PIET ECE FORUM — ARCHITECTING TOMORROW&apos;S SILICON — EST. 2012 • EST. 2018 — NAGPUR • INDIA —</span>)}
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

// --- PREMIUM REGISTRATION MODAL (backend wired, premium UI + Google required) ---
function PremiumRegistrationModal({ event, open, onClose, onSuccess }) {
  const { user, isAuthenticated, loginWithGoogle } = useAuth()
  const [showGooglePrompt, setShowGooglePrompt] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', department: 'Electronics & Communication Engineering', year: '3rd Year', rollNumber: '', college: 'PIET' })
  const [coupon, setCoupon] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    if (open) {
      setDone(null); setErr(''); setLoading(false)
      if (isAuthenticated && user) {
        setForm(prev=>({ ...prev, name: user.name || prev.name, email: user.email || prev.email, department: user.department || prev.department, year: user.year || prev.year, phone: user.phone || prev.phone }))
        setShowGooglePrompt(false)
      } else {
        setShowGooglePrompt(true)
      }
    }
  }, [open, event, isAuthenticated, user])
  useEffect(() => {
    if (isAuthenticated && user && open) {
      setForm(prev=>({ ...prev, name: user.name || prev.name, email: user.email || prev.email }))
      setShowGooglePrompt(false)
    }
  }, [isAuthenticated, user, open])
  if (!open || !event) return null
  if (showGooglePrompt && !isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#04060A]/80 backdrop-blur-xl" onClick={onClose} aria-hidden />
        <motion.div initial={{ y: 16, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} className="relative w-full max-w-[420px] max-h-[90dvh] overflow-y-auto overscroll-contain rounded-[28px] bg-[#0F0F0F] border border-white/10 p-6 sm:p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.6)]" data-lenis-prevent>
          <div className="w-12 h-12 rounded-2xl bg-white text-black grid place-items-center mx-auto"><ShieldCheck className="w-6 h-6" /></div>
          <h3 className="font-display font-black text-xl mt-4">Google Sign-In Required</h3>
          <p className="text-sm text-white/60 mt-2 leading-relaxed">You must sign in with your Google account before registering for <span className="text-white font-bold">{event.title}</span>. Your pass will be linked to your Google identity.</p>
          <button onClick={async()=>{ try{ await loginWithGoogle(); setShowGooglePrompt(false)} catch(e){ setErr(e?.message||'Google sign-in failed')} }} className="mt-6 w-full py-3.5 rounded-full bg-white text-black font-black text-sm flex items-center justify-center gap-2 hover:bg-[#CCFF00] transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
            Continue with Google
          </button>
          {err && <div className="mt-3 text-xs text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl p-2">{err}</div>}
          <button onClick={onClose} className="mt-3 w-full py-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm hover:text-white transition-colors">Cancel</button>
          <p className="text-[11px] text-white/30 font-mono mt-3">Secured with Supabase • Your Google identity is only used for pass retrieval</p>
        </motion.div>
      </div>
    )
  }
  const price = Number(event.price) || 0
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) { setErr('Name, email, phone are required'); return }
    setLoading(true); setErr('')
    try {
      // coupon validation (from forumApi)
      let finalAmount = price
      let couponApplied = null
      if (coupon.trim()) {
        const coupons = await forumApi.getCoupons().catch(()=>[])
        const found = coupons.find(c=>c.code.toLowerCase()===coupon.trim().toLowerCase() && c.active!==false)
        if (found) {
          couponApplied = found.code
          if (found.discountType==='percentage') finalAmount = Math.max(0, price - (price * found.discountValue/100))
          else finalAmount = Math.max(0, price - found.discountValue)
          await forumApi.incrementCouponUsage(found.code).catch(()=>{})
        } else {
          setErr('Invalid coupon code'); setLoading(false); return
        }
      }
      const passPayload = {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        eventVenue: event.venue,
        userName: form.name.trim(),
        userEmail: form.email.trim().toLowerCase(),
        userPhoto: `https://i.pravatar.cc/200?u=${encodeURIComponent(form.email)}`,
        department: form.department,
        year: form.year,
        phone: form.phone.trim(),
        rollNumber: form.rollNumber.trim() || undefined,
        paymentId: finalAmount===0 ? 'FREE_PASS' : `PAY-${Date.now()}`,
        amount: finalAmount,
        paymentStatus: finalAmount===0 ? 'FREE' : 'PAID',
        status: 'CONFIRMED',
        registeredAt: new Date().toLocaleString('en-IN'),
        securityHash: Math.random().toString(36).substring(2,10).toUpperCase(),
        couponApplied,
      }
      const created = await forumApi.createPass(passPayload)
      if (created && created.alreadyRegistered) {
        setErr('You already have a pass for this event. Check My Passes.')
        setLoading(false)
        return
      }
      // also store locally for MyPasses quick access
      try {
        const key = 'ece_user_passes_' + form.email.trim().toLowerCase()
        const prev = JSON.parse(localStorage.getItem(key) || '[]')
        localStorage.setItem(key, JSON.stringify([created || passPayload, ...prev]))
        localStorage.setItem('ece_last_user_email', form.email.trim().toLowerCase())
      } catch {}
      setDone(created || passPayload)
      onSuccess && onSuccess(created || passPayload)
      // confetti
      try { const confetti = (await import('canvas-confetti')).default; confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors: ['#CCFF00','#7000FF','#FFB800'] }) } catch {}
    } catch (ex) {
      setErr(ex?.message || 'Registration failed. Try again.')
    } finally { setLoading(false) }
  }
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#04060A]/80 backdrop-blur-xl" onClick={onClose} aria-hidden />
      <motion.div initial={{ y: 16, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 8, opacity: 0 }} data-lenis-prevent className="relative w-full max-w-[560px] max-h-[92dvh] overflow-y-auto overscroll-contain rounded-[28px] bg-[#0F0F0F] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <div className="sticky top-0 z-10 bg-[#0F0F0F] border-b border-white/10 p-5 flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#CCFF00] text-black grid place-items-center font-black text-lg">◈</div>
            <div><div className="text-[11px] font-mono tracking-widest text-[#CCFF00]">REGISTER • {event.badge}</div><h3 className="font-display font-black text-[18px] leading-tight pr-2">{event.title}</h3><p className="text-xs text-white/50 font-mono">{event.date} • {event.time} • {event.venue}</p></div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 border border-white/10 grid place-items-center hover:bg-white hover:text-black transition-colors shrink-0"><X className="w-4 h-4" /></button>
        </div>
        {!done ? (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="space-y-1.5"><span className="text-[11px] font-mono tracking-widest text-white/40">FULL NAME *</span><input value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} placeholder="Alex Morgan" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[16px] sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]/40" /></label>
              <label className="space-y-1.5"><span className="text-[11px] font-mono tracking-widest text-white/40">EMAIL *</span><input type="email" value={form.email} onChange={e=>setForm({ ...form, email: e.target.value })} placeholder="alex@piet.edu" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[16px] sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]/40" /></label>
              <label className="space-y-1.5"><span className="text-[11px] font-mono tracking-widest text-white/40">PHONE *</span><input value={form.phone} onChange={e=>setForm({ ...form, phone: e.target.value })} placeholder="9876543210" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[16px] sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]/40" /></label>
              <label className="space-y-1.5"><span className="text-[11px] font-mono tracking-widest text-white/40">ROLL NUMBER</span><input value={form.rollNumber} onChange={e=>setForm({ ...form, rollNumber: e.target.value })} placeholder="ECE2026-001" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[16px] sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]/40" /></label>
              <label className="space-y-1.5"><span className="text-[11px] font-mono tracking-widest text-white/40">DEPARTMENT</span><select value={form.department} onChange={e=>setForm({ ...form, department: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#CCFF00]/40"><option>Electronics & Communication Engineering</option><option>Computer Engineering</option><option>Mechanical</option><option>Electrical</option><option>Other</option></select></label>
              <label className="space-y-1.5"><span className="text-[11px] font-mono tracking-widest text-white/40">YEAR</span><select value={form.year} onChange={e=>setForm({ ...form, year: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#CCFF00]/40"><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option></select></label>
            </div>
            <label className="space-y-1.5 block"><span className="text-[11px] font-mono tracking-widest text-white/40">COLLEGE</span><input value={form.college} onChange={e=>setForm({ ...form, college: e.target.value })} placeholder="PIET" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[16px] sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]/40" /></label>
            <div className="rounded-2xl bg-white/5 border border-white/5 p-4 flex items-center justify-between">
              <div><div className="text-[11px] font-mono tracking-widest text-white/40">PAYABLE AMOUNT</div><div className="font-display font-black text-xl">{price===0 ? 'FREE' : `₹${price}`}{coupon && <span className="text-xs text-[#00FF88] ml-2">coupon applied</span>}</div></div>
              <div className="text-right"><div className="text-[10px] font-mono text-white/30">COUPON</div><div className="flex gap-2 mt-1"><input value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())} placeholder="ECE2026" className="w-[120px] px-3 py-2 rounded-full bg-black border border-white/10 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]/40" /><span className="hidden sm:inline text-[11px] text-white/30 self-center">Try ECE2026, TARANG100</span></div></div>
            </div>
            {err && <div className="px-4 py-3 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-sm text-[#FF3B30]">{err}</div>}
            <button type="submit" disabled={loading} className="w-full py-4 rounded-full bg-[#CCFF00] text-black font-black tracking-wide hover:bg-white disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[52px]">
              {loading ? 'PROCESSING…' : price===0 ? 'CONFIRM REGISTRATION →' : `PAY ₹${price} & REGISTER →`} <span className="w-7 h-7 rounded-full bg-black text-white grid place-items-center text-xs" aria-hidden>↗</span>
            </button>
            <p className="text-[11px] text-center text-white/30 font-mono">By registering you agree to ECE Forum terms. Pass will be sent to email & available in My Passes.</p>
          </form>
        ) : (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#00FF88] text-black grid place-items-center mx-auto text-2xl">✓</div>
            <h4 className="font-display font-black text-2xl">REGISTERED!</h4>
            <p className="text-sm text-white/60">Your pass for <span className="text-white font-bold">{event.title}</span> is confirmed.</p>
            <div className="rounded-2xl bg-black border border-white/10 p-4 text-left font-mono text-xs space-y-1">
              <div className="flex justify-between"><span className="text-white/40">Pass ID:</span><span className="font-black text-[#CCFF00]">{done.passId || done.pass_id}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Name:</span><span>{done.userName || done.user_name}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Email:</span><span className="truncate ml-2">{done.userEmail || done.user_email}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Amount:</span><span>₹{done.amount ?? price}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={onClose} className="py-3 rounded-full bg-white text-black font-black text-sm hover:bg-[#CCFF00] transition-colors">DONE</button>
              <button onClick={()=>{ try{ const dataStr = JSON.stringify(done, null, 2); const blob=new Blob([dataStr],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${done.passId||'pass'}.json`; a.click(); URL.revokeObjectURL(url)}catch{} }} className="py-3 rounded-full bg-white/10 border border-white/10 text-white font-bold text-sm hover:bg-white hover:text-black transition-colors">DOWNLOAD JSON</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState([])
  const [cmdOpen, setCmdOpen] = useState(false)
  const reduced = usePrefersReducedMotion()
  const navigate = useNavigate()
  const { user: authUser, isAuthenticated, logout: authLogout } = useAuth()
  const [showGoogleAuth, setShowGoogleAuth] = useState(false)
  const [showMyPasses, setShowMyPasses] = useState(false)
  // --- BACKEND STATE (from website data) ---
  const [eventsList, setEventsList] = useState(EVENTS)
  const [galleryList, setGalleryList] = useState(GALLERY)
  const [heroConfig, setHeroConfig] = useState(HERO_CONFIG)
  const [announcement, setAnnouncement] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showReg, setShowReg] = useState(false)
  const [myPasses, setMyPasses] = useState([])
  const [isVerifying, setIsVerifying] = useState(false)
  const pushToast = (title, msg, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, title, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
  }
  useEffect(() => {
    if (reduced) return
    const isTouchDevice = typeof window !== 'undefined' && (
      window.matchMedia('(max-width: 1024px)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    )
    if (isTouchDevice) {
      // On mobile/touch devices, use native hardware-accelerated momentum scrolling (120Hz/60Hz)
      return
    }
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 0,
      gestureOrientation: 'vertical',
    })
    // expose for Framer useScroll sync
    // @ts-ignore
    window.__lenis = lenis
    let rafId
    function raf(time) { lenis.raf(time); rafId = requestAnimationFrame(raf) }
    rafId = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(rafId); lenis.destroy(); try { delete window.__lenis } catch {} }
  }, [reduced])
  useEffect(() => { document.body.style.overflow = loading || cmdOpen ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [loading, cmdOpen])
  // --- BACKEND SYNC (website data) ---
  useEffect(() => {
    const load = async () => {
      try {
        const [remoteEvents, remoteAnn, remoteHero, remoteGallery] = await Promise.all([
          forumApi.getEvents().catch(()=>null),
          forumApi.getAnnouncement().catch(()=>null),
          forumApi.getSiteHeroConfig().catch(()=>null),
          forumApi.getGalleryItems().catch(()=>null),
        ])
        if (Array.isArray(remoteEvents) && remoteEvents.length) {
          setEventsList(remoteEvents.map(e=>({
            id: e.id,
            title: e.title,
            category: e.category,
            status: e.status,
            date: e.date,
            time: e.time || '10:00 AM IST',
            venue: e.venue,
            description: e.description,
            badge: e.badge || 'EVENT',
            price: Number(e.price)||0,
            totalSeats: e.totalSeats || e.total_seats || 100,
            image: e.image || '/event_images/tarang.webp',
            participationType: e.participationType || e.participation_type || 'both'
          })))
        }
        if (typeof remoteAnn === 'string' && remoteAnn) setAnnouncement(remoteAnn)
        if (remoteHero && typeof remoteHero === 'object') setHeroConfig(prev=>({ ...prev, ...remoteHero }))
        if (Array.isArray(remoteGallery) && remoteGallery.length) setGalleryList(remoteGallery)
      } catch (err) { console.warn('backend sync failed', err) }
    }
    load()
    const iv = setInterval(load, 5000)
    const onGallery = () => {
      try { const c = localStorage.getItem('ece_gallery_archive_items'); if(c){ const p=JSON.parse(c); if(Array.isArray(p)) setGalleryList(p) } } catch {}
    }
    window.addEventListener('ece_gallery_updated', onGallery)
    window.addEventListener('storage', onGallery)
    return () => { clearInterval(iv); window.removeEventListener('ece_gallery_updated', onGallery); window.removeEventListener('storage', onGallery) }
  }, [])
  // Global keyboard: cmd+K, "/" , ESC
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmdOpen(o => !o) }
      if (e.key === 'Escape' && cmdOpen) setCmdOpen(false)
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !cmdOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        document.querySelector('input[placeholder*="Search leader"]')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cmdOpen])
  return (
    <div className="relative bg-[#08080A] selection:bg-[#CCFF00] selection:text-black">
      <a href="#hero" className="skip-link">Skip to content</a>
      <div className="grain" aria-hidden />
      <ScrollProgressBar />
      <Spotlight />
      <CustomCursor />
      <GlobalToast toasts={toasts} />
      <ScrollToTopFab />
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />
      {/* Hint pill for cmd+K - hidden on mobile */}
      {!loading && !cmdOpen && (
        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }} onClick={() => setCmdOpen(true)} className="hidden lg:flex fixed bottom-4 left-1/2 -translate-x-1/2 z-30 items-center gap-2 px-4 py-2 rounded-full bg-[#111] border border-white/10 text-xs font-mono text-white/60 hover:text-white hover:bg-white/10 hover:border-white/15 transition-colors shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
          <Command className="w-3.5 h-3.5" aria-hidden /> <span>Press</span> <span className="px-1.5 py-0.5 rounded bg-white text-black font-bold text-[11px]">⌘ K</span> <span>to jump</span>
        </motion.button>
      )}
      <AnimatePresence mode="wait">{loading && <Preloader key="preloader" onComplete={() => setLoading(false)} />}</AnimatePresence>
      {!loading && (
        <Routes>
          <Route path="/" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.55 }}>
              <Navbar onToast={pushToast} onOpenGoogleAuth={()=>setShowGoogleAuth(true)} onOpenMyPasses={()=>setShowMyPasses(true)} onOpenAdmin={()=>navigate('/admin')} isAuthenticated={isAuthenticated} user={authUser} onLogout={authLogout} />
          <main id="main">
            <Hero onToast={pushToast} heroConfig={heroConfig} announcement={announcement} />
            <MarqueeTicker announcement={announcement} />
            <LabsPin />
            <StatsSection />
            <AboutSection />
            <ProcessSection />
            <EventsSection eventsList={eventsList} onRegister={(evt)=>{ if(!isAuthenticated){ setShowGoogleAuth(true); pushToast('Login required','Please sign in with Google to register','error'); return} navigate(`/register?event=${evt.id}`)}} />
            <GallerySection galleryList={galleryList} />
            <AchievementsSection />
            <FacultySection />
            <TeamSection />
            <Contact />
          </main>
          <PremiumRegistrationModal event={selectedEvent} open={showReg} onClose={()=>setShowReg(false)} onSuccess={(pass)=>{ setMyPasses(p=>[...p, pass]); pushToast('Registered!', `${pass.eventTitle || pass.passId} confirmed`, 'success') }} />
          {/* My Passes quick access (backend) */}
          {myPasses.length>0 && (
            <div className="fixed bottom-20 left-4 z-30 hidden lg:block">
              <button onClick={()=> pushToast('My Passes', `${myPasses.length} pass(es) stored locally. Check console for details.`, 'success')} className="px-4 py-2 rounded-full bg-[#111] border border-white/10 text-xs font-mono text-white hover:bg-white hover:text-black transition-colors shadow-lg">
                🎟️ My Passes ({myPasses.length})
              </button>
            </div>
          )}
          <Footer />
          {/* App-like quick-jump dock (mobile only) */}
          <MobileDock />
            </motion.div>
          } />
          <Route path="/register" element={<RegisterPage eventsList={eventsList} />} />
          <Route path="/register/:eventId" element={<RegisterPage eventsList={eventsList} />} />
          <Route path="/admin" element={
            <AdminPage
              eventsList={eventsList}
              onAddEvent={async (newEvent)=>{ setEventsList(prev=>[newEvent, ...prev.filter(e=>e.id!==newEvent.id)]); await forumApi.createEvent(newEvent).catch(()=>{}); const fresh=await forumApi.getEvents().catch(()=>null); if(Array.isArray(fresh)) setEventsList(fresh.map(e=>({ id:e.id, title:e.title, category:e.category, status:e.status, date:e.date, time:e.time||'10:00 AM IST', venue:e.venue, description:e.description, badge:e.badge||'EVENT', price:Number(e.price)||0, totalSeats:e.totalSeats||e.total_seats||100, image:e.image||'/event_images/tarang.webp', participationType:e.participationType||e.participation_type||'both' })))}}
              onUpdateEvents={setEventsList}
              onUpdateAnnouncement={async (notice)=>{ setAnnouncement(notice); await forumApi.setAnnouncement(notice).catch(()=>{})}}
              currentAnnouncement={announcement}
              heroConfig={heroConfig}
              onUpdateHeroConfig={async (cfg)=>{ setHeroConfig(cfg); await forumApi.updateSiteHeroConfig(cfg).catch(()=>{})}}
              galleryList={galleryList}
              onUpdateGallery={async (g)=>{ setGalleryList(g); await forumApi.updateGalleryItems(g).catch(()=>{})}}
            />
          } />
          <Route path="/developer" element={<DeveloperPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
      {showGoogleAuth && <GoogleAuthModal isOpen={showGoogleAuth} onClose={()=>setShowGoogleAuth(false)} onSuccess={()=>{ setShowGoogleAuth(false); pushToast('Welcome!', 'Google sign-in successful', 'success') }} />}
      {showMyPasses && <MyPassesModal isOpen={showMyPasses} onClose={()=>setShowMyPasses(false)} onOpenGoogleAuth={()=>{ setShowMyPasses(false); setShowGoogleAuth(true)}} onExploreEvents={()=>{ setShowMyPasses(false); document.getElementById('events')?.scrollIntoView({behavior:'smooth'})}} />}
    </div>
  )
}
