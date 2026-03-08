import { useState, useRef, useEffect } from 'react';
import { useProviders } from '@/hooks/useProviders';
import { useSettings } from '@/hooks/useSettings';
import AppHeader from '@/components/AppHeader';
import ProviderCard from '@/components/ProviderCard';
import StatusPanel from '@/components/StatusPanel';
import SettingsPage from '@/components/SettingsPage';
import NotificationBanner, { useNotifications } from '@/components/NotificationBanner';

type View = 'dashboard' | 'settings';

export default function MainWindow() {
  const { providers, isRefreshing, lastRefresh, refresh, refreshProvider } = useProviders();
  const { settings, updateSettings } = useSettings();
  const [view, setView] = useState<View>('dashboard');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [settings.theme]);

  // Scroll to top on view switch
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const enabledProviders = providers.filter(p =>
    settings.enabledProviders.includes(p.id)
  );

  const { notifications, dismiss } = useNotifications(
    enabledProviders,
    settings.warningThreshold,
    settings.criticalThreshold
  );

  const showNotifications =
    settings.notificationType === 'in-app' || settings.notificationType === 'both';

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
        />
      ) : (
        <>
          <AppHeader
            isRefreshing={isRefreshing}
            lastRefresh={lastRefresh}
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

          {/* Provider cards */}
          <div ref={scrollRef} className="flex-1 cb-scroll-area p-3">
            <div
              className={`grid gap-2.5 ${
                settings.animationsEnabled ? 'cb-stagger-fade' : ''
              } grid-cols-1 min-[300px]:grid-cols-2 min-[800px]:grid-cols-3`}
            >
              {enabledProviders.map(provider => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onRefresh={refreshProvider}
                  animationsEnabled={settings.animationsEnabled}
                  warningThreshold={settings.warningThreshold}
                  criticalThreshold={settings.criticalThreshold}
                />
              ))}
            </div>
          </div>

          {/* Status panel */}
          <StatusPanel providers={enabledProviders} />
        </>
      )}
    </div>
  );
}
