import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Vercel, Localhost and Android clients
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// ── SUPABASE CLOUD DATABASE CONFIGURATION ──────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseEnabled = Boolean(
  SUPABASE_URL &&
  SUPABASE_KEY &&
  SUPABASE_URL.startsWith('https://') &&
  SUPABASE_URL.includes('.supabase.co') &&
  !SUPABASE_KEY.includes('your-supabase')
);

let supabase = null;
if (isSupabaseEnabled) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Connected to Supabase Cloud PostgreSQL Database');
  } catch (err) {
    console.warn('⚠️ Supabase init warning:', err.message);
  }
} else {
  console.log('ℹ️ Running in Local JSON Database Mode (Supabase keys not detected in env)');
}

// ── LOCAL JSON DATABASE FALLBACK ──────────────────────────────────────────
const DATA_FILE = path.join(__dirname, 'data', 'database.json');

if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

const DEFAULT_DATA = {
  announcement: 'Registration Open for SPACE & SINC Forum Installation & TARANG 2K26 Fiesta!',
  events: [
    {
      id: 'evt-1',
      title: 'SPACE & SINC Forum Installation Ceremony',
      category: 'Installation',
      status: 'Upcoming',
      date: 'July 30, 2026',
      time: '10:00 AM IST',
      venue: 'PIET Auditorium',
      description: 'Official installation ceremony for SPACE & SINC departmental councils for session 2026-27.',
      badge: 'FLAGSHIP CEREMONY',
      image: '/event_images/inst.webp',
      price: 150,
      totalSeats: 250,
    },
    {
      id: 'evt-2',
      title: 'TARANG 2K26 Freshers Gala & Tech Fiesta',
      category: 'Workshop',
      status: 'Upcoming',
      date: 'July 30, 2026',
      time: '10:30 AM IST',
      venue: 'PIET Auditorium',
      description: 'Annual welcoming fiesta and hardware ice-breaker for 2nd year electronics students.',
      badge: 'FRESHERS CELEBRATION',
      image: '/event_images/tarang.webp',
      price: 200,
      totalSeats: 300,
    },
    {
      id: 'evt-3',
      title: 'KiCAD 8 PCB Design & Fabrication Bootcamp',
      category: 'Workshop',
      status: 'Upcoming',
      date: 'Aug 12, 2026',
      time: '09:30 AM IST',
      venue: 'ECE Simulation Lab 304',
      description: 'Hands-on schematic capture, routing, Gerber generation and CNC milling for custom 2-layer PCBs.',
      badge: 'HANDS-ON BOOTCAMP',
      image: '/event_images/tarang.webp',
      price: 100,
      totalSeats: 60,
    },
  ],
  passes: [],
};

function readLocalDb() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }
  writeLocalDb(DEFAULT_DATA);
  return DEFAULT_DATA;
}

function writeLocalDb(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// ── REST API ROUTES ────────────────────────────────────────────────────────

// Health Check & Cloud Engine Telemetry
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    database: supabase ? 'Supabase PostgreSQL Cloud' : 'Local JSON Store',
    timestamp: new Date().toISOString(),
  });
});

// ── Events ─────────────────────────────────────────────────────────────────
app.get('/api/events', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return res.json(
          data.map((e) => ({
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
          }))
        );
      }
    } catch (err) {
      console.warn('Supabase events fetch error:', err.message);
    }
  }

  const db = readLocalDb();
  res.json(db.events || []);
});

app.post('/api/events', async (req, res) => {
  const eventData = req.body;
  const newEvent = {
    id: eventData.id || `evt-${Date.now()}`,
    title: eventData.title || 'Untitled Event',
    category: eventData.category || 'Workshop',
    status: eventData.status || 'Upcoming',
    date: eventData.date || 'TBD',
    time: eventData.time || '10:00 AM IST',
    venue: eventData.venue || 'PIET Campus',
    description: eventData.description || '',
    badge: eventData.badge || 'EVENT',
    image: eventData.image || '/event_images/tarang.webp',
    price: Number(eventData.price) || 0,
    totalSeats: Number(eventData.totalSeats) || 100,
    participationType: eventData.participationType || 'both',
  };

  if (supabase) {
    try {
      await supabase.from('events').upsert([
        {
          id: newEvent.id,
          title: newEvent.title,
          category: newEvent.category,
          status: newEvent.status,
          date: newEvent.date,
          time: newEvent.time,
          venue: newEvent.venue,
          description: newEvent.description,
          badge: newEvent.badge,
          image: newEvent.image,
          price: newEvent.price,
          total_seats: newEvent.totalSeats,
        },
      ]);
    } catch (err) {
      console.warn('Supabase event insert error:', err.message);
    }
  }

  // Always write local fallback
  const db = readLocalDb();
  db.events = [newEvent, ...(db.events || []).filter((e) => e.id !== newEvent.id)];
  writeLocalDb(db);

  res.status(201).json(newEvent);
});

