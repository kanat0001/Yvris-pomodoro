// ✅ StatisticsDay.tsx (полный файл)

import { useState } from "react";
import { useCalendarStore } from "../../store/useCalendarStore";

export default function StatisticsDay() {
  const days = useCalendarStore((s) => s.days);
  const selectedDay = useCalendarStore((s) => s.selectedDay);

  const newTask = useCalendarStore((s) => s.newTask);
  const setNewTask = useCalendarStore((s) => s.setNewTask);
  const addTask = useCalendarStore((s) => s.addTask);

  const toggleTaskDone = useCalendarStore((s) => s.toggleTaskDone);
  const deleteTask = useCalendarStore((s) => s.deleteTask);
  const renameTask = useCalendarStore((s) => s.renameTask);

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  if (!selectedDay) return <div>День не выбран</div>;

  const day = days.find((d) => d?.dayNumber === selectedDay);
  if (!day) return <div>Нет данных</div>;

  const startEdit = (index: number) => {
    setEditIndex(index);
    setEditValue(day.tasks[index]?.text ?? "");
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditValue("");
  };

  const saveEdit = () => {
    if (editIndex === null) return;
    renameTask(editIndex, editValue);
    cancelEdit();
  };

  return (
    <div>
      <h2>Задачи за {selectedDay} число</h2>

      <input
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Новая задача"
      />
      <button onClick={() => addTask(newTask)}>Добавить</button>

      {day.tasks.length === 0 ? (
        <p>Нет задач</p>
      ) : (
        day.tasks.map((task, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            {/* ✅ галочка "выполнено" */}
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleTaskDone(i)}
            />

            {editIndex === i ? (
              <>
                <input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                <button onClick={saveEdit}>Сохранить</button>
                <button onClick={cancelEdit}>Отмена</button>
              </>
            ) : (
              <>
                <div
                  style={{
                    flex: 1,
                    textDecoration: task.done ? "line-through" : "none",
                    opacity: task.done ? 0.7 : 1,
                  }}
                >
                  {task.text}
                </div>
                <button onClick={() => startEdit(i)}>Изменить</button>
                <button onClick={() => deleteTask(i)}>Удалить</button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
