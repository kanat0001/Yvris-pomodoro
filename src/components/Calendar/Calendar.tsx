import { useEffect } from "react";
import { useCalendarStore } from "../../store/useCalendarStore";
import dayjs from "dayjs";
import "./Calendar.css";

export default function Calendar() {
  const days = useCalendarStore((s) => s.days);
  const selectedDay = useCalendarStore((s) => s.selectedDay);
  const setSelectedDay = useCalendarStore((s) => s.setSelectedDay);
  const initDays = useCalendarStore((s) => s.initDays);
  const loadMonth = useCalendarStore((s) => s.loadMonth);
  const statusSwitch = useCalendarStore((s) => s.statusSwitch);

  const today = dayjs();

  useEffect(() => {
    if (days.length === 0) {
      initDays();
      loadMonth();
    }
  }, [days.length, initDays, loadMonth]);

// Calendar.tsx (фрагмент)
return (
  <div className="calendar">
    <div className="calendar-grid week">
      {["пн", "вт", "ср", "чт", "пт", "сб", "вс"].map((day) => (
        <span key={day} className="week-day">{day}</span>
      ))}
    </div>

    <div className="calendar-grid">
      {days.map((dayObj, i) => {
        if (!dayObj) return <div key={i} className="empty-cell" />;

        const isToday = dayjs(dayObj.date).isSame(today, "day");
        const isPast = dayjs(dayObj.date).isBefore(today, "day");
        const isSelected = dayObj.dayNumber === selectedDay;

        return (
          <div
            key={i}
            className={[
              "day-cell",
              isToday ? "today" : "",
              isSelected ? "selected" : "",
              statusSwitch(dayObj), // должно возвращать: "green" | "yellow" | "red" | ""
              isPast ? "disabled" : "",
            ].join(" ")}
            onClick={isPast ? undefined : () => setSelectedDay(dayObj.dayNumber)}
            aria-disabled={isPast}
            role="button"
            tabIndex={isPast ? -1 : 0}
          >
            <div className="day-number">{dayObj.dayNumber}</div>

            {/* Если хочешь — можно выводить минуты текстом */}
            {/* <div className="minutes-text">{dayObj.minutes}m</div> */}

            {dayObj.minutes > 0 && <div className="day-minutes" />}
          </div>
        );
      })}
    </div>
  </div>
);

}
