import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  Award,
  Upload,
  Download,
  Mail,
  Send,
  Sparkles,
  Settings,
  Edit3,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Plus,
  Users,
  Eye,
  FileSpreadsheet,
  Save,
  Check,
  X,
  Type,
  Maximize2,
  Minimize2,
  HelpCircle,
  FileText,
  ChevronRight,
  ShieldCheck,
  Database,
  ExternalLink,
} from 'lucide-react';
import { type EventItem } from './EventsSection';
import { forumApi, type ApiCertificate, type CertificateType } from '../services/api';
import { soundFx } from '../utils/audio';
import { passService } from '../services/passService';
import { certificateService } from '../services/certificateService';

export const HONOR_PRESETS = [
  {
    type: 'PARTICIPATION' as CertificateType,
    label: '✦ Participation',
    defaultTitle: 'Certificate of Participation',
    defaultRank: 'Participant',
    badgeColor: 'border-cyan-400/40 text-cyan-300 bg-cyan-500/10',
  },
  {
    type: 'WINNER_1ST' as CertificateType,
    label: '🏆 1st Winner',
    defaultTitle: 'Certificate of Excellence & Winner (1st Place)',
    defaultRank: 'Winner (1st Place)',
    badgeColor: 'border-yellow-400/50 text-yellow-300 bg-yellow-500/15',
  },
  {
    type: 'RUNNER_UP_2ND' as CertificateType,
    label: '🥈 1st Runner Up',
    defaultTitle: 'Certificate of Merit & 1st Runner Up',
    defaultRank: '1st Runner Up (2nd Place)',
    badgeColor: 'border-slate-300/50 text-slate-200 bg-slate-400/15',
  },
  {
    type: 'RUNNER_UP_3RD' as CertificateType,
    label: '🥉 2nd Runner Up',
    defaultTitle: 'Certificate of Merit & 2nd Runner Up',
    defaultRank: '2nd Runner Up (3rd Place)',
    badgeColor: 'border-amber-600/50 text-amber-400 bg-amber-600/15',
  },
  {
    type: 'MERIT' as CertificateType,
    label: '⭐ Merit',
    defaultTitle: 'Certificate of Merit & Technical Distinction',
    defaultRank: 'Merit Distinction',
    badgeColor: 'border-purple-400/50 text-purple-300 bg-purple-500/15',
  },
  {
    type: 'APPRECIATION' as CertificateType,
    label: '🌟 Appreciation',
    defaultTitle: 'Certificate of Special Appreciation',
    defaultRank: 'Special Appreciation',
    badgeColor: 'border-emerald-400/50 text-emerald-300 bg-emerald-500/15',
  },
];

// ── Typography Font Catalog ────────────────────────────────────────────────
export const FONTS_CATALOG = [
  // Handwriting & Calligraphy
  { label: 'Great Vibes', value: "'Great Vibes', cursive", category: 'Handwriting' },
  { label: 'Dancing Script', value: "'Dancing Script', cursive", category: 'Handwriting' },
  { label: 'Pinyon Script', value: "'Pinyon Script', cursive", category: 'Handwriting' },
  { label: 'Allura', value: "'Allura', cursive", category: 'Handwriting' },
  { label: 'Alex Brush', value: "'Alex Brush', cursive", category: 'Handwriting' },
  { label: 'Sacramento', value: "'Sacramento', cursive", category: 'Handwriting' },
  { label: 'Tangerine', value: "'Tangerine', cursive", category: 'Handwriting' },
  { label: 'Satisfy', value: "'Satisfy', cursive", category: 'Handwriting' },
  { label: 'Pacifico', value: "'Pacifico', cursive", category: 'Handwriting' },

  // Elegant Serif
  { label: 'Cinzel', value: "'Cinzel', serif", category: 'Elegant Serif' },
  { label: 'Playfair Display', value: "'Playfair Display', serif", category: 'Elegant Serif' },
  { label: 'Cormorant Garamond', value: "'Cormorant Garamond', serif", category: 'Elegant Serif' },
  { label: 'EB Garamond', value: "'EB Garamond', serif", category: 'Elegant Serif' },
  { label: 'Libre Baskerville', value: "'Libre Baskerville', serif", category: 'Elegant Serif' },
  { label: 'Crimson Text', value: "'Crimson Text', serif", category: 'Elegant Serif' },

  // Classic & Modern Sans
  { label: 'Syne (Brand)', value: "'Syne', sans-serif", category: 'Modern Sans' },
  { label: 'Inter', value: "'Inter', sans-serif", category: 'Modern Sans' },
  { label: 'Raleway', value: "'Raleway', sans-serif", category: 'Modern Sans' },
  { label: 'Lato', value: "'Lato', sans-serif", category: 'Modern Sans' },
  { label: 'Georgia', value: "Georgia, serif", category: 'Classic' },
  { label: 'Courier New', value: "'Courier New', monospace", category: 'Monospace' },
];

export interface StudioField {
  key: string;
  label: string;
  x: number; // 0 to 1 percentage of canvas width
  y: number; // 0 to 1 percentage of canvas height
  font: string;
  size: number;
  color: string;
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
  textTransform: 'none' | 'uppercase' | 'titlecase';
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowOpacity: number;
  _bbox?: { x1: number; y1: number; x2: number; y2: number } | null;
}

export interface StudioRecipient {
  name: string;
  email: string;
  firstName?: string;
  department?: string;
  collegeName?: string;
  eventTitle?: string;
  eventDate?: string;
  rankText?: string;
  certId?: string;
  passId?: string;
  [key: string]: any;
}

export interface SmtpConfig {
  host: string;
  port: number | string;
  user: string;
  pass: string;
  fromName: string;
}

interface CertificateStudioProps {
  eventsList: EventItem[];
  passesList: any[];
  onCertificatesIssued?: (certs: ApiCertificate[]) => void;
  onClose?: () => void;
}

const ZOOM_STEPS = [0.25, 0.35, 0.5, 0.65, 0.75, 1.0];

