import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_URL = 'https://whygrfjcibyhuoedtsor.supabase.co';
const SUPABASE_PROJECT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoeWdyZmpjaWJ5aHVvZWR0c29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNzc4ODMsImV4cCI6MjEwMzY1Mzg4M30.BXlEbix-uxJjaFhHRz3m-OWdTmE1OXmGiRXWdxYW6fg';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_PROJECT_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_PROJECT_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co')
);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

// Supabase Database Query Helpers (Dual-Mode: Cloud Supabase + Fallback)
export const supabaseDb = {
  // Events
  async getEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase getEvents error:', err);
      return null;
    }
  },

  async insertEvent(eventData: any) {
    const id = eventData.id || `evt-${Date.now()}`;
    const payload = {
      id,
      title: eventData.title || '',
      category: eventData.category || 'Workshop',
      status: eventData.status || 'Upcoming',
      date: eventData.date || 'Aug 25, 2026',
      time: eventData.time || '10:00 AM IST',
      venue: eventData.venue || 'PCE-NAGPUR Campus',
      description: eventData.description || '',
      badge: eventData.badge || 'EVENT',
      image: eventData.image || '/event_images/tarang.webp',
      price: Number(eventData.price) || 0,
      total_seats: Number(eventData.totalSeats || eventData.total_seats) || 100,
      custom_fields: eventData.customFields || eventData.custom_fields || [],
    };

    try {
      const { data, error } = await supabase
        .from('events')
        .upsert([payload])
        .select()
        .single();

      if (error) {
        console.warn('Supabase insertEvent error:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('Supabase insertEvent exception:', err);
      return null;
    }
  },

  async deleteEvent(id: string) {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) {
        console.warn('Supabase deleteEvent error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase deleteEvent exception:', err);
      return false;
    }
  },

  // Passes (Lightweight column list without heavy payment_screenshot to minimize database egress)
  async getPasses(eventId?: string, email?: string, includeScreenshot = false): Promise<any[] | null> {
    try {
      const columns = includeScreenshot
        ? '*'
        : 'pass_id, event_id, event_title, event_date, event_time, event_venue, user_name, user_email, user_photo, college_name, department, year, phone, registration_type, team_name, team_members, payment_id, amount, original_amount, discount_amount, coupon_code, payment_status, transaction_id, status, admin_verified, verified_at, verified_by, rejection_reason, checked_in_at, checked_in_by, registered_at, security_hash, custom_fields, created_at';

      let query = supabase
        .from('passes')
        .select(columns as any)
        .order('created_at', { ascending: false });

      if (eventId && eventId !== 'all') {
        query = query.eq('event_id', eventId);
      }
      if (email) {
        query = query.ilike('user_email', email.trim());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase getPasses error:', err);
      return null;
    }
  },

  // On-demand fetch for payment screenshot (avoids loading base64 images into passes list)
  async getPassScreenshot(passId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('passes')
        .select('payment_screenshot')
        .eq('pass_id', passId)
        .single();

      if (error) throw error;
      return data?.payment_screenshot || null;
    } catch (err) {
      console.warn('Supabase getPassScreenshot error:', err);
      return null;
    }
  },

  async insertPass(pass: any) {
    const payload: Record<string, any> = {
      pass_id: pass.passId || pass.pass_id,
      event_id: pass.eventId || pass.event_id,
      event_title: pass.eventTitle || pass.event_title || 'Event',
      event_date: pass.eventDate || pass.event_date || '',
      event_time: pass.eventTime || pass.event_time || '10:00 AM IST',
      event_venue: pass.eventVenue || pass.event_venue || 'PCE-NAGPUR Campus',
      user_name: pass.userName || pass.user_name || 'Attendee',
      user_email: (pass.userEmail || pass.user_email || '').trim().toLowerCase(),
      user_photo: pass.userPhoto || pass.user_photo || null,
      college_name: pass.collegeName || pass.college_name || 'PCE-NAGPUR',
      department: pass.department || 'Electronics & Communication Engineering',
      year: pass.year || '3rd Year',
      phone: pass.phone || '',
      registration_type: pass.registrationType || pass.registration_type || (pass.teamName ? 'team' : 'individual'),
      team_name: pass.teamName || pass.team_name || null,
      team_members: pass.teamMembers || pass.team_members || [],
      payment_id: pass.paymentId || pass.payment_id || 'FREE_PASS',
      amount: Number(pass.amount) || 0,
      original_amount: Number(pass.originalAmount || pass.original_amount || pass.amount) || 0,
      discount_amount: Number(pass.discountAmount || pass.discount_amount) || 0,
      coupon_code: pass.couponCode || pass.coupon_code || null,
      payment_status: pass.paymentStatus || pass.payment_status || 'PAID',
      transaction_id: pass.transactionId || pass.transaction_id || null,
      status: pass.status || 'UNVERIFIED',
      admin_verified: pass.adminVerified !== undefined ? pass.adminVerified : (pass.status === 'CONFIRMED' || pass.status === 'CHECKED_IN'),
      verified_at: pass.verifiedAt || pass.verified_at || null,
      verified_by: pass.verifiedBy || pass.verified_by || null,
      rejection_reason: pass.rejectionReason || pass.rejection_reason || null,
      checked_in_at: pass.checkedInAt || pass.checked_in_at || null,
      checked_in_by: pass.checkedInBy || pass.checked_in_by || null,
      registered_at: pass.registeredAt || pass.registered_at || new Date().toLocaleString('en-IN'),
      security_hash: pass.securityHash || pass.security_hash || 'SEC_HASH',
      custom_fields: pass.customFields || pass.custom_fields || {},
    };

    // Only set payment_screenshot if explicitly provided so we never overwrite an existing screenshot with NULL
    if (pass.paymentScreenshot || pass.payment_screenshot) {
      payload.payment_screenshot = pass.paymentScreenshot || pass.payment_screenshot;
    }

    try {
      const { data, error } = await supabase
        .from('passes')
        .upsert([payload])
        .select()
        .single();

      if (error) {
        console.warn('Supabase insertPass error:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('Supabase insertPass exception:', err);
      return null;
    }
  },

  async deletePass(passId: string) {
    try {
      const { error } = await supabase
        .from('passes')
        .delete()
        .eq('pass_id', passId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase deletePass error:', err);
      return false;
    }
  },

  async updatePassVerification(
    passId: string,
    status: string,
    adminVerified: boolean,
    verifiedAt?: string | null,
    verifiedBy?: string | null,
    rejectionReason?: string | null
  ) {
    try {
      const updateData: any = {
        status,
        admin_verified: adminVerified,
        verified_at: verifiedAt || null,
        verified_by: verifiedBy || null,
      };
      if (rejectionReason !== undefined) {
        updateData.rejection_reason = rejectionReason;
      }
      const { data, error } = await supabase
        .from('passes')
        .update(updateData)
        .eq('pass_id', passId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase updatePassVerification error:', err);
      return null;
    }
  },

  async updatePassStatus(passId: string, status: string, checkedInAt?: string, checkedInBy?: string) {
    try {
      const { data, error } = await supabase
        .from('passes')
        .update({
          status,
          checked_in_at: checkedInAt || null,
          checked_in_by: checkedInBy || null,
        })
        .eq('pass_id', passId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase updatePassStatus error:', err);
      return null;
    }
  },

  // Announcements
  async getAnnouncement() {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('content')
        .eq('id', 1)
        .single();

      if (error) throw error;
      return data?.content || '';
    } catch {
      return null;
    }
  },

  async setAnnouncement(content: string) {
    try {
      const { error } = await supabase
        .from('announcements')
        .upsert({ id: 1, content, updated_at: new Date().toISOString() });

      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  },

  // Admins & Organizers Authentication & Management
  async verifyAdminLogin(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string } | null> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .ilike('email', cleanEmail);

      if (error) {
        console.warn('Supabase admin query error:', error.message);
        return null;
      }

      if (!data || data.length === 0) {
        return null; // Email not found in admins table
      }

      const match = data.find((a) => (a.email || '').trim().toLowerCase() === cleanEmail);
      if (!match) return null;

      if (String(match.password).trim() === cleanPass) {
        const { password: _, ...safeUser } = match;
        return { success: true, user: safeUser };
      } else {
        return { success: false, error: 'Incorrect admin password.' };
      }
    } catch (err: any) {
      console.warn('verifyAdminLogin exception:', err?.message);
      return null;
    }
  },

  async getAdmins() {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('id, name, email, role, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch {
      return null;
    }
  },

  async insertAdmin(admin: { id: string; name: string; email: string; password: string; role: string }) {
    try {
      const { data, error } = await supabase.from('admins').upsert([admin]).select().single();
      if (error) throw error;
      return data;
    } catch {
      return null;
    }
  },

  async deleteAdmin(id: string) {
    try {
      const { error } = await supabase.from('admins').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  // Site Hero & Flagship Content Settings
  async getSiteSettings(key: string = 'hero_flagship') {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();

      if (error) throw error;
      return data?.value || null;
    } catch {
      return null;
    }
  },

  async setSiteSettings(value: any, key: string = 'hero_flagship') {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() });

      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  },

  // Certificates (Bandwidth-Optimized with graceful fallback for all schema variations)
  async getCertificates(eventId?: string, email?: string, certType?: string, includeImage = false): Promise<any[] | null> {
    try {
      // Lightweight columns for list views (omits heavy template_bg to reduce egress by 99%)
      const listColumns =
        'id, cert_id, event_id, event_title, event_date, user_name, user_email, department, college_name, cert_type, title, rank_text, description, template_id, signatories, qr_data, security_hash, status, issued_at, issued_by, created_at';
      const fullColumns =
        'id, cert_id, event_id, event_title, event_date, user_name, user_email, department, college_name, cert_type, title, rank_text, description, template_id, template_bg, signatories, qr_data, security_hash, status, issued_at, issued_by, created_at';
      const columns = includeImage ? fullColumns : listColumns;

      let query = supabase
        .from('certificates')
        .select(columns as any)
        .order('created_at', { ascending: false });

      if (eventId && eventId !== 'all' && eventId !== 'ALL') {
        query = query.eq('event_id', eventId);
      }
      if (email) {
        query = query.ilike('user_email', email.trim().toLowerCase());
      }
      if (certType && certType !== 'all' && certType !== 'ALL') {
        query = query.eq('cert_type', certType);
      }

      const { data, error } = await query;
      if (!error && data) return data;

      // Fallback: select * directly if specific projection encounters cache discrepancy
      if (error) {
        console.warn('Supabase getCertificates select error, retrying with select(*):', error.message);
        let fallbackQuery = supabase
          .from('certificates')
          .select('*')
          .order('created_at', { ascending: false });

        if (eventId && eventId !== 'all' && eventId !== 'ALL') fallbackQuery = fallbackQuery.eq('event_id', eventId);
        if (email) fallbackQuery = fallbackQuery.ilike('user_email', email.trim().toLowerCase());
        if (certType && certType !== 'all' && certType !== 'ALL') fallbackQuery = fallbackQuery.eq('cert_type', certType);

        const { data: fbData, error: fbErr } = await fallbackQuery;
        if (!fbErr && fbData) return fbData;
        throw error;
      }
      return data;
    } catch (err) {
      console.warn('Supabase getCertificates error:', err);
      return null;
    }
  },

  async getCertificateById(certId: string, includeImage = true): Promise<any> {
    try {
      const clean = certId.trim();

      // 1. Direct cert_id lookup
      const { data: byId, error: err1 } = await supabase
        .from('certificates')
        .select('*')
        .eq('cert_id', clean)
        .maybeSingle();

      if (!err1 && byId) return byId;

      // 2. Security Hash lookup
      const { data: byHash, error: err2 } = await supabase
        .from('certificates')
        .select('*')
        .eq('security_hash', clean)
        .maybeSingle();

      if (!err2 && byHash) return byHash;

      // 3. Case-insensitive cert_id lookup
      const { data: byIlike, error: err3 } = await supabase
        .from('certificates')
        .select('*')
        .ilike('cert_id', clean)
        .maybeSingle();

      if (!err3 && byIlike) return byIlike;

      return null;
    } catch (err) {
      console.warn('Supabase getCertificateById error:', err);
      return null;
    }
  },

  // Lazy-load certificate image on-demand to avoid loading heavy image blobs into list queries
  async getCertificateImage(certId: string): Promise<string | null> {
    try {
      const clean = certId.trim();

      const { data } = await supabase
        .from('certificates')
        .select('template_bg')
        .or(`cert_id.eq."${clean}",cert_id.ilike."${clean}",security_hash.eq."${clean}"`)
        .maybeSingle();

      if (!data) return null;
      const raw = (data as any).template_bg;
      if (!raw || typeof raw !== 'string') return null;
      if (raw.startsWith('data:image/')) return raw;
      if (raw.startsWith('/9j/')) return `data:image/jpeg;base64,${raw}`;
      if (raw.startsWith('iVBOR')) return `data:image/png;base64,${raw}`;
      if (raw.startsWith('UklGR')) return `data:image/webp;base64,${raw}`;
      return null;
    } catch (err) {
      console.warn('Supabase getCertificateImage error:', err);
      return null;
    }
  },

  async insertCertificate(cert: any) {
    const certId = cert.certId || cert.cert_id;
    const certImg = cert.certificateImage || cert.certificate_image || null;
    const templateBg = certImg || cert.templateBg || cert.templateId || 'classic_gold';

    const payload: any = {
      cert_id: certId,
      event_id: cert.eventId || cert.event_id || null,
      event_title: cert.eventTitle || cert.event_title || 'ECE Forum Event',
      event_date: cert.eventDate || cert.event_date || new Date().toLocaleDateString('en-IN'),
      user_name: cert.userName || cert.user_name || 'Participant',
      user_email: (cert.userEmail || cert.user_email || '').trim().toLowerCase(),
      department: cert.department || cert.dept || 'Electronics & Communication Engineering',
      college_name: cert.collegeName || cert.college_name || 'PCE-NAGPUR',
      cert_type: cert.certType || cert.cert_type || 'PARTICIPATION',
      title: cert.title || 'Certificate of Participation',
      rank_text: cert.rankText || cert.rank_text || 'Participant',
      description: cert.description || '',
      template_id: cert.templateId || cert.template_id || 'classic_gold',
      template_bg: templateBg,
      signatories: cert.signatories || [],
      qr_data: cert.qrData || cert.qr_data || JSON.stringify({ certId, name: cert.userName }),
      security_hash: cert.securityHash || cert.security_hash || `VFX-${certId}`,
      status: cert.status || 'VALID',
      issued_at: cert.issuedAt || cert.issued_at || new Date().toLocaleDateString('en-IN'),
      issued_by: cert.issuedBy || cert.issued_by || 'ECE Forum Executive Council',
    };

    try {
      const { data, error } = await supabase
        .from('certificates')
        .upsert([payload])
        .select('cert_id')
        .single();

      if (!error && data) return data;
      if (error) throw error;
    } catch (err: any) {
      console.warn('Supabase insertCertificate primary attempt failed, retrying with fallback:', err.message || err);
      try {
        const noFk = { ...payload, event_id: null };
        const { data: noFkData, error: noFkErr } = await supabase
          .from('certificates')
          .upsert([noFk])
          .select('cert_id')
          .single();

        if (!noFkErr && noFkData) return noFkData;
      } catch (fallbackErr) {
        console.warn('Supabase insertCertificate fallbacks exhausted:', fallbackErr);
      }
      return null;
    }
  },

  async insertCertificatesBulk(certs: any[]) {
    const buildPayload = (cert: any, nullEvent = false) => {
      const certId = cert.certId || cert.cert_id;
      const certImg = cert.certificateImage || cert.certificate_image || null;
      const templateBg = certImg || cert.templateBg || cert.templateId || 'classic_gold';

      const item: any = {
        cert_id: certId,
        event_id: nullEvent ? null : (cert.eventId || cert.event_id || null),
        event_title: cert.eventTitle || cert.event_title || 'ECE Forum Event',
        event_date: cert.eventDate || cert.event_date || new Date().toLocaleDateString('en-IN'),
        user_name: cert.userName || cert.user_name || 'Participant',
        user_email: (cert.userEmail || cert.user_email || '').trim().toLowerCase(),
        department: cert.department || cert.dept || 'Electronics & Communication Engineering',
        college_name: cert.collegeName || cert.college_name || 'PCE-NAGPUR',
        cert_type: cert.certType || cert.cert_type || 'PARTICIPATION',
        title: cert.title || 'Certificate of Participation',
        rank_text: cert.rankText || cert.rank_text || 'Participant',
        description: cert.description || '',
        template_id: cert.templateId || cert.template_id || 'classic_gold',
        template_bg: templateBg,
        signatories: cert.signatories || [],
        qr_data: cert.qrData || cert.qr_data || JSON.stringify({ certId, name: cert.userName }),
        security_hash: cert.securityHash || cert.security_hash || `VFX-${certId}`,
        status: cert.status || 'VALID',
        issued_at: cert.issuedAt || cert.issued_at || new Date().toLocaleDateString('en-IN'),
        issued_by: cert.issuedBy || cert.issued_by || 'ECE Forum Executive Council',
      };

      return item;
    };

    const initialPayloads = certs.map((c) => buildPayload(c, false));

    try {
      // 1. Primary Batch Upsert
      const { data, error } = await supabase
        .from('certificates')
        .upsert(initialPayloads)
        .select('cert_id');

      if (!error && data) return data;
      if (error) throw error;
    } catch (err: any) {
      console.warn('Supabase insertCertificatesBulk batch attempt failed, trying resilient fallbacks:', err.message || err);

      // 2. Retry without event_id
      try {
        const withoutFk = certs.map((c) => buildPayload(c, true));
        const { data: d2, error: e2 } = await supabase
          .from('certificates')
          .upsert(withoutFk)
          .select('cert_id');

        if (!e2 && d2) return d2;
      } catch {}

      // 3. Retry sequential
      try {
        const results = [];
        for (const cert of certs) {
          const res = await this.insertCertificate(cert);
          if (res) results.push(res);
        }
        if (results.length > 0) return results;
      } catch (seqErr) {
        console.warn('Sequential fallback also encountered error:', seqErr);
      }
      return null;
    }
  },

  async updateCertificateStatus(certId: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .update({ status })
        .eq('cert_id', certId.trim())
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase updateCertificateStatus error:', err);
      return null;
    }
  },

  async deleteCertificate(certId: string) {
    try {
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('cert_id', certId.trim());

      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase deleteCertificate error:', err);
      return false;
    }
  },
};
