import { useRef, useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Mail, Zap, Sparkles, Code2, Palette, Rocket, Hexagon, Users, Terminal, Cpu, Layers, Globe, Star, ChevronRight } from 'lucide-react'

/* ============ 3D PARTICLE FIELD ============ */
function ParticleUniverse() {
  const ref = useRef()
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false
  const count = isMobile ? 400 : 2000
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
      <pointsMaterial size={isMobile ? 0.03 : 0.025} color="#CCFF00" sizeAttenuation transparent opacity={0.7} />
    </points>
  )
}

function CoreOrb({ mouse }) {
  const ref = useRef()
  useFrame((s, d) => {
    if (!ref.current) return
    ref.current.rotation.y += d * 0.3
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
          <meshBasicMaterial color="#7000FF" wireframe transparent opacity={0.18} />
        </mesh>
      </group>
    </Float>
  )
}

/* ============ CINEMATIC BOOT LOADER ============ */
const BOOT_LINES = [
  '> initializing developer profile...',
  '> mounting react-tree [ok]',
  '> compiling shaders [ok]',
  '> loading 3d particle universe [ok]',
  '> syncing supabase cloud [ok]',
  '> injecting motion engine [ok]',
  '> profile ready — welcome.',
]

function DevLoader({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [lineIdx, setLineIdx] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const p = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 14 + 4
        if (next >= 100) {
          clearInterval(p)
          setTimeout(() => setExiting(true), 350)
          setTimeout(onDone, 1050)
          return 100
        }
        return next
      })
    }, 130)
    return () => clearInterval(p)
  }, [onDone])

  useEffect(() => {
    const l = setInterval(() => setLineIdx(i => Math.min(i + 1, BOOT_LINES.length - 1)), 260)
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
            {/* glitch name */}
            <div className="relative text-center mb-8">
              <motion.h1
                initial={{ opacity: 0, letterSpacing: '0.5em' }}
                animate={{ opacity: 1, letterSpacing: '-0.03em' }}
                transition={{ duration: 1.2, ease: [0.16,1,0.3,1] }}
                className="font-display font-black text-[9vw] sm:text-5xl leading-none text-white select-none"
              >
                ABHISHEK
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="font-mono text-[11px] tracking-[0.5em] text-[#CCFF00] mt-2"
              >
                KAHATE
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
            <div className="rounded-2xl border border-[#CCFF00]/20 bg-black/70 backdrop-blur p-4 font-mono text-[11px] leading-[1.9] min-h-[150px]">
              {BOOT_LINES.slice(0, lineIdx + 1).map((l, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                  <span className="text-[#CCFF00]">▸</span>
                  <span className="text-white/60">{l}</span>
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
            <p className="text-center text-[10px] font-mono tracking-[0.35em] text-white/25 mt-6">DEVELOPER.EXE — LOADING PROFILE</p>
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

/* ============ MAIN PAGE ============ */
export default function DeveloperPage() {
  const [booted, setBooted] = useState(false)
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
      mx.set(mouse.current.x); my.set(mouse.current.y)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [mx, my])

  const skills = [
    { k: 'FRONTEND', v: 96, c: '#CCFF00', d: 'React • Next • Framer • Three.js', icon: Code2 },
    { k: 'BACKEND', v: 91, c: '#7000FF', d: 'Node • Express • Supabase • PostgreSQL', icon: Terminal },
    { k: 'MOTION', v: 94, c: '#00D9FF', d: 'GSAP • Lenis • WebGL • R3F', icon: Zap },
    { k: 'UI SYSTEM', v: 98, c: '#FFB800', d: 'Design Tokens • A11y • Scale', icon: Palette },
  ]

  const projects = [
    { t: 'ECE FORUM PLATFORM', d: 'Full-stack registration + admin + Supabase + QR passes', tags: ['React', 'R3F', 'Supabase'], c: '#CCFF00', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80' },
    { t: '3D SILICON CORE', d: 'WebGL chip visualizer with live telemetry HUD', tags: ['Three.js', 'GLSL', 'Motion'], c: '#7000FF', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&q=80' },
    { t: 'MOTION DESIGN SYSTEM', d: '60fps micro-interaction library for 1500+ users', tags: ['Framer', 'Lenis', 'GSAP'], c: '#00D9FF', img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=900&q=80' },
  ]

  return (
    <div className="bg-[#08080A]">
      <DevLoader onDone={() => setBooted(true)} />

      <div ref={ref} className={`min-h-screen text-white selection:bg-[#CCFF00] selection:text-black transition-opacity duration-700 ${booted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="grain" aria-hidden />
        <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />

        {/* NAV */}
        <div className="sticky top-0 z-40 backdrop-blur-2xl bg-[#08080A]/70 border-b border-white/10">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-[64px] flex items-center justify-between gap-4">
            <Link to="/" className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-colors text-xs font-mono">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Forum
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono tracking-widest text-white/40">
              <span className="w-2 h-2 bg-[#CCFF00] rounded-full animate-pulse" /> PROFILE ONLINE — SYS.2026
            </div>
            <a href="mailto:abhishek.k@ece-elevate.org" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CCFF00] text-black font-black text-xs hover:bg-white transition-colors">HIRE ME <ArrowUpRight className="w-3.5 h-3.5" /></a>
          </div>
        </div>

        {/* HERO */}
        <section className="relative min-h-[100vh] flex items-center overflow-hidden">
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

          <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 py-16 w-full grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={booted ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur text-[11px] font-mono tracking-widest text-white/60">
                <span className="w-2 h-2 bg-[#CCFF00] rounded-full animate-ping" /> AVAILABLE • SINC • 2ND YEAR ECE
              </motion.div>

              <h1 className="font-display font-[800] leading-[0.85] tracking-[-0.05em] text-[15vw] sm:text-[11vw] lg:text-[92px] xl:text-[104px] mt-5">
                <KineticWord word="ABHISHEK" delay={0.15} className="text-white" />
                <br />
                <KineticWord word="KAHATE" delay={0.45} className="text-stroke" />
              </h1>

              <motion.div initial={{ opacity: 0 }} animate={booted ? { opacity: 1 } : {}} transition={{ delay: 1 }} className="mt-3 inline-flex items-center gap-3">
                <span className="font-mono text-[11px] sm:text-[13px] tracking-[0.3em] text-[#CCFF00] border border-[#CCFF00]/30 bg-[#CCFF00]/5 rounded-full px-4 py-1.5">FULL-STACK ARCHITECT</span>
                <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-black font-black text-[10px] tracking-widest"><Star className="w-3 h-3" /> 2026</span>
              </motion.div>

              <motion.p initial={{ opacity: 0, y: 12 }} animate={booted ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.15 }} className="mt-5 text-[15px] sm:text-[17px] leading-relaxed text-white/60 max-w-[580px]">
                I architect <motion.span animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.4, repeat: Infinity }} className="text-white font-semibold">mind-blowing web universes</motion.span> — where 3D, motion and obsessive detail turn ideas into products people remember.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={booted ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.3 }} className="flex flex-wrap gap-3 mt-7">
                <a href="mailto:abhishek.k@ece-elevate.org" className="group inline-flex items-center gap-2 bg-[#CCFF00] text-black px-7 py-3.5 rounded-full font-black text-sm hover:bg-white transition-colors shadow-[0_0_40px_rgba(204,255,0,0.4)]">
                  START A PROJECT <span className="w-7 h-7 rounded-full bg-black text-white grid place-items-center group-hover:rotate-45 transition-transform"><ArrowUpRight className="w-3.5 h-3.5" /></span>
                </a>
                <Link to="/" className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur text-white px-6 py-3.5 rounded-full font-bold text-sm hover:bg-white hover:text-black transition-colors"><Users className="w-4 h-4" /> Meet Team</Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={booted ? { opacity: 1 } : {}} transition={{ delay: 1.5 }} className="mt-8 grid grid-cols-3 gap-3 max-w-[440px]">
                {[{ k: 'SHIPPED', v: '24+' }, { k: 'CORE', v: 'R3F' }, { k: 'A11Y', v: 'WCAG' }].map(b => (
                  <div key={b.k} className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 text-center backdrop-blur">
                    <div className="text-[10px] font-mono tracking-widest text-white/40">{b.k}</div>
                    <div className="font-black text-lg">{b.v}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* portrait card */}
            <motion.div initial={{ opacity: 0, y: 40, rotateY: -8 }} animate={booted ? { opacity: 1, y: 0, rotateY: 0 } : {}} transition={{ delay: 0.9, duration: 0.9, ease: [0.16,1,0.3,1] }} style={{ perspective: 1000 }}>
              <motion.div style={{ rotateX: smy, rotateY: smx }} className="relative w-full max-w-[420px] mx-auto aspect-[4/4.4] rounded-[32px] bg-gradient-to-br from-[#141414] to-black border border-white/10 overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.7)]">
                <img src="https://i.pravatar.cc/600?img=32" alt="Abhishek Kahate" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                {/* scanline sweep */}
                <motion.div animate={{ y: ['-100%', '120%'] }} transition={{ duration: 3.4, repeat: Infinity, ease: 'linear', repeatDelay: 1.4 }} className="absolute left-0 right-0 h-[80px] bg-gradient-to-b from-transparent via-[#CCFF00]/10 to-transparent pointer-events-none" />
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur border border-white/15 text-[10px] font-black tracking-widest">SINC • ECE</span>
                  <span className="px-3 py-1 rounded-full bg-[#CCFF00] text-black text-[10px] font-black flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" /> LIVE BUILDING</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-black text-xs font-black"><Cpu className="w-3.5 h-3.5" /> Full-Stack Web Architecture</div>
                  <h3 className="font-display font-black text-xl leading-tight mt-2">Crafting the forum's digital universe</h3>
                  <p className="text-xs text-white/50 mt-1 font-mono">Next • R3F • Supabase • Lenis • Motion</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/30">
            <span className="text-[9px] font-mono tracking-[0.3em]">SCROLL</span>
            <ChevronRight className="w-4 h-4 rotate-90 text-[#CCFF00]" />
          </motion.div>
        </section>

        {/* MARQUEE */}
        <div className="border-y border-white/10 bg-[#CCFF00] text-black overflow-hidden py-2.5 relative z-10">
          <div className="flex whitespace-nowrap animate-marquee marquee" style={{ width: 'max-content' }}>
            {[...Array(6)].map((_, i) => <span key={i} className="flex items-center gap-6 px-6 text-[13px] font-black tracking-widest">◆ REACT ◆ NEXT ◆ THREE.JS ◆ MOTION ◆ SUPABASE ◆ TAILWIND ◆ WEBGL ◆ TYPESCRIPT</span>)}
          </div>
        </div>

        {/* SKILLS */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[420px] bg-[#7000FF]/5 rounded-full blur-[120px]" /></div>
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <p className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-3 py-1 rounded-full"><Sparkles className="w-3 h-3" /> SKILLS • CRAFT</p>
                <h2 className="font-display font-[800] text-[36px] md:text-[52px] leading-none tracking-tighter mt-3"><span className="text-white">Obsessed with</span> <span className="text-stroke">details.</span></h2>
              </div>
              <p className="text-xs font-mono text-white/40 max-w-[360px] md:text-right">Every pixel, every frame, every interaction — tuned to 60fps.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {skills.map((s, i) => {
                const Icon = s.icon
                return (
                  <motion.div key={s.k} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="group rounded-[24px] bg-[#0F0F0F] border border-white/10 p-6 hover:border-white/20 hover:bg-[#151515] transition-all">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-mono tracking-widest text-white/30">{s.k}</span>
                      <span className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center group-hover:bg-white group-hover:text-black transition-colors"><Icon className="w-4 h-4" /></span>
                    </div>
                    <div className="font-display font-black text-4xl mt-4" style={{ color: s.c }}>{s.v}<span className="text-lg">%</span></div>
                    <div className="text-xs text-white/50 mt-1 leading-relaxed">{s.d}</div>
                    <div className="mt-5 h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${s.v}%` }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.3 + i * 0.06, ease: [0.16,1,0.3,1] }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${s.c}66, ${s.c})` }} />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* PROJECTS — horizontal pinned */}
        <section className="relative">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 mb-8">
            <p className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/5 px-3 py-1 rounded-full"><Layers className="w-3 h-3" /> SELECTED BUILDS</p>
            <h2 className="font-display font-[800] text-[36px] md:text-[52px] leading-none tracking-tighter mt-3"><span className="text-white">Things I've</span> <span className="text-stroke">shipped.</span></h2>
          </div>
          <div className="flex gap-5 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-4 md:px-8 pb-6 max-w-[1600px] mx-auto">
            {projects.map((p, i) => (
              <motion.div key={p.t} initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="snap-start shrink-0 w-[86vw] sm:w-[480px] rounded-[28px] overflow-hidden bg-[#0F0F0F] border border-white/10 hover:border-white/20 transition-colors group">
                <div className="relative h-[240px] overflow-hidden">
                  <img src={p.img} alt={p.t} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black tracking-widest" style={{ background: p.c, color: '#000' }}>0{i + 1}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-display font-black text-xl tracking-tight">{p.t}</h3>
                  <p className="text-sm text-white/55 mt-1.5 leading-relaxed">{p.d}</p>
                  <div className="flex flex-wrap gap-1.5 mt-4">{p.tags.map(t => <span key={t} className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">{t}</span>)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative rounded-[32px] bg-[#CCFF00] text-black p-8 md:p-12 overflow-hidden">
              <div className="absolute -top-16 -right-16 w-[300px] h-[300px] bg-white/30 rounded-full blur-[80px]" />
              <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h3 className="font-display font-black text-[32px] md:text-[44px] leading-[0.9] tracking-tighter">Let's build<br />something iconic.</h3>
                  <p className="text-sm text-black/60 mt-3 max-w-[420px]">Available for freelance & internships — the ECE Forum platform is just the beginning.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href="mailto:abhishek.k@ece-elevate.org" className="px-8 py-4 rounded-full bg-black text-white font-black text-sm inline-flex items-center gap-2 hover:bg-white hover:text-black border-2 border-black transition-colors">EMAIL ME <Mail className="w-4 h-4" /></a>
                  <Link to="/" className="px-8 py-4 rounded-full bg-white/60 text-black font-black text-sm inline-flex items-center gap-2 hover:bg-black hover:text-white border-2 border-black/10 transition-colors">BACK TO FORUM <ArrowLeft className="w-4 h-4" /></Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <footer className="border-t border-white/10 py-6">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-between gap-3 text-[11px] font-mono tracking-widest text-white/30">
            <span>© 2026 ABHISHEK KAHATE — CRAFTED WITH OBSESSION</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse" /> OPEN TO WORK</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
