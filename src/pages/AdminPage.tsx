import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Shield, Plus, FileSpreadsheet, Bell, Users, Calendar, TrendingUp,
  LogOut, Trash2, Smartphone, Search, Upload, Image as ImageIcon, Sparkles,
  Check, CheckCircle2, Sliders, Edit3, FileDown, Filter, Tag, Copy, Zap, Activity, LayoutGrid, Trophy, Hexagon
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
  { id: 'inst', label: 'Installation Ceremony', url: '/event_images/inst.webp' },
  { id: 'tarang', label: 'TARANG Tech Fiesta', url: '/event_images/tarang.webp' },
  { id: 'iot', label: 'Embedded & IoT Lab', url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=800&q=80' },
  { id: 'vlsi', label: 'VLSI & Silicon Chip', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80' },
  { id: 'robotics', label: 'Robotics & AI Lab', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80' },
];

const PRESET_GALLERY_IMAGES = [
  { label: 'Autonomous Robotics', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80', cat: 'Project Expo' },
  { label: 'PCB Micro-Soldering Lab', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', cat: 'Workshop' },
  { label: '24-Hour Hardware Hackathon', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80', cat: 'Hackathon' },
  { label: 'Semiconductor Cleanroom', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80', cat: 'Industrial Visit' },
  { label: 'FPGA Verilog Synthesis', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', cat: 'Workshop' },
];

export const AdminPage: React.FC<AdminPageProps> = ({
  eventsList = [],
  onAddEvent,
  onUpdateEvents,
  onUpdateAnnouncement = () => {},
  currentAnnouncement = 'Registration Open for SPACE & SINC Forum Installation & TARANG 2K26 Fiesta!',
  heroConfig = DEFAULT_HERO_CONFIG,
  onUpdateHeroConfig = () => {},
  galleryList = DEFAULT_GALLERY_ITEMS,
  onUpdateGallery = () => {},
}) => {
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'coupons' | 'gallery' | 'registrations' | 'announcements' | 'admins' | 'siteContent'>('overview');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('ALL');
  const [galleryDraft, setGalleryDraft] = useState<GalleryItem[]>(galleryList || DEFAULT_GALLERY_ITEMS);
  const [gallerySavedMsg, setGallerySavedMsg] = useState(false);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [galleryForm, setGalleryForm] = useState({ title: '', category: 'Workshop', type: 'image' as 'image' | 'video', url: '', caption: '' });
  useEffect(() => { if (Array.isArray(galleryList)) setGalleryDraft(galleryList); }, [galleryList]);
  const [heroConfigDraft, setHeroConfigDraft] = useState<SiteHeroConfig>(heroConfig);
  const [siteConfigSavedMsg, setSiteConfigSavedMsg] = useState(false);
  const [adminCountdown, setAdminCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });
  useEffect(() => {
    const calc = () => {
      if (!heroConfigDraft.flagshipTargetDate) { setAdminCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false }); return; }
      try {
        const raw = heroConfigDraft.flagshipTargetDate;
        const norm = raw.includes('+') || raw.includes('Z') ? raw : `${raw}+05:30`;
        let target = new Date(norm).getTime(); if (isNaN(target)) target = new Date(raw).getTime();
        if (isNaN(target)) { setAdminCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false }); return; }
        const diff = target - Date.now();
        if (diff > 0) setAdminCountdown({ days: Math.floor(diff/86400000), hours: Math.floor(diff/3600000)%24, minutes: Math.floor(diff/60000)%60, seconds: Math.floor(diff/1000)%60, isExpired: false });
        else setAdminCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } catch { setAdminCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false }); }
    };
    calc(); const t=setInterval(calc,1000); return()=>clearInterval(t);
  }, [heroConfigDraft.flagshipTargetDate]);
  useEffect(()=>{ if(heroConfig) setHeroConfigDraft(heroConfig); },[heroConfig]);
  const [passes, setPasses] = useState<EventPass[]>([]);
  const [adminsList, setAdminsList] = useState<{ id: string; name: string; email: string; role: string; created_at?: string }[]>([]);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [newAdminData, setNewAdminData] = useState({ name: '', email: '', password: '', role: 'Event Organizer' });
  const [searchFilter, setSearchFilter] = useState('');
  const [couponsList, setCouponsList] = useState<Coupon[]>(DEFAULT_COUPONS);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCouponCode, setEditingCouponCode] = useState<string | null>(null);
  const [couponFormData, setCouponFormData] = useState<Coupon>({ code: '', discountType: 'percentage', discountValue: 20, description: '', active: true, usedCount: 0, validUntil: '', validFrom: '' });
  const [couponSavedMsg, setCouponSavedMsg] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refreshLivePasses = () => { try { setPasses(passService.getAllPasses()); } catch { setPasses([]); } };
  const refreshAdmins = async () => { const list = await api.getAdmins(); setAdminsList(list); };
  const refreshCoupons = async () => { try { const list = await api.getCoupons(); setCouponsList(list && list.length?list:DEFAULT_COUPONS); } catch { setCouponsList(DEFAULT_COUPONS); } };
  useEffect(()=>{ refreshLivePasses(); refreshAdmins(); refreshCoupons(); const iv=setInterval(refreshLivePasses,6000); return()=>clearInterval(iv); },[]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<EventItem>>({ title: '', category: 'Workshop', status: 'Upcoming', date: 'Aug 25, 2026', time: '10:00 AM IST', venue: 'PIET Campus', description: '', price: 0, totalSeats: 100, image: '/event_images/tarang.webp', participationType: 'both' });
  const [announcementText, setAnnouncementText] = useState(currentAnnouncement);
  const [announcementSaved, setAnnouncementSaved] = useState(false);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { soundFx.playClick(); const r=new FileReader(); r.onloadend=()=>setNewEvent({ ...newEvent, image: r.result as string }); r.readAsDataURL(file); }
  };
  const handleEditEventInit = (event: EventItem) => {
    soundFx.playClick(); setEditingEventId(event.id); setNewEvent({ title: event.title, category: event.category, status: event.status, date: event.date, time: event.time||'10:00 AM IST', venue: event.venue, description: event.description, price: event.price||0, image: event.image||'/event_images/tarang.webp', participationType: event.participationType||'both' }); setShowEventForm(true);
  };
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); soundFx.playSuccess(); if(!newEvent.title) return;
    if(editingEventId){
      const updatedEvents = eventsList.map(evt=> evt.id===editingEventId ? { ...evt, title: newEvent.title||'Untitled', category: (newEvent.category as any)||'Workshop', status: (newEvent.status as any)||'Upcoming', date: newEvent.date||'TBD', time: newEvent.time||'10:00 AM IST', venue: newEvent.venue||'PIET Campus', description: newEvent.description||'', price: Number(newEvent.price)||0, image: newEvent.image||'/event_images/tarang.webp', badge: (newEvent.category||'EVENT').toUpperCase(), participationType: newEvent.participationType||'both' } : evt);
      onUpdateEvents(updatedEvents); const updatedItem = updatedEvents.find(x=>x.id===editingEventId); if(updatedItem) await api.createEvent(updatedItem); setEditingEventId(null);
    } else {
      const eventToAdd: EventItem = { id: `evt-${Date.now()}`, title: newEvent.title||'Untitled', category: (newEvent.category as any)||'Workshop', status: (newEvent.status as any)||'Upcoming', date: newEvent.date||'TBD', time: newEvent.time||'10:00 AM IST', venue: newEvent.venue||'Auditorium', description: newEvent.description||'', price: Number(newEvent.price)||0, image: newEvent.image||'/event_images/tarang.webp', badge: (newEvent.category||'EVENT').toUpperCase(), participationType: newEvent.participationType||'both' };
      onAddEvent(eventToAdd); await api.createEvent(eventToAdd);
    }
    setShowEventForm(false); setNewEvent({ title:'', category:'Workshop', status:'Upcoming', date:'Aug 25, 2026', time:'10:00 AM IST', venue:'PIET Campus', description:'', price:0, totalSeats:100, image:'/event_images/tarang.webp', participationType:'both' });
  };
  const handleDeleteEvent = async (id:string)=>{ soundFx.playLaser(); const updated=eventsList.filter(e=>e.id!==id); onUpdateEvents(updated); await api.deleteEvent(id); };
  const handleBroadcastAnnouncement = (e:React.FormEvent)=>{ e.preventDefault(); soundFx.playSuccess(); onUpdateAnnouncement(announcementText); setAnnouncementSaved(true); setTimeout(()=>setAnnouncementSaved(false),3000); };
  const handleAddAdmin = async (e:React.FormEvent)=>{ e.preventDefault(); if(!newAdminData.name||!newAdminData.email||!newAdminData.password) return; soundFx.playSuccess(); await api.createAdmin(newAdminData); setNewAdminData({ name:'',email:'',password:'',role:'Event Organizer'}); setShowAdminForm(false); await refreshAdmins(); };
  const handleDeleteAdmin = async (id:string)=>{ soundFx.playLaser(); await api.deleteAdmin(id); await refreshAdmins(); };
  const handleEditCouponInit = (c:Coupon)=>{ soundFx.playClick(); setEditingCouponCode(c.code); setCouponFormData({ ...c }); setShowCouponForm(true); };
  const handleSaveCoupon = async (e:React.FormEvent)=>{ e.preventDefault(); soundFx.playSuccess(); const clean=couponFormData.code.trim().toUpperCase(); if(!clean) return; let updated:Coupon[]; if(editingCouponCode){ updated=couponsList.map(c=> c.code===editingCouponCode?{ ...couponFormData, code:clean, discountValue: Number(couponFormData.discountValue)||0, usageLimit: couponFormData.usageLimit?Number(couponFormData.usageLimit):undefined, usedCount: c.usedCount||0, validUntil: couponFormData.validUntil||undefined, validFrom: couponFormData.validFrom||undefined }:c); } else { const nc:Coupon={ ...couponFormData, code:clean, discountValue: Number(couponFormData.discountValue)||0, active: couponFormData.active!==false, usageLimit: couponFormData.usageLimit?Number(couponFormData.usageLimit):undefined, usedCount:0, validUntil: couponFormData.validUntil||undefined, validFrom: couponFormData.validFrom||undefined }; updated=[nc, ...couponsList.filter(c=>c.code!==clean)]; } setCouponsList(updated); await api.updateCoupons(updated); setShowCouponForm(false); setEditingCouponCode(null); setCouponFormData({ code:'', discountType:'percentage', discountValue:20, description:'', active:true, usedCount:0, validUntil:'', validFrom:'' }); setCouponSavedMsg(true); setTimeout(()=>setCouponSavedMsg(false),3000); };
  const handleDeleteCoupon = async (code:string)=>{ soundFx.playLaser(); const updated=couponsList.filter(c=>c.code!==code); setCouponsList(updated); await api.updateCoupons(updated); setCouponSavedMsg(true); setTimeout(()=>setCouponSavedMsg(false),3000); };
  const handleToggleCouponActive = async (code:string)=>{ soundFx.playClick(); const updated=couponsList.map(c=> c.code===code?{ ...c, active: !(c.active!==false)}:c); setCouponsList(updated); await api.updateCoupons(updated); };
  const handleCopyCoupon = (code:string)=>{ soundFx.playClick(); navigator.clipboard.writeText(code); setCopiedCode(code); setTimeout(()=>setCopiedCode(null),2000); };
  const handleToggleCheckIn = async (passId:string)=>{ soundFx.playSuccess(); await passService.verifyAndCheckInPass(passId, currentUser?.email||'Admin Command'); refreshLivePasses(); };
  const eventPasses = passes.filter(p=> selectedEventFilter==='ALL' ? true : p.eventId===selectedEventFilter || p.eventTitle.toLowerCase().trim()===selectedEventFilter.toLowerCase().trim() );
  const filteredPasses = eventPasses.filter(p=> p.userName.toLowerCase().includes(searchFilter.toLowerCase()) || (p.collegeName&&p.collegeName.toLowerCase().includes(searchFilter.toLowerCase())) || (p.teamName&&p.teamName.toLowerCase().includes(searchFilter.toLowerCase())) || (p.rollNumber&&p.rollNumber.toLowerCase().includes(searchFilter.toLowerCase())) || p.passId.toLowerCase().includes(searchFilter.toLowerCase()) || p.eventTitle.toLowerCase().includes(searchFilter.toLowerCase()) || p.userEmail.toLowerCase().includes(searchFilter.toLowerCase()) );
  const handleExportCSV = ()=>{ soundFx.playClick(); if(!filteredPasses.length) return; const eventName=selectedEventFilter==='ALL' ? 'All_Events' : (eventsList.find(e=>e.id===selectedEventFilter)?.title||selectedEventFilter).replace(/[^a-zA-Z0-9]/g,'_'); const headers=['Pass ID','Name','Email','College','Department','Year','Phone','Event','Reg Type','Team Name','Team Members','Payment ID','Original Amount','Discount','Coupon','Final Fee','Status','CheckIn Time']; const rows=filteredPasses.map(p=>[p.passId,`"${p.userName}"`,p.userEmail,`"${p.collegeName||'PIET'}"`,`"${p.department}"`,p.year,p.phone,`"${p.eventTitle}"`,p.registrationType||'individual',`"${p.teamName||'N/A'}"`,`"${p.teamMembers? p.teamMembers.map(m=>`${m.name} (${m.email})`).join('; '):''}"`,p.paymentId,p.originalAmount||p.amount,p.discountAmount||0,p.couponCode||'None',p.amount,p.status,`"${p.checkedInAt||'Pending'}"`]); const csv='data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e=>e.join(','))].join('\n'); const uri=encodeURI(csv); const a=document.createElement('a'); a.href=uri; a.download=`ECE_Forum_${eventName}_Pass_Roster_${Date.now()}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); };
  const handleExportExcel = ()=>{ soundFx.playClick(); if(!filteredPasses.length) return; const eventName=selectedEventFilter==='ALL' ? 'All_Events' : (eventsList.find(e=>e.id===selectedEventFilter)?.title||selectedEventFilter).replace(/[^a-zA-Z0-9]/g,'_'); const excel=`<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#040711" ss:Pattern="Solid"/></Style><Style ss:ID="Data"><Alignment ss:Vertical="Center"/></Style><Style ss:ID="Currency"><NumberFormat ss:Format="₹#,##0"/></Style><Style ss:ID="CheckedIn"><Font ss:Color="#006600" ss:Bold="1"/><Interior ss:Color="#E6F4EA" ss:Pattern="Solid"/></Style></Styles><Worksheet ss:Name="Attendees"><Table><Row ss:StyleID="Header"><Cell><Data ss:Type="String">Pass ID</Data></Cell><Cell><Data ss:Type="String">Attendee Name</Data></Cell><Cell><Data ss:Type="String">Email</Data></Cell><Cell><Data ss:Type="String">Phone</Data></Cell><Cell><Data ss:Type="String">College</Data></Cell><Cell><Data ss:Type="String">Department</Data></Cell><Cell><Data ss:Type="String">Year</Data></Cell><Cell><Data ss:Type="String">Reg Type</Data></Cell><Cell><Data ss:Type="String">Team Name</Data></Cell><Cell><Data ss:Type="String">Event Title</Data></Cell><Cell><Data ss:Type="String">Payment ID</Data></Cell><Cell><Data ss:Type="String">Fee Paid</Data></Cell><Cell><Data ss:Type="String">Entry Status</Data></Cell><Cell><Data ss:Type="String">Check-In Time</Data></Cell></Row>${filteredPasses.map(p=>`<Row ss:StyleID="Data"><Cell><Data ss:Type="String">${p.passId}</Data></Cell><Cell><Data ss:Type="String">${(p.userName||'').replace(/&/g,'&amp;')}</Data></Cell><Cell><Data ss:Type="String">${p.userEmail||''}</Data></Cell><Cell><Data ss:Type="String">${p.phone||''}</Data></Cell><Cell><Data ss:Type="String">${(p.collegeName||'PIET').replace(/&/g,'&amp;')}</Data></Cell><Cell><Data ss:Type="String">${(p.department||'').replace(/&/g,'&amp;')}</Data></Cell><Cell><Data ss:Type="String">${p.year||''}</Data></Cell><Cell><Data ss:Type="String">${p.registrationType==='team'?'Team':'Individual'}</Data></Cell><Cell><Data ss:Type="String">${(p.teamName||'N/A').replace(/&/g,'&amp;')}</Data></Cell><Cell><Data ss:Type="String">${(p.eventTitle||'').replace(/&/g,'&amp;')}</Data></Cell><Cell><Data ss:Type="String">${p.paymentId||''}</Data></Cell><Cell ss:StyleID="Currency"><Data ss:Type="Number">${p.amount||0}</Data></Cell><Cell ss:StyleID="${p.status==='CHECKED_IN'?'CheckedIn':'Data'}"><Data ss:Type="String">${p.status==='CHECKED_IN'?'Checked In':'Confirmed'}</Data></Cell><Cell><Data ss:Type="String">${p.checkedInAt||'Pending'}</Data></Cell></Row>`).join('')}</Table></Worksheet></Workbook>`; const blob=new Blob([excel],{type:'application/vnd.ms-excel'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`ECE_Forum_${eventName}_Roster_${Date.now()}.xls`; document.body.appendChild(a); a.click(); document.body.removeChild(a); };
  const totalRevenue = passes.reduce((a,p)=>a+(p.amount||0),0);
  const totalCheckedIn = passes.filter(p=>p.status==='CHECKED_IN').length;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#08080A] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#CCFF00]/5 via-transparent to-[#7000FF]/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[480px] bg-[#CCFF00]/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-[440px] rounded-[32px] bg-[#0F0F0F] border border-white/10 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent opacity-60" />
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#CCFF00] text-black grid place-items-center mx-auto shadow-[0_0_30px_rgba(204,255,0,0.35)]"><Shield className="w-7 h-7" /></div>
            <h1 className="font-display font-black text-2xl tracking-tight">PIET ECE COUNCIL</h1>
            <p className="text-xs font-mono tracking-widest text-[#CCFF00]">Admin Command Studio</p>
          </div>
          <div className="mt-8">
            <AdminLogin onLoginSuccess={(u)=>setCurrentUser(u)} />
          </div>
          <Link to="/" className="mt-6 flex items-center justify-center gap-2 text-xs font-mono text-white/40 hover:text-white transition-colors"><ArrowLeft className="w-3 h-3" /> Return to Website</Link>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity, count: null },
    { id: 'events', label: 'Events', icon: Calendar, count: eventsList.length },
    { id: 'registrations', label: 'Passes', icon: Users, count: passes.length },
    { id: 'coupons', label: 'Coupons', icon: Tag, count: couponsList.length },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon, count: galleryDraft.length },
    { id: 'siteContent', label: 'Site', icon: Sliders, count: null },
    { id: 'announcements', label: 'Broadcast', icon: Bell, count: null },
    { id: 'admins', label: 'Admins', icon: Shield, count: adminsList.length },
  ] as const;

  return (
    <div className="min-h-screen bg-[#08080A] text-white relative selection:bg-[#CCFF00] selection:text-black">
      <div className="grain" aria-hidden />
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#08080A]/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-mono"><ArrowLeft className="w-3.5 h-3.5" /> Website</Link>
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#CCFF00] text-black grid place-items-center font-black">◈</div>
              <div><div className="font-display font-black text-sm leading-none">ADMIN STUDIO</div><div className="text-[11px] font-mono text-white/40">PIET ECE • SPACE × SINC</div></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/60"><span className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse" /> {passes.length} passes • ₹{totalRevenue.toLocaleString()} revenue</div>
            <div className="hidden sm:flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-white/5 border border-white/10">
              <div className="w-7 h-7 rounded-full bg-[#CCFF00] text-black grid place-items-center font-black text-xs">{currentUser.email[0].toUpperCase()}</div>
              <span className="text-xs font-bold pr-1 hidden lg:inline max-w-[120px] truncate">{currentUser.email}</span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-[#CCFF00] text-black font-black hidden lg:inline">{currentUser.role}</span>
            </div>
            <button onClick={()=>setCurrentUser(null)} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 grid place-items-center hover:bg-white hover:text-black transition-colors"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          {/* Sidebar — premium glass */}
          <aside className="lg:sticky lg:top-[80px] h-fit">
            <div className="rounded-[24px] bg-[#0F0F0F] border border-white/10 p-2 hidden lg:block">
              <div className="px-3 py-3">
                <div className="text-[11px] font-mono tracking-widest text-white/30">COMMAND NAV</div>
                <div className="text-xs font-mono text-white/50">All admin features</div>
              </div>
              <nav className="space-y-1">
                {tabs.map(t => {
                  const Icon = t.icon;
                  const active = activeTab === t.id;
                  return (
                    <button key={t.id} onClick={()=>{ soundFx.playClick(); setActiveTab(t.id as any)}} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-[#CCFF00] text-black font-black shadow-[0_0_20px_rgba(204,255,0,0.25)]' : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'}`}>
                      <Icon className={`w-4 h-4 ${active ? 'text-black' : 'text-white/40 group-hover:text-white'}`} />
                      <span className="flex-1 text-left">{t.label}</span>
                      {t.count !== null && <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${active ? 'bg-black text-white' : 'bg-white/10 text-white/60'}`}>{t.count}</span>}
                    </button>
                  );
                })}
              </nav>
              <div className="mt-4 p-3 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/20">
                <div className="text-xs font-black flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-[#CCFF00]" /> Premium Admin</div>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">Lime • Glass • Motion — matches main site.</p>
              </div>
            </div>
            {/* Mobile pills */}
            <div className="flex lg:hidden gap-2 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-2 -mx-4 px-4">
              {tabs.map(t => {
                const Icon = t.icon; const active = activeTab===t.id;
                return <button key={t.id} onClick={()=>setActiveTab(t.id as any)} className={`snap-start shrink-0 flex items-center gap-2 px-4 py-3 rounded-full text-xs font-bold whitespace-nowrap border ${active ? 'bg-[#CCFF00] text-black border-[#CCFF00]' : 'bg-white/5 border-white/10 text-white/60'}`}><Icon className="w-3.5 h-3.5" />{t.label}</button>
              })}
            </div>
          </aside>

          {/* Main */}
          <main className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: [0.16,1,0.3,1] }} className="rounded-[24px] bg-[#0F0F0F] border border-white/10 overflow-hidden">
                {/* Content header */}
                <div className="p-6 sm:p-7 border-b border-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display font-black text-xl sm:text-2xl flex items-center gap-2">
                        {activeTab === 'overview' && <><Activity className="w-5 h-5 text-[#CCFF00]" /> Overview & Analytics</>}
                        {activeTab === 'events' && <><Calendar className="w-5 h-5 text-[#CCFF00]" /> Event Suite — {eventsList.length}</>}
                        {activeTab === 'registrations' && <><Users className="w-5 h-5 text-[#CCFF00]" /> Pass Roster — {filteredPasses.length}/{passes.length}</>}
                        {activeTab === 'coupons' && <><Tag className="w-5 h-5 text-[#FFB800]" /> Coupons — {couponsList.length}</>}
                        {activeTab === 'gallery' && <><ImageIcon className="w-5 h-5 text-[#CCFF00]" /> Photo Archive — {galleryDraft.length}</>}
                        {activeTab === 'siteContent' && <><Sliders className="w-5 h-5 text-[#CCFF00]" /> Hero & Flagship</>}
                        {activeTab === 'announcements' && <><Bell className="w-5 h-5 text-[#CCFF00]" /> Live Broadcast</>}
                        {activeTab === 'admins' && <><Shield className="w-5 h-5 text-[#CCFF00]" /> Council Admins — {adminsList.length}</>}
                      </h2>
                      <p className="text-xs font-mono text-white/40 mt-1">
                        {activeTab === 'overview' && `${totalCheckedIn}/${passes.length} checked in • ₹${totalRevenue.toLocaleString()} revenue`}
                        {activeTab === 'events' && `Create, edit, delete • participation individual/team/both`}
                        {activeTab === 'registrations' && `Search, filter, verify, export CSV/XLS`}
                        {activeTab === 'coupons' && `Percentage / flat • expiry • usage limit`}
                        {activeTab === 'gallery' && `Bento archive • drag to reorder • live preview`}
                        {activeTab === 'siteContent' && `Eyebrow, flagship, countdown • live preview`}
                        {activeTab === 'announcements' && `Ticker broadcast • synced via Supabase`}
                        {activeTab === 'admins' && `Create / delete organizers • Supabase RLS`}
                      </p>
                    </div>
                    {activeTab === 'events' && <button onClick={()=>setShowEventForm(!showEventForm)} className="px-4 py-2.5 rounded-full bg-[#CCFF00] text-black font-black text-xs flex items-center gap-2 hover:bg-white transition-colors"><Plus className="w-4 h-4" />{showEventForm ? 'Close' : 'New Event'}</button>}
                    {activeTab === 'coupons' && <button onClick={()=>{ setEditingCouponCode(null); setCouponFormData({ code:'', discountType:'percentage', discountValue:20, description:'', active:true, usedCount:0, validUntil:'', validFrom:'' }); setShowCouponForm(!showCouponForm)}} className="px-4 py-2.5 rounded-full bg-[#FFB800] text-black font-black text-xs flex items-center gap-2"><Plus className="w-4 h-4" />{showCouponForm?'Close':'New Coupon'}</button>}
                    {activeTab === 'gallery' && <button onClick={()=>setIsAddingGallery(!isAddingGallery)} className="px-4 py-2.5 rounded-full bg-white text-black font-black text-xs flex items-center gap-2"><Plus className="w-4 h-4" />{isAddingGallery?'Close':'Add Image'}</button>}
                    {activeTab === 'admins' && <button onClick={()=>setShowAdminForm(!showAdminForm)} className="px-4 py-2.5 rounded-full bg-white text-black font-black text-xs flex items-center gap-2"><Plus className="w-4 h-4" />{showAdminForm?'Close':'New Admin'}</button>}
                  </div>
                </div>

                <div className="p-6 sm:p-7">
                  {/* OVERVIEW */}
                  {activeTab === 'overview' && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Passes', value: passes.length, sub: `${totalCheckedIn} checked in`, icon: Users, color: '#CCFF00' },
                        { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, sub: `${passes.length} passes`, icon: TrendingUp, color: '#00D9FF' },
                        { label: 'Events', value: eventsList.length, sub: `${eventsList.filter(e=>e.status==='Upcoming').length} upcoming`, icon: Calendar, color: '#FFB800' },
                        { label: 'Admins', value: adminsList.length, sub: 'organizers', icon: Shield, color: '#7000FF' },
                      ].map(s => {
                        const Icon=s.icon;
                        return <div key={s.label} className="rounded-[20px] bg-[#111] border border-white/10 p-5"><div className="flex justify-between items-start"><span className="text-[11px] font-mono tracking-widest text-white/40">{s.label}</span><span className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 grid place-items-center"><Icon className="w-4 h-4" style={{color:s.color}} /></span></div><div className="font-display font-black text-2xl mt-3">{s.value}</div><div className="text-xs text-white/40 mt-1">{s.sub}</div></div>
                      })}
                      <div className="sm:col-span-2 lg:col-span-4 rounded-[20px] bg-[#111] border border-white/10 p-5">
                        <div className="text-xs font-mono tracking-widest text-white/40 mb-2">CHECK-IN PROGRESS</div>
                        <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5"><div className="h-full bg-[#CCFF00] rounded-full" style={{width: `${passes.length? Math.round(totalCheckedIn/passes.length*100):0}%`}} /></div>
                        <div className="text-xs text-white/40 mt-2">{totalCheckedIn}/{passes.length} • {passes.length? Math.round(totalCheckedIn/passes.length*100):0}%</div>
                      </div>
                    </div>
                  )}

                  {/* EVENTS */}
                  {activeTab === 'events' && (
                    <div className="space-y-6">
                      {showEventForm && (
                        <form onSubmit={handleFormSubmit} className="p-5 bg-[#111] rounded-[20px] border border-white/10 space-y-4">
                          <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
                            <label className="space-y-1"><span className="text-white/60">Title *</span><input required value={newEvent.title} onChange={e=>setNewEvent({...newEvent, title:e.target.value})} placeholder="Autonomous Robotics Hackathon" className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/10 text-white focus:border-[#CCFF00]/40 outline-none" /></label>
                            <label className="space-y-1"><span className="text-white/60">Category</span><select value={newEvent.category} onChange={e=>setNewEvent({...newEvent, category:e.target.value as any})} className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/10 text-white focus:border-[#CCFF00]/40 outline-none"><option>Workshop</option><option>Installation</option><option>Hackathon</option><option>Webinar</option><option>Cultural</option></select></label>
                            <label className="space-y-1"><span className="text-white/60">Participation</span><select value={newEvent.participationType} onChange={e=>setNewEvent({...newEvent, participationType:e.target.value as any})} className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/10 text-white"><option value="both">Both</option><option value="individual_only">Individual Only</option><option value="team_only">Team Only</option></select></label>
                            <label className="space-y-1"><span className="text-white/60">Price ₹</span><input type="number" value={newEvent.price} onChange={e=>setNewEvent({...newEvent, price:Number(e.target.value)})} className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/10 text-white" /></label>
                            <label className="space-y-1"><span className="text-white/60">Date</span><input value={newEvent.date} onChange={e=>setNewEvent({...newEvent, date:e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/10 text-white" /></label>
                            <label className="space-y-1"><span className="text-white/60">Time</span><input value={newEvent.time} onChange={e=>setNewEvent({...newEvent, time:e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/10 text-white" /></label>
                            <label className="space-y-1 sm:col-span-2"><span className="text-white/60">Venue</span><input value={newEvent.venue} onChange={e=>setNewEvent({...newEvent, venue:e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/10 text-white" /></label>
                            <label className="space-y-1 sm:col-span-2"><span className="text-white/60">Description</span><textarea value={newEvent.description} onChange={e=>setNewEvent({...newEvent, description:e.target.value})} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/10 text-white" /></label>
                            <label className="space-y-1 sm:col-span-2"><span className="text-white/60">Banner Image URL or Upload</span><div className="flex gap-2"><input value={newEvent.image} onChange={e=>setNewEvent({...newEvent, image:e.target.value})} placeholder="/event_images/tarang.webp or https://..." className="flex-1 px-3 py-2.5 rounded-xl bg-black border border-white/10 text-white" /><button type="button" onClick={()=>fileInputRef.current?.click()} className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70"><Upload className="w-4 h-4" /></button><input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" /></div><div className="flex flex-wrap gap-1.5 mt-2">{PRESET_BANNERS.map(p=> <button key={p.id} type="button" onClick={()=>setNewEvent({...newEvent, image:p.url})} className={`px-2.5 py-1 rounded-full text-[11px] border ${newEvent.image===p.url?'bg-[#CCFF00] text-black border-[#CCFF00]':'bg-white/5 border-white/10 text-white/60'}`}>{p.label}</button>)}</div></label>
                          </div>
                          <div className="flex justify-end gap-2"><button type="button" onClick={()=>{setShowEventForm(false); setEditingEventId(null)}} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs">Cancel</button><button type="submit" className="px-6 py-2.5 rounded-full bg-[#CCFF00] text-black font-black text-xs">{editingEventId?'Save Updates':'Publish Event'}</button></div>
                        </form>
                      )}
                      <div className="grid gap-3">
                        {eventsList.map(evt=>(
                          <div key={evt.id} className="p-4 rounded-[16px] bg-[#111] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex gap-3 min-w-0">
                              <img src={evt.image||'/event_images/tarang.webp'} alt={evt.title} className="w-16 h-12 rounded-xl object-cover border border-white/10 shrink-0" />
                              <div className="min-w-0"><div className="flex flex-wrap gap-1.5"><span className="text-[10px] px-2 py-0.5 rounded-full bg-[#CCFF00]/15 text-[#CCFF00] font-bold">{evt.category}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">{evt.date} • {evt.venue}</span></div><h4 className="font-bold text-sm truncate pr-2">{evt.title}</h4><p className="text-xs text-white/50">₹{evt.price} • {evt.participationType}</p></div>
                            </div>
                            <div className="flex gap-2 self-end sm:self-auto">
                              <button onClick={()=>handleEditEventInit(evt)} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 grid place-items-center hover:bg-white hover:text-black transition-colors"><Edit3 className="w-4 h-4" /></button>
                              <button onClick={()=>handleDeleteEvent(evt.id)} className="w-9 h-9 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] grid place-items-center hover:bg-[#FF3B30] hover:text-white transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* REGISTRATIONS */}
                  {activeTab === 'registrations' && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <select value={selectedEventFilter} onChange={e=>setSelectedEventFilter(e.target.value)} className="px-3 py-2 rounded-full bg-black border border-white/10 text-xs font-mono text-white">
                          <option value="ALL">All Events ({passes.length})</option>
                          {eventsList.map(e=> <option key={e.id} value={e.id}>{e.title} ({passes.filter(p=>p.eventId===e.id).length})</option>)}
                        </select>
                        <div className="relative flex-1 min-w-[180px]">
                          <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input value={searchFilter} onChange={e=>setSearchFilter(e.target.value)} placeholder="Search name, email, college, pass ID" className="w-full pl-9 pr-3 py-2 rounded-full bg-black border border-white/10 text-xs text-white placeholder:text-white/30 focus:border-[#CCFF00]/40 outline-none" />
                        </div>
                        <button onClick={handleExportCSV} className="px-3 py-2 rounded-full bg-white text-black font-bold text-xs flex items-center gap-1.5"><FileSpreadsheet className="w-3.5 h-3.5" /> CSV</button>
                        <button onClick={handleExportExcel} className="px-3 py-2 rounded-full bg-[#CCFF00] text-black font-bold text-xs flex items-center gap-1.5"><FileDown className="w-3.5 h-3.5" /> XLS</button>
                      </div>
                      <div className="rounded-[16px] bg-[#111] border border-white/10 overflow-hidden">
                        <div className="max-h-[420px] overflow-auto">
                          <table className="w-full text-xs">
                            <thead className="sticky top-0 bg-[#0F0F0F] border-b border-white/10 text-[11px] font-mono tracking-widest text-white/40">
                              <tr><th className="text-left p-3">Attendee</th><th className="text-left p-3">Event</th><th className="text-left p-3">Status</th><th className="text-right p-3">Actions</th></tr>
                            </thead>
                            <tbody>
                              {filteredPasses.slice(0,100).map(p=>(
                                <tr key={p.passId} className="border-b border-white/5 hover:bg-white/[0.02]">
                                  <td className="p-3"><div className="font-bold">{p.userName}</div><div className="text-white/40 font-mono text-[11px]">{p.userEmail} • {p.passId}</div></td>
                                  <td className="p-3"><div className="truncate max-w-[180px]">{p.eventTitle}</div><div className="text-white/30 text-[11px]">{p.collegeName}</div></td>
                                  <td className="p-3"><span className={`px-2 py-1 rounded-full text-[11px] font-bold ${p.status==='CHECKED_IN'?'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30':'bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/20'}`}>{p.status}</span></td>
                                  <td className="p-3 text-right"><button onClick={()=>handleToggleCheckIn(p.passId)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${p.status==='CHECKED_IN'?'bg-white/10 text-white/60':'bg-[#CCFF00] text-black'}`}>{p.status==='CHECKED_IN'?'Undo':'Check-In'}</button></td>
                                </tr>
                              ))}
                              {filteredPasses.length===0 && <tr><td colSpan={4} className="p-8 text-center text-white/30 font-mono">No passes found</td></tr>}
                            </tbody>
                          </table>
                        </div>
                        <div className="p-3 border-t border-white/10 flex justify-between text-xs font-mono text-white/40">
                          <span>Showing {Math.min(100, filteredPasses.length)}/{filteredPasses.length} • {eventPasses.length} for event • ₹{currentEventRevenue.toLocaleString()} revenue • {currentEventCheckedIn}/{eventPasses.length} checked</span>
                          <span>{filteredPasses.length>100 && 'First 100 only — export for full'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COUPONS */}
                  {activeTab === 'coupons' && (
                    <div className="space-y-4">
                      {couponSavedMsg && <div className="p-3 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] text-xs font-mono flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Coupons synced</div>}
                      {showCouponForm && (
                        <form onSubmit={handleSaveCoupon} className="p-4 rounded-[16px] bg-[#111] border border-[#FFB800]/30 space-y-3">
                          <div className="grid sm:grid-cols-3 gap-3 text-xs">
                            <label className="space-y-1"><span className="text-white/60">Code *</span><input required value={couponFormData.code} onChange={e=>setCouponFormData({...couponFormData, code:e.target.value.toUpperCase()})} placeholder="TARANGGOLD" className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white uppercase" /></label>
                            <label className="space-y-1"><span className="text-white/60">Type</span><select value={couponFormData.discountType} onChange={e=>setCouponFormData({...couponFormData, discountType:e.target.value as any})} className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white"><option value="percentage">Percentage</option><option value="flat">Flat ₹</option></select></label>
                            <label className="space-y-1"><span className="text-white/60">Value</span><input type="number" value={couponFormData.discountValue} onChange={e=>setCouponFormData({...couponFormData, discountValue:Number(e.target.value)})} className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white" /></label>
                            <label className="space-y-1 sm:col-span-3"><span className="text-white/60">Description</span><input value={couponFormData.description} onChange={e=>setCouponFormData({...couponFormData, description:e.target.value})} placeholder="20% off for ECE" className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white" /></label>
                            <label className="space-y-1"><span className="text-white/60">Limit</span><input type="number" value={couponFormData.usageLimit||''} onChange={e=>setCouponFormData({...couponFormData, usageLimit:e.target.value?Number(e.target.value):undefined})} placeholder="100" className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white" /></label>
                            <label className="space-y-1"><span className="text-white/60">Valid Until</span><input type="date" value={couponFormData.validUntil||''} onChange={e=>setCouponFormData({...couponFormData, validUntil:e.target.value})} className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white" /></label>
                            <label className="space-y-1"><span className="text-white/60">Active</span><select value={couponFormData.active? '1':'0'} onChange={e=>setCouponFormData({...couponFormData, active:e.target.value==='1'})} className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white"><option value="1">Active</option><option value="0">Disabled</option></select></label>
                          </div>
                          <div className="flex justify-end gap-2"><button type="button" onClick={()=>setShowCouponForm(false)} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs">Cancel</button><button type="submit" className="px-6 py-2 rounded-full bg-[#CCFF00] text-black font-black text-xs">{editingCouponCode?'Update':'Create'} Coupon</button></div>
                        </form>
                      )}
                      <div className="grid sm:grid-cols-2 gap-3">
                        {couponsList.map(c=>(
                          <div key={c.code} className="p-4 rounded-[16px] bg-[#111] border border-white/10 flex flex-col gap-3">
                            <div className="flex justify-between items-start gap-2"><span className="font-mono font-black px-3 py-1 rounded-full bg-white text-black text-sm flex items-center gap-2">{c.code} <button onClick={()=>handleCopyCoupon(c.code)} className="w-6 h-6 rounded-full bg-black/5 grid place-items-center hover:bg-black hover:text-white transition-colors">{copiedCode===c.code?<Check className="w-3 h-3 text-[#00FF88]" />:<Copy className="w-3 h-3" />}</button></span><span className={`text-xs px-2 py-1 rounded-full font-bold ${c.active!==false?'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30':'bg-white/10 text-white/40'}`}>{c.active!==false?'Active':'Disabled'}</span></div>
                            <p className="text-xs text-white/60">{c.description || 'No description'}</p>
                            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono"><span className="px-2 py-1 rounded-full bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/20">{c.discountType==='percentage'? c.discountValue+'%':'₹'+c.discountValue} off</span><span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">{c.usedCount||0}/{c.usageLimit||'∞'} used</span><span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">{c.validUntil||'No expiry'}</span></div>
                            <div className="flex gap-2 pt-2 border-t border-white/5"><button onClick={()=>handleEditCouponInit(c)} className="flex-1 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-1"><Edit3 className="w-3 h-3" /> Edit</button><button onClick={()=>handleDeleteCoupon(c.code)} className="px-3 py-2 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white transition-colors"><Trash2 className="w-4 h-4" /></button><button onClick={()=>handleToggleCouponActive(c.code)} className={`px-3 py-2 rounded-full text-xs font-bold border ${c.active!==false?'bg-white/5 border-white/10 text-white/60':'bg-[#00FF88]/15 border-[#00FF88]/30 text-[#00FF88]'}`}>{c.active!==false?'Disable':'Enable'}</button></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GALLERY */}
                  {activeTab === 'gallery' && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {PRESET_GALLERY_IMAGES.map(p=> <button key={p.url} onClick={()=>{ setGalleryForm({ title:p.label, category:p.cat, type:'image', url:p.url, caption: p.label }); setIsAddingGallery(true)}} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs hover:bg-white hover:text-black transition-colors">{p.label}</button>)}
                      </div>
                      {isAddingGallery && (
                        <form onSubmit={async (e)=>{ e.preventDefault(); const newItem:GalleryItem={ id:`ARCH-${Date.now()}`, title:galleryForm.title||'Untitled', category:galleryForm.category, type:galleryForm.type, url:galleryForm.url||'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80', caption: galleryForm.caption||galleryForm.title }; let updated:GalleryItem[]; if(editingGalleryId){ updated=galleryDraft.map(g=> g.id===editingGalleryId? {...newItem, id:editingGalleryId}:g); setEditingGalleryId(null); } else { updated=[newItem, ...galleryDraft]; } setGalleryDraft(updated); await onUpdateGallery(updated); setIsAddingGallery(false); setGalleryForm({ title:'', category:'Workshop', type:'image', url:'', caption:'' }); setGallerySavedMsg(true); setTimeout(()=>setGallerySavedMsg(false),2500); }} className="p-4 rounded-[16px] bg-[#111] border border-white/10 space-y-3">
                          <div className="grid sm:grid-cols-2 gap-3 text-xs">
                            <label className="space-y-1"><span className="text-white/60">Title</span><input required value={galleryForm.title} onChange={e=>setGalleryForm({...galleryForm, title:e.target.value})} placeholder="e.g. Robotics Expo" className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white" /></label>
                            <label className="space-y-1"><span className="text-white/60">Category</span><select value={galleryForm.category} onChange={e=>setGalleryForm({...galleryForm, category:e.target.value})} className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white"><option>Workshop</option><option>Hackathon</option><option>Project Expo</option><option>Industrial Visit</option></select></label>
                            <label className="space-y-1 sm:col-span-2"><span className="text-white/60">Image URL</span><input required value={galleryForm.url} onChange={e=>setGalleryForm({...galleryForm, url:e.target.value})} placeholder="https://..." className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white" /></label>
                            <label className="space-y-1 sm:col-span-2"><span className="text-white/60">Caption</span><input value={galleryForm.caption} onChange={e=>setGalleryForm({...galleryForm, caption:e.target.value})} placeholder="Short caption" className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white" /></label>
                          </div>
                          <div className="flex justify-end gap-2"><button type="button" onClick={()=>{ setIsAddingGallery(false); setEditingGalleryId(null); }} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs">Cancel</button><button type="submit" className="px-6 py-2 rounded-full bg-[#CCFF00] text-black font-black text-xs">{editingGalleryId?'Update':'Add'} Image</button></div>
                        </form>
                      )}
                      {gallerySavedMsg && <div className="p-2 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] text-xs font-mono flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Gallery saved & live!</div>}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[520px] overflow-auto p-1">
                        {galleryDraft.map(g=>(
                          <div key={g.id} className="group relative rounded-[16px] overflow-hidden bg-[#111] border border-white/10">
                            <img src={g.url} alt={g.title} className="w-full h-32 object-cover" />
                            <div className="p-3"><div className="text-xs font-bold truncate">{g.title}</div><div className="text-[11px] text-white/40">{g.category} • {g.id}</div></div>
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={()=>{ setEditingGalleryId(g.id); setGalleryForm({ title:g.title, category:g.category, type:g.type, url:g.url, caption:g.caption }); setIsAddingGallery(true); }} className="w-7 h-7 rounded-full bg-white text-black grid place-items-center hover:bg-[#CCFF00]"><Edit3 className="w-3.5 h-3.5" /></button>
                              <button onClick={async()=>{ const updated=galleryDraft.filter(x=>x.id!==g.id); setGalleryDraft(updated); await onUpdateGallery(updated); }} className="w-7 h-7 rounded-full bg-[#FF3B30] text-white grid place-items-center hover:bg-white hover:text-[#FF3B30] border border-white/10"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end"><button onClick={async()=>{ await onUpdateGallery(galleryDraft); setGallerySavedMsg(true); setTimeout(()=>setGallerySavedMsg(false),2000); }} className="px-6 py-2 rounded-full bg-white text-black font-black text-xs hover:bg-[#CCFF00] transition-colors">Publish Gallery Live →</button></div>
                    </div>
                  )}

                  {/* SITE CONTENT */}
                  {activeTab === 'siteContent' && (
                    <div className="space-y-6">
                      <div className="grid lg:grid-cols-2 gap-6">
                        <div className="space-y-3 p-4 rounded-[16px] bg-[#111] border border-white/10">
                          <h4 className="font-bold text-sm flex items-center gap-2"><Sliders className="w-4 h-4 text-[#CCFF00]" /> Hero Eyebrow & Flagship</h4>
                          <label className="space-y-1 block text-xs"><span className="text-white/60">Session</span><input value={heroConfigDraft.heroSession} onChange={e=>setHeroConfigDraft({...heroConfigDraft, heroSession:e.target.value})} className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white" /></label>
                          <label className="space-y-1 block text-xs"><span className="text-white/60">Forum Title</span><input value={heroConfigDraft.heroForumTitle} onChange={e=>setHeroConfigDraft({...heroConfigDraft, heroForumTitle:e.target.value})} className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white" /></label>
                          <label className="space-y-1 block text-xs"><span className="text-white/60">Flagship Title</span><input value={heroConfigDraft.flagshipTitle} onChange={e=>setHeroConfigDraft({...heroConfigDraft, flagshipTitle:e.target.value})} className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white" /></label>
                          <label className="space-y-1 block text-xs"><span className="text-white/60">SubTitle</span><input value={heroConfigDraft.flagshipSubTitle} onChange={e=>setHeroConfigDraft({...heroConfigDraft, flagshipSubTitle:e.target.value})} className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white" /></label>
                          <label className="space-y-1 block text-xs"><span className="text-white/60">Description</span><textarea value={heroConfigDraft.flagshipDescription} onChange={e=>setHeroConfigDraft({...heroConfigDraft, flagshipDescription:e.target.value})} rows={2} className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white" /></label>
                          <label className="space-y-1 block text-xs"><span className="text-white/60">Target Date (YYYY-MM-DDTHH:mm:ss)</span><input value={heroConfigDraft.flagshipTargetDate} onChange={e=>setHeroConfigDraft({...heroConfigDraft, flagshipTargetDate:e.target.value})} placeholder="2026-08-30T10:00:00" className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white font-mono text-xs" /></label>
                          <label className="space-y-1 block text-xs"><span className="text-white/60">Venue</span><input value={heroConfigDraft.flagshipTargetVenue} onChange={e=>setHeroConfigDraft({...heroConfigDraft, flagshipTargetVenue:e.target.value})} className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white" /></label>
                          <label className="space-y-1 block text-xs"><span className="text-white/60">Button Text</span><input value={heroConfigDraft.flagshipButtonText} onChange={e=>setHeroConfigDraft({...heroConfigDraft, flagshipButtonText:e.target.value})} className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white" /></label>
                          <button onClick={async()=>{ await onUpdateHeroConfig(heroConfigDraft); setSiteConfigSavedMsg(true); setTimeout(()=>setSiteConfigSavedMsg(false),3000); }} className="w-full py-2.5 rounded-full bg-[#CCFF00] text-black font-black text-xs">Save Hero & Flagship Live →</button>
                          {siteConfigSavedMsg && <div className="text-xs text-[#00FF88] font-mono flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Saved & live on homepage!</div>}
                        </div>
                        <div className="p-4 rounded-[16px] bg-[#111] border border-white/10 space-y-3">
                          <h4 className="font-bold text-sm">Live Preview</h4>
                          <div className="rounded-[16px] bg-black border border-white/10 p-4 space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-[10px] font-mono font-bold">{heroConfigDraft.flagshipBadge}</div>
                            <h3 className="font-display font-black text-lg leading-tight">{heroConfigDraft.flagshipTitle} <span className="text-[#FFB800]">{heroConfigDraft.flagshipSubTitle}</span></h3>
                            <p className="text-xs text-white/60">{heroConfigDraft.flagshipDescription}</p>
                            <div className="flex gap-2 text-[11px] font-mono"><span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">{heroConfigDraft.flagshipTargetDate}</span><span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">{heroConfigDraft.flagshipTargetVenue}</span></div>
                            <div className="grid grid-cols-4 gap-2 pt-2">
                              <div className="text-center"><div className="text-[10px] text-white/40">DAYS</div><div className="text-lg font-black bg-white/5 border border-white/10 rounded-xl py-2">{String(adminCountdown.days).padStart(2,'0')}</div></div>
                              <div className="text-center"><div className="text-[10px] text-white/40">HOURS</div><div className="text-lg font-black bg-white/5 border border-white/10 rounded-xl py-2">{String(adminCountdown.hours).padStart(2,'0')}</div></div>
                              <div className="text-center"><div className="text-[10px] text-white/40">MINS</div><div className="text-lg font-black bg-white/5 border border-white/10 rounded-xl py-2">{String(adminCountdown.minutes).padStart(2,'0')}</div></div>
                              <div className="text-center"><div className="text-[10px] text-[#CCFF00]">SECS</div><div className="text-lg font-black bg-[#CCFF00] text-black rounded-xl py-2">{String(adminCountdown.seconds).padStart(2,'0')}</div></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ANNOUNCEMENTS */}
                  {activeTab === 'announcements' && (
                    <form onSubmit={handleBroadcastAnnouncement} className="space-y-4">
                      <div className="p-4 rounded-[16px] bg-[#111] border border-white/10 space-y-3">
                        <h4 className="font-bold text-sm flex items-center gap-2"><Bell className="w-4 h-4 text-[#CCFF00]" /> Live Ticker Broadcast</h4>
                        <textarea value={announcementText} onChange={e=>setAnnouncementText(e.target.value)} rows={3} placeholder="Registration Open for..." className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white text-sm focus:border-[#CCFF00]/40 outline-none" />
                        <button type="submit" className="px-6 py-2.5 rounded-full bg-[#CCFF00] text-black font-black text-xs flex items-center gap-2"><Sparkles className="w-4 h-4" /> Broadcast Live →</button>
                        {announcementSaved && <div className="text-xs text-[#00FF88] font-mono">Broadcast updated & live on ticker!</div>}
                      </div>
                      <div className="p-4 rounded-[16px] bg-[#111] border border-white/10">
                        <div className="text-xs font-mono text-white/40 mb-2">Preview ticker:</div>
                        <div className="overflow-hidden rounded-full bg-black border border-white/10 py-2">
                          <div className="flex whitespace-nowrap animate-marquee" style={{width:'max-content'}}><span className="px-6 text-xs font-mono text-white/70">{announcementText}</span><span className="px-6 text-xs font-mono text-white/70">{announcementText}</span></div>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* ADMINS */}
                  {activeTab === 'admins' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm">Organizer Accounts — {adminsList.length}</h4>
                        <button onClick={()=>setShowAdminForm(!showAdminForm)} className="px-4 py-2 rounded-full bg-white text-black font-black text-xs">{showAdminForm?'Close':'New Admin'}</button>
                      </div>
                      {showAdminForm && (
                        <form onSubmit={handleAddAdmin} className="p-4 rounded-[16px] bg-[#111] border border-white/10 grid sm:grid-cols-2 gap-3 text-xs">
                          <label className="space-y-1"><span className="text-white/60">Name</span><input required value={newAdminData.name} onChange={e=>setNewAdminData({...newAdminData, name:e.target.value})} placeholder="Alex" className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white" /></label>
                          <label className="space-y-1"><span className="text-white/60">Email</span><input required type="email" value={newAdminData.email} onChange={e=>setNewAdminData({...newAdminData, email:e.target.value})} placeholder="admin@ece.com" className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white" /></label>
                          <label className="space-y-1"><span className="text-white/60">Password</span><input required type="password" value={newAdminData.password} onChange={e=>setNewAdminData({...newAdminData, password:e.target.value})} placeholder="••••" className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white" /></label>
                          <label className="space-y-1"><span className="text-white/60">Role</span><input value={newAdminData.role} onChange={e=>setNewAdminData({...newAdminData, role:e.target.value})} className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white" /></label>
                          <button type="submit" className="sm:col-span-2 py-2.5 rounded-full bg-[#CCFF00] text-black font-black text-xs">Create Admin</button>
                        </form>
                      )}
                      <div className="grid gap-2">
                        {adminsList.map(a=>(
                          <div key={a.id} className="p-3 rounded-[16px] bg-[#111] border border-white/10 flex justify-between items-center">
                            <div><div className="font-bold text-sm">{a.name}</div><div className="text-xs font-mono text-white/40">{a.email} • {a.role}</div></div>
                            <button onClick={()=>handleDeleteAdmin(a.id)} className="w-8 h-8 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] grid place-items-center hover:bg-[#FF3B30] hover:text-white transition-colors"><Trash2 className="w-4 h-4" /></button>
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
    </div>
  );
};
