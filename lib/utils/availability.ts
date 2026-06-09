export type WeeklyAvailability = {
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  endTime: string;
  startTime: string;
};

export type AvailabilitySlot = {
  end: string;
  label: string;
  start: string;
};

const dayNames: WeeklyAvailability["day"][] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function withMinutes(date: Date, minutes: number) {
  const next = new Date(date);
  next.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return next;
}

function formatSlot(start: Date, end: Date) {
  return `${new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(start)} - ${new Intl.DateTimeFormat("en", {
    timeStyle: "short",
  }).format(end)}`;
}

export function buildAvailabilitySlots({
  blockedStarts,
  days = 14,
  durationMinutes,
  now = new Date(),
  weeklyAvailability,
}: {
  blockedStarts: Set<string>;
  days?: number;
  durationMinutes: number;
  now?: Date;
  weeklyAvailability: WeeklyAvailability[];
}) {
  const slots: AvailabilitySlot[] = [];
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < days; offset += 1) {
    const day = new Date(today);
    day.setDate(today.getDate() + offset);
    const dayName = dayNames[day.getDay()];
    const windows = weeklyAvailability.filter((item) => item.day === dayName);

    windows.forEach((window) => {
      const startMinutes = timeToMinutes(window.startTime);
      const endMinutes = timeToMinutes(window.endTime);

      for (
        let cursor = startMinutes;
        cursor + durationMinutes <= endMinutes;
        cursor += durationMinutes
      ) {
        const start = withMinutes(day, cursor);
        const end = withMinutes(day, cursor + durationMinutes);
        const startIso = start.toISOString();

        if (start <= now || blockedStarts.has(startIso)) {
          continue;
        }

        slots.push({
          end: end.toISOString(),
          label: formatSlot(start, end),
          start: startIso,
        });
      }
    });
  }

  return slots;
}
