import type { DailyStats } from '../types';

const machineNames: Record<string, string> = {
  m1: '丰收一号',
  m2: '丰收二号',
  m3: '播种先锋',
  m4: '铁牛一号',
  m5: '植保无人机A',
  m6: '植保无人机B',
  m7: '铁牛二号',
  m8: '播种能手',
};

const generateWeeklyStats = (): DailyStats[] => {
  const stats: DailyStats[] = [];
  const machineIds = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'];
  const baseArea: Record<string, number> = {
    m1: 130, m2: 110, m3: 50, m4: 80, m5: 220, m6: 0, m7: 160, m8: 70,
  };
  const baseFuel: Record<string, number> = {
    m1: 48, m2: 42, m3: 14, m4: 30, m5: 9, m6: 0, m7: 55, m8: 20,
  };

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    machineIds.forEach((mid) => {
      const factor = 0.7 + Math.random() * 0.6;
      stats.push({
        date: dateStr,
        machineId: mid,
        machineName: machineNames[mid],
        totalArea: Math.round(baseArea[mid] * factor * 10) / 10,
        totalFuel: Math.round(baseFuel[mid] * factor * 10) / 10,
        workHours: mid === 'm6' ? 0 : Math.round((4 + Math.random() * 6) * 10) / 10,
      });
    });
  }

  return stats;
};

export const mockStatistics: DailyStats[] = generateWeeklyStats();
