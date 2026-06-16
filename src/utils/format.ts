export const formatArea = (area: number): string => `${area.toFixed(1)} 亩`;

export const formatFuel = (fuel: number): string => `${fuel.toFixed(1)} L`;

export const formatSpeed = (speed: number): string => `${speed.toFixed(1)} km/h`;

export const formatHours = (hours: number): string => `${hours.toFixed(1)} h`;

export const getMachineTypeName = (type: string): string => {
  const names: Record<string, string> = {
    harvester: '收割机',
    seeder: '播种机',
    drone: '无人机',
    tractor: '拖拉机',
  };
  return names[type] || type;
};

export const getStatusName = (status: string): string => {
  const names: Record<string, string> = {
    working: '作业中',
    idle: '空闲',
    maintenance: '维修',
    transfer: '转场',
    pending: '待分配',
    assigned: '已派单',
    accepted: '已接单',
    completed: '已完成',
  };
  return names[status] || status;
};

export const getWorkTypeName = (type: string): string => {
  const names: Record<string, string> = {
    plowing: '耕地',
    seeding: '播种',
    management: '管护',
    harvesting: '收割',
  };
  return names[type] || type;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    working: '#22c55e',
    idle: '#3b82f6',
    maintenance: '#ef4444',
    transfer: '#f97316',
    pending: '#a855f7',
    assigned: '#06b6d4',
    accepted: '#84cc16',
    completed: '#6b7280',
  };
  return colors[status] || '#6b7280';
};

export const getWorkTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    plowing: '#92400e',
    seeding: '#15803d',
    management: '#1d4ed8',
    harvesting: '#ca8a04',
  };
  return colors[type] || '#6b7280';
};
