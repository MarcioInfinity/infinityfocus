import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toISOStringWithoutTimeZone(date: Date | null | undefined): string | null {
  if (!date) return null;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime(timeString: string | null | undefined): string | null {
  if (!timeString) return null;
  // Ensure the time string is in HH:MM format
  const [hours, minutes] = timeString.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
}

export function convertCategoryToEnglish(category: string): string {
  const categoryMap: { [key: string]: string } = {
    'Profissional': 'professional',
    'Intelectual': 'intellectual',
    'Finanças': 'finance',
    'Social': 'social',
    'Relacionamento': 'relationship',
    'Família': 'family',
    'Lazer': 'leisure',
    'Saúde': 'health',
    'Espiritual': 'spiritual',
    'Emocional': 'emotional',
    'Outros': 'other',
  };
  return categoryMap[category] || 'other';
}

export function convertCategoryToPortuguese(category: string): string {
  const categoryMap: { [key: string]: string } = {
    'professional': 'Profissional',
    'intellectual': 'Intelectual',
    'finance': 'Finanças',
    'social': 'Social',
    'relationship': 'Relacionamento',
    'family': 'Família',
    'leisure': 'Lazer',
    'health': 'Saúde',
    'spiritual': 'Espiritual',
    'emotional': 'Emocional',
    'other': 'Outros',
  };
  return categoryMap[category] || 'Outros';
}


