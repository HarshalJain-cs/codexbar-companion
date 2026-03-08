import { useState, useCallback, useEffect, useRef } from 'react';
import { Provider, ProviderId } from '@/types';
import { mockProviders } from '@/data/mockData';

export interface RefreshLog {
  provider: string;
  timestamp: number;
  success: boolean;
  duration: number;
}

export function useProviders(refreshInterval: number = 30) {
  const [providers, setProviders] = useState<Provider[]>(mockProviders);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const [refreshLogs, setRefreshLogs] = useState<RefreshLog[]>([]);
  const [countdown, setCountdown] = useState(refreshInterval);
  const refreshIntervalRef = useRef(refreshInterval);

  // Keep ref in sync
  useEffect(() => {
    refreshIntervalRef.current = refreshInterval;
    setCountdown(refreshInterval);
  }, [refreshInterval]);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const addLog = useCallback((provider: string, success: boolean, duration: number) => {
    setRefreshLogs(prev => [...prev.slice(-49), { provider, timestamp: Date.now(), success, duration }]);
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    const start = Date.now();
    await new Promise(r => setTimeout(r, 800));
    setProviders(prev =>
      prev.map(p => ({
        ...p,
        usage: {
          ...p.usage,
          sessionPercent: Math.min(100, Math.max(0, p.usage.sessionPercent + Math.floor(Math.random() * 7 - 2))),
          weeklyPercent: Math.min(100, Math.max(0, p.usage.weeklyPercent + Math.floor(Math.random() * 4))),
        },
      }))
    );
    const duration = Date.now() - start;
    addLog('all', true, duration);
    setLastRefresh(Date.now());
    setCountdown(refreshIntervalRef.current);
    setIsRefreshing(false);
  }, [addLog]);

  const refreshProvider = useCallback(async (id: string) => {
    const start = Date.now();
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 500));
    setProviders(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              usage: {
                ...p.usage,
                sessionPercent: Math.min(100, Math.max(0, p.usage.sessionPercent + Math.floor(Math.random() * 5 - 1))),
              },
            }
          : p
      )
    );
    const duration = Date.now() - start;
    addLog(id, true, duration);
    setLastRefresh(Date.now());
    setIsRefreshing(false);
  }, [addLog]);

  const disableProvider = useCallback((id: ProviderId) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, enabled: false } : p));
  }, []);

  // Auto-refresh
  useEffect(() => {
    const id = setInterval(() => {
      refresh();
    }, refreshInterval * 1000);
    return () => clearInterval(id);
  }, [refreshInterval, refresh]);

  // Countdown timer
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? refreshIntervalRef.current : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return {
    providers,
    isRefreshing,
    isLoading,
    lastRefresh,
    countdown,
    refreshLogs,
    refresh,
    refreshProvider,
    disableProvider,
    setProviders,
  };
}
