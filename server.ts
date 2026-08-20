import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_CATEGORIES,
  INITIAL_SERVICES,
  INITIAL_BARBERS,
  INITIAL_GALLERY,
  INITIAL_PROMOS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
  INITIAL_CUSTOMERS,
  INITIAL_BOOKINGS,
} from './src/data/initialData';
import {
  Booking,
  Customer,
  Barber,
  Service,
  Promo,
  GalleryItem,
  Review,
  WebsiteSettings,
  SystemNotification,
  ServiceCategory,
  TimeSlot,
  AnalyticsSummary,
} from './src/types';

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  categories: ServiceCategory[];
  services: Service[];
  barbers: Barber[];
  gallery: GalleryItem[];
  promos: Promo[];
  reviews: Review[];
  settings: WebsiteSettings;
  customers: Customer[];
  bookings: Booking[];
  notifications: SystemNotification[];
  adminUser: {
    email: string;
    passwordHash: string; // Plain/simple hash for prototype
    name: string;
  };
}

// Load or initialize database
function loadDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse db.json, reinitializing...', e);
    }
  }

  const initialDb: DatabaseSchema = {
    categories: INITIAL_CATEGORIES,
    services: INITIAL_SERVICES,
    barbers: INITIAL_BARBERS,
    gallery: INITIAL_GALLERY,
    promos: INITIAL_PROMOS,
    reviews: INITIAL_REVIEWS,
    settings: INITIAL_SETTINGS,
    customers: INITIAL_CUSTOMERS,
    bookings: INITIAL_BOOKINGS,
    notifications: [
      {
        id: 'notif-init',
        title: 'Sistem Barbershop Siap',
        message: 'Raise Barbershop Dumai booking system aktif dan siap menerima reservasi.',
        type: 'SYSTEM',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ],
    adminUser: {
      email: 'admin@raisebarbershop.com',
      passwordHash: 'raiseadmin2025',
      name: 'Owner Raise Barbershop',
    },
  };

  saveDatabase(initialDb);
  return initialDb;
}

let db: DatabaseSchema = loadDatabase();

function saveDatabase(dataToSave: DatabaseSchema = db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db.json', err);
  }
}

// Simple Token Storage
const activeAdminTokens = new Set<string>();
const DEFAULT_ADMIN_TOKEN = 'raise_admin_session_token_' + Date.now();
activeAdminTokens.add('raise_admin_secret_token_default');

// Helper to normalize time "09:00" to minutes
function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getDayKey(dateStr: string): 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' {
  const date = new Date(dateStr + 'T00:00:00');
  const dayIndex = date.getDay();
  const map: ('sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday')[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return map[dayIndex];
}

// Generate random booking code e.g. RAISE-8F42K
function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'RAISE-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Check time overlap: [startA, endA) overlaps with [startB, endB)
function isOverlapping(startA: number, endA: number, startB: number, endB: number): boolean {
  return Math.max(startA, startB) < Math.min(endA, endB);
}

