import { Provider } from '@/types';
import { providerLogos } from '@/data/providerLogos';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useState } from 'react';

interface UsageHistoryChartProps {
  providers: Provider[];
  animationsEnabled?: boolean;
}

type TimeRange = '8h' | '24h' | '7d';

function generateHistoryData(providers: Provider[], range: TimeRange) {
  const now = Date.now();
  const hour = 3600000;
  const intervals = range === '8h' ? 8 : range === '24h' ? 24 : 7 * 24;
  const step = range === '7d' ? 24 * hour : hour;

  return Array.from({ length: intervals }, (_, i) => {
    const timestamp = now - (intervals - 1 - i) * step;
    const point: Record<string, number | string> = {
      time: range === '7d'
        ? new Date(timestamp).toLocaleDateString('en', { weekday: 'short' })
        : new Date(timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    };
    providers.forEach(p => {
      const trendPoint = p.usage.trend.points[Math.min(i, p.usage.trend.points.length - 1)];
      const base = trendPoint?.value ?? p.usage.sessionPercent;
      const jitter = Math.floor(Math.random() * 8 - 4);
      point[p.id] = Math.max(0, Math.min(100, base + jitter + (i * (Math.random() > 0.5 ? 1 : -1))));
    });
    return point;
  });
}

const CHART_COLORS: Record<string, string> = {
  codex: 'hsl(217, 91%, 60%)',
  claude: 'hsl(30, 80%, 55%)',
  cursor: 'hsl(142, 71%, 45%)',
  gemini: 'hsl(262, 83%, 58%)',
  copilot: 'hsl(195, 85%, 50%)',
};

export default function UsageHistoryChart({ providers, animationsEnabled = true }: UsageHistoryChartProps) {
  const [range, setRange] = useState<TimeRange>('8h');
  const [data] = useState(() => ({
    '8h': generateHistoryData(providers, '8h'),
    '24h': generateHistoryData(providers, '24h'),
    '7d': generateHistoryData(providers, '7d'),
  }));

  const ranges: { value: TimeRange; label: string }[] = [
    { value: '8h', label: '8h' },
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-card-foreground">Usage History</h3>
        <div className="flex rounded-md border border-border overflow-hidden">
          {ranges.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-2 py-0.5 text-[10px] font-medium transition-colors ${
                range === r.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data[range]} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              {providers.map(p => (
                <linearGradient key={p.id} id={`gradient-${p.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS[p.id]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS[p.id]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={v => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '11px',
                color: 'hsl(var(--card-foreground))',
              }}
              formatter={(value: number, name: string) => [`${value}%`, name.charAt(0).toUpperCase() + name.slice(1)]}
            />
            {providers.map(p => (
              <Area
                key={p.id}
                type="monotone"
                dataKey={p.id}
                stroke={CHART_COLORS[p.id]}
                strokeWidth={1.5}
                fill={`url(#gradient-${p.id})`}
                isAnimationActive={animationsEnabled}
                animationDuration={800}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2 px-1">
        {providers.map(p => (
          <div key={p.id} className="flex items-center gap-1.5">
            <img src={providerLogos[p.id]} alt={p.name} className="h-3 w-3 rounded-sm object-contain" />
            <span className="text-[9px] text-muted-foreground">{p.name}</span>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: CHART_COLORS[p.id] }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
