import { useState, useCallback } from 'react';
import { AppSettings } from '@/types';
import { defaultSettings } from '@/data/mockData';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const exportSettings = useCallback(() => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codexbar-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [settings]);

  const importSettings = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as AppSettings;
        setSettings(prev => ({ ...prev, ...imported }));
      } catch {
        console.error('Invalid settings file');
      }
    };
    reader.readAsText(file);
  }, []);

  return { settings, updateSettings, resetSettings, exportSettings, importSettings };
}
