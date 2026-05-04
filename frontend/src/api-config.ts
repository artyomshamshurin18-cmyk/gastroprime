export const API_URL = import.meta.env.VITE_API_URL || 'https://api.gastroprime.ru/api';
export const MEDIA_URL = (value?: string) => value && value.startsWith('http') ? value : `${API_URL.replace(/\/api$/, '')}${value || ''}`;

