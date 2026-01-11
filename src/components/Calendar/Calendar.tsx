import { useEffect } from "react";
import { useCalendarStore } from "../../store/useCalendarStore";
import dayjs from "dayjs";
import "./Calendar.css";

export default function Calendar() {
  const days = useCalendarStore(s => s.days);
  const selectedDay = useCalendarStore(s => s.selectedDay);
  const setSelectedDay = useCalendarStore(s => s.setSelectedDay);
  const initDays = useCalendarStore(s => s.initDays);
  const loadDays = useCalendarStore(s => s.loadMonth);

  const currentDate = dayjs();
  const today = dayjs();

  useEffect(() => {
    if (days.length === 0) {
      initDays();
      loadDays();
    }
  }, []);

  return (
    <div>
      <div className="calendar-grid week">
        {['пн','вт','ср','чт','пт','сб','вс'].map(day => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((dayObj, i) => {
          if (!dayObj) return <div key={i} className="empty-cell" />;

          const isToday =
            dayObj.dayNumber === today.date() &&
            currentDate.month() === today.month() &&
            currentDate.year() === today.year();

          return (
            <div
              key={i}
              className={`day-cell 
                ${isToday ? 'today' : ''} 
                ${dayObj.dayNumber === selectedDay ? 'selected' : ''} 
                ${dayObj.status}`}
              onClick={() => setSelectedDay(dayObj.dayNumber)}
            >
              <div className="day-number">{dayObj.dayNumber}</div>
              {dayObj.minutes > 0 && (
                <div className="day-minutes">{dayObj.minutes} мин</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
