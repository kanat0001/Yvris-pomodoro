import { create } from "zustand";
import dayjs from "dayjs";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

/* =======================
   TYPES
======================= */

export type DayStatus = 'none' | 'green' | 'red';

export type Day = {
  date: string;
  dayNumber: number;
  minutes: number;
  tasks: string[];
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

  statusSwitch: (day: Day) => DayStatus;
};

/* =======================
   STORE
======================= */

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  days: [],
  selectedDay: null,
  newTask: "",

  /* ---------- UI ---------- */

  setSelectedDay: (day) => set({ selectedDay: day }),
  setNewTask: (task) => set({ newTask: task }),

  /* ---------- INIT DAYS ---------- */

  initDays: () => {
    const now = dayjs();
    const daysInMonth = now.daysInMonth();
    const startOffset = (now.startOf("month").day() + 6) % 7;

    const result: (Day | null)[] = [];

    for (let i = 0; i < startOffset; i++) result.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = now.date(d).format("YYYY-MM-DD");
      result.push({
        date,
        dayNumber: d,
        minutes: 0,
        tasks: [],
      });
    }

    set({ days: result });
  },

  /* ---------- STATUS (DERIVED) ---------- */

  statusSwitch: (day) => {
    const today = dayjs().format("YYYY-MM-DD");

    // future
    if (day.date > today) return "none";

    // success
    if (day.minutes >= 4 && day.tasks.length >= 3) {
      return "green";
    }

    // failed
    if (
      day.date < today &&
      day.minutes === 0 &&
      day.tasks.length === 0
    ) {
      return "red";
    }

    return "none";
  },

  /* ---------- TASKS ---------- */

  addTask: (text) => {
    const { selectedDay, days } = get();
    if (!selectedDay || !text.trim()) return;

    const updated = days.map((d) =>
      d && d.dayNumber === selectedDay
        ? { ...d, tasks: [...d.tasks, text.trim()] }
        : d
    );

    set({ days: updated, newTask: "" });

    const day = updated.find((d) => d?.dayNumber === selectedDay);
    if (day) get().saveDay(day);
  },

  /* ---------- MINUTES ---------- */

  addMinutes: (minutes) => {
    const { selectedDay, days } = get();
    if (!selectedDay) return;

    const updated = days.map((d) =>
      d && d.dayNumber === selectedDay
        ? { ...d, minutes: d.minutes + minutes }
        : d
    );

    set({ days: updated });

    const day = updated.find((d) => d?.dayNumber === selectedDay);
    if (day) get().saveDay(day);
  },

  /* ---------- FIREBASE ---------- */

  saveDay: async (day) => {
    const monthKey = dayjs(day.date).format("YYYY-MM");
    const monthRef = doc(db, "users", "testUser", "months", monthKey);

    await setDoc(
      monthRef,
      {
        days: {
          [day.date]: {
            minutes: day.minutes,
            tasks: day.tasks,
          },
        },
      },
      { merge: true }
    );
  },

  loadMonth: async () => {
    const now = dayjs();
    const monthKey = now.format("YYYY-MM");
    const monthRef = doc(db, "users", "testUser", "months", monthKey);

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
      };
    });

    set({ days: updatedDays });
  },

  /* ---------- STATS ---------- */

  getTotalMinutes: () =>
    get().days.reduce((sum, day) => sum + (day?.minutes ?? 0), 0),

  getTodayMinutes: () => {
    const today = dayjs().format("YYYY-MM-DD");
    const day = get().days.find((d) => d?.date === today);
    return day?.minutes ?? 0;
  },
}));
