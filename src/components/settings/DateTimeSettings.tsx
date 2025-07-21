
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Globe } from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';

const timezones = [
  { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
  { value: 'America/New_York', label: 'Nova York (GMT-5)' },
  { value: 'Europe/London', label: 'Londres (GMT+0)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
  { value: 'Asia/Tokyo', label: 'Tóquio (GMT+9)' },
  { value: 'UTC', label: 'UTC (GMT+0)' },
];

const dateFormats = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

const timeFormats = [
  { value: '24h', label: '24 horas (23:59)' },
  { value: '12h', label: '12 horas (11:59 PM)' },
];

export function DateTimeSettings() {
  const { settings, saveSettings, isSaving } = useUserSettings();
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState('24h');

  useEffect(() => {
    if (settings) {
      setTimezone(settings.timezone || 'America/Sao_Paulo');
      setDateFormat(settings.date_format || 'DD/MM/YYYY');
      setTimeFormat(settings.time_format || '24h');
    }
  }, [settings]);

  const handleSave = () => {
    saveSettings({
      timezone,
      date_format: dateFormat,
      time_format: timeFormat,
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Configurações de Data e Horário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="timezone" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Fuso Horário
          </Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="glass-card border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/20">
              {timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-format" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Formato de Data
          </Label>
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger className="glass-card border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/20">
              {dateFormats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time-format" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Formato de Horário
          </Label>
          <Select value={timeFormat} onValueChange={setTimeFormat}>
            <SelectTrigger className="glass-card border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/20">
              {timeFormats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full glow-button"
        >
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </CardContent>
    </Card>
  );
}
