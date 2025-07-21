
import { useState, useEffect } from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Calendar, Clock } from 'lucide-react';

export function DateTimeDisplay() {
  const { settings } = useUserSettings();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timezone = settings?.timezone || 'America/Sao_Paulo';
  const dateFormat = settings?.date_format || 'DD/MM/YYYY';
  const timeFormat = settings?.time_format || '24h';

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    const formatted = date.toLocaleDateString('pt-BR', options);
    
    if (dateFormat === 'MM/DD/YYYY') {
      const [day, month, year] = formatted.split('/');
      return `${month}/${day}/${year}`;
    } else if (dateFormat === 'YYYY-MM-DD') {
      const [day, month, year] = formatted.split('/');
      return `${year}-${month}-${day}`;
    }
    
    return formatted; // DD/MM/YYYY
  };

  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    };

    return date.toLocaleTimeString('pt-BR', options);
  };

  const formatDayOfWeek = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      weekday: 'long',
    };

    return date.toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        <span className="capitalize">
          {formatDayOfWeek(currentDateTime)}, {formatDate(currentDateTime)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span>{formatTime(currentDateTime)}</span>
      </div>
    </div>
  );
}
