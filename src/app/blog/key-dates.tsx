"use client";

import { KEY_DATES, categoryOf } from "./articles";
import { daysUntil, formatShortDay } from "./query";
import { useToday } from "./saved-store";

function countdown(days: number): string {
  if (days < 0) return "Ya en vigor";
  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  return `Faltan ${days.toLocaleString("es-ES")} días`;
}

/** Upcoming legal deadlines with a live countdown (computed in the browser). */
export function KeyDates() {
  const today = useToday();
  return (
    <ol className="bl-dates">
      {KEY_DATES.map((item) => {
        const days = today ? daysUntil(item.date, today) : null;
        return (
          <li key={item.date + item.title} className={`bl-date bl-tone--${item.category}`}>
            <div className="flex items-start justify-between gap-3">
              <time dateTime={item.date} className="bl-date__day">
                {formatShortDay(item.date)} <span>{item.date.slice(0, 4)}</span>
              </time>
              <span className="bl-chip">{categoryOf(item.category).product}</span>
            </div>
            <p className="bl-date__title">{item.title}</p>
            <p className="bl-date__detail">{item.detail}</p>
            <p className="bl-date__count">
              {days === null ? " " : countdown(days)}
              {item.tentative && <span className="bl-date__flag">Puede cambiar</span>}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