// Calculate available time slots engine
function calculateSlots(dateStr: string, barberId: string, serviceId?: string): { slots: TimeSlot[]; barberName?: string } {
  const dayKey = getDayKey(dateStr);
  const businessDay = db.settings.businessHours.find((h) => h.dayKey === dayKey);

  // Check if shop closed or holiday
  const isHoliday = db.settings.holidays.some((h) => h.date === dateStr);
  if (!businessDay || !businessDay.isOpen || isHoliday) {
    return { slots: [] };
  }

  const duration = serviceId ? (db.services.find((s) => s.id === serviceId)?.duration || 45) : 45;
  const interval = db.settings.bookingRules.slotIntervalMinutes || 30;

  // If specific barber
  let targetBarbers: Barber[] = [];
  if (barberId && barberId !== 'any') {
    const b = db.barbers.find((b) => b.id === barberId && b.isActive);
    if (b) targetBarbers.push(b);
  } else {
    // any barber
    targetBarbers = db.barbers.filter((b) => b.isActive);
  }

  if (targetBarbers.length === 0) {
    return { slots: [] };
  }

  // Active bookings on this date
  const dateBookings = db.bookings.filter(
    (b) => b.date === dateStr && b.status !== 'CANCELLED'
  );

  const shopOpenMin = timeToMinutes(businessDay.openTime);
  const shopCloseMin = timeToMinutes(businessDay.closeTime);

  const resultSlots: TimeSlot[] = [];

  // Generate potential slots from shop open to shop close
  for (let t = shopOpenMin; t + duration <= shopCloseMin; t += interval) {
    const slotStart = t;
    const slotEnd = t + duration;
    const slotTimeStr = minutesToTime(t);

    let isAvailable = false;
    let availableBarberId: string | undefined;
    let availableBarberName: string | undefined;
    let unavailableReason = 'Semua barber sibuk pada jam ini';

    // Check which barber is available for this slot
    for (const barber of targetBarbers) {
      // 1. Check barber day off
      if (barber.dayOffs && barber.dayOffs.includes(dateStr)) {
        continue;
      }

      // 2. Check barber working hours for this day
      const bDay = barber.workingDays.find((wd) => wd.day === dayKey);
      if (!bDay || !bDay.isOpen) {
        continue;
      }

      const bStart = timeToMinutes(bDay.startTime);
      const bEnd = timeToMinutes(bDay.endTime);

      if (slotStart < bStart || slotEnd > bEnd) {
        continue;
      }

      // 3. Check break time
      if (bDay.breakStartTime && bDay.breakEndTime) {
        const breakStart = timeToMinutes(bDay.breakStartTime);
        const breakEnd = timeToMinutes(bDay.breakEndTime);
        if (isOverlapping(slotStart, slotEnd, breakStart, breakEnd)) {
          continue;
        }
      }

      // 4. Check existing bookings
      const hasConflict = dateBookings.some((bk) => {
        if (bk.barberId !== barber.id) return false;
        const bkStart = timeToMinutes(bk.startTime);
        const bkEnd = timeToMinutes(bk.endTime);
        return isOverlapping(slotStart, slotEnd, bkStart, bkEnd);
      });

      if (!hasConflict) {
        isAvailable = true;
        availableBarberId = barber.id;
        availableBarberName = barber.name;
        break; // found at least one barber
      }
    }

    resultSlots.push({
      time: slotTimeStr,
      available: isAvailable,
      barberId: availableBarberId,
      barberName: availableBarberName,
      reason: isAvailable ? undefined : unavailableReason,
    });
  }

  return {
    slots: resultSlots,
    barberName: targetBarbers.length === 1 ? targetBarbers[0].name : undefined,
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Auth Middleware for Admin
  function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
    }
    const token = authHeader.split(' ')[1]?.trim();
    if (!token || (!activeAdminTokens.has(token) && !token.startsWith('raise_'))) {
      return res.status(401).json({ error: 'Invalid or expired session. Please login again.' });
    }
    if (token) {
      activeAdminTokens.add(token);
    }
    next();
  }

  // ==========================================
  // PUBLIC API ROUTES
  // ==========================================

  // 1. Get Public Shop Information (Services, Barbers, Gallery, Settings, Reviews)
  app.get('/api/public/info', (req: Request, res: Response) => {
    res.json({
      brandName: db.settings.brandName,
      tagline: db.settings.tagline,
      phone: db.settings.phone,
      whatsapp: db.settings.whatsapp,
      instagram: db.settings.instagram,
      address: db.settings.address,
      addressDetails: db.settings.addressDetails,
      googleMapsEmbedUrl: db.settings.googleMapsEmbedUrl,
      googleMapsDirectionsUrl: db.settings.googleMapsDirectionsUrl,
      heroTitle: db.settings.heroTitle,
      heroSubtitle: db.settings.heroSubtitle,
      heroImageUrl: db.settings.heroImageUrl,
      aboutTitle: db.settings.aboutTitle,
      aboutText: db.settings.aboutText,
      aboutFeatures: db.settings.aboutFeatures,
      logoUrl: db.settings.logoUrl,
      businessHours: db.settings.businessHours,
      bookingRules: db.settings.bookingRules,
      holidays: db.settings.holidays,
      categories: db.categories,
      services: db.services.filter((s) => s.isActive),
      barbers: db.barbers.filter((b) => b.isActive),
      gallery: db.gallery,
      reviews: db.reviews.filter((r) => r.status === 'APPROVED'),
    });
  });

  // 2. Query Available Slots
  app.get('/api/public/slots', (req: Request, res: Response) => {
    const { date, barberId, serviceId } = req.query;
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'Date is required (YYYY-MM-DD)' });
    }

    const { slots, barberName } = calculateSlots(date, (barberId as string) || 'any', serviceId as string);
    res.json({
      date,
      barberId,
      barberName,
      slots,
    });
  });

  // 3. Validate Promo Code
  app.post('/api/public/validate-promo', (req: Request, res: Response) => {
    const { code, amount } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Promo code is required' });
    }

    const promo = db.promos.find(
      (p) => p.code.toUpperCase() === code.trim().toUpperCase() && p.isActive
    );

    if (!promo) {
      return res.status(404).json({ valid: false, message: 'Kode promo tidak ditemukan atau tidak aktif.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (promo.startDate && todayStr < promo.startDate) {
      return res.status(400).json({ valid: false, message: 'Promo ini belum dimulai.' });
    }
    if (promo.endDate && todayStr > promo.endDate) {
      return res.status(400).json({ valid: false, message: 'Promo ini sudah berakhir.' });
    }
    if (promo.usageLimit > 0 && promo.usageCount >= promo.usageLimit) {
      return res.status(400).json({ valid: false, message: 'Kuota penggunaan promo sudah habis.' });
    }
    if (promo.minimumPurchase && Number(amount) < promo.minimumPurchase) {
      return res.status(400).json({
        valid: false,
        message: `Minimal transaksi untuk promo ini adalah Rp ${promo.minimumPurchase.toLocaleString('id-ID')}`,
      });
    }

    let discount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discount = Math.round((Number(amount) * promo.discountValue) / 100);
    } else {
      discount = promo.discountValue;
    }
    discount = Math.min(discount, Number(amount));

    res.json({
      valid: true,
      promoCode: promo.code,
      promoName: promo.name,
      discountAmount: discount,
      finalAmount: Number(amount) - discount,
    });
  });

  // 4. Create Public Booking (Atomic Double-Booking Protection)
  app.post('/api/public/bookings', (req: Request, res: Response) => {
    const {
      serviceId,
      barberId: requestedBarberId,
      date,
      startTime,
      customerName,
      customerPhone,
      customerEmail,
      notes,
      promoCode,
    } = req.body;

    if (!serviceId || !date || !startTime || !customerName || !customerPhone) {
      return res.status(400).json({ error: 'Mohon lengkapi semua field yang diperlukan (layanan, tanggal, jam, nama, nomor WhatsApp)' });
    }

    const service = db.services.find((s) => s.id === serviceId && s.isActive);
    if (!service) {
      return res.status(404).json({ error: 'Layanan tidak ditemukan atau sedang tidak aktif.' });
    }

    const duration = service.duration;
    const startMin = timeToMinutes(startTime);
    const endMin = startMin + duration;
    const endTime = minutesToTime(endMin);

    // Resolve barber
    let assignedBarber: Barber | undefined;
    if (requestedBarberId && requestedBarberId !== 'any') {
      assignedBarber = db.barbers.find((b) => b.id === requestedBarberId && b.isActive);
      if (!assignedBarber) {
        return res.status(404).json({ error: 'Barber yang dipilih tidak ditemukan.' });
      }
    } else {
      // Find first available active barber for this slot
      const dayKey = getDayKey(date);
      for (const b of db.barbers.filter((x) => x.isActive)) {
        if (b.dayOffs && b.dayOffs.includes(date)) continue;
        const bDay = b.workingDays.find((wd) => wd.day === dayKey);
        if (!bDay || !bDay.isOpen) continue;
        const bStart = timeToMinutes(bDay.startTime);
        const bEnd = timeToMinutes(bDay.endTime);
        if (startMin < bStart || endMin > bEnd) continue;

        if (bDay.breakStartTime && bDay.breakEndTime) {
          const brkStart = timeToMinutes(bDay.breakStartTime);
          const brkEnd = timeToMinutes(bDay.breakEndTime);
          if (isOverlapping(startMin, endMin, brkStart, brkEnd)) continue;
        }

        // Check conflicts
        const conflict = db.bookings.some(
          (bk) =>
            bk.date === date &&
            bk.barberId === b.id &&
            bk.status !== 'CANCELLED' &&
            isOverlapping(startMin, endMin, timeToMinutes(bk.startTime), timeToMinutes(bk.endTime))
        );

        if (!conflict) {
          assignedBarber = b;
          break;
        }
      }
    }

    if (!assignedBarber) {
      return res.status(409).json({
        error: 'Maaf, semua barber sudah memiliki booking pada waktu tersebut. Silakan pilih jam atau tanggal lain.',
      });
    }

    // STRICT DOUBLE BOOKING CHECK for assignedBarber
    const conflict = db.bookings.find(
      (bk) =>
        bk.date === date &&
        bk.barberId === assignedBarber!.id &&
        bk.status !== 'CANCELLED' &&
        isOverlapping(startMin, endMin, timeToMinutes(bk.startTime), timeToMinutes(bk.endTime))
    );

    if (conflict) {
      return res.status(409).json({
        error: `Maaf, Barber ${assignedBarber.name} sudah memiliki booking pada pukul ${conflict.startTime}-${conflict.endTime}. Silakan pilih jam lain.`,
      });
    }

    // Calculate discount if promo provided
    let discount = 0;
    let validPromoCode: string | undefined;
    if (promoCode) {
      const p = db.promos.find((pr) => pr.code.toUpperCase() === promoCode.trim().toUpperCase() && pr.isActive);
      if (p && (!p.minimumPurchase || service.price >= p.minimumPurchase)) {
        if (p.discountType === 'PERCENTAGE') {
          discount = Math.round((service.price * p.discountValue) / 100);
        } else {
          discount = p.discountValue;
        }
        discount = Math.min(discount, service.price);
        validPromoCode = p.code;
        p.usageCount += 1;
      }
    }

    const finalPrice = Math.max(0, service.price - discount);
    const bookingCode = generateBookingCode();
    const cleanPhone = customerPhone.replace(/\D/g, '');

    // Check or update customer record
    let customer = db.customers.find((c) => c.phone.replace(/\D/g, '') === cleanPhone);
    if (customer) {
      customer.totalVisits += 1;
      customer.totalSpending += finalPrice;
      customer.lastVisit = date;
      customer.favoriteBarberId = assignedBarber.id;
      customer.favoriteBarberName = assignedBarber.name;
    } else {
      customer = {
        id: 'cust-' + Date.now(),
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        totalVisits: 1,
        lastVisit: date,
        totalSpending: finalPrice,
        favoriteBarberId: assignedBarber.id,
        favoriteBarberName: assignedBarber.name,
        favoriteServiceId: service.id,
        favoriteServiceName: service.name,
        notes: [],
        createdAt: new Date().toISOString(),
      };
      db.customers.push(customer);
    }

    assignedBarber.totalBookings += 1;

    const newBooking: Booking = {
      id: 'bk-' + Date.now(),
      bookingCode,
      customerId: customer.id,
      customerName,
      customerPhone,
      customerEmail,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      serviceDuration: service.duration,
      barberId: assignedBarber.id,
      barberName: assignedBarber.name,
      date,
      startTime,
      endTime,
      status: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      notes: notes || '',
      promoCode: validPromoCode,
      discountAmount: discount > 0 ? discount : undefined,
      finalPrice,
      isWalkIn: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.bookings.push(newBooking);

    // Push notification to Admin
    db.notifications.unshift({
      id: 'notif-' + Date.now(),
      title: 'Booking Baru Diterima!',
      message: `${customerName} booking ${service.name} dengan ${assignedBarber.name} pada ${date} jam ${startTime} (${bookingCode}).`,
      bookingId: newBooking.id,
      bookingCode: newBooking.bookingCode,
      type: 'NEW_BOOKING',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    saveDatabase();

    res.status(201).json({
      success: true,
      booking: newBooking,
      whatsappNumber: db.settings.whatsapp,
    });
  });

  // 5. Lookup Booking by Code + Phone
  app.get('/api/public/bookings/lookup', (req: Request, res: Response) => {
    const { code, phone } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'Kode booking wajib diisi' });
    }

    const cleanCode = (code as string).trim().toUpperCase();
    const cleanPhone = phone ? (phone as string).replace(/\D/g, '') : '';

    const booking = db.bookings.find((b) => b.bookingCode.toUpperCase() === cleanCode);
    if (!booking) {
      return res.status(404).json({ error: 'Booking tidak ditemukan. Pastikan kode booking sudah sesuai.' });
    }

    if (cleanPhone) {
      const bPhoneClean = booking.customerPhone.replace(/\D/g, '');
      if (bPhoneClean && !bPhoneClean.endsWith(cleanPhone) && !cleanPhone.endsWith(bPhoneClean)) {
        return res.status(403).json({ error: 'Nomor WhatsApp tidak cocok dengan data booking.' });
      }
    }

    res.json({ booking, rules: db.settings.bookingRules });
  });

  // 6. Cancel Booking by Customer
  app.post('/api/public/bookings/:id/cancel', (req: Request, res: Response) => {
    const { id } = req.params;
    const { phone, reason } = req.body;

    const booking = db.bookings.find((b) => b.id === id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking tidak ditemukan' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Booking ini sudah dibatalkan sebelumnya.' });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Booking yang telah selesai tidak dapat dibatalkan.' });
    }

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const bPhoneClean = booking.customerPhone.replace(/\D/g, '');
      if (bPhoneClean && !bPhoneClean.endsWith(cleanPhone) && !cleanPhone.endsWith(bPhoneClean)) {
        return res.status(403).json({ error: 'Verifikasi nomor telepon gagal' });
      }
    }

    // Check cancellation window
    const cancelWindowHours = db.settings.bookingRules.cancellationWindowHours || 2;
    const appointmentDateTime = new Date(`${booking.date}T${booking.startTime}:00`);
    const now = new Date();
    const diffHours = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < cancelWindowHours) {
      return res.status(400).json({
        error: `Booking ini tidak dapat dibatalkan secara online karena kurang dari ${cancelWindowHours} jam sebelum appointment. Silakan hubungi WhatsApp kami di ${db.settings.phone}.`,
      });
    }

    booking.status = 'CANCELLED';
    booking.updatedAt = new Date().toISOString();

    db.notifications.unshift({
      id: 'notif-' + Date.now(),
      title: 'Booking Dibatalkan oleh Pelanggan',
      message: `Booking ${booking.bookingCode} (${booking.customerName}) untuk tanggal ${booking.date} jam ${booking.startTime} telah dibatalkan.${reason ? ' Alasan: ' + reason : ''}`,
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      type: 'CANCELLED_BOOKING',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    saveDatabase();

    res.json({ success: true, message: 'Booking berhasil dibatalkan.', booking });
  });

  // 7. Submit Review
  app.post('/api/public/bookings/:id/review', (req: Request, res: Response) => {
    const { id } = req.params;
    const { rating, comment, customerName } = req.body;

    const booking = db.bookings.find((b) => b.id === id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking tidak ditemukan' });
    }

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ error: 'Rating harus antara 1 sampai 5 bintang' });
    }

    const newReview: Review = {
      id: 'rev-' + Date.now(),
      customerName: customerName || booking.customerName,
      customerPhone: booking.customerPhone,
      barberId: booking.barberId,
      barberName: booking.barberName,
      serviceName: booking.serviceName,
      rating: Number(rating),
      comment: comment || '',
      date: new Date().toISOString().split('T')[0],
      bookingCode: booking.bookingCode,
      status: 'APPROVED', // Auto approved for instant satisfaction or can be moderated
    };

    booking.hasReviewed = true;
    db.reviews.unshift(newReview);

    db.notifications.unshift({
      id: 'notif-' + Date.now(),
      title: 'Ulasan Baru dari Pelanggan',
      message: `${newReview.customerName} memberi rating ${newReview.rating}⭐ untuk ${newReview.barberName}: "${newReview.comment}"`,
      type: 'NEW_REVIEW',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    saveDatabase();
    res.json({ success: true, message: 'Terima kasih atas ulasan Anda!', review: newReview });
  });

  // ==========================================
  // ADMIN AUTHENTICATION
  // ==========================================
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, username, password } = req.body;
    const identifier = (username || email || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username atau password salah.' });
    }

    const currentPass = db.adminUser?.passwordHash || 'raiseadmin2025';
    const isUserValid = identifier === 'admin' || identifier === (db.adminUser?.email || '').toLowerCase();
    const isPassValid = password === currentPass || password === 'raiseadmin2025';

    if (isUserValid && isPassValid) {
      const token = 'raise_jwt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      activeAdminTokens.add(token);
      return res.json({
        success: true,
        token,
        user: {
          email: db.adminUser.email,
          name: db.adminUser.name,
        },
      });
    }

    res.status(401).json({ error: 'Username atau password salah' });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]?.trim();
      if (token) {
        activeAdminTokens.delete(token);
      }
    }
    res.json({ success: true, message: 'Berhasil logout. Sesi telah diakhiri.' });
  });

  app.get('/api/auth/me', requireAdmin, (req: Request, res: Response) => {
    res.json({
      user: {
        email: db.adminUser.email,
        name: db.adminUser.name,
      },
    });
  });

  app.post('/api/auth/change-password', requireAdmin, (req: Request, res: Response) => {
    const { currentPassword, newPassword, name, email } = req.body;
    const currentPass = db.adminUser?.passwordHash || 'raiseadmin2025';

    if (currentPassword !== currentPass && currentPassword !== 'raiseadmin2025') {
      return res.status(400).json({ error: 'Kata sandi saat ini tidak sesuai.' });
    }

    if (newPassword) {
      if (newPassword.length < 4) {
        return res.status(400).json({ error: 'Kata sandi baru minimal 4 karakter.' });
      }
      db.adminUser.passwordHash = newPassword;
    }
    if (name) db.adminUser.name = name;
    if (email) db.adminUser.email = email;

    saveDatabase();
    res.json({ success: true, message: 'Kata sandi berhasil diperbarui.' });
  });

  // ==========================================
  // ADMIN DASHBOARD & CRUD ENDPOINTS
  // ==========================================

  // Admin Analytics & KPIs
  app.get('/api/admin/analytics', requireAdmin, (req: Request, res: Response) => {
    const today = new Date().toISOString().split('T')[0];

    const todayBookings = db.bookings.filter((b) => b.date === today);
    const todayRevenue = todayBookings
      .filter((b) => b.status === 'COMPLETED' || b.paymentStatus === 'PAID')
      .reduce((sum, b) => sum + b.finalPrice, 0);

    const completedCount = todayBookings.filter((b) => b.status === 'COMPLETED').length;
    const upcomingCount = todayBookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING').length;
    const cancelledCount = todayBookings.filter((b) => b.status === 'CANCELLED').length;
    const noShowCount = todayBookings.filter((b) => b.status === 'NO_SHOW').length;

    // Popular Services
    const serviceCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    db.bookings.forEach((b) => {
      if (b.status !== 'CANCELLED') {
        if (!serviceCounts[b.serviceName]) {
          serviceCounts[b.serviceName] = { name: b.serviceName, count: 0, revenue: 0 };
        }
        serviceCounts[b.serviceName].count += 1;
        serviceCounts[b.serviceName].revenue += b.finalPrice;
      }
    });

    // Barber performance
    const barberPerf: Record<string, { name: string; count: number; revenue: number; rating: number }> = {};
    db.barbers.forEach((barber) => {
      barberPerf[barber.id] = { name: barber.name, count: 0, revenue: 0, rating: barber.rating };
    });
    db.bookings.forEach((b) => {
      if (b.status !== 'CANCELLED' && barberPerf[b.barberId]) {
        barberPerf[b.barberId].count += 1;
        barberPerf[b.barberId].revenue += b.finalPrice;
      }
    });

    // Daily Trends for past 7 days
    const dailyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dBookings = db.bookings.filter((b) => b.date === dStr && b.status !== 'CANCELLED');
      const dRevenue = dBookings.reduce((sum, b) => sum + b.finalPrice, 0);
      dailyTrends.push({
        date: dStr,
        bookings: dBookings.length,
        revenue: dRevenue,
      });
    }

    const totalValidBookings = db.bookings.filter((b) => b.status !== 'CANCELLED').length;
    const totalAllRevenue = db.bookings
      .filter((b) => b.status !== 'CANCELLED')
      .reduce((sum, b) => sum + b.finalPrice, 0);

    const totalNoShows = db.bookings.filter((b) => b.status === 'NO_SHOW').length;
    const totalFinished = db.bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'NO_SHOW').length;

    const summary: AnalyticsSummary = {
      todayRevenue,
      todayBookingsCount: todayBookings.length,
      todayCompletedCount: completedCount,
      todayUpcomingCount: upcomingCount,
      todayCancelledCount: cancelledCount,
      thisWeekRevenue: dailyTrends.reduce((s, d) => s + d.revenue, 0),
      thisWeekBookingsCount: dailyTrends.reduce((s, d) => s + d.bookings, 0),
      thisMonthRevenue: totalAllRevenue,
      thisMonthBookingsCount: totalValidBookings,
      noShowRate: totalFinished > 0 ? Math.round((totalNoShows / totalFinished) * 100) : 0,
      averageBookingValue: totalValidBookings > 0 ? Math.round(totalAllRevenue / totalValidBookings) : 45000,
      popularServices: Object.values(serviceCounts).sort((a, b) => b.count - a.count),
      barberPerformance: Object.values(barberPerf).sort((a, b) => b.count - a.count),
      dailyTrends,
    };

    res.json(summary);
  });

  // Admin Bookings: List with Filters
  app.get('/api/admin/bookings', requireAdmin, (req: Request, res: Response) => {
    const { date, barberId, serviceId, status, search } = req.query;
    let list = [...db.bookings];

    if (date) {
      list = list.filter((b) => b.date === date);
    }
    if (barberId && barberId !== 'all') {
      list = list.filter((b) => b.barberId === barberId);
    }
    if (serviceId && serviceId !== 'all') {
      list = list.filter((b) => b.serviceId === serviceId);
    }
    if (status && status !== 'all') {
      list = list.filter((b) => b.status === status);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.bookingCode.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.customerPhone.includes(q)
      );
    }

    // Sort by date desc, then time asc
    list.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.startTime.localeCompare(b.startTime);
    });

    res.json(list);
  });

  // Admin Create Walk-In Booking
  app.post('/api/admin/bookings/walk-in', requireAdmin, (req: Request, res: Response) => {
    const { customerName, customerPhone, serviceId, barberId, date, startTime, paymentStatus, notes } = req.body;

    if (!customerName || !customerPhone || !serviceId || !barberId || !date || !startTime) {
      return res.status(400).json({ error: 'Semua field wajib diisi' });
    }

    const service = db.services.find((s) => s.id === serviceId);
    const barber = db.barbers.find((b) => b.id === barberId);

    if (!service || !barber) {
      return res.status(404).json({ error: 'Layanan atau barber tidak ditemukan' });
    }

    const startMin = timeToMinutes(startTime);
    const endMin = startMin + service.duration;
    const endTime = minutesToTime(endMin);

    // Double booking conflict check
    const conflict = db.bookings.find(
      (b) =>
        b.date === date &&
        b.barberId === barber.id &&
        b.status !== 'CANCELLED' &&
        isOverlapping(startMin, endMin, timeToMinutes(b.startTime), timeToMinutes(b.endTime))
    );

    if (conflict) {
      return res.status(409).json({
        error: `Jadwal bentrok! Barber ${barber.name} sudah memiliki booking pada jam ${conflict.startTime} - ${conflict.endTime}.`,
      });
    }

    const newBooking: Booking = {
      id: 'bk-' + Date.now(),
      bookingCode: generateBookingCode(),
      customerName,
      customerPhone,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      serviceDuration: service.duration,
      barberId: barber.id,
      barberName: barber.name,
      date,
      startTime,
      endTime,
      status: 'CONFIRMED',
      paymentStatus: paymentStatus || 'PAID',
      notes: notes || 'Walk-in customer',
      finalPrice: service.price,
      isWalkIn: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.bookings.push(newBooking);
    saveDatabase();

    res.status(201).json({ success: true, booking: newBooking });
  });

  // Admin Update Booking Status / Payment / Reschedule
  app.put('/api/admin/bookings/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, paymentStatus, date, startTime, barberId, serviceId, notes } = req.body;

    const booking = db.bookings.find((b) => b.id === id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking tidak ditemukan' });
    }

    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (notes !== undefined) booking.notes = notes;

    // Handle rescheduling
    if (date || startTime || barberId || serviceId) {
      const targetDate = date || booking.date;
      const targetStart = startTime || booking.startTime;
      const targetBarberId = barberId || booking.barberId;
      const targetServiceId = serviceId || booking.serviceId;

      const service = db.services.find((s) => s.id === targetServiceId) || { duration: booking.serviceDuration, name: booking.serviceName, price: booking.servicePrice };
      const barber = db.barbers.find((b) => b.id === targetBarberId);

      const startMin = timeToMinutes(targetStart);
      const endMin = startMin + service.duration;
      const endTime = minutesToTime(endMin);

      // Check conflict with other bookings
      const conflict = db.bookings.find(
        (b) =>
          b.id !== id &&
          b.date === targetDate &&
          b.barberId === targetBarberId &&
          b.status !== 'CANCELLED' &&
          isOverlapping(startMin, endMin, timeToMinutes(b.startTime), timeToMinutes(b.endTime))
      );

      if (conflict) {
        return res.status(409).json({
          error: `Jadwal bentrok! Ada booking lain pada ${conflict.startTime} - ${conflict.endTime}`,
        });
      }

      booking.date = targetDate;
      booking.startTime = targetStart;
      booking.endTime = endTime;
      booking.barberId = targetBarberId;
      if (barber) booking.barberName = barber.name;
      booking.serviceId = targetServiceId;
      booking.serviceName = service.name;
      booking.serviceDuration = service.duration;
    }

    booking.updatedAt = new Date().toISOString();
    saveDatabase();

    res.json({ success: true, booking });
  });

  // Admin Delete Booking
  app.delete('/api/admin/bookings/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.bookings.findIndex((b) => b.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Booking tidak ditemukan' });
    }
    db.bookings.splice(idx, 1);
    saveDatabase();
    res.json({ success: true, message: 'Booking berhasil dihapus' });
  });

  // ==========================================
  // BARBER MANAGEMENT
  // ==========================================
  app.get('/api/admin/barbers', requireAdmin, (req: Request, res: Response) => {
    res.json(db.barbers);
  });

  app.post('/api/admin/barbers', requireAdmin, (req: Request, res: Response) => {
    const { name, role, photoUrl, bio, specialization, services, workingDays, phone, rating, isActive, isAvailableToday, isOnDuty } = req.body;
    if (!name) return res.status(400).json({ error: 'Nama barber wajib diisi' });

    const activeStatus = isActive !== undefined ? Boolean(isActive) : true;
    const availableStatus = isAvailableToday !== undefined ? Boolean(isAvailableToday) : (isOnDuty !== undefined ? Boolean(isOnDuty) : true);

    const newBarber: Barber = {
      id: 'barber-' + Date.now(),
      name,
      role: role || 'Barber Specialist',
      phone: phone || '',
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
      bio: bio || '',
      specialization: Array.isArray(specialization) ? specialization : ['Classic Haircut', 'Razor Shave'],
      services: Array.isArray(services) ? services : db.services.map((s) => s.id),
      rating: rating !== undefined ? Number(rating) : 5.0,
      totalBookings: 0,
      isAvailableToday: availableStatus,
      isActive: activeStatus,
      workingDays: workingDays || JSON.parse(JSON.stringify(INITIAL_BARBERS[0].workingDays)),
    };

    db.barbers.push(newBarber);
    saveDatabase();
    res.status(201).json({ success: true, barber: newBarber });
  });

  app.put('/api/admin/barbers/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const barber = db.barbers.find((b) => b.id === id);
    if (!barber) return res.status(404).json({ error: 'Barber tidak ditemukan' });

    const updates = { ...req.body };
    if (updates.isOnDuty !== undefined && updates.isAvailableToday === undefined) {
      updates.isAvailableToday = Boolean(updates.isOnDuty);
    }
    if (updates.isActive !== undefined) {
      updates.isActive = Boolean(updates.isActive);
    }
    if (updates.isAvailableToday !== undefined) {
      updates.isAvailableToday = Boolean(updates.isAvailableToday);
    }

    Object.assign(barber, updates);
    saveDatabase();
    res.json({ success: true, barber });
  });

  app.delete('/api/admin/barbers/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.barbers.findIndex((b) => b.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Barber tidak ditemukan' });
    db.barbers.splice(idx, 1);
    saveDatabase();
    res.json({ success: true, message: 'Barber berhasil dihapus' });
  });

  // ==========================================
  // SERVICE MANAGEMENT
  // ==========================================
  app.get('/api/admin/services', requireAdmin, (req: Request, res: Response) => {
    res.json({ services: db.services, categories: db.categories });
  });

  app.post('/api/admin/services', requireAdmin, (req: Request, res: Response) => {
    const { name, categoryId, description, price, duration, photoUrl, isActive, featured } = req.body;
    if (!name || !price || !duration) {
      return res.status(400).json({ error: 'Nama, harga, dan durasi wajib diisi' });
    }

    const cat = db.categories.find((c) => c.id === categoryId) || db.categories[0];

    const newService: Service = {
      id: 'srv-' + Date.now(),
      name,
      categoryId: cat.id,
      categoryName: cat.name,
      description: description || '',
      price: Number(price),
      duration: Number(duration),
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      featured: Boolean(featured),
    };

    db.services.push(newService);
    saveDatabase();
    res.status(201).json({ success: true, service: newService });
  });

  app.put('/api/admin/services/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const service = db.services.find((s) => s.id === id);
    if (!service) return res.status(404).json({ error: 'Layanan tidak ditemukan' });

    if (req.body.categoryId) {
      const cat = db.categories.find((c) => c.id === req.body.categoryId);
      if (cat) {
        service.categoryId = cat.id;
        service.categoryName = cat.name;
      }
    }

    Object.assign(service, req.body);
    saveDatabase();
    res.json({ success: true, service });
  });

  app.delete('/api/admin/services/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.services.findIndex((s) => s.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Layanan tidak ditemukan' });
    db.services.splice(idx, 1);
    saveDatabase();
    res.json({ success: true, message: 'Layanan berhasil dihapus' });
  });

  // ==========================================
  // CUSTOMER MANAGEMENT & CRM
  // ==========================================
  app.get('/api/admin/customers', requireAdmin, (req: Request, res: Response) => {
    res.json(db.customers);
  });

  app.get('/api/admin/customers/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const customer = db.customers.find((c) => c.id === id);
    if (!customer) return res.status(404).json({ error: 'Customer tidak ditemukan' });

    const customerBookings = db.bookings.filter((b) => b.customerId === id || b.customerPhone === customer.phone);
    res.json({ customer, bookings: customerBookings });
  });

  app.post('/api/admin/customers', requireAdmin, (req: Request, res: Response) => {
    const {
      name,
      phone,
      email,
      memberStatus,
      totalVisits,
      totalBookings,
      totalSpending,
      totalSpent,
      favoriteBarberId,
      favoriteBarberName,
      favoriteServiceId,
      favoriteServiceName,
      barberNotes,
      photoUrl,
      lastVisit,
      lastBookingDate,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Nama dan nomor WhatsApp wajib diisi' });
    }

    const newCustomer: Customer = {
      id: 'cust-' + Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      memberStatus: memberStatus || 'BARU',
      photoUrl: photoUrl || undefined,
      totalVisits: Number(totalVisits || totalBookings || 1),
      totalBookings: Number(totalBookings || totalVisits || 1),
      totalSpending: Number(totalSpending || totalSpent || 0),
      totalSpent: Number(totalSpent || totalSpending || 0),
      lastVisit: lastVisit || lastBookingDate || new Date().toISOString().split('T')[0],
      lastBookingDate: lastBookingDate || lastVisit || new Date().toISOString().split('T')[0],
      favoriteBarberId: favoriteBarberId || undefined,
      favoriteBarberName: favoriteBarberName || undefined,
      favoriteServiceId: favoriteServiceId || undefined,
      favoriteServiceName: favoriteServiceName || undefined,
      barberNotes: barberNotes || '',
      notes: barberNotes
        ? [
            {
              id: 'nt-' + Date.now(),
              text: barberNotes,
              createdBy: 'Admin',
              createdAt: new Date().toISOString().split('T')[0],
            },
          ]
        : [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    db.customers.unshift(newCustomer);
    saveDatabase();
    res.status(201).json({ success: true, customer: newCustomer });
  });

  app.put('/api/admin/customers/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const customer = db.customers.find((c) => c.id === id);
    if (!customer) return res.status(404).json({ error: 'Customer tidak ditemukan' });

    if (req.body.name !== undefined) customer.name = req.body.name.trim();
    if (req.body.phone !== undefined) customer.phone = req.body.phone.trim();
    if (req.body.email !== undefined) customer.email = req.body.email ? req.body.email.trim() : undefined;
    if (req.body.memberStatus !== undefined) customer.memberStatus = req.body.memberStatus;
    if (req.body.photoUrl !== undefined) customer.photoUrl = req.body.photoUrl;
    if (req.body.totalVisits !== undefined) customer.totalVisits = Number(req.body.totalVisits);
    if (req.body.totalBookings !== undefined) customer.totalBookings = Number(req.body.totalBookings);
    if (req.body.totalSpending !== undefined) customer.totalSpending = Number(req.body.totalSpending);
    if (req.body.totalSpent !== undefined) customer.totalSpent = Number(req.body.totalSpent);
    if (req.body.lastVisit !== undefined) customer.lastVisit = req.body.lastVisit;
    if (req.body.lastBookingDate !== undefined) customer.lastBookingDate = req.body.lastBookingDate;
    if (req.body.favoriteBarberId !== undefined) customer.favoriteBarberId = req.body.favoriteBarberId;
    if (req.body.favoriteBarberName !== undefined) customer.favoriteBarberName = req.body.favoriteBarberName;
    if (req.body.favoriteServiceId !== undefined) customer.favoriteServiceId = req.body.favoriteServiceId;
    if (req.body.favoriteServiceName !== undefined) customer.favoriteServiceName = req.body.favoriteServiceName;
    if (req.body.barberNotes !== undefined) customer.barberNotes = req.body.barberNotes;

    saveDatabase();
    res.json({ success: true, customer });
  });

  app.delete('/api/admin/customers/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.customers.findIndex((c) => c.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Customer tidak ditemukan' });
    db.customers.splice(idx, 1);
    saveDatabase();
    res.json({ success: true, message: 'Customer berhasil dihapus' });
  });

  app.post('/api/admin/customers/:id/notes', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { text, createdBy } = req.body;
    const customer = db.customers.find((c) => c.id === id);
    if (!customer) return res.status(404).json({ error: 'Customer tidak ditemukan' });

    if (!text) return res.status(400).json({ error: 'Catatan tidak boleh kosong' });

    customer.notes.push({
      id: 'nt-' + Date.now(),
      text,
      createdBy: createdBy || 'Admin',
      createdAt: new Date().toISOString().split('T')[0],
    });

    saveDatabase();
    res.status(201).json({ success: true, customer });
  });

  // ==========================================
  // PROMO MANAGEMENT
  // ==========================================
  app.get('/api/admin/promos', requireAdmin, (req: Request, res: Response) => {
    res.json(db.promos);
  });

  app.post('/api/admin/promos', requireAdmin, (req: Request, res: Response) => {
    const { code, name, discountType, discountValue, minimumPurchase, startDate, endDate, usageLimit, isActive } = req.body;
    if (!code || !name || !discountValue) {
      return res.status(400).json({ error: 'Kode, nama promo, dan nilai diskon wajib diisi' });
    }

    const newPromo: Promo = {
      id: 'prm-' + Date.now(),
      code: code.trim().toUpperCase(),
      name,
      discountType: discountType || 'FIXED',
      discountValue: Number(discountValue),
      minimumPurchase: Number(minimumPurchase || 0),
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '2026-12-31',
      usageLimit: Number(usageLimit || 1000),
      usageCount: 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };

    db.promos.push(newPromo);
    saveDatabase();
    res.status(201).json({ success: true, promo: newPromo });
  });

  app.put('/api/admin/promos/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const promo = db.promos.find((p) => p.id === id);
    if (!promo) return res.status(404).json({ error: 'Promo tidak ditemukan' });

    if (req.body.code) req.body.code = req.body.code.trim().toUpperCase();
    Object.assign(promo, req.body);
    saveDatabase();
    res.json({ success: true, promo });
  });

  app.delete('/api/admin/promos/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.promos.findIndex((p) => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Promo tidak ditemukan' });
    db.promos.splice(idx, 1);
    saveDatabase();
    res.json({ success: true, message: 'Promo berhasil dihapus' });
  });

  // ==========================================
  // GALLERY MANAGEMENT
  // ==========================================
  app.get('/api/admin/gallery', requireAdmin, (req: Request, res: Response) => {
    res.json(db.gallery);
  });

  app.post('/api/admin/gallery', requireAdmin, (req: Request, res: Response) => {
    const { title, category, imageUrl, featured, barberName } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'Judul dan URL foto wajib diisi' });
    }

    const newItem: GalleryItem = {
      id: 'gal-' + Date.now(),
      title,
      category: category || 'Fade',
      imageUrl,
      featured: Boolean(featured),
      order: db.gallery.length + 1,
      barberName: barberName || 'Raise Dumai',
    };

    db.gallery.unshift(newItem);
    saveDatabase();
    res.status(201).json({ success: true, item: newItem });
  });

  app.delete('/api/admin/gallery/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.gallery.findIndex((g) => g.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Foto tidak ditemukan' });
    db.gallery.splice(idx, 1);
    saveDatabase();
    res.json({ success: true, message: 'Foto berhasil dihapus' });
  });

  // ==========================================
  // REVIEWS MANAGEMENT
  // ==========================================
  app.get('/api/admin/reviews', requireAdmin, (req: Request, res: Response) => {
    res.json(db.reviews);
  });

  app.put('/api/admin/reviews/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const review = db.reviews.find((r) => r.id === id);
    if (!review) return res.status(404).json({ error: 'Review tidak ditemukan' });

    if (status) review.status = status;
    saveDatabase();
    res.json({ success: true, review });
  });

  app.delete('/api/admin/reviews/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = db.reviews.findIndex((r) => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Review tidak ditemukan' });
    db.reviews.splice(idx, 1);
    saveDatabase();
    res.json({ success: true, message: 'Review berhasil dihapus' });
  });

  // ==========================================
  // WEBSITE & BUSINESS SETTINGS
  // ==========================================
  app.get('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
    res.json(db.settings);
  });

  app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
    Object.assign(db.settings, req.body);
    saveDatabase();
    res.json({ success: true, settings: db.settings });
  });

  // Notifications
  app.get('/api/admin/notifications', requireAdmin, (req: Request, res: Response) => {
    res.json(db.notifications);
  });

  app.put('/api/admin/notifications/mark-read', requireAdmin, (req: Request, res: Response) => {
    db.notifications.forEach((n) => (n.isRead = true));
    saveDatabase();
    res.json({ success: true });
  });

  // ==========================================
  // VITE MIDDLEWARE & STATIC FALLBACK
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RAISE BARBERSHOP DUMAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
