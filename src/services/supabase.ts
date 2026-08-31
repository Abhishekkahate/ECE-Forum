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
    flowType: 'implicit',
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
      venue: eventData.venue || 'PIET Campus',
      description: eventData.description || '',
      badge: eventData.badge || 'EVENT',
      image: eventData.image || '/event_images/tarang.webp',
      price: Number(eventData.price) || 0,
      total_seats: Number(eventData.totalSeats || eventData.total_seats) || 100,
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

  // Passes
  async getPasses(eventId?: string, email?: string) {
    try {
      let query = supabase
        .from('passes')
        .select('*')
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

  async insertPass(pass: any) {
    const payload = {
      pass_id: pass.passId || pass.pass_id,
      event_id: pass.eventId || pass.event_id,
      event_title: pass.eventTitle || pass.event_title || 'Event',
      event_date: pass.eventDate || pass.event_date || '',
      event_time: pass.eventTime || pass.event_time || '10:00 AM IST',
      event_venue: pass.eventVenue || pass.event_venue || 'PIET Campus',
      user_name: pass.userName || pass.user_name || 'Attendee',
      user_email: (pass.userEmail || pass.user_email || '').trim().toLowerCase(),
      user_photo: pass.userPhoto || pass.user_photo || null,
      college_name: pass.collegeName || pass.college_name || 'PIET, Nagpur',
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
      payment_screenshot: pass.paymentScreenshot || pass.payment_screenshot || null,
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
    };

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

  // Certificates
  async getCertificates(eventId?: string, email?: string, certType?: string) {
    try {
      let query = supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventId && eventId !== 'all') {
        query = query.eq('event_id', eventId);
      }
      if (email) {
        query = query.ilike('user_email', email.trim());
      }
      if (certType && certType !== 'all') {
        query = query.eq('cert_type', certType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase getCertificates error:', err);
      return null;
    }
  },

  async getCertificateById(certId: string) {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('cert_id', certId.trim())
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase getCertificateById error:', err);
      return null;
    }
  },

  async insertCertificate(cert: any) {
    const payload = {
      cert_id: cert.certId || cert.cert_id,
      event_id: cert.eventId || cert.event_id,
      event_title: cert.eventTitle || cert.event_title,
      event_date: cert.eventDate || cert.event_date,
      user_name: cert.userName || cert.user_name,
      user_email: (cert.userEmail || cert.user_email || '').trim().toLowerCase(),
      user_photo: cert.userPhoto || cert.user_photo || null,
      department: cert.department || 'Electronics & Communication Engineering',
      college_name: cert.collegeName || cert.college_name || 'PIET, Nagpur',
      cert_type: cert.certType || cert.cert_type || 'PARTICIPATION',
      title: cert.title || 'Certificate of Participation',
      rank_text: cert.rankText || cert.rank_text || 'Participant',
      description: cert.description || '',
      template_id: cert.templateId || cert.template_id || 'classic_gold',
      template_bg: cert.templateBg || cert.template_bg || null,
      signatories: cert.signatories || [],
      qr_data: cert.qrData || cert.qr_data,
      security_hash: cert.securityHash || cert.security_hash,
      status: cert.status || 'VALID',
      issued_at: cert.issuedAt || cert.issued_at || new Date().toLocaleDateString('en-IN'),
      issued_by: cert.issuedBy || cert.issued_by || 'ECE Forum Executive Council',
    };

    try {
      const { data, error } = await supabase
        .from('certificates')
        .upsert([payload])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase insertCertificate error:', err);
      return null;
    }
  },

  async insertCertificatesBulk(certs: any[]) {
    const payloads = certs.map((cert) => ({
      cert_id: cert.certId || cert.cert_id,
      event_id: cert.eventId || cert.event_id,
      event_title: cert.eventTitle || cert.event_title,
      event_date: cert.eventDate || cert.event_date,
      user_name: cert.userName || cert.user_name,
      user_email: (cert.userEmail || cert.user_email || '').trim().toLowerCase(),
      user_photo: cert.userPhoto || cert.user_photo || null,
      department: cert.department || 'Electronics & Communication Engineering',
      college_name: cert.collegeName || cert.college_name || 'PIET, Nagpur',
      cert_type: cert.certType || cert.cert_type || 'PARTICIPATION',
      title: cert.title || 'Certificate of Participation',
      rank_text: cert.rankText || cert.rank_text || 'Participant',
      description: cert.description || '',
      template_id: cert.templateId || cert.template_id || 'classic_gold',
      template_bg: cert.templateBg || cert.template_bg || null,
      signatories: cert.signatories || [],
      qr_data: cert.qrData || cert.qr_data,
      security_hash: cert.securityHash || cert.security_hash,
      status: cert.status || 'VALID',
      issued_at: cert.issuedAt || cert.issued_at || new Date().toLocaleDateString('en-IN'),
      issued_by: cert.issuedBy || cert.issued_by || 'ECE Forum Executive Council',
    }));

    try {
      const { data, error } = await supabase
        .from('certificates')
        .upsert(payloads)
        .select();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase insertCertificatesBulk error:', err);
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