app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  if (supabase) {
    try {
      await supabase.from('events').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase event delete error:', err.message);
    }
  }
  const db = readLocalDb();
  db.events = (db.events || []).filter((e) => e.id !== id);
  writeLocalDb(db);
  res.json({ success: true, deletedId: id });
});

// ── Passes & Registrations ─────────────────────────────────────────────────
app.get('/api/passes', async (req, res) => {
  const { eventId, email } = req.query;

  if (supabase) {
    try {
      let query = supabase.from('passes').select('*').order('created_at', { ascending: false });
      if (eventId && eventId !== 'all') query = query.eq('event_id', eventId);
      if (email) query = query.ilike('user_email', email);

      const { data, error } = await query;
      if (!error && data) {
        return res.json(
          data.map((p) => ({
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
            paymentStatus: p.payment_status,
            status: p.status,
            checkedInAt: p.checked_in_at,
            checkedInBy: p.checked_in_by,
            registeredAt: p.registered_at,
            securityHash: p.security_hash,
          }))
        );
      }
    } catch (err) {
      console.warn('Supabase passes fetch error:', err.message);
    }
  }

  const db = readLocalDb();
  let passes = db.passes || [];
  if (eventId && eventId !== 'all') passes = passes.filter((p) => p.eventId === eventId);
  if (email) passes = passes.filter((p) => p.userEmail.toLowerCase() === email.toLowerCase());

  res.json(passes);
});

// Register Pass
app.post('/api/passes', async (req, res) => {
  const passData = req.body;
  const cleanEmail = (passData.userEmail || '').trim().toLowerCase();
  const targetEventId = passData.eventId;

  // Prevent duplicate registration on backend
  if (cleanEmail && targetEventId) {
    if (supabase) {
      try {
        const { data: existingSupa } = await supabase
          .from('passes')
          .select('*')
          .eq('event_id', targetEventId)
          .ilike('user_email', cleanEmail)
          .maybeSingle();

        if (existingSupa) {
          return res.status(200).json({
            ...passData,
            passId: existingSupa.pass_id,
            alreadyRegistered: true,
            message: 'User already has a registered pass for this event',
          });
        }
      } catch {}
    }

    const db = readLocalDb();
    const existingLocal = (db.passes || []).find(
      (p) => p.eventId === targetEventId && (p.userEmail || '').trim().toLowerCase() === cleanEmail
    );
    if (existingLocal) {
      return res.status(200).json({
        ...existingLocal,
        alreadyRegistered: true,
        message: 'User already has a registered pass for this event',
      });
    }
  }

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const passId = passData.passId || `PASS-2026-${code}`;
  const securityHash = passData.securityHash || Math.random().toString(16).substring(2, 10).toUpperCase();

  const newPass = {
    ...passData,
    passId,
    status: passData.status || 'CONFIRMED',
    registeredAt:
      passData.registeredAt ||
      new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    securityHash,
  };

  if (supabase) {
    try {
      await supabase.from('passes').insert([
        {
          pass_id: newPass.passId,
          event_id: newPass.eventId,
          event_title: newPass.eventTitle,
          event_date: newPass.eventDate,
          event_time: newPass.eventTime,
          event_venue: newPass.eventVenue,
          user_name: newPass.userName,
          user_email: newPass.userEmail,
          user_photo: newPass.userPhoto,
          department: newPass.department,
          year: newPass.year,
          phone: newPass.phone,
          payment_id: newPass.paymentId,
          amount: newPass.amount,
          payment_status: newPass.paymentStatus,
          status: newPass.status,
          checked_in_at: newPass.checkedInAt,
          checked_in_by: newPass.checkedInBy,
          registered_at: newPass.registeredAt,
          security_hash: newPass.securityHash,
        },
      ]);
    } catch (err) {
      console.warn('Supabase pass insert error:', err.message);
    }
  }

  const db = readLocalDb();
  db.passes = [newPass, ...(db.passes || [])];
  writeLocalDb(db);

  res.status(201).json(newPass);
});

