import { Provider } from '@/types';
import TrendChart from './TrendChart';
import { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface ProviderCardProps {
  provider: Provider;
  onRefresh?: (id: string) => void;
  animationsEnabled?: boolean;
  warningThreshold?: number;
  criticalThreshold?: number;
}

function getUsageLevel(remaining: number, warning: number, critical: number) {
  if (remaining <= critical) return 'critical';
  if (remaining <= warning) return 'warning';
  return 'normal';
}

export default function ProviderCard({
  provider,
  onRefresh,
  animationsEnabled = true,
  warningThreshold = 30,
  criticalThreshold = 10,
}: ProviderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const sessionRemaining = 100 - provider.usage.sessionPercent;
  const weeklyRemaining = 100 - provider.usage.weeklyPercent;
  const sessionLevel = getUsageLevel(sessionRemaining, warningThreshold, criticalThreshold);
  const weeklyLevel = getUsageLevel(weeklyRemaining, warningThreshold, criticalThreshold);

  const statusDotClass =
    provider.statusInfo.status === 'operational'
      ? 'bg-cb-success'
      : provider.statusInfo.status === 'degraded'
      ? 'bg-cb-warning'
      : provider.statusInfo.status === 'outage'
      ? 'bg-cb-critical'
      : 'bg-cb-steady';

  return (
    <div
      className={`rounded-lg border border-border bg-card p-3 ${
        animationsEnabled ? 'cb-card-hover' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base flex-shrink-0">{provider.icon}</span>
          <span className="text-sm font-semibold text-card-foreground truncate">{provider.name}</span>
          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${statusDotClass}`} />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <TrendChart trend={provider.usage.trend} mini />
          <button
            onClick={() => onRefresh?.(provider.id)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label={`Refresh ${provider.name}`}
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Session bar */}
      <div className="mb-1.5">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Session</span>
          <span
            className={`text-xs font-mono font-semibold ${
              sessionLevel === 'critical'
                ? 'text-cb-critical'
                : sessionLevel === 'warning'
                ? 'text-cb-warning'
                : 'text-card-foreground'
            }`}
          >
            {provider.usage.sessionPercent}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-cb-bar-bg overflow-hidden">
          <div
            className={`cb-usage-bar ${
              sessionLevel === 'critical'
                ? 'bg-cb-critical'
                : sessionLevel === 'warning'
                ? 'bg-cb-warning'
                : 'bg-cb-bar-session'
            }`}
            style={{ width: `${provider.usage.sessionPercent}%` }}
          />
        </div>
      </div>

      {/* Weekly bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Weekly</span>
          <span
            className={`text-xs font-mono font-semibold ${
              weeklyLevel === 'critical'
                ? 'text-cb-critical'
                : weeklyLevel === 'warning'
                ? 'text-cb-warning'
                : 'text-card-foreground'
            }`}
          >
            {provider.usage.weeklyPercent}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-cb-bar-bg overflow-hidden">
          <div
            className={`cb-usage-bar ${
              weeklyLevel === 'critical'
                ? 'bg-cb-critical'
                : weeklyLevel === 'warning'
                ? 'bg-cb-warning'
                : 'bg-cb-bar-weekly'
            }`}
            style={{ width: `${provider.usage.weeklyPercent}%` }}
          />
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        <span>Details</span>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-2 pt-2 border-t border-border">
          <TrendChart trend={provider.usage.trend} mini={false} />
          <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className={`inline-block h-2 w-2 rounded-full ${statusDotClass}`} />
            <span>{provider.statusInfo.description}</span>
          </div>
        </div>
      )}
    </div>
  );
}
