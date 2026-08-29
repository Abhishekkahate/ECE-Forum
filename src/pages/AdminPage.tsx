import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Shield, Plus, FileSpreadsheet, Bell, Users, Calendar, TrendingUp,
  LogOut, Trash2, Search, Upload, Image as ImageIcon, Sparkles,
  Check, CheckCircle2, Sliders, Edit3, FileDown, Tag, Copy, Activity,
  Eye, ExternalLink, AlertTriangle, X, CheckSquare, Layers, Clock, ShieldCheck, DollarSign,
  User, Phone, Mail, School, Building2, Download, QrCode, Star
} from 'lucide-react';
import { AdminLogin } from '../components/AdminLogin';
import { type EventItem } from '../components/EventsSection';
import { type GalleryItem, DEFAULT_GALLERY_ITEMS } from '../components/GallerySection';
import { passService, type EventPass } from '../services/passService';
import { api, type SiteHeroConfig, DEFAULT_HERO_CONFIG, type Coupon, DEFAULT_COUPONS } from '../services/api';
import { soundFx } from '../utils/audio';

interface AdminPageProps {
  eventsList: EventItem[];
  onAddEvent: (newEvent: EventItem) => void;
  onUpdateEvents: (updatedList: EventItem[]) => void;
  onUpdateAnnouncement?: (notice: string) => void;
  currentAnnouncement?: string;
  heroConfig?: SiteHeroConfig;
  onUpdateHeroConfig?: (config: SiteHeroConfig) => void;
  galleryList?: GalleryItem[];
  onUpdateGallery?: (updatedList: GalleryItem[]) => void;
}

