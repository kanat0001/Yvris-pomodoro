// ✅ useCalendarStore.ts (полный файл)

import { create } from "zustand";
import dayjs from "dayjs";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

/* =======================
   TYPES
======================= */

export type DayStatus = "none" | "green" | "red" | "violet";


export type Task = {
  text: string;
  done: boolean;
};

export type Day = {
  date: string;
  dayNumber: number;
  minutes: number;
  tasks: Task[];
};

type CalendarStore = {
  days: (Day | null)[];
  selectedDay: number | null;
  newTask: string;

  isMonthLoaded: boolean;

  setSelectedDay: (day: number | null) => void;
  setNewTask: (task: string) => void;

  initDays: () => void;

  addTask: (text: string) => void;
  deleteTask: (taskIndex: number) => void;
  renameTask: (taskIndex: number, newText: string) => void;
  toggleTaskDone: (taskIndex: number) => void;

  addMinutes: (minutes: number) => void;

  saveDay: (day: Day) => Promise<void>;
  loadMonth: () => Promise<void>;

  getTotalMinutes: () => number;
  getTodayMinutes: () => number;

  statusSwitch: (day: Day) => DayStatus;

  getTotalDoneTasks: () => number;
  getTodayDoneTasks: () => number;
  getDoneTasksByDate: (date: string) => number;

};

/* =======================
   STORE
======================= */

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  days: [],
  selectedDay: null,
  newTask: "",

  isMonthLoaded: false,

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
  if (!get().isMonthLoaded) return "none";

  const today = dayjs().format("YYYY-MM-DD");

  // будущее — нейтрально
  if (day.date > today) return "none";

  const doneTasks = day.tasks.filter(t => t.done).length;
  const enoughTasks = doneTasks >= 3;
  const enoughMinutes = day.minutes >= 70;

  // 🟣 оба условия
  if (enoughTasks && enoughMinutes) return "violet";

  // 🟢 одно из условий
  if (enoughTasks || enoughMinutes) return "green";

  // ⚪ сегодня не трогаем (день ещё не закончился)
  if (day.date === today) return "none";

  // 🔴 любой прошедший день, который не green/violet — провал
  return "red";
},


  /* ---------- TASKS ---------- */

  addTask: (text) => {
    const { selectedDay, days } = get();
    if (!selectedDay || !text.trim()) return;

    const current = days.find((d) => d?.dayNumber === selectedDay);
    if (!current) return;

    // ✅ запрет на прошлые дни
    if (dayjs(current.date).isBefore(dayjs(), "day")) return;

    const updated = days.map((d) =>
      d && d.dayNumber === selectedDay
        ? { ...d, tasks: [...d.tasks, { text: text.trim(), done: false }] }
        : d
    );

    set({ days: updated, newTask: "" });

    const day = updated.find((d) => d?.dayNumber === selectedDay);
    if (day) get().saveDay(day);
  },

  toggleTaskDone: (taskIndex) => {
    const { selectedDay, days } = get();
    if (!selectedDay) return;

    const current = days.find((d) => d?.dayNumber === selectedDay);
    if (!current) return;

    // ✅ запрет на прошлые дни
    if (dayjs(current.date).isBefore(dayjs(), "day")) return;

    const updated = days.map((d) => {
      if (!d || d.dayNumber !== selectedDay) return d;
      if (taskIndex < 0 || taskIndex >= d.tasks.length) return d;

      const nextTasks = d.tasks.map((t, i) =>
        i === taskIndex ? { ...t, done: !t.done } : t
      );

      return { ...d, tasks: nextTasks };
    });

    set({ days: updated });

    const day = updated.find((d) => d?.dayNumber === selectedDay);
    if (day) get().saveDay(day);
  },

  deleteTask: (taskIndex) => {
    const { selectedDay, days } = get();
    if (!selectedDay) return;

    const current = days.find((d) => d?.dayNumber === selectedDay);
    if (!current) return;

    // ✅ запрет на прошлые дни
    if (dayjs(current.date).isBefore(dayjs(), "day")) return;

    const updated = days.map((d) => {
      if (!d || d.dayNumber !== selectedDay) return d;

      const nextTasks = d.tasks.filter((_, i) => i !== taskIndex);
      return { ...d, tasks: nextTasks };
    });

    set({ days: updated });

    const day = updated.find((d) => d?.dayNumber === selectedDay);
    if (day) get().saveDay(day);
  },

  renameTask: (taskIndex, newText) => {
    const { selectedDay, days } = get();
    if (!selectedDay) return;

    const current = days.find((d) => d?.dayNumber === selectedDay);
    if (!current) return;

    // ✅ запрет на прошлые дни
    if (dayjs(current.date).isBefore(dayjs(), "day")) return;

    const text = newText.trim();
    if (!text) return;

    const updated = days.map((d) => {
      if (!d || d.dayNumber !== selectedDay) return d;
      if (taskIndex < 0 || taskIndex >= d.tasks.length) return d;

      const nextTasks = d.tasks.map((t, i) => (i === taskIndex ? { ...t, text } : t));
      return { ...d, tasks: nextTasks };
    });

    set({ days: updated });

    const day = updated.find((d) => d?.dayNumber === selectedDay);
    if (day) get().saveDay(day);
  },

  /* ---------- MINUTES ---------- */

  addMinutes: (minutes) => {
    const { selectedDay, days } = get();
    if (!selectedDay) return;

    const current = days.find((d) => d?.dayNumber === selectedDay);
    if (!current) return;

    // ✅ запрет на прошлые дни
    if (dayjs(current.date).isBefore(dayjs(), "day")) return;

    const updated = days.map((d) =>
      d && d.dayNumber === selectedDay ? { ...d, minutes: d.minutes + minutes } : d
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
            tasks: day.tasks, // ✅ теперь сохраняем Task[]
          },
        },
      },
      { merge: true }
    );
  },

  loadMonth: async () => {
    set({ isMonthLoaded: false });

    try {
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

        // ✅ миграция: если tasks были string[] — превращаем в Task[]
        const savedTasks = saved.tasks ?? [];
        const normalizedTasks: Task[] =
          Array.isArray(savedTasks) && typeof savedTasks[0] === "string"
            ? savedTasks.map((text: string) => ({ text, done: false }))
            : (savedTasks as any[]).map((t) => ({
                text: String(t?.text ?? ""),
                done: Boolean(t?.done),
              }));

        updatedDays[index] = {
          ...day,
          minutes: saved.minutes ?? 0,
          tasks: normalizedTasks,
        };
      });

      set({ days: updatedDays });
    } finally {
      set({ isMonthLoaded: true });
    }
  },

  /* ---------- STATS ---------- */

  getTotalMinutes: () => get().days.reduce((sum, day) => sum + (day?.minutes ?? 0), 0),

  getTodayMinutes: () => {
    const today = dayjs().format("YYYY-MM-DD");
    const day = get().days.find((d) => d?.date === today);
    return day?.minutes ?? 0;
  },

  getDoneTasksByDate: (date) => {
  const day = get().days.find((d) => d?.date === date);
  return day?.tasks.reduce((sum, t) => sum + (t.done ? 1 : 0), 0) ?? 0;
},

getTodayDoneTasks: () => {
  const today = dayjs().format("YYYY-MM-DD");
  return get().getDoneTasksByDate(today);
},

getTotalDoneTasks: () =>
  get().days.reduce((sum, day) => {
    if (!day) return sum;
    const doneCount = day.tasks.reduce((s, t) => s + (t.done ? 1 : 0), 0);
    return sum + doneCount;
  }, 0),

}));
