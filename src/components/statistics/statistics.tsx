import { useCalendarStore } from "../../store/useCalendarStore";
export default function Statistics() {
      const getTotalMinutses = useCalendarStore(s => s.getTotalMinutes())
      const getTodayMinutes = useCalendarStore(s => s.getTodayMinutes())
    
      const getTotalDoneTasks = useCalendarStore(s => s.getTotalDoneTasks)
      const getTodayDoneTasks = useCalendarStore(s => s.getTodayDoneTasks)
    return(
        <div>
          <h1>всего минут: {getTotalMinutses}</h1>
          <h1>минут в день: {getTodayMinutes}</h1>
          <h1>выполнено задач за месяц: {getTotalDoneTasks()}</h1>
          <h1>выполнено задач сегодня: {getTodayDoneTasks()}</h1>
        </div>
    )
}