const PRESET_BANNERS = [
  { label: 'Cyber Tech Keynote', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80' },
  { label: 'Robotics & Hardware Arena', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80' },
  { label: 'Cleanroom Semiconductor Lab', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=1200&q=80' },
  { label: 'Code & Circuit Sprint', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80' },
  { label: 'Antenna & RF Microwave Lab', url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&q=80' },
];

const PRESET_GALLERY_IMAGES = [
  { label: 'Autonomous Rover Lab', cat: 'Project Expo', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80' },
  { label: 'PCB Surface Soldering', cat: 'Workshop', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80' },
  { label: 'National Hardware Hackathon', cat: 'Hackathon', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80' },
  { label: 'Silicon Cleanroom Tour', cat: 'Industrial Visit', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80' },
  { label: 'FPGA Verilog Synthesis', cat: 'Workshop', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80' },
  { label: 'LoRa Mesh Drone Field Test', cat: 'Project Expo', url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&q=80' },
];

export const AdminPage: React.FC<AdminPageProps> = ({
  eventsList,
  onAddEvent,
  onUpdateEvents,
  onUpdateAnnouncement = () => {},
  currentAnnouncement = '',
  heroConfig,
  onUpdateHeroConfig = () => {},
  galleryList = DEFAULT_GALLERY_ITEMS,
  onUpdateGallery = () => {},
}) => {
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'registrations' | 'coupons' | 'gallery' | 'siteContent' | 'announcements' | 'admins'>('overview');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('ALL');
  
  // Gallery state (multi-photo event albums)
  const [galleryDraft, setGalleryDraft] = useState<GalleryItem[]>(galleryList || DEFAULT_GALLERY_ITEMS);
  const [gallerySavedMsg, setGallerySavedMsg] = useState(false);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [isAddingGallery, setIsAddingGallery] = useState(false);
  const [galleryForm, setGalleryForm] = useState<{
    title: string;
    category: string;
    type: 'image' | 'video';
    url: string;
    images: string[];
    caption: string;
  }>({
    title: '',
    category: 'Workshop',
    type: 'image',
    url: '',
    images: [],
    caption: '',
  });
  const [newPhotoUrlInput, setNewPhotoUrlInput] = useState('');
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const isGalleryModified = useRef(false);
  useEffect(() => {
    if (!isGalleryModified.current && Array.isArray(galleryList)) {
      setGalleryDraft(galleryList);
    }
  }, [galleryList]);

  // Hero & Flagship Config State
  const [heroConfigDraft, setHeroConfigDraft] = useState<SiteHeroConfig>(heroConfig || DEFAULT_HERO_CONFIG);
  const [siteConfigSavedMsg, setSiteConfigSavedMsg] = useState(false);
  const [adminCountdown, setAdminCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });
  const isHeroDraftDirty = useRef(false);

  const updateHeroField = (field: keyof SiteHeroConfig, val: any) => {
    isHeroDraftDirty.current = true;
    setHeroConfigDraft((prev) => ({ ...prev, [field]: val }));
  };

  const applyFlagshipDatePreset = (dateStr: string) => {
    soundFx.playClick();
    updateHeroField('flagshipTargetDate', dateStr);
  };

  const handleSaveHeroConfig = async () => {
    soundFx.playSuccess();
    isHeroDraftDirty.current = false;
    await onUpdateHeroConfig(heroConfigDraft);
    setSiteConfigSavedMsg(true);
    setTimeout(() => setSiteConfigSavedMsg(false), 3500);
  };

  // Format date for datetime-local picker
  const getDatetimeLocalValue = (dateStr?: string) => {
    if (!dateStr) return '2026-08-30T10:00';
    try {
      if (dateStr.includes('T') && dateStr.length >= 16) {
        return dateStr.slice(0, 16);
      }
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
    } catch {}
    return '2026-08-30T10:00';
  };

  useEffect(() => {
    const calc = () => {
      if (!heroConfigDraft.flagshipTargetDate) {
        setAdminCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });
        return;
      }
      try {
        const raw = heroConfigDraft.flagshipTargetDate;
        const norm = raw.includes('+') || raw.includes('Z') ? raw : `${raw}+05:30`;
        let target = new Date(norm).getTime();
        if (isNaN(target)) target = new Date(raw).getTime();
        if (isNaN(target)) {
          setAdminCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });
          return;
        }
        const diff = target - Date.now();
        if (diff > 0) {
          setAdminCountdown({
            days: Math.floor(diff / 86400000),
            hours: Math.floor((diff / 3600000) % 24),
            minutes: Math.floor((diff / 60000) % 60),
            seconds: Math.floor((diff / 1000) % 60),
            isExpired: false,
          });
        } else {
          setAdminCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        }
      } catch {
        setAdminCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });
      }
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [heroConfigDraft.flagshipTargetDate]);

  useEffect(() => {
    if (!isHeroDraftDirty.current && heroConfig) {
      setHeroConfigDraft(heroConfig);
    }
  }, [heroConfig]);

  useEffect(() => {
    api.getSiteHeroConfig().then((cfg) => {
      if (cfg && !isHeroDraftDirty.current) {
        setHeroConfigDraft(cfg);
      }
    }).catch(() => {});
  }, []);

  // Passes & Attendee Roster State
  const [passes, setPasses] = useState<EventPass[]>([]);
  const [selectedProofPass, setSelectedProofPass] = useState<EventPass | null>(null);
  const [deletingPassId, setDeletingPassId] = useState<string | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  // Admins & Organizers
  const [adminsList, setAdminsList] = useState<{ id: string; name: string; email: string; role: string; created_at?: string }[]>([]);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [newAdminData, setNewAdminData] = useState({ name: '', email: '', password: '', role: 'Event Organizer' });
  const [searchFilter, setSearchFilter] = useState('');

  // Coupons
  const [couponsList, setCouponsList] = useState<Coupon[]>(DEFAULT_COUPONS);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCouponCode, setEditingCouponCode] = useState<string | null>(null);
  const [couponFormData, setCouponFormData] = useState<Coupon>({ code: '', discountType: 'percentage', discountValue: 20, description: '', active: true, usedCount: 0, validUntil: '', validFrom: '' });
  const [couponSavedMsg, setCouponSavedMsg] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedProofField, setCopiedProofField] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshLivePasses = () => {
    try {
      setPasses(passService.getAllPasses());
    } catch {
      setPasses([]);
    }
  };
  const refreshAdmins = async () => {
    const list = await api.getAdmins();
    setAdminsList(list);
  };
  const refreshCoupons = async () => {
    try {
      const list = await api.getCoupons();
      if (Array.isArray(list)) {
        setCouponsList(list);
      } else {
        setCouponsList([]);
      }
    } catch {
      setCouponsList([]);
    }
  };

  useEffect(() => {
    refreshLivePasses();
    refreshAdmins();
    refreshCoupons();
    const iv = setInterval(refreshLivePasses, 6000);
    return () => clearInterval(iv);
  }, []);

  const BLANK_EVENT_FORM: Partial<EventItem> = {
    title: '',
    category: 'Workshop',
    status: 'Upcoming',
    date: '',
    time: '',
    venue: '',
    description: '',
    price: 0,
    totalSeats: 100,
    image: '',
    participationType: 'both',
    minTeamSize: undefined,
    maxTeamSize: undefined,
    requiredTeamSize: undefined,
    paymentQr: '',
    upiId: '',
    payeeName: '',
    paymentInstructions: '',
  };

  // Events Management State
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<EventItem>>(BLANK_EVENT_FORM);

  const [announcementText, setAnnouncementText] = useState(currentAnnouncement);
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFx.playClick();
      const r = new FileReader();
      r.onloadend = () => setNewEvent({ ...newEvent, image: r.result as string });
      r.readAsDataURL(file);
    }
  };

  const handleEditEventInit = (event: EventItem) => {
    soundFx.playClick();
    setEditingEventId(event.id);
    setNewEvent({
      title: event.title,
      category: event.category,
      status: event.status,
      date: event.date,
      time: event.time || '10:00 AM IST',
      venue: event.venue,
      description: event.description,
      price: event.price || 0,
      image: event.image || '/event_images/tarang.webp',
      participationType: event.participationType || 'both',
      minTeamSize: event.minTeamSize || 2,
      maxTeamSize: event.maxTeamSize || 5,
      requiredTeamSize: event.requiredTeamSize,
      paymentQr: event.paymentQr || '',
      upiId: event.upiId || '',
      payeeName: event.payeeName || '',
      paymentInstructions: event.paymentInstructions || '',
    });
    setShowEventForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccess();
    if (!newEvent.title) return;

    if (editingEventId) {
      const updatedEvents = eventsList.map((evt) =>
        evt.id === editingEventId
          ? {
              ...evt,
              title: newEvent.title || 'Untitled',
              category: (newEvent.category as any) || 'Workshop',
              status: (newEvent.status as any) || 'Upcoming',
              date: newEvent.date || 'TBD',
              time: newEvent.time || '10:00 AM IST',
              venue: newEvent.venue || 'PIET Campus',
              description: newEvent.description || '',
              price: Number(newEvent.price) || 0,
              image: newEvent.image || '/event_images/tarang.webp',
              badge: (newEvent.category || 'EVENT').toUpperCase(),
              participationType: newEvent.participationType || 'both',
              minTeamSize: Number(newEvent.minTeamSize) || 2,
              maxTeamSize: Number(newEvent.maxTeamSize) || 5,
              requiredTeamSize: newEvent.requiredTeamSize ? Number(newEvent.requiredTeamSize) : undefined,
              paymentQr: newEvent.paymentQr || undefined,
              upiId: newEvent.upiId || undefined,
              payeeName: newEvent.payeeName || undefined,
              paymentInstructions: newEvent.paymentInstructions || undefined,
            }
          : evt
      );
      onUpdateEvents(updatedEvents);
      const updatedItem = updatedEvents.find((x) => x.id === editingEventId);
      if (updatedItem) await api.createEvent(updatedItem);
      setEditingEventId(null);
    } else {
      const eventToAdd: EventItem = {
        id: `evt-${Date.now()}`,
        title: newEvent.title || 'Untitled',
        category: (newEvent.category as any) || 'Workshop',
        status: (newEvent.status as any) || 'Upcoming',
        date: newEvent.date || 'TBD',
        time: newEvent.time || '10:00 AM IST',
        venue: newEvent.venue || 'Auditorium',
        description: newEvent.description || '',
        price: Number(newEvent.price) || 0,
        image: newEvent.image || '/event_images/tarang.webp',
        badge: (newEvent.category || 'EVENT').toUpperCase(),
        participationType: newEvent.participationType || 'both',
        minTeamSize: Number(newEvent.minTeamSize) || 2,
        maxTeamSize: Number(newEvent.maxTeamSize) || 5,
        requiredTeamSize: newEvent.requiredTeamSize ? Number(newEvent.requiredTeamSize) : undefined,
        paymentQr: newEvent.paymentQr || undefined,
        upiId: newEvent.upiId || undefined,
        payeeName: newEvent.payeeName || undefined,
        paymentInstructions: newEvent.paymentInstructions || undefined,
      };
      onAddEvent(eventToAdd);
      await api.createEvent(eventToAdd);
    }
    setShowEventForm(false);
    setNewEvent(BLANK_EVENT_FORM);
  };

  const handleDeleteEvent = async (id: string) => {
    soundFx.playLaser();
    const updated = eventsList.filter((e) => e.id !== id);
    onUpdateEvents(updated);
    await api.deleteEvent(id);
  };

  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccess();
    onUpdateAnnouncement(announcementText);
    setAnnouncementSaved(true);
    setTimeout(() => setAnnouncementSaved(false), 3000);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminData.name || !newAdminData.email || !newAdminData.password) return;
    soundFx.playSuccess();
    await api.createAdmin(newAdminData);
    setNewAdminData({ name: '', email: '', password: '', role: 'Event Organizer' });
    setShowAdminForm(false);
    await refreshAdmins();
  };

  const handleDeleteAdmin = async (id: string) => {
    soundFx.playLaser();
    await api.deleteAdmin(id);
    await refreshAdmins();
  };

  const handleEditCouponInit = (c: Coupon) => {
    soundFx.playClick();
    setEditingCouponCode(c.code);
    setCouponFormData({ ...c });
    setShowCouponForm(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccess();
    const clean = couponFormData.code.trim().toUpperCase();
    if (!clean) return;
    let updated: Coupon[];
    if (editingCouponCode) {
      const cleanEdit = editingCouponCode.trim().toUpperCase();
      updated = couponsList.map((c) =>
        (c.code || '').trim().toUpperCase() === cleanEdit
          ? {
              ...couponFormData,
              code: clean,
              discountValue: Number(couponFormData.discountValue) || 0,
              usageLimit: couponFormData.usageLimit ? Number(couponFormData.usageLimit) : undefined,
              usedCount: c.usedCount || 0,
              validUntil: couponFormData.validUntil || undefined,
              validFrom: couponFormData.validFrom || undefined,
            }
          : c
      );
    } else {
      const nc: Coupon = {
        ...couponFormData,
        code: clean,
        discountValue: Number(couponFormData.discountValue) || 0,
        active: couponFormData.active !== false,
        usageLimit: couponFormData.usageLimit ? Number(couponFormData.usageLimit) : undefined,
        usedCount: 0,
        validUntil: couponFormData.validUntil || undefined,
        validFrom: couponFormData.validFrom || undefined,
      };
      updated = [nc, ...couponsList.filter((c) => (c.code || '').trim().toUpperCase() !== clean)];
    }
    setCouponsList(updated);
    await api.updateCoupons(updated);
    setShowCouponForm(false);
    setEditingCouponCode(null);
    setCouponFormData({ code: '', discountType: 'percentage', discountValue: 20, description: '', active: true, usedCount: 0, validUntil: '', validFrom: '' });
    setCouponSavedMsg(true);
    setTimeout(() => setCouponSavedMsg(false), 3000);
  };

  const handleDeleteCoupon = async (code: string) => {
    soundFx.playLaser();
    const clean = (code || '').trim().toUpperCase();
    const updated = couponsList.filter((c) => (c.code || '').trim().toUpperCase() !== clean);
    setCouponsList(updated);
    await api.deleteCoupon(clean);
    setCouponSavedMsg(true);
    setTimeout(() => setCouponSavedMsg(false), 3000);
  };

  const handleToggleCouponActive = async (code: string) => {
    soundFx.playClick();
    const clean = (code || '').trim().toUpperCase();
    const updated = couponsList.map((c) =>
      (c.code || '').trim().toUpperCase() === clean ? { ...c, active: !(c.active !== false) } : c
    );
    setCouponsList(updated);
    await api.updateCoupons(updated);
  };

  const handleCopyCoupon = (code: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Toggle Check-in status
  const handleToggleCheckIn = async (passId: string) => {
    soundFx.playSuccess();
    const pass = passes.find((p) => p.passId === passId);
    if (pass?.status === 'CHECKED_IN') {
      passService.updatePassStatus(passId, 'CONFIRMED');
    } else {
      await passService.verifyAndCheckInPass(passId, currentUser?.email || 'Admin Command');
    }
    refreshLivePasses();
  };

  // Delete Pass Handler
  const handleDeletePass = async (passId: string) => {
    try {
      soundFx.playLaser();
      await passService.deletePass(passId);
      setPasses((prev) => prev.filter((p) => p.passId !== passId));
      setDeletingPassId(null);
      setDeleteSuccessMsg(`Pass ${passId} removed successfully.`);
      setTimeout(() => setDeleteSuccessMsg(null), 3000);
    } catch (err: any) {
      setPasses((prev) => prev.filter((p) => p.passId !== passId));
      setDeletingPassId(null);
      setDeleteSuccessMsg(`Pass ${passId} deleted.`);
      setTimeout(() => setDeleteSuccessMsg(null), 3000);
    }
  };



  // Filtered passes calculation
  const eventPasses = passes.filter((p) =>
    selectedEventFilter === 'ALL'
      ? true
      : p.eventId === selectedEventFilter || p.eventTitle.toLowerCase().trim() === selectedEventFilter.toLowerCase().trim()
  );

  const filteredPasses = eventPasses.filter(
    (p) =>
      p.userName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (p.collegeName && p.collegeName.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (p.teamName && p.teamName.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (p.rollNumber && p.rollNumber.toLowerCase().includes(searchFilter.toLowerCase())) ||
      p.passId.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.eventTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.userEmail.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (p.transactionId && p.transactionId.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const currentEventRevenue = eventPasses.reduce((a, p) => a + (p.amount || 0), 0);
  const currentEventCheckedIn = eventPasses.filter((p) => p.status === 'CHECKED_IN').length;
  const totalRevenue = passes.reduce((a, p) => a + (p.amount || 0), 0);
  const totalCheckedIn = passes.filter((p) => p.status === 'CHECKED_IN').length;

  const handleExportCSV = () => {
    soundFx.playClick();
    if (!filteredPasses.length) return;
    const eventName =
      selectedEventFilter === 'ALL'
        ? 'All_Events'
        : (eventsList.find((e) => e.id === selectedEventFilter)?.title || selectedEventFilter).replace(/[^a-zA-Z0-9]/g, '_');
    const headers = [
      'Pass ID', 'Name', 'Email', 'College', 'Department', 'Year', 'Phone',
      'Event', 'Reg Type', 'Team Name', 'Team Members', 'Payment ID', 'Transaction Ref',
      'Original Amount', 'Discount', 'Coupon', 'Final Fee', 'Payment Status', 'Entry Status', 'CheckIn Time'
    ];
    const rows = filteredPasses.map((p) => [
      p.passId,
      `"${p.userName}"`,
      p.userEmail,
      `"${p.collegeName || 'PIET'}"`,
      `"${p.department}"`,
      p.year,
      p.phone,
      `"${p.eventTitle}"`,
      p.registrationType || 'individual',
      `"${p.teamName || 'N/A'}"`,
      `"${p.teamMembers ? p.teamMembers.map((m) => `${m.name} (${m.email})`).join('; ') : ''}"`,
      p.paymentId,
      `"${p.transactionId || 'N/A'}"`,
      p.originalAmount || p.amount,
      p.discountAmount || 0,
      p.couponCode || 'None',
      p.amount,
      p.paymentStatus || 'PAID',
      p.status,
      `"${p.checkedInAt || 'Pending'}"`,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const uri = encodeURI(csv);
    const a = document.createElement('a');
    a.href = uri;
    a.download = `ECE_Forum_${eventName}_Pass_Roster_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportExcel = () => {
    soundFx.playClick();
    if (!filteredPasses.length) return;
    const eventName =
      selectedEventFilter === 'ALL'
        ? 'All_Events'
        : (eventsList.find((e) => e.id === selectedEventFilter)?.title || selectedEventFilter).replace(/[^a-zA-Z0-9]/g, '_');
    const excel = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#040711" ss:Pattern="Solid"/></Style><Style ss:ID="Data"><Alignment ss:Vertical="Center"/></Style><Style ss:ID="Currency"><NumberFormat ss:Format="₹#,##0"/></Style><Style ss:ID="CheckedIn"><Font ss:Color="#006600" ss:Bold="1"/><Interior ss:Color="#E6F4EA" ss:Pattern="Solid"/></Style></Styles><Worksheet ss:Name="Attendees"><Table><Row ss:StyleID="Header"><Cell><Data ss:Type="String">Pass ID</Data></Cell><Cell><Data ss:Type="String">Attendee Name</Data></Cell><Cell><Data ss:Type="String">Email</Data></Cell><Cell><Data ss:Type="String">Phone</Data></Cell><Cell><Data ss:Type="String">College</Data></Cell><Cell><Data ss:Type="String">Department</Data></Cell><Cell><Data ss:Type="String">Year</Data></Cell><Cell><Data ss:Type="String">Reg Type</Data></Cell><Cell><Data ss:Type="String">Team Name</Data></Cell><Cell><Data ss:Type="String">Event Title</Data></Cell><Cell><Data ss:Type="String">Payment ID</Data></Cell><Cell><Data ss:Type="String">Transaction Ref</Data></Cell><Cell><Data ss:Type="String">Fee Paid</Data></Cell><Cell><Data ss:Type="String">Entry Status</Data></Cell><Cell><Data ss:Type="String">Check-In Time</Data></Cell></Row>${filteredPasses
      .map(
        (p) =>
          `<Row ss:StyleID="Data"><Cell><Data ss:Type="String">${p.passId}</Data></Cell><Cell><Data ss:Type="String">${(p.userName || '').replace(/&/g, '&amp;')}</Data></Cell><Cell><Data ss:Type="String">${p.userEmail || ''}</Data></Cell><Cell><Data ss:Type="String">${p.phone || ''}</Data></Cell><Cell><Data ss:Type="String">${(p.collegeName || 'PIET').replace(/&/g, '&amp;')}</Data></Cell><Cell><Data ss:Type="String">${(p.department || '').replace(/&/g, '&amp;')}</Data></Cell><Cell><Data ss:Type="String">${p.year || ''}</Data></Cell><Cell><Data ss:Type="String">${p.registrationType === 'team' ? 'Team' : 'Individual'}</Data></Cell><Cell><Data ss:Type="String">${(p.teamName || 'N/A').replace(/&/g, '&amp;')}</Data></Cell><Cell><Data ss:Type="String">${(p.eventTitle || '').replace(/&/g, '&amp;')}</Data></Cell><Cell><Data ss:Type="String">${p.paymentId || ''}</Data></Cell><Cell><Data ss:Type="String">${p.transactionId || 'N/A'}</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${p.amount || 0}</Data></Cell><Cell ss:StyleID="${p.status === 'CHECKED_IN' ? 'CheckedIn' : 'Data'}"><Data ss:Type="String">${p.status === 'CHECKED_IN' ? 'Checked In' : 'Confirmed'}</Data></Cell><Cell><Data ss:Type="String">${p.checkedInAt || 'Pending'}</Data></Cell></Row>`
      )
      .join('')}</Table></Worksheet></Workbook>`;
    const blob = new Blob([excel], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ECE_Forum_${eventName}_Roster_${Date.now()}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#08080A] text-white flex items-center justify-center p-4 relative overflow-hidden selection:bg-[#FF4A15]/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,74,21,0.08),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(245,243,239,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,243,239,0.02)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none opacity-40" />
        <motion.div initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-[440px] rounded-[32px] bg-[#0F0F12] border border-white/10 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4A15] to-transparent opacity-80" />
          <div className="mt-2">
            <AdminLogin onLoginSuccess={(u) => setCurrentUser(u)} />
          </div>
          <Link to="/" className="mt-6 flex items-center justify-center gap-2 text-xs font-mono text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-3 h-3" /> Return to Website
          </Link>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity, count: null },
    { id: 'events', label: 'Events', icon: Calendar, count: eventsList.length },
    { id: 'registrations', label: 'Pass Roster', icon: Users, count: passes.length },
    { id: 'coupons', label: 'Coupons', icon: Tag, count: couponsList.length },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon, count: galleryDraft.length },
    { id: 'siteContent', label: 'Hero & Flagship', icon: Sliders, count: null },
    { id: 'announcements', label: 'Broadcast', icon: Bell, count: null },
    { id: 'admins', label: 'Admins', icon: Shield, count: adminsList.length },
  ] as const;

  return (
    <div className="min-h-screen bg-[#08080A] text-[#F5F3EF] relative selection:bg-[#FF4A15]/30 selection:text-white font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,74,21,0.05),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(245,243,239,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(245,243,239,0.02)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none opacity-30" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#08080A]/85 backdrop-blur-2xl border-b border-white/[0.08]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-mono text-white/80">
              <ArrowLeft className="w-3.5 h-3.5 text-[#FF4A15]" /> Website
            </Link>
            <div className="hidden sm:flex items-center gap-3 border-l border-white/10 pl-4">
              <div className="w-8 h-8 rounded-xl bg-[#FF4A15] text-white grid place-items-center font-black text-xs shadow-[0_0_15px_rgba(255,74,21,0.4)]">◈</div>
              <div>
                <div className="font-[Syne] font-[800] text-sm leading-none tracking-tight">COMMAND STUDIO</div>
                <div className="text-[10px] font-mono text-white/40 tracking-[0.14em]">PIET ECE &bull; SPACE &times; SINC</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101014] border border-white/[0.08] text-xs font-mono text-white/60">
              <span className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse" /> {passes.length} passes &bull; ₹{totalRevenue.toLocaleString()} revenue
            </div>
            <div className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full bg-[#101014] border border-white/[0.08]">
              <div className="w-7 h-7 rounded-full bg-[#FF4A15] text-white grid place-items-center font-black text-xs">
                {currentUser.email[0].toUpperCase()}
              </div>
              <span className="text-xs font-bold pr-1 hidden lg:inline max-w-[130px] truncate">{currentUser.email}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF4A15]/20 text-[#FF4A15] border border-[#FF4A15]/30 font-bold uppercase hidden lg:inline">
                {currentUser.role}
              </span>
            </div>
            <button
              onClick={() => setCurrentUser(null)}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 grid place-items-center hover:bg-[#FF4A15] hover:text-white transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid lg:grid-cols-[250px_1fr] gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:sticky lg:top-[88px] h-fit">
            <div className="rounded-[24px] bg-[#0F0F12] border border-white/[0.08] p-3 hidden lg:block shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
              <div className="px-3 py-3 border-b border-white/[0.06] mb-2">
                <div className="text-[10px] font-mono tracking-[0.2em] text-[#FF4A15] font-bold">ECE COUNCIL HQ</div>
                <div className="text-xs font-mono text-white/50">Admin Systems &amp; Controls</div>
              </div>
              <nav className="space-y-1.5">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        soundFx.playClick();
                        setActiveTab(t.id as any);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-mono font-bold transition-all ${
                        active
                          ? 'bg-[#FF4A15] text-white shadow-[0_0_20px_rgba(255,74,21,0.35)]'
                          : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-white/40'}`} />
                      <span className="flex-1 text-left">{t.label}</span>
                      {t.count !== null && (
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${active ? 'bg-black/40 text-white' : 'bg-white/10 text-white/60'}`}>
                          {t.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
              <div className="mt-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <div className="text-[11px] font-bold text-[#FF4A15] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Department HQ
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed font-mono">
                  Live cloud synchronizer &amp; roster dispatch engine.
                </p>
              </div>
            </div>

            {/* Mobile Horizontal Pills */}
            <div className="flex lg:hidden gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-mono font-bold whitespace-nowrap border ${
                      active ? 'bg-[#FF4A15] text-white border-[#FF4A15]' : 'bg-[#101014] border-white/10 text-white/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Content Pane */}
          <main className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[28px] bg-[#0F0F12] border border-white/[0.08] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
              >
                {/* Pane Header */}
                <div className="p-6 sm:p-7 border-b border-white/[0.08]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-[Syne] font-[800] text-xl sm:text-2xl flex items-center gap-2 text-[#F5F3EF]">
                        {activeTab === 'overview' && <><Activity className="w-5 h-5 text-[#FF4A15]" /> Overview &amp; Analytics</>}
                        {activeTab === 'events' && <><Calendar className="w-5 h-5 text-[#FF4A15]" /> Event Suite &mdash; {eventsList.length}</>}
                        {activeTab === 'registrations' && <><Users className="w-5 h-5 text-[#FF4A15]" /> Pass Roster &mdash; {filteredPasses.length}/{passes.length}</>}
                        {activeTab === 'coupons' && <><Tag className="w-5 h-5 text-[#FFD60A]" /> Coupons &mdash; {couponsList.length}</>}
                        {activeTab === 'gallery' && <><ImageIcon className="w-5 h-5 text-[#FF4A15]" /> Photo Archive &mdash; {galleryDraft.length}</>}
                        {activeTab === 'siteContent' && <><Sliders className="w-5 h-5 text-[#FF4A15]" /> Hero Eyebrow &amp; Flagship Dossier</>}
                        {activeTab === 'announcements' && <><Bell className="w-5 h-5 text-[#FF4A15]" /> Live Broadcast Ticker</>}
                        {activeTab === 'admins' && <><Shield className="w-5 h-5 text-[#FF4A15]" /> Organizer Council &mdash; {adminsList.length}</>}
                      </h2>
                      <p className="text-xs font-mono text-white/40 mt-1">
                        {activeTab === 'overview' && `${totalCheckedIn}/${passes.length} checked in &bull; ₹${totalRevenue.toLocaleString()} verified revenue`}
                        {activeTab === 'events' && `Manage catalog, pricing, individual/team modes & mandatory team sizes`}
                        {activeTab === 'registrations' && `Verify attendees, inspect payment proof screenshots, delete passes & export`}
                        {activeTab === 'coupons' && `Percentage / flat discount codes & usage telemetry`}
                        {activeTab === 'gallery' && `Curated showcase of departmental expos, labs & hackathons`}
                        {activeTab === 'siteContent' && `Target date sync, countdown telemetry & flagship card parameters`}
                        {activeTab === 'announcements' && `Synchronized headline ticker stream broadcasted to attendees`}
                        {activeTab === 'admins' && `Manage authorized organizer studio accounts with Supabase RLS`}
                      </p>
                    </div>
                    {activeTab === 'events' && (
                      <button
                        onClick={() => setShowEventForm(!showEventForm)}
                        className="px-4 py-2.5 rounded-full bg-[#FF4A15] text-white font-mono font-bold text-xs flex items-center gap-2 hover:bg-white hover:text-black transition-colors shadow-[0_0_20px_rgba(255,74,21,0.3)]"
                      >
                        <Plus className="w-4 h-4" />
                        {showEventForm ? 'Close Editor' : 'New Event'}
                      </button>
                    )}
                    {activeTab === 'coupons' && (
                      <button
                        onClick={() => {
                          setEditingCouponCode(null);
                          setCouponFormData({ code: '', discountType: 'percentage', discountValue: 20, description: '', active: true, usedCount: 0, validUntil: '', validFrom: '' });
                          setShowCouponForm(!showCouponForm);
                        }}
                        className="px-4 py-2.5 rounded-full bg-[#FFD60A] text-black font-mono font-bold text-xs flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {showCouponForm ? 'Close Editor' : 'New Coupon'}
                      </button>
                    )}
                    {activeTab === 'gallery' && (
                      <button
                        onClick={() => setIsAddingGallery(!isAddingGallery)}
                        className="px-4 py-2.5 rounded-full bg-white text-black font-mono font-bold text-xs flex items-center gap-2 hover:bg-[#FF4A15] hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        {isAddingGallery ? 'Close' : 'Add Photo'}
                      </button>
                    )}
                    {activeTab === 'admins' && (
                      <button
                        onClick={() => setShowAdminForm(!showAdminForm)}
                        className="px-4 py-2.5 rounded-full bg-white text-black font-mono font-bold text-xs flex items-center gap-2 hover:bg-[#FF4A15] hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        {showAdminForm ? 'Close' : 'New Admin'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6 sm:p-7">
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { label: 'Total Passes Issued', value: passes.length, sub: `${totalCheckedIn} check-ins completed`, icon: Users, color: '#FF4A15' },
                          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, sub: `${passes.filter(p => p.amount > 0).length} paid enrollments`, icon: TrendingUp, color: '#00E5CC' },
                          { label: 'Events Catalogue', value: eventsList.length, sub: `${eventsList.filter((e) => e.status === 'Upcoming').length} upcoming sessions`, icon: Calendar, color: '#FFD60A' },
                          { label: 'Council Admins', value: adminsList.length, sub: 'Authorized organizers', icon: Shield, color: '#A855F7' },
                        ].map((s) => {
                          const Icon = s.icon;
                          return (
                            <div key={s.label} className="rounded-[20px] bg-[#121216] border border-white/[0.08] p-5">
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">{s.label}</span>
                                <span className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 grid place-items-center">
                                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                                </span>
                              </div>
                              <div className="font-[Syne] font-[800] text-2xl mt-3 text-white">{s.value}</div>
                              <div className="text-xs text-white/40 mt-1 font-mono">{s.sub}</div>
                            </div>
                          );
                        })}
                        <div className="sm:col-span-2 lg:col-span-4 rounded-[20px] bg-[#121216] border border-white/[0.08] p-5 space-y-3">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="tracking-widest text-white/40 uppercase">GATE CHECK-IN TELEMETRY</span>
                            <span className="text-[#FF4A15] font-bold">
                              {totalCheckedIn}/{passes.length} ({passes.length ? Math.round((totalCheckedIn / passes.length) * 100) : 0}%)
                            </span>
                          </div>
                          <div className="h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                            <div
                              className="h-full bg-gradient-to-r from-[#FF4A15] to-[#FFD60A] rounded-full transition-all duration-500"
                              style={{ width: `${passes.length ? Math.round((totalCheckedIn / passes.length) * 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EVENTS TAB */}
                  {activeTab === 'events' && (
                    <div className="space-y-6">
                      {showEventForm && (
                        <form onSubmit={handleFormSubmit} autoComplete="off" className="p-6 bg-[#121216] rounded-[24px] border border-[#FF4A15]/30 space-y-4 shadow-[0_0_40px_rgba(255,74,21,0.08)]">
                          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                            <h3 className="font-[Syne] font-[800] text-base text-white flex items-center gap-2">
                              <Edit3 className="w-4 h-4 text-[#FF4A15]" />
                              {editingEventId ? 'Edit Event Parameters' : 'Create New Event'}
                            </h3>
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Dossier Configurator</span>
                          </div>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
                            <label className="space-y-1 sm:col-span-2">
                              <span className="text-white/60">Event Title *</span>
                              <input
                                required
                                autoComplete="off"
                                spellCheck={false}
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                placeholder="Event Title (e.g. Autonomous Robotics)"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white focus:border-[#FF4A15]/60 outline-none"
                              />
                            </label>
                            <label className="space-y-1">
                              <span className="text-white/60">Category</span>
                              <select
                                value={newEvent.category}
                                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as any })}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white focus:border-[#FF4A15]/60 outline-none"
                              >
                                <option>Workshop</option>
                                <option>Installation</option>
                                <option>Competition</option>
                                <option>Seminar</option>
                                <option>Cultural</option>
                              </select>
                            </label>
                            <label className="space-y-1">
                              <span className="text-white/60">Status</span>
                              <select
                                value={newEvent.status}
                                onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value as any })}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white focus:border-[#FF4A15]/60 outline-none"
                              >
                                <option>Upcoming</option>
                                <option>Ongoing</option>
                                <option>Past</option>
                              </select>
                            </label>
                            <label className="space-y-1">
                              <span className="text-white/60">Registration Mode</span>
                              <select
                                value={newEvent.participationType}
                                onChange={(e) => setNewEvent({ ...newEvent, participationType: e.target.value as any })}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white focus:border-[#FF4A15]/60 outline-none"
                              >
                                <option value="both">Both Individual &amp; Team</option>
                                <option value="individual_only">Individual Only</option>
                                <option value="team_only">Team Only</option>
                              </select>
                            </label>
                            <label className="space-y-1">
                              <span className="text-white/60">Entry Fee ₹ (0 for Free)</span>
                              <input
                                type="number"
                                autoComplete="off"
                                value={newEvent.price ?? ''}
                                onChange={(e) => setNewEvent({ ...newEvent, price: Number(e.target.value) || 0 })}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white"
                              />
                            </label>

                            {/* Team Size Configuration */}
                            {newEvent.participationType !== 'individual_only' && (
                              <div className="sm:col-span-2 lg:col-span-3 p-4 rounded-xl bg-black/40 border border-[#FF4A15]/20 space-y-3">
                                <div className="text-[11px] font-bold text-[#FF4A15] flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5" /> Team Size &amp; Mandatory Participant Rules
                                </div>
                                <div className="grid sm:grid-cols-3 gap-3">
                                  <label className="space-y-1">
                                    <span className="text-white/60">Mandatory Team Size</span>
                                    <input
                                      type="number"
                                      min={1}
                                      max={10}
                                      autoComplete="off"
                                      value={newEvent.requiredTeamSize || ''}
                                      onChange={(e) =>
                                        setNewEvent({
                                          ...newEvent,
                                          requiredTeamSize: e.target.value ? Number(e.target.value) : undefined,
                                        })
                                      }
                                      placeholder="e.g. 5 (Strict Exact Size)"
                                      className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white focus:border-[#FF4A15]/60 outline-none"
                                    />
                                    <span className="text-[10px] text-white/40 block">If set, applicant must enter exact {newEvent.requiredTeamSize || 'N'} members</span>
                                  </label>
                                  <label className="space-y-1">
                                    <span className="text-white/60">Min Team Size</span>
                                    <input
                                      type="number"
                                      min={1}
                                      max={10}
                                      autoComplete="off"
                                      value={newEvent.minTeamSize || ''}
                                      onChange={(e) => setNewEvent({ ...newEvent, minTeamSize: Number(e.target.value) || 2 })}
                                      placeholder="2"
                                      className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white"
                                    />
                                  </label>
                                  <label className="space-y-1">
                                    <span className="text-white/60">Max Team Size</span>
                                    <input
                                      type="number"
                                      min={1}
                                      max={10}
                                      autoComplete="off"
                                      value={newEvent.maxTeamSize || ''}
                                      onChange={(e) => setNewEvent({ ...newEvent, maxTeamSize: Number(e.target.value) || 5 })}
                                      placeholder="5"
                                      className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white"
                                    />
                                  </label>
                                </div>
                              </div>
                            )}

                            <label className="space-y-1">
                              <span className="text-white/60">Event Date</span>
                              <input
                                autoComplete="off"
                                spellCheck={false}
                                value={newEvent.date}
                                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                placeholder="e.g. Aug 25, 2026"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white"
                              />
                            </label>
                            <label className="space-y-1">
                              <span className="text-white/60">Event Time</span>
                              <input
                                autoComplete="off"
                                spellCheck={false}
                                value={newEvent.time}
                                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                placeholder="e.g. 10:00 AM IST"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white"
                              />
                            </label>
                            <label className="space-y-1">
                              <span className="text-white/60">Venue</span>
                              <input
                                autoComplete="off"
                                spellCheck={false}
                                value={newEvent.venue}
                                onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                                placeholder="Auditorium / Lab 3"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white"
                              />
                            </label>
                            <label className="space-y-1 sm:col-span-2 lg:col-span-3">
                              <span className="text-white/60">Description</span>
                              <textarea
                                autoComplete="off"
                                spellCheck={false}
                                value={newEvent.description}
                                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                rows={2}
                                placeholder="Detailed overview of syllabus, requirements, prizes and timings"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white"
                              />
                            </label>
                            <label className="space-y-1 sm:col-span-2 lg:col-span-3">
                              <span className="text-white/60">Banner Image URL or Upload</span>
                              <div className="flex gap-2">
                                <input
                                  autoComplete="off"
                                  spellCheck={false}
                                  value={newEvent.image}
                                  onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })}
                                  placeholder="/event_images/tarang.webp or https://..."
                                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors"
                                >
                                  <Upload className="w-4 h-4" />
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {PRESET_BANNERS.map((p) => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setNewEvent({ ...newEvent, image: p.url })}
                                    className={`px-2.5 py-1 rounded-full text-[11px] border ${
                                      newEvent.image === p.url
                                        ? 'bg-[#FF4A15] text-white border-[#FF4A15]'
                                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                                    }`}
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>
                            </label>

                            {/* Event-Specific Organizer Payment QR & UPI Details (Optional) */}
                            <div className="sm:col-span-2 lg:col-span-3 p-4 rounded-2xl bg-black/50 border border-[#00E5CC]/30 space-y-3 font-mono">
                              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                                <span className="text-[11px] font-bold text-[#00E5CC] flex items-center gap-1.5 uppercase">
                                  <QrCode className="w-3.5 h-3.5 text-[#00E5CC]" />
                                  <span>Organizer Payment QR &amp; UPI (Optional Event Override)</span>
                                </span>
                                <span className="text-[10px] text-white/40">Overrides Site Default QR</span>
                              </div>

                              <p className="text-[11px] text-white/60 font-sans leading-relaxed">
                                If this event has a specific coordinator receiving payments, upload their QR code and enter their UPI ID below. If left blank, the website's default Council QR code will be used.
                              </p>

                              <div className="grid sm:grid-cols-12 gap-3 items-center">
                                {/* QR Upload & Preview */}
                                <div className="sm:col-span-4 flex items-center gap-3 p-2.5 rounded-xl bg-black border border-white/10">
                                  {newEvent.paymentQr ? (
                                    <img
                                      src={newEvent.paymentQr}
                                      alt="Organizer QR"
                                      className="w-14 h-14 object-contain rounded-lg bg-white p-0.5 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 grid place-items-center text-white/30 shrink-0">
                                      <QrCode className="w-6 h-6" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1 space-y-1">
                                    <label className="px-2.5 py-1 rounded-lg bg-[#00E5CC]/15 border border-[#00E5CC]/30 text-[#00E5CC] text-[10px] font-mono font-bold hover:bg-[#00E5CC] hover:text-black transition-colors cursor-pointer inline-flex items-center gap-1">
                                      <Upload className="w-3 h-3" /> Upload QR
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          const r = new FileReader();
                                          r.onload = () => {
                                            if (typeof r.result === 'string') {
                                              setNewEvent((prev) => ({ ...prev, paymentQr: r.result as string }));
                                            }
                                          };
                                          r.readAsDataURL(file);
                                        }}
                                      />
                                    </label>
                                    {newEvent.paymentQr && (
                                      <button
                                        type="button"
                                        onClick={() => setNewEvent((prev) => ({ ...prev, paymentQr: '' }))}
                                        className="block text-[9px] text-red-400 hover:underline"
                                      >
                                        Remove QR
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* UPI ID */}
                                <div className="sm:col-span-4 space-y-1">
                                  <span className="text-white/60 text-[10px] block">Organizer UPI ID / VPA</span>
                                  <input
                                    autoComplete="off"
                                    spellCheck={false}
                                    value={newEvent.upiId || ''}
                                    onChange={(e) => setNewEvent({ ...newEvent, upiId: e.target.value })}
                                    placeholder="organizer@upi"
                                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white font-mono text-xs focus:border-[#00E5CC]/60 outline-none"
                                  />
                                </div>

                                {/* Payee Name */}
                                <div className="sm:col-span-4 space-y-1">
                                  <span className="text-white/60 text-[10px] block">Payee Display Name</span>
                                  <input
                                    autoComplete="off"
                                    spellCheck={false}
                                    value={newEvent.payeeName || ''}
                                    onChange={(e) => setNewEvent({ ...newEvent, payeeName: e.target.value })}
                                    placeholder="e.g. TARANG Organizing Lead"
                                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white font-mono text-xs focus:border-[#00E5CC]/60 outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.06]">
                            <button
                              type="button"
                              onClick={() => {
                                setShowEventForm(false);
                                setEditingEventId(null);
                              }}
                              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-mono"
                            >
                              Cancel
                            </button>
                            <button type="submit" className="px-6 py-2.5 rounded-full bg-[#FF4A15] text-white font-mono font-bold text-xs">
                              {editingEventId ? 'Save Updates' : 'Publish Event'}
                            </button>
                          </div>
                        </form>
                      )}

                      <div className="grid gap-3">
                        {eventsList.map((evt) => (
                          <div
                            key={evt.id}
                            className="p-4 rounded-[20px] bg-[#121216] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition-all"
                          >
                            <div className="flex gap-3 min-w-0">
                              <img
                                src={evt.image || '/event_images/tarang.webp'}
                                alt={evt.title}
                                className="w-20 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                              />
                              <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF4A15]/15 text-[#FF4A15] border border-[#FF4A15]/30 font-bold font-mono">
                                    {evt.category}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 font-mono">
                                    {evt.date} &bull; {evt.venue}
                                  </span>
                                  {evt.requiredTeamSize && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00E5CC]/15 text-[#00E5CC] border border-[#00E5CC]/30 font-mono font-bold">
                                      {evt.requiredTeamSize} Members Mandatory
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-[Syne] font-[700] text-sm text-white truncate pr-2">{evt.title}</h4>
                                <p className="text-xs text-white/50 font-mono">
                                  {evt.price === 0 ? 'Free Pass' : `₹${evt.price}`} &bull; Mode:{' '}
                                  {evt.participationType === 'team_only'
                                    ? 'Team Only'
                                    : evt.participationType === 'individual_only'
                                    ? 'Individual Only'
                                    : 'Both'}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 self-end sm:self-auto">
                              <button
                                onClick={() => handleEditEventInit(evt)}
                                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 grid place-items-center hover:bg-white hover:text-black transition-colors"
                                title="Edit Event"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(evt.id)}
                                className="w-9 h-9 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] grid place-items-center hover:bg-[#FF3B30] hover:text-white transition-colors"
                                title="Delete Event"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PASS ROSTER / REGISTRATIONS TAB */}
                  {activeTab === 'registrations' && (
                    <div className="space-y-4">
                      {deleteSuccessMsg && (
                        <div className="p-3 rounded-xl bg-[#FF4A15]/10 border border-[#FF4A15]/30 text-[#FF4A15] text-xs font-mono flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> {deleteSuccessMsg}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2.5">
                        <select
                          value={selectedEventFilter}
                          onChange={(e) => setSelectedEventFilter(e.target.value)}
                          className="px-3.5 py-2.5 rounded-full bg-black border border-white/10 text-xs font-mono text-white focus:border-[#FF4A15]/60 outline-none"
                        >
                          <option value="ALL">All Events ({passes.length})</option>
                          {eventsList.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.title} ({passes.filter((p) => p.eventId === e.id).length})
                            </option>
                          ))}
                        </select>
                        <div className="relative flex-1 min-w-[200px]">
                          <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            autoComplete="off"
                            spellCheck={false}
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            placeholder="Search name, email, college, pass ID, UTR ref..."
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-full bg-black border border-white/10 text-xs text-white placeholder:text-white/30 focus:border-[#FF4A15]/60 outline-none font-mono"
                          />
                        </div>
                        <button
                          onClick={handleExportCSV}
                          className="px-4 py-2.5 rounded-full bg-white text-black font-mono font-bold text-xs flex items-center gap-1.5 hover:bg-[#FF4A15] hover:text-white transition-colors"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
                        </button>
                        <button
                          onClick={handleExportExcel}
                          className="px-4 py-2.5 rounded-full bg-[#FF4A15] text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,74,21,0.3)]"
                        >
                          <FileDown className="w-3.5 h-3.5" /> XLS
                        </button>
                      </div>

                      <div className="rounded-[20px] bg-[#121216] border border-white/[0.08] overflow-hidden">
                        <div className="max-h-[460px] overflow-auto">
                          <table className="w-full text-xs font-mono">
                            <thead className="sticky top-0 bg-[#0A0A0C] border-b border-white/10 text-[10px] tracking-widest text-white/40 uppercase">
                              <tr>
                                <th className="text-left p-3.5">Attendee / Team</th>
                                <th className="text-left p-3.5">Event Info</th>
                                <th className="text-left p-3.5">Fee &amp; Payment Proof</th>
                                <th className="text-left p-3.5">Gate Status</th>
                                <th className="text-right p-3.5">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                                {filteredPasses.slice(0, 100).map((p) => (
                                  <tr key={p.passId} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                    <td className="p-3.5">
                                      <div className="font-bold text-white flex items-center gap-2">
                                        <span>{p.userName}</span>
                                        {p.registrationType === 'team' && (
                                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#00E5CC]/15 text-[#00E5CC] border border-[#00E5CC]/30 font-bold">
                                            TEAM: {p.teamName || 'Team Pass'} ({p.teamMembers ? p.teamMembers.length + 1 : 1}p)
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-white/40 text-[11px] mt-0.5">
                                        {p.userEmail} &bull; {p.phone || 'No phone'}
                                      </div>
                                      <div className="flex items-center gap-2.5 mt-1">
                                        <span className="text-[10px] text-[#FF4A15] font-bold">{p.passId}</span>
                                        <button
                                          onClick={() => {
                                            soundFx.playClick();
                                            setSelectedProofPass(p);
                                          }}
                                          className="text-[10px] text-[#00E5CC] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                                        >
                                          <Eye className="w-3 h-3" /> View Dossier &amp; Proof
                                        </button>
                                      </div>
                                    </td>
                                    <td className="p-3.5">
                                      <div className="truncate max-w-[200px] text-white font-medium">{p.eventTitle}</div>
                                      <div className="text-white/40 text-[10px] truncate max-w-[200px]">{p.collegeName || 'PIET, Nagpur'}</div>
                                      <div className="text-white/30 text-[10px]">{p.department} &bull; {p.year}</div>
                                    </td>
                                    <td className="p-3.5">
                                      <div className="font-bold text-[#F5F3EF]">
                                        {p.amount === 0 ? <span className="text-[#00FF88]">FREE PASS</span> : `₹${p.amount}`}
                                      </div>
                                      {p.paymentScreenshot ? (
                                        <div className="flex items-center gap-2 mt-1.5">
                                          <img
                                            src={p.paymentScreenshot}
                                            alt="Payment Proof"
                                            onClick={() => {
                                              soundFx.playClick();
                                              setSelectedProofPass(p);
                                            }}
                                            className="w-10 h-10 rounded-lg object-cover border border-white/20 hover:border-[#00E5CC] cursor-pointer shadow transition-all hover:scale-105 shrink-0 bg-black"
                                          />
                                          <button
                                            onClick={() => {
                                              soundFx.playClick();
                                              setSelectedProofPass(p);
                                            }}
                                            className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-[#00E5CC]/15 text-[#00E5CC] border border-[#00E5CC]/30 hover:bg-[#00E5CC] hover:text-black transition-colors cursor-pointer"
                                          >
                                            <Eye className="w-3 h-3" /> Screenshot
                                          </button>
                                        </div>
                                      ) : p.transactionId ? (
                                        <div className="text-[10px] text-[#FFD60A] font-bold mt-0.5 truncate max-w-[140px]">UTR: {p.transactionId}</div>
                                      ) : (
                                        <div className="text-[10px] text-white/30">Direct Gateway</div>
                                      )}
                                    </td>
                                    <td className="p-3.5">
                                      <span
                                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                          p.status === 'CHECKED_IN'
                                            ? 'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30'
                                            : 'bg-[#FFD60A]/15 text-[#FFD60A] border border-[#FFD60A]/20'
                                        }`}
                                      >
                                        {p.status === 'CHECKED_IN' ? 'CHECKED IN' : 'CONFIRMED'}
                                      </span>
                                      {p.checkedInAt && <div className="text-[9px] text-white/40 mt-1">{p.checkedInAt}</div>}
                                    </td>
                                    <td className="p-3.5 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          onClick={() => handleToggleCheckIn(p.passId)}
                                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                            p.status === 'CHECKED_IN'
                                              ? 'bg-white/10 text-white/60 hover:bg-white/20'
                                              : 'bg-[#00FF88] text-black hover:bg-white'
                                          }`}
                                        >
                                          {p.status === 'CHECKED_IN' ? 'Undo' : 'Check-In'}
                                        </button>
                                        <button
                                          onClick={() => setDeletingPassId(p.passId)}
                                          className="w-7 h-7 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] grid place-items-center hover:bg-[#FF3B30] hover:text-white transition-colors cursor-pointer"
                                          title="Delete Pass"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              {filteredPasses.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="p-8 text-center text-white/30 font-mono">
                                    No attendee passes found matching your filter criteria.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <div className="p-3.5 border-t border-white/[0.08] flex flex-wrap justify-between items-center text-xs font-mono text-white/40 gap-2 bg-[#0A0A0C]">
                          <span>
                            Showing {Math.min(100, filteredPasses.length)}/{filteredPasses.length} &bull; {eventPasses.length} for current filter &bull; ₹{currentEventRevenue.toLocaleString()} revenue &bull; {currentEventCheckedIn}/{eventPasses.length} checked in
                          </span>
                          <span>{filteredPasses.length > 100 && 'First 100 shown &bull; Export CSV for full roster'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COUPONS TAB */}
                  {activeTab === 'coupons' && (
                    <div className="space-y-4">
                      {couponSavedMsg && (
                        <div className="p-3 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] text-xs font-mono flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Coupons synchronized with cloud database.
                        </div>
                      )}
                      {showCouponForm && (
                        <form onSubmit={handleSaveCoupon} autoComplete="off" className="p-5 rounded-[20px] bg-[#121216] border border-[#FFD60A]/30 space-y-3">
                          <div className="grid sm:grid-cols-3 gap-3 text-xs font-mono">
                            <label className="space-y-1">
                              <span className="text-white/60">Code *</span>
                              <input
                                required
                                autoComplete="off"
                                spellCheck={false}
                                value={couponFormData.code}
                                onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                                placeholder="TARANGGOLD"
                                className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/10 text-white uppercase outline-none focus:border-[#FFD60A]/60"
                              />
                            </label>
                            <label className="space-y-1">
                              <span className="text-white/60">Discount Type</span>
                              <select
                                value={couponFormData.discountType}
                                onChange={(e) => setCouponFormData({ ...couponFormData, discountType: e.target.value as any })}
                                className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/10 text-white"
                              >
                                <option value="percentage">Percentage (%)</option>
                                <option value="flat">Flat Amount (₹)</option>
                              </select>
                            </label>
                            <label className="space-y-1">
                              <span className="text-white/60">Discount Value</span>
                              <input
                                type="number"
                                autoComplete="off"
                                value={couponFormData.discountValue || ''}
                                onChange={(e) => setCouponFormData({ ...couponFormData, discountValue: Number(e.target.value) })}
                                className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/10 text-white"
                              />
                            </label>
                            <label className="space-y-1 sm:col-span-3">
                              <span className="text-white/60">Description</span>
                              <input
                                autoComplete="off"
                                spellCheck={false}
                                value={couponFormData.description}
                                onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })}
                                placeholder="20% Departmental Fresher Waiver"
                                className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/10 text-white"
                              />
                            </label>
                            <label className="space-y-1">
                              <span className="text-white/60">Usage Limit (Redemptions)</span>
                              <input
                                type="number"
                                autoComplete="off"
                                value={couponFormData.usageLimit || ''}
                                onChange={(e) =>
                                  setCouponFormData({
                                    ...couponFormData,
                                    usageLimit: e.target.value ? Number(e.target.value) : undefined,
                                  })
                                }
                                placeholder="e.g. 100"
                                className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white"
                              />
                            </label>
                            <label className="space-y-1">
                              <span className="text-white/60">Valid Until</span>
                              <input
                                type="date"
                                autoComplete="off"
                                value={couponFormData.validUntil || ''}
                                onChange={(e) => setCouponFormData({ ...couponFormData, validUntil: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white"
                              />
                            </label>
                            <label className="space-y-1">
                              <span className="text-white/60">Active Status</span>
                              <select
                                value={couponFormData.active ? '1' : '0'}
                                onChange={(e) => setCouponFormData({ ...couponFormData, active: e.target.value === '1' })}
                                className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white"
                              >
                                <option value="1">Active &bull; Allow Redemptions</option>
                                <option value="0">Disabled &bull; Reject Redemptions</option>
                              </select>
                            </label>
                          </div>
                          <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                            <button
                              type="button"
                              onClick={() => setShowCouponForm(false)}
                              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-mono"
                            >
                              Cancel
                            </button>
                            <button type="submit" className="px-6 py-2.5 rounded-full bg-[#FFD60A] text-black font-mono font-bold text-xs">
                              {editingCouponCode ? 'Update Coupon' : 'Create Coupon'}
                            </button>
                          </div>
                        </form>
                      )}
                      <div className="grid sm:grid-cols-2 gap-3">
                        {couponsList.map((c) => (
                          <div key={c.code} className="p-4 rounded-[20px] bg-[#121216] border border-white/[0.08] flex flex-col gap-3 font-mono">
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-mono font-bold px-3 py-1 rounded-full bg-white text-black text-xs flex items-center gap-2">
                                {c.code}{' '}
                                <button
                                  onClick={() => handleCopyCoupon(c.code)}
                                  className="w-5 h-5 rounded-full bg-black/10 grid place-items-center hover:bg-black hover:text-white transition-colors"
                                >
                                  {copiedCode === c.code ? <Check className="w-3 h-3 text-[#00FF88]" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  c.active !== false
                                    ? 'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30'
                                    : 'bg-white/10 text-white/40'
                                }`}
                              >
                                {c.active !== false ? 'ACTIVE' : 'DISABLED'}
                              </span>
                            </div>
                            <p className="text-xs text-white/60 font-sans">{c.description || 'No description'}</p>
                            <div className="flex flex-wrap gap-1.5 text-[10px]">
                              <span className="px-2 py-1 rounded-full bg-[#FF4A15]/15 text-[#FF4A15] border border-[#FF4A15]/20 font-bold">
                                {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`} OFF
                              </span>
                              <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                                {c.usedCount || 0}/{c.usageLimit || '∞'} redemptions
                              </span>
                              <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                                {c.validUntil ? `Expires: ${c.validUntil}` : 'No expiry'}
                              </span>
                            </div>
                            <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                              <button
                                onClick={() => handleEditCouponInit(c)}
                                className="flex-1 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCoupon(c.code)}
                                className="px-3 py-1.5 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleCouponActive(c.code)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                                  c.active !== false
                                    ? 'bg-white/5 border-white/10 text-white/60'
                                    : 'bg-[#00FF88]/15 border-[#00FF88]/30 text-[#00FF88]'
                                }`}
                              >
                                {c.active !== false ? 'Disable' : 'Enable'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GALLERY TAB */}
                  {activeTab === 'gallery' && (
                    <div className="space-y-4">
                      {/* Hidden multi-file input */}
                      <input
                        type="file"
                        ref={galleryFileInputRef}
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (!files || files.length === 0) return;
                          soundFx.playClick();
                          const fileArray = Array.from(files);
                          let loadedCount = 0;
                          const newLoaded: string[] = [];

                          fileArray.forEach((file) => {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result as string;
                              if (result) {
                                newLoaded.push(result);
                              }
                              loadedCount++;
                              if (loadedCount === fileArray.length) {
                                setGalleryForm((prev) => {
                                  const combined = [...prev.images, ...newLoaded];
                                  return {
                                    ...prev,
                                    images: combined,
                                    url: prev.url || combined[0] || '',
                                  };
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                          if (e.target) e.target.value = '';
                        }}
                      />

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          {PRESET_GALLERY_IMAGES.map((p) => (
                            <button
                              key={p.url}
                              onClick={() => {
                                setGalleryForm({
                                  title: p.label,
                                  category: p.cat,
                                  type: 'image',
                                  url: p.url,
                                  images: [p.url],
                                  caption: p.label,
                                });
                                setIsAddingGallery(true);
                              }}
                              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono hover:bg-[#FF4A15] hover:text-white transition-colors cursor-pointer"
                            >
                              + {p.label}
                            </button>
                          ))}
                        </div>
                        {!isAddingGallery && (
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playClick();
                              setEditingGalleryId(null);
                              setGalleryForm({ title: '', category: 'Workshop', type: 'image', url: '', images: [], caption: '' });
                              setIsAddingGallery(true);
                            }}
                            className="px-4 py-2 rounded-full bg-[#FF4A15] text-white text-xs font-mono font-bold hover:bg-[#FF4A15]/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg"
                          >
                            <Plus className="w-4 h-4" /> Create Event Album / Photos
                          </button>
                        )}
                      </div>

                      {isAddingGallery && (
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            soundFx.playSuccess();
                            const allImgs = galleryForm.images.length
                              ? galleryForm.images
                              : (galleryForm.url ? [galleryForm.url] : ['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80']);

                            const newItem: GalleryItem = {
                              id: editingGalleryId || `ARCH-${Date.now()}`,
                              title: galleryForm.title || 'Untitled Event',
                              category: galleryForm.category,
                              type: galleryForm.type,
                              url: galleryForm.url || allImgs[0],
                              images: allImgs,
                              caption: galleryForm.caption || galleryForm.title,
                            };

                            let updated: GalleryItem[];
                            if (editingGalleryId) {
                              updated = galleryDraft.map((g) => (g.id === editingGalleryId ? { ...newItem, id: editingGalleryId } : g));
                              setEditingGalleryId(null);
                            } else {
                              updated = [newItem, ...galleryDraft];
                            }
                            setGalleryDraft(updated);
                            await onUpdateGallery(updated);
                            setIsAddingGallery(false);
                            setGalleryForm({ title: '', category: 'Workshop', type: 'image', url: '', images: [], caption: '' });
                            setGallerySavedMsg(true);
                            setTimeout(() => setGallerySavedMsg(false), 2500);
                          }}
                          autoComplete="off"
                          className="p-5 sm:p-6 rounded-[24px] bg-[#121216] border border-white/10 space-y-4 font-mono shadow-2xl"
                        >
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-[#FF4A15]" />
                              <span className="text-sm font-bold text-white">
                                {editingGalleryId ? 'Edit Event Album & Photos' : 'Add Single / Multi-Photo Event Gallery'}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#00E5CC]">
                              📷 {galleryForm.images.length} Photos Attached
                            </span>
                          </div>

                          {/* Quick Link from Event List */}
                          <div className="space-y-1">
                            <label className="text-xs text-white/50">Autofill from Registered Event (Optional)</label>
                            <select
                              onChange={(e) => {
                                const ev = eventsList.find((x) => x.id === e.target.value);
                                if (ev) {
                                  setGalleryForm((prev) => {
                                    const combined = ev.image ? Array.from(new Set([...prev.images, ev.image])) : prev.images;
                                    return {
                                      ...prev,
                                      title: ev.title,
                                      category: ev.category || 'Workshop',
                                      caption: `Memories and highlights from ${ev.title}`,
                                      url: prev.url || ev.image || '',
                                      images: combined,
                                    };
                                  });
                                }
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs"
                            >
                              <option value="">-- Select an event to autofill name &amp; category --</option>
                              {eventsList.map((ev) => (
                                <option key={ev.id} value={ev.id}>
                                  {ev.title} ({ev.category})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-3 text-xs">
                            <label className="space-y-1">
                              <span className="text-white/60">Event Title *</span>
                              <input
                                required
                                autoComplete="off"
                                spellCheck={false}
                                value={galleryForm.title}
                                onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                                placeholder="e.g. TARANG 2K26 Hardware Hackathon"
                                className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white"
                              />
                            </label>
                            <label className="space-y-1">
                              <span className="text-white/60">Category</span>
                              <select
                                value={galleryForm.category}
                                onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white"
                              >
                                <option>Workshop</option>
                                <option>Hackathon</option>
                                <option>Project Expo</option>
                                <option>Industrial Visit</option>
                              </select>
                            </label>
                            <label className="space-y-1 sm:col-span-2">
                              <span className="text-white/60">Event Caption / Summary</span>
                              <input
                                autoComplete="off"
                                spellCheck={false}
                                value={galleryForm.caption}
                                onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                                placeholder="Short descriptive highlights or outcomes of the event"
                                className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white"
                              />
                            </label>
                          </div>

                          {/* Multi-Photo Upload & Add Section */}
                          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <Upload className="w-3.5 h-3.5 text-[#FF4A15]" /> Add Event Photos (Multiple Supported)
                              </span>
                              <button
                                type="button"
                                onClick={() => galleryFileInputRef.current?.click()}
                                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-[#FF4A15] hover:text-white border border-white/10 text-xs font-mono text-white transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Upload className="w-3.5 h-3.5" /> Upload Photos from Device
                              </button>
                            </div>

                            {/* Or add via URL */}
                            <div className="flex gap-2">
                              <input
                                value={newPhotoUrlInput}
                                onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (newPhotoUrlInput.trim()) {
                                      const urls = newPhotoUrlInput.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean);
                                      setGalleryForm((prev) => {
                                        const combined = [...prev.images, ...urls];
                                        return { ...prev, images: combined, url: prev.url || combined[0] || '' };
                                      });
                                      setNewPhotoUrlInput('');
                                    }
                                  }
                                }}
                                placeholder="Paste image URL (or comma-separated URLs) and press Add"
                                className="flex-1 px-3 py-2 rounded-xl bg-black border border-white/10 text-white text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (newPhotoUrlInput.trim()) {
                                    const urls = newPhotoUrlInput.split(/[\n,]+/).map((u) => u.trim()).filter(Boolean);
                                    setGalleryForm((prev) => {
                                      const combined = [...prev.images, ...urls];
                                      return { ...prev, images: combined, url: prev.url || combined[0] || '' };
                                    });
                                    setNewPhotoUrlInput('');
                                  }
                                }}
                                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white hover:text-black text-white text-xs font-bold transition-colors cursor-pointer"
                              >
                                + Add URL
                              </button>
                            </div>

                            {/* Photos Album Grid Preview */}
                            {galleryForm.images.length > 0 ? (
                              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                                <div className="flex items-center justify-between text-[11px] text-white/50">
                                  <span>Album Photos ({galleryForm.images.length}):</span>
                                  <button
                                    type="button"
                                    onClick={() => setGalleryForm((prev) => ({ ...prev, images: [], url: '' }))}
                                    className="text-[#FF3B30] hover:underline"
                                  >
                                    Clear all photos
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-[220px] overflow-y-auto custom-scrollbar p-1">
                                  {galleryForm.images.map((imgUrl, pIdx) => {
                                    const isCover = (galleryForm.url || galleryForm.images[0]) === imgUrl;
                                    return (
                                      <div
                                        key={pIdx}
                                        className={`group relative rounded-xl overflow-hidden aspect-[4/3] bg-black border-2 transition-all ${
                                          isCover ? 'border-[#FF4A15] shadow-[0_0_10px_rgba(255,74,21,0.5)]' : 'border-white/10'
                                        }`}
                                      >
                                        <img src={imgUrl} alt={`Photo ${pIdx + 1}`} className="w-full h-full object-cover" />
                                        {isCover && (
                                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-[#FF4A15] text-white text-[9px] font-bold flex items-center gap-0.5">
                                            <Star className="w-2.5 h-2.5 fill-white" /> Cover
                                          </span>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                          {!isCover && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                soundFx.playClick();
                                                setGalleryForm((prev) => ({ ...prev, url: imgUrl }));
                                              }}
                                              className="px-2 py-0.5 rounded bg-white text-black text-[9.5px] font-bold hover:bg-[#FF4A15] hover:text-white transition-colors"
                                            >
                                              Set Cover
                                            </button>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              soundFx.playLaser();
                                              setGalleryForm((prev) => {
                                                const filtered = prev.images.filter((_, i) => i !== pIdx);
                                                return {
                                                  ...prev,
                                                  images: filtered,
                                                  url: prev.url === imgUrl ? (filtered[0] || '') : prev.url,
                                                };
                                              });
                                            }}
                                            className="px-2 py-0.5 rounded bg-[#FF3B30] text-white text-[9.5px] font-bold hover:bg-white hover:text-[#FF3B30] transition-colors"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="py-6 text-center text-xs text-white/40 border border-dashed border-white/10 rounded-xl">
                                No photos added yet. Upload files from your device or paste image URLs.
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingGallery(false);
                                setEditingGalleryId(null);
                              }}
                              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2 rounded-full bg-[#FF4A15] text-white font-bold text-xs hover:bg-[#FF4A15]/80 transition-colors shadow-lg cursor-pointer"
                            >
                              {editingGalleryId ? 'Update Event Album' : 'Save Event Album'}
                            </button>
                          </div>
                        </form>
                      )}

                      {gallerySavedMsg && (
                        <div className="p-2.5 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] text-xs font-mono flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Gallery synchronized &amp; updated live.
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[550px] overflow-auto p-1 custom-scrollbar">
                        {galleryDraft.map((g) => {
                          const count = g.images && g.images.length ? g.images.length : (g.url ? 1 : 0);
                          return (
                            <div key={g.id} className="group relative rounded-[20px] overflow-hidden bg-[#121216] border border-white/[0.08] hover:border-white/20 transition-all">
                              <div className="relative aspect-[16/10] bg-black">
                                <img src={g.url} alt={g.title} className="w-full h-full object-cover" />
                                <div className="absolute top-2 left-2 flex items-center gap-1">
                                  {count > 1 && (
                                    <span className="px-2 py-0.5 rounded-full bg-[#FF4A15] text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                                      📷 {count} Photos
                                    </span>
                                  )}
                                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur border border-white/10 text-white/70 text-[10px]">
                                    {g.category}
                                  </span>
                                </div>
                              </div>
                              <div className="p-3 space-y-1 font-mono">
                                <div className="text-xs font-bold text-white truncate">{g.title}</div>
                                <div className="text-[11px] text-white/40 truncate">{g.caption || 'No caption'}</div>
                              </div>
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingGalleryId(g.id);
                                    setGalleryForm({
                                      title: g.title,
                                      category: g.category,
                                      type: g.type,
                                      url: g.url,
                                      images: g.images && g.images.length ? g.images : (g.url ? [g.url] : []),
                                      caption: g.caption || '',
                                    });
                                    setIsAddingGallery(true);
                                  }}
                                  className="w-7 h-7 rounded-full bg-white text-black grid place-items-center hover:bg-[#FF4A15] hover:text-white transition-colors cursor-pointer shadow-md"
                                  title="Edit event album"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    soundFx.playLaser();
                                    const updated = galleryDraft.filter((x) => x.id !== g.id);
                                    setGalleryDraft(updated);
                                    await onUpdateGallery(updated);
                                  }}
                                  className="w-7 h-7 rounded-full bg-[#FF3B30] text-white grid place-items-center hover:bg-white hover:text-[#FF3B30] border border-white/10 transition-colors cursor-pointer shadow-md"
                                  title="Delete event album"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={async () => {
                            soundFx.playSuccess();
                            await onUpdateGallery(galleryDraft);
                            setGallerySavedMsg(true);
                            setTimeout(() => setGallerySavedMsg(false), 2000);
                          }}
                          className="px-6 py-2.5 rounded-full bg-white text-black font-mono font-bold text-xs hover:bg-[#FF4A15] hover:text-white transition-colors shadow-lg cursor-pointer"
                        >
                          Publish Gallery Live &rarr;
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SITE CONTENT & FLAGSHIP DATE SYNC TAB */}
                  {activeTab === 'siteContent' && (
                    <div className="space-y-6">
                      <div className="grid lg:grid-cols-2 gap-6 font-mono">
                        {/* Editor Form */}
                        <div className="space-y-3.5 p-5 rounded-[24px] bg-[#121216] border border-white/[0.08]">
                          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                            <h4 className="font-[Syne] font-[800] text-sm text-white flex items-center gap-2">
                              <Sliders className="w-4 h-4 text-[#FF4A15]" />
                              Hero &amp; Flagship Dossier Config
                            </h4>
                            <span className="text-[10px] text-[#FF4A15] font-bold">REAL-TIME</span>
                          </div>

                          <label className="space-y-1 block text-xs">
                            <span className="text-white/60">Session Badge</span>
                            <input
                              value={heroConfigDraft.heroSession}
                              onChange={(e) => updateHeroField('heroSession', e.target.value)}
                              placeholder="2026—27"
                              className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/10 text-white"
                            />
                          </label>

                          <label className="space-y-1 block text-xs">
                            <span className="text-white/60">Forum Header Title</span>
                            <input
                              value={heroConfigDraft.heroForumTitle}
                              onChange={(e) => updateHeroField('heroForumTitle', e.target.value)}
                              placeholder="SPACE &times; SINC"
                              className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/10 text-white"
                            />
                          </label>

                          <label className="space-y-1 block text-xs">
                            <span className="text-white/60">Flagship Main Title</span>
                            <input
                              value={heroConfigDraft.flagshipTitle}
                              onChange={(e) => updateHeroField('flagshipTitle', e.target.value)}
                              placeholder="SPACE & SINC Installation"
                              className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/10 text-white"
                            />
                          </label>

                          <label className="space-y-1 block text-xs">
                            <span className="text-white/60">Flagship Subtitle</span>
                            <input
                              value={heroConfigDraft.flagshipSubTitle}
                              onChange={(e) => updateHeroField('flagshipSubTitle', e.target.value)}
                              placeholder="& TARANG 2K26"
                              className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/10 text-white"
                            />
                          </label>

                          <label className="space-y-1 block text-xs">
                            <span className="text-white/60">Flagship Description</span>
                            <textarea
                              value={heroConfigDraft.flagshipDescription}
                              onChange={(e) => updateHeroField('flagshipDescription', e.target.value)}
                              rows={2}
                              className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/10 text-white font-sans text-xs"
                            />
                          </label>

                          {/* Flagship Target Date (Interactive DateTime Picker & Presets) */}
                          <div className="space-y-2 p-3.5 rounded-xl bg-black/60 border border-[#FF4A15]/30">
                            <label className="space-y-1 block text-xs">
                              <span className="text-[#FF4A15] font-bold flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /> Target Date &amp; Time (Interactive Picker) *
                              </span>
                              <input
                                type="datetime-local"
                                value={getDatetimeLocalValue(heroConfigDraft.flagshipTargetDate)}
                                onChange={(e) => updateHeroField('flagshipTargetDate', e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl bg-[#121216] border border-white/20 text-white font-mono text-xs focus:border-[#FF4A15] outline-none"
                              />
                            </label>
                            <div className="text-[10px] text-white/50">Quick Date Presets:</div>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() => applyFlagshipDatePreset('2026-08-30T10:00:00')}
                                className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/70 hover:bg-[#FF4A15] hover:text-white"
                              >
                                Tarang: Aug 30, 2026 10 AM
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const d = new Date(Date.now() + 7 * 86400000);
                                  d.setHours(10, 0, 0, 0);
                                  applyFlagshipDatePreset(d.toISOString().slice(0, 19));
                                }}
                                className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/70 hover:bg-[#FF4A15] hover:text-white"
                              >
                                +7 Days
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const d = new Date(Date.now() + 14 * 86400000);
                                  d.setHours(10, 0, 0, 0);
                                  applyFlagshipDatePreset(d.toISOString().slice(0, 19));
                                }}
                                className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/70 hover:bg-[#FF4A15] hover:text-white"
                              >
                                +14 Days
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const d = new Date(Date.now() + 30 * 86400000);
                                  d.setHours(10, 0, 0, 0);
                                  applyFlagshipDatePreset(d.toISOString().slice(0, 19));
                                }}
                                className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/70 hover:bg-[#FF4A15] hover:text-white"
                              >
                                +30 Days
                              </button>
                            </div>
                          </div>

                          <label className="space-y-1 block text-xs">
                            <span className="text-white/60">Venue</span>
                            <input
                              value={heroConfigDraft.flagshipTargetVenue}
                              onChange={(e) => updateHeroField('flagshipTargetVenue', e.target.value)}
                              placeholder="AUDITORIUM, PIET"
                              className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/10 text-white"
                            />
                          </label>

                          <label className="space-y-1 block text-xs">
                            <span className="text-white/60">Button Call-To-Action</span>
                            <input
                              value={heroConfigDraft.flagshipButtonText}
                              onChange={(e) => updateHeroField('flagshipButtonText', e.target.value)}
                              placeholder="Register for Flagship"
                              className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/10 text-white"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={handleSaveHeroConfig}
                            className="w-full py-3 rounded-full bg-[#FF4A15] text-white font-bold text-xs shadow-[0_0_25px_rgba(255,74,21,0.35)] hover:bg-white hover:text-black transition-all cursor-pointer"
                          >
                            Save Hero &amp; Flagship Live &rarr;
                          </button>
                          {siteConfigSavedMsg && (
                            <div className="text-xs text-[#00FF88] font-mono flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30">
                              <CheckCircle2 className="w-4 h-4" /> Live date &amp; flagship synced across entire website!
                            </div>
                          )}
                        </div>

                        {/* Live Preview Pane */}
                        <div className="space-y-4 p-5 rounded-[24px] bg-[#121216] border border-white/[0.08]">
                          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                            <h4 className="font-[Syne] font-[800] text-sm text-white flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-[#FFD60A]" /> Live Countdown Preview
                            </h4>
                            <span className="text-[10px] text-white/40">Real-time Telemetry</span>
                          </div>
                          <div className="rounded-[20px] bg-black border border-white/[0.08] p-5 space-y-3">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF4A15]/10 border border-[#FF4A15]/30 text-[#FF4A15] text-[10px] font-bold">
                              {heroConfigDraft.flagshipBadge || 'FLAGSHIP DOSSIER'}
                            </div>
                            <h3 className="font-[Syne] font-[800] text-xl leading-tight text-white">
                              {heroConfigDraft.flagshipTitle}{' '}
                              <span className="font-[Instrument_Serif] italic text-[#FF4A15] font-normal">{heroConfigDraft.flagshipSubTitle}</span>
                            </h3>
                            <p className="text-xs text-white/60 font-sans leading-relaxed">{heroConfigDraft.flagshipDescription}</p>
                            <div className="flex flex-wrap gap-2 text-[11px]">
                              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
                                {heroConfigDraft.flagshipTargetDate.replace('T', ' · ')}
                              </span>
                              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
                                {heroConfigDraft.flagshipTargetVenue}
                              </span>
                            </div>

                            <div className="grid grid-cols-4 gap-2 pt-2">
                              <div className="text-center">
                                <div className="text-[10px] text-white/40">DAYS</div>
                                <div className="text-xl font-bold bg-white/5 border border-white/10 rounded-xl py-2 text-white">
                                  {String(adminCountdown.days).padStart(2, '0')}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-[10px] text-white/40">HOURS</div>
                                <div className="text-xl font-bold bg-white/5 border border-white/10 rounded-xl py-2 text-white">
                                  {String(adminCountdown.hours).padStart(2, '0')}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-[10px] text-white/40">MINS</div>
                                <div className="text-xl font-bold bg-white/5 border border-white/10 rounded-xl py-2 text-white">
                                  {String(adminCountdown.minutes).padStart(2, '0')}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-[10px] text-[#FF4A15]">SECS</div>
                                <div className="text-xl font-bold bg-[#FF4A15] text-white rounded-xl py-2 shadow-[0_0_15px_rgba(255,74,21,0.4)]">
                                  {String(adminCountdown.seconds).padStart(2, '0')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Official Payment QR Code & UPI Gateway Configuration */}
                      <div className="p-5 rounded-[24px] bg-[#121216] border border-[#00E5CC]/30 space-y-4 font-mono">
                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                          <h4 className="font-[Syne] font-[800] text-sm text-white flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-[#00E5CC]" />
                            Official Payment QR Code &amp; UPI Settings
                          </h4>
                          <span className="text-[10px] text-[#00E5CC] font-bold">REGISTRATION GATEWAY</span>
                        </div>

                        <p className="text-xs text-white/50 leading-relaxed font-sans">
                          Upload the exact UPI QR Code image (PhonePe / Google Pay / Paytm / Bank QR) on which users should make registration payments.
                        </p>

                        <div className="grid sm:grid-cols-12 gap-5 items-start">
                          {/* QR Upload & Preview */}
                          <div className="sm:col-span-4 space-y-2 text-center">
                            <div className="p-3 rounded-2xl bg-black border border-white/15 aspect-square flex flex-col items-center justify-center relative overflow-hidden group">
                              {heroConfigDraft.paymentQrImage ? (
                                <img
                                  src={heroConfigDraft.paymentQrImage}
                                  alt="Official Payment QR"
                                  className="w-full h-full object-contain rounded-xl"
                                />
                              ) : (
                                <div className="space-y-1 text-white/40 text-xs">
                                  <QrCode className="w-10 h-10 mx-auto text-white/20" />
                                  <span>No Custom QR Uploaded</span>
                                  <span className="text-[9px] block text-white/30">(Default UPI QR Active)</span>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 justify-center">
                              <label className="px-3.5 py-1.5 rounded-full bg-[#00E5CC]/15 border border-[#00E5CC]/30 text-[#00E5CC] text-xs font-bold hover:bg-[#00E5CC] hover:text-black transition-colors cursor-pointer inline-flex items-center gap-1.5">
                                <Upload className="w-3 h-3" /> Upload QR Image
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      if (typeof reader.result === 'string') {
                                        updateHeroField('paymentQrImage', reader.result as string);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              </label>

                              {heroConfigDraft.paymentQrImage && (
                                <button
                                  type="button"
                                  onClick={() => updateHeroField('paymentQrImage', '')}
                                  className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500 hover:text-white transition-colors"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>

                          {/* UPI Parameters */}
                          <div className="sm:col-span-8 space-y-3 text-xs">
                            <label className="space-y-1 block">
                              <span className="text-white/60">Official Council UPI ID</span>
                              <input
                                value={heroConfigDraft.paymentUpiId || ''}
                                onChange={(e) => updateHeroField('paymentUpiId', e.target.value)}
                                placeholder="pieteceforum@okhdfcbank"
                                className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/10 text-white font-mono"
                              />
                            </label>

                            <label className="space-y-1 block">
                              <span className="text-white/60">Payee Account / Display Name</span>
                              <input
                                value={heroConfigDraft.paymentPayeeName || ''}
                                onChange={(e) => updateHeroField('paymentPayeeName', e.target.value)}
                                placeholder="PIET ECE COUNCIL"
                                className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/10 text-white font-mono"
                              />
                            </label>

                            <label className="space-y-1 block">
                              <span className="text-white/60">Payment Note &amp; Instructions</span>
                              <textarea
                                value={heroConfigDraft.paymentBankDetails || ''}
                                onChange={(e) => updateHeroField('paymentBankDetails', e.target.value)}
                                rows={2}
                                placeholder="Scan using Google Pay, PhonePe, Paytm, or any UPI app and upload screenshot below."
                                className="w-full px-3.5 py-2 rounded-xl bg-black border border-white/10 text-white font-sans text-xs"
                              />
                            </label>

                            <div className="pt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={handleSaveHeroConfig}
                                className="px-6 py-2.5 rounded-full bg-[#00E5CC] text-black font-bold text-xs hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,204,0.3)] cursor-pointer"
                              >
                                Save Payment Settings &rarr;
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ANNOUNCEMENTS / BROADCAST TAB */}
                  {activeTab === 'announcements' && (
                    <form onSubmit={handleBroadcastAnnouncement} className="space-y-4 font-mono">
                      <div className="p-5 rounded-[24px] bg-[#121216] border border-white/[0.08] space-y-3">
                        <h4 className="font-[Syne] font-[800] text-sm text-white flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#FF4A15]" /> Live Ticker Broadcast Stream
                        </h4>
                        <textarea
                          value={announcementText}
                          onChange={(e) => setAnnouncementText(e.target.value)}
                          rows={3}
                          placeholder="Registration Open for SPACE & SINC Forum Installation & TARANG 2K26 Fiesta!"
                          className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-xs focus:border-[#FF4A15]/60 outline-none font-mono"
                        />
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-full bg-[#FF4A15] text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(255,74,21,0.3)] hover:bg-white hover:text-black transition-all"
                        >
                          <Sparkles className="w-4 h-4" /> Broadcast Live to Ticker &rarr;
                        </button>
                        {announcementSaved && (
                          <div className="text-xs text-[#00FF88] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Broadcast updated &amp; live across all connected client tickers!
                          </div>
                        )}
                      </div>
                    </form>
                  )}

                  {/* ADMINS TAB */}
                  {activeTab === 'admins' && (
                    <div className="space-y-4 font-mono">
                      <div className="flex justify-between items-center">
                        <h4 className="font-[Syne] font-[800] text-sm text-white">Organizer Accounts ({adminsList.length})</h4>
                        <button
                          onClick={() => setShowAdminForm(!showAdminForm)}
                          className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-[#FF4A15] hover:text-white transition-colors"
                        >
                          {showAdminForm ? 'Close' : 'New Admin'}
                        </button>
                      </div>
                      {showAdminForm && (
                        <form
                          onSubmit={handleAddAdmin}
                          autoComplete="off"
                          className="p-5 rounded-[20px] bg-[#121216] border border-white/10 grid sm:grid-cols-2 gap-3 text-xs"
                        >
                          <label className="space-y-1">
                            <span className="text-white/60">Name</span>
                            <input
                              required
                              autoComplete="off"
                              spellCheck={false}
                              value={newAdminData.name}
                              onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                              placeholder="Alex Vance"
                              className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-white/60">Email</span>
                            <input
                              required
                              type="email"
                              autoComplete="off"
                              spellCheck={false}
                              value={newAdminData.email}
                              onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                              placeholder="admin@ece.com"
                              className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-white/60">Password</span>
                            <input
                              required
                              type="password"
                              autoComplete="off"
                              value={newAdminData.password}
                              onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                              placeholder="••••••••"
                              className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-white/60">Role</span>
                            <input
                              autoComplete="off"
                              spellCheck={false}
                              value={newAdminData.role}
                              onChange={(e) => setNewAdminData({ ...newAdminData, role: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white"
                            />
                          </label>
                          <button type="submit" className="sm:col-span-2 py-2.5 rounded-full bg-[#FF4A15] text-white font-bold text-xs">
                            Create Admin Account
                          </button>
                        </form>
                      )}
                      <div className="grid gap-2">
                        {adminsList.map((a) => (
                          <div
                            key={a.id}
                            className="p-3.5 rounded-[18px] bg-[#121216] border border-white/[0.08] flex justify-between items-center"
                          >
                            <div>
                              <div className="font-bold text-sm text-white">{a.name}</div>
                              <div className="text-xs text-white/40">
                                {a.email} &bull; {a.role}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteAdmin(a.id)}
                              className="w-8 h-8 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] grid place-items-center hover:bg-[#FF3B30] hover:text-white transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ATTENDEE DOSSIER & PAYMENT VERIFICATION MODAL */}
      <AnimatePresence>
        {selectedProofPass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-[#0F0F12] border border-white/10 p-5 sm:p-7 shadow-[0_24px_80px_rgba(0,0,0,0.95)] space-y-5 font-mono text-xs"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-3.5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#00E5CC]/15 text-[#00E5CC] grid place-items-center font-bold">
                    <ShieldCheck className="w-4 h-4 text-[#00E5CC]" />
                  </div>
                  <div>
                    <h3 className="font-[Syne] font-[800] text-base text-white">
                      Attendee Dossier &amp; Payment Proof
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/50">
                      <span className="text-[#FF4A15] font-bold">{selectedProofPass.passId}</span>
                      <span>&bull;</span>
                      <span>{selectedProofPass.eventTitle}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProofPass(null)}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 grid place-items-center hover:bg-white hover:text-black transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status and Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-black/50 border border-white/[0.08] space-y-1">
                  <span className="text-[10px] text-white/40 block uppercase">Gate Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedProofPass.status === 'CHECKED_IN' ? 'bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/40' : 'bg-[#FFD60A]/20 text-[#FFD60A] border border-[#FFD60A]/40'}`}>
                    {selectedProofPass.status === 'CHECKED_IN' ? 'CHECKED IN' : 'CONFIRMED'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/50 border border-white/[0.08] space-y-1">
                  <span className="text-[10px] text-white/40 block uppercase">Amount Paid</span>
                  <strong className="text-white font-[Syne] font-bold text-sm block">
                    {selectedProofPass.amount === 0 ? <span className="text-[#00FF88]">FREE PASS</span> : `₹${selectedProofPass.amount}`}
                  </strong>
                </div>

                <div className="p-3 rounded-2xl bg-black/50 border border-white/[0.08] space-y-1">
                  <span className="text-[10px] text-white/40 block uppercase">Pass Format</span>
                  <span className="text-[#00E5CC] font-bold text-[11px] block">
                    {selectedProofPass.registrationType === 'team' ? 'Team Pass' : 'Individual Solo'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/50 border border-white/[0.08] space-y-1">
                  <span className="text-[10px] text-white/40 block uppercase">Total Headcount</span>
                  <span className="text-white font-bold text-[11px] block">
                    {selectedProofPass.teamMembers?.length ? selectedProofPass.teamMembers.length + 1 : 1} Attendee(s)
                  </span>
                </div>
              </div>

              {/* 1. Primary Registrant Profile */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-[11px] font-bold text-[#FF4A15] flex items-center gap-1.5 uppercase">
                    <User className="w-3.5 h-3.5" />
                    <span>{selectedProofPass.registrationType === 'team' ? '1. Team Leader / Primary Contact' : 'Participant Details'}</span>
                  </span>
                  <span className="text-[10px] text-white/40">{selectedProofPass.registeredAt}</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-white/40 block">Full Name:</span>
                    <strong className="text-white font-bold">{selectedProofPass.userName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block">Email Address:</span>
                    <span className="text-white/90">{selectedProofPass.userEmail}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block">Phone / WhatsApp:</span>
                    <span className="text-white/90">{selectedProofPass.phone || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block">College / Institution:</span>
                    <span className="text-white/90">{selectedProofPass.collegeName || 'PIET, Nagpur'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block">Department / Branch:</span>
                    <span className="text-white/90">{selectedProofPass.department || 'ECE'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block">Academic Year:</span>
                    <span className="text-white/90">{selectedProofPass.year || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Teammates Dossiers (If Team Pass) */}
              {selectedProofPass.registrationType === 'team' && (
                <div className="p-4 rounded-2xl bg-black/60 border border-[#00E5CC]/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <span className="text-[11px] font-bold text-[#00E5CC] flex items-center gap-1.5 uppercase">
                      <Users className="w-3.5 h-3.5" />
                      <span>Team Dossier: {selectedProofPass.teamName || 'Team'} ({selectedProofPass.teamMembers ? selectedProofPass.teamMembers.length + 1 : 1} Members)</span>
                    </span>
                  </div>

                  {selectedProofPass.teamMembers && selectedProofPass.teamMembers.length > 0 ? (
                    <div className="grid gap-2.5">
                      {selectedProofPass.teamMembers.map((tm, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="font-bold text-white flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-[#00E5CC]/20 text-[#00E5CC] text-[10px] font-bold grid place-items-center">{idx + 2}</span>
                              <span className="text-xs">{tm.name}</span>
                            </div>
                            <span className="text-[10px] text-white/50 font-mono">
                              {tm.email} {tm.phone ? `• ${tm.phone}` : ''}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 text-[10px] text-white/60 pt-0.5 border-t border-white/[0.04]">
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/80">
                              College: {tm.collegeName || selectedProofPass.collegeName || 'PIET'}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/80">
                              Dept: {tm.department || 'ECE'}
                            </span>
                            {tm.year && (
                              <span className="px-2 py-0.5 rounded-md bg-[#00E5CC]/10 text-[#00E5CC] border border-[#00E5CC]/30 font-bold">
                                {tm.year}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-white/40 italic">Single leader recorded under team pass format.</p>
                  )}
                </div>
              )}

              {/* 3. Payment Verification & Screenshot Section */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-[11px] font-bold text-[#FFD60A] flex items-center gap-1.5 uppercase">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Payment Verification &amp; Transaction Details</span>
                  </span>
                  {selectedProofPass.couponCode && (
                    <span className="px-2 py-0.5 rounded-full bg-[#00FF88]/15 text-[#00FF88] text-[10px] font-bold border border-[#00FF88]/30">
                      Coupon Applied: {selectedProofPass.couponCode}
                    </span>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {selectedProofPass.transactionId && (
                    <div className="sm:col-span-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-white/40 block">Bank Transaction ID / UTR:</span>
                        <strong className="text-[#FFD60A] font-bold text-xs">{selectedProofPass.transactionId}</strong>
                      </div>
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          navigator.clipboard.writeText(selectedProofPass.transactionId || '');
                          setCopiedProofField('utr');
                          setTimeout(() => setCopiedProofField(null), 2000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#FF4A15] text-white text-[10px] transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedProofField === 'utr' ? <Check className="w-3 h-3 text-[#00FF88]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedProofField === 'utr' ? 'Copied UTR' : 'Copy UTR'}</span>
                      </button>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] text-white/40 block">Security Hash (QR Token):</span>
                    <span className="text-[#FF4A15] font-bold">{selectedProofPass.securityHash || 'Verified'}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-white/40 block">Payment ID:</span>
                    <span className="text-white/80">{selectedProofPass.paymentId}</span>
                  </div>
                </div>

                {/* Uploaded Payment Screenshot Image Viewer */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] text-white/50 uppercase font-bold block">
                    Uploaded Payment Screenshot Proof:
                  </span>

                  {selectedProofPass.paymentScreenshot ? (
                    <div className="space-y-2">
                      <div className="rounded-2xl overflow-hidden border border-white/15 bg-black max-h-[420px] flex items-center justify-center p-2">
                        <img
                          src={selectedProofPass.paymentScreenshot}
                          alt="Payment Screenshot Proof"
                          className="w-full max-h-[400px] object-contain rounded-xl"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <a
                          href={selectedProofPass.paymentScreenshot}
                          download={`Payment_Proof_${selectedProofPass.passId}.jpg`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-full bg-white/10 hover:bg-[#00E5CC] hover:text-black text-xs font-mono text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Full Image
                        </a>
                        <a
                          href={selectedProofPass.paymentScreenshot}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white hover:text-black text-xs font-mono text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-white/40 text-xs border border-dashed border-white/15 rounded-2xl bg-white/[0.01]">
                      No screenshot uploaded for this pass (Free entry or verified offline).
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-2 flex flex-wrap gap-2 justify-between items-center border-t border-white/[0.08]">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      handleToggleCheckIn(selectedProofPass.passId);
                      setSelectedProofPass((prev) => prev ? ({
                        ...prev,
                        status: prev.status === 'CHECKED_IN' ? 'CONFIRMED' : 'CHECKED_IN',
                        checkedInAt: prev.status === 'CHECKED_IN' ? undefined : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                      }) : null);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedProofPass.status === 'CHECKED_IN'
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-[#00FF88] text-black hover:bg-white'
                    }`}
                  >
                    {selectedProofPass.status === 'CHECKED_IN' ? 'Undo Check-In' : '✓ Check-In Attendee'}
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      const fullSummary = `ECE FORUM REGISTRATION\nPass ID: ${selectedProofPass.passId}\nEvent: ${selectedProofPass.eventTitle}\nAttendee: ${selectedProofPass.userName}\nEmail: ${selectedProofPass.userEmail}\nPhone: ${selectedProofPass.phone || 'N/A'}\nCollege: ${selectedProofPass.collegeName || 'PIET'}\nDepartment: ${selectedProofPass.department}\nType: ${selectedProofPass.registrationType || 'individual'}\nTeam Name: ${selectedProofPass.teamName || 'N/A'}\nTeammates: ${selectedProofPass.teamMembers?.map((m: any) => `${m.name} (${m.email})`).join(', ') || 'None'}\nAmount: ₹${selectedProofPass.amount}\nUTR: ${selectedProofPass.transactionId || 'N/A'}`;
                      navigator.clipboard.writeText(fullSummary);
                      setCopiedProofField('summary');
                      setTimeout(() => setCopiedProofField(null), 2000);
                    }}
                    className="px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedProofField === 'summary' ? 'Dossier Copied!' : 'Copy Full Summary'}</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedProofPass(null)}
                  className="px-5 py-2 rounded-full bg-[#FF4A15] text-white font-bold text-xs hover:bg-white hover:text-black transition-all cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE PASS CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingPassId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-[24px] bg-[#0F0F12] border border-[#FF3B30]/30 p-6 space-y-4 font-mono shadow-[0_20px_60px_rgba(255,59,48,0.2)]"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-[#FF3B30] grid place-items-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-[Syne] font-[800] text-base text-white">Delete Allotted Pass?</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Pass ID <strong className="text-white">{deletingPassId}</strong> will be permanently deleted from the database and revoked.
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setDeletingPassId(null)}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePass(deletingPassId)}
                  className="px-5 py-2 rounded-full bg-[#FF3B30] text-white font-bold text-xs shadow-[0_0_15px_rgba(255,59,48,0.4)] hover:bg-white hover:text-[#FF3B30] transition-all"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
