import { RefreshCw, Settings, X } from 'lucide-react';

interface AppHeaderProps {
  isRefreshing: boolean;
  lastRefresh: number;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

export default function AppHeader({ isRefreshing, lastRefresh, onRefresh, onOpenSettings }: AppHeaderProps) {
  const ago = Math.floor((Date.now() - lastRefresh) / 1000);
  const agoText = ago < 60 ? `${ago}s ago` : `${Math.floor(ago / 60)}m ago`;

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-card-foreground cb-mono tracking-tight">CodexBar</span>
        <span className="text-[9px] text-muted-foreground font-mono">{agoText}</span>
      </div>
      <div className="flex items-center gap-0.5">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40"
          aria-label="Refresh all providers"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Open settings"
        >
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
}
