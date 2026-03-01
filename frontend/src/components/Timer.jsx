import React, { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

const Timer = ({ durationMinutes, onTimeUp, startTime }) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    // Calculate elapsed time since start
    const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
    const remaining = Math.max(0, durationMinutes * 60 - elapsed);
    setTimeLeft(remaining);

    if (remaining === 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = Math.max(0, prevTime - 1);
        
        // Warning when less than 5 minutes
        if (newTime <= 300 && !isWarning) {
          setIsWarning(true);
        }

        if (newTime === 0) {
          clearInterval(timer);
          onTimeUp();
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [durationMinutes, startTime, onTimeUp, isWarning]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  const percentage = (timeLeft / (durationMinutes * 60)) * 100;

  return (
    <div className={`fixed top-4 right-4 z-50 ${isWarning ? 'animate-pulse' : ''}`}>
      <div className={`bg-white rounded-lg shadow-lg p-4 border-2 ${
        isWarning ? 'border-red-500' : 'border-blue-500'
      }`}>
        <div className="flex items-center space-x-3">
          <FiClock className={`text-2xl ${isWarning ? 'text-red-500' : 'text-blue-500'}`} />
          <div>
            <div className={`text-2xl font-bold ${isWarning ? 'text-red-600' : 'text-gray-800'}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs text-gray-500">Time Remaining</div>
          </div>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isWarning ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Timer;
