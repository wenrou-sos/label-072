import { useAppStore } from '../../store/useStore';
import { getStatusColor, getStatusName, getMachineTypeName, formatArea, formatFuel } from '../../utils/format';
import type { MachineStatus } from '../../types';
import { Combine, Sprout, Plane, Tractor, ChevronRight } from 'lucide-react';

const MachineIcon = ({ type }: { type: string }) => {
  const className = "w-5 h-5";
  switch (type) {
    case 'harvester': return <Combine className={className} />;
    case 'seeder': return <Sprout className={className} />;
    case 'drone': return <Plane className={className} />;
    case 'tractor': return <Tractor className={className} />;
    default: return <Tractor className={className} />;
  }
};

const statusOptions: { value: MachineStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'working', label: '作业中' },
  { value: 'idle', label: '空闲' },
  { value: 'transfer', label: '转场' },
  { value: 'maintenance', label: '维修' },
];

export const MachineList = () => {
  const { machines, statusFilter, setStatusFilter, selectedMachineId, setSelectedMachine } = useAppStore();

  const filteredMachines = statusFilter === 'all'
    ? machines
    : machines.filter((m) => m.status === statusFilter);

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-3">农机列表</h2>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1 text-xs rounded-full transition-all ${
                statusFilter === opt.value
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredMachines.map((machine) => {
          const isSelected = selectedMachineId === machine.id;
          return (
            <div
              key={machine.id}
              onClick={() => setSelectedMachine(isSelected ? null : machine.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all border-l-4 hover:shadow-md ${
                isSelected ? 'bg-green-50 shadow-md' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              style={{ borderLeftColor: getStatusColor(machine.status) }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="p-1.5 rounded-lg"
                    style={{ background: getStatusColor(machine.status) + '20', color: getStatusColor(machine.status) }}
                  >
                    <MachineIcon type={machine.type} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{machine.name}</div>
                    <div className="text-xs text-gray-500">{getMachineTypeName(machine.type)}</div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: getStatusColor(machine.status) }}></span>
                  <span className="text-gray-600">{getStatusName(machine.status)}</span>
                </div>
                <div className="text-gray-600 text-right">驾驶员: {machine.driver}</div>
                <div className="text-gray-600">今日作业: {formatArea(machine.todayArea)}</div>
                <div className="text-gray-600 text-right">油耗: {formatFuel(machine.todayFuel)}</div>
              </div>

              {isSelected && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500 mb-1">速度</div>
                      <div className="font-medium text-gray-800">{machine.speed.toFixed(1)} km/h</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">油量</div>
                      <div className="font-medium text-gray-800">{machine.fuelLevel.toFixed(0)}%</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-gray-500 mb-1">油箱</div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-green-500 rounded-full transition-all"
                          style={{ width: `${machine.fuelLevel}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
