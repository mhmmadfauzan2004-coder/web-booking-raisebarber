export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';
export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'HIDDEN';

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Service {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: number; // In IDR (Rupiah)
  duration: number; // In minutes, e.g. 30, 45, 60
  photoUrl: string;
  isActive: boolean;
  featured?: boolean;
}

export interface BarberWorkingDay {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isOpen: boolean;
  startTime: string; // "09:00" or "13:00"
  endTime: string;   // "22:00"
  breakStartTime?: string; // e.g. "15:00"
  breakEndTime?: string;   // e.g. "16:00"
}

export interface Barber {
  id: string;
  name: string;
  role: string; // e.g. "Master Barber", "Senior Barber", "Hairstylist"
  phone?: string;
  photoUrl: string;
  bio: string;
  specialization: string[]; // e.g. ["Fade Specialist", "Classic Cut", "Hot Towel Shave", "Beard Sculpting"]
  services: string[]; // List of service IDs they can perform
  rating: number; // e.g. 4.9
  totalBookings: number;
  isAvailableToday: boolean;
  isActive: boolean;
  workingDays: BarberWorkingDay[];
  dayOffs?: string[]; // Specific date strings (YYYY-MM-DD)
}

export interface CustomerNote {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
}

export type CustomerMemberStatus = 'VIP' | 'REGULER' | 'BARU';

export interface Customer {
  id: string;
  name: string;
  phone: string; // WhatsApp number
  email?: string;
  photoUrl?: string;
  memberStatus?: CustomerMemberStatus | string;
  totalVisits: number;
  totalBookings?: number;
  lastVisit?: string;
  lastBookingDate?: string;
  totalSpending: number;
  totalSpent?: number;
  favoriteBarberId?: string;
  favoriteBarberName?: string;
  favoriteServiceId?: string;
  favoriteServiceName?: string;
  barberNotes?: string; // Catatan Khusus Barber
  notes: CustomerNote[];
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingCode: string; // e.g. RAISE-8F42K
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  barberId: string;
  barberName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (e.g. 10:00)
  endTime: string;   // HH:mm (e.g. 10:45)
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string; // e.g. "mau low taper fade"
  promoCode?: string;
  discountAmount?: number;
  finalPrice: number;
  isWalkIn?: boolean;
  createdAt: string;
  updatedAt: string;
  hasReviewed?: boolean;
}

export interface Promo {
  id: string;
  code: string;
  name: string;
  discountType: DiscountType;
  discountValue: number; // e.g. 15 for 15% or 10000 for Rp 10.000
  minimumPurchase: number;
  minOrder?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  validUntil?: string;
  maxDiscount?: number;
  usageLimit?: number;
  maxUsage?: number;
  usageCount?: number;
  usedCount?: number;
  isActive: boolean;
}

export type PromoCode = Promo;

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Fade' | 'Crop' | 'Classic' | 'Texture' | 'Styling' | 'Shave' | 'Barbershop' | string;
  imageUrl: string;
  featured?: boolean;
  order?: number;
  barberId?: string;
  barberName?: string;
  createdAt?: string;
}

export interface Review {
  id: string;
  customerName: string;
  customerPhone?: string;
  barberId: string;
  barberName: string;
  serviceName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  bookingCode: string;
  status: ReviewStatus;
}

export interface BusinessDayHours {
  dayName: string;
  dayKey: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isOpen: boolean;
  openTime: string;  // e.g. "09:00"
  closeTime: string; // e.g. "22:00"
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string;
}

export interface BookingRules {
  slotIntervalMinutes: number; // default 30
  minimumNoticeMinutes?: number; // default 60 (1 hour)
  maximumAdvanceDays?: number; // default 14
  cancellationWindowHours: number; // default 2 hours
  allowGuestBooking: boolean;
  allowCustomerCancellation?: boolean;
  allowCustomerReschedule?: boolean;
  maxAdvanceBookingDays?: number;
}

export interface WebsiteSettings {
  brandName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  instagramUsername?: string;
  instagramUrl?: string;
  address: string;
  addressDetails: string;
  googleMapsEmbedUrl: string;
  googleMapsDirectionsUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  aboutTitle?: string;
  aboutText?: string;
  aboutFeatures?: string[];
  logoUrl?: string;
  businessHours: BusinessDayHours[];
  holidays?: Holiday[];
  bookingRules?: BookingRules;
  cancellationWindowHours?: number;
  slotIntervalMinutes?: number;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  bookingId?: string;
  bookingCode?: string;
  type: 'NEW_BOOKING' | 'CANCELLED_BOOKING' | 'NEW_REVIEW' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface TimeSlot {
  time: string; // HH:mm e.g. "09:00"
  available: boolean;
  reason?: string;
  barberId?: string;
  barberName?: string;
}

export interface AnalyticsSummary {
  todayRevenue: number;
  todayBookingsCount?: number;
  todayBookings?: number;
  todayCompletedCount?: number;
  completedToday?: number;
  todayUpcomingCount?: number;
  confirmedUpcoming?: number;
  todayCancelledCount?: number;
  cancelledToday?: number;
  thisWeekRevenue?: number;
  weeklyRevenue?: number;
  thisWeekBookingsCount?: number;
  thisMonthRevenue?: number;
  monthlyRevenue?: number;
  thisMonthBookingsCount?: number;
  totalBookingsMonth?: number;
  noShowRate: number;
  averageBookingValue?: number;
  averageTicket?: number;
  popularServices?: { name: string; count: number; revenue: number }[];
  topServices?: { name: string; count: number; revenue: number }[];
  barberPerformance?: { barberId?: string; barberName?: string; name?: string; count?: number; bookingsCount?: number; revenue: number; rating: number }[];
  dailyTrends?: { date: string; bookings: number; revenue: number }[];
  revenueByDay?: { date: string; bookings: number; revenue: number }[];
}

export type DashboardStats = AnalyticsSummary;
