import { useAppStore } from '../../store/useStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { formatArea, formatFuel } from '../../utils/format';

export const StatsCharts = () => {
  const { statistics, machines, statsPeriod, setStatsPeriod } = useAppStore();

  const dailySummary = statistics.reduce((acc, stat) => {
    const existing = acc.find((s) => s.date === stat.date);
    if (existing) {
      existing.totalArea += stat.totalArea;
      existing.totalFuel += stat.totalFuel;
      existing.workHours += stat.workHours;
    } else {
      acc.push({ ...stat });
    }
    return acc;
  }, [] as typeof statistics);

  dailySummary.sort((a, b) => a.date.localeCompare(b.date));

  const machineStats = machines.map((m) => {
    const machineStatsData = statistics.filter((s) => s.machineId === m.id);
    const totalArea = machineStatsData.reduce((sum, s) => sum + s.totalArea, 0);
    const totalFuel = machineStatsData.reduce((sum, s) => sum + s.totalFuel, 0);
    return {
      name: m.name,
      totalArea: Math.round(totalArea * 10) / 10,
      totalFuel: Math.round(totalFuel * 10) / 10,
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">作业面积与油耗趋势</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setStatsPeriod('day')}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                statsPeriod === 'day'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              按日
            </button>
            <button
              onClick={() => setStatsPeriod('week')}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                statsPeriod === 'week'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              按周
            </button>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailySummary}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}亩`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}L`} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'totalArea' ? formatArea(value) : formatFuel(value),
                  name === 'totalArea' ? '作业面积' : '油耗',
                ]}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="totalArea"
                name="作业面积"
                stroke="#15803d"
                strokeWidth={2}
                dot={{ fill: '#15803d', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="totalFuel"
                name="油耗"
                stroke="#ca8a04"
                strokeWidth={2}
                dot={{ fill: '#ca8a04', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-6">各农机作业面积</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(value: number) => formatArea(value)} />
                <Bar dataKey="totalArea" fill="#15803d" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-6">各农机油耗统计</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(value: number) => formatFuel(value)} />
                <Bar dataKey="totalFuel" fill="#ca8a04" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-6">农机作业详情</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">农机名称</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">作业面积</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">油耗</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">作业时长</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">日均面积</th>
              </tr>
            </thead>
            <tbody>
              {machineStats.map((m, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{m.name}</td>
                  <td className="py-3 px-4 text-gray-600">{formatArea(m.totalArea)}</td>
                  <td className="py-3 px-4 text-gray-600">{formatFuel(m.totalFuel)}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {((m.totalArea / 15) * 2).toFixed(1)} h
                  </td>
                  <td className="py-3 px-4 text-gray-600">{formatArea(m.totalArea / 7)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