export const CertificateStudio: React.FC<CertificateStudioProps> = ({
  eventsList,
  passesList,
  onCertificatesIssued,
  onClose,
}) => {
  // ── Source & Delivery State ──────────────────────────────────────────────
  const [selectedEventId, setSelectedEventId] = useState<string>(eventsList[0]?.id || '');
  const [attendeeFilter, setAttendeeFilter] = useState<'all' | 'confirmed_only' | 'checked_in_only'>('all');
  const [deliveryMode, setDeliveryMode] = useState<'account_only' | 'email_only' | 'both'>('both');
  const [certAwardType, setCertAwardType] = useState<CertificateType>('PARTICIPATION');
  const [certTitle, setCertTitle] = useState('Certificate of Participation');
  const [certRankText, setCertRankText] = useState('Participant');
  const [certDescription, setCertDescription] = useState('');

  // ── Recipient Data State ─────────────────────────────────────────────────
  const [dataSource, setDataSource] = useState<'database' | 'excel' | 'manual'>('database');
  const [recipients, setRecipients] = useState<StudioRecipient[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [previewRowIdx, setPreviewRowIdx] = useState<number>(0);
  const [editingRowIdx, setEditingRowIdx] = useState<number>(-1); // -1 = global, >=0 = per-row override
  const [rowOverrides, setRowOverrides] = useState<Record<number, Record<string, Partial<StudioField>>>>({});

  // ── Manual Recipient Inputs ──────────────────────────────────────────────
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualDept, setManualDept] = useState('Electronics & Communication Engineering');
  const [manualCollege, setManualCollege] = useState('PCE-NAGPUR');

  // ── Canvas & Template State ──────────────────────────────────────────────
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const excelInputRef = useRef<HTMLInputElement | null>(null);
  const [templateImage, setTemplateImage] = useState<HTMLImageElement | null>(null);
  const [templateDimensions, setTemplateDimensions] = useState<{ width: number; height: number }>({ width: 1600, height: 1130 });
  const [templateName, setTemplateName] = useState<string>('Classic Gold Luxury');
  const [zoomIdx, setZoomIdx] = useState<number>(3); // 0.65 default

  // ── Placed Fields State ──────────────────────────────────────────────────
  const [fields, setFields] = useState<StudioField[]>([
    {
      key: 'name',
      label: 'Participant Name',
      x: 0.5,
      y: 0.43,
      font: "'Great Vibes', cursive",
      size: 78,
      color: '#FFFFFF',
      bold: true,
      italic: false,
      align: 'center',
      textTransform: 'none',
      shadowEnabled: true,
      shadowColor: '#000000',
      shadowBlur: 10,
      shadowOffsetX: 2,
      shadowOffsetY: 3,
      shadowOpacity: 70,
    },
    {
      key: 'title',
      label: 'Certificate Title',
      x: 0.5,
      y: 0.27,
      font: "'Cinzel', serif",
      size: 42,
      color: '#FFD700',
      bold: true,
      italic: false,
      align: 'center',
      textTransform: 'uppercase',
      shadowEnabled: false,
      shadowColor: '#000000',
      shadowBlur: 6,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      shadowOpacity: 50,
    },
    {
      key: 'eventTitle',
      label: 'Event Title',
      x: 0.5,
      y: 0.55,
      font: "'Playfair Display', serif",
      size: 30,
      color: '#00E5CC',
      bold: true,
      italic: false,
      align: 'center',
      textTransform: 'none',
      shadowEnabled: false,
      shadowColor: '#000000',
      shadowBlur: 4,
      shadowOffsetX: 1,
      shadowOffsetY: 1,
      shadowOpacity: 40,
    },
    {
      key: 'certId',
      label: 'Certificate ID',
      x: 0.22,
      y: 0.88,
      font: "'Courier New', monospace",
      size: 16,
      color: '#94A3B8',
      bold: true,
      italic: false,
      align: 'left',
      textTransform: 'none',
      shadowEnabled: false,
      shadowColor: '#000000',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowOpacity: 0,
    },
    {
      key: 'eventDate',
      label: 'Date',
      x: 0.78,
      y: 0.88,
      font: "'Inter', sans-serif",
      size: 16,
      color: '#CBD5E1',
      bold: false,
      italic: false,
      align: 'right',
      textTransform: 'none',
      shadowEnabled: false,
      shadowColor: '#000000',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowOpacity: 0,
    },
  ]);
  const [activeFieldKey, setActiveFieldKey] = useState<string>('name');
  const [isDraggingCanvasField, setIsDraggingCanvasField] = useState(false);
  const dragOffsetRef = useRef<{ offX: number; offY: number }>({ offX: 0, offY: 0 });

  // ── SMTP & Email Modals State ────────────────────────────────────────────
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
    host: 'smtp.gmail.com',
    port: 587,
    user: '',
    pass: '',
    fromName: 'PCE-NAGPUR ECE Council',
  });
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpStatusMessage, setSmtpStatusMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Email Composer
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('Congratulations, {{firstName}}! Official Certificate for {{eventTitle}}');
  const [emailBodyHtml, setEmailBodyHtml] = useState(
    '<p>Dear <strong>{{name}}</strong>,</p><p>Congratulations on your participation and achievements in <strong>{{eventTitle}}</strong>!</p><p>Please find attached your official, cryptographically verified e-certificate issued by the Department of Electronics & Communication Engineering, PCE-NAGPUR.</p><p>Your unique Certificate ID is: <code>{{certId}}</code></p><p>Best regards,<br><strong>SPACE & SINC Forum Council</strong><br>Priyadarshini College of Engineering, Nagpur</p>'
  );

  // ── Execution & Progress State ───────────────────────────────────────────
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [deliveryLogs, setDeliveryLogs] = useState<Array<{ name: string; email: string; success: boolean; msg?: string }>>([]);

  // ── 1. Load LocalStorage Settings & Default Template ─────────────────────
  useEffect(() => {
    // Restore SMTP config
    try {
      const savedSmtp = localStorage.getItem('certgen_smtp');
      if (savedSmtp) {
        setSmtpConfig(JSON.parse(savedSmtp));
      }
    } catch {}

    // Load Default Canvas Background
    generateProceduralTemplate('classic_gold');
  }, []);

  // ── 2. Load Participants from Database when Event Changes ─────────────────
  const currentEvent = useMemo(() => {
    return eventsList.find((e) => e.id === selectedEventId) || eventsList[0] || null;
  }, [eventsList, selectedEventId]);

  const loadDatabaseParticipants = () => {
    if (!currentEvent) return;

    // Filter passes matching this event with fallback to local pass service
    const effectivePasses = passesList && passesList.length > 0 ? passesList : passService.getAllPasses();
    const eventPasses = effectivePasses.filter((p) => {
      const matchId = p.eventId && currentEvent.id && p.eventId.toLowerCase() === currentEvent.id.toLowerCase();
      const matchTitle = p.eventTitle && currentEvent.title && p.eventTitle.toLowerCase().trim() === currentEvent.title.toLowerCase().trim();
      if (!matchId && !matchTitle) return false;

      if (attendeeFilter === 'confirmed_only') {
        return p.status === 'CONFIRMED' || p.status === 'CHECKED_IN';
      }
      if (attendeeFilter === 'checked_in_only') {
        return p.status === 'CHECKED_IN';
      }
      return true;
    });

    const rows: StudioRecipient[] = [];

    eventPasses.forEach((pass, pIdx) => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let rand = '';
      for (let r = 0; r < 5; r++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
      const certId = `ECE-CERT-${new Date().getFullYear()}-${rand}`;

      // Leader / Primary Attendee
      rows.push({
        name: pass.userName || 'Attendee',
        firstName: (pass.userName || 'Attendee').trim().split(/\s+/)[0],
        email: (pass.userEmail || '').trim().toLowerCase(),
        department: pass.department || 'Electronics & Communication Engineering',
        collegeName: pass.collegeName || 'PCE-NAGPUR',
        eventTitle: currentEvent.title,
        eventDate: currentEvent.date || '2026',
        rankText: certRankText || 'Participant',
        certId,
        passId: pass.passId,
      });

      // Teammates if it's a team pass!
      if (pass.registrationType === 'team' && Array.isArray(pass.teamMembers)) {
        pass.teamMembers.forEach((member: any, mIdx: number) => {
          if (member.name && member.email) {
            let tRand = '';
            for (let r = 0; r < 5; r++) tRand += chars.charAt(Math.floor(Math.random() * chars.length));
            const teamCertId = `ECE-CERT-${new Date().getFullYear()}-${tRand}`;

            rows.push({
              name: member.name,
              firstName: member.name.trim().split(/\s+/)[0],
              email: member.email.trim().toLowerCase(),
              department: member.department || pass.department || 'Electronics & Communication Engineering',
              collegeName: member.collegeName || pass.collegeName || 'PCE-NAGPUR',
              eventTitle: currentEvent.title,
              eventDate: currentEvent.date || '2026',
              rankText: certRankText || 'Participant',
              certId: teamCertId,
              passId: `${pass.passId}-T${mIdx + 2}`,
            });
          }
        });
      }
    });

    setRecipients(rows);
    setAvailableColumns(['name', 'firstName', 'email', 'department', 'collegeName', 'eventTitle', 'eventDate', 'rankText', 'certId']);
    setPreviewRowIdx(0);
    setEditingRowIdx(-1);
    setRowOverrides({});
  };

  useEffect(() => {
    if (dataSource === 'database') {
      loadDatabaseParticipants();
    }
  }, [selectedEventId, attendeeFilter, certRankText, dataSource, passesList]);

  // ── 3. Built-in Canvas Procedural Background Generator ─────────────────────
  const generateProceduralTemplate = (themeKey: string) => {
    const w = 1600;
    const h = 1130;
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const ctx = off.getContext('2d');
    if (!ctx) return;

    if (themeKey === 'classic_gold') {
      setTemplateName('Classic Gold Luxury');
      // Dark Slate Gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0A0E17');
      grad.addColorStop(0.5, '#060810');
      grad.addColorStop(1, '#030408');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Ornate Gold Guilloche Frames
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 8;
      ctx.strokeRect(36, 36, w - 72, h - 72);

      ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(52, 52, w - 104, h - 104);

      // Corner Ornamental Brackets
      const corners = [
        [60, 60, 1, 1],
        [w - 60, 60, -1, 1],
        [60, h - 60, 1, -1],
        [w - 60, h - 60, -1, -1],
      ];
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      corners.forEach(([cx, cy, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy + 40 * dy);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + 40 * dx, cy);
        ctx.stroke();
      });

      // Subtle Watermark Seal in Background
      ctx.save();
      ctx.translate(w / 2, h / 2 + 30);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.04)';
      ctx.lineWidth = 4;
      for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        ctx.strokeRect(-180, -180, 360, 360);
      }
      ctx.restore();

      // Top Institution Header (Hardcoded on template background)
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 24px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillText('PRIYADARSHINI COLLEGE OF ENGINEERING, NAGPUR', w / 2, 110);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '600 17px Inter, sans-serif';
      ctx.fillText('DEPARTMENT OF ELECTRONICS & COMMUNICATION ENGINEERING', w / 2, 142);

      ctx.fillStyle = '#00E5CC';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('SPACE & SINC STUDENT FORUM COUNCIL 2026—27', w / 2, 170);

      // Presentation line
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = 'italic 20px Georgia, serif';
      ctx.fillText('This is proudly and honorably conferred upon', w / 2, 420);

      // Divider line under recipient
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 320, 560);
      ctx.lineTo(w / 2 + 320, 560);
      ctx.stroke();

      // Signatory lines at bottom
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(180, 990);
      ctx.lineTo(440, 990);
      ctx.moveTo(w / 2 - 130, 990);
      ctx.lineTo(w / 2 + 130, 990);
      ctx.moveTo(w - 440, 990);
      ctx.lineTo(w - 180, 990);
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 15px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Dr. G. M. Asutkar', 310, 1020);
      ctx.fillText('Dr. (Mrs.) R. S. Somkuwar', w / 2, 1020);
      ctx.fillText('Prof. V. P. Balpande', w - 310, 1020);

      ctx.fillStyle = '#64748B';
      ctx.font = '12px monospace';
      ctx.fillText('Principal & Patron', 310, 1042);
      ctx.fillText('Head of Department (ECE)', w / 2, 1042);
      ctx.fillText('Faculty Convener', w - 310, 1042);
    } else if (themeKey === 'cyber_neon') {
      setTemplateName('Cyber Neon Matrix');
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#040B14');
      grad.addColorStop(0.5, '#02060B');
      grad.addColorStop(1, '#010205');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Cyber Gridlines
      ctx.strokeStyle = 'rgba(0, 229, 204, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      ctx.strokeStyle = '#00E5CC';
      ctx.lineWidth = 6;
      ctx.strokeRect(36, 36, w - 72, h - 72);

      ctx.strokeStyle = 'rgba(0, 229, 204, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(48, 48, w - 96, h - 96);

      ctx.fillStyle = '#00E5CC';
      ctx.font = 'bold 22px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillText('PRIYADARSHINI COLLEGE OF ENGINEERING, NAGPUR', w / 2, 110);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px Inter, sans-serif';
      ctx.fillText('DEPARTMENT OF ELECTRONICS & COMMUNICATION ENGINEERING', w / 2, 142);
      ctx.fillStyle = '#00FF88';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('SPACE × SINC CYBERNETIC MERIT REGISTRY · SESSION 2026—27', w / 2, 168);
    } else {
      setTemplateName('Royal Sapphire Prestige');
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0A0E24');
      grad.addColorStop(0.5, '#050713');
      grad.addColorStop(1, '#020308');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#4CC9F0';
      ctx.lineWidth = 8;
      ctx.strokeRect(36, 36, w - 72, h - 72);

      ctx.fillStyle = '#4CC9F0';
      ctx.font = 'bold 24px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillText('PRIYADARSHINI COLLEGE OF ENGINEERING (PCE-NAGPUR)', w / 2, 110);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText('DEPARTMENT OF ELECTRONICS & COMMUNICATION ENGINEERING', w / 2, 142);
    }

    const img = new Image();
    img.src = off.toDataURL('image/png');
    img.onload = () => {
      setTemplateImage(img);
      setTemplateDimensions({ width: w, height: h });
    };
  };

  // ── 4. Upload Custom Template Image ──────────────────────────────────────
  const handleTemplateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundFx.playClick();
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setTemplateImage(img);
      setTemplateDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setTemplateName(file.name);
      URL.revokeObjectURL(url);
      soundFx.playSuccess();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      alert('Could not load image. Please provide a valid PNG, JPG, or WebP file.');
    };
    img.src = url;
  };

  // ── 5. Excel / CSV File Import ───────────────────────────────────────────
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundFx.playClick();
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: '' });

        if (!rows.length) {
          alert('No rows found in uploaded spreadsheet.');
          return;
        }

        const keys = Object.keys(rows[0]);
        const nameCol = keys.find((k) => k.toLowerCase().includes('name')) || keys[0];
        const emailCol = keys.find((k) => k.toLowerCase().includes('email')) || keys[1];

        const parsedRecipients: StudioRecipient[] = rows.map((r, i) => {
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
          let rand = '';
          for (let rc = 0; rc < 5; rc++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
          const certId = `ECE-CERT-${new Date().getFullYear()}-${rand}`;

          const name = String(r[nameCol] || `Recipient ${i + 1}`).trim();
          return {
            ...r,
            name,
            firstName: name.split(/\s+/)[0],
            email: String(r[emailCol] || '').trim().toLowerCase(),
            eventTitle: currentEvent?.title || 'ECE Forum Event',
            eventDate: currentEvent?.date || '2026',
            certId,
          };
        });

        setRecipients(parsedRecipients);
        setAvailableColumns(keys);
        setDataSource('excel');
        setPreviewRowIdx(0);
        setEditingRowIdx(-1);
        setRowOverrides({});
        soundFx.playSuccess();
      } catch (err: any) {
        alert('Failed to parse spreadsheet: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ── 6. Manual Recipient Addition ─────────────────────────────────────────
  const handleAddManualRecipient = () => {
    if (!manualName.trim() || !manualEmail.trim()) {
      alert('Please enter both student name and email address.');
      return;
    }
    soundFx.playClick();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let rc = 0; rc < 5; rc++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
    const certId = `ECE-CERT-${new Date().getFullYear()}-${rand}`;

    const newRec: StudioRecipient = {
      name: manualName.trim(),
      firstName: manualName.trim().split(/\s+/)[0],
      email: manualEmail.trim().toLowerCase(),
      department: manualDept.trim(),
      collegeName: manualCollege.trim(),
      eventTitle: currentEvent?.title || 'ECE Forum Event',
      eventDate: currentEvent?.date || '2026',
      rankText: certRankText || 'Participant',
      certId,
    };

    setRecipients([...recipients, newRec]);
    setManualName('');
    setManualEmail('');
  };

  // ── 7. Get Effective Field (Merged with Per-Row Override) ─────────────────
  const getEffectiveField = (baseField: StudioField, rowIdx: number): StudioField => {
    if (rowIdx < 0 || !rowOverrides[rowIdx] || !rowOverrides[rowIdx][baseField.key]) {
      return baseField;
    }
    return { ...baseField, ...rowOverrides[rowIdx][baseField.key] };
  };

  const activeField = useMemo(() => {
    const base = fields.find((f) => f.key === activeFieldKey) || fields[0];
    return getEffectiveField(base, editingRowIdx >= 0 ? editingRowIdx : previewRowIdx);
  }, [fields, activeFieldKey, editingRowIdx, previewRowIdx, rowOverrides]);

  // ── 8. Draw Field on Canvas Context ──────────────────────────────────────
  const drawFieldOnCanvas = (
    ctx: CanvasRenderingContext2D,
    field: StudioField,
    value: string,
    width: number,
    height: number
  ) => {
    let displayVal = value || '';
    if (field.textTransform === 'uppercase') displayVal = displayVal.toUpperCase();
    if (field.textTransform === 'titlecase') {
      displayVal = displayVal.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
    }

    ctx.save();
    const fontParts = [];
    if (field.italic) fontParts.push('italic');
    if (field.bold) fontParts.push('bold');
    fontParts.push(`${field.size}px`);
    fontParts.push(field.font);
    ctx.font = fontParts.join(' ');
    ctx.fillStyle = field.color;
    ctx.textAlign = field.align;
    ctx.textBaseline = 'middle';

    const renderX = field.x * width;
    const renderY = field.y * height;

    if (field.shadowEnabled) {
      const hex = field.shadowColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16) || 0;
      const g = parseInt(hex.substring(2, 4), 16) || 0;
      const b = parseInt(hex.substring(4, 6), 16) || 0;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${field.shadowOpacity / 100})`;
      ctx.shadowBlur = field.shadowBlur;
      ctx.shadowOffsetX = field.shadowOffsetX;
      ctx.shadowOffsetY = field.shadowOffsetY;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    ctx.fillText(displayVal, renderX, renderY);
    ctx.restore();

    // Calculate Bounding Box
    ctx.font = fontParts.join(' ');
    const metrics = ctx.measureText(displayVal);
    const tw = metrics.width;
    const th = field.size * 1.3;
    let x1 = renderX;
    let x2 = renderX + tw;
    if (field.align === 'center') {
      x1 = renderX - tw / 2;
      x2 = renderX + tw / 2;
    } else if (field.align === 'right') {
      x1 = renderX - tw;
      x2 = renderX;
    }
    field._bbox = { x1, y1: renderY - th / 2, x2, y2: renderY + th / 2 };
  };

  // ── 9. Live Canvas Render ────────────────────────────────────────────────
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !templateImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = templateDimensions.width;
    const h = templateDimensions.height;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(templateImage, 0, 0, w, h);

    const activeRecipient = recipients[previewRowIdx] || {
      name: 'Aarav Sharma',
      firstName: 'Aarav',
      email: 'aarav.sharma@pcenagpur.edu.in',
      department: 'Electronics & Communication Engineering',
      collegeName: 'PCE-NAGPUR',
      eventTitle: currentEvent?.title || 'SPACE & SINC Forum Installation Ceremony',
      eventDate: currentEvent?.date || 'July 30, 2026',
      rankText: certRankText || 'Participant',
      certId: 'ECE-CERT-2026-X7K89',
    };

    fields.forEach((baseField) => {
      const field = getEffectiveField(baseField, previewRowIdx);
      let val = String(activeRecipient[field.key] ?? `[${field.label}]`);
      if (field.key === 'title') val = certTitle;
      if (field.key === 'rankText') val = certRankText;

      drawFieldOnCanvas(ctx, field, val, w, h);

      // Active Selection Highlight
      if (field.key === activeFieldKey) {
        ctx.save();
        ctx.strokeStyle = '#00E5CC';
        ctx.lineWidth = Math.max(2, w / 500);
        ctx.setLineDash([8, 6]);
        const b = baseField._bbox;
        if (b) {
          const pad = 10;
          ctx.strokeRect(b.x1 - pad, b.y1 - pad, b.x2 - b.x1 + pad * 2, b.y2 - b.y1 + pad * 2);
        }
        ctx.restore();
      }
    });
  };

  useEffect(() => {
    renderCanvas();
  }, [templateImage, templateDimensions, fields, activeFieldKey, previewRowIdx, recipients, rowOverrides, certTitle, certRankText]);

  // ── 10. Drag & Drop on Canvas Interaction ────────────────────────────────
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Hit test reverse
    let hitKey: string | null = null;
    for (let i = fields.length - 1; i >= 0; i--) {
      const b = fields[i]._bbox;
      if (b && clickX >= b.x1 - 16 && clickX <= b.x2 + 16 && clickY >= b.y1 - 16 && clickY <= b.y2 + 16) {
        hitKey = fields[i].key;
        break;
      }
    }

    if (hitKey) {
      setActiveFieldKey(hitKey);
      setIsDraggingCanvasField(true);
      const f = fields.find((x) => x.key === hitKey)!;
      dragOffsetRef.current = {
        offX: (clickX / canvas.width) - f.x,
        offY: (clickY / canvas.height) - f.y,
      };

      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingCanvasField || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const currX = (e.clientX - rect.left) / rect.width;
    const currY = (e.clientY - rect.top) / rect.height;

    const newX = Math.max(0.02, Math.min(0.98, currX - dragOffsetRef.current.offX));
    const newY = Math.max(0.02, Math.min(0.98, currY - dragOffsetRef.current.offY));

    if (editingRowIdx >= 0) {
      // Save per-row override
      setRowOverrides((prev) => ({
        ...prev,
        [editingRowIdx]: {
          ...(prev[editingRowIdx] || {}),
          [activeFieldKey]: {
            ...(prev[editingRowIdx]?.[activeFieldKey] || {}),
            x: newX,
            y: newY,
          },
        },
      }));
    } else {
      // Global field position update
      setFields((prev) =>
        prev.map((f) => (f.key === activeFieldKey ? { ...f, x: newX, y: newY } : f))
      );
    }
  };

  const handleCanvasPointerUp = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDraggingCanvasField(false);
    if (e) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDraggingCanvasField) {
        setIsDraggingCanvasField(false);
      }
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [isDraggingCanvasField]);

  // ── 11. Field Typography Mutators ────────────────────────────────────────
  const updateActiveFieldProperty = (prop: keyof StudioField, val: any) => {
    if (editingRowIdx >= 0) {
      setRowOverrides((prev) => ({
        ...prev,
        [editingRowIdx]: {
          ...(prev[editingRowIdx] || {}),
          [activeFieldKey]: {
            ...(prev[editingRowIdx]?.[activeFieldKey] || {}),
            [prop]: val,
          },
        },
      }));
    } else {
      setFields((prev) =>
        prev.map((f) => (f.key === activeFieldKey ? { ...f, [prop]: val } : f))
      );
    }
  };

  const handleAddFieldToCanvas = (colKey: string) => {
    soundFx.playClick();
    if (fields.some((f) => f.key === colKey)) {
      setActiveFieldKey(colKey);
      return;
    }
    const newField: StudioField = {
      key: colKey,
      label: colKey.charAt(0).toUpperCase() + colKey.slice(1),
      x: 0.5,
      y: 0.65,
      font: "'Inter', sans-serif",
      size: 24,
      color: '#FFFFFF',
      bold: false,
      italic: false,
      align: 'center',
      textTransform: 'none',
      shadowEnabled: false,
      shadowColor: '#000000',
      shadowBlur: 4,
      shadowOffsetX: 1,
      shadowOffsetY: 1,
      shadowOpacity: 50,
    };
    setFields([...fields, newField]);
    setActiveFieldKey(colKey);
  };

  const handleRemoveField = (fieldKey: string) => {
    soundFx.playLaser();
    setFields(fields.filter((f) => f.key !== fieldKey));
    if (activeFieldKey === fieldKey) {
      setActiveFieldKey(fields[0]?.key || '');
    }
  };

  // ── 12. Render Single Certificate Offscreen & Export Base64 ───────────────
  const generateCertificatePngBase64 = async (recipient: StudioRecipient, rowIdx: number): Promise<string> => {
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {}
    }

    return new Promise((resolve) => {
      const off = document.createElement('canvas');
      off.width = templateDimensions.width;
      off.height = templateDimensions.height;
      const ctx = off.getContext('2d');
      if (!ctx || !templateImage) {
        resolve('');
        return;
      }

      ctx.drawImage(templateImage, 0, 0, off.width, off.height);

      fields.forEach((baseField) => {
        const field = getEffectiveField(baseField, rowIdx);
        let val = String(recipient[field.key] ?? '');
        if (field.key === 'title') val = certTitle;
        if (field.key === 'rankText') val = certRankText;

        drawFieldOnCanvas(ctx, field, val, off.width, off.height);
      });

      resolve(off.toDataURL('image/png', 0.95));
    });
  };

  // ── 13. Download Single Preview PNG ──────────────────────────────────────
  const handleDownloadPreview = async () => {
    soundFx.playClick();
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {}
    }
    const recipient = recipients[previewRowIdx] || {
      name: 'Preview Student',
      certId: 'ECE-CERT-PREVIEW',
    };
    const b64 = await generateCertificatePngBase64(recipient, previewRowIdx);
    const link = document.createElement('a');
    link.href = b64;
    link.download = `Certificate_${recipient.name.replace(/\s+/g, '_')}_${recipient.certId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    soundFx.playSuccess();
  };

  // ── 14. Download All as ZIP ──────────────────────────────────────────────
  const handleDownloadAllZip = async () => {
    if (!recipients.length) {
      alert('No recipients loaded to download.');
      return;
    }
    soundFx.playClick();
    setIsProcessing(true);
    setProgressPercent(0);
    setProgressStatus('Initializing ZIP package...');

    try {
      const zip = new JSZip();
      for (let i = 0; i < recipients.length; i++) {
        const r = recipients[i];
        setProgressPercent(Math.round(((i + 1) / recipients.length) * 100));
        setProgressStatus(`Rendering certificate ${i + 1} of ${recipients.length}: ${r.name}`);

        const b64 = await generateCertificatePngBase64(r, i);
        const data = b64.replace(/^data:image\/png;base64,/, '');
        zip.file(`${i + 1}_${r.name.replace(/[^a-zA-Z0-9]/g, '_')}_${r.certId}.png`, data, { base64: true });

        // Let UI breathe
        if (i % 5 === 0) await new Promise((res) => setTimeout(res, 10));
      }

      setProgressStatus('Compressing ZIP archive...');
      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `ECE_Certificates_${(currentEvent?.title || 'Event').replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      soundFx.playSuccess();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      alert('Failed to generate ZIP: ' + err.message);
    } finally {
      setIsProcessing(false);
      setProgressPercent(0);
      setProgressStatus('');
    }
  };

  // ── 15. Test SMTP Connection ─────────────────────────────────────────────
  const handleTestSmtp = async () => {
    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
      alert('Please enter SMTP Host, Username/Email, and App Password.');
      return;
    }
    setIsTestingSmtp(true);
    setSmtpStatusMessage(null);

    const res = await forumApi.testSmtp(smtpConfig);
    setIsTestingSmtp(false);
    if (res.ok) {
      soundFx.playSuccess();
      setSmtpStatusMessage({ ok: true, text: 'SMTP Connection Verified! Ready to send emails.' });
      localStorage.setItem('certgen_smtp', JSON.stringify(smtpConfig));
    } else {
      soundFx.playLaser();
      setSmtpStatusMessage({ ok: false, text: res.error || 'SMTP Test Failed' });
    }
  };

  // ── 16. Substitute Email Variables ───────────────────────────────────────
  const substituteEmailVariables = (template: string, recipient: StudioRecipient): string => {
    let result = template;
    const vars: Record<string, string> = {
      name: recipient.name || '',
      firstName: recipient.firstName || recipient.name.split(/\s+/)[0] || '',
      email: recipient.email || '',
      eventTitle: recipient.eventTitle || currentEvent?.title || 'ECE Forum Event',
      eventDate: recipient.eventDate || currentEvent?.date || '',
      certId: recipient.certId || '',
      department: recipient.department || '',
      collegeName: recipient.collegeName || 'PCE-NAGPUR',
      rankText: recipient.rankText || 'Participant',
    };

    Object.entries(vars).forEach(([k, v]) => {
      const reg = new RegExp(`\\{\\{${k}\\}\\}`, 'gi');
      result = result.replace(reg, v);
    });
    return result;
  };

  // ── 17. MAIN DISPATCHER: Issue to Account & Send via Email ────────────────
  const handleExecuteCertificateIssuance = async () => {
    if (!recipients.length) {
      alert('No recipients loaded for certificate issuance.');
      return;
    }

    if ((deliveryMode === 'email_only' || deliveryMode === 'both') && (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass)) {
      alert('SMTP settings are incomplete. Please click "Setup SMTP" to provide your credentials.');
      setShowSmtpModal(true);
      return;
    }

    const confirmMsg =
      deliveryMode === 'both'
        ? `Issue official certificates for ${recipients.length} participants to their student accounts AND email certificate PNGs via SMTP?`
        : deliveryMode === 'email_only'
        ? `Send certificate PNG emails via SMTP to all ${recipients.length} participants?`
        : `Issue and register official certificates for ${recipients.length} participants in their student portal accounts?`;

    if (!window.confirm(confirmMsg)) return;

    soundFx.playClick();
    setIsProcessing(true);
    setProgressPercent(0);
    setDeliveryLogs([]);

    const issuedDatabaseCerts: any[] = [];
    let emailSuccessCount = 0;
    let emailFailCount = 0;

    for (let i = 0; i < recipients.length; i++) {
      const r = recipients[i];
      setProgressPercent(Math.round(((i + 1) / recipients.length) * 100));
      setProgressStatus(`Processing ${i + 1} of ${recipients.length}: ${r.name}`);

      try {
        // 1. Render PNG base64
        const certImageBase64 = await generateCertificatePngBase64(r, i);

        // 2. Prepare Database Record
        if (deliveryMode === 'account_only' || deliveryMode === 'both') {
          issuedDatabaseCerts.push({
            certId: r.certId,
            securityHash: `VFX-${r.certId || Date.now()}`,
            name: r.name,
            email: r.email,
            department: r.department,
            collegeName: r.collegeName,
            rankText: r.rankText || certRankText,
            certType: certAwardType,
            certificateImage: certImageBase64,
            canvasConfig: {
              templateName,
              fields,
            },
          });
        }

        // 3. Send Email via SMTP
        if (deliveryMode === 'email_only' || deliveryMode === 'both') {
          if (!r.email) {
            setDeliveryLogs((prev) => [
              ...prev,
              { name: r.name, email: 'Missing email', success: false, msg: 'Recipient has no valid email address' },
            ]);
            emailFailCount++;
          } else {
            const finalSubject = substituteEmailVariables(emailSubject, r);
            const finalBody = substituteEmailVariables(emailBodyHtml, r);
            const cleanBase64 = certImageBase64.replace(/^data:image\/png;base64,/, '');

            const mailRes = await forumApi.sendCertificateEmail({
              smtp: smtpConfig,
              to: r.email,
              subject: finalSubject,
              html: finalBody,
              attachmentBase64: cleanBase64,
              filename: `${r.name.replace(/\s+/g, '_')}_Certificate.png`,
            });

            if (mailRes.ok) {
              emailSuccessCount++;
              setDeliveryLogs((prev) => [
                ...prev,
                { name: r.name, email: r.email, success: true, msg: 'Email & Certificate delivered successfully' },
              ]);
            } else {
              emailFailCount++;
              setDeliveryLogs((prev) => [
                ...prev,
                { name: r.name, email: r.email, success: false, msg: mailRes.error || 'SMTP delivery failed' },
              ]);
            }
          }
        } else {
          setDeliveryLogs((prev) => [
            ...prev,
            { name: r.name, email: r.email, success: true, msg: 'Registered to User Account Registry' },
          ]);
        }
      } catch (err: any) {
        setDeliveryLogs((prev) => [
          ...prev,
          { name: r.name, email: r.email, success: false, msg: err.message },
        ]);
      }

      // Small pacing delay for SMTP servers
      if (deliveryMode !== 'account_only') {
        await new Promise((res) => setTimeout(res, 200));
      }
    }

    // 4. Batch commit to Database if requested
    if (issuedDatabaseCerts.length > 0) {
      setProgressStatus('Saving official certificates to database registry...');
      const dbRes = await forumApi.issueBulkCertificates({
        eventId: currentEvent?.id || 'evt-general',
        eventTitle: currentEvent?.title || 'ECE Forum Event',
        eventDate: currentEvent?.date || '2026',
        certType: certAwardType,
        title: certTitle,
        rankText: certRankText,
        description: certDescription,
        templateId: 'custom_upload',
        participants: issuedDatabaseCerts,
      });

      if (dbRes.success && onCertificatesIssued) {
        onCertificatesIssued(dbRes.certificates);
      }
      certificateService.notifyListeners();
    }

    setIsProcessing(false);
    setProgressPercent(100);
    soundFx.playSuccess();
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    alert(`Certificate campaign completed!\n\n${recipients.length} certificates processed.\nDelivery Mode: ${deliveryMode.toUpperCase()}`);
  };

  return (
    <div className="w-full bg-[#08080A] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl flex flex-col min-h-[850px] relative font-sans text-white">
      {/* ── Studio Header Bar ──────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 bg-[#0F0F12] border-b border-white/10 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FFD700] to-[#FF4A15] grid place-items-center text-black font-black shadow-[0_0_20px_rgba(255,215,0,0.35)]">
            🏅
          </div>
          <div>
            <h2 className="font-[Syne] font-[800] text-lg sm:text-xl text-white flex items-center gap-2">
              <span>Certificate Designer &amp; Bulk Mailer Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E5CC]/20 text-[#00E5CC] border border-[#00E5CC]/40">
                PRO ENGINE
              </span>
            </h2>
            <p className="text-xs font-mono text-white/50">
              Visual canvas positioning · Excel / Database roster · User account &amp; SMTP email delivery
            </p>
          </div>
        </div>

        {/* Header Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSmtpModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white/80 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-[#00E5CC]" />
            <span>Setup SMTP</span>
            {smtpConfig.user && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={() => setShowEmailModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white/80 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Compose Email</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPreview}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white/80 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-white" />
            <span>Download Preview</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadAllZip}
            disabled={isProcessing || !recipients.length}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white/80 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download All ZIP ({recipients.length})</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 grid place-items-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Main Studio Grid (Sidebar + Canvas + Recipient Table) ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 items-stretch">
        
        {/* LEFT COLUMN: Controls, Typography & Data Selection (4 Cols) */}
        <div className="lg:col-span-4 bg-[#0B0C0E] border-r border-white/10 p-5 space-y-6 overflow-y-auto max-h-[850px]">
          
          {/* 1. Recipient Data Source Selector */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#12141A] border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#FF4A15]" />
                <span>1. Participant Source</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-[#00E5CC]">
                {recipients.length} Loaded
              </span>
            </div>

            {/* Source Mode Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => {
                  setDataSource('database');
                  loadDatabaseParticipants();
                }}
                className={`py-1.5 rounded-lg transition-all ${
                  dataSource === 'database' ? 'bg-[#FF4A15] text-white font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                Database
              </button>
              <button
                type="button"
                onClick={() => excelInputRef.current?.click()}
                className={`py-1.5 rounded-lg transition-all ${
                  dataSource === 'excel' ? 'bg-[#00E5CC] text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                Upload Excel
              </button>
              <button
                type="button"
                onClick={() => setDataSource('manual')}
                className={`py-1.5 rounded-lg transition-all ${
                  dataSource === 'manual' ? 'bg-[#FFD700] text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                Manual
              </button>
            </div>
            <input type="file" ref={excelInputRef} onChange={handleExcelUpload} accept=".xlsx,.xls,.csv" className="hidden" />

            {/* Database Options */}
            {dataSource === 'database' && (
              <div className="space-y-2.5 pt-1">
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Select Event Catalog:</label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white text-xs font-mono focus:border-[#FF4A15] outline-none"
                  >
                    {eventsList.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Attendee Status Filter:</label>
                  <select
                    value={attendeeFilter}
                    onChange={(e: any) => setAttendeeFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white text-xs font-mono focus:border-[#FF4A15] outline-none"
                  >
                    <option value="all">All Registrations (Both Solo &amp; Teams)</option>
                    <option value="confirmed_only">Admin Verified &amp; Approved Only</option>
                    <option value="checked_in_only">Gate Checked-In Only</option>
                  </select>
                </div>
              </div>
            )}

            {/* Manual Entry Options */}
            {dataSource === 'manual' && (
              <div className="space-y-2 pt-1 text-xs font-mono">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full p-2 bg-black border border-white/10 rounded-lg text-white"
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="w-full p-2 bg-black border border-white/10 rounded-lg text-white"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Department"
                    value={manualDept}
                    onChange={(e) => setManualDept(e.target.value)}
                    className="w-1/2 p-2 bg-black border border-white/10 rounded-lg text-white text-[10px]"
                  />
                  <input
                    type="text"
                    placeholder="College"
                    value={manualCollege}
                    onChange={(e) => setManualCollege(e.target.value)}
                    className="w-1/2 p-2 bg-black border border-white/10 rounded-lg text-white text-[10px]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddManualRecipient}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Student to List
                </button>
              </div>
            )}
          </div>

          {/* 2. Award & Honor Classification */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#12141A] border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>2. Award &amp; Classification</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-[#FFD700]">
                {certAwardType}
              </span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {HONOR_PRESETS.map((p) => {
                const isActive = certAwardType === p.type;
                return (
                  <button
                    key={p.type}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setCertAwardType(p.type);
                      setCertTitle(p.defaultTitle);
                      setCertRankText(p.defaultRank);
                      setRecipients((prev) =>
                        prev.map((r) => ({
                          ...r,
                          rankText: p.defaultRank,
                        }))
                      );
                    }}
                    className={`px-2.5 py-2 rounded-xl text-[11px] font-mono border text-left transition-all cursor-pointer ${
                      isActive
                        ? `${p.badgeColor} font-bold shadow-md`
                        : 'border-white/10 bg-black/40 text-white/60 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Title & Rank Inputs */}
            <div className="space-y-2 pt-1 text-xs font-mono">
              <div>
                <label className="text-[10px] font-mono text-white/50 block mb-1">
                  Certificate Header Title:
                </label>
                <input
                  type="text"
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  placeholder="Certificate of Participation"
                  className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/10 text-white text-xs font-mono focus:border-[#FFD700] outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-white/50 block mb-1">
                  Rank / Honor Text:
                </label>
                <input
                  type="text"
                  value={certRankText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCertRankText(val);
                    setRecipients((prev) =>
                      prev.map((r) => ({
                        ...r,
                        rankText: val,
                      }))
                    );
                  }}
                  placeholder="Participant / Winner / 1st Runner Up"
                  className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/10 text-white text-xs font-mono focus:border-[#FFD700] outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Certificate Background Template */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#12141A] border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>3. Background Template</span>
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-mono text-[#00E5CC] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" /> Upload Custom
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleTemplateFileUpload} accept="image/*" className="hidden" />

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => generateProceduralTemplate('classic_gold')}
                className={`p-2.5 rounded-xl border text-left text-[11px] font-mono transition-all ${
                  templateName === 'Classic Gold Luxury'
                    ? 'border-[#FFD700] bg-[#FFD700]/10 text-white font-bold'
                    : 'border-white/10 bg-black/40 text-white/60 hover:text-white'
                }`}
              >
                Classic Gold
              </button>
              <button
                type="button"
                onClick={() => generateProceduralTemplate('cyber_neon')}
                className={`p-2.5 rounded-xl border text-left text-[11px] font-mono transition-all ${
                  templateName === 'Cyber Neon Matrix'
                    ? 'border-[#00E5CC] bg-[#00E5CC]/10 text-white font-bold'
                    : 'border-white/10 bg-black/40 text-white/60 hover:text-white'
                }`}
              >
                Cyber Neon
              </button>
              <button
                type="button"
                onClick={() => generateProceduralTemplate('royal_sapphire')}
                className={`p-2.5 rounded-xl border text-left text-[11px] font-mono transition-all ${
                  templateName === 'Royal Sapphire Prestige'
                    ? 'border-[#4CC9F0] bg-[#4CC9F0]/10 text-white font-bold'
                    : 'border-white/10 bg-black/40 text-white/60 hover:text-white'
                }`}
              >
                Royal Blue
              </button>
            </div>
            <div className="text-[10px] font-mono text-white/40 truncate">
              Active: {templateName} ({templateDimensions.width}×{templateDimensions.height}px)
            </div>
          </div>

          {/* 4. Draggable Fields on Canvas */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#12141A] border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[#00E5CC]" />
                <span>4. Placeable Field Chips</span>
              </span>
              <span className="text-[10px] font-mono text-white/40">click to add</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {availableColumns.map((col) => {
                const isPlaced = fields.some((f) => f.key === col);
                const isSelected = activeFieldKey === col;
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => handleAddFieldToCanvas(col)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#00E5CC] text-black font-bold border-[#00E5CC]'
                        : isPlaced
                        ? 'bg-black/60 text-[#00E5CC] border-[#00E5CC]/40'
                        : 'bg-black/40 text-white/60 border-white/10 hover:text-white'
                    }`}
                  >
                    <span>{col}</span>
                    {isPlaced && <span className="text-[9px] font-bold">●</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Active Field Typography & Styling */}
          {activeField && (
            <div className="space-y-3.5 p-4 rounded-2xl bg-[#12141A] border border-[#00E5CC]/30 shadow-[0_0_25px_rgba(0,229,204,0.06)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-mono font-bold text-[#00E5CC] uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Typography: "{activeField.label}"</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveField(activeField.key)}
                  className="text-white/40 hover:text-red-400 p-1"
                  title="Remove Field"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Font Family */}
              <div>
                <label className="text-[10px] font-mono text-white/50 block mb-1">Font Family:</label>
                <select
                  value={activeField.font}
                  onChange={(e) => updateActiveFieldProperty('font', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-white text-xs font-mono focus:border-[#00E5CC] outline-none"
                  style={{ fontFamily: activeField.font }}
                >
                  {FONTS_CATALOG.map((f) => (
                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.label} ({f.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Size & Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">
                    Font Size ({activeField.size}px):
                  </label>
                  <input
                    type="range"
                    min={12}
                    max={140}
                    value={activeField.size}
                    onChange={(e) => updateActiveFieldProperty('size', Number(e.target.value))}
                    className="w-full accent-[#00E5CC]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 block mb-1">Text Color:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeField.color}
                      onChange={(e) => updateActiveFieldProperty('color', e.target.value)}
                      className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={activeField.color}
                      onChange={(e) => updateActiveFieldProperty('color', e.target.value)}
                      className="w-full p-1 bg-black border border-white/10 rounded text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Alignment & Style Buttons */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => updateActiveFieldProperty('bold', !activeField.bold)}
                    className={`flex-1 py-1.5 rounded-lg border font-bold transition-all ${
                      activeField.bold ? 'bg-white text-black border-white' : 'bg-black/40 border-white/10 text-white/60'
                    }`}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => updateActiveFieldProperty('italic', !activeField.italic)}
                    className={`flex-1 py-1.5 rounded-lg border italic transition-all ${
                      activeField.italic ? 'bg-white text-black border-white' : 'bg-black/40 border-white/10 text-white/60'
                    }`}
                  >
                    I
                  </button>
                </div>

                <div className="flex gap-1">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => updateActiveFieldProperty('align', align)}
                      className={`flex-1 py-1.5 rounded-lg border capitalize transition-all ${
                        activeField.align === align
                          ? 'bg-[#00E5CC] text-black font-bold border-[#00E5CC]'
                          : 'bg-black/40 border-white/10 text-white/60'
                      }`}
                    >
                      {align[0].toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drop Shadow Controls */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-white/70">
                  <input
                    type="checkbox"
                    checked={activeField.shadowEnabled}
                    onChange={(e) => updateActiveFieldProperty('shadowEnabled', e.target.checked)}
                    className="accent-[#00E5CC]"
                  />
                  <span>Enable Calligraphic Drop Shadow</span>
                </label>

                {activeField.shadowEnabled && (
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                    <div>
                      <span className="text-white/40 block mb-0.5">Blur ({activeField.shadowBlur}px):</span>
                      <input
                        type="range"
                        min={0}
                        max={30}
                        value={activeField.shadowBlur}
                        onChange={(e) => updateActiveFieldProperty('shadowBlur', Number(e.target.value))}
                        className="w-full accent-[#00E5CC]"
                      />
                    </div>
                    <div>
                      <span className="text-white/40 block mb-0.5">Opacity ({activeField.shadowOpacity}%):</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={activeField.shadowOpacity}
                        onChange={(e) => updateActiveFieldProperty('shadowOpacity', Number(e.target.value))}
                        className="w-full accent-[#00E5CC]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. Destination Delivery Mode */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#12141A] border border-white/10">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#FF4A15]" />
              <span>5. Delivery Destination</span>
            </span>

            <div className="space-y-2 text-xs font-mono">
              <label
                onClick={() => setDeliveryMode('account_only')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  deliveryMode === 'account_only'
                    ? 'border-[#00E5CC] bg-[#00E5CC]/10 text-white font-bold'
                    : 'border-white/10 bg-black/40 text-white/60 hover:text-white'
                }`}
              >
                <span>👤 Send to User Account (In-App Dashboard)</span>
                <input type="radio" checked={deliveryMode === 'account_only'} readOnly className="accent-[#00E5CC]" />
              </label>

              <label
                onClick={() => setDeliveryMode('email_only')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  deliveryMode === 'email_only'
                    ? 'border-[#FFD700] bg-[#FFD700]/10 text-white font-bold'
                    : 'border-white/10 bg-black/40 text-white/60 hover:text-white'
                }`}
              >
                <span>✉️ Send via Email (SMTP Mailer)</span>
                <input type="radio" checked={deliveryMode === 'email_only'} readOnly className="accent-[#FFD700]" />
              </label>

              <label
                onClick={() => setDeliveryMode('both')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  deliveryMode === 'both'
                    ? 'border-[#FF4A15] bg-[#FF4A15]/15 text-white font-bold shadow-[0_0_15px_rgba(255,74,21,0.2)]'
                    : 'border-white/10 bg-black/40 text-white/60 hover:text-white'
                }`}
              >
                <span>⚡ Both (Account + Email Attachment)</span>
                <input type="radio" checked={deliveryMode === 'both'} readOnly className="accent-[#FF4A15]" />
              </label>
            </div>
          </div>

          {/* 6. Execution Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleExecuteCertificateIssuance}
              disabled={isProcessing || !recipients.length}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#FFD700] via-[#FF4A15] to-[#00E5CC] text-black font-[Syne] font-[900] text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:opacity-95 transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Processing Campaign ({progressPercent}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>
                    {deliveryMode === 'both'
                      ? `Dispatch ${recipients.length} Certificates to Account & Email`
                      : deliveryMode === 'email_only'
                      ? `Send ${recipients.length} Certificates via Email`
                      : `Issue ${recipients.length} Certificates to Student Portals`}
                  </span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Canvas Workspace & Interactive Preview (8 Cols) */}
        <div className="lg:col-span-8 bg-[#040508] p-5 flex flex-col justify-between overflow-x-auto relative">
          
          {/* Zoom and Mode Status Ribbon */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono">
            <div className="flex items-center gap-3">
              {editingRowIdx >= 0 ? (
                <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-2">
                  <span>✦ Row Override Mode: Customizing Row #{editingRowIdx + 1} ({recipients[editingRowIdx]?.name})</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...rowOverrides };
                      delete updated[editingRowIdx];
                      setRowOverrides(updated);
                    }}
                    className="underline hover:text-white"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingRowIdx(-1)}
                    className="underline hover:text-white"
                  >
                    Exit
                  </button>
                </div>
              ) : (
                <div className="text-white/60 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#00E5CC]" />
                  <span>Previewing Recipient #{previewRowIdx + 1} of {recipients.length || 1}: <strong>{recipients[previewRowIdx]?.name || 'Sample'}</strong></span>
                </div>
              )}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-black/60 border border-white/10 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setZoomIdx((prev) => Math.max(0, prev - 1))}
                className="w-7 h-7 rounded-lg hover:bg-white/10 grid place-items-center text-white/70"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] px-2 text-white font-mono">{Math.round(ZOOM_STEPS[zoomIdx] * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomIdx((prev) => Math.min(ZOOM_STEPS.length - 1, prev + 1))}
                className="w-7 h-7 rounded-lg hover:bg-white/10 grid place-items-center text-white/70"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Canvas Stage */}
          <div className="flex-1 my-4 flex items-center justify-center overflow-auto min-h-[460px] p-2 bg-black/50 rounded-2xl border border-white/5 relative">
            <canvas
              ref={canvasRef}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              className="rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 cursor-crosshair max-w-full touch-none select-none"
              style={{
                width: `${templateDimensions.width * ZOOM_STEPS[zoomIdx]}px`,
                height: `${templateDimensions.height * ZOOM_STEPS[zoomIdx]}px`,
              }}
            />
          </div>

          {/* Recipient Navigator Strip */}
          <div className="p-3.5 rounded-2xl bg-[#0B0C0E] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white/60 font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#00E5CC]" />
                <span>Recipient Ledger ({recipients.length} entries) — Click to preview or fine-tune row</span>
              </span>
              <span className="text-[10px] text-white/40">Use arrow keys or click row</span>
            </div>

            <div className="max-h-[140px] overflow-y-auto rounded-xl border border-white/5 bg-black/40">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 text-[10px]">
                    <th className="p-2">#</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Cert ID</th>
                    <th className="p-2">Customized</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((rec, idx) => {
                    const isSelected = idx === previewRowIdx;
                    const hasOverride = !!rowOverrides[idx];
                    return (
                      <tr
                        key={idx}
                        onClick={() => {
                          setPreviewRowIdx(idx);
                          setEditingRowIdx(idx);
                        }}
                        className={`cursor-pointer transition-colors border-b border-white/[0.03] ${
                          isSelected ? 'bg-[#00E5CC]/15 text-[#00E5CC]' : 'hover:bg-white/5 text-white/70'
                        }`}
                      >
                        <td className="p-2 text-white/30">{idx + 1}</td>
                        <td className="p-2 font-bold text-white">{rec.name}</td>
                        <td className="p-2 text-white/60">{rec.email || '—'}</td>
                        <td className="p-2 text-[#FFD700]">{rec.certId || '—'}</td>
                        <td className="p-2">
                          {hasOverride ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                              ✦ Customized
                            </span>
                          ) : (
                            <span className="text-white/20">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time Progress Bar */}
          {isProcessing && (
            <div className="mt-3 p-3.5 rounded-xl bg-black/80 border border-[#00E5CC]/30 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#00E5CC]">
                <span>{progressStatus}</span>
                <strong>{progressPercent}%</strong>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FFD700] to-[#00E5CC] transition-all duration-150"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ── MODAL 1: SMTP CONFIGURATION ────────────────────────────────────── */}
      {showSmtpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0F0F14] border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#00E5CC]" />
                <h3 className="font-[Syne] font-bold text-lg text-white">SMTP Email Gateway Configuration</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSmtpModal(false)}
                className="text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-white/50 block mb-1">SMTP Host *</label>
                  <input
                    type="text"
                    placeholder="smtp.gmail.com"
                    value={smtpConfig.host}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                    className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-white/50 block mb-1">Port *</label>
                  <input
                    type="number"
                    value={smtpConfig.port}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                    className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/50 block mb-1">Sender Email / Username *</label>
                <input
                  type="email"
                  placeholder="your-email@gmail.com"
                  value={smtpConfig.user}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                  className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-white/50 block mb-1">App Password / SMTP Password *</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={smtpConfig.pass}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                  className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white"
                />
                <span className="text-[10px] text-white/40 block mt-1">
                  Tip for Gmail users: Use an <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-[#00E5CC] underline">App Password</a> instead of your regular password.
                </span>
              </div>

              <div>
                <label className="text-white/50 block mb-1">Display From Name</label>
                <input
                  type="text"
                  placeholder="PCE-NAGPUR ECE Council"
                  value={smtpConfig.fromName}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
                  className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white"
                />
              </div>

              {smtpStatusMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    smtpStatusMessage.ok
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-500/15 border-red-500/40 text-red-400'
                  }`}
                >
                  {smtpStatusMessage.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{smtpStatusMessage.text}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleTestSmtp}
                disabled={isTestingSmtp}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isTestingSmtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#00E5CC]" />}
                <span>Test Connection</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('certgen_smtp', JSON.stringify(smtpConfig));
                  soundFx.playSuccess();
                  setShowSmtpModal(false);
                }}
                className="px-6 py-2.5 rounded-full bg-[#00E5CC] text-black font-bold font-mono text-xs shadow-lg hover:opacity-95 cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: EMAIL COMPOSER WITH {{VARIABLES}} ─────────────────────── */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0F0F14] border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#FFD700]" />
                <h3 className="font-[Syne] font-bold text-lg text-white">Email Subject &amp; Body Composer</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-white/50 block mb-1">Subject Line:</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-white text-xs font-mono"
                />
              </div>

              {/* Dynamic Variable Chips */}
              <div>
                <label className="text-white/50 block mb-1.5">Click variable to insert into subject / body:</label>
                <div className="flex flex-wrap gap-1.5">
                  {['name', 'firstName', 'eventTitle', 'certId', 'department', 'collegeName', 'rankText'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setEmailSubject((prev) => `${prev} {{${v}}}`)}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-[#00E5CC]/20 hover:text-[#00E5CC] text-white/70 text-[11px] font-mono cursor-pointer border border-white/10"
                    >
                      {`{{${v}}}`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/50 block mb-1">HTML Message Content (Certificate Attached as PNG):</label>
                <textarea
                  rows={6}
                  value={emailBodyHtml}
                  onChange={(e) => setEmailBodyHtml(e.target.value)}
                  className="w-full p-3 bg-black border border-white/10 rounded-xl text-white text-xs font-mono leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="px-6 py-2.5 rounded-full bg-[#FFD700] text-black font-bold font-mono text-xs cursor-pointer shadow-lg"
              >
                Done Composing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
