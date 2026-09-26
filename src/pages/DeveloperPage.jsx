import { useRef, useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, ArrowUpRight, Mail, Zap, Sparkles, Code2, Palette, Rocket, Hexagon,
  Users, Terminal, Cpu, Layers, Globe, Star, ChevronRight, ExternalLink,
  ShieldCheck, Database, QrCode, Award, CheckCircle2, Lock, Server, Activity, Flame, Check
} from 'lucide-react'
import { soundFx } from '../utils/audio'

/* ============ BRAND ICONS ============ */
const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)

const LinkedinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
)

/* ============ 3D PARTICLE FIELD ============ */
function ParticleUniverse() {
  const ref = useRef()
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')
    const onChange = () => setIsMobile(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  const count = isMobile ? 400 : 2200
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [count])
  useFrame((s) => {
    if (!ref.current) return
    ref.current.rotation.y = s.clock.elapsedTime * 0.04
    ref.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.1) * 0.1
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={isMobile ? 0.03 : 0.025} color="#CCFF00" sizeAttenuation transparent opacity={0.75} />
    </points>
  )
}

function CoreOrb({ mouse }) {
  const ref = useRef()
  useFrame((s, d) => {
    if (!ref.current) return
    ref.current.rotation.y += d * 0.35
    ref.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.4) * 0.25
    if (mouse.current) {
      ref.current.position.x += (mouse.current.x * 1.2 - ref.current.position.x) * 0.03
      ref.current.position.y += (mouse.current.y * 0.8 - ref.current.position.y) * 0.03
    }
  })
  return (
    <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1.8}>
      <group ref={ref}>
        <mesh scale={1.5}>
          <icosahedronGeometry args={[1, 1]} />
          <MeshDistortMaterial color="#CCFF00" roughness={0.05} metalness={0.95} distort={0.45} speed={2.2} emissive="#CCFF00" emissiveIntensity={0.22} flatShading />
        </mesh>
        <mesh scale={1.9}>
          <icosahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#7000FF" wireframe transparent opacity={0.2} />
        </mesh>
      </group>
    </Float>
  )
}

/* ============ CINEMATIC BOOT LOADER ============ */
const BOOT_LINES = [
  '> initializing lead developer profile [ABHISHEK KAHATE]...',
  '> mounting react-19 virtual dom [ok]',
  '> compiling webgl 3d shaders [ok]',
  '> loading cyber particle field [ok]',
  '> syncing supabase cloud & cryptographic pass matrix [ok]',
  '> initializing 300dpi certificate engine [ok]',
  '> verified student dossier — profile online.',
]

