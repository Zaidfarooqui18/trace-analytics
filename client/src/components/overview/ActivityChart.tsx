import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '../../hooks/useTheme';

interface ActivityChartProps {
  data: Array<{
    date: string;
    page_views: number;
    clicks: number;
    total: number;
  }>;
}

export function ActivityChart({ data }: ActivityChartProps) {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-sm text-slate-400">
        No interaction activity recorded in this period.
      </div>
    );
  }

  // Format date labels (e.g. "Oct 14" or "14:00")
  const chartData = data.map((d) => {
    let label = d.date;
    try {
      const parts = d.date.split(' ');
      if (parts.length > 1) {
        label = parts[1]; // time e.g. 14:00
      } else {
        const dateObj = new Date(d.date);
        if (!isNaN(dateObj.getTime())) {
          label = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(dateObj);
        }
      }
    } catch (e) {}

    return {
      ...d,
      displayDate: label,
    };
  });

  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="displayDate"
            stroke={textColor}
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
          />
          <YAxis
            stroke={textColor}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#111726' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              fontSize: '12px',
              color: isDark ? '#f8fafc' : '#0f172a',
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
          />
          <Area
            type="monotone"
            name="Page Views"
            dataKey="page_views"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#viewsGradient)"
          />
          <Area
            type="monotone"
            name="Clicks"
            dataKey="clicks"
            stroke="#f59e0b"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#clicksGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
