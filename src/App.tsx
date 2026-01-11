import { useEffect, useState } from "react";
import "./App.css";
import Pomodoro from './components/pomodoro/pomodoro';
import Setting from './components/settings/settings';
import Calendar from "./components/Calendar/Calendar";
import StatisticsDay from "./components/statisticsDay/statisticsDay";
import { db } from "./firebase";
import { doc, setDoc, updateDoc, increment, getDoc } from "firebase/firestore";
import { useCalendarStore } from "./store/useCalendarStore";

function App() {

  const userDocRef = doc(db, 'users', 'testUser'); // документ для хранения минут



  const [duration, setDuration] = useState(25);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [workDuration, setWorkDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)

  const getTotalMinutses = useCalendarStore(s => s.getTotalMinutes())
  const getTodayMinutes = useCalendarStore(s => s.getTodayMinutes())


  // Загружаем totalMinutes при монтировании
  useEffect(() => {
    async function fetchTotalMinutes() {
      console.log("Проверка документа → ", userDocRef.path);
      const docSnap = await getDoc(userDocRef);
      console.log("exists:", docSnap.exists(), "data:", docSnap.data());
      if (docSnap.exists()) {
        setTotalMinutes(docSnap.data().totalMinutes || 0);
      } else {
        setTotalMinutes(0);
        await setDoc(userDocRef, { totalMinutes: 0 });
      }
      

    }
    fetchTotalMinutes();
  }, []);

  // Функция для добавления минут
  const addMinutes = useCalendarStore(s => s.addMinutes)

  return (
    <div className="app">
      <div className="parent">
        <Setting className="setting"
        duration={duration} 
        setDuration={setDuration} 
        workDuration={workDuration}
        breakDuration={breakDuration}
        setWorkDuration={setWorkDuration}
        setBreakDuration={setBreakDuration} />
        <div className="statistics">
          <h1>всего минут: {getTotalMinutses}</h1>
          <h1>минут в день: {getTodayMinutes}</h1>
        </div>
        <div className="pomodoro">
          <Pomodoro
            duration={duration}
            setDuration={setDuration}
            workDuration={workDuration}
            breakDuration={breakDuration}
            addMinutes={addMinutes} // вот новая функция
          />
          <Calendar/>
        </div>
          <StatisticsDay

        />
      </div>
    </div>
  );
}

export default App;
