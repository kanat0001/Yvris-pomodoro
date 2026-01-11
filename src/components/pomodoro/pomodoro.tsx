import { useEffect, useState, useRef } from 'react';
import './pomodoro.css';

interface PomodoroProps {
  className?: string;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  workDuration: number;
  breakDuration: number;
  addMinutes: (minutes: number) => void; // теперь из store
}

export default function Pomodoro({
  className,
  duration,
  setDuration,
  workDuration,
  breakDuration,
  addMinutes
}: PomodoroProps) {

  const [paused, setPaused] = useState(true);
  const [timer, setTimer] = useState(duration * 60);
  const [isWork, setIsWork] = useState(true);
  const hasCounted = useRef(false);
  const startRef = useRef(Date.now());

  const resetTimer = () => {
    startRef.current = Date.now();
    setTimer(duration * 60);
    setPaused(true);
    hasCounted.current = false;
  };

  const switchPause = () => {
    if (paused) startRef.current = Date.now();
    setPaused(prev => !prev);
  };

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const remaining = duration * 60 * 1000 - elapsed;

      if (remaining <= 0 && !hasCounted.current) {
        if (isWork) {
          addMinutes(duration);
          console.log(`✅ Добавлено ${duration} минут`);
        }

        hasCounted.current = true;

        setTimeout(() => {
          setIsWork(prev => {
            const newMode = !prev;
            const newDuration = newMode ? workDuration : breakDuration;
            setDuration(newDuration);
            startRef.current = Date.now();
            setTimer(newDuration * 60);
            setPaused(true);
            hasCounted.current = false;
            return newMode;
          });
        }, 1000);
      }

      setTimer(Math.max(Math.ceil(remaining / 1000), 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [paused, isWork, duration, workDuration, breakDuration, addMinutes, setDuration]);

  useEffect(() => {
    startRef.current = Date.now();
    setTimer(duration * 60);
    setPaused(true);
    hasCounted.current = false;
  }, [duration]);

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className={className}>
      <div className='pomodoro-wrapper'>
        <div className='pomodoro-timer'>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>

        <div className='pomodoro-buttons'>
          <button onClick={switchPause} className='pomodoro-button'>
            {paused ? 'Start' : 'Pause'}
          </button>
          <button onClick={resetTimer} className='pomodoro-button'>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