// Verify & Gate Check-in
app.post('/api/passes/verify', async (req, res) => {
  const { scanInput, scannedBy = 'Gate 1 Android Scanner' } = req.body;
  const db = readLocalDb();

  const timestamp = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  if (!scanInput || !scanInput.trim()) {
    return res.status(400).json({
      success: false,
      status: 'INVALID',
      message: 'No Pass ID or QR code provided.',
      timestamp,
    });
  }

  let targetId = scanInput.trim();
  if (targetId.startsWith('{') && targetId.endsWith('}')) {
    try {
      const parsed = JSON.parse(targetId);
      if (parsed.passId) targetId = parsed.passId;
      else if (parsed.email) targetId = parsed.email;
    } catch {}
  }

  // 1. Try Supabase lookup
  let foundPass = null;
  if (supabase) {
    try {
      const { data } = await supabase
        .from('passes')
        .select('*')
        .or(`pass_id.ilike.${targetId},user_email.ilike.${targetId}`)
        .limit(1);

      if (data && data.length > 0) {
        foundPass = {
          passId: data[0].pass_id,
          eventId: data[0].event_id,
          eventTitle: data[0].event_title,
          eventDate: data[0].event_date,
          eventTime: data[0].event_time,
          eventVenue: data[0].event_venue,
          userName: data[0].user_name,
          userEmail: data[0].user_email,
          userPhoto: data[0].user_photo,
          department: data[0].department,
          year: data[0].year,
          phone: data[0].phone,
          paymentId: data[0].payment_id,
          amount: Number(data[0].amount),
          paymentStatus: data[0].payment_status,
          status: data[0].status,
          checkedInAt: data[0].checked_in_at,
          checkedInBy: data[0].checked_in_by,
          registeredAt: data[0].registered_at,
          securityHash: data[0].security_hash,
        };
      }
    } catch {}
  }

  // Fallback to local DB
  const passIndex = (db.passes || []).findIndex(
    (p) =>
      p.passId.toUpperCase() === targetId.toUpperCase() ||
      (p.userEmail && p.userEmail.toUpperCase() === targetId.toUpperCase()) ||
      (p.rollNumber && p.rollNumber.toUpperCase() === targetId.toUpperCase())
  );

  if (!foundPass && passIndex !== -1) {
    foundPass = db.passes[passIndex];
  }

  if (!foundPass) {
    return res.json({
      success: false,
      status: 'INVALID',
      message: `Pass ID "${targetId}" not found in database.`,
      timestamp,
    });
  }

  if (foundPass.status === 'CHECKED_IN') {
    return res.json({
      success: false,
      status: 'ALREADY_CHECKED_IN',
      pass: foundPass,
      message: `ALREADY CHECKED IN at ${foundPass.checkedInAt || 'earlier'} by ${foundPass.checkedInBy || 'Gate'}. Duplicate rejected!`,
      timestamp,
    });
  }

  const checkedInAt = `${new Date().toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  })} · ${timestamp}`;

  const updatedPass = {
    ...foundPass,
    status: 'CHECKED_IN',
    checkedInAt,
    checkedInBy: scannedBy,
  };

  // Update Supabase
  if (supabase) {
    try {
      await supabase
        .from('passes')
        .update({
          status: 'CHECKED_IN',
          checked_in_at: checkedInAt,
          checked_in_by: scannedBy,
        })
        .eq('pass_id', updatedPass.passId);
    } catch {}
  }

  // Update Local DB
  if (passIndex !== -1) {
    db.passes[passIndex] = updatedPass;
    writeLocalDb(db);
  }

  res.json({
    success: true,
    status: 'VALID',
    pass: updatedPass,
    message: `Attendance marked successfully! Welcome, ${updatedPass.userName}.`,
    timestamp,
  });
});

