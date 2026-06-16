import { create } from 'zustand';
import type { Machine, Field, Task, TrackPoint, DailyStats, MachineStatus, MachineType, WorkType } from '../types';
import { mockMachines } from '../data/machines';
import { mockFields } from '../data/fields';
import { mockTasks } from '../data/tasks';
import { mockStatistics, getTodayStats, getWeeklyStats } from '../data/statistics';
import { generateTrackPoints, getPolygonCenter, calculateDistance } from '../utils/geo';

interface AppState {
  machines: Machine[];
  fields: Field[];
  tasks: Task[];
  statistics: DailyStats[];
  dailyStatistics: DailyStats[];
  trackPoints: TrackPoint[];
  selectedMachineId: string | null;
  selectedFieldId: string | null;
  activeTaskId: string | null;
  showTaskModal: boolean;
  statusFilter: MachineStatus | 'all';
  statsPeriod: 'day' | 'week';

  searchQuery: string;
  typeFilters: MachineType[];
  statusAdvancedFilter: MachineStatus | 'all';
  areaRange: [number | null, number | null];
  fuelRange: [number | null, number | null];
  showFilterPanel: boolean;

  setSelectedMachine: (id: string | null) => void;
  setSelectedField: (id: string | null) => void;
  setStatusFilter: (status: MachineStatus | 'all') => void;
  setStatsPeriod: (period: 'day' | 'week') => void;
  setShowTaskModal: (show: boolean) => void;
  setActiveTaskId: (id: string | null) => void;

  setSearchQuery: (q: string) => void;
  toggleTypeFilter: (type: MachineType) => void;
  setStatusAdvancedFilter: (status: MachineStatus | 'all') => void;
  setAreaRange: (range: [number | null, number | null]) => void;
  setFuelRange: (range: [number | null, number | null]) => void;
  setShowFilterPanel: (show: boolean) => void;
  clearAllFilters: () => void;

  getFilteredMachines: () => Machine[];
  getActiveFilterCount: () => number;
  getPeriodStats: () => DailyStats[];
  getPeriodSummary: () => { totalArea: number; totalFuel: number; totalMachines: number; workingMachines: number };

  createTask: (fieldId: string, workType: WorkType, scheduledTime: string) => void;
  assignTask: (taskId: string, machineId: string) => void;
  acceptTask: (taskId: string) => void;
  completeTask: (taskId: string) => void;

  findNearestMachines: (fieldId: string, workType: WorkType) => Machine[];
  updateMachinePosition: (machineId: string, position: [number, number]) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
}

let simulationInterval: ReturnType<typeof setInterval> | null = null;

