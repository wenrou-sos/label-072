import { useAppStore } from '../../store/useStore';
import { formatArea, formatFuel } from '../../utils/format';
import { Activity, Gauge, Droplets, LeafyGreen } from 'lucide-react';

export const StatsCards = () => {
  const { machines } = useAppStore();

  const stats = {
    total: machines.length,
    working: machines.filter((m) => m.status === 'working').length,
    todayArea: machines.reduce((sum, m) => sum + m.todayArea, 0),
    todayFuel: machines.reduce((sum, m) => sum + m.todayFuel, 0),
  };

  const cards = [
    { label: '在线农机', value: `${stats.total} 台`, icon: Activity, color: 'from-blue-500 to-blue-600' },
    { label: '作业中', value: `${stats.working} 台`, icon: Gauge, color: 'from-green-500 to-green-600' },
    { label: '今日作业面积', value: formatArea(stats.todayArea), icon: LeafyGreen, color: 'from-emerald-500 to-emerald-600' },
    { label: '今日总油耗', value: formatFuel(stats.todayFuel), icon: Droplets, color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">{card.label}</div>
                <div className="text-xl font-bold text-gray-800">{card.value}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