// Toggle Attendee Check-In
app.post('/api/passes/:passId/toggle-status', async (req, res) => {
  const { passId } = req.params;
  const db = readLocalDb();
  const passIndex = (db.passes || []).findIndex((p) => p.passId.toUpperCase() === passId.toUpperCase());

  if (passIndex === -1) {
    return res.status(404).json({ error: 'Pass not found' });
  }

  const pass = db.passes[passIndex];
  if (pass.status === 'CHECKED_IN') {
    pass.status = 'CONFIRMED';
    delete pass.checkedInAt;
    delete pass.checkedInBy;
  } else {
    pass.status = 'CHECKED_IN';
    pass.checkedInAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    pass.checkedInBy = 'Manual Organiser Action';
  }

  if (supabase) {
    try {
      await supabase
        .from('passes')
        .update({
          status: pass.status,
          checked_in_at: pass.checkedInAt || null,
          checked_in_by: pass.checkedInBy || null,
        })
        .eq('pass_id', pass.passId);
    } catch {}
  }

  db.passes[passIndex] = pass;
  writeLocalDb(db);
  res.json(pass);
});

// ── Announcements ──────────────────────────────────────────────────────────
app.get('/api/announcements', async (req, res) => {
  if (supabase) {
    try {
      const { data } = await supabase.from('announcements').select('content').eq('id', 1).single();
      if (data && data.content) return res.json({ announcement: data.content });
    } catch {}
  }
  const db = readLocalDb();
  res.json({ announcement: db.announcement || '' });
});

app.post('/api/announcements', async (req, res) => {
  const { announcement } = req.body;
  if (supabase) {
    try {
      await supabase.from('announcements').upsert({ id: 1, content: announcement || '' });
    } catch {}
  }
  const db = readLocalDb();
  db.announcement = announcement || '';
  writeLocalDb(db);
  res.json({ success: true, announcement: db.announcement });
});

// ── Photo Gallery / Archive ───────────────────────────────────────────────
app.get('/api/gallery', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'gallery_archive')
        .maybeSingle();

      if (!error && data && Array.isArray(data.value)) {
        return res.json(data.value);
      }
    } catch (err) {
      console.warn('Supabase gallery fetch error:', err.message);
    }
  }

  const db = readLocalDb();
  res.json(db.gallery || []);
});

app.post('/api/gallery', async (req, res) => {
  const galleryItems = req.body;
  const itemsList = Array.isArray(galleryItems) ? galleryItems : [];

  if (supabase) {
    try {
      await supabase
        .from('site_settings')
        .upsert({ key: 'gallery_archive', value: itemsList, updated_at: new Date().toISOString() });
    } catch (err) {
      console.warn('Supabase gallery save error:', err.message);
    }
  }

  const db = readLocalDb();
  db.gallery = itemsList;
  writeLocalDb(db);

  res.json({ success: true, gallery: itemsList });
});

// ── Stats Summary ──────────────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  const { eventId } = req.query;
  const db = readLocalDb();
  let list = db.passes || [];

  if (eventId && eventId !== 'all') {
    list = list.filter((p) => p.eventId === eventId);
  }

  const total = list.length;
  const checkedIn = list.filter((p) => p.status === 'CHECKED_IN').length;
  const pending = total - checkedIn;
  const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
  const totalRevenue = list.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  res.json({
    total,
    checkedIn,
    pending,
    percentage,
    totalRevenue,
    eventsCount: (db.events || []).length,
  });
});

// ── Coupons & Promotional Engine ──────────────────────────────────────────
app.get('/api/coupons', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'coupon_codes')
        .maybeSingle();

      if (!error && data && Array.isArray(data.value)) {
        return res.json(data.value);
      }
    } catch (err) {
      console.warn('Supabase coupons fetch error:', err.message);
    }
  }

  const db = readLocalDb();
  res.json(db.coupons || []);
});

app.post('/api/coupons', async (req, res) => {
  const couponsData = req.body;
  let couponsList = [];

  if (Array.isArray(couponsData)) {
    couponsList = couponsData;
  } else if (couponsData && couponsData.code) {
    const db = readLocalDb();
    const existing = db.coupons || [];
    couponsList = [couponsData, ...existing.filter((c) => c.code.toUpperCase() !== couponsData.code.toUpperCase())];
  }

  if (supabase) {
    try {
      await supabase
        .from('site_settings')
        .upsert({ key: 'coupon_codes', value: couponsList, updated_at: new Date().toISOString() });
    } catch (err) {
      console.warn('Supabase coupons save error:', err.message);
    }
  }

  const db = readLocalDb();
  db.coupons = couponsList;
  writeLocalDb(db);

  res.json({ success: true, coupons: couponsList });
});

