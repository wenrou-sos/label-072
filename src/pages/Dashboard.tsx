import { useEffect, useState } from 'react';
import { MapView } from '../components/Map/MapView';
import { MachineList } from '../components/Machine/MachineList';
import { TaskPanel } from '../components/Task/TaskPanel';
import { StatsCards } from '../components/Stats/StatsCards';
import { useAppStore } from '../store/useStore';

export const Dashboard = () => {
  const {
    machines,
    fields,
    selectedMachineId,
    selectedFieldId,
    setSelectedMachine,
    setSelectedField,
    startSimulation,
    stopSimulation,
    statusFilter,
  } = useAppStore();

  const [mapCenter, setMapCenter] = useState<[number, number]>([39.905, 116.397]);
  const [mapZoom, setMapZoom] = useState(14);

  useEffect(() => {
    startSimulation();
    return () => stopSimulation();
  }, [startSimulation, stopSimulation]);

  useEffect(() => {
    if (selectedMachineId) {
      const machine = machines.find((m) => m.id === selectedMachineId);
      if (machine) {
        setMapCenter(machine.position);
        setMapZoom(15);
      }
    }
  }, [selectedMachineId, machines]);

  useEffect(() => {
    if (selectedFieldId) {
      const field = fields.find((f) => f.id === selectedFieldId);
      if (field && field.coordinates.length > 0) {
        const center: [number, number] = [
          field.coordinates.reduce((sum, c) => sum + c[0], 0) / field.coordinates.length,
          field.coordinates.reduce((sum, c) => sum + c[1], 0) / field.coordinates.length,
        ];
        setMapCenter(center);
        setMapZoom(15);
      }
    }
  }, [selectedFieldId, fields]);

  const filteredMachines = statusFilter === 'all'
    ? machines
    : machines.filter((m) => m.status === statusFilter);

  return (
    <div className="h-full flex flex-col gap-4">
      <StatsCards />

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        <div className="col-span-3 min-h-0">
          <MachineList />
        </div>

        <div className="col-span-6 min-h-0">
          <MapView
            machines={filteredMachines}
            fields={fields}
            selectedMachineId={selectedMachineId}
            selectedFieldId={selectedFieldId}
            onMachineClick={setSelectedMachine}
            onFieldClick={setSelectedField}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
          />
        </div>

        <div className="col-span-3 min-h-0">
          <TaskPanel />
        </div>
      </div>
    </div>
  );
};
