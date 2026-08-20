import { Booking } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function generateWhatsAppMessage(booking: Booking, phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '62');
  const message = `Halo Raise Barbershop Dumai,

Saya ingin konfirmasi booking.

Booking Code: ${booking.bookingCode}
Nama: ${booking.customerName}
Service: ${booking.serviceName}
Barber: ${booking.barberName}
Tanggal: ${formatDateIndo(booking.date)}
Jam: ${booking.startTime} - ${booking.endTime}
Total: ${formatRupiah(booking.finalPrice)}
${booking.notes ? `Catatan: ${booking.notes}\n` : ''}
Terima kasih.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function downloadCalendarICS(booking: Booking) {
  const [year, month, day] = booking.date.split('-').map(Number);
  const [startH, startM] = booking.startTime.split(':').map(Number);
  const [endH, endM] = booking.endTime.split(':').map(Number);

  const pad = (n: number) => String(n).padStart(2, '0');

  // Format YYYYMMDDTHHmm00
  const dtStart = `${year}${pad(month)}${pad(day)}T${pad(startH)}${pad(startM)}00`;
  const dtEnd = `${year}${pad(month)}${pad(day)}T${pad(endH)}${pad(endM)}00`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Raise Barbershop Dumai//Booking System//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.bookingCode}@raisebarbershop.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Cukur Rambut di Raise Barbershop (${booking.serviceName})`,
    `DESCRIPTION:Reservasi ${booking.serviceName} bersama ${booking.barberName}. Kode Booking: ${booking.bookingCode}. Lokasi: Jl. Pangeran Diponegoro, Sukajadi, Dumai.`,
    'LOCATION:Jl. Pangeran Diponegoro, Sukajadi, Dumai Kota, Riau',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `RaiseBarbershop_${booking.bookingCode}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
