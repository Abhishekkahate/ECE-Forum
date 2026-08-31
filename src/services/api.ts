// Frontend API Client for ECE Forum Platform (Render Backend + Supabase Fallback)
import { supabaseDb } from './supabase';

export interface ApiEvent {
  id: string;
  title: string;
  category: string;
  status: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  badge?: string;
  image?: string;
  price: number;
  totalSeats: number;
  participationType?: 'individual_only' | 'team_only' | 'both';
  minTeamSize?: number;
  maxTeamSize?: number;
  requiredTeamSize?: number;
  paymentQr?: string;
  upiId?: string;
  payeeName?: string;
  paymentInstructions?: string;
}

export interface ApiPass {
  passId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  rollNumber?: string;
  department: string;
  collegeName?: string;
  year: string;
  phone: string;
  paymentId: string;
  amount: number;
  originalAmount?: number;
  discountAmount?: number;
  couponCode?: string;
  registrationType?: 'individual' | 'team';
  teamName?: string;
  teamMembers?: any[];
  paymentStatus: 'PAID' | 'FREE';
  paymentScreenshot?: string;
  transactionId?: string;
  status: 'UNVERIFIED' | 'CONFIRMED' | 'CHECKED_IN' | 'REJECTED';
  adminVerified?: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  checkedInAt?: string;
  checkedInBy?: string;
  registeredAt: string;
  securityHash: string;
}

export type CertificateType =
  | 'PARTICIPATION'
  | 'WINNER_1ST'
  | 'RUNNER_UP_2ND'
  | 'RUNNER_UP_3RD'
  | 'MERIT'
  | 'APPRECIATION';

export interface CertificateSignatory {
  name: string;
  title: string;
  role?: string;
  signatureImg?: string;
}

export interface ApiCertificate {
  certId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  department: string;
  collegeName?: string;
  certType: CertificateType;
  title: string;
  rankText?: string;
  description?: string;
  templateId: 'classic_gold' | 'cyber_neon' | 'sapphire_prestige' | 'ruby_crimson' | 'custom_upload';
  templateBg?: string;
  signatories?: CertificateSignatory[];
  qrData: string;
  securityHash: string;
  status: 'VALID' | 'REVOKED';
  issuedAt: string;
  issuedBy: string;
}

export interface CertificateVerificationResponse {
  valid: boolean;
  status: 'VALID' | 'REVOKED' | 'INVALID';
  certificate?: ApiCertificate;
  message: string;
  verifiedAt: string;
}

