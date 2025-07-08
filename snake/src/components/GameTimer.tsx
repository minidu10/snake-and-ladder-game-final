import { useState, useEffect } from "react";

interface GameTimerProps {
  startTime: number;
}

export default function GameTimer({ startTime }: GameTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
      <span className="text-sm text-gray-600">⏱️</span>
      <span className="font-mono font-medium text-gray-800">
        {formatTime(elapsed)}
      </span>
    </div>
  );
}
