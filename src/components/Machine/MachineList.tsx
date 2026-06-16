import { useState } from 'react';
import { useAppStore } from '../../store/useStore';
import {
  getStatusColor,
  getStatusName,
  getMachineTypeName,
  formatArea,
  formatFuel,
} from '../../utils/format';
import type { MachineStatus, MachineType } from '../../types';
import {
  Combine,
  Sprout,
  Plane,
  Tractor,
  ChevronRight,
  Search,
  Filter,
  X,
  RotateCcw,
  Gauge,
  Droplets,
  LeafyGreen,
} from 'lucide-react';

const MachineIcon = ({ type }: { type: string }) => {
  const className = 'w-5 h-5';
  switch (type) {
    case 'harvester':
      return <Combine className={className} />;
    case 'seeder':
      return <Sprout className={className} />;
    case 'drone':
      return <Plane className={className} />;
    case 'tractor':
      return <Tractor className={className} />;
    default:
      return <Tractor className={className} />;
  }
};

const statusOptions: { value: MachineStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'working', label: '作业中' },
  { value: 'idle', label: '空闲' },
  { value: 'transfer', label: '转场' },
  { value: 'maintenance', label: '维修' },
];

const typeOptions: { value: MachineType; label: string }[] = [
  { value: 'harvester', label: '收割机' },
  { value: 'seeder', label: '播种机' },
  { value: 'drone', label: '无人机' },
  { value: 'tractor', label: '拖拉机' },
];

export const MachineList = () => {
  const {
    getFilteredMachines,
    selectedMachineId,
    setSelectedMachine,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilters,
    toggleTypeFilter,
    statusAdvancedFilter,
    setStatusAdvancedFilter,
    areaRange,
    setAreaRange,
    fuelRange,
    setFuelRange,
    showFilterPanel,
    setShowFilterPanel,
    clearAllFilters,
    getActiveFilterCount,
  } = useAppStore();

  const filteredMachines = getFilteredMachines();
  const activeFilterCount = getActiveFilterCount();

  const [areaMin, setAreaMin] = useState(areaRange[0]?.toString() ?? '');
  const [areaMax, setAreaMax] = useState(areaRange[1]?.toString() ?? '');
  const [fuelMin, setFuelMin] = useState(fuelRange[0]?.toString() ?? '');
  const [fuelMax, setFuelMax] = useState(fuelRange[1]?.toString() ?? '');

  const applyRange = () => {
    setAreaRange([
      areaMin === '' ? null : Number(areaMin),
      areaMax === '' ? null : Number(areaMax),
    ]);
    setFuelRange([
      fuelMin === '' ? null : Number(fuelMin),
      fuelMax === '' ? null : Number(fuelMax),
    ]);
  };

  const handleClearAll = () => {
    clearAllFilters();
    setAreaMin('');
    setAreaMax('');
    setFuelMin('');
    setFuelMax('');
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden relative z-10">
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">农机列表</h2>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                清除筛选
              </button>
            )}
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`relative flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showFilterPanel || activeFilterCount > 0
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              筛选
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索农机名称、编号或驾驶员..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setStatusFilter(opt.value);
                if (statusAdvancedFilter !== 'all') setStatusAdvancedFilter('all');
              }}
              className={`px-3 py-1 text-xs rounded-full transition-all ${
                (statusAdvancedFilter === 'all' || statusAdvancedFilter === null) &&
                statusFilter === opt.value
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {activeFilterCount > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md">
                关键字: {searchQuery}
              </span>
            )}
            {typeFilters.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-md">
                类型: {typeFilters.map((t) => getMachineTypeName(t)).join('/')}
              </span>
            )}
            {statusAdvancedFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-md">
                状态: {getStatusName(statusAdvancedFilter)}
              </span>
            )}
            {(areaRange[0] !== null || areaRange[1] !== null) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-md">
                作业: {areaRange[0] ?? 0} - {areaRange[1] ?? '∞'} 亩
              </span>
            )}
            {(fuelRange[0] !== null || fuelRange[1] !== null) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-md">
                油量: {fuelRange[0] ?? 0} - {fuelRange[1] ?? '100'}%
              </span>
            )}
          </div>
        )}
      </div>

      {showFilterPanel && (
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex-shrink-0 space-y-4 relative z-20 shadow-md">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">农机类型（可多选）</div>
            <div className="grid grid-cols-2 gap-2">
              {typeOptions.map((opt) => {
                const checked = typeFilters.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all ${
                      checked
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTypeFilter(opt.value)}
                      className="w-4 h-4 rounded text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">作业状态</div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((opt) => {
                const active = statusAdvancedFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() =>
                      setStatusAdvancedFilter(
                        active ? 'all' : (opt.value as MachineStatus | 'all')
                      )
                    }
                    className={`px-3 py-1 text-xs rounded-md transition-all border ${
                      active
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                <LeafyGreen className="w-4 h-4" />
                今日作业面积 (亩)
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={areaMin}
                  onChange={(e) => setAreaMin(e.target.value)}
                  placeholder="最小"
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  value={areaMax}
                  onChange={(e) => setAreaMax(e.target.value)}
                  placeholder="最大"
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                <Droplets className="w-4 h-4" />
                油量百分比 (%)
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={fuelMin}
                  onChange={(e) => setFuelMin(e.target.value)}
                  placeholder="最小"
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  value={fuelMax}
                  onChange={(e) => setFuelMax(e.target.value)}
                  placeholder="最大"
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={applyRange}
              className="flex-1 py-1.5 bg-green-700 text-white text-sm rounded-md hover:bg-green-800 transition-colors"
            >
              应用范围
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-md hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
          </div>
        </div>
      )}

      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex-shrink-0">
        <span className="text-xs text-gray-500">
          共 <span className="font-medium text-gray-700">{filteredMachines.length}</span> 台农机
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredMachines.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
            <Gauge className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">没有符合条件的农机</p>
            <button
              onClick={handleClearAll}
              className="mt-3 px-3 py-1 text-xs text-green-600 bg-green-50 rounded-md hover:bg-green-100"
            >
              清除筛选条件
            </button>
          </div>
        ) : (
          filteredMachines.map((machine) => {
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
                      style={{
                        background: getStatusColor(machine.status) + '20',
                        color: getStatusColor(machine.status),
                      }}
                    >
                      <MachineIcon type={machine.type} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{machine.name}</div>
                      <div className="text-xs text-gray-500">
                        {getMachineTypeName(machine.type)} · {machine.id.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isSelected ? 'rotate-90' : ''
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: getStatusColor(machine.status) }}
                    ></span>
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
                        <div className="font-medium text-gray-800">
                          {machine.speed.toFixed(1)} km/h
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">油量</div>
                        <div className="font-medium text-gray-800">
                          {machine.fuelLevel.toFixed(0)}%
                        </div>
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
          })
        )}
      </div>
    </div>
  );
};