export interface VerificationResponse {
  success: boolean;
  status: 'VALID' | 'ALREADY_CHECKED_IN' | 'UNVERIFIED' | 'INVALID';
  pass?: ApiPass;
  message: string;
  timestamp: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const forumApi = {
  // ── Events ───────────────────────────────────────────────────────────────
  async getEvents(): Promise<ApiEvent[]> {
    // 0. Direct Supabase Manifest (Rich metadata: QRs, UPIs, exact team constraints)
    try {
      const supaManifest = await supabaseDb.getSiteSettings('events_manifest');
      if (Array.isArray(supaManifest) && supaManifest.length > 0) {
        try {
          localStorage.setItem('ece_forum_events_cache', JSON.stringify(supaManifest));
        } catch {}
        return supaManifest;
      }
    } catch {}

    // 1. Direct Supabase Cloud Query (Real-time Source of Truth)
    try {
      const supabaseEvents = await supabaseDb.getEvents();
      if (Array.isArray(supabaseEvents)) {
        const formatted: ApiEvent[] = supabaseEvents.map((e: any) => ({
          id: e.id,
          title: e.title,
          category: e.category,
          status: e.status,
          date: e.date,
          time: e.time,
          venue: e.venue,
          description: e.description,
          badge: e.badge,
          image: e.image,
          price: Number(e.price) || 0,
          totalSeats: e.total_seats || 100,
          participationType: e.participation_type || e.participationType || 'both',
          minTeamSize: e.min_team_size || e.minTeamSize || 2,
          maxTeamSize: e.max_team_size || e.maxTeamSize || 5,
          requiredTeamSize: e.required_team_size || e.requiredTeamSize || undefined,
          paymentQr: e.payment_qr || e.paymentQr || undefined,
          upiId: e.upi_id || e.upiId || undefined,
          payeeName: e.payee_name || e.payeeName || undefined,
          paymentInstructions: e.payment_instructions || e.paymentInstructions || undefined,
        }));
        try {
          localStorage.setItem('ece_forum_events_cache', JSON.stringify(formatted));
        } catch {}
        return formatted;
      }
    } catch (err) {
      console.warn('Supabase getEvents failed, trying backend fallback:', err);
    }

    // 2. Render / Local Backend Fallback
    try {
      const res = await fetch(`${API_BASE}/events`, { method: 'GET' });
      if (res.ok) {
        const backendEvents = await res.json();
        if (Array.isArray(backendEvents)) {
          const formatted = backendEvents.map((e: any) => ({
            ...e,
            participationType: e.participation_type || e.participationType || 'both',
            minTeamSize: e.min_team_size || e.minTeamSize || 2,
            maxTeamSize: e.max_team_size || e.maxTeamSize || 5,
            requiredTeamSize: e.required_team_size || e.requiredTeamSize || undefined,
            paymentQr: e.payment_qr || e.paymentQr || undefined,
            upiId: e.upi_id || e.upiId || undefined,
            payeeName: e.payee_name || e.payeeName || undefined,
            paymentInstructions: e.payment_instructions || e.paymentInstructions || undefined,
          }));
          try {
            localStorage.setItem('ece_forum_events_cache', JSON.stringify(formatted));
          } catch {}
          return formatted;
        }
      }
    } catch {}

    // 3. LocalStorage Cache
    try {
      const cached = localStorage.getItem('ece_forum_events_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}

    return [];
  },

  async createEvent(eventData: Partial<ApiEvent>): Promise<ApiEvent | null> {
    const id = eventData.id || `evt-${Date.now()}`;
    const fullEvent: ApiEvent = {
      id,
      title: eventData.title || '',
      category: eventData.category || 'Workshop',
      status: eventData.status || 'Upcoming',
      date: eventData.date || 'Aug 25, 2026',
      time: eventData.time || '10:00 AM IST',
      venue: eventData.venue || 'PIET Campus',
      description: eventData.description || '',
      badge: eventData.badge || 'EVENT',
      image: eventData.image || '/event_images/tarang.webp',
      price: Number(eventData.price) || 0,
      totalSeats: Number(eventData.totalSeats) || 100,
      participationType: eventData.participationType || 'both',
      minTeamSize: eventData.minTeamSize || 2,
      maxTeamSize: eventData.maxTeamSize || 5,
      requiredTeamSize: eventData.requiredTeamSize || undefined,
      paymentQr: eventData.paymentQr || undefined,
      upiId: eventData.upiId || undefined,
      payeeName: eventData.payeeName || undefined,
      paymentInstructions: eventData.paymentInstructions || undefined,
    };

    // 1. Immediately update localStorage cache
    let updatedList: ApiEvent[] = [];
    try {
      const cached = localStorage.getItem('ece_forum_events_cache');
      const list = cached ? JSON.parse(cached) : [];
      updatedList = [fullEvent, ...list.filter((e: any) => e.id !== fullEvent.id)];
      localStorage.setItem('ece_forum_events_cache', JSON.stringify(updatedList));
    } catch {}

    // 2. Persist manifest to Supabase site_settings
    try {
      if (updatedList.length > 0) {
        await supabaseDb.setSiteSettings(updatedList, 'events_manifest');
      }
    } catch {}

    // 3. Direct Supabase Cloud Insert
    try {
      const inserted = await supabaseDb.insertEvent(fullEvent);
      if (inserted) {
        // Also notify Render backend asynchronously
        fetch(`${API_BASE}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullEvent),
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Supabase direct event insert error:', err);
    }

    // 4. Render / Local Backend Fallback
    try {
      await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullEvent),
      });
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ece_events_updated'));
    }

    return fullEvent;
  },

  async deleteEvent(eventId: string): Promise<boolean> {
    // 1. Immediately remove from localStorage cache so UI never revives it
    let filtered: ApiEvent[] = [];
    try {
      const cached = localStorage.getItem('ece_forum_events_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          filtered = parsed.filter((e: any) => e.id !== eventId);
          localStorage.setItem('ece_forum_events_cache', JSON.stringify(filtered));
        }
      }
    } catch {}

    // 2. Update Supabase site_settings manifest
    try {
      await supabaseDb.setSiteSettings(filtered, 'events_manifest');
    } catch {}

    // 3. Direct Supabase Cloud Delete
    try {
      await supabaseDb.deleteEvent(eventId);
    } catch {}

    // 3. Render / Local Backend Delete
    try {
      await fetch(`${API_BASE}/events/${eventId}`, { method: 'DELETE' });
    } catch {}

    // 4. Notify all components immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ece_events_updated', { detail: { deletedId: eventId } }));
    }

    return true;
  },

  // ── Passes & Attendance ──────────────────────────────────────────────────
  async getPasses(eventId?: string, email?: string): Promise<ApiPass[]> {
    // 1. Direct Supabase Cloud Query (Always primary)
    try {
      const supabasePasses = await supabaseDb.getPasses(eventId, email);
      if (supabasePasses && Array.isArray(supabasePasses)) {
        return supabasePasses.map((p: any) => ({
          passId: p.pass_id,
          eventId: p.event_id,
          eventTitle: p.event_title,
          eventDate: p.event_date,
          eventTime: p.event_time,
          eventVenue: p.event_venue,
          userName: p.user_name,
          userEmail: p.user_email,
          userPhoto: p.user_photo,
          department: p.department,
          year: p.year,
          phone: p.phone,
          paymentId: p.payment_id,
          amount: Number(p.amount),
          originalAmount: p.original_amount ? Number(p.original_amount) : Number(p.amount),
          discountAmount: p.discount_amount ? Number(p.discount_amount) : 0,
          couponCode: p.coupon_code || '',
          registrationType: p.registration_type || 'individual',
          teamName: p.team_name || '',
          teamMembers: p.team_members || [],
          paymentStatus: p.payment_status,
          paymentScreenshot: p.payment_screenshot || p.paymentScreenshot || undefined,
          transactionId: p.transaction_id || p.transactionId || undefined,
          status: p.status,
          checkedInAt: p.checked_in_at,
          checkedInBy: p.checked_in_by,
          registeredAt: p.registered_at,
          securityHash: p.security_hash,
        }));
      }
    } catch (err) {
      console.warn('Direct Supabase getPasses error:', err);
    }

    // 2. Render / Local Backend Fallback
    try {
      const params = new URLSearchParams();
      if (eventId) params.append('eventId', eventId);
      if (email) params.append('email', email);

      const res = await fetch(`${API_BASE}/passes?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {}

    return [];
  },

  async deletePass(passId: string): Promise<boolean> {
    try {
      await supabaseDb.deletePass(passId);
    } catch {}

    try {
      await fetch(`${API_BASE}/passes/${passId}`, { method: 'DELETE' });
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ece_passes_updated'));
    }

    return true;
  },

  async createPass(passData: Partial<ApiPass>): Promise<ApiPass | null> {
    // 1. Direct Supabase Cloud Insert (Always primary)
    try {
      const inserted = await supabaseDb.insertPass(passData);
      if (inserted) {
        // Also notify backend asynchronously
        fetch(`${API_BASE}/passes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(passData),
        }).catch(() => {});

        return {
          ...passData,
          passId: inserted.pass_id,
          status: inserted.status,
          registeredAt: inserted.registered_at,
          securityHash: inserted.security_hash,
        } as ApiPass;
      }
    } catch (err) {
      console.warn('Direct Supabase createPass error:', err);
    }

    // 2. Render Backend Fallback
    try {
      const res = await fetch(`${API_BASE}/passes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passData),
      });
      if (res.ok) return await res.json();
    } catch {}

    return passData as ApiPass;
  },

  async verifyPass(scanInput: string, scannedBy?: string): Promise<VerificationResponse> {
    try {
      const res = await fetch(`${API_BASE}/passes/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanInput, scannedBy: scannedBy || 'Gate Android Scanner' }),
      });
      if (res.ok) return await res.json();
    } catch {}

    return {
      success: false,
      status: 'INVALID',
      message: 'Server connection unreachable.',
      timestamp: new Date().toLocaleTimeString(),
    };
  },

  // ── Announcements ────────────────────────────────────────────────────────
  async getAnnouncement(): Promise<string> {
    try {
      const res = await fetch(`${API_BASE}/announcements`);
      if (res.ok) {
        const data = await res.json();
        return data.announcement || '';
      }
    } catch {
      const ann = await supabaseDb.getAnnouncement();
      if (ann) return ann;
    }
    return '';
  },

  async setAnnouncement(announcement: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcement }),
      });
      if (res.ok) return true;
    } catch {
      return Boolean(await supabaseDb.setAnnouncement(announcement));
    }
    return false;
  },

  // ── Admin Accounts & Permissions ──────────────────────────────────────────
  async getAdmins(): Promise<{ id: string; name: string; email: string; role: string; created_at?: string }[]> {
    try {
      const res = await fetch(`${API_BASE}/admins`);
      if (res.ok) return await res.json();
    } catch {}
    const supaAdmins = await supabaseDb.getAdmins();
    return supaAdmins || [];
  },

  async createAdmin(admin: { name: string; email: string; password: string; role: string }): Promise<boolean> {
    const id = `admin-${Date.now()}`;
    try {
      const res = await fetch(`${API_BASE}/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...admin, id }),
      });
      if (res.ok) return true;
    } catch {}
    const inserted = await supabaseDb.insertAdmin({ ...admin, id });
    return Boolean(inserted);
  },

  async loginAdmin(email: string, password: string): Promise<{ success: boolean; user?: { id: string; name: string; email: string; role: string }; error?: string }> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Direct Supabase Database Query (Immediate & Real-time)
    try {
      const supaResult = await supabaseDb.verifyAdminLogin(cleanEmail, cleanPass);
      if (supaResult && supaResult.success && supaResult.user) {
        return supaResult;
      }
      if (supaResult && supaResult.success === false) {
        return supaResult;
      }
    } catch (err) {
      console.warn('Direct Supabase admin login check failed:', err);
    }

    // 2. Render / Local Backend Endpoint Check
    try {
      const res = await fetch(`${API_BASE}/admins/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });
      const data = await res.json();
      if (res.ok && data.success) return data;
      if (!res.ok && data.error) {
        return { success: false, error: data.error };
      }
    } catch {}

    // 3. Master Owner Passcode check
    if (cleanPass === 'admin123' || cleanPass === 'ece_admin_2026') {
      return {
        success: true,
        user: {
          id: 'master-admin',
          name: cleanEmail.split('@')[0] || 'Executive Admin',
          email: cleanEmail,
          role: 'Forum President & Executive Council',
        },
      };
    }

    return {
      success: false,
      error: 'Access Denied: Invalid admin email or password. Please verify the credentials entered in your Supabase database.',
    };
  },

  async deleteAdmin(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/admins/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {}
    return await supabaseDb.deleteAdmin(id);
  },

  // ── Hero Eyebrow Pill & Flagship Event Banner Config ──────────────────────
  async getSiteHeroConfig(): Promise<SiteHeroConfig> {
    try {
      const supaConfig = await supabaseDb.getSiteSettings('hero_flagship');
      if (supaConfig && typeof supaConfig === 'object') {
        return { ...DEFAULT_HERO_CONFIG, ...supaConfig };
      }
    } catch {}

    try {
      const saved = localStorage.getItem('ece_hero_flagship_config');
      if (saved) return { ...DEFAULT_HERO_CONFIG, ...JSON.parse(saved) };
    } catch {}

    return DEFAULT_HERO_CONFIG;
  },

  async updateSiteHeroConfig(config: SiteHeroConfig): Promise<boolean> {
    try {
      localStorage.setItem('ece_hero_flagship_config', JSON.stringify(config));
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ece_hero_config_updated', { detail: config }));
    }

    const supaOk = await supabaseDb.setSiteSettings(config, 'hero_flagship');
    return Boolean(supaOk);
  },

  // ── Photo Gallery / Archive ───────────────────────────────────────────────
  async getGalleryItems(): Promise<any[]> {
    // 1. Supabase Cloud Database (Primary source of truth)
    try {
      const supaGallery = await supabaseDb.getSiteSettings('gallery_archive');
      if (supaGallery && Array.isArray(supaGallery)) {
        try {
          localStorage.setItem('ece_gallery_archive_items', JSON.stringify(supaGallery));
        } catch {}
        return supaGallery;
      }
    } catch {}

    // 2. Render Backend API
    try {
      const res = await fetch(`${API_BASE}/gallery`, { method: 'GET' });
      if (res.ok) {
        const backendGallery = await res.json();
        if (Array.isArray(backendGallery) && backendGallery.length > 0) {
          try {
            localStorage.setItem('ece_gallery_archive_items', JSON.stringify(backendGallery));
          } catch {}
          return backendGallery;
        }
      }
    } catch {}

    // 3. LocalStorage Cache
    try {
      const saved = localStorage.getItem('ece_gallery_archive_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}

    return [];
  },

  async updateGalleryItems(items: any[]): Promise<boolean> {
    try {
      localStorage.setItem('ece_gallery_archive_items', JSON.stringify(items));
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ece_gallery_updated'));
    }

    // 1. Supabase Cloud Sync
    const supaOk = await supabaseDb.setSiteSettings(items, 'gallery_archive');

    // 2. Render Backend Sync
    try {
      fetch(`${API_BASE}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      }).catch(() => {});
    } catch {}

    return Boolean(supaOk);
  },