export const useAppStore = create<AppState>((set, get) => ({
  machines: mockMachines,
  fields: mockFields,
  tasks: mockTasks,
  statistics: mockStatistics,
  dailyStatistics: getTodayStats(),
  trackPoints: [],
  selectedMachineId: null,
  selectedFieldId: null,
  activeTaskId: null,
  showTaskModal: false,
  statusFilter: 'all',
  statsPeriod: 'week',

  searchQuery: '',
  typeFilters: [],
  statusAdvancedFilter: 'all',
  areaRange: [null, null],
  fuelRange: [null, null],
  showFilterPanel: false,

  setSelectedMachine: (id) => set({ selectedMachineId: id }),
  setSelectedField: (id) => set({ selectedFieldId: id }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setStatsPeriod: (period) => set({ statsPeriod: period }),
  setShowTaskModal: (show) => set({ showTaskModal: show }),
  setActiveTaskId: (id) => set({ activeTaskId: id }),

  setSearchQuery: (q) => set({ searchQuery: q }),
  toggleTypeFilter: (type) =>
    set((state) => {
      const exists = state.typeFilters.includes(type);
      return {
        typeFilters: exists
          ? state.typeFilters.filter((t) => t !== type)
          : [...state.typeFilters, type],
      };
    }),
  setStatusAdvancedFilter: (status) => set({ statusAdvancedFilter: status }),
  setAreaRange: (range) => set({ areaRange: range }),
  setFuelRange: (range) => set({ fuelRange: range }),
  setShowFilterPanel: (show) => set({ showFilterPanel: show }),
  clearAllFilters: () =>
    set({
      searchQuery: '',
      typeFilters: [],
      statusAdvancedFilter: 'all',
      statusFilter: 'all',
      areaRange: [null, null],
      fuelRange: [null, null],
    }),

  getFilteredMachines: () => {
    const {
      machines,
      statusFilter,
      searchQuery,
      typeFilters,
      statusAdvancedFilter,
      areaRange,
      fuelRange,
    } = get();

    let result = [...machines];

    const activeStatus = statusAdvancedFilter !== 'all' ? statusAdvancedFilter : statusFilter;
    if (activeStatus !== 'all') {
      result = result.filter((m) => m.status === activeStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.driver.toLowerCase().includes(q)
      );
    }

    if (typeFilters.length > 0) {
      result = result.filter((m) => typeFilters.includes(m.type));
    }

    if (areaRange[0] !== null) {
      result = result.filter((m) => m.todayArea >= areaRange[0]!);
    }
    if (areaRange[1] !== null) {
      result = result.filter((m) => m.todayArea <= areaRange[1]!);
    }

    if (fuelRange[0] !== null) {
      result = result.filter((m) => m.fuelLevel >= fuelRange[0]!);
    }
    if (fuelRange[1] !== null) {
      result = result.filter((m) => m.fuelLevel <= fuelRange[1]!);
    }

    return result;
  },

  getActiveFilterCount: () => {
    const { searchQuery, typeFilters, statusAdvancedFilter, statusFilter, areaRange, fuelRange } =
      get();
    let count = 0;
    if (searchQuery.trim()) count++;
    if (typeFilters.length > 0) count++;
    if (statusAdvancedFilter !== 'all') count++;
    else if (statusFilter !== 'all') count++;
    if (areaRange[0] !== null || areaRange[1] !== null) count++;
    if (fuelRange[0] !== null || fuelRange[1] !== null) count++;
    return count;
  },

  getPeriodStats: () => {
    const { statsPeriod, statistics, dailyStatistics } = get();
    return statsPeriod === 'day' ? dailyStatistics : statistics;
  },

  getPeriodSummary: () => {
    const stats = get().getPeriodStats();
    const uniqueDates = new Set(stats.map((s) => s.date));
    const dateCount = uniqueDates.size;

    const machineTotals = stats.reduce((acc, s) => {
      if (!acc[s.machineId]) {
        acc[s.machineId] = { totalArea: 0, totalFuel: 0, hasWork: false };
      }
      acc[s.machineId].totalArea += s.totalArea;
      acc[s.machineId].totalFuel += s.totalFuel;
      if (s.totalArea > 0) acc[s.machineId].hasWork = true;
      return acc;
    }, {} as Record<string, { totalArea: number; totalFuel: number; hasWork: boolean }>);

    let totalArea = 0;
    let totalFuel = 0;
    let workingMachines = 0;
    Object.values(machineTotals).forEach((m) => {
      totalArea += m.totalArea;
      totalFuel += m.totalFuel;
      if (m.hasWork) workingMachines++;
    });

    return {
      totalArea: Math.round(totalArea * 10) / 10,
      totalFuel: Math.round(totalFuel * 10) / 10,
      totalMachines: Object.keys(machineTotals).length,
      workingMachines,
    };
  },

  createTask: (fieldId, workType, scheduledTime) => {
    const newTask: Task = {
      id: `t${Date.now()}`,
      fieldId,
      machineId: '',
      workType,
      status: 'pending',
      scheduledTime,
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  assignTask: (taskId, machineId) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, machineId, status: 'assigned' } : t
      ),
    }));
  },

  acceptTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: 'accepted' as const, startTime: new Date().toISOString() }
          : t
      ),
      machines: state.machines.map((m) =>
        m.id === state.tasks.find((t) => t.id === taskId)?.machineId
          ? { ...m, status: 'working' as const }
          : m
      ),
    }));
  },

  completeTask: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    const field = get().fields.find((f) => f.id === task?.fieldId);
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'completed' as const,
              endTime: new Date().toISOString(),
              area: field?.area || 0,
              fuelUsed: 30 + Math.random() * 20,
            }
          : t
      ),
      machines: state.machines.map((m) =>
        m.id === task?.machineId ? { ...m, status: 'idle' as const } : m
      ),
    }));
  },

  findNearestMachines: (fieldId, workType) => {
    const field = get().fields.find((f) => f.id === fieldId);
    if (!field) return [];
    const center = getPolygonCenter(field.coordinates);
    const idleMachines = get().machines.filter((m) => m.status === 'idle');
    return idleMachines
      .map((m) => ({ machine: m, distance: calculateDistance(center, m.position) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .map((item) => item.machine);
  },

  updateMachinePosition: (machineId, position) => {
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === machineId
          ? {
              ...m,
              position,
              heading: Math.random() * 360,
              speed: m.status === 'working' ? 3 + Math.random() * 4 : 0,
              fuelLevel: Math.max(0, m.fuelLevel - Math.random() * 0.2),
              todayArea: m.status === 'working' ? m.todayArea + Math.random() * 0.05 : m.todayArea,
              todayFuel: m.status === 'working' ? m.todayFuel + Math.random() * 0.02 : m.todayFuel,
            }
          : m
      ),
    }));
  },

  startSimulation: () => {
    if (simulationInterval) return;
    simulationInterval = setInterval(() => {
      const { machines } = get();
      machines.forEach((machine) => {
        if (machine.status === 'working' || machine.status === 'transfer') {
          const latOffset = (Math.random() - 0.5) * 0.002;
          const lngOffset = (Math.random() - 0.5) * 0.002;
          const newPos: [number, number] = [
            machine.position[0] + latOffset,
            machine.position[1] + lngOffset,
          ];
          get().updateMachinePosition(machine.id, newPos);
        }
      });
    }, 2000);
  },

  stopSimulation: () => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }
  },
}));
