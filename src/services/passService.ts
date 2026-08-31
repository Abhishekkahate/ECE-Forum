export interface TeamMember {
  name: string;
  email: string;
  department?: string;
  collegeName?: string;
  year?: string;
  phone?: string;
}

export interface EventPass {
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
  teamMembers?: TeamMember[];
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
  qrData: string;
  securityHash: string;
}

export interface VerificationResult {
  success: boolean;
  status: 'VALID' | 'ALREADY_CHECKED_IN' | 'UNVERIFIED' | 'INVALID';
  pass?: EventPass;
  message: string;
  timestamp: string;
}

import { supabaseDb } from './supabase';

const PASSES_STORAGE_KEY = 'ece_forum_registered_passes_v1';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class PassService {
  private passes: EventPass[] = [];
  private lastSyncTimestamp = 0;
  private isSyncing = false;

  constructor() {
    this.loadPasses();
    this.syncWithBackend();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === PASSES_STORAGE_KEY) {
          this.loadPasses();
        }
      });
    }
  }

  public async syncWithBackend(force = false) {
    const now = Date.now();
    if (!force && (this.isSyncing || now - this.lastSyncTimestamp < 25000)) {
      return this.passes;
    }

    this.isSyncing = true;
    try {
      // 1. Primary Supabase Cloud Sync
      const supaPasses = await supabaseDb.getPasses();
      this.lastSyncTimestamp = Date.now();
      if (supaPasses && Array.isArray(supaPasses) && supaPasses.length > 0) {
        this.passes = supaPasses.map((p: any) => ({
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
          collegeName: p.college_name || 'PIET, Nagpur',
          year: p.year,
          phone: p.phone,
          paymentId: p.payment_id,
          amount: Number(p.amount),
          originalAmount: p.original_amount ? Number(p.original_amount) : Number(p.amount),
          discountAmount: p.discount_amount ? Number(p.discount_amount) : 0,
          couponCode: p.coupon_code || '',
          registrationType: (p.registration_type || 'individual') as 'individual' | 'team',
          teamName: p.team_name || '',
          teamMembers: p.team_members || [],
          paymentStatus: p.payment_status,
          paymentScreenshot: p.payment_screenshot || p.paymentScreenshot || undefined,
          transactionId: p.transaction_id || p.transactionId || undefined,
          status: (p.status || 'UNVERIFIED') as 'UNVERIFIED' | 'CONFIRMED' | 'CHECKED_IN' | 'REJECTED',
          adminVerified: p.admin_verified !== undefined ? Boolean(p.admin_verified) : (p.status === 'CONFIRMED' || p.status === 'CHECKED_IN'),
          verifiedAt: p.verified_at,
          verifiedBy: p.verified_by,
          rejectionReason: p.rejection_reason,
          checkedInAt: p.checked_in_at,
          checkedInBy: p.checked_in_by,
          registeredAt: p.registered_at,
          qrData: JSON.stringify({
            passId: p.pass_id,
            name: p.user_name,
            email: p.user_email,
            event: p.event_title,
            college: p.college_name || undefined,
            team: p.team_name || undefined,
            members: Array.isArray(p.team_members) ? p.team_members.length + 1 : 1,
            hash: p.security_hash,
            date: p.event_date,
            venue: p.event_venue,
            verified: p.status === 'CONFIRMED' || p.status === 'CHECKED_IN',
          }),
          securityHash: p.security_hash,
        }));
        this.saveToStorage(true);
        return;
      }
    } catch {}

    try {
      const res = await fetch(`${API_BASE_URL}/passes`);
      if (res.ok) {
        const remotePasses = await res.json();
        if (Array.isArray(remotePasses) && remotePasses.length > 0) {
          this.passes = remotePasses;
          this.saveToStorage(true);
        }
      }
    } catch {} finally {
      this.isSyncing = false;
    }
  }

  private loadPasses() {
    try {
      const saved = localStorage.getItem(PASSES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out legacy mock passes
        this.passes = parsed.filter((p: any) => p.passId !== 'PASS-2026-X8K9M2' && p.passId !== 'PASS-2026-T4R7Q1' && p.passId !== 'PASS-2026-N5L2P8');
      } else {
        this.passes = [];
      }
    } catch {
      this.passes = [];
    }
  }

  private saveToStorage(notify = true) {
    try {
      localStorage.setItem(PASSES_STORAGE_KEY, JSON.stringify(this.passes));
      if (notify && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('ece_passes_updated'));
      }
    } catch (err) {
      console.error('Failed to save passes to localStorage', err);
    }
  }

  private generateUniquePassId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `PASS-2026-${code}`;
  }

  private generateSecurityHash(passId: string, email: string): string {
    let hash = 0;
    const str = `${passId}:${email}:ECE_SPACE_SINC_2026`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  }

  public getAllPasses(): EventPass[] {
    return [...this.passes];
  }

  public getUserPasses(userEmail: string): EventPass[] {
    if (!userEmail) return [];
    const normalized = userEmail.trim().toLowerCase();
    return this.passes.filter(
      (p) => p.userEmail.trim().toLowerCase() === normalized
    );
  }

  public getPassById(passId: string): EventPass | null {
    const normalized = passId.trim().toUpperCase();
    return (
      this.passes.find(
        (p) =>
          p.passId.toUpperCase() === normalized ||
          (p.rollNumber && p.rollNumber.toUpperCase() === normalized) ||
          p.userEmail.toUpperCase() === normalized
      ) || null
    );
  }

  public findExistingPass(userEmail: string, eventId: string): EventPass | null {
    if (!userEmail || !eventId) return null;
    const cleanEmail = userEmail.trim().toLowerCase();
    const cleanEventId = eventId.trim().toLowerCase();

    return (
      this.passes.find((p) => {
        const passEventId = (p.eventId || '').trim().toLowerCase();
        const passEventTitle = (p.eventTitle || '').trim().toLowerCase();
        const matchEvent = passEventId === cleanEventId || passEventTitle === cleanEventId;
        if (!matchEvent) return false;

        // 1. Primary registrant match
        if (p.userEmail && p.userEmail.trim().toLowerCase() === cleanEmail) {
          return true;
        }

        // 2. Team members match
        if (Array.isArray(p.teamMembers)) {
          const isMember = p.teamMembers.some(
            (m) => m.email && m.email.trim().toLowerCase() === cleanEmail
          );
          if (isMember) return true;
        }

        return false;
      }) || null
    );
  }

  public generatePass(
    data: Omit<
      EventPass,
      'passId' | 'status' | 'registeredAt' | 'qrData' | 'securityHash'
    >
  ): EventPass {
    // Prevent duplicate pass creation if already registered
    const existing = this.findExistingPass(data.userEmail, data.eventId);
    if (existing) {
      console.warn(`[PassService] Pass already exists for ${data.userEmail} on event ${data.eventId}: ${existing.passId}`);
      return existing;
    }

    const passId = this.generateUniquePassId();
    const securityHash = this.generateSecurityHash(passId, data.userEmail);
    const registeredAt = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const qrPayload = JSON.stringify({
      passId,
      name: data.userName,
      email: data.userEmail,
      event: data.eventTitle,
      college: data.collegeName || undefined,
      type: data.registrationType || 'individual',
      team: data.teamName || undefined,
      members: data.teamMembers?.length ? data.teamMembers.length + 1 : 1,
      hash: securityHash,
      date: data.eventDate,
      venue: data.eventVenue,
      verified: false,
    });

    const newPass: EventPass = {
      ...data,
      passId,
      status: 'UNVERIFIED',
      adminVerified: false,
      registeredAt,
      qrData: qrPayload,
      securityHash,
    };

    // Prepend new pass
    this.passes = [newPass, ...this.passes];
    this.saveToStorage(true);

    // 1. Direct Supabase Cloud Insertion
    supabaseDb.insertPass(newPass).catch((err) => console.warn('Supabase pass insert error:', err));

    // 2. Render backend sync
    fetch(`${API_BASE_URL}/passes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPass),
    }).catch(() => {});

    return newPass;
  }

  public async confirmPass(passId: string, verifiedBy = 'Admin'): Promise<EventPass | null> {
    const passIndex = this.passes.findIndex((p) => p.passId.toUpperCase() === passId.toUpperCase());
    if (passIndex === -1) return null;

    const current = this.passes[passIndex];
    const verifiedAt = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    const updated: EventPass = {
      ...current,
      status: 'CONFIRMED',
      adminVerified: true,
      verifiedAt,
      verifiedBy,
      rejectionReason: undefined,
      qrData: JSON.stringify({
        passId: current.passId,
        name: current.userName,
        email: current.userEmail,
        event: current.eventTitle,
        college: current.collegeName || undefined,
        team: current.teamName || undefined,
        members: current.teamMembers?.length ? current.teamMembers.length + 1 : 1,
        hash: current.securityHash,
        date: current.eventDate,
        venue: current.eventVenue,
        verified: true,
      }),
    };

    this.passes[passIndex] = updated;
    this.saveToStorage(true);

    // Supabase update
    supabaseDb.insertPass(updated).catch(() => {});
    fetch(`${API_BASE_URL}/passes/${encodeURIComponent(passId)}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verifiedBy, verifiedAt }),
    }).catch(() => {});

    return updated;
  }

  public async rejectPass(passId: string, reason = 'Proof rejected by Admin', verifiedBy = 'Admin'): Promise<EventPass | null> {
    const passIndex = this.passes.findIndex((p) => p.passId.toUpperCase() === passId.toUpperCase());
    if (passIndex === -1) return null;

    const current = this.passes[passIndex];
    const updated: EventPass = {
      ...current,
      status: 'REJECTED',
      adminVerified: false,
      rejectionReason: reason,
      verifiedBy,
    };

    this.passes[passIndex] = updated;
    this.saveToStorage(true);
    supabaseDb.insertPass(updated).catch(() => {});
    return updated;
  }

  public async unverifyPass(passId: string): Promise<EventPass | null> {
    const passIndex = this.passes.findIndex((p) => p.passId.toUpperCase() === passId.toUpperCase());
    if (passIndex === -1) return null;

    const current = this.passes[passIndex];
    const updated: EventPass = {
      ...current,
      status: 'UNVERIFIED',
      adminVerified: false,
      verifiedAt: undefined,
      verifiedBy: undefined,
      checkedInAt: undefined,
      checkedInBy: undefined,
    };

    this.passes[passIndex] = updated;
    this.saveToStorage(true);
    supabaseDb.insertPass(updated).catch(() => {});
    return updated;
  }

  public async confirmAllPendingPasses(verifiedBy = 'Admin'): Promise<number> {
    let count = 0;
    const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    this.passes = this.passes.map((p) => {
      if (p.status === 'UNVERIFIED' || p.adminVerified === false) {
        count++;
        const updated: EventPass = {
          ...p,
          status: 'CONFIRMED',
          adminVerified: true,
          verifiedAt: now,
          verifiedBy,
          rejectionReason: undefined,
        };
        supabaseDb.insertPass(updated).catch(() => {});
        return updated;
      }
      return p;
    });

    if (count > 0) {
      this.saveToStorage(true);
    }
    return count;
  }

  public async verifyAndCheckInPass(
    rawScanInput: string,
    scannedBy = 'Gate 1 Android Scanner'
  ): Promise<VerificationResult> {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Attempt backend verification first
    try {
      const res = await fetch(`${API_BASE_URL}/passes/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanInput: rawScanInput, scannedBy }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.pass) {
          const idx = this.passes.findIndex((p) => p.passId === result.pass.passId);
          if (idx !== -1) {
            this.passes[idx] = result.pass;
          } else {
            this.passes = [result.pass, ...this.passes];
          }
          this.saveToStorage(true);
        }
        return result;
      }
    } catch {}

    // Local verification
    if (!rawScanInput || !rawScanInput.trim()) {
      return {
        success: false,
        status: 'INVALID',
        message: 'No QR or Pass data provided.',
        timestamp,
      };
    }

    let targetPassId = rawScanInput.trim();
    if (rawScanInput.startsWith('{') && rawScanInput.endsWith('}')) {
      try {
        const parsed = JSON.parse(rawScanInput);
        if (parsed.passId) targetPassId = parsed.passId;
        else if (parsed.roll) targetPassId = parsed.roll;
      } catch {}
    }

    const passIndex = this.passes.findIndex(
      (p) =>
        p.passId.toUpperCase() === targetPassId.toUpperCase() ||
        (p.rollNumber && p.rollNumber.toUpperCase() === targetPassId.toUpperCase()) ||
        (p.userEmail && p.userEmail.toUpperCase() === targetPassId.toUpperCase())
    );

    if (passIndex === -1) {
      return {
        success: false,
        status: 'INVALID',
        message: `Pass ID "${targetPassId}" not found in registered roster.`,
        timestamp,
      };
    }

    const currentPass = this.passes[passIndex];

    // Check if pass is rejected
    if (currentPass.status === 'REJECTED') {
      return {
        success: false,
        status: 'INVALID',
        pass: currentPass,
        message: `ENTRY DENIED: Pass was REJECTED by Admin (${currentPass.rejectionReason || 'Invalid proof'}).`,
        timestamp,
      };
    }

    // Check if pass is unverified by admin
    if (currentPass.status === 'UNVERIFIED' || currentPass.adminVerified === false) {
      return {
        success: false,
        status: 'UNVERIFIED',
        pass: currentPass,
        message: `ENTRY DENIED: Pass is NOT verified by Admin yet. Please get Admin verification/approval before gate entry.`,
        timestamp,
      };
    }

    // Check if already checked in
    if (currentPass.status === 'CHECKED_IN') {
      return {
        success: false,
        status: 'ALREADY_CHECKED_IN',
        pass: currentPass,
        message: `ALREADY CHECKED IN at ${currentPass.checkedInAt || 'prior time'} by ${currentPass.checkedInBy || 'Gate'}. Duplicate entry rejected!`,
        timestamp,
      };
    }

    const checkedInAt = `${new Date().toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    })} · ${timestamp}`;

    const updatedPass: EventPass = {
      ...currentPass,
      status: 'CHECKED_IN',
      checkedInAt,
      checkedInBy: scannedBy,
    };

    this.passes[passIndex] = updatedPass;
    this.saveToStorage(true);

    return {
      success: true,
      status: 'VALID',
      pass: updatedPass,
      message: `Verified successfully! Welcome, ${updatedPass.userName}.`,
      timestamp,
    };
  }

  public updatePassStatus(
    passId: string,
    status: 'UNVERIFIED' | 'CONFIRMED' | 'CHECKED_IN' | 'REJECTED',
    checkedInBy?: string
  ) {
    const passIndex = this.passes.findIndex((p) => p.passId.toUpperCase() === passId.toUpperCase());
    if (passIndex !== -1) {
      const current = this.passes[passIndex];
      this.passes[passIndex] = {
        ...current,
        status,
        adminVerified: status === 'CONFIRMED' || status === 'CHECKED_IN',
        checkedInAt:
          status === 'CHECKED_IN'
            ? `${new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : undefined,
        checkedInBy: status === 'CHECKED_IN' ? (checkedInBy || 'Admin') : undefined,
      };
      this.saveToStorage(true);
      supabaseDb.insertPass(this.passes[passIndex]).catch(() => {});
    }
  }

  public async deletePass(passId: string): Promise<boolean> {
    const cleanId = passId.trim().toUpperCase();
    this.passes = this.passes.filter((p) => p.passId.toUpperCase() !== cleanId);
    this.saveToStorage(true);
    try {
      await supabaseDb.deletePass(passId);
    } catch {}
    try {
      await fetch(`${API_BASE_URL}/passes/${encodeURIComponent(passId)}`, { method: 'DELETE' });
    } catch {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ece_passes_updated'));
    }
    return true;
  }

  public getEventStats(eventId?: string) {
    const list = eventId
      ? this.passes.filter((p) => p.eventId === eventId)
      : this.passes;
    const total = list.length;
    const unverified = list.filter((p) => p.status === 'UNVERIFIED' || p.adminVerified === false).length;
    const checkedIn = list.filter((p) => p.status === 'CHECKED_IN').length;
    const confirmed = list.filter((p) => p.status === 'CONFIRMED').length;
    const rejected = list.filter((p) => p.status === 'REJECTED').length;
    const revenue = list.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return {
      total,
      unverified,
      confirmed,
      checkedIn,
      rejected,
      revenue,
      checkInPercentage: total > 0 ? Math.round((checkedIn / total) * 100) : 0,
    };
  }
}

export const passService = new PassService();
