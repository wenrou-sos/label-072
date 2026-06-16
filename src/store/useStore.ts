import { create } from 'zustand';
import type { Machine, Field, Task, TrackPoint, DailyStats, MachineStatus, WorkType } from '../types';
import { mockMachines } from '../data/machines';
import { mockFields } from '../data/fields';
import { mockTasks } from '../data/tasks';
import { mockStatistics } from '../data/statistics';
import { generateTrackPoints, getPolygonCenter, calculateDistance } from '../utils/geo';

interface AppState {
  machines: Machine[];
  fields: Field[];
  tasks: Task[];
  statistics: DailyStats[];
  trackPoints: TrackPoint[];
  selectedMachineId: string | null;
  selectedFieldId: string | null;
  activeTaskId: string | null;
  showTaskModal: boolean;
  statusFilter: MachineStatus | 'all';
  statsPeriod: 'day' | 'week';

  setSelectedMachine: (id: string | null) => void;
  setSelectedField: (id: string | null) => void;
  setStatusFilter: (status: MachineStatus | 'all') => void;
  setStatsPeriod: (period: 'day' | 'week') => void;
  setShowTaskModal: (show: boolean) => void;
  setActiveTaskId: (id: string | null) => void;

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
  trackPoints: [],
  selectedMachineId: null,
  selectedFieldId: null,
  activeTaskId: null,
  showTaskModal: false,
  statusFilter: 'all',
  statsPeriod: 'week',

  setSelectedMachine: (id) => set({ selectedMachineId: id }),
  setSelectedField: (id) => set({ selectedFieldId: id }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setStatsPeriod: (period) => set({ statsPeriod: period }),
  setShowTaskModal: (show) => set({ showTaskModal: show }),
  setActiveTaskId: (id) => set({ activeTaskId: id }),

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
