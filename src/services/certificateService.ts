import { supabaseDb } from './supabase';
import { forumApi, type ApiCertificate, type CertificateType, type CertificateSignatory } from './api';

export interface CertificateTemplatePreset {
  id: 'classic_gold' | 'cyber_neon' | 'sapphire_prestige' | 'ruby_crimson' | 'custom_upload';
  name: string;
  badge: string;
  theme: {
    borderGradient: string;
    bgGradient: string;
    accentColor: string;
    secondaryColor: string;
    textColor: string;
    sealColor: string;
    badgeBg: string;
  };
  sampleBg?: string;
}

export const CERTIFICATE_TEMPLATES: CertificateTemplatePreset[] = [
  {
    id: 'classic_gold',
    name: 'Classic Gold Prestige',
    badge: 'LUXURY GOLD',
    theme: {
      borderGradient: 'from-[#FFD700] via-[#FDB931] to-[#D4AF37]',
      bgGradient: 'from-[#0B0F19] via-[#070A11] to-[#04060A]',
      accentColor: '#FFD700',
      secondaryColor: '#FF4A15',
      textColor: '#FFFFFF',
      sealColor: '#FFD700',
      badgeBg: 'rgba(255, 215, 0, 0.15)',
    },
  },
  {
    id: 'cyber_neon',
    name: 'Cyber Matrix Neon',
    badge: 'TECH CYAN',
    theme: {
      borderGradient: 'from-[#00E5CC] via-[#00B4D8] to-[#0077B6]',
      bgGradient: 'from-[#05131E] via-[#030B13] to-[#02050A]',
      accentColor: '#00E5CC',
      secondaryColor: '#00B4D8',
      textColor: '#FFFFFF',
      sealColor: '#00E5CC',
      badgeBg: 'rgba(0, 229, 204, 0.15)',
    },
  },
  {
    id: 'sapphire_prestige',
    name: 'Royal Sapphire Silver',
    badge: 'ROYAL SAPPHIRE',
    theme: {
      borderGradient: 'from-[#4361EE] via-[#4CC9F0] to-[#7209B7]',
      bgGradient: 'from-[#090C1A] via-[#050713] to-[#020308]',
      accentColor: '#4CC9F0',
      secondaryColor: '#4361EE',
      textColor: '#FFFFFF',
      sealColor: '#4CC9F0',
      badgeBg: 'rgba(76, 201, 240, 0.15)',
    },
  },
  {
    id: 'ruby_crimson',
    name: 'Tech Crimson Executive',
    badge: 'CRIMSON GOLD',
    theme: {
      borderGradient: 'from-[#FF4A15] via-[#E63946] to-[#F72585]',
      bgGradient: 'from-[#1A0A08] via-[#100504] to-[#080202]',
      accentColor: '#FF4A15',
      secondaryColor: '#E63946',
      textColor: '#FFFFFF',
      sealColor: '#FF4A15',
      badgeBg: 'rgba(255, 74, 21, 0.15)',
    },
  },
];

export const DEFAULT_CERTIFICATE_SIGNATORIES: CertificateSignatory[] = [
  {
    name: 'Dr. G. M. Asutkar',
    title: 'Principal & Patron',
    role: 'Priyadarshini Institute of Engineering & Technology',
  },
  {
    name: 'Dr. (Mrs.) R. S. Somkuwar',
    title: 'Head of Department',
    role: 'Department of Electronics & Communication',
  },
  {
    name: 'Prof. V. P. Balpande',
    title: 'Faculty Convener',
    role: 'SPACE & SINC Forum Council',
  },
  {
    name: 'Executive President',
    title: 'Student Forum President',
    role: 'ECE Student Leadership Council',
  },
];

const STORAGE_KEY = 'ece_forum_certificates_cache';

class CertificateService {
  private certificates: ApiCertificate[] = [];

  constructor() {
    this.loadFromStorage();
    this.syncWithBackend();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) this.loadFromStorage();
      });
      window.addEventListener('ece_certificates_updated', () => {
        this.syncWithBackend();
      });
    }
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.certificates = JSON.parse(saved);
      }
    } catch {}
  }

  public async syncWithBackend(): Promise<ApiCertificate[]> {
    try {
      // 1. Fetch from direct Supabase
      const supa = await supabaseDb.getCertificates();
      if (Array.isArray(supa) && supa.length > 0) {
        const formatted: ApiCertificate[] = supa.map((c: any) => ({
          certId: c.cert_id,
          eventId: c.event_id,
          eventTitle: c.event_title,
          eventDate: c.event_date,
          userName: c.user_name,
          userEmail: c.user_email,
          userPhoto: c.user_photo,
          department: c.department || 'Electronics & Communication Engineering',
          collegeName: c.college_name || 'PIET, Nagpur',
          certType: c.cert_type || 'PARTICIPATION',
          title: c.title || 'Certificate of Participation',
          rankText: c.rank_text || 'Participant',
          description: c.description || '',
          templateId: c.template_id || 'classic_gold',
          templateBg: c.template_bg || undefined,
          signatories: c.signatories || DEFAULT_CERTIFICATE_SIGNATORIES,
          qrData: c.qr_data,
          securityHash: c.security_hash,
          status: c.status || 'VALID',
          issuedAt: c.issued_at,
          issuedBy: c.issued_by || 'ECE Forum Executive Council',
        }));
        this.certificates = formatted;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formatted));
        return formatted;
      }
    } catch {}

    // 2. Fetch from REST API
    try {
      const rest = await forumApi.getCertificates();
      if (Array.isArray(rest) && rest.length > 0) {
        this.certificates = rest;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
        return rest;
      }
    } catch {}

    return this.certificates;
  }

  public getAllCertificates(): ApiCertificate[] {
    return this.certificates;
  }

  public getUserCertificates(email?: string): ApiCertificate[] {
    if (!email) return [];
    const clean = email.trim().toLowerCase();
    return this.certificates.filter((c) => (c.userEmail || '').trim().toLowerCase() === clean);
  }

  public getEventCertificates(eventId: string): ApiCertificate[] {
    if (!eventId || eventId === 'all') return this.certificates;
    return this.certificates.filter((c) => c.eventId === eventId);
  }

  public getCertificateById(certId: string): ApiCertificate | undefined {
    const clean = certId.trim().toUpperCase();
    return this.certificates.find((c) => c.certId.toUpperCase() === clean);
  }

  public generateVerificationQrUrl(certId: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ece-at-pce.vercel.app';
    return `${origin}/verify/${encodeURIComponent(certId.trim())}`;
  }
}

export const certificateService = new CertificateService();
