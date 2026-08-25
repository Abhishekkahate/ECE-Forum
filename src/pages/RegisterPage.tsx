import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, MapPin, Ticket, ShieldCheck, 
  CreditCard, CheckCircle2, User, Phone, School, 
  ChevronRight, AlertCircle, Loader2, Layers, Users, UserPlus, 
  Trash2, Tag, Check, X, Building2, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { type EventItem } from '../components/EventsSection';
import { useAuth } from '../context/AuthContext';
import { passService, type EventPass, type TeamMember } from '../services/passService';
import { PassCard } from '../components/PassCard';
import { GoogleAuthModal } from '../components/GoogleAuthModal';
import { MyPassesModal } from '../components/MyPassesModal';
import { soundFx } from '../utils/audio';
import { api, type Coupon } from '../services/api';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface RegisterPageProps {
  eventsList: EventItem[];
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ eventsList }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { eventId: routeEventId } = useParams<{ eventId?: string }>();
  
  const queryEventId = searchParams.get('event') || routeEventId;

  // Find target event or fallback to first event
  const selectedEvent = eventsList.find((e) => e.id === queryEventId) || eventsList[0] || null;

  const { user, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMyPassesOpen, setIsMyPassesOpen] = useState(false);

  // Registration Type: Individual vs Team
  const [regType, setRegType] = useState<'individual' | 'team'>('individual');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Team Leader / Primary Attendee Form Data (Roll Number removed, typed Department & College added)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || 'Electronics & Communication Engineering',
    collegeName: 'Priyadarshini Institute of Engineering & Technology (PIET), Nagpur',
    year: user?.year || '3rd Year',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Coupon System State
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string | null>(null);

  const [generatedPass, setGeneratedPass] = useState<EventPass | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Load available coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const list = await api.getCoupons();
        setAvailableCoupons(list);
      } catch {}
    };
    fetchCoupons();
  }, []);

  // Sync user state from Google Auth
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        department: user.department || prev.department,
        year: user.year || prev.year,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Enforce participation rules based on event configuration
  useEffect(() => {
    if (selectedEvent) {
      if (selectedEvent.participationType === 'individual_only') {
        setRegType('individual');
        setTeamMembers([]);
      } else if (selectedEvent.participationType === 'team_only') {
        setRegType('team');
        if (teamMembers.length === 0) {
          setTeamMembers([{
            name: '',
            email: '',
            department: formData.department || 'Electronics & Communication Engineering',
            collegeName: formData.collegeName || 'PIET, Nagpur',
            year: '3rd Year',
            phone: '',
          }]);
        }
      }
    }
  }, [selectedEvent?.id, selectedEvent?.participationType]);

  // Dynamically load Razorpay SDK Script
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Price calculations:
  const perPersonPrice = selectedEvent?.price || 0;
  const totalAttendees = regType === 'team' ? 1 + teamMembers.length : 1;
  const baseTotalAmount = perPersonPrice * totalAttendees;

  // Coupon discount calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((baseTotalAmount * appliedCoupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(baseTotalAmount, appliedCoupon.discountValue);
    }
    if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
      discountAmount = appliedCoupon.maxDiscount;
    }
  }

  const finalPayableAmount = Math.max(0, baseTotalAmount - discountAmount);

  // Check if current user or entered email already has an active pass for this event
  const userEffectiveEmail = (user?.email || formData.email || '').trim().toLowerCase();
  const existingUserPass = (userEffectiveEmail && selectedEvent)
    ? passService.findExistingPass(userEffectiveEmail, selectedEvent.id)
    : null;

  // Add / Remove Team Members (Up to 4 additional members, total team size = 5)
  const handleAddTeamMember = () => {
    soundFx.playClick();
    if (teamMembers.length >= 4) return;
    setTeamMembers([
      ...teamMembers,
      {
        name: '',
        email: '',
        department: formData.department || 'Electronics & Communication Engineering',
        collegeName: formData.collegeName || 'PIET, Nagpur',
        year: '3rd Year',
        phone: '',
      },
    ]);
  };

  const handleRemoveTeamMember = (index: number) => {
    soundFx.playLaser();
    const updated = teamMembers.filter((_, i) => i !== index);
    setTeamMembers(updated);
  };

  const handleUpdateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  // Coupon validation handler
  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    soundFx.playClick();
    setCouponError(null);
    setCouponSuccessMsg(null);

    const clean = couponInput.trim().toUpperCase();
    if (!clean) return;

    const matched = availableCoupons.find(
      (c) => c.code.toUpperCase() === clean && (c.active !== false)
    );

    if (!matched) {
      setCouponError(`Coupon "${clean}" is invalid or disabled.`);
      setAppliedCoupon(null);
      return;
    }

    // Expiry Date Validation
    if (matched.validUntil) {
      const expiry = new Date(matched.validUntil);
      if (matched.validUntil.length <= 10) {
        expiry.setHours(23, 59, 59, 999);
      }
      if (new Date() > expiry) {
        setCouponError(`Coupon "${clean}" expired on ${new Date(matched.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`);
        setAppliedCoupon(null);
        return;
      }
    }

    // Start Date Validation
    if (matched.validFrom) {
      const start = new Date(matched.validFrom);
      if (new Date() < start) {
        setCouponError(`Coupon "${clean}" will become active on ${new Date(matched.validFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`);
        setAppliedCoupon(null);
        return;
      }
    }

    // Usage Limit Validation
    if (matched.usageLimit !== undefined && (matched.usedCount || 0) >= matched.usageLimit) {
      setCouponError(`Coupon "${clean}" redemption limit (${matched.usageLimit} maximum redemptions) has been reached.`);
      setAppliedCoupon(null);
      return;
    }

    if (matched.minAmount && baseTotalAmount < matched.minAmount) {
      setCouponError(`Coupon requires a minimum order amount of ₹${matched.minAmount}.`);
      setAppliedCoupon(null);
      return;
    }

    soundFx.playSuccess();
    setAppliedCoupon(matched);
    setCouponSuccessMsg(
      `✓ Coupon "${matched.code}" applied! ${matched.description}`
    );
  };

  const handleRemoveCoupon = () => {
    soundFx.playLaser();
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponSuccessMsg(null);
    setCouponError(null);
  };

  const handleGoogleSignInClick = () => {
    soundFx.playClick();
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const completeRegistration = async (payId: string, status: 'PAID' | 'FREE') => {
    if (!selectedEvent) return;

    const pass = passService.generatePass({
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      eventDate: selectedEvent.date,
      eventTime: selectedEvent.time,
      eventVenue: selectedEvent.venue,
      userName: formData.name || user?.name || 'Attendee',
      userEmail: (user?.email || formData.email || '').trim().toLowerCase(),
      userPhoto: user?.photoURL,
      department: formData.department || 'ECE',
      collegeName: formData.collegeName || 'PIET, Nagpur',
      year: formData.year,
      phone: formData.phone,
      paymentId: payId,
      amount: finalPayableAmount,
      originalAmount: baseTotalAmount,
      discountAmount,
      couponCode: appliedCoupon?.code || '',
      registrationType: regType,
      teamName: regType === 'team' ? (teamName || `${formData.name}'s Team`) : undefined,
      teamMembers: regType === 'team' ? teamMembers : undefined,
      paymentStatus: status,
    });

    await api.createPass(pass);
    if (appliedCoupon) {
      await api.incrementCouponUsage(appliedCoupon.code);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ece_passes_updated'));
    }

    setGeneratedPass(pass);
    setPaymentProcessing(false);

    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#00E5FF', '#FFD60A', '#3B82F6', '#A855F7', '#10B981'],
    });
  };

  const launchRazorpayCheckout = () => {
    if (!selectedEvent) return;
    setPaymentProcessing(true);
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_51a2b3c4d5e6f7';

    if (window.Razorpay) {
      try {
        const options = {
          key: razorpayKey,
          amount: finalPayableAmount * 100,
          currency: 'INR',
          name: 'SPACE & SINC Forum',
          description: `Registration for ${selectedEvent.title} (${regType === 'team' ? 'Team: ' + teamName : 'Individual'})`,
          image: '/space_logo.webp',
          handler: function (response: any) {
            soundFx.playClick();
            completeRegistration(
              response.razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 12)}`,
              'PAID'
            );
          },
          prefill: {
            name: formData.name || user?.name,
            email: user?.email || formData.email,
            contact: formData.phone,
          },
          notes: {
            eventId: selectedEvent.id,
            eventTitle: selectedEvent.title,
            registrationType: regType,
            teamName: teamName || '',
            collegeName: formData.collegeName || '',
            attendeesCount: totalAttendees,
            couponCode: appliedCoupon?.code || '',
          },
          theme: {
            color: '#00E5FF',
          },
          modal: {
            ondismiss: function () {
              setPaymentProcessing(false);
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on('payment.failed', function (response: any) {
          setPaymentProcessing(false);
          alert(`Payment Failed: ${response.error.description || 'Transaction cancelled.'}`);
        });
        razorpayInstance.open();
      } catch {
        setTimeout(() => {
          completeRegistration(`pay_demo_${Math.random().toString(36).substring(2, 11)}`, 'PAID');
        }, 1000);
      }
    } else {
      setTimeout(() => {
        completeRegistration(`pay_demo_${Math.random().toString(36).substring(2, 11)}`, 'PAID');
      }, 1000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();

    if (!isAuthenticated || !user?.email) {
      handleGoogleSignInClick();
      return;
    }

    if (!selectedEvent) return;

    // 1. Prevent duplicate registration for primary registrant
    if (existingUserPass) {
      soundFx.playLaser();
      alert(`You have already registered for ${selectedEvent.title} (Pass ID: #${existingUserPass.passId}). Duplicate registrations are not allowed.`);
      setGeneratedPass(existingUserPass);
      return;
    }

    if (!formData.department.trim()) {
      alert('Please type your Department.');
      return;
    }

    if (!formData.collegeName.trim()) {
      alert('Please type your College / Institution Name.');
      return;
    }

    // 2. Prevent duplicate registration for Team Members
    if (regType === 'team') {
      if (!teamName.trim()) {
        alert('Please enter your Team Name.');
        return;
      }
      for (let i = 0; i < teamMembers.length; i++) {
        const m = teamMembers[i];
        if (!m.name.trim() || !m.email.trim()) {
          alert(`Please fill in Name and Email for Team Member #${i + 2}.`);
          return;
        }

        const memberCleanEmail = m.email.trim().toLowerCase();
        if (memberCleanEmail === userEffectiveEmail) {
          alert(`Team Member #${i + 2} (${m.name}) has the same email as the Team Leader. Please enter distinct emails for each member.`);
          return;
        }

        const memberExistingPass = passService.findExistingPass(memberCleanEmail, selectedEvent.id);
        if (memberExistingPass) {
          alert(`Team Member "${m.name}" (${memberCleanEmail}) is already registered for this event (Pass #${memberExistingPass.passId}).`);
          return;
        }
      }
    }

    if (finalPayableAmount > 0) {
      launchRazorpayCheckout();
    } else {
      completeRegistration('FREE_PASS_' + Math.floor(1000 + Math.random() * 9000), 'FREE');
    }
  };

  const handleSelectEvent = (evtId: string) => {
    soundFx.playClick();
    setSearchParams({ event: evtId });
    setGeneratedPass(null);
  };

  return (
    <div className="min-h-screen bg-[#03060C] text-slate-100 relative selection:bg-lime selection:text-midnight font-sans overflow-x-hidden pb-16">
      
      {/* Suggestions Datalists */}
      <datalist id="department-suggestions">
        <option value="Electronics & Communication Engineering (ECE)" />
        <option value="Electronics and Telecommunication (ETC)" />
        <option value="Computer Science & Engineering (CSE)" />
        <option value="Information Technology (IT)" />
        <option value="Artificial Intelligence & Data Science (AI/DS)" />
        <option value="Electrical Engineering (EE)" />
        <option value="Mechanical Engineering (ME)" />
        <option value="Civil Engineering (CE)" />
        <option value="Robotics & Automation" />
      </datalist>

      <datalist id="college-suggestions">
        <option value="Priyadarshini Institute of Engineering & Technology (PIET), Nagpur" />
        <option value="Priyadarshini College of Engineering (PCE), Nagpur" />
        <option value="Visvesvaraya National Institute of Technology (VNIT), Nagpur" />
        <option value="Government College of Engineering, Nagpur (GCOEN)" />
        <option value="Shri Ramdeobaba College of Engineering and Management (RCOEM)" />
        <option value="Yeshwantrao Chavan College of Engineering (YCCE), Nagpur" />
        <option value="G.H. Raisoni College of Engineering (GHRCE), Nagpur" />
        <option value="College of Engineering Pune (COEP)" />
        <option value="VJTI Mumbai" />
      </datalist>

      {/* Background Volumetric Lighting */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[500px] bg-lime/[0.05] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[450px] bg-amber/[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* Cyber Grid Pattern */}
      <div className="absolute inset-0 cyber-grid-pattern opacity-30 pointer-events-none" />

      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#040711]/90 backdrop-blur-2xl border-b border-white/10 py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Return Home Button */}
          <Link
            to="/"
            onClick={() => soundFx.playClick()}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-midnight border border-white/10 hover:border-lime/50 text-slate-300 hover:text-white transition-all text-xs font-mono group cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-lime" />
            <span>Return to Home</span>
          </Link>

          {/* Department Branding */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-midnight-lighter border border-white/10">
              <img src="/space_logo.webp" alt="SPACE" className="w-5 h-5 object-contain" />
              <img src="/sinc_logo.webp" alt="SINC" className="w-5 h-5 object-contain filter drop-shadow-[0_0_4px_rgba(0,242,254,0.6)]" />
            </div>
            <div className="hidden sm:block text-left">
              <span className="block font-space font-bold text-xs text-white">PIET ECE FORUM</span>
              <span className="block text-[9px] font-mono text-lime">Event Pass Terminal</span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setIsMyPassesOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-midnight-lighter border border-white/10 hover:border-amber/50 text-slate-300 hover:text-amber text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Ticket className="w-3.5 h-3.5 text-amber" />
              <span className="hidden sm:inline">My Passes</span>
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 p-1 rounded-xl bg-midnight border border-lime/30">
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={user.name}
                  className="w-6 h-6 rounded-lg object-cover"
                />
                <span className="text-[11px] font-mono text-white font-bold pr-1.5 hidden md:inline truncate max-w-[100px]">
                  {user.name.split(' ')[0]}
                </span>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignInClick}
                className="px-3 py-1.5 rounded-xl bg-lime text-midnight font-space font-bold text-xs shadow-lime hover:opacity-95 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Registration Workspace ───────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 relative z-10">
        
        {/* Page Title & Breadcrumb */}
        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime text-[10px] font-mono uppercase font-bold tracking-widest">
            <Ticket className="w-3 h-3 text-lime" />
            <span>EVENT ADMISSION &amp; TEAM REGISTRATION</span>
          </div>
          <h1 className="font-space text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Event Registration Portal
          </h1>
          <p className="text-xs font-mono text-slate-400 max-w-xl">
            Register individually or register your entire team, apply official organizer promo coupons, and generate your admission pass. Open to PIET and all participating colleges!
          </p>
        </div>

        {/* ── Event Switcher Ribbon ────────────────────────────────────── */}
        <div className="mb-8 space-y-2">
          <span className="text-[11px] font-mono text-slate-400 block flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-lime" />
            <span>Select Active Event:</span>
          </span>
          <div className="flex flex-wrap gap-2.5">
            {eventsList.map((evt) => {
              const isCurrent = selectedEvent?.id === evt.id;
              return (
                <button
                  key={evt.id}
                  onClick={() => handleSelectEvent(evt.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer border ${
                    isCurrent
                      ? 'bg-gradient-to-r from-lime/20 to-blue-600/20 border-lime text-white font-bold shadow-[0_0_20px_rgba(0,242,254,0.25)]'
                      : 'bg-midnight/90 border-white/10 text-slate-400 hover:text-white hover:border-white/25'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-lime" />
                  <span className="font-space">{evt.title}</span>
                  <span className="text-[10px] text-amber px-2 py-0.5 rounded bg-midnight border border-white/10">
                    {evt.price ? `₹${evt.price}/person` : 'FREE'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Two Column Registration Layout ───────────────────────────── */}
        {selectedEvent ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Event Spotlight Card (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl bg-gradient-to-br from-[#080D1A] to-[#04060C] border border-white/15 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] sticky top-24">
                
                {/* Event Image Banner */}
                <div className="relative aspect-[16/9] bg-midnight overflow-hidden">
                  <img
                    src={selectedEvent.image || '/event_images/tarang.webp'}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080D1A] via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-midnight/90 border border-white/20 text-[10px] font-mono font-bold text-lime">
                    {selectedEvent.badge || selectedEvent.category}
                  </div>
                  <div className="absolute bottom-3 right-3 px-3.5 py-1 rounded-xl bg-midnight/90 border border-amber-400/40 text-xs font-mono font-extrabold text-amber shadow-lg">
                    {selectedEvent.price ? `₹${selectedEvent.price} / Attendee` : 'FREE ADMISSION'}
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-6 sm:p-7 space-y-5">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                      EVENT SUMMARY
                    </span>
                    <h2 className="font-space font-extrabold text-xl sm:text-2xl text-white leading-snug">
                      {selectedEvent.title}
                    </h2>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {selectedEvent.description}
                    </p>
                  </div>

                  {/* Metadata Matrix */}
                  <div className="space-y-2.5 pt-2 border-t border-white/10 text-xs font-mono">
                    <div className="p-3 bg-midnight rounded-xl border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-lime" />
                        <span>Date</span>
                      </span>
                      <strong className="text-white">{selectedEvent.date}</strong>
                    </div>

                    <div className="p-3 bg-midnight rounded-xl border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber" />
                        <span>Time</span>
                      </span>
                      <strong className="text-white">{selectedEvent.time}</strong>
                    </div>

                    <div className="p-3 bg-midnight rounded-xl border border-white/5 flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyber-purple" />
                        <span>Venue</span>
                      </span>
                      <strong className="text-white">{selectedEvent.venue}</strong>
                    </div>
                  </div>

                  {/* Live Pricing Summary Indicator */}
                  <div className="p-4 rounded-2xl bg-midnight border border-amber/30 space-y-2 text-xs font-mono">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Rate per attendee:</span>
                      <strong className="text-white">₹{perPersonPrice} INR</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Registered Attendees:</span>
                      <strong className="text-lime">{totalAttendees} {regType === 'team' ? '(Team Pass)' : '(Individual)'}</strong>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-cyber-emerald">
                        <span>Coupon ({appliedCoupon.code}):</span>
                        <strong>-₹{discountAmount} INR</strong>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-white/10 text-sm">
                      <span className="text-white font-bold">Total Payable:</span>
                      <strong className="text-amber font-space font-extrabold text-lg">
                        {finalPayableAmount > 0 ? `₹${finalPayableAmount} INR` : 'FREE'}
                      </strong>
                    </div>
                  </div>

                  {/* Security Guarantee Note */}
                  <div className="p-3.5 rounded-2xl bg-lime/5 border border-lime/20 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-lime shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                      Admission passes include dynamic QR scanning verified by departmental gate marshals. Team passes admit all registered team members under one master credential.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN: Registration Form / Generated Pass (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {!generatedPass ? (
                <div className="p-6 sm:p-8 rounded-3xl bg-midnight-lighter border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-6 relative overflow-hidden">
                  
                  {/* Glowing Top Edge */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-lime via-amber to-lime animate-pulse" />

                  <div className="border-b border-white/10 pb-4">
                    <h3 className="font-space font-extrabold text-2xl text-white">
                      Admission Form
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mt-1">
                      Choose Individual or Team participation, type your department &amp; college, and apply coupon codes.
                    </p>
                  </div>

                  {/* ── STEP 1: Google Auth Gatekeeper ── */}
                  {!isAuthenticated || !user ? (
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#080D1F] to-[#04060E] border border-lime/40 space-y-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-lime/15 border border-lime/40 flex items-center justify-center mx-auto text-lime shadow-lime">
                        <User className="w-6 h-6" />
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-space font-extrabold text-lg text-white">
                          Student Google Authentication Required
                        </h4>
                        <p className="text-xs font-mono text-slate-300 max-w-md mx-auto">
                          Sign in with your Google account to auto-verify your name and email, and sync your passes securely across devices.
                        </p>
                      </div>

                      {authError && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center justify-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>{authError}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleGoogleSignInClick}
                        className="py-3 px-8 rounded-xl bg-white hover:bg-slate-100 text-midnight font-space font-extrabold text-xs tracking-wider transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.4)] inline-flex items-center gap-2.5 cursor-pointer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Continue with Google Sign-In</span>
                      </button>
                    </div>
                  ) : (
                    /* Authenticated User Status */
                    <div className="p-3.5 bg-cyber-emerald/10 border border-cyber-emerald/30 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                          alt={user.name}
                          className="w-10 h-10 rounded-xl object-cover border border-white/10"
                        />
                        <div>
                          <strong className="text-white text-xs font-space block">{user.name}</strong>
                          <span className="text-[10px] font-mono text-cyber-emerald flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-cyber-emerald" />
                            <span>Verified Account: {user.email}</span>
                          </span>
                        </div>
                      </div>

                      <span className="text-[9px] font-mono px-2.5 py-1 rounded-lg bg-midnight text-slate-400 border border-white/10">
                        {regType === 'team' ? 'Team Leader' : 'Attendee'}
                      </span>
                    </div>
                  )}

                  {/* ── STEP 2: Participation Mode Selector (Individual vs Team) ── */}
                  <div className="space-y-2">
                    <label className="text-slate-300 text-xs font-mono block">Registration Format:</label>

                    {selectedEvent?.participationType === 'individual_only' ? (
                      /* Individual Only Notice */
                      <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="text-white text-xs font-space block">Individual Registration Only</strong>
                            <span className="text-[10px] text-slate-300 block font-mono">
                              This event is configured for solo participants (1 Attendee · ₹{perPersonPrice}).
                            </span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                          SOLO PASS
                        </span>
                      </div>
                    ) : selectedEvent?.participationType === 'team_only' ? (
                      /* Team Only Notice */
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="text-white text-xs font-space block">Team Registration Mandatory</strong>
                            <span className="text-[10px] text-slate-300 block font-mono">
                              This event requires a team of 2 to 5 members (₹{perPersonPrice}/person).
                            </span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                          TEAM PASS
                        </span>
                      </div>
                    ) : (
                      /* Both Individual & Team Allowed (Default) */
                      <div className="grid grid-cols-2 gap-3">
                        {/* Individual Button */}
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setRegType('individual');
                            setTeamMembers([]);
                          }}
                          className={`p-3.5 rounded-2xl border text-left font-mono transition-all cursor-pointer flex items-center gap-3 ${
                            regType === 'individual'
                              ? 'bg-lime/15 border-lime text-white shadow-[0_0_20px_rgba(0,242,254,0.2)]'
                              : 'bg-midnight border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${regType === 'individual' ? 'bg-lime text-midnight' : 'bg-white/5 text-slate-400'}`}>
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="font-space block text-xs">Individual</strong>
                            <span className="text-[10px] text-slate-400 block">1 Participant (₹{perPersonPrice})</span>
                          </div>
                        </button>

                        {/* Team Button */}
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setRegType('team');
                            if (teamMembers.length === 0) {
                              setTeamMembers([{
                                name: '',
                                email: '',
                                department: formData.department || 'Electronics & Communication Engineering',
                                collegeName: formData.collegeName || 'PIET, Nagpur',
                                year: '3rd Year',
                                phone: '',
                              }]);
                            }
                          }}
                          className={`p-3.5 rounded-2xl border text-left font-mono transition-all cursor-pointer flex items-center gap-3 ${
                            regType === 'team'
                              ? 'bg-amber/15 border-amber text-white shadow-[0_0_20px_rgba(255,184,0,0.2)]'
                              : 'bg-midnight border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${regType === 'team' ? 'bg-amber text-midnight' : 'bg-white/5 text-slate-400'}`}>
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="font-space block text-xs">Team Registration</strong>
                            <span className="text-[10px] text-slate-400 block">2 to 5 Members (₹{perPersonPrice}/person)</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ── STEP 3: Registration Form ── */}
                  <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs">
                    
                    {/* Team Details (If Team selected) */}
                    {regType === 'team' && (
                      <div className="p-4 rounded-2xl bg-midnight border border-amber/30 space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-amber flex items-center gap-1.5 uppercase">
                            <Users className="w-4 h-4" />
                            <span>Team Information</span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Total Size: <strong className="text-white">{1 + teamMembers.length} Members</strong> (Max 5)
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-300 text-[11px]">Team Name *</label>
                          <input
                            type="text"
                            required
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="e.g. Silicon Mavericks, Circuit Titans"
                            className="w-full bg-midnight-lighter border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* Primary Attendee / Team Leader Profile */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">
                        <User className="w-3.5 h-3.5 text-lime" />
                        <span className="text-[11px] font-bold text-white uppercase">
                          {regType === 'team' ? '1. Team Leader Details (Primary Attendee)' : 'Participant Details'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-slate-300 text-[11px]">Full Name *</label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Rahul Sharma"
                            className="w-full bg-midnight border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-lime text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-300 text-[11px]">Email Address *</label>
                          <input
                            type="email"
                            required
                            disabled={Boolean(user?.email)}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="student@college.edu"
                            className="w-full bg-midnight border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-lime text-xs font-mono disabled:opacity-70 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* College / Institution Name & Department (Custom Typed Text) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* College / Institution Name */}
                        <div className="space-y-1.5">
                          <label className="text-slate-300 text-[11px] flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-lime" />
                            <span>College / Institution Name *</span>
                          </label>
                          <input
                            type="text"
                            required
                            list="college-suggestions"
                            value={formData.collegeName}
                            onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                            placeholder="e.g. PIET, VNIT, COEP, RCOEM or your College"
                            className="w-full bg-midnight border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-lime text-xs font-mono"
                          />
                        </div>

                        {/* Department / Branch Name (Typed text with datalist) */}
                        <div className="space-y-1.5">
                          <label className="text-slate-300 text-[11px] flex items-center gap-1">
                            <School className="w-3 h-3 text-cyber-purple" />
                            <span>Department / Branch *</span>
                          </label>
                          <input
                            type="text"
                            required
                            list="department-suggestions"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            placeholder="e.g. Electronics & Communication, CSE, AI/ML"
                            className="w-full bg-midnight border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-lime text-xs font-mono"
                          />
                        </div>

                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-slate-300 text-[11px]">Academic Year *</label>
                          <select
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            className="w-full bg-midnight border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-lime text-xs font-mono cursor-pointer"
                          >
                            <option value="1st Year">1st Year (FE)</option>
                            <option value="2nd Year">2nd Year (SE)</option>
                            <option value="3rd Year">3rd Year (TE)</option>
                            <option value="4th Year">4th Year (BE)</option>
                            <option value="Faculty / Alumni">Faculty / Alumni</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-slate-300 text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-cyber-emerald" />
                            <span>Phone / WhatsApp Number</span>
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                            className="w-full bg-midnight border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-lime text-xs font-mono"
                          />
                        </div>
                      </div>

                    </div>

                    {/* ── Additional Team Members Manager (If Team selected) ── */}
                    {regType === 'team' && (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                          <span className="text-[11px] font-bold text-amber uppercase flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>Additional Team Members ({teamMembers.length}/4)</span>
                          </span>

                          {teamMembers.length < 4 && (
                            <button
                              type="button"
                              onClick={handleAddTeamMember}
                              className="px-3 py-1 rounded-xl bg-amber/20 hover:bg-amber/30 text-amber border border-amber/40 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>+ Add Member</span>
                            </button>
                          )}
                        </div>

                        {teamMembers.map((member, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-midnight border border-white/10 space-y-3 relative group hover:border-amber/40 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-amber font-bold">
                                Member #{idx + 2}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTeamMember(idx)}
                                className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
                                title="Remove Member"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1">Full Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={member.name}
                                  onChange={(e) => handleUpdateTeamMember(idx, 'name', e.target.value)}
                                  placeholder="Member Name"
                                  className="w-full bg-midnight-lighter border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1">Email *</label>
                                <input
                                  type="email"
                                  required
                                  value={member.email}
                                  onChange={(e) => handleUpdateTeamMember(idx, 'email', e.target.value)}
                                  placeholder="member@college.edu"
                                  className="w-full bg-midnight-lighter border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber"
                                />
                              </div>
                            </div>

                            {/* Member College & Department */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1">College / Institution</label>
                                <input
                                  type="text"
                                  list="college-suggestions"
                                  value={member.collegeName || ''}
                                  onChange={(e) => handleUpdateTeamMember(idx, 'collegeName', e.target.value)}
                                  placeholder={formData.collegeName || 'College Name'}
                                  className="w-full bg-midnight-lighter border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1">Department</label>
                                <input
                                  type="text"
                                  list="department-suggestions"
                                  value={member.department || ''}
                                  onChange={(e) => handleUpdateTeamMember(idx, 'department', e.target.value)}
                                  placeholder="Department / Branch"
                                  className="w-full bg-midnight-lighter border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1">Academic Year</label>
                                <select
                                  value={member.year || '3rd Year'}
                                  onChange={(e) => handleUpdateTeamMember(idx, 'year', e.target.value)}
                                  className="w-full bg-midnight-lighter border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber cursor-pointer"
                                >
                                  <option value="1st Year">1st Year (FE)</option>
                                  <option value="2nd Year">2nd Year (SE)</option>
                                  <option value="3rd Year">3rd Year (TE)</option>
                                  <option value="4th Year">4th Year (BE)</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1">Phone (Optional)</label>
                                <input
                                  type="tel"
                                  value={member.phone || ''}
                                  onChange={(e) => handleUpdateTeamMember(idx, 'phone', e.target.value)}
                                  placeholder="+91..."
                                  className="w-full bg-midnight-lighter border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {teamMembers.length < 4 && (
                          <button
                            type="button"
                            onClick={handleAddTeamMember}
                            className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-amber text-slate-400 hover:text-amber text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>+ Add Another Team Member (Up to 4)</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* ── STEP 4: Coupon Code Engine ── */}
                    <div className="p-4 rounded-2xl bg-midnight border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-300 text-xs font-mono flex items-center gap-1.5 font-bold">
                          <Tag className="w-3.5 h-3.5 text-lime" />
                          <span>Promo &amp; Organizer Coupon Code</span>
                        </label>
                        <span className="text-[10px] font-mono text-slate-500">Distributed by Organizers</span>
                      </div>

                      {!appliedCoupon ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            placeholder="Enter Promo Code (e.g. ECE2026, TARANG100)"
                            className="flex-1 bg-midnight-lighter border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-lime text-xs font-mono uppercase tracking-wider"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyCoupon()}
                            disabled={!couponInput.trim()}
                            className="px-5 py-2.5 rounded-xl bg-lime text-midnight font-space font-bold text-xs shadow-lime hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-cyber-emerald/15 border border-cyber-emerald/40 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-cyber-emerald shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-xs text-white bg-cyber-emerald/20 px-2 py-0.5 rounded border border-cyber-emerald/50">
                                  {appliedCoupon.code}
                                </span>
                                <span className="text-xs font-bold text-cyber-emerald">
                                  -₹{discountAmount} OFF Applied!
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-300 font-sans block mt-0.5">
                                {appliedCoupon.description}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Remove Coupon"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {couponError && (
                        <p className="text-[11px] font-mono text-red-400 flex items-center gap-1.5 animate-in fade-in">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>{couponError}</span>
                        </p>
                      )}

                      {couponSuccessMsg && !appliedCoupon && (
                        <p className="text-[11px] font-mono text-cyber-emerald flex items-center gap-1.5 animate-in fade-in">
                          <Check className="w-3.5 h-3.5 text-cyber-emerald shrink-0" />
                          <span>{couponSuccessMsg}</span>
                        </p>
                      )}
                    </div>

                    {/* ── STEP 5: Final Pricing Summary Table ── */}
                    <div className="p-4 rounded-2xl bg-midnight border border-white/10 space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                        <span>Event:</span>
                        <strong className="text-white font-space">{selectedEvent.title}</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                        <span>Registration Type:</span>
                        <span className="text-lime font-bold">
                          {regType === 'team' ? `Team (${1 + teamMembers.length} Attendees)` : 'Individual (1 Attendee)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                        <span>Base Admission (₹{perPersonPrice} × {totalAttendees}):</span>
                        <span className="text-slate-200">₹{baseTotalAmount} INR</span>
                      </div>

                      {appliedCoupon && (
                        <div className="flex justify-between items-center text-xs font-mono text-cyber-emerald">
                          <span>Coupon Discount ({appliedCoupon.code}):</span>
                          <strong className="font-bold">-₹{discountAmount} INR</strong>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-xs font-mono border-t border-white/10 pt-2.5">
                        <span className="text-white font-bold">Total Final Payable:</span>
                        <strong className="text-lg text-amber font-space font-extrabold">
                          {finalPayableAmount > 0 ? `₹${finalPayableAmount} INR` : 'FREE ENTRY'}
                        </strong>
                      </div>
                    </div>

                    {/* Submit Registration CTA / Existing Pass Alert */}
                    <div className="pt-2">
                      {existingUserPass ? (
                        <div className="p-5 rounded-2xl bg-gradient-to-r from-cyber-emerald/15 via-midnight to-lime/10 border-2 border-cyber-emerald/50 space-y-3.5 shadow-cyber-emerald/20 shadow-lg animate-in fade-in">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-xl bg-cyber-emerald/20 text-cyber-emerald border border-cyber-emerald/40 shrink-0">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md bg-cyber-emerald/20 text-cyber-emerald text-[10px] font-mono font-bold uppercase border border-cyber-emerald/40">
                                  Pass Already Issued
                                </span>
                                <span className="text-white font-mono font-bold text-xs">
                                  #{existingUserPass.passId}
                                </span>
                              </div>
                              <h4 className="font-space font-bold text-white text-sm mt-1">
                                You are Already Registered for this Event!
                              </h4>
                              <p className="text-xs font-mono text-slate-300 mt-0.5 leading-relaxed">
                                An official entry pass has already been issued for <strong className="text-white">{userEffectiveEmail}</strong>. To prevent duplicate registrations &amp; charges, a new pass cannot be generated.
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playSuccess();
                                setGeneratedPass(existingUserPass);
                              }}
                              className="flex-1 min-w-[180px] py-3 rounded-xl bg-gradient-to-r from-cyber-emerald to-emerald-500 text-midnight font-space font-extrabold text-xs shadow-cyber-emerald hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4 text-midnight" />
                              <span>View &amp; Download Pass</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playClick();
                                setIsMyPassesOpen(true);
                              }}
                              className="px-4 py-3 rounded-xl bg-midnight border border-white/15 text-slate-300 hover:text-white text-xs font-mono font-bold hover:bg-white/5 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Ticket className="w-4 h-4 text-lime" />
                              <span>My Wallet</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="submit"
                          disabled={paymentProcessing}
                          className="w-full py-4 rounded-2xl bg-gradient-to-r from-lime via-blue-500 to-lime text-midnight font-space font-extrabold text-sm tracking-wider shadow-lime hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          {paymentProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-midnight" />
                              <span>Processing Admission Pass...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 text-midnight" />
                              <span>
                                {finalPayableAmount > 0
                                  ? `Proceed to Secure Checkout (₹${finalPayableAmount})`
                                  : `Generate Instant Free Pass (${regType === 'team' ? `${totalAttendees} Members` : '1 Attendee'})`}
                              </span>
                              <ChevronRight className="w-4 h-4 text-midnight" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                  </form>

                </div>
              ) : (
                /* ── STEP 6: Pass Generation Success Showcase ── */
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                  
                  <div className="p-4 rounded-2xl bg-cyber-emerald/15 border border-cyber-emerald/40 text-cyber-emerald flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-cyber-emerald" />
                      <div>
                        <strong className="font-space font-bold block text-sm">
                          {generatedPass.registrationType === 'team'
                            ? `Team "${generatedPass.teamName}" Registered Successfully!`
                            : 'Registration Confirmed!'}
                        </strong>
                        <span className="text-[11px] font-mono">
                          {generatedPass.registrationType === 'team'
                            ? `Admitting ${1 + (generatedPass.teamMembers?.length || 0)} team members under Pass ${generatedPass.passId}`
                            : 'Your unique digital QR pass has been issued.'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-cyber-emerald text-midnight">
                      PASS ACTIVE
                    </span>
                  </div>

                  {/* Render Holographic Pass Card */}
                  <PassCard pass={generatedPass} />

                  {/* Post-Registration Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setIsMyPassesOpen(true);
                      }}
                      className="px-5 py-3 rounded-2xl bg-midnight border border-white/20 hover:border-lime text-white font-mono text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                    >
                      <Ticket className="w-4 h-4 text-lime" />
                      <span>View in "My Passes"</span>
                    </button>

                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setGeneratedPass(null);
                        setTeamMembers([]);
                        setTeamName('');
                        setAppliedCoupon(null);
                        setCouponInput('');
                      }}
                      className="px-5 py-3 rounded-2xl bg-lime text-midnight font-space font-bold text-xs shadow-lime hover:opacity-95 cursor-pointer"
                    >
                      Register for Another Event
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 font-mono text-sm">
            No active events available. Please return to the home page.
          </div>
        )}

      </main>

      {/* Global Modals on this page */}
      {isAuthModalOpen && (
        <GoogleAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {isMyPassesOpen && (
        <MyPassesModal
          isOpen={isMyPassesOpen}
          onClose={() => setIsMyPassesOpen(false)}
          onOpenGoogleAuth={() => {
            setIsMyPassesOpen(false);
            setIsAuthModalOpen(true);
          }}
          onExploreEvents={() => {
            setIsMyPassesOpen(false);
          }}
        />
      )}

    </div>
  );
};
