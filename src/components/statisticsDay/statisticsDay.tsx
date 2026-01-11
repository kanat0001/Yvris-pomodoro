import { useCalendarStore } from "../../store/useCalendarStore";

export default function StatisticsDay() {
  const days = useCalendarStore(s => s.days);
  const selectedDay = useCalendarStore(s => s.selectedDay);
  const newTask = useCalendarStore(s => s.newTask);
  const setNewTask = useCalendarStore(s => s.setNewTask);
  const addTask = useCalendarStore(s => s.addTask);

  if (!selectedDay) return <div>День не выбран</div>;

  const day = days.find(d => d?.dayNumber === selectedDay);
  if (!day) return <div>Нет данных</div>;

  return (
    <div>
      <h2>Задачи за {selectedDay} число</h2>

      <input
        value={newTask}
        onChange={e => setNewTask(e.target.value)}
        placeholder="Новая задача"
      />
      <button onClick={()=>addTask(newTask)}>Добавить</button>

      {day.tasks.length === 0
        ? <p>Нет задач</p>
        : day.tasks.map((t, i) => <div key={i}>{t}</div>)
      }
    </div>
  );
}
