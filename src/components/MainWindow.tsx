import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useProviders } from '@/hooks/useProviders';
import { useSettings } from '@/hooks/useSettings';
import { ProviderId } from '@/types';
import AppHeader from '@/components/AppHeader';
import ProviderCard from '@/components/ProviderCard';
import CompactProviderRow from '@/components/CompactProviderRow';
import SkeletonCard from '@/components/SkeletonCard';
import StatusPanel from '@/components/StatusPanel';
import SettingsPage from '@/components/SettingsPage';
import NotificationBanner, { useNotifications } from '@/components/NotificationBanner';
import DiagnosticsPanel from '@/components/DiagnosticsPanel';

type View = 'dashboard' | 'settings';

export default function MainWindow() {
  const { settings, updateSettings, exportSettings, importSettings } = useSettings();
  const {
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
  } = useProviders(settings.refreshInterval);

  const [view, setView] = useState<View>('dashboard');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [draggedId, setDraggedId] = useState<ProviderId | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [settings.theme]);

  // Scroll to top on view switch
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && view === 'settings') {
        setView('dashboard');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [view]);

  // Reduced motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches && settings.animationsEnabled) {
      updateSettings({ animationsEnabled: false });
    }
  }, []);

  const enabledProviders = providers.filter(p =>
    settings.enabledProviders.includes(p.id)
  );

  // Sort by providerOrder
  const sortedProviders = [...enabledProviders].sort((a, b) => {
    const ai = settings.providerOrder.indexOf(a.id);
    const bi = settings.providerOrder.indexOf(b.id);
    return ai - bi;
  });

  const { notifications, dismiss } = useNotifications(
    enabledProviders,
    settings.warningThreshold,
    settings.criticalThreshold
  );

  const showNotifications =
    settings.notificationType === 'in-app' || settings.notificationType === 'both';

  // Drag reorder
  const handleDragStart = (e: React.DragEvent, id: ProviderId) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: ProviderId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    const order = [...settings.providerOrder];
    const fromIdx = order.indexOf(draggedId);
    const toIdx = order.indexOf(targetId);
    order.splice(fromIdx, 1);
    order.splice(toIdx, 0, draggedId);
    updateSettings({ providerOrder: order });
    setDraggedId(null);
  };

  const handleDisable = (id: ProviderId) => {
    updateSettings({
      enabledProviders: settings.enabledProviders.filter(p => p !== id),
    });
  };

  return (
    <div
      className={`flex flex-col h-screen w-full bg-background ${
        !settings.animationsEnabled ? 'cb-no-animations' : ''
      }`}
    >
      {view === 'settings' ? (
        <SettingsPage
          settings={settings}
          onUpdateSettings={updateSettings}
          onBack={() => setView('dashboard')}
          onOpenDiagnostics={() => setShowDiagnostics(true)}
          onExportSettings={exportSettings}
          onImportSettings={importSettings}
          debugMode={debugMode}
          onToggleDebugMode={() => setDebugMode(!debugMode)}
        />
      ) : (
        <>
          <AppHeader
            isRefreshing={isRefreshing}
            lastRefresh={lastRefresh}
            countdown={countdown}
            onRefresh={refresh}
            onOpenSettings={() => setView('settings')}
          />

          {/* Notification banners */}
          {showNotifications &&
            notifications.slice(0, 2).map(n => (
              <NotificationBanner
                key={n.id}
                type={n.type}
                providerName={n.providerName}
                message={n.message}
                onDismiss={() => dismiss(n.id)}
              />
            ))}

          {/* Provider cards / compact rows */}
          <div ref={scrollRef} className="flex-1 cb-scroll-area p-3">
            {isLoading ? (
              settings.viewMode === 'compact' ? (
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  {[1, 2, 3, 4, 5].map(i => (
                    <SkeletonCard key={i} compact />
                  ))}
                </div>
              ) : (
                <div className="grid gap-2.5 grid-cols-1 min-[300px]:grid-cols-2 min-[800px]:grid-cols-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )
            ) : settings.viewMode === 'compact' ? (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="px-3 py-1.5 border-b border-border flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Provider</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold w-8 text-right">Sess</span>
                    <span className="text-[8px] text-muted-foreground">/</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold w-8 text-right">Week</span>
                  </div>
                </div>
                {sortedProviders.map(provider => (
                  <CompactProviderRow
                    key={provider.id}
                    provider={provider}
                    warningThreshold={settings.warningThreshold}
                    criticalThreshold={settings.criticalThreshold}
                  />
                ))}
              </div>
            ) : (
              <div
                className={`grid gap-2.5 ${
                  settings.animationsEnabled ? 'cb-stagger-fade' : ''
                } grid-cols-1 min-[300px]:grid-cols-2 min-[800px]:grid-cols-3`}
              >
                {sortedProviders.map(provider => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    onRefresh={refreshProvider}
                    onDisable={handleDisable}
                    animationsEnabled={settings.animationsEnabled}
                    warningThreshold={settings.warningThreshold}
                    criticalThreshold={settings.criticalThreshold}
                    draggable
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Status panel */}
          <StatusPanel providers={enabledProviders} />
        </>
      )}

      {/* Diagnostics overlay */}
      {showDiagnostics && (
        <DiagnosticsPanel
          onClose={() => setShowDiagnostics(false)}
          providers={providers}
          refreshLogs={refreshLogs}
          debugMode={debugMode}
        />
      )}
    </div>
  );
}
