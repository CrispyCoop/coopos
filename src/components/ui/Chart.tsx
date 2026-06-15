import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell
} from 'recharts'

export const CHART_COLOURS = {
  red: '#D62828',
  yellow: '#FFC300',
  green: '#1A6B3C',
  blue: '#1A4B8C',
  purple: '#4A2080',
  muted: '#888888',
}

interface LineChartProps {
  data: Record<string, unknown>[]
  dataKey: string
  xKey?: string
  colour?: string
  height?: number
  formatValue?: (v: number) => string
}

export function SimpleLineChart({ data, dataKey, xKey = 'date', colour = CHART_COLOURS.red, height = 200, formatValue }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colour} stopOpacity={0.15} />
            <stop offset="95%" stopColor={colour} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E0" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} tickFormatter={formatValue} />
        <Tooltip
          formatter={formatValue ? (v: unknown) => formatValue(v as number) : undefined}
          contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, borderColor: '#E5E5E0', borderRadius: 8 }}
        />
        <Area type="monotone" dataKey={dataKey} stroke={colour} strokeWidth={2} fill="url(#grad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface BarChartProps {
  data: Record<string, unknown>[]
  dataKey: string
  xKey?: string
  colour?: string
  height?: number
  formatValue?: (v: number) => string
}

export function SimpleBarChart({ data, dataKey, xKey = 'label', colour = CHART_COLOURS.red, height = 200, formatValue }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barSize={20}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E0" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} tickFormatter={formatValue} />
        <Tooltip
          formatter={formatValue ? (v: unknown) => formatValue(v as number) : undefined}
          contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, borderColor: '#E5E5E0', borderRadius: 8 }}
        />
        <Bar dataKey={dataKey} fill={colour} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface DonutChartProps {
  data: { name: string; value: number; colour: string }[]
  height?: number
}

export function DonutChart({ data, height = 200 }: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
          {data.map((entry, idx) => (
            <Cell key={idx} fill={entry.colour} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, borderColor: '#E5E5E0', borderRadius: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
