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
  const statusSwitch = useCalendarStore(s => s.statusSwitch);

  const today = dayjs();

  useEffect(() => {
    if (days.length === 0) {
      initDays();
      loadDays();
    }
  }, []);

  return (
    <div>
      {/* Шапка с днями недели */}
      <div className="calendar-grid week">
        {['пн','вт','ср','чт','пт','сб','вс'].map(day => (
          <span key={day}>{day}</span>
        ))}
      </div>

      {/* Сетка дней */}
      <div className="calendar-grid">
        {days.map((dayObj, i) => {
          if (!dayObj) return <div key={i} className="empty-cell" />;

          // Проверяем, сегодняшний ли день
          const isToday =
            dayObj.dayNumber === today.date() &&
            today.month() === today.month() &&
            today.year() === today.year();

          return (
            <div
              key={i}
              className={`
                day-cell 
                ${isToday ? 'today' : ''} 
                ${dayObj.dayNumber === selectedDay ? 'selected' : ''} 
                ${statusSwitch(dayObj)}
              `}
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
