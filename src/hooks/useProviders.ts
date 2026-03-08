import { useState, useCallback, useEffect } from 'react';
import { Provider } from '@/types';
import { mockProviders } from '@/data/mockData';

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>(mockProviders);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    setProviders(prev =>
      prev.map(p => ({
        ...p,
        usage: {
          ...p.usage,
          sessionPercent: Math.min(100, p.usage.sessionPercent + Math.floor(Math.random() * 5 - 1)),
          weeklyPercent: Math.min(100, p.usage.weeklyPercent + Math.floor(Math.random() * 3)),
        },
      }))
    );
    setLastRefresh(Date.now());
    setIsRefreshing(false);
  }, []);

  const refreshProvider = useCallback(async (id: string) => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 500));
    setProviders(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              usage: {
                ...p.usage,
                sessionPercent: Math.min(100, p.usage.sessionPercent + Math.floor(Math.random() * 3)),
              },
            }
          : p
      )
    );
    setLastRefresh(Date.now());
    setIsRefreshing(false);
  }, []);

  return { providers, isRefreshing, lastRefresh, refresh, refreshProvider };
}
