import { useEffect } from 'react';
import { hexToHsl } from '../utils/color';

const ThemeSync: React.FC = () => {
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const { action, color } = event.data || {};

      if (action === 'updateAccentColor' && color) {
        const hsl = hexToHsl(color);
        if (hsl) {
          const root = document.documentElement;
          const tokenValue = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
          const fgValue = hsl.l > 60 ? '240 10% 3.9%' : '210 40% 98%';
          
          root.style.setProperty('--primary', tokenValue);
          root.style.setProperty('--primary-foreground', fgValue);
          root.style.setProperty('--ring', tokenValue);
        }
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return null;
};

export default ThemeSync;
