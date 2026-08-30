import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, MapPin, Ticket, ShieldCheck, 
  CheckCircle2, User, Phone, School, 
  ChevronRight, AlertCircle, Loader2, Layers, Users, UserPlus, 
  Trash2, Tag, Check, X, Building2, Sparkles, QrCode, Upload,
  Copy, Image as ImageIcon, AlertTriangle, Shield, CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { type EventItem } from '../components/EventsSection';
import { useAuth } from '../context/AuthContext';
import { passService, type EventPass, type TeamMember } from '../services/passService';
import { PassCard } from '../components/PassCard';
import { GoogleAuthModal } from '../components/GoogleAuthModal';
import { MyPassesModal } from '../components/MyPassesModal';
import { soundFx } from '../utils/audio';
import { compressImage } from '../utils/imageCompressor';
import { api, type SiteHeroConfig, DEFAULT_HERO_CONFIG } from '../services/api';

const UPI_ID = 'pieteceforum@okhdfcbank';
const UPI_PAYEE_NAME = 'PIET ECE COUNCIL';

interface RegisterPageProps {
  eventsList: EventItem[];
  heroConfig?: SiteHeroConfig;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ eventsList, heroConfig = DEFAULT_HERO_CONFIG }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { eventId: routeEventId } = useParams<{ eventId?: string }>();
  
  const queryEventId = searchParams.get('event') || routeEventId;

  // Find target event or fallback to first event
  const selectedEvent = eventsList.find((e) => e.id === queryEventId) || eventsList[0] || null;

  const { user, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMyPassesOpen, setIsMyPassesOpen] = useState(false);

  // Dynamic Site & Payment Configuration
  const [siteConfig, setSiteConfig] = useState<SiteHeroConfig>(heroConfig || DEFAULT_HERO_CONFIG);

  useEffect(() => {
    if (heroConfig) {
      setSiteConfig(heroConfig);
    }
  }, [heroConfig]);

  useEffect(() => {
    api.getSiteHeroConfig().then((cfg) => {
      if (cfg) setSiteConfig(cfg);
    }).catch(() => {});

    const handleConfigUpdate = (e: any) => {
      if (e.detail) setSiteConfig(e.detail);
      else api.getSiteHeroConfig().then((cfg) => { if (cfg) setSiteConfig(cfg); }).catch(() => {});
    };
    window.addEventListener('ece_hero_config_updated', handleConfigUpdate);
    return () => window.removeEventListener('ece_hero_config_updated', handleConfigUpdate);
  }, []);

  // Registration Type: Individual vs Team
  const [regType, setRegType] = useState<'individual' | 'team'>('individual');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Team Leader / Primary Attendee Form Data (Completely Blank by default)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: '',
    collegeName: '',
    year: '',
    email: user?.email || '',
    phone: '',
  });

  // Payment Proof & UPI QR State
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>('');
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [generatedPass, setGeneratedPass] = useState<EventPass | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [formValidationWarning, setFormValidationWarning] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync user state from Google Auth (only fill verified name & email, keep department, college, year, phone blank for user entry)
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  // Enforce participation rules & mandatory team sizes based on event configuration
  useEffect(() => {
    if (!selectedEvent) return;

    const reqSize = selectedEvent.requiredTeamSize;
    const isTeamOnly = selectedEvent.participationType === 'team_only';
    const isIndOnly = selectedEvent.participationType === 'individual_only';

    if (isIndOnly) {
      setRegType('individual');
      setTeamMembers([]);
      return;
    }

    if (isTeamOnly) {
      setRegType('team');
      const targetAdditionalMembers = reqSize ? Math.max(1, reqSize - 1) : Math.max(1, (selectedEvent.minTeamSize || 2) - 1);
      
      setTeamMembers((prev) => {
        if (prev.length === targetAdditionalMembers) return prev;
        const current = [...prev];
        while (current.length < targetAdditionalMembers) {
          current.push({
            name: '',
            email: '',
            collegeName: '',
            department: '',
            year: '',
            phone: '',
          });
        }
        return current.slice(0, targetAdditionalMembers);
      });
    } else if (regType === 'team' && reqSize) {
      const targetAdditionalMembers = Math.max(1, reqSize - 1);
      setTeamMembers((prev) => {
        if (prev.length === targetAdditionalMembers) return prev;
        const current = [...prev];
        while (current.length < targetAdditionalMembers) {
          current.push({
            name: '',
            email: '',
            collegeName: '',
            department: '',
            year: '',
            phone: '',
          });
        }
        return current.slice(0, targetAdditionalMembers);
      });
    }
  }, [selectedEvent?.id, selectedEvent?.participationType, selectedEvent?.requiredTeamSize, regType]);

  // Price calculations
  const perPersonPrice = selectedEvent?.price || 0;
  const totalAttendees = regType === 'team' ? 1 + teamMembers.length : 1;
  const finalPayableAmount = perPersonPrice * totalAttendees;

  // Active Payment Gateways (Priority: Event Organizer Custom QR/UPI -> Site-wide Admin QR/UPI -> Default Council UPI)
  const activeUpiId = selectedEvent?.upiId || siteConfig.paymentUpiId || UPI_ID;
  const activePayeeName = selectedEvent?.payeeName || siteConfig.paymentPayeeName || UPI_PAYEE_NAME;
  const customPaymentQr = selectedEvent?.paymentQr || siteConfig.paymentQrImage || '';
  const activeInstructions = selectedEvent?.paymentInstructions || siteConfig.paymentBankDetails || '';

  // Generate dynamic UPI QR Code URL if no custom image is uploaded
  useEffect(() => {
    if (!selectedEvent || finalPayableAmount <= 0) {
      setUpiQrDataUrl('');
      return;
    }

    const upiUri = `upi://pay?pa=${encodeURIComponent(activeUpiId)}&pn=${encodeURIComponent(activePayeeName)}&am=${finalPayableAmount}&cu=INR&tn=${encodeURIComponent(`Reg ${selectedEvent.title.slice(0, 25)}`)}`;
    
    QRCode.toDataURL(upiUri, {
      width: 340,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
      .then((url: string) => setUpiQrDataUrl(url))
      .catch(() => setUpiQrDataUrl(''));
  }, [selectedEvent?.id, selectedEvent?.title, finalPayableAmount, activeUpiId, activePayeeName]);

  // Check if current user or entered email already has an active pass for this event
  const userEffectiveEmail = (user?.email || formData.email || '').trim().toLowerCase();
  const existingUserPass = (userEffectiveEmail && selectedEvent)
    ? passService.findExistingPass(userEffectiveEmail, selectedEvent.id)
    : null;

  // Handle Team Member management
  const handleAddTeamMember = () => {
    soundFx.playClick();
    if (selectedEvent?.requiredTeamSize) {
      return; // Fixed mandatory team size cannot add arbitrary members
    }
    const maxMembers = selectedEvent?.maxTeamSize ? selectedEvent.maxTeamSize - 1 : 4;
    if (teamMembers.length >= maxMembers) return;
    setTeamMembers([
      ...teamMembers,
      {
        name: '',
        email: '',
        collegeName: '',
        department: '',
        year: '',
        phone: '',
      },
    ]);
  };

  const handleRemoveTeamMember = (index: number) => {
    soundFx.playLaser();
    if (selectedEvent?.requiredTeamSize) {
      return; // Fixed mandatory team size cannot remove members
    }
    const minMembers = selectedEvent?.minTeamSize ? Math.max(1, selectedEvent.minTeamSize - 1) : 1;
    if (teamMembers.length <= minMembers) {
      alert(`Team events require at least ${minMembers + 1} participants.`);
      return;
    }
    const updated = teamMembers.filter((_, i) => i !== index);
    setTeamMembers(updated);
  };

  const handleUpdateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const handleCopyUpiId = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(activeUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFx.playClick();
      if (file.size > 15 * 1024 * 1024) {
        alert('Screenshot file size exceeds 15MB. Please choose a smaller image.');
        return;
      }
      setScreenshotFileName(file.name);
      try {
        // Compress large camera/phone screenshots to ~50KB to protect database egress limits
        const compressedBase64 = await compressImage(file, 800, 1000, 0.65);
        setPaymentScreenshot(compressedBase64);
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPaymentScreenshot(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleGoogleSignInClick = () => {
    soundFx.playClick();
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const completeRegistration = async (payId: string, status: 'PAID' | 'FREE', proofScreenshot?: string, utr?: string) => {
    if (!selectedEvent) return;

    setPaymentProcessing(true);

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
      originalAmount: finalPayableAmount,
      discountAmount: 0,
      couponCode: undefined,
      registrationType: regType,
      teamName: regType === 'team' ? (teamName || `${formData.name}'s Team`) : undefined,
      teamMembers: regType === 'team' ? teamMembers : undefined,
      paymentStatus: status,
      paymentScreenshot: proofScreenshot || undefined,
      transactionId: utr || undefined,
    });

    await api.createPass(pass);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ece_passes_updated'));
    }

    soundFx.playSuccess();
    setGeneratedPass(pass);
    setPaymentProcessing(false);

    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#FF4A15', '#FFD60A', '#00E5CC', '#A855F7', '#10B981'],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setFormValidationWarning(null);

    if (!isAuthenticated || !user?.email) {
      handleGoogleSignInClick();
      return;
    }

    if (!selectedEvent) return;

    // 1. Prevent duplicate registration for primary registrant
    const activeExistingPass = existingUserPass || (userEffectiveEmail && selectedEvent ? passService.findExistingPass(userEffectiveEmail, selectedEvent.id) : null);
    if (activeExistingPass) {
      soundFx.playLaser();
      setFormValidationWarning(`You have already registered for ${selectedEvent.title} (Pass ID: #${activeExistingPass.passId}). Duplicate registrations for the same event are not allowed.`);
      setGeneratedPass(activeExistingPass);
      return;
    }

    if (!formData.name.trim()) {
      setFormValidationWarning('Please enter your Full Name.');
      return;
    }

    if (!formData.collegeName.trim()) {
      setFormValidationWarning('Please enter your College / Institution name.');
      return;
    }

    if (!formData.department.trim()) {
      setFormValidationWarning('Please enter your Department / Branch name.');
      return;
    }

    if (!formData.year.trim()) {
      setFormValidationWarning('Please select your Academic Year.');
      return;
    }

    if (!formData.phone.trim() || formData.phone.trim().replace(/\D/g, '').length < 10) {
      setFormValidationWarning('Please provide a valid Mobile / WhatsApp phone number (at least 10 digits).');
      return;
    }

    // 2. Strict Team Validation & Mandatory Team Sizes
    if (regType === 'team') {
      if (!teamName.trim()) {
        setFormValidationWarning('Please provide a Team Name.');
        return;
      }

      const reqSize = selectedEvent.requiredTeamSize;
      if (reqSize && totalAttendees !== reqSize) {
        setFormValidationWarning(`This event strictly requires exactly ${reqSize} team members (1 Team Leader + ${reqSize - 1} Teammates). You currently have ${totalAttendees}.`);
        return;
      }

      for (let i = 0; i < teamMembers.length; i++) {
        const m = teamMembers[i];
        if (!m.name.trim()) {
          setFormValidationWarning(`Please fill out the Full Name for Team Member #${i + 2}.`);
          return;
        }
        if (!m.email.trim()) {
          setFormValidationWarning(`Please fill out the Email Address for Team Member #${i + 2}.`);
          return;
        }

        const memberCleanEmail = m.email.trim().toLowerCase();
        if (memberCleanEmail === userEffectiveEmail) {
          setFormValidationWarning(`Team Member #${i + 2} (${m.name}) has the same email as the Team Leader. Every member must have a distinct email.`);
          return;
        }

        const memberExistingPass = passService.findExistingPass(memberCleanEmail, selectedEvent.id);
        if (memberExistingPass) {
          setFormValidationWarning(`Team Member "${m.name}" (${memberCleanEmail}) is already registered for this event (Pass #${memberExistingPass.passId}).`);
          return;
        }
      }
    }

    // 3. Strict Mandatory Payment Proof Validation (For Paid Events)
    if (finalPayableAmount > 0) {
      if (!paymentScreenshot) {
        soundFx.playLaser();
        setFormValidationWarning('⚠️ Payment Screenshot is strictly mandatory. Please scan the UPI QR code, complete payment, and upload your payment successful screenshot before submitting.');
        if (fileInputRef.current) {
          fileInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      completeRegistration(
        `upi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        'PAID',
        paymentScreenshot,
        transactionId
      );
    } else {
      completeRegistration('FREE_PASS_' + Math.floor(1000 + Math.random() * 9000), 'FREE');
    }
  };

  const handleSelectEvent = (evtId: string) => {
    soundFx.playClick();
    setSearchParams({ event: evtId });
    setGeneratedPass(null);
    setPaymentScreenshot('');
    setScreenshotFileName('');
    setTransactionId('');
    setFormValidationWarning(null);
  };

  return (
    <div className="min-h-screen bg-[#08080A] text-[#F5F3EF] relative selection:bg-[#FF4A15]/30 selection:text-white font-sans overflow-x-hidden pb-16">
      {/* Subtle Background Glow & Pattern */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-[#FF4A15]/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[450px] bg-[#FFD60A]/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(245,243,239,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,243,239,0.02)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none opacity-30" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#08080A]/85 backdrop-blur-2xl border-b border-white/[0.08] py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Return Home Button */}
          <Link
            to="/"
            onClick={() => soundFx.playClick()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#101014] border border-white/10 hover:border-[#FF4A15]/50 text-white/70 hover:text-white transition-all text-xs font-mono group cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-[#FF4A15]" />
            <span className="hidden xs:inline">Return to Home</span>
          </Link>

          {/* Department Branding */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#FF4A15] text-white grid place-items-center font-black text-xs shadow-[0_0_12px_rgba(255,74,21,0.4)]">
              ◈
            </div>
            <div className="hidden sm:block text-left">
              <span className="block font-[Syne] font-[800] text-xs text-white leading-none">PIET ECE FORUM</span>
              <span className="block text-[9px] font-mono text-[#FF4A15] tracking-widest mt-0.5">EVENT ADMISSION TERMINAL</span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setIsMyPassesOpen(true);
              }}
              className="px-3.5 py-2 rounded-full bg-[#101014] border border-white/10 hover:border-white/30 text-white/80 hover:text-white text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Ticket className="w-3.5 h-3.5 text-[#FFD60A]" />
              <span className="hidden sm:inline">My Passes</span>
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 p-1 rounded-full bg-[#101014] border border-[#FF4A15]/30">
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-[11px] font-mono text-white font-bold pr-2 hidden md:inline truncate max-w-[100px]">
                  {user.name.split(' ')[0]}
                </span>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignInClick}
                className="px-4 py-2 rounded-full bg-[#FF4A15] text-white font-[Syne] font-bold text-xs shadow-[0_0_15px_rgba(255,74,21,0.3)] hover:opacity-95 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Registration Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 relative z-10">
        
        {/* Page Title & Breadcrumb */}
        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF4A15]/10 border border-[#FF4A15]/30 text-[#FF4A15] text-[10px] font-mono uppercase font-bold tracking-widest">
            <Ticket className="w-3 h-3 text-[#FF4A15]" />
            <span>EVENT ENROLLMENT &amp; PASS REGISTRATION</span>
          </div>
          <h1 className="font-[Syne] text-3xl sm:text-4xl lg:text-5xl font-[800] text-white tracking-tight">
            Event Registration Portal
          </h1>
          <p className="text-xs font-mono text-white/50 max-w-2xl leading-relaxed">
            Register individually or enroll your entire team with mandatory participant configurations, pay seamlessly via UPI QR code, upload proof of payment, and receive your verified entry pass.
          </p>
        </div>

        {/* Event Switcher Ribbon */}
        <div className="mb-8 space-y-2">
          <span className="text-[11px] font-mono text-white/40 block flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#FF4A15]" />
            <span>Select Event from Catalog:</span>
          </span>
          <div className="flex flex-wrap gap-2.5">
            {eventsList.map((evt) => {
              const isCurrent = selectedEvent?.id === evt.id;
              return (
                <button
                  key={evt.id}
                  onClick={() => handleSelectEvent(evt.id)}
                  className={`px-4 py-2.5 rounded-full text-xs font-mono transition-all flex items-center gap-2 cursor-pointer border ${
                    isCurrent
                      ? 'bg-[#FF4A15] border-[#FF4A15] text-white font-bold shadow-[0_0_20px_rgba(255,74,21,0.35)]'
                      : 'bg-[#101014] border-white/10 text-white/60 hover:text-white hover:border-white/25'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span className="font-[Syne] font-bold">{evt.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-white font-mono">
                    {evt.price ? `₹${evt.price}` : 'FREE'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Two Column Layout */}
        {selectedEvent ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Event Spotlight Card (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-[28px] bg-[#0F0F12] border border-white/[0.08] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] lg:sticky lg:top-24">
                
                {/* Event Image Banner */}
                <div className="relative aspect-[16/9] bg-black overflow-hidden">
                  <img
                    src={selectedEvent.image || '/event_images/tarang.webp'}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-[#FF4A15]">
                    {selectedEvent.badge || selectedEvent.category}
                  </div>
                  <div className="absolute bottom-3 right-3 px-3.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#FFD60A]/40 text-xs font-mono font-bold text-[#FFD60A] shadow-lg">
                    {selectedEvent.price ? `₹${selectedEvent.price} / Attendee` : 'FREE ADMISSION'}
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-6 sm:p-7 space-y-5">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                      EVENT DOSSIER
                    </span>
                    <h2 className="font-[Syne] font-[800] text-xl sm:text-2xl text-white leading-snug">
                      {selectedEvent.title}
                    </h2>
                    <p className="text-xs text-white/60 font-sans leading-relaxed">
                      {selectedEvent.description}
                    </p>
                  </div>

                  {/* Metadata Matrix */}
                  <div className="space-y-2.5 pt-2 border-t border-white/[0.06] text-xs font-mono">
                    <div className="p-3 bg-black/50 rounded-xl border border-white/[0.06] flex items-center justify-between gap-3">
                      <span className="text-white/40 flex items-center gap-2 shrink-0">
                        <Calendar className="w-4 h-4 text-[#FF4A15]" />
                        <span>Date</span>
                      </span>
                      <strong className="text-white text-right break-words min-w-0">{selectedEvent.date}</strong>
                    </div>

                    <div className="p-3 bg-black/50 rounded-xl border border-white/[0.06] flex items-center justify-between gap-3">
                      <span className="text-white/40 flex items-center gap-2 shrink-0">
                        <Clock className="w-4 h-4 text-[#FFD60A]" />
                        <span>Time</span>
                      </span>
                      <strong className="text-white text-right break-words min-w-0">{selectedEvent.time}</strong>
                    </div>

                    <div className="p-3 bg-black/50 rounded-xl border border-white/[0.06] flex items-center justify-between gap-3">
                      <span className="text-white/40 flex items-center gap-2 shrink-0">
                        <MapPin className="w-4 h-4 text-[#00E5CC]" />
                        <span>Venue</span>
                      </span>
                      <strong className="text-white text-right break-words min-w-0">{selectedEvent.venue}</strong>
                    </div>
                  </div>

                  {/* Live Pricing Summary Indicator */}
                  <div className="p-4 rounded-2xl bg-black/60 border border-[#FF4A15]/20 space-y-2 text-xs font-mono">
                    <div className="flex justify-between items-center text-white/60">
                      <span>Rate per attendee:</span>
                      <strong className="text-white">₹{perPersonPrice} INR</strong>
                    </div>
                    <div className="flex justify-between items-center text-white/60">
                      <span>Enrolled Attendees:</span>
                      <strong className="text-[#FF4A15]">{totalAttendees} {regType === 'team' ? '(Team)' : '(Individual)'}</strong>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/[0.08] text-sm">
                      <span className="text-white font-bold font-[Syne]">Total Payable:</span>
                      <strong className="text-[#FFD60A] font-[Syne] font-[800] text-lg">
                        {finalPayableAmount > 0 ? `₹${finalPayableAmount} INR` : 'FREE ENTRY'}
                      </strong>
                    </div>
                  </div>

                  {/* Mandatory Team Size Badge */}
                  {selectedEvent.requiredTeamSize && (
                    <div className="p-3.5 rounded-2xl bg-[#00E5CC]/10 border border-[#00E5CC]/30 flex items-center gap-3">
                      <Users className="w-5 h-5 text-[#00E5CC] shrink-0" />
                      <div className="text-xs font-mono text-white/80">
                        <strong className="text-[#00E5CC] block">Mandatory {selectedEvent.requiredTeamSize} Members</strong>
                        <span>All {selectedEvent.requiredTeamSize} teammate profiles must be filled before pass issuance.</span>
                      </div>
                    </div>
                  )}

                  {/* Security Guarantee Note */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#FF4A15] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-white/50 font-mono leading-relaxed">
                      Passes include cryptographic QR codes verified at gate entry. Payment screenshots are reviewed by the council admin studio.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN: Registration Form & UPI Payment or Existing Pass Display (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {!(generatedPass || existingUserPass) ? (
                <div className="p-6 sm:p-8 rounded-[28px] bg-[#0F0F12] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.7)] space-y-6 relative overflow-hidden">
                  
                  {/* Glowing Accent Top Border */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4A15] to-transparent opacity-80" />

                  <div className="border-b border-white/[0.08] pb-4">
                    <h3 className="font-[Syne] font-[800] text-2xl text-white">
                      Registration Form
                    </h3>
                    <p className="text-xs font-mono text-white/40 mt-1">
                      Complete participant dossier, configure team members, and upload mandatory payment proof.
                    </p>
                  </div>

                  {/* STEP 1: Google Auth Gatekeeper */}
                  {!isAuthenticated || !user ? (
                    <div className="p-6 rounded-2xl bg-[#121216] border border-[#FF4A15]/30 space-y-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-[#FF4A15]/10 border border-[#FF4A15]/30 flex items-center justify-center mx-auto text-[#FF4A15]">
                        <User className="w-6 h-6" />
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-[Syne] font-[800] text-lg text-white">
                          Student Google Authentication Required
                        </h4>
                        <p className="text-xs font-mono text-white/50 max-w-md mx-auto">
                          Sign in with your Google account to auto-verify your credentials and synchronize passes across devices.
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
                        className="py-3 px-8 rounded-full bg-white hover:bg-slate-100 text-black font-[Syne] font-bold text-xs tracking-wider transition-all shadow-lg inline-flex items-center gap-2.5 cursor-pointer"
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
                    <div className="p-3.5 bg-[#121216] border border-white/[0.08] rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                          alt={user.name}
                          className="w-9 h-9 rounded-xl object-cover border border-white/10"
                        />
                        <div>
                          <strong className="text-white text-xs font-[Syne] block">{user.name}</strong>
                          <span className="text-[10px] font-mono text-[#00FF88] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#00FF88]" />
                            <span>Verified: {user.email}</span>
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-black/60 text-white/50 border border-white/10">
                        {regType === 'team' ? 'Team Leader' : 'Attendee'}
                      </span>
                    </div>
                  )}

                  {/* Form Validation Warning Notice */}
                  {formValidationWarning && (
                    <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-start gap-3 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-in fade-in duration-200">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <strong className="block text-white font-bold">Action Required:</strong>
                        <span>{formValidationWarning}</span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Primary Attendee Fields */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                        <span className="text-xs font-mono font-bold text-[#FF4A15] uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>{regType === 'team' ? '1. Team Leader / Contact Person' : 'Participant Details'}</span>
                        </span>
                        <span className="text-[10px] font-mono text-white/40">* Required fields</span>
                      </div>

                      {/* Full Name */}
                      <div>
                        <label className="text-xs text-white/60 font-mono block mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          autoComplete="name"
                          spellCheck={false}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your official full name"
                          className="w-full bg-[#121216] border border-white/10 rounded-2xl p-3 text-white text-xs font-mono focus:outline-none focus:border-[#FF4A15] transition-colors"
                        />
                      </div>

                      {/* College Name & Department */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-xs text-white/60 font-mono block mb-1">
                            College / Institute *
                          </label>
                          <input
                            type="text"
                            required
                            autoComplete="off"
                            spellCheck={false}
                            value={formData.collegeName}
                            onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                            placeholder="College Name (e.g. PIET)"
                            className="w-full bg-[#121216] border border-white/10 rounded-2xl p-3 text-white text-xs font-mono focus:outline-none focus:border-[#FF4A15] transition-colors"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-white/60 font-mono block mb-1">
                            Department / Branch *
                          </label>
                          <input
                            type="text"
                            required
                            autoComplete="off"
                            spellCheck={false}
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            placeholder="e.g. ECE, CSE, IT, EE"
                            className="w-full bg-[#121216] border border-white/10 rounded-2xl p-3 text-white text-xs font-mono focus:outline-none focus:border-[#FF4A15] transition-colors"
                          />
                        </div>
                      </div>

                      {/* Academic Year & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-xs text-white/60 font-mono block mb-1">
                            Academic Year *
                          </label>
                          <select
                            required
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            className="w-full bg-[#121216] border border-white/10 rounded-2xl p-3 text-white text-xs font-mono focus:outline-none focus:border-[#FF4A15] transition-colors cursor-pointer"
                          >
                            <option value="">-- Select Year --</option>
                            <option value="1st Year">1st Year (FE)</option>
                            <option value="2nd Year">2nd Year (SE)</option>
                            <option value="3rd Year">3rd Year (TE)</option>
                            <option value="4th Year">4th Year (BE)</option>
                            <option value="Faculty / Alumni">Faculty / Alumni</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-white/60 font-mono block mb-1">
                            WhatsApp / Mobile Phone *
                          </label>
                          <input
                            type="tel"
                            required
                            autoComplete="tel"
                            spellCheck={false}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+91..."
                            className="w-full bg-[#121216] border border-white/10 rounded-2xl p-3 text-white text-xs font-mono focus:outline-none focus:border-[#FF4A15] transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Team Configuration (If Team Pass) */}
                    {regType === 'team' && (
                      <div className="space-y-4 pt-2 border-t border-white/[0.06]">
                        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                          <span className="text-xs font-mono font-bold text-[#00E5CC] uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>Team Information ({1 + teamMembers.length} Members Total)</span>
                          </span>
                          {!selectedEvent.requiredTeamSize && (
                            <button
                              type="button"
                              onClick={handleAddTeamMember}
                              className="text-[11px] font-mono font-bold text-[#00E5CC] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <UserPlus className="w-3 h-3" /> Add Member
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="text-xs text-white/60 font-mono block mb-1">
                            Team Name *
                          </label>
                          <input
                            type="text"
                            required
                            autoComplete="off"
                            spellCheck={false}
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="e.g. Cyber Ninjas, ECE Titans"
                            className="w-full bg-[#121216] border border-white/10 rounded-2xl p-3 text-white text-xs font-mono focus:outline-none focus:border-[#00E5CC]"
                          />
                        </div>

                        {/* Teammates List */}
                        {teamMembers.map((member, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3 font-mono">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-[#00E5CC]/20 text-[#00E5CC] text-[10px] grid place-items-center">
                                  {idx + 2}
                                </span>
                                <span>Team Member #{idx + 2}</span>
                              </span>
                              {!selectedEvent.requiredTeamSize && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTeamMember(idx)}
                                  className="text-white/40 hover:text-red-400 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] text-white/50 block mb-1">Full Name *</label>
                                <input
                                  type="text"
                                  required
                                  autoComplete="off"
                                  spellCheck={false}
                                  value={member.name}
                                  onChange={(e) => handleUpdateTeamMember(idx, 'name', e.target.value)}
                                  placeholder="Member Name"
                                  className="w-full bg-[#121216] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#00E5CC]"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-white/50 block mb-1">Email Address *</label>
                                <input
                                  type="email"
                                  required
                                  autoComplete="email"
                                  spellCheck={false}
                                  value={member.email}
                                  onChange={(e) => handleUpdateTeamMember(idx, 'email', e.target.value)}
                                  placeholder="member@email.com"
                                  className="w-full bg-[#121216] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#00E5CC]"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* UPI Payment QR & Screenshot Upload Section (For Paid Events) */}
                    {finalPayableAmount > 0 ? (
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121216] to-[#0A0A0C] border border-[#FF4A15]/30 space-y-4 shadow-[0_0_30px_rgba(255,74,21,0.06)]">
                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                          <div className="flex items-center gap-2 text-white font-[Syne] font-[800] text-sm">
                            <QrCode className="w-4 h-4 text-[#FF4A15]" />
                            <span>Scan UPI QR &amp; Upload Payment Proof</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#FFD60A]">
                            Payable: ₹{finalPayableAmount}
                          </span>
                        </div>

                        {/* QR Code and Instructions Grid */}
                        <div className="grid sm:grid-cols-12 gap-4 items-center">
                          {/* QR Code Container */}
                          <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-white text-black shadow-lg">
                            {customPaymentQr ? (
                              <img
                                src={customPaymentQr}
                                alt="Official Payment QR Code"
                                className="w-44 h-44 object-contain rounded-lg"
                              />
                            ) : upiQrDataUrl ? (
                              <img
                                src={upiQrDataUrl}
                                alt="UPI Payment QR Code"
                                className="w-40 h-40 object-contain rounded-lg"
                              />
                            ) : (
                              <div className="w-40 h-40 grid place-items-center font-mono text-xs text-black/50">
                                Generating QR...
                              </div>
                            )}
                            <div className="text-[10px] font-mono font-bold text-black/70 mt-1.5 tracking-wider text-center">
                              {customPaymentQr ? 'OFFICIAL PAYMENT QR' : 'SCAN WITH ANY UPI APP'}
                            </div>
                          </div>

                          {/* UPI ID & Instructions */}
                          <div className="sm:col-span-7 space-y-2.5 text-xs font-mono">
                            <div className="space-y-1">
                              <span className="text-white/50 text-[10px] uppercase">Official Payee:</span>
                              <div className="text-white font-bold text-xs">{activePayeeName}</div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-white/50 text-[10px] uppercase">UPI ID / VPA:</span>
                              <div className="flex items-center gap-2 p-2 rounded-xl bg-black border border-white/10">
                                <span className="text-white font-mono font-bold text-xs truncate flex-1">{activeUpiId}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    soundFx.playClick();
                                    navigator.clipboard.writeText(activeUpiId);
                                    setCopiedUpi(true);
                                    setTimeout(() => setCopiedUpi(false), 2000);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#FF4A15] text-white text-[10px] font-mono transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedUpi ? <Check className="w-3 h-3 text-[#00FF88]" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1 text-[11px] text-white/70">
                              <p className="flex items-center gap-1.5 text-white/90">
                                <span className="w-4 h-4 rounded-full bg-[#FF4A15]/20 text-[#FF4A15] text-[10px] font-bold grid place-items-center">1</span>
                                Scan with Google Pay, PhonePe, Paytm, or BHIM.
                              </p>
                              <p className="flex items-center gap-1.5 text-white/90">
                                <span className="w-4 h-4 rounded-full bg-[#FF4A15]/20 text-[#FF4A15] text-[10px] font-bold grid place-items-center">2</span>
                                Pay <strong>₹{finalPayableAmount}</strong> and take a screenshot of confirmation.
                              </p>
                              <p className="flex items-center gap-1.5 text-white/90 font-bold text-amber-300">
                                <span className="w-4 h-4 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-bold grid place-items-center">3</span>
                                Upload the screenshot below (* MANDATORY for Admin Approval).
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Mandatory Screenshot Upload Dropzone */}
                        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                          <label className="text-white/90 text-[11px] flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-[#00E5CC]" />
                              <span>Upload Payment Screenshot Proof <strong className="text-red-400 font-bold">* MANDATORY</strong></span>
                            </span>
                            <span className="text-[10px] text-amber-400 font-normal">Required for Admin Pass Approval</span>
                          </label>

                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                              paymentScreenshot
                                ? 'bg-[#00E5CC]/5 border-[#00E5CC]/50 text-white'
                                : 'bg-black/40 border-amber-500/30 hover:border-[#FF4A15]/80 text-white/60 hover:text-white'
                            }`}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleScreenshotUpload}
                              className="hidden"
                            />

                            {paymentScreenshot ? (
                              <div className="flex items-center gap-3 w-full">
                                <img
                                  src={paymentScreenshot}
                                  alt="Payment Screenshot Preview"
                                  className="w-14 h-14 rounded-xl object-cover border border-white/20 shrink-0"
                                />
                                <div className="text-left min-w-0 flex-1">
                                  <div className="font-bold text-xs text-white truncate">{screenshotFileName || 'Payment_Proof.png'}</div>
                                  <div className="text-[10px] text-[#00FF88] flex items-center gap-1 mt-0.5">
                                    <CheckCircle2 className="w-3 h-3" /> Screenshot Attached — Ready for Admin Verification
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPaymentScreenshot('');
                                    setScreenshotFileName('');
                                  }}
                                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-red-500 hover:text-white text-xs font-mono"
                                >
                                  Replace
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 grid place-items-center text-amber-300">
                                  <Upload className="w-5 h-5 text-amber-400" />
                                </div>
                                <div className="text-xs font-mono font-bold text-white">
                                  Click or Drop Payment Screenshot Here <span className="text-red-400">*</span>
                                </div>
                                <div className="text-[10px] text-amber-200/70 font-mono">
                                  Screenshot must show UPI transaction reference, date, and amount ₹{finalPayableAmount}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Free Pass Waiver Banner */
                      <div className="p-4 rounded-2xl bg-[#00FF88]/10 border border-[#00FF88]/30 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#00FF88] shrink-0" />
                        <div>
                          <strong className="font-[Syne] font-bold text-white text-xs block">Free Admission / Promo Waiver Applied</strong>
                          <span className="text-[10px] font-mono text-white/70">
                            No payment required. Your pass registration will be submitted for Admin approval.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Final Submission Action Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={paymentProcessing || (finalPayableAmount > 0 && !paymentScreenshot)}
                        className="w-full py-4 rounded-full bg-[#FF4A15] text-white font-[Syne] font-[800] text-sm tracking-wider shadow-[0_0_30px_rgba(255,74,21,0.35)] hover:bg-white hover:text-black transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {paymentProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Submitting for Admin Verification...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>
                              {finalPayableAmount > 0
                                ? (paymentScreenshot ? `Submit Payment Proof & Request Pass Approval (₹${finalPayableAmount})` : `Upload Screenshot to Submit (₹${finalPayableAmount})`)
                                : `Generate Free Pass (${regType === 'team' ? `${totalAttendees} Attendees` : 'Solo'})`}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                  </form>

                </div>
              ) : (
                /* Pass Showcase (Rendered for freshly generated pass OR existing enrolled pass) */
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                  {existingUserPass && !generatedPass ? (
                    <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                        <div className="min-w-0">
                          <strong className="font-[Syne] font-bold block text-sm text-white truncate">
                            Already Enrolled in {selectedEvent.title}
                          </strong>
                          <span className="text-[11px] font-mono text-white/70 break-words">
                            You hold Pass #{existingUserPass.passId}. Duplicate pass generation for the same event is disabled.
                          </span>
                        </div>
                      </div>
                      <span className={`shrink-0 text-xs font-mono font-bold px-3 py-1.5 rounded-full ${
                        existingUserPass.status === 'CONFIRMED'
                          ? 'bg-emerald-500 text-black'
                          : existingUserPass.status === 'CHECKED_IN'
                          ? 'bg-blue-500 text-white'
                          : 'bg-amber-400 text-black animate-pulse'
                      }`}>
                        {existingUserPass.status === 'CONFIRMED'
                          ? '✅ VERIFIED BY ADMIN'
                          : existingUserPass.status === 'CHECKED_IN'
                          ? '🟢 CHECKED IN'
                          : '⏳ PENDING ADMIN APPROVAL'}
                      </span>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                        <div className="min-w-0">
                          <strong className="font-[Syne] font-bold block text-sm text-white truncate">
                            Registration Submitted — Awaiting Admin Verification
                          </strong>
                          <span className="text-[11px] font-mono text-white/70 break-words">
                            Pass #{generatedPass?.passId} is issued as UNVERIFIED. Gate Scanner entry is locked until manually approved by an Admin.
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-amber-400 text-black animate-pulse">
                        ⏳ UNVERIFIED (PENDING)
                      </span>
                    </div>
                  )}

                  {/* Render Holographic Pass Card */}
                  <PassCard pass={generatedPass || existingUserPass!} />

                  {/* Post-Registration Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setIsMyPassesOpen(true);
                      }}
                      className="px-5 py-3 rounded-full bg-[#101014] border border-white/20 hover:border-[#FF4A15] text-white font-mono text-xs flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-[#FFD60A]" />
                      <span>View All in "My Passes"</span>
                    </button>

                    <Link
                      to="/#events"
                      onClick={() => soundFx.playClick()}
                      className="px-6 py-3 rounded-full bg-[#FF4A15] text-white font-[Syne] font-bold text-xs shadow-[0_0_20px_rgba(255,74,21,0.3)] hover:opacity-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Explore Other Events</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

            </div>

          </div>
        ) : (
          <div className="text-center py-20 text-white/40 font-mono text-sm">
            No active events available. Please return to the homepage.
          </div>
        )}

      </main>

      {/* Global Modals */}
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