app.delete('/api/coupons/:code', async (req, res) => {
  const { code } = req.params;
  const cleanCode = code.trim().toUpperCase();

  const db = readLocalDb();
  const updated = (db.coupons || []).filter((c) => c.code.toUpperCase() !== cleanCode);
  db.coupons = updated;
  writeLocalDb(db);

  if (supabase) {
    try {
      await supabase
        .from('site_settings')
        .upsert({ key: 'coupon_codes', value: updated, updated_at: new Date().toISOString() });
    } catch {}
  }

  res.json({ success: true, message: `Coupon ${cleanCode} deleted`, coupons: updated });
});

app.post('/api/coupons/redeem', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Coupon code required' });

  const cleanCode = code.trim().toUpperCase();
  const db = readLocalDb();
  let list = db.coupons || [];

  if (supabase) {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'coupon_codes')
        .maybeSingle();

      if (data && Array.isArray(data.value)) {
        list = data.value;
      }
    } catch {}
  }

  const updated = list.map((c) => {
    if (c.code.toUpperCase() === cleanCode) {
      return { ...c, usedCount: (c.usedCount || 0) + 1 };
    }
    return c;
  });

  if (supabase) {
    try {
      await supabase
        .from('site_settings')
        .upsert({ key: 'coupon_codes', value: updated, updated_at: new Date().toISOString() });
    } catch {}
  }

  db.coupons = updated;
  writeLocalDb(db);

  res.json({ success: true, message: `Redeemed coupon ${cleanCode}`, coupons: updated });
});

// ── Admin Accounts & Management ──────────────────────────────────────────
app.get('/api/admins', async (req, res) => {
  if (supabase) {
    try {
      const { data } = await supabase.from('admins').select('id, name, email, role, created_at').order('created_at', { ascending: false });
      if (data) return res.json(data);
    } catch {}
  }
  const db = readLocalDb();
  const list = (db.admins || []).map(({ password, ...rest }) => rest);
  res.json(list);
});

app.post('/api/admins', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const newAdmin = {
    id: `admin-${Date.now()}`,
    name: name || email.split('@')[0],
    email: email.trim().toLowerCase(),
    password: password.trim(),
    role: role || 'Event Organizer',
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      await supabase.from('admins').upsert([newAdmin]);
    } catch (err) {
      console.warn('Supabase admin insert error:', err.message);
    }
  }

  const db = readLocalDb();
  db.admins = [newAdmin, ...(db.admins || []).filter((a) => a.email !== newAdmin.email)];
  writeLocalDb(db);

  const { password: _, ...safeAdmin } = newAdmin;
  res.status(201).json(safeAdmin);
});

app.post('/api/admins/login', async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  // Initial Master Admin Key check
  if (cleanPass === 'admin123' || cleanPass === 'ece_admin_2026') {
    return res.json({
      success: true,
      user: {
        id: 'master-admin',
        name: cleanEmail.split('@')[0] || 'Executive Admin',
        email: cleanEmail || 'admin@ece-forum.org',
        role: 'Forum President & Executive Council',
      },
    });
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (!error && data) {
        if (data.password === cleanPass) {
          const { password: _, ...safeUser } = data;
          return res.json({ success: true, user: safeUser });
        } else {
          return res.status(401).json({ success: false, error: 'Invalid password.' });
        }
      }
    } catch {}
  }

  const db = readLocalDb();
  const localFound = (db.admins || []).find((a) => a.email.toLowerCase() === cleanEmail);
  if (localFound) {
    if (localFound.password === cleanPass) {
      const { password: _, ...safeUser } = localFound;
      return res.json({ success: true, user: safeUser });
    }
    return res.status(401).json({ success: false, error: 'Invalid password.' });
  }

  // Unmatched credentials -> Reject
  return res.status(401).json({
    success: false,
    error: 'Access Denied: Invalid admin email or password.',
  });
});

app.delete('/api/admins/:id', async (req, res) => {
  const { id } = req.params;
  if (supabase) {
    try {
      await supabase.from('admins').delete().eq('id', id);
    } catch {}
  }
  const db = readLocalDb();
  db.admins = (db.admins || []).filter((a) => a.id !== id);
  writeLocalDb(db);
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ ECE Forum Render & Supabase API Server running on port ${PORT}`);
});
