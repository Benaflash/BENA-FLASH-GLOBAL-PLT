import React, { useState } from "react";
import { LeadQuote } from "../types";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";

interface CalendarGridProps {
  leads: LeadQuote[];
  isAdmin?: boolean;
  onSelectSlot?: (date: string, timeSlot: string) => void;
  selectedDate?: string;
  selectedSlot?: string;
}

const TIME_SLOTS = [
  "09:00 AM - 11:00 AM",
  "11:30 AM - 01:30 PM",
  "02:30 PM - 04:30 PM",
  "05:00 PM - 07:00 PM",
];

export default function CalendarGrid({
  leads,
  isAdmin,
  onSelectSlot,
  selectedDate,
  selectedSlot,
}: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  ).getDay();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  // Build the calendar days array (padding with nulls for empty start days)
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Get booked slots for a specific date (YYYY-MM-DD format)
  const getBookedSlots = (dateString: string) => {
    return leads
      .filter((l) => l.scheduledDate === dateString && l.scheduledTimeSlot)
      .map((l) => l.scheduledTimeSlot!);
  };

  const getLeadsForDate = (dateString: string) => {
    return leads.filter(
      (l) => l.scheduledDate === dateString && l.scheduledTimeSlot,
    );
  };

  // Month formatting
  const monthNames = [
    "Januari",
    "Februari",
    "Mac",
    "April",
    "Mei",
    "Jun",
    "Julai",
    "Ogos",
    "September",
    "Oktober",
    "November",
    "Disember",
  ];

  const [viewDateDetails, setViewDateDetails] = useState<string | null>(null);

  const handleDayClick = (day: number | null) => {
    if (!day) return;

    const d = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    const dateStr = d.toLocaleDateString("en-CA"); // YYYY-MM-DD format usually, but let's be safe:

    // Fallback manual formatting for YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    setViewDateDetails(formattedDate);

    // If not admin, and we want to auto-select a date for booking
    if (!isAdmin && onSelectSlot) {
      onSelectSlot(formattedDate, "");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[#D4AF37]" />
          <span>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
          {["Ahad", "Isnin", "Sela", "Rabu", "Kham", "Juma", "Sabt"].map(
            (day) => (
              <div
                key={day}
                className="text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider py-2"
              >
                {day}
              </div>
            ),
          )}
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {days.map((day, idx) => {
            if (!day)
              return (
                <div
                  key={`empty-${idx}`}
                  className="h-16 md:h-24 rounded-lg bg-transparent"
                />
              );

            const d = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              day,
            );
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            const dateStr = `${yyyy}-${mm}-${dd}`;

            const isPast = d < today;
            const bookedSlots = getBookedSlots(dateStr);
            const isFullyBooked = bookedSlots.length >= TIME_SLOTS.length;
            const isToday = d.getTime() === today.getTime();
            const isSelected =
              selectedDate === dateStr || viewDateDetails === dateStr;

            return (
              <div
                key={dateStr}
                onClick={() => !isPast && handleDayClick(day)}
                className={`
                  h-16 md:h-24 rounded-lg p-1 md:p-2 border transition cursor-pointer relative overflow-hidden flex flex-col
                  ${isPast ? "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed" : "bg-white hover:border-[#D4AF37]/50 hover:bg-yellow-50/30"}
                  ${isToday ? "border-[#D4AF37]/50 shadow-sm" : "border-slate-100"}
                  ${isSelected ? "ring-2 ring-[#D4AF37] border-transparent" : ""}
                  ${isFullyBooked && !isPast ? "bg-rose-50/50 border-rose-100" : ""}
                `}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`text-xs md:text-sm font-bold ${isToday ? "text-[#D4AF37]" : "text-slate-700"}`}
                  >
                    {day}
                  </span>
                  {isToday && (
                    <span className="text-[8px] bg-[#D4AF37] text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider hidden md:block">
                      Hari Ini
                    </span>
                  )}
                </div>

                <div className="mt-auto space-y-0.5 md:space-y-1">
                  {!isPast && bookedSlots.length > 0 && (
                    <div className="text-[8px] md:text-[9px] font-bold text-rose-600 bg-rose-100 px-1 py-0.5 rounded truncate">
                      {bookedSlots.length} Penuh
                    </div>
                  )}
                  {!isPast &&
                    bookedSlots.length < TIME_SLOTS.length &&
                    bookedSlots.length > 0 && (
                      <div className="text-[8px] md:text-[9px] font-bold text-amber-600 bg-amber-100 px-1 py-0.5 rounded truncate">
                        {TIME_SLOTS.length - bookedSlots.length} Kosong
                      </div>
                    )}
                  {!isPast && bookedSlots.length === 0 && (
                    <div className="text-[8px] md:text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1 py-0.5 rounded truncate hidden md:block">
                      Tersedia
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Details Panel */}
      {viewDateDetails && (
        <div className="border-t border-slate-100 bg-slate-50 p-4 md:p-6 animate-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-slate-800 text-sm">
              Perincian: {viewDateDetails}
            </h4>
            <button
              onClick={() => setViewDateDetails(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TIME_SLOTS.map((slot) => {
              const leadsForSlot = getLeadsForDate(viewDateDetails).filter(
                (l) =>
                  l.scheduledTimeSlot === slot ||
                  (slot.includes("02:30 PM") &&
                    l.scheduledTimeSlot?.includes("02:35 PM")),
              );
              const isBooked = leadsForSlot.length > 0;

              return (
                <div
                  key={slot}
                  onClick={() => {
                    if (!isBooked && !isAdmin && onSelectSlot) {
                      onSelectSlot(viewDateDetails, slot);
                    }
                  }}
                  className={`
                    p-3 rounded-xl border flex items-start gap-3 transition
                    ${isBooked ? "bg-white border-rose-200" : "bg-white border-slate-200"}
                    ${!isBooked && !isAdmin ? "hover:border-[#D4AF37] cursor-pointer" : ""}
                    ${selectedSlot === slot && selectedDate === viewDateDetails ? "ring-2 ring-[#D4AF37] border-transparent" : ""}
                  `}
                >
                  <div
                    className={`p-2 rounded-lg mt-0.5 ${isBooked ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-400"}`}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-700">
                      {slot}
                    </span>
                    {isBooked ? (
                      <div className="mt-1 space-y-1">
                        <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[9px] font-extrabold uppercase tracking-wider">
                          Ditempah
                        </span>
                        {isAdmin &&
                          leadsForSlot.map((l) => (
                            <div
                              key={l.id}
                              className="text-[10px] text-slate-600 mt-1"
                            >
                              <span className="font-bold text-slate-800">
                                {l.name}
                              </span>
                              <br />
                              <span className="text-slate-500">
                                {l.serviceType}
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-extrabold uppercase tracking-wider mt-1">
                        Kosong
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
