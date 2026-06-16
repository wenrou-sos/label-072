import { useMemo } from 'react';
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
import { formatArea, formatFuel, formatHours } from '../../utils/format';

export const StatsCharts = () => {
  const { statsPeriod, setStatsPeriod, getPeriodStats, machines } = useAppStore();

  const periodStats = getPeriodStats();

  const trendData = useMemo(() => {
    const dateMap = new Map<string, { date: string; totalArea: number; totalFuel: number }>();
    periodStats.forEach((s) => {
      if (!dateMap.has(s.date)) {
        dateMap.set(s.date, { date: s.date, totalArea: 0, totalFuel: 0 });
      }
      const entry = dateMap.get(s.date)!;
      entry.totalArea += s.totalArea;
      entry.totalFuel += s.totalFuel;
    });
    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [periodStats]);

  const machineStats = useMemo(() => {
    return machines.map((m) => {
      const machineData = periodStats.filter((s) => s.machineId === m.id);
      const totalArea = machineData.reduce((sum, s) => sum + s.totalArea, 0);
      const totalFuel = machineData.reduce((sum, s) => sum + s.totalFuel, 0);
      const workHours = machineData.reduce((sum, s) => sum + s.workHours, 0);
      return {
        name: m.name,
        totalArea: Math.round(totalArea * 10) / 10,
        totalFuel: Math.round(totalFuel * 10) / 10,
        workHours: Math.round(workHours * 10) / 10,
      };
    });
  }, [machines, periodStats]);

  const formatXAxis = (value: string) => {
    if (statsPeriod === 'day') {
      return value.split(' ')[1] || value.slice(5);
    }
    return value.slice(5);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">
            作业面积与油耗趋势
            <span className="text-sm font-normal text-gray-500 ml-2">
              （{statsPeriod === 'day' ? '今日 24 小时' : '近 7 天'}）
            </span>
          </h3>
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
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={formatXAxis} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}亩`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}L`} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'totalArea' ? formatArea(value) : formatFuel(value),
                  name === 'totalArea' ? '作业面积' : '油耗',
                ]}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="totalArea"
                name="作业面积"
                stroke="#15803d"
                strokeWidth={2}
                dot={{ fill: '#15803d', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="totalFuel"
                name="油耗"
                stroke="#ca8a04"
                strokeWidth={2}
                dot={{ fill: '#ca8a04', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            各农机作业面积
            <span className="text-sm font-normal text-gray-500 ml-2">
              （{statsPeriod === 'day' ? '今日' : '本周'}）
            </span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}亩`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(value: number) => formatArea(value)} />
                <Bar dataKey="totalArea" fill="#15803d" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            各农机油耗统计
            <span className="text-sm font-normal text-gray-500 ml-2">
              （{statsPeriod === 'day' ? '今日' : '本周'}）
            </span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machineStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}L`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(value: number) => formatFuel(value)} />
                <Bar dataKey="totalFuel" fill="#ca8a04" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-6">
          农机作业详情
          <span className="text-sm font-normal text-gray-500 ml-2">
            （{statsPeriod === 'day' ? '今日' : '本周'}汇总）
          </span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">农机名称</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">作业面积</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">油耗</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">作业时长</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  {statsPeriod === 'day' ? '平均每小时面积' : '日均面积'}
                </th>
              </tr>
            </thead>
            <tbody>
              {machineStats.map((m, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{m.name}</td>
                  <td className="py-3 px-4 text-gray-600">{formatArea(m.totalArea)}</td>
                  <td className="py-3 px-4 text-gray-600">{formatFuel(m.totalFuel)}</td>
                  <td className="py-3 px-4 text-gray-600">{formatHours(m.workHours)}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {statsPeriod === 'day'
                      ? formatArea(m.workHours > 0 ? m.totalArea / m.workHours : 0)
                      : formatArea(m.totalArea / 7)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
