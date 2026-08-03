import React, { useState, useRef, useEffect } from 'react';

interface ScrollTimePickerProps {
  value: string; // HH:mm format
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function ScrollTimePicker({ value, onChange, disabled }: ScrollTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const [hourStr, minStr] = (value || '00:00').split(':');
  const [tempHour, setTempHour] = useState(hourStr);
  const [tempMin, setTempMin] = useState(minStr);

  const containerRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minsRef = useRef<HTMLDivElement>(null);

  const baseHours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const baseMinutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const MULTIPLIER = 40; // Creates enough items to feel infinite
  const hours = Array(MULTIPLIER).fill(baseHours).flat();
  const minutes = Array(MULTIPLIER).fill(baseMinutes).flat();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When dropdown opens, scroll to the selected time
  useEffect(() => {
    if (isOpen) {
      setTempHour(hourStr);
      setTempMin(minStr);
      
      const middleHourIndex = (MULTIPLIER / 2) * 24 + parseInt(hourStr);
      const middleMinIndex = (MULTIPLIER / 2) * 60 + parseInt(minStr);

      const ITEM_HEIGHT = 40; // 40px height per item
      if (hoursRef.current) {
        hoursRef.current.scrollTop = middleHourIndex * ITEM_HEIGHT;
      }
      if (minsRef.current) {
        minsRef.current.scrollTop = middleMinIndex * ITEM_HEIGHT;
      }
    }
  }, [isOpen, hourStr, minStr]);

  const handleScroll = (type: 'hour' | 'min', e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const ITEM_HEIGHT = 40;
    // Calculate index based on scroll position
    const index = Math.round(el.scrollTop / ITEM_HEIGHT);
    
    if (type === 'hour') {
      const newHour = hours[Math.min(Math.max(index, 0), hours.length - 1)];
      setTempHour(newHour);
    } else {
      const newMin = minutes[Math.min(Math.max(index, 0), minutes.length - 1)];
      setTempMin(newMin);
    }
  };

  const applyChanges = () => {
    onChange(`${tempHour}:${tempMin}`);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-left flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || '00:00'}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-4 w-64">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-medium text-sm">Select Time</span>
            <button 
              type="button" 
              onClick={applyChanges}
              className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
            >
              Done
            </button>
          </div>
          
          <div className="flex justify-center items-center h-[200px] relative">
            {/* Center highlight band */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[40px] bg-slate-800 rounded-lg pointer-events-none border border-slate-700"></div>
            
            {/* Hours scroller */}
            <div 
              ref={hoursRef}
              className="w-20 h-full overflow-y-auto snap-y snap-mandatory relative z-10"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: '80px', paddingTop: '80px' }}
              onScroll={(e) => handleScroll('hour', e)}
            >
              <style dangerouslySetInnerHTML={{__html: `
                .w-20::-webkit-scrollbar { display: none; }
              `}} />
              {hours.map((h, i) => (
                <div 
                  key={`h-${i}`} 
                  className={`h-[40px] flex items-center justify-center text-xl snap-center transition-colors duration-150 ${h === tempHour ? 'text-white font-bold' : 'text-slate-500'}`}
                >
                  {h}
                </div>
              ))}
            </div>

            <div className="text-white text-xl font-bold mx-2 z-10 relative pb-1">:</div>

            {/* Minutes scroller */}
            <div 
              ref={minsRef}
              className="w-20 h-full overflow-y-auto snap-y snap-mandatory relative z-10"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: '80px', paddingTop: '80px' }}
              onScroll={(e) => handleScroll('min', e)}
            >
              <style dangerouslySetInnerHTML={{__html: `
                .w-20::-webkit-scrollbar { display: none; }
              `}} />
              {minutes.map((m, i) => (
                <div 
                  key={`m-${i}`} 
                  className={`h-[40px] flex items-center justify-center text-xl snap-center transition-colors duration-150 ${m === tempMin ? 'text-white font-bold' : 'text-slate-500'}`}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
