import { create } from "zustand";
import dayjs from "dayjs";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export type DayStatus = 'none' | 'green' | 'red';

export type Day = {
  date: string;
  dayNumber: number;
  minutes: number;
  tasks: string[];
  status: DayStatus;
};

type CalendarStore = {
  days: (Day | null)[];
  selectedDay: number | null;
  newTask: string;

  setSelectedDay: (day: number | null) => void;
  setNewTask: (task: string) => void;
  initDays: () => void;
  addTask: (text: string) => void;
  addMinutes: (minutes: number) => void;

  saveDay: (day: Day) => Promise<void>;
  loadMonth: () => Promise<void>;

  getTotalMinutes: () => number;
  getTodayMinutes: () => number;
};

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  days: [],
  selectedDay: null,
  newTask: "",

  setSelectedDay: (day) => set({ selectedDay: day }),
  setNewTask: (task) => set({ newTask: task }),

  // Инициализация дней месяца
  initDays: () => {
    const now = dayjs();
    const daysInMonth = now.daysInMonth();
    const startOffset = (now.startOf('month').day() + 6) % 7;

    const result: (Day | null)[] = [];

    for (let i = 0; i < startOffset; i++) result.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = now.date(d).format('YYYY-MM-DD');
      result.push({
        date,
        dayNumber: d,
        minutes: 0,
        tasks: [],
        status: 'none'
      });
    }

    set({ days: result });
  },

  addTask: (text: string) => {
    const { selectedDay, days } = get();
    if (!selectedDay || !text.trim()) return;

    const updated = days.map(d =>
      d && d.dayNumber === selectedDay
        ? { ...d, tasks: [...d.tasks, text.trim()] }
        : d
    );

    set({ days: updated, newTask: "" });

    const day = updated.find(d => d?.dayNumber === selectedDay);
    if (day) get().saveDay(day);
  },

  addMinutes: (minutes: number) => {
    const { selectedDay, days } = get();
    if (!selectedDay) return;

    const updated = days.map(d =>
      d && d.dayNumber === selectedDay
        ? {
            ...d,
            minutes: d.minutes + minutes,
            status: d.minutes + minutes > 0 ? 'green' : d.status
          }
        : d
    );

    set({ days: updated });

    const day = updated.find(d => d?.dayNumber === selectedDay);
    if (day) get().saveDay(day);
  },

  saveDay: async (day: Day) => {
    const monthKey = dayjs(day.date).format('YYYY-MM');
    const monthRef = doc(db, 'users', 'testUser', 'months', monthKey);

    await setDoc(
      monthRef,
      {
        days: {
          [day.date]: {
            minutes: day.minutes,
            tasks: day.tasks,
            status: day.status
          }
        }
      },
      { merge: true } // добавляет/обновляет только этот день, не затирая другие
    );
  },

  loadMonth: async () => {
    const now = dayjs();
    const monthKey = now.format('YYYY-MM');
    const monthRef = doc(db, 'users', 'testUser', 'months', monthKey);

    const snap = await getDoc(monthRef);
    if (!snap.exists()) return;

    const monthData = snap.data().days || {};
    const currentDays = get().days;
    const updatedDays = [...currentDays];

    updatedDays.forEach((day, index) => {
      if (!day) return;
      const saved = monthData[day.date];
      if (!saved) return;

      updatedDays[index] = {
        ...day,
        minutes: saved.minutes ?? 0,
        tasks: saved.tasks ?? [],
        status: saved.status ?? 'none'
      };
    });

    set({ days: updatedDays });
  },

  getTotalMinutes: () => {
    return get().days.reduce((sum, day) => sum + (day?.minutes ?? 0), 0);
  },

  getTodayMinutes: () => {
    const today = dayjs().format('YYYY-MM-DD');
    const day = get().days.find(d => d?.date === today);
    return day?.minutes ?? 0;
  }
}));
