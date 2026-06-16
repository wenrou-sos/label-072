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

const machineIds = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'];
const baseArea: Record<string, number> = {
  m1: 130, m2: 110, m3: 50, m4: 80, m5: 220, m6: 0, m7: 160, m8: 70,
};
const baseFuel: Record<string, number> = {
  m1: 48, m2: 42, m3: 14, m4: 30, m5: 9, m6: 0, m7: 55, m8: 20,
};

const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

export const generateWeeklyStats = (): DailyStats[] => {
  const stats: DailyStats[] = [];
  const rand = seededRandom(42);

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    machineIds.forEach((mid) => {
      const factor = 0.7 + rand() * 0.6;
      stats.push({
        date: dateStr,
        machineId: mid,
        machineName: machineNames[mid],
        totalArea: Math.round(baseArea[mid] * factor * 10) / 10,
        totalFuel: Math.round(baseFuel[mid] * factor * 10) / 10,
        workHours: mid === 'm6' ? 0 : Math.round((4 + rand() * 6) * 10) / 10,
      });
    });
  }

  return stats;
};

export const generateHourlyStats = (dateStr: string): DailyStats[] => {
  const stats: DailyStats[] = [];
  const rand = seededRandom(123);

  for (let h = 0; h < 24; h++) {
    const hourStr = `${dateStr} ${String(h).padStart(2, '0')}:00`;
    const isWorkingHour = h >= 6 && h <= 18;

    machineIds.forEach((mid) => {
      const hourFactor = isWorkingHour ? 0.08 + rand() * 0.05 : 0;
      stats.push({
        date: hourStr,
        machineId: mid,
        machineName: machineNames[mid],
        totalArea: Math.round(baseArea[mid] * hourFactor * 10) / 10,
        totalFuel: Math.round(baseFuel[mid] * hourFactor * 10) / 10,
        workHours: mid === 'm6' || !isWorkingHour ? 0 : 1,
      });
    });
  }

  return stats;
};

export const mockStatistics: DailyStats[] = generateWeeklyStats();

export const getTodayStats = (): DailyStats[] => {
  const today = new Date().toISOString().split('T')[0];
  return generateHourlyStats(today);
};

export const getWeeklyStats = (): DailyStats[] => {
  return generateWeeklyStats();
};
