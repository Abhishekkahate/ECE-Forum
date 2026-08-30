import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_URL = 'https://puetnlqzbodjweobwgtr.supabase.co';
const SUPABASE_PROJECT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1ZXRubHF6Ym9kandlb2J3Z3RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NzQwMzcsImV4cCI6MjEwMjU1MDAzN30.olYvw1D7VKz54smMjvDoR2g6FJJIje_GMBEoF2Tz0zI';

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
};
