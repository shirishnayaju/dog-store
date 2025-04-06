import React, { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function Calendar({ className, selected, onSelect, ...props }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(selected || today);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (newDate >= today) {
      onSelect(newDate);
    }
  };

  const handlePrevMonth = () => {
    const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    if (prevMonthDate >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentDate(prevMonthDate);
    }
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isPastDate = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date < today;
  };

  return (
    <div className={`p-4 bg-white border rounded-lg shadow ${className}`} {...props}>
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth}>&lt;</button>
        <h2 className="text-lg font-semibold">
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button onClick={handleNextMonth}>&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map(day => (
          <div key={day} className="text-center font-semibold">{day}</div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const isSelected = selected && 
            day === selected.getDate() && 
            currentDate.getMonth() === selected.getMonth() && 
            currentDate.getFullYear() === selected.getFullYear();
          const isDisabled = isPastDate(day);
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={isDisabled}
              className={`p-2 text-center rounded-full hover:bg-blue-100 ${
                isSelected ? 'bg-blue-500 text-white' : ''
              } ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}