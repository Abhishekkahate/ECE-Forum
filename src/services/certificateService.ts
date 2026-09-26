import { supabase, isSupabaseConfigured, supabaseDb } from './supabase';
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
    role: 'PCE-NAGPUR (Priyadarshini College of Engineering)',
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
  private lastSyncTimestamp = 0;
  private isSyncing = false;
  private realtimeChannel: any = null;

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) this.loadFromStorage();
      });
      window.addEventListener('ece_certificates_updated', () => {
        this.loadFromStorage();
      });
      this.setupRealtimeChannel();
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

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.certificates));
    } catch {}
  }

  public notifyListeners() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ece_certificates_updated'));
    }
  }

  public subscribe(listener: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = () => listener();
    window.addEventListener('ece_certificates_updated', handler);
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) handler();
    });
    return () => {
      window.removeEventListener('ece_certificates_updated', handler);
    };
  }

  private setupRealtimeChannel() {
    if (!isSupabaseConfigured || typeof window === 'undefined') return;
    try {
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel);
      }
      this.realtimeChannel = supabase
        .channel('ece_certificates_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'certificates' },
          (payload: any) => {
            this.handleRealtimePayload(payload);
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime Supabase certificate subscription failed:', err);
    }
  }

  private handleRealtimePayload(payload: any) {
    try {
      const eventType = payload.eventType;
      if (eventType === 'DELETE') {
        const deletedId = (payload.old?.cert_id || '').trim().toUpperCase();
        if (deletedId) {
          this.certificates = this.certificates.filter(
            (c) => c.certId.toUpperCase() !== deletedId && (c.securityHash || '').toUpperCase() !== deletedId
          );
          this.saveToStorage();
          this.notifyListeners();
        }
        return;
      }

      const row = payload.new;
      if (!row || !row.cert_id) return;

      const cert: ApiCertificate = {
        certId: row.cert_id,
        eventId: row.event_id,
        eventTitle: row.event_title,
        eventDate: row.event_date,
        userName: row.user_name,
        userEmail: row.user_email,
        userPhoto: row.user_photo,
        department: row.department || 'Electronics & Communication Engineering',
        collegeName: row.college_name || 'PCE-NAGPUR',
        certType: row.cert_type || 'PARTICIPATION',
        title: row.title || 'Certificate of Participation',
        rankText: row.rank_text || 'Participant',
        description: row.description || '',
        templateId: row.template_id || 'classic_gold',
        templateBg: row.template_bg || undefined,
        certificateImage: row.certificate_image || (row.template_bg && row.template_bg.startsWith('data:image/') ? row.template_bg : undefined),
        canvasConfig: row.canvas_config || undefined,
        signatories: row.signatories || DEFAULT_CERTIFICATE_SIGNATORIES,
        qrData: row.qr_data,
        securityHash: row.security_hash,
        status: (row.status || 'VALID') as 'VALID' | 'REVOKED',
        issuedAt: row.issued_at,
        issuedBy: row.issued_by || 'ECE Forum Executive Council',
      };

      const idx = this.certificates.findIndex(
        (c) => c.certId.toUpperCase() === cert.certId.toUpperCase()
      );
      if (idx >= 0) {
        this.certificates[idx] = { ...this.certificates[idx], ...cert };
      } else {
        this.certificates.unshift(cert);
      }
      this.saveToStorage();
      this.notifyListeners();
    } catch (e) {
      console.warn('Error handling realtime certificate update:', e);
    }
  }

  public async syncWithBackend(force = false, userEmail?: string, isAdmin = false): Promise<ApiCertificate[]> {
    const now = Date.now();
    if (!force && (this.isSyncing || now - this.lastSyncTimestamp < 15000)) {
      return this.certificates;
    }

    let emailToSync = userEmail;
    if (!isAdmin && !emailToSync && typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('ece_forum_auth_user_v1');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed?.email) emailToSync = parsed.email.trim().toLowerCase();
        }
      } catch {}
    }

    // If not admin and no active user email, do not query
    if (!isAdmin && !emailToSync) {
      return this.certificates;
    }

    this.isSyncing = true;
    try {
      // 1. Fetch from direct Supabase (all if admin, scoped if student)
      const supa = await supabaseDb.getCertificates(undefined, isAdmin ? undefined : emailToSync);
      this.lastSyncTimestamp = Date.now();
      if (Array.isArray(supa)) {
        const formatted: ApiCertificate[] = supa.map((c: any) => ({
          certId: c.cert_id,
          eventId: c.event_id,
          eventTitle: c.event_title,
          eventDate: c.event_date,
          userName: c.user_name,
          userEmail: c.user_email,
          userPhoto: c.user_photo,
          department: c.department || 'Electronics & Communication Engineering',
          collegeName: c.college_name || 'PCE-NAGPUR',
          certType: c.cert_type || 'PARTICIPATION',
          title: c.title || 'Certificate of Participation',
          rankText: c.rank_text || 'Participant',
          description: c.description || '',
          templateId: c.template_id || 'classic_gold',
          templateBg: c.template_bg || undefined,
          certificateImage: c.certificate_image || (c.template_bg && c.template_bg.startsWith('data:image/') ? c.template_bg : undefined),
          canvasConfig: c.canvas_config || undefined,
          signatories: c.signatories || DEFAULT_CERTIFICATE_SIGNATORIES,
          qrData: c.qr_data,
          securityHash: c.security_hash,
          status: (c.status || 'VALID') as 'VALID' | 'REVOKED',
          issuedAt: c.issued_at,
          issuedBy: c.issued_by || 'ECE Forum Executive Council',
        }));

        if (isAdmin) {
          // Admin gets complete database list
          this.certificates = formatted;
        } else if (emailToSync) {
          // Student gets authoritative replace for their email (purges deleted/revoked certs)
          const otherCerts = this.certificates.filter(
            (c) => (c.userEmail || '').trim().toLowerCase() !== emailToSync
          );
          this.certificates = [...otherCerts, ...formatted];
        }

        this.saveToStorage();
        this.notifyListeners();
        return this.certificates;
      }
    } catch (err) {
      console.warn('CertificateService sync error:', err);
    } finally {
      this.isSyncing = false;
    }

    return this.certificates;
  }

  public syncUserCertificates(userEmail: string, authoritativeCerts: ApiCertificate[]) {
    const clean = userEmail.trim().toLowerCase();
    const otherCerts = this.certificates.filter(
      (c) => (c.userEmail || '').trim().toLowerCase() !== clean
    );
    this.certificates = [...otherCerts, ...authoritativeCerts];
    this.saveToStorage();
    this.notifyListeners();
  }

  public removeCertificate(certId: string) {
    const clean = certId.trim().toUpperCase();
    this.certificates = this.certificates.filter(
      (c) => c.certId.toUpperCase() !== clean && (c.securityHash || '').toUpperCase() !== clean
    );
    this.saveToStorage();
    this.notifyListeners();
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
    return this.certificates.find(
      (c) => c.certId.toUpperCase() === clean || (c.securityHash || '').toUpperCase() === clean
    );
  }

  public generateVerificationQrUrl(certId: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ece-at-pce.vercel.app';
    return `${origin}/verify/${encodeURIComponent(certId.trim())}`;
  }
}

export const certificateService = new CertificateService();
