import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

interface TimePickerProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  leftIcon?: React.ReactNode;
  className?: string;
  required?: boolean;
  name?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  value = '',
  onChange,
  leftIcon,
  className,
  required,
  name
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState('08');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('AM');

  // Convert 24-hour format to 12-hour format for display
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      const hour24 = parseInt(h);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const period = hour24 >= 12 ? 'PM' : 'AM';
      
      setHour(hour12.toString().padStart(2, '0'));
      setMinute(m || '00');
      setPeriod(period);
    }
  }, [value]);

  // Convert 12-hour format to 24-hour format for form submission
  const updateValue = (newHour: string, newMinute: string, newPeriod: string) => {
    let hour24 = parseInt(newHour);
    if (newPeriod === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (newPeriod === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${newMinute}`;
    onChange?.(timeString);
  };

  const handleHourChange = (newHour: string) => {
    setHour(newHour);
    updateValue(newHour, minute, period);
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    updateValue(hour, newMinute, period);
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    updateValue(hour, minute, newPeriod);
  };

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => {
    const h = (i + 1).toString().padStart(2, '0');
    return h;
  });

  // Generate minute options (00, 05, 10, ..., 55)
  const minuteOptions = Array.from({ length: 12 }, (_, i) => {
    const m = (i * 5).toString().padStart(2, '0');
    return m;
  });

  const displayValue = value ? `${hour}:${minute} ${period}` : '';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-primary-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary-400 z-10">
            {leftIcon}
          </div>
        )}
        
        {/* Hidden input for form submission */}
        <input 
          type="hidden" 
          name={name} 
          value={value} 
          required={required}
        />
        
        {/* Display button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full px-3 py-2.5 bg-white border border-primary-200 rounded-lg text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-300 transition-all duration-200 flex items-center justify-between',
            leftIcon ? 'pl-10' : '',
            className
          )}
        >
          <span className={displayValue ? 'text-primary-900' : 'text-primary-400'}>
            {displayValue || '--:-- --'}
          </span>
          <ChevronDown className={cn('w-5 h-5 text-primary-400 transition-transform duration-200', isOpen && 'rotate-180')} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-primary-200 rounded-lg shadow-lg z-50">
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Hour Selection */}
                <div>
                  <label className="block text-xs font-medium text-primary-600 mb-2">Hour</label>
                  <div className="max-h-32 overflow-y-auto border border-primary-100 rounded">
                    {hourOptions.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleHourChange(h)}
                        className={cn(
                          'w-full px-3 py-2 text-sm hover:bg-primary-50 transition-colors',
                          hour === h && 'bg-primary-100 text-primary-900 font-medium'
                        )}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Minute Selection */}
                <div>
                  <label className="block text-xs font-medium text-primary-600 mb-2">Minute</label>
                  <div className="max-h-32 overflow-y-auto border border-primary-100 rounded">
                    {minuteOptions.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleMinuteChange(m)}
                        className={cn(
                          'w-full px-3 py-2 text-sm hover:bg-primary-50 transition-colors',
                          minute === m && 'bg-primary-100 text-primary-900 font-medium'
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AM/PM Selection */}
                <div>
                  <label className="block text-xs font-medium text-primary-600 mb-2">Period</label>
                  <div className="space-y-1">
                    {['AM', 'PM'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePeriodChange(p)}
                        className={cn(
                          'w-full px-3 py-2 text-sm rounded border border-primary-100 hover:bg-primary-50 transition-colors',
                          period === p && 'bg-primary-600 text-white border-primary-600'
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};