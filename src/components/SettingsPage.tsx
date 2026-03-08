import { AppSettings, SettingsTab } from '@/types';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import NotificationPreview from './NotificationPreview';
import { toast } from 'sonner';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onBack: () => void;
}

export default function SettingsPage({ settings, onUpdateSettings, onBack }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'display', label: 'Display' },
    { id: 'providers', label: 'Providers' },
    { id: 'auth', label: 'Auth' },
    { id: 'about', label: 'About' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card">
        <button
          onClick={onBack}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-card-foreground">Settings</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-card px-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2.5 py-1.5 text-[11px] font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 cb-scroll-area p-3 space-y-4">
        {activeTab === 'general' && (
          <GeneralTab settings={settings} onUpdate={onUpdateSettings} />
        )}
        {activeTab === 'display' && (
          <DisplayTab settings={settings} onUpdate={onUpdateSettings} />
        )}
        {activeTab === 'providers' && (
          <ProvidersTab settings={settings} onUpdate={onUpdateSettings} />
        )}
        {activeTab === 'auth' && <AuthTab />}
        {activeTab === 'about' && <AboutTab />}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div>
        <div className="text-xs font-medium text-card-foreground">{label}</div>
        {description && <div className="text-[10px] text-muted-foreground">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-muted'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-primary-foreground shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs font-medium text-card-foreground">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-[11px] bg-secondary text-secondary-foreground border border-border rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-ring"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-card-foreground">{label}</span>
        <span className="text-[11px] text-muted-foreground font-mono">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
      />
    </div>
  );
}

function GeneralTab({
  settings,
  onUpdate,
}: {
  settings: AppSettings;
  onUpdate: (u: Partial<AppSettings>) => void;
}) {
  return (
    <>
      <SliderRow
        label="Refresh interval"
        value={settings.refreshInterval}
        min={10}
        max={120}
        unit="s"
        onChange={v => onUpdate({ refreshInterval: v })}
      />
      <ToggleRow
        label="Launch at startup"
        description="Adds CodexBar to Windows Startup apps"
        checked={settings.launchAtStartup}
        onChange={v => onUpdate({ launchAtStartup: v })}
      />
      <SelectRow
        label="Notifications"
        value={settings.notificationType}
        options={[
          { value: 'system', label: 'System toast' },
          { value: 'in-app', label: 'In-app banner' },
          { value: 'both', label: 'Both' },
        ]}
        onChange={v => onUpdate({ notificationType: v as AppSettings['notificationType'] })}
      />
      <SelectRow
        label="Sound"
        value={settings.notificationSound}
        options={[
          { value: 'default', label: 'Default' },
          { value: 'custom', label: 'Custom' },
          { value: 'none', label: 'None' },
        ]}
        onChange={v => onUpdate({ notificationSound: v as AppSettings['notificationSound'] })}
      />
      <ToggleRow
        label="Sound enabled"
        checked={settings.soundEnabled}
        onChange={v => onUpdate({ soundEnabled: v })}
      />
      <SliderRow
        label="Warning threshold"
        value={settings.warningThreshold}
        min={10}
        max={50}
        unit="%"
        onChange={v => onUpdate({ warningThreshold: v })}
      />
      <SliderRow
        label="Critical threshold"
        value={settings.criticalThreshold}
        min={5}
        max={25}
        unit="%"
        onChange={v => onUpdate({ criticalThreshold: v })}
      />
      <NotificationPreview
        settings={settings}
        onTestNotification={() => toast.info('Test notification from CodexBar')}
      />
    </>
  );
}

function DisplayTab({
  settings,
  onUpdate,
}: {
  settings: AppSettings;
  onUpdate: (u: Partial<AppSettings>) => void;
}) {
  return (
    <>
      <SelectRow
        label="Theme"
        value={settings.theme}
        options={[
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
          { value: 'system', label: 'System' },
        ]}
        onChange={v => onUpdate({ theme: v as AppSettings['theme'] })}
      />
      <ToggleRow
        label="Animations"
        checked={settings.animationsEnabled}
        onChange={v => onUpdate({ animationsEnabled: v })}
      />
      <SelectRow
        label="View mode"
        value={settings.viewMode}
        options={[
          { value: 'grid', label: 'Grid cards' },
          { value: 'compact', label: 'Compact list' },
        ]}
        onChange={v => onUpdate({ viewMode: v as AppSettings['viewMode'] })}
      />
    </>
  );
}

function ProvidersTab({
  settings,
  onUpdate,
}: {
  settings: AppSettings;
  onUpdate: (u: Partial<AppSettings>) => void;
}) {
  const allProviders = ['codex', 'claude', 'cursor', 'gemini', 'copilot'] as const;
  return (
    <>
      <div className="text-[10px] text-muted-foreground mb-2">Enable/disable providers</div>
      {allProviders.map(id => (
        <ToggleRow
          key={id}
          label={id.charAt(0).toUpperCase() + id.slice(1)}
          checked={settings.enabledProviders.includes(id)}
          onChange={enabled => {
            const updated = enabled
              ? [...settings.enabledProviders, id]
              : settings.enabledProviders.filter(p => p !== id);
            onUpdate({ enabledProviders: updated });
          }}
        />
      ))}
    </>
  );
}

function AuthTab() {
  const providers = [
    { name: 'Codex', status: 'authenticated' as const },
    { name: 'Claude', status: 'authenticated' as const },
    { name: 'Cursor', status: 'authenticated' as const },
    { name: 'Gemini', status: 'expired' as const },
    { name: 'Copilot', status: 'authenticated' as const },
  ];

  return (
    <>
      <div className="text-[10px] text-muted-foreground mb-2">Provider authentication status</div>
      {providers.map(p => (
        <div key={p.name} className="flex items-center justify-between py-1.5">
          <span className="text-xs font-medium text-card-foreground">{p.name}</span>
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              p.status === 'authenticated'
                ? 'cb-badge-operational'
                : p.status === 'expired'
                ? 'cb-badge-degraded'
                : 'cb-badge-unknown'
            }`}
          >
            {p.status === 'authenticated'
              ? 'Authenticated'
              : p.status === 'expired'
              ? 'Expired'
              : 'Not configured'}
          </span>
        </div>
      ))}
    </>
  );
}

function AboutTab() {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <div className="text-lg font-bold text-card-foreground cb-mono">CodexBar</div>
        <div className="text-[10px] text-muted-foreground">v1.1.2 · Windows</div>
      </div>
      <div className="text-[10px] text-muted-foreground text-center leading-relaxed">
        AI provider usage monitor for your system tray.
        <br />
        Track session & weekly limits across Codex, Claude, Cursor, Gemini, and Copilot.
      </div>
      <div className="text-[10px] text-center text-muted-foreground">
        Based on{' '}
        <a
          href="https://github.com/Finesssee/Win-CodexBar"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Win-CodexBar
        </a>
      </div>
    </div>
  );
}
