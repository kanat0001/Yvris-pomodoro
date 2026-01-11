import { useState } from 'react';
import './settings.css'
interface SettingProps {
    className?: string;
    duration: number;
    setDuration: React.Dispatch<React.SetStateAction<number>>; 
    workDuration: number;
    breakDuration: number;
    setWorkDuration: React.Dispatch<React.SetStateAction<number>>;
    setBreakDuration:  React.Dispatch<React.SetStateAction<number>>;
}

export default function Setting ({className, duration, setDuration, workDuration, breakDuration, setWorkDuration, setBreakDuration} : SettingProps) {
    const [isOpen, setIsOpen] = useState(false)
    const switchBtn = () => {
        setIsOpen((prev) => !prev)
    }

    return ( 
        <div className='setting'>
            <div className="settings-btn">
                <button onClick={switchBtn}>кнопка</button>
            </div>

            {isOpen && (
                <div className='setting-window'>
                    <button className='setting-window-btn' onClick={()=>setIsOpen(false) }>×</button>

                    <p>время:</p> 
                    
                    <input type="number" 
                    value={workDuration} 
                    onChange={(e) => {const newValue = Number(e.target.value)
                        setWorkDuration(newValue)
                        setDuration(newValue)
                    }}
                    />

                    <input type="number" 
                    value={breakDuration}
                    onChange={(e) => {const newValue = Number(e.target.value)
                        setBreakDuration(newValue)
                        setDuration(newValue)
                    }}/>


                </div>
            )}
            
            

        </div>
    )
}