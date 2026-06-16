export type MachineType = 'harvester' | 'seeder' | 'drone' | 'tractor';

export type MachineStatus = 'working' | 'idle' | 'maintenance' | 'transfer';

export type WorkType = 'plowing' | 'seeding' | 'management' | 'harvesting';

export type TaskStatus = 'pending' | 'assigned' | 'accepted' | 'working' | 'completed';

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  status: MachineStatus;
  position: [number, number];
  heading: number;
  driver: string;
  speed: number;
  fuelLevel: number;
  todayArea: number;
  todayFuel: number;
}

export interface Field {
  id: string;
  name: string;
  area: number;
  coordinates: [number, number][];
  cropType: string;
  workType?: WorkType;
}

export interface Task {
  id: string;
  fieldId: string;
  machineId: string;
  workType: WorkType;
  status: TaskStatus;
  scheduledTime: string;
  startTime?: string;
  endTime?: string;
  area?: number;
  fuelUsed?: number;
}

export interface TrackPoint {
  machineId: string;
  timestamp: number;
  position: [number, number];
  speed: number;
  fuel: number;
}

export interface DailyStats {
  date: string;
  machineId: string;
  machineName: string;
  totalArea: number;
  totalFuel: number;
  workHours: number;
}