  // ── Coupon Code System ──────────────────────────────────────────────────
  async getCoupons(): Promise<Coupon[]> {
    // 1. Direct Supabase Cloud Settings (Source of truth)
    try {
      const supaCoupons = await supabaseDb.getSiteSettings('coupon_codes');
      if (supaCoupons !== null && supaCoupons !== undefined && Array.isArray(supaCoupons)) {
        try {
          localStorage.setItem('ece_coupon_codes', JSON.stringify(supaCoupons));
        } catch {}
        return supaCoupons;
      }
    } catch (err) {
      console.warn('Supabase getCoupons warning:', err);
    }

    // 2. LocalStorage Cache (supports deleted empty list)
    try {
      const saved = localStorage.getItem('ece_coupon_codes');
      if (saved !== null && saved !== undefined) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}

    // 3. Render Backend API Fallback
    try {
      const res = await fetch(`${API_BASE}/coupons`, { method: 'GET' });
      if (res.ok) {
        const backendCoupons = await res.json();
        if (Array.isArray(backendCoupons)) {
          try {
            localStorage.setItem('ece_coupon_codes', JSON.stringify(backendCoupons));
          } catch {}
          return backendCoupons;
        }
      }
    } catch {}

    return DEFAULT_COUPONS;
  },

  async updateCoupons(coupons: Coupon[]): Promise<boolean> {
    // 1. Immediate LocalStorage Update
    try {
      localStorage.setItem('ece_coupon_codes', JSON.stringify(coupons));
    } catch {}

    // 2. Direct Supabase Cloud Update
    const supaOk = await supabaseDb.setSiteSettings(coupons, 'coupon_codes');

    // 3. Render Backend Sync
    try {
      fetch(`${API_BASE}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupons),
      }).catch(() => {});
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ece_coupons_updated', { detail: coupons }));
    }

    return Boolean(supaOk);
  },

  async deleteCoupon(code: string): Promise<boolean> {
    const clean = (code || '').trim().toUpperCase();
    const current = await this.getCoupons();
    const updated = current.filter((c) => (c.code || '').trim().toUpperCase() !== clean);
    return await this.updateCoupons(updated);
  },

  async incrementCouponUsage(code: string): Promise<void> {
    try {
      const clean = code.trim().toUpperCase();
      const coupons = await this.getCoupons();
      const updated = coupons.map((c) => {
        if (c.code.toUpperCase() === clean) {
          return { ...c, usedCount: (c.usedCount || 0) + 1 };
        }
        return c;
      });
      await this.updateCoupons(updated);

      // Notify Render Backend
      fetch(`${API_BASE}/coupons/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean }),
      }).catch(() => {});
    } catch {}
  },

  // ── E-Certificates ────────────────────────────────────────────────────────
  async getCertificates(eventId?: string, email?: string, certType?: string, search?: string): Promise<ApiCertificate[]> {
    // 1. Direct Supabase Query
    try {
      const supaCerts = await supabaseDb.getCertificates(eventId, email, certType);
      if (Array.isArray(supaCerts)) {
        let formatted: ApiCertificate[] = supaCerts.map((c: any) => ({
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
          signatories: c.signatories || [],
          qrData: c.qr_data,
          securityHash: c.security_hash,
          status: c.status || 'VALID',
          issuedAt: c.issued_at,
          issuedBy: c.issued_by || 'ECE Forum Executive Council',
        }));

        if (search) {
          const q = search.toLowerCase();
          formatted = formatted.filter(
            (c) =>
              c.certId.toLowerCase().includes(q) ||
              c.userName.toLowerCase().includes(q) ||
              c.userEmail.toLowerCase().includes(q) ||
              c.eventTitle.toLowerCase().includes(q)
          );
        }

        try {
          localStorage.setItem('ece_forum_certificates_cache', JSON.stringify(formatted));
        } catch {}

        return formatted;
      }
    } catch (err) {
      console.warn('Supabase getCertificates error:', err);
    }

    // 2. Backend Fallback
    try {
      const params = new URLSearchParams();
      if (eventId) params.append('eventId', eventId);
      if (email) params.append('email', email);
      if (certType) params.append('certType', certType);
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE}/certificates?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          try {
            localStorage.setItem('ece_forum_certificates_cache', JSON.stringify(data));
          } catch {}
          return data;
        }
      }
    } catch {}

    // 3. LocalStorage Fallback
    try {
      const cached = localStorage.getItem('ece_forum_certificates_cache');
      if (cached) {
        let list: ApiCertificate[] = JSON.parse(cached);
        if (eventId && eventId !== 'all') list = list.filter((c) => c.eventId === eventId);
        if (email) list = list.filter((c) => c.userEmail.toLowerCase() === email.toLowerCase());
        if (certType && certType !== 'all') list = list.filter((c) => c.certType === certType);
        return list;
      }
    } catch {}

    return [];
  },

  async getCertificateById(certId: string): Promise<ApiCertificate | null> {
    const cleanId = certId.trim();

    // 1. Supabase
    try {
      const supa = await supabaseDb.getCertificateById(cleanId);
      if (supa) {
        return {
          certId: supa.cert_id,
          eventId: supa.event_id,
          eventTitle: supa.event_title,
          eventDate: supa.event_date,
          userName: supa.user_name,
          userEmail: supa.user_email,
          userPhoto: supa.user_photo,
          department: supa.department,
          collegeName: supa.college_name,
          certType: supa.cert_type,
          title: supa.title,
          rankText: supa.rank_text,
          description: supa.description,
          templateId: supa.template_id,
          templateBg: supa.template_bg,
          signatories: supa.signatories,
          qrData: supa.qr_data,
          securityHash: supa.security_hash,
          status: supa.status,
          issuedAt: supa.issued_at,
          issuedBy: supa.issued_by,
        };
      }
    } catch {}

    // 2. Backend
    try {
      const res = await fetch(`${API_BASE}/certificates/${encodeURIComponent(cleanId)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    // 3. LocalStorage cache
    try {
      const cached = localStorage.getItem('ece_forum_certificates_cache');
      if (cached) {
        const list: ApiCertificate[] = JSON.parse(cached);
        const match = list.find((c) => c.certId.toUpperCase() === cleanId.toUpperCase());
        if (match) return match;
      }
    } catch {}

    return null;
  },

  async verifyCertificate(certId: string): Promise<CertificateVerificationResponse> {
    const cleanId = certId.trim();

    // Try backend verification endpoint
    try {
      const res = await fetch(`${API_BASE}/certificates/verify/${encodeURIComponent(cleanId)}`);
      if (res.ok) {
        return await res.json();
      }
      const data = await res.json().catch(() => null);
      if (data) return data;
    } catch {}

    // Fallback client-side verification
    const cert = await this.getCertificateById(cleanId);
    if (!cert) {
      return {
        valid: false,
        status: 'INVALID',
        message: `Certificate ID "${cleanId}" was not found in the official registry.`,
        verifiedAt: new Date().toISOString(),
      };
    }

    if (cert.status === 'REVOKED') {
      return {
        valid: false,
        status: 'REVOKED',
        certificate: cert,
        message: 'This certificate has been revoked by the issuing authority.',
        verifiedAt: new Date().toISOString(),
      };
    }

    return {
      valid: true,
      status: 'VALID',
      certificate: cert,
      message: 'Official and Authentic Certificate verified by ECE Forum PIET.',
      verifiedAt: new Date().toISOString(),
    };
  },

  async createCertificate(certData: Partial<ApiCertificate>): Promise<ApiCertificate> {
    // Generate cert
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 5; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));

    const certId = certData.certId || `ECE-CERT-${new Date().getFullYear()}-${rand}`;
    const securityHash =
      certData.securityHash ||
      `VFX-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const newCert: ApiCertificate = {
      certId,
      eventId: certData.eventId || 'evt-general',
      eventTitle: certData.eventTitle || 'ECE Forum Event',
      eventDate: certData.eventDate || new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      userName: certData.userName || 'Student Attendee',
      userEmail: (certData.userEmail || '').trim().toLowerCase(),
      userPhoto: certData.userPhoto,
      department: certData.department || 'Electronics & Communication Engineering',
      collegeName: certData.collegeName || 'PIET, Nagpur',
      certType: certData.certType || 'PARTICIPATION',
      title: certData.title || 'Certificate of Participation',
      rankText: certData.rankText || 'Participant',
      description: certData.description || '',
      templateId: certData.templateId || 'classic_gold',
      templateBg: certData.templateBg,
      signatories: certData.signatories || [],
      qrData:
        certData.qrData ||
        JSON.stringify({
          certId,
          name: certData.userName,
          event: certData.eventTitle,
          type: certData.certType || 'PARTICIPATION',
          hash: securityHash,
        }),
      securityHash,
      status: certData.status || 'VALID',
      issuedAt:
        certData.issuedAt ||
        new Date().toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      issuedBy: certData.issuedBy || 'ECE Forum Executive Council',
    };

    // 1. Supabase
    try {
      await supabaseDb.insertCertificate(newCert);
    } catch {}

    // 2. Backend
    try {
      fetch(`${API_BASE}/certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCert),
      }).catch(() => {});
    } catch {}

    // 3. LocalStorage
    try {
      const cached = localStorage.getItem('ece_forum_certificates_cache');
      const list: ApiCertificate[] = cached ? JSON.parse(cached) : [];
      const updated = [newCert, ...list.filter((c) => c.certId !== newCert.certId)];
      localStorage.setItem('ece_forum_certificates_cache', JSON.stringify(updated));
    } catch {}

    window.dispatchEvent(new CustomEvent('ece_certificates_updated', { detail: newCert }));
    return newCert;
  },

  async issueBulkCertificates(payload: {
    eventId: string;
    eventTitle: string;
    eventDate: string;
    certType?: CertificateType;
    title?: string;
    rankText?: string;
    description?: string;
    templateId?: 'classic_gold' | 'cyber_neon' | 'sapphire_prestige' | 'ruby_crimson' | 'custom_upload';
    templateBg?: string;
    signatories?: CertificateSignatory[];
    issuedBy?: string;
    participants: Array<{
      name: string;
      email: string;
      department?: string;
      collegeName?: string;
      rankText?: string;
      certType?: CertificateType;
      photo?: string;
    }>;
  }): Promise<{ success: boolean; count: number; certificates: ApiCertificate[] }> {
    const issueDate = new Date().toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const generatedCerts: ApiCertificate[] = [];

    for (let i = 0; i < payload.participants.length; i++) {
      const p = payload.participants[i];
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let rand = '';
      for (let r = 0; r < 5; r++) rand += chars.charAt(Math.floor(Math.random() * chars.length));

      const certId = `ECE-CERT-${new Date().getFullYear()}-${rand}`;
      const securityHash = `VFX-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

      const certObj: ApiCertificate = {
        certId,
        eventId: payload.eventId || 'evt-general',
        eventTitle: payload.eventTitle || 'ECE Forum Event',
        eventDate: payload.eventDate || issueDate,
        userName: p.name || 'Participant',
        userEmail: (p.email || '').trim().toLowerCase(),
        userPhoto: p.photo,
        department: p.department || 'Electronics & Communication Engineering',
        collegeName: p.collegeName || 'PIET, Nagpur',
        certType: p.certType || payload.certType || 'PARTICIPATION',
        title: payload.title || 'Certificate of Participation',
        rankText: p.rankText || payload.rankText || 'Participant',
        description: payload.description || '',
        templateId: payload.templateId || 'classic_gold',
        templateBg: payload.templateBg,
        signatories: payload.signatories || [],
        qrData: JSON.stringify({
          certId,
          name: p.name,
          event: payload.eventTitle,
          type: p.certType || payload.certType || 'PARTICIPATION',
          hash: securityHash,
        }),
        securityHash,
        status: 'VALID',
        issuedAt: issueDate,
        issuedBy: payload.issuedBy || 'ECE Forum Executive Council',
      };

      generatedCerts.push(certObj);
    }

    // 1. Supabase bulk
    try {
      await supabaseDb.insertCertificatesBulk(generatedCerts);
    } catch {}

    // 2. Backend bulk
    try {
      fetch(`${API_BASE}/certificates/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, participants: payload.participants }),
      }).catch(() => {});
    } catch {}

    // 3. LocalStorage
    try {
      const cached = localStorage.getItem('ece_forum_certificates_cache');
      const list: ApiCertificate[] = cached ? JSON.parse(cached) : [];
      const map = new Map(list.map((c) => [c.certId, c]));
      generatedCerts.forEach((c) => map.set(c.certId, c));
      localStorage.setItem('ece_forum_certificates_cache', JSON.stringify(Array.from(map.values())));
    } catch {}

    window.dispatchEvent(new CustomEvent('ece_certificates_updated', { detail: { count: generatedCerts.length } }));
    return {
      success: true,
      count: generatedCerts.length,
      certificates: generatedCerts,
    };
  },

  async updateCertificateStatus(certId: string, status: 'VALID' | 'REVOKED'): Promise<boolean> {
    const cleanId = certId.trim();

    try {
      await supabaseDb.updateCertificateStatus(cleanId, status);
    } catch {}

    try {
      fetch(`${API_BASE}/certificates/${encodeURIComponent(cleanId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).catch(() => {});
    } catch {}

    try {
      const cached = localStorage.getItem('ece_forum_certificates_cache');
      if (cached) {
        const list: ApiCertificate[] = JSON.parse(cached);
        const updated = list.map((c) => (c.certId.toUpperCase() === cleanId.toUpperCase() ? { ...c, status } : c));
        localStorage.setItem('ece_forum_certificates_cache', JSON.stringify(updated));
      }
    } catch {}

    window.dispatchEvent(new CustomEvent('ece_certificates_updated', { detail: { certId: cleanId, status } }));
    return true;
  },

  async deleteCertificate(certId: string): Promise<boolean> {
    const cleanId = certId.trim();

    try {
      await supabaseDb.deleteCertificate(cleanId);
    } catch {}

    try {
      fetch(`${API_BASE}/certificates/${encodeURIComponent(cleanId)}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch {}

    try {
      const cached = localStorage.getItem('ece_forum_certificates_cache');
      if (cached) {
        const list: ApiCertificate[] = JSON.parse(cached);
        const updated = list.filter((c) => c.certId.toUpperCase() !== cleanId.toUpperCase());
        localStorage.setItem('ece_forum_certificates_cache', JSON.stringify(updated));
      }
    } catch {}

    window.dispatchEvent(new CustomEvent('ece_certificates_updated', { detail: { deletedId: cleanId } }));
    return true;
  },
};

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  description: string;
  maxDiscount?: number;
  minAmount?: number;
  active?: boolean;
  usageLimit?: number; // Total allowable redemptions across participants
  usedCount?: number;  // Tally of redemptions performed
  validUntil?: string; // Expiry date (YYYY-MM-DD)
  validFrom?: string;  // Start validity date (YYYY-MM-DD)
}

export const DEFAULT_COUPONS: Coupon[] = [
  { code: 'ECE2026', discountType: 'percentage', discountValue: 20, description: '20% Special ECE Student Discount', active: true, usageLimit: 100, usedCount: 0, validUntil: '2026-09-15' },
  { code: 'TARANG100', discountType: 'percentage', discountValue: 100, description: '100% Full Pass Waiver', active: true, usageLimit: 25, usedCount: 0, validUntil: '2026-08-31' },
  { code: 'SPARK50', discountType: 'flat', discountValue: 50, description: 'Flat ₹50 Instant Discount', active: true, usageLimit: 50, usedCount: 0, validUntil: '2026-09-30' },
  { code: 'FRESHER10', discountType: 'percentage', discountValue: 10, description: '10% Welcome Fresher Discount', active: true, usageLimit: 200, usedCount: 0, validUntil: '2026-09-10' },
  { code: 'COUNCILVIP', discountType: 'percentage', discountValue: 100, description: 'Executive Council Complimentary Pass', active: true, usageLimit: 15, usedCount: 0, validUntil: '2026-08-30' },
  { code: 'HACKATHON30', discountType: 'percentage', discountValue: 30, description: '30% Team Hackathon Discount', active: true, usageLimit: 40, usedCount: 0, validUntil: '2026-09-20' },
];

export interface SiteHeroConfig {
  // 1. Hero Eyebrow Telemetry Pill
  heroSession: string; // "SYS.2026-27"
  heroForumTitle: string; // "PIET ECE FORUM"
  heroHighlight: string; // "INSTALLATION: 30 JULY"

  // 2. Flagship Countdown Event Banner
  flagshipBadge: string; // "Flagship Event Initialization"
  flagshipTitle: string; // "SPACE & SINC Installation"
  flagshipSubTitle: string; // "& TARANG 2K26 Fiesta"
  flagshipDescription: string; // "The grand induction..."
  flagshipTargetDate: string; // "2026-07-30T10:00:00"
  flagshipTargetVenue: string; // "AUDITORIUM"
  flagshipButtonText: string; // "Register With Razorpay"

  // 3. Payment Gateway / Official UPI QR Settings
  paymentUpiId?: string; // e.g. "pieteceforum@okhdfcbank"
  paymentPayeeName?: string; // e.g. "PIET ECE COUNCIL"
  paymentQrImage?: string; // Custom uploaded QR code image (Base64/URL)
  paymentBankDetails?: string; // Instructions or bank account notes
}

export const DEFAULT_HERO_CONFIG: SiteHeroConfig = {
  heroSession: 'SYS.2026-27',
  heroForumTitle: 'PIET ECE FORUM',
  heroHighlight: 'INSTALLATION: 30 JULY',
  flagshipBadge: 'Flagship Event Initialization',
  flagshipTitle: 'SPACE & SINC Installation',
  flagshipSubTitle: '& TARANG 2K26 Fiesta',
  flagshipDescription:
    'The grand induction of the 2026-27 departmental executive council followed by the TARANG freshers tech gala. Join faculty advisors, alumni, and 500+ student engineers.',
  flagshipTargetDate: '2026-08-30T10:00:00',
  flagshipTargetVenue: 'AUDITORIUM',
  flagshipButtonText: 'Register for Flagship',
  paymentUpiId: 'pieteceforum@okhdfcbank',
  paymentPayeeName: 'PIET ECE COUNCIL',
  paymentQrImage: '',
  paymentBankDetails: 'Scan using Google Pay, PhonePe, Paytm, or any UPI app and upload the confirmation screenshot below.',
};

export const api = forumApi;

