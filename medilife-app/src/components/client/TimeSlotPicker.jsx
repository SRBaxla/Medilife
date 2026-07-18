import React from 'react';

/**
 * TimeSlotPicker – a reusable component for selecting a time slot.
 *
 * Props:
 *   slots: array of string – time slot labels (e.g. '7:00 AM').
 *   booked: array of objects – each representing an appointment with at least a `slot` field.
 *   technicianCount: number – total technicians available for the selected date.
 *   selected: string – currently selected slot (controlled from parent).
 *   onSelect: function – callback invoked with the slot when a selectable button is clicked.
 *   selectedDate: string – selected date in 'YYYY-MM-DD' format.
 */
export default function TimeSlotPicker({ slots, booked, technicianCount, selected, onSelect, selectedDate }) {
  const getLocalDateStr = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayStr = getLocalDateStr(new Date());
  const isToday = selectedDate === todayStr;

  const parseSlotToMinutes = (slotStr) => {
    const match = slotStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours !== 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    return hours * 60 + minutes;
  };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Helper to count how many appointments are already booked for a given slot
  const countForSlot = (slot) => booked.filter((a) => a.slot === slot).length;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-sm">
      {slots.map((slot) => {
        const bookedCount = countForSlot(slot);
        const isBookedOut = bookedCount >= technicianCount;

        // Determine if this time slot is in the past for today
        const slotMinutes = parseSlotToMinutes(slot);
        const isPastSlot = isToday && (slotMinutes <= currentMinutes);

        const isDisabled = isBookedOut || isPastSlot;
        const isActive = selected === slot;

        const baseClasses = 'py-sm px-md rounded-xl border transition-all text-label-md disabled:cursor-not-allowed';
        let stateClasses = '';

        if (isDisabled) {
          stateClasses = 'bg-surface-container-lowest text-on-surface/40 border-outline-variant/20 cursor-not-allowed';
        } else if (isActive) {
          stateClasses = 'bg-primary text-on-primary border-primary font-bold shadow-clinical';
        } else {
          stateClasses = 'bg-surface-container-lowest text-on-surface hover:bg-secondary-container hover:text-primary hover:border-primary border-outline-variant/30';
        }

        return (
          <button
            key={slot}
            disabled={isDisabled}
            onClick={() => onSelect(slot)}
            className={`${baseClasses} ${stateClasses}`}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}
