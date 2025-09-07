
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDateWithTimezone = (date: string | Date, timezone: string, dateFormat: string = 'DD/MM/YYYY') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  // Convert format from user preference to date-fns format
  const formatMap: { [key: string]: string } = {
    'DD/MM/YYYY': 'dd/MM/yyyy',
    'MM/DD/YYYY': 'MM/dd/yyyy',
    'YYYY-MM-DD': 'yyyy-MM-dd'
  };

  return format(dateObj, formatMap[dateFormat] || 'dd/MM/yyyy', { locale: ptBR });
};

export const formatTimeWithTimezone = (date: string | Date, timeFormat: string = '24h') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  const formatStr = timeFormat === '24h' ? 'HH:mm' : 'h:mm a';
  return format(dateObj, formatStr, { locale: ptBR });
};

export const getCurrentDateAndDay = (timezone: string = 'America/Sao_Paulo') => {
  const now = new Date();
  const today = format(now, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const time = format(now, 'HH:mm', { locale: ptBR });
  
  return `${today} às ${time}`;
};

export const getTimezoneOptions = () => [
  { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
  { value: 'America/New_York', label: 'Nova York (UTC-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8)' },
  { value: 'Europe/London', label: 'Londres (UTC+0)' },
  { value: 'Europe/Paris', label: 'Paris (UTC+1)' },
  { value: 'Asia/Tokyo', label: 'Tóquio (UTC+9)' },
  { value: 'Australia/Sydney', label: 'Sydney (UTC+10)' },
];