function DevLoader({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [lineIdx, setLineIdx] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const p = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 16 + 5
        if (next >= 100) {
          clearInterval(p)
          setTimeout(() => setExiting(true), 320)
          setTimeout(onDone, 950)
          return 100
        }
        return next
      })
    }, 120)
    return () => clearInterval(p)
  }, [onDone])

  useEffect(() => {
    const l = setInterval(() => setLineIdx(i => Math.min(i + 1, BOOT_LINES.length - 1)), 220)
    return () => clearInterval(l)
  }, [])

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[999] bg-[#050505] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* scanlines */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #CCFF00 2px, #CCFF00 3px)' }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#050505_85%)]" />

          {/* corner brackets */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-[#CCFF00]/50" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-[#CCFF00]/50" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-[#CCFF00]/50" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[#CCFF00]/50" />

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-[min(92vw,560px)]">
            <div className="relative text-center mb-8">
              <motion.h1
                initial={{ opacity: 0, letterSpacing: '0.4em' }}
                animate={{ opacity: 1, letterSpacing: '-0.03em' }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="font-display font-black text-[9vw] sm:text-5xl leading-none text-white select-none"
              >
                ABHISHEK
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                className="font-mono text-[11px] tracking-[0.5em] text-[#CCFF00] mt-2 font-bold"
              >
                KAHATE &bull; LEAD ARCHITECT
              </motion.p>

              {/* glitch bars */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ opacity: [0, 0.6, 0, 0.4, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.2 }}
              >
                <div className="absolute top-[30%] left-0 right-0 h-[2px] bg-[#CCFF00] mix-blend-screen" />
                <div className="absolute top-[55%] left-0 right-0 h-[1px] bg-[#7000FF] mix-blend-screen" />
              </motion.div>
            </div>

            {/* terminal */}
            <div className="rounded-2xl border border-[#CCFF00]/20 bg-black/70 backdrop-blur p-4 font-mono text-[11px] leading-[1.9] min-h-[160px]">
              {BOOT_LINES.slice(0, lineIdx + 1).map((l, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                  <span className="text-[#CCFF00]">▸</span>
                  <span className="text-white/70">{l}</span>
                </motion.div>
              ))}
              <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="inline-block w-2 h-3 bg-[#CCFF00] mt-1" />
            </div>

            {/* progress */}
            <div className="mt-5 flex items-center gap-4">
              <div className="flex-1 h-[3px] rounded-full bg-white/10 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-[#CCFF00] to-[#7000FF]" style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
              <span className="font-mono text-xs text-[#CCFF00] font-black w-12 text-right">{Math.floor(Math.min(progress, 100))}%</span>
            </div>
            <p className="text-center text-[10px] font-mono tracking-[0.35em] text-white/30 mt-6">DEVELOPER.DOSSIER — ECE FORUM 2026</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ============ KINETIC HEADLINE ============ */
function KineticWord({ word, delay, className }) {
  return (
    <span className={`inline-block overflow-hidden ${className || ''}`}>
      <span className="inline-flex">
        {word.split('').map((ch, i) => (
          <motion.span
            key={i}
            initial={{ y: '110%', rotate: 8 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ delay: delay + i * 0.035, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block"
          >
            {ch}
          </motion.span>
        ))}
      </span>
    </span>
  )
}

/* ============ ARCHITECTURE PILLARS ============ */
const ARCH_PILLARS = [
  {
    id: '01',
    title: '3D Silicon Core Visualizer',
    category: 'WebGL & Graphics',
    icon: Cpu,
    color: '#CCFF00',
    description: 'Custom React Three Fiber & Three.js particle dynamics system with 60fps orbital controls, GLSL distortion materials, and automatic DPR downsampling on mobile devices.',
    metrics: ['2,200 Particles', '60 FPS Target', 'Zero Frame Stutter'],
    tags: ['Three.js', 'R3F', 'GLSL', 'Drei']
  },
  {
    id: '02',
    title: 'Cryptographic Pass Engine',
    category: 'Security & Verification',
    icon: QrCode,
    color: '#00D9FF',
    description: 'Tamper-resistant digital ticket pass generator featuring offline checksum verification, anti-duplication tokens, high-density SVG QR barcodes, and pass-card flip 3D animation.',
    metrics: ['Sub-10ms Verify', 'Offline Capable', '3D Card Tilt'],
    tags: ['Crypto Token', 'QR Barcode', 'Canvas API']
  },
  {
    id: '03',
    title: 'Automated Certificate Studio',
    category: 'Vector Synthesis',
    icon: Award,
    color: '#FFB800',
    description: 'Zero-dependency client-side vector synthesis engine that converts dynamic attendee metadata into 300DPI print-ready certificates with instant PNG/PDF downloads and merit signatures.',
    metrics: ['300 DPI Export', 'Instant PDF/PNG', 'Unique Cert ID'],
    tags: ['Vector Canvas', 'Blob Synthesis', 'High-Res']
  },
  {
    id: '04',
    title: 'Supabase Cloud Infrastructure',
    category: 'Backend & Data Matrix',
    icon: Database,
    color: '#7000FF',
    description: 'Serverless PostgreSQL platform backed by Row Level Security (RLS) policies, transactional registration rollups, real-time participant broadcasting, and administrative security gates.',
    metrics: ['< 45ms Latency', 'RLS Policies', 'Instant Sync'],
    tags: ['PostgreSQL', 'RLS Security', 'Realtime']
  }
]

/* ============ MAIN COMPONENT ============ */
export default function DeveloperPage() {
  const [booted, setBooted] = useState(false)
  const [activePillar, setActivePillar] = useState(0)
  const [copiedEmail, setCopiedEmail] = useState(false)

  const ref = useRef(null)
  const mouse = useRef({ x: 0, y: 0 })
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const smx = useSpring(mx, { stiffness: 60, damping: 20 })
  const smy = useSpring(my, { stiffness: 60, damping: 20 })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.94])

  useEffect(() => {
    const onMove = (e) => {
      mouse.current = { x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 }
      mx.set(mouse.current.x)
      my.set(mouse.current.y)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [mx, my])

  const handleCopyEmail = () => {
    soundFx.playChirp()
    navigator.clipboard.writeText('abhishek.k@ece-elevate.org')
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2400)
  }

  const skills = [
    { k: '3D & MOTION ARCHITECTURE', v: 96, c: '#CCFF00', d: 'React Three Fiber • Three.js • Framer Motion • WebGL Shaders • Lenis', icon: Zap },
    { k: 'FRONTEND SYSTEM CRAFT', v: 98, c: '#00D9FF', d: 'React 19 • TypeScript • Tailwind CSS • Design Tokens • Accessible HUDs', icon: Code2 },
    { k: 'BACKEND & CLOUD MATRIX', v: 92, c: '#7000FF', d: 'Supabase Cloud • PostgreSQL • Row Level Security • Real-time WebSockets', icon: Database },
    { k: 'ENGINEERING & GRAPHICS', v: 95, c: '#FFB800', d: 'Canvas API • Vector Synthesis • 300DPI Printing • QR Cryptography', icon: Cpu },
  ]

  const projects = [
    {
      t: 'ECE ELEVATE FORUM ECOSYSTEM',
      d: 'Comprehensive departmental web application featuring 3D silicon visualizer, Google authentication, registration desk, dynamic QR tickets, and council dossiers.',
      tags: ['React 19', 'R3F / Three.js', 'Supabase Cloud', 'Framer Motion'],
      c: '#CCFF00',
      badge: 'FLAGSHIP PRODUCTION',
      img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80'
    },
    {
      t: 'REAL-TIME 3D SILICON CORE',
      d: 'Interactive WebGL chip model featuring real-time particle dynamics, responsive rotation, and custom emissive lighting simulating hardware compute cycles.',
      tags: ['Three.js', 'GLSL', 'Drei', 'Float Physics'],
      c: '#7000FF',
      badge: 'INTERACTIVE WEBGL',
      img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&q=80'
    },
    {
      t: 'CRYPTOGRAPHIC PASS DISPATCHER',
      d: 'Fast event gate verification system with client-side SVG QR rendering, offline validation hash, 3D card tilt physics, and pass management wallet.',
      tags: ['QR Matrix', 'Pass Wallet', 'Checksum Verification'],
      c: '#00D9FF',
      badge: 'SECURITY ENGINE',
      img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=900&q=80'
    },
  ]

  return (
    <div className="bg-[#08080A]">
      <DevLoader onDone={() => setBooted(true)} />

      <div ref={ref} className={`min-h-screen text-white selection:bg-[#CCFF00] selection:text-black transition-opacity duration-700 ${booted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="grain" aria-hidden />
        <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />

        {/* TOP BAR */}
        <div className="sticky top-0 z-40 backdrop-blur-2xl bg-[#08080A]/80 border-b border-white/10 pt-[env(safe-area-inset-top)]">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-[64px] flex items-center justify-between gap-4">
            <Link
              to="/"
              onClick={() => soundFx.playClick()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-colors text-xs font-mono min-h-[40px] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Forum
            </Link>

            <div className="hidden md:flex items-center gap-3 text-[11px] font-mono tracking-widest text-white/50">
              <span className="w-2 h-2 bg-[#CCFF00] rounded-full animate-pulse shadow-[0_0_8px_#CCFF00]" />
              <span>LEAD ARCHITECT DOSSIER</span>
              <span className="text-white/20">|</span>
              <span className="text-[#CCFF00]">SYS.2026.PROD</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://github.com/Abhishekkahate"
                target="_blank"
                rel="noreferrer"
                onClick={() => soundFx.playClick()}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 grid place-items-center hover:bg-white hover:text-black transition-colors text-white/70"
                title="GitHub Profile"
              >
                <GithubIcon className="w-4 h-4" />
              </a>

              <a
                href="mailto:abhishek.k@ece-elevate.org"
                onClick={() => soundFx.playLaser()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CCFF00] text-black font-black text-xs hover:bg-white hover:shadow-[0_0_24px_rgba(204,255,0,0.5)] transition-all min-h-[40px] cursor-pointer"
              >
                <span>CONNECT</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* HERO SECTION */}
        <section className="relative min-h-[100svh] flex items-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 7], fov: 50 }} dpr={[1, 1.4]} className="!absolute inset-0 pointer-events-none">
              <ambientLight intensity={0.5} />
              <directionalLight position={[4, 5, 4]} intensity={1.1} />
              <pointLight position={[-5, -4, -4]} color="#7000FF" intensity={2.4} />
              <ParticleUniverse />
              <CoreOrb mouse={mouse} />
              <Environment preset="city" />
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-b from-[#08080A]/20 via-transparent to-[#08080A]" />
          </div>

          <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 py-16 w-full grid lg:grid-cols-[1.25fr_0.75fr] gap-12 items-center">
            <div>
              {/* Eyebrow badge */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={booted ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur text-[11px] font-mono tracking-widest text-white/70">
                <span className="w-2 h-2 bg-[#CCFF00] rounded-full animate-ping" />
                <span className="text-[#CCFF00] font-bold">ACTIVE LEAD</span>
                <span>&bull;</span>
                <span>SINC COUNCIL</span>
                <span>&bull;</span>
                <span>2ND YEAR ECE</span>
              </motion.div>

              {/* Main Headline */}
              <h1 className="font-display font-[900] leading-[0.85] tracking-[-0.05em] text-[15vw] sm:text-[11vw] lg:text-[92px] xl:text-[104px] mt-6">
                <KineticWord word="ABHISHEK" delay={0.15} className="text-white" />
                <br />
                <KineticWord word="KAHATE" delay={0.45} className="text-stroke" />
              </h1>

              {/* Sub-pill status */}
              <motion.div initial={{ opacity: 0 }} animate={booted ? { opacity: 1 } : {}} transition={{ delay: 0.9 }} className="mt-4 flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-[11px] sm:text-[12px] tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/30 bg-[#CCFF00]/10 rounded-full px-4 py-1.5 font-bold">
                  LEAD PLATFORM ARCHITECT
                </span>
                <span className="font-mono text-[11px] sm:text-[12px] tracking-[0.15em] text-white/60 border border-white/10 bg-white/5 rounded-full px-3.5 py-1.5">
                  FULL-STACK &bull; 3D / WEBGL
                </span>
              </motion.div>

              {/* Bio Statement */}
              <motion.p initial={{ opacity: 0, y: 12 }} animate={booted ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.1 }} className="mt-6 text-[15px] sm:text-[18px] leading-relaxed text-white/70 max-w-[620px] font-sans">
                I engineered the complete <span className="text-white font-semibold">ECE Elevate Forum digital ecosystem</span> — merging high-performance Three.js 3D silicon visualizers, cryptographic QR access matrices, and real-time Supabase cloud architecture into a seamless 60fps experience.
              </motion.p>

              {/* CTA Action Buttons */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={booted ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.25 }} className="flex flex-wrap items-center gap-3 mt-8">
                <a
                  href="mailto:abhishek.k@ece-elevate.org"
                  onClick={() => soundFx.playLaser()}
                  className="group inline-flex items-center gap-2.5 bg-[#CCFF00] text-black px-7 py-3.5 rounded-full font-black text-sm hover:bg-white transition-all shadow-[0_0_36px_rgba(204,255,0,0.4)] cursor-pointer"
                >
                  <span>GET IN TOUCH</span>
                  <span className="w-7 h-7 rounded-full bg-black text-white grid place-items-center group-hover:rotate-45 transition-transform">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </a>

                <a
                  href="https://github.com/Abhishekkahate"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => soundFx.playClick()}
                  className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur text-white px-5 py-3.5 rounded-full font-mono text-xs hover:bg-white hover:text-black transition-colors cursor-pointer"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>GitHub Profile</span>
                </a>

                <button
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 px-4 py-3.5 rounded-full font-mono text-xs hover:text-white hover:border-white/30 transition-colors cursor-pointer"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#00FF88]" /> : <Mail className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'Copied to Clipboard!' : 'Copy Email'}</span>
                </button>
              </motion.div>

              {/* Key Architecture Metrics */}
              <motion.div initial={{ opacity: 0 }} animate={booted ? { opacity: 1 } : {}} transition={{ delay: 1.45 }} className="mt-9 grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-w-[540px]">
                {[
                  { k: 'SYS ARCH', v: 'Full-Stack' },
                  { k: '3D GRAPHICS', v: 'WebGL / R3F' },
                  { k: 'DATA LATENCY', v: '< 45ms' },
                  { k: 'TICKETS', v: 'Tamper-Proof' }
                ].map(b => (
                  <div key={b.k} className="rounded-xl bg-white/[0.03] border border-white/10 p-3 text-center backdrop-blur">
                    <div className="text-[9px] font-mono tracking-widest text-white/40">{b.k}</div>
                    <div className="font-mono font-black text-sm text-[#CCFF00] mt-0.5">{b.v}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* CYBERNETIC PORTRAIT CARD */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotateY: -8 }}
              animate={booted ? { opacity: 1, y: 0, rotateY: 0 } : {}}
              transition={{ delay: 0.9, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{ perspective: 1000 }}
              className="relative"
            >
              {/* Outer cybernetic glow ring */}
              <div className="absolute -inset-2 rounded-[36px] bg-gradient-to-br from-[#CCFF00]/20 via-[#7000FF]/15 to-transparent blur-xl pointer-events-none" />

              <motion.div
                style={{ rotateX: smy, rotateY: smx }}
                className="relative w-full max-w-[430px] mx-auto rounded-[32px] bg-gradient-to-b from-[#14161C] to-[#0A0B0E] border-2 border-[#CCFF00]/40 overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.85)] group"
              >
                {/* Tech Bracket HUD Markers */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#CCFF00] z-20 pointer-events-none" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#CCFF00] z-20 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#CCFF00] z-20 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#CCFF00] z-20 pointer-events-none" />

                {/* Real Developer Photo */}
                <div className="relative aspect-[4/4.8] overflow-hidden bg-black">
                  <img
                    src="/team_images/Abhi.webp"
                    alt="Abhishek Kahate - Lead Architect"
                    className="w-full h-full object-cover object-[center_15%] group-hover:scale-105 transition-transform duration-700 opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0E] via-transparent to-black/30 pointer-events-none" />

                  {/* Scanline sweep */}
                  <motion.div
                    animate={{ y: ['-100%', '130%'] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                    className="absolute left-0 right-0 h-[70px] bg-gradient-to-b from-transparent via-[#CCFF00]/15 to-transparent pointer-events-none"
                  />

                  {/* Top HUD Badges */}
                  <div className="absolute top-5 left-5 right-5 flex justify-between items-center z-10">
                    <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur border border-white/20 text-[10px] font-mono tracking-widest text-white/90">
                      SYS // LEAD-ARCH
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#CCFF00] text-black text-[10px] font-mono font-black flex items-center gap-1.5 shadow-md">
                      <span className="w-1.5 h-1.5 bg-black rounded-full animate-ping" /> ONLINE
                    </span>
                  </div>
                </div>

                {/* Card Content & Details */}
                <div className="p-6 relative z-10 bg-gradient-to-b from-transparent via-[#0A0B0E]/90 to-[#0A0B0E]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-[900] text-2xl text-white tracking-tight">
                        Abhishek Kahate
                      </h3>
                      <p className="text-xs font-mono text-[#CCFF00] mt-0.5 tracking-wider font-bold">
                        Technical Co-Incharge &bull; SINC Council
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href="https://github.com/Abhishekkahate"
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => soundFx.playClick()}
                        className="w-9 h-9 rounded-full bg-white/5 border border-white/15 grid place-items-center text-white/80 hover:bg-[#CCFF00] hover:text-black transition-colors"
                        title="GitHub"
                      >
                        <GithubIcon className="w-4 h-4" />
                      </a>
                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => soundFx.playClick()}
                        className="w-9 h-9 rounded-full bg-white/5 border border-white/15 grid place-items-center text-white/80 hover:bg-[#00D9FF] hover:text-black transition-colors"
                        title="LinkedIn"
                      >
                        <LinkedinIcon className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <p className="text-xs font-mono text-white/60 mt-3 leading-relaxed border-t border-white/10 pt-3">
                    Architected the ECE Forum digital experience. Specialized in WebGL hardware graphics, realtime database architectures, and high-performance interactive systems.
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    {['React 19', 'R3F / Three.js', 'Supabase Cloud', 'Framer Motion', 'TypeScript'].map(t => (
                      <span key={t} className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/30" style={{ bottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
            <span className="text-[9px] font-mono tracking-[0.3em]">EXPLORE ARCHITECTURE</span>
            <ChevronRight className="w-4 h-4 rotate-90 text-[#CCFF00]" />
          </motion.div>
        </section>

        {/* MARQUEE OF TECH STACK */}
        <div className="border-y border-white/10 bg-[#CCFF00] text-black overflow-hidden py-3 relative z-10">
          <div className="flex whitespace-nowrap animate-marquee marquee" style={{ width: 'max-content' }}>
            {[...Array(6)].map((_, i) => (
              <span key={i} className="flex items-center gap-6 px-6 text-[13px] font-black tracking-widest font-mono">
                ◆ REACT 19 ◆ THREE.JS ◆ WEBGL SHADERS ◆ SUPABASE CLOUD ◆ FRAMER MOTION ◆ TAILWIND CSS ◆ QR CRYPTOGRAPHY ◆ VECTOR STUDIO ◆ 60 FPS
              </span>
            ))}
          </div>
        </div>

        {/* ARCHITECTURE PILLARS — SYSTEM BREAKDOWN */}
        <section className="py-20 md:py-28 relative overflow-hidden bg-[#0A0A0D]">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
            >
              <div>
                <p className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-3 py-1 rounded-full font-bold">
                  <Terminal className="w-3.5 h-3.5" /> SYSTEM ARCHITECTURE
                </p>
                <h2 className="font-display font-[800] text-[34px] sm:text-[48px] md:text-[56px] leading-[0.95] tracking-tight mt-3">
                  <span className="text-white">How the forum was</span> <span className="text-stroke">engineered.</span>
                </h2>
              </div>
              <p className="text-xs sm:text-sm font-mono text-white/50 max-w-[420px] md:text-right leading-relaxed">
                4 core subsystems engineered from the ground up to support thousands of students, instant check-ins, and lossless certificate credentials.
              </p>
            </motion.div>

            {/* 4 Pillars Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {ARCH_PILLARS.map((pillar, idx) => {
                const Icon = pillar.icon
                return (
                  <motion.div
                    key={pillar.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-[28px] bg-[#101217] border border-white/10 p-7 sm:p-8 hover:border-[#CCFF00]/50 hover:bg-[#13161F] transition-all relative overflow-hidden group shadow-lg"
                  >
                    <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-[#CCFF00]/5 blur-3xl pointer-events-none group-hover:bg-[#CCFF00]/10 transition-colors" />

                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <span className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 grid place-items-center text-[#CCFF00] group-hover:bg-[#CCFF00] group-hover:text-black transition-colors shadow-md">
                          <Icon className="w-6 h-6" />
                        </span>
                        <div>
                          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
                            {pillar.category}
                          </span>
                          <h3 className="font-display font-extrabold text-xl text-white">
                            {pillar.title}
                          </h3>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-white/20 group-hover:text-[#CCFF00] transition-colors">
                        {pillar.id}
                      </span>
                    </div>

                    <p className="text-sm font-sans text-white/65 leading-relaxed mb-6">
                      {pillar.description}
                    </p>

                    {/* Metrics Banner */}
                    <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-xl bg-black/40 border border-white/5 font-mono text-center">
                      {pillar.metrics.map((m, i) => (
                        <div key={i} className="text-[11px] text-[#CCFF00] font-bold">
                          {m}
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {pillar.tags.map(t => (
                        <span key={t} className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* SKILLS MATRIX */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[420px] bg-[#7000FF]/5 rounded-full blur-[140px]" />
          </div>

          <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <p className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-3 py-1 rounded-full font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> TECHNICAL ARSENAL
                </p>
                <h2 className="font-display font-[800] text-[34px] sm:text-[48px] md:text-[56px] leading-[0.95] tracking-tight mt-3">
                  <span className="text-white">Obsessed with</span> <span className="text-stroke">perfection.</span>
                </h2>
              </div>
              <p className="text-xs sm:text-sm font-mono text-white/50 max-w-[380px] md:text-right leading-relaxed">
                Every shader, animation transition, and database query is calibrated for sub-second responses and flawless aesthetics.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {skills.map((s, i) => {
                const Icon = s.icon
                return (
                  <motion.div
                    key={s.k}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="group rounded-[24px] bg-[#0E0F14] border border-white/10 p-6 hover:border-white/25 hover:bg-[#13151D] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono tracking-widest text-white/40">{s.k}</span>
                        <span className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center group-hover:bg-[#CCFF00] group-hover:text-black transition-colors">
                          <Icon className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="font-display font-black text-4xl mt-5" style={{ color: s.c }}>
                        {s.v}<span className="text-xl font-mono text-white/40">%</span>
                      </div>
                      <div className="text-xs font-mono text-white/60 mt-2 leading-relaxed">
                        {s.d}
                      </div>
                    </div>

                    <div className="mt-6 h-2 bg-black rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.v}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.3 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${s.c}66, ${s.c})` }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section className="py-16 md:py-24 relative bg-[#07080B]">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 mb-10">
            <p className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-3 py-1 rounded-full font-bold">
              <Layers className="w-3.5 h-3.5" /> FEATURE BUILDS
            </p>
            <h2 className="font-display font-[800] text-[34px] sm:text-[48px] md:text-[56px] leading-[0.95] tracking-tight mt-3">
              <span className="text-white">Systems I've</span> <span className="text-stroke">shipped.</span>
            </h2>
          </div>

          <div className="flex gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-4 md:px-8 pb-6 max-w-[1600px] mx-auto scroll-pl-4 md:scroll-pl-8">
            {projects.map((p, i) => (
              <motion.div
                key={p.t}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="snap-start shrink-0 w-[86vw] sm:w-[500px] rounded-[30px] overflow-hidden bg-[#0F1117] border border-white/10 hover:border-[#CCFF00]/40 transition-all group"
              >
                <div className="relative h-[250px] overflow-hidden bg-black">
                  <img src={p.img} alt={p.t} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1117] via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-mono font-black tracking-widest bg-[#CCFF00] text-black">
                    {p.badge}
                  </span>
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-black/60 border border-white/15 text-white/70">
                    MOD 0{i + 1}
                  </span>
                </div>

                <div className="p-7">
                  <h3 className="font-display font-extrabold text-2xl tracking-tight text-white group-hover:text-[#CCFF00] transition-colors">
                    {p.t}
                  </h3>
                  <p className="text-sm text-white/60 mt-2 leading-relaxed font-sans">
                    {p.d}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {p.tags.map(t => (
                      <span key={t} className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-20 md:py-28">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[36px] bg-gradient-to-br from-[#CCFF00] via-[#B2E600] to-[#88CC00] text-black p-8 sm:p-12 md:p-16 overflow-hidden shadow-[0_24px_80px_rgba(204,255,0,0.35)]"
            >
              <div className="absolute -top-24 -right-24 w-[380px] h-[380px] bg-white/40 rounded-full blur-[100px] pointer-events-none" />
              <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-[#CCFF00] font-mono text-[10px] font-black tracking-widest uppercase mb-3">
                    Available For Collabs &bull; Open To Work
                  </div>
                  <h3 className="font-display font-black text-[36px] sm:text-[46px] md:text-[54px] leading-[0.92] tracking-tighter">
                    Let's architect something iconic.
                  </h3>
                  <p className="text-sm sm:text-base text-black/75 mt-4 leading-relaxed font-sans">
                    Whether you are building next-generation web applications, interactive 3D graphics, or scalable real-time architectures — let's connect.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="mailto:abhishek.k@ece-elevate.org"
                    onClick={() => soundFx.playLaser()}
                    className="px-8 py-4 rounded-full bg-black text-white font-mono font-bold text-sm inline-flex items-center gap-2 hover:bg-white hover:text-black border-2 border-black transition-all shadow-xl cursor-pointer"
                  >
                    <span>abhishek.k@ece-elevate.org</span>
                    <Mail className="w-4 h-4" />
                  </a>

                  <a
                    href="https://github.com/Abhishekkahate"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => soundFx.playClick()}
                    className="px-6 py-4 rounded-full bg-black/10 text-black font-mono font-bold text-sm inline-flex items-center gap-2 hover:bg-black hover:text-white border-2 border-black/20 transition-all cursor-pointer"
                  >
                    <GithubIcon className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>

                  <Link
                    to="/"
                    onClick={() => soundFx.playClick()}
                    className="px-6 py-4 rounded-full bg-white/70 text-black font-mono font-bold text-sm inline-flex items-center gap-2 hover:bg-black hover:text-white border-2 border-black/15 transition-all cursor-pointer"
                  >
                    <span>Forum</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))] bg-[#050608]">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono tracking-widest text-white/40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />
              <span>&copy; 2026 ABHISHEK KAHATE &bull; LEAD PLATFORM ARCHITECT</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="https://github.com/Abhishekkahate" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                GITHUB
              </a>
              <a href="mailto:abhishek.k@ece-elevate.org" className="hover:text-white transition-colors">
                EMAIL
              </a>
              <Link to="/" className="hover:text-[#CCFF00] transition-colors">
                BACK TO FORUM
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
