import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useStore';
import { getWorkTypeName, getWorkTypeColor, getStatusName, getStatusColor, formatArea } from '../../utils/format';
import type { WorkType, TaskStatus } from '../../types';
import { Plus, X, MapPin, Wrench, Clock, CheckCircle, ArrowRight, Trash2, Edit3, CheckSquare, Square } from 'lucide-react';

const workTypeOptions: { value: WorkType; label: string; icon: string }[] = [
  { value: 'plowing', label: '耕地', icon: '🚜' },
  { value: 'seeding', label: '播种', icon: '🌱' },
  { value: 'management', label: '管护', icon: '💧' },
  { value: 'harvesting', label: '收割', icon: '🌾' },
];

const statusTabs: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待分配' },
  { value: 'working', label: '进行中' },
  { value: 'completed', label: '已完成' },
];

const batchStatusOptions: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'pending', label: '待分配', color: '#6B7280' },
  { value: 'assigned', label: '已分配', color: '#3B82F6' },
  { value: 'accepted', label: '已接受', color: '#8B5CF6' },
  { value: 'working', label: '进行中', color: '#F59E0B' },
  { value: 'completed', label: '已完成', color: '#10B981' },
];

export const TaskPanel = () => {
  const { tasks, fields, machines, createTask, setShowTaskModal, showTaskModal, acceptTask, completeTask, batchDeleteTasks, batchUpdateTaskStatus } = useAppStore();
  const [activeTab, setActiveTab] = useState<TaskStatus | 'all'>('all');
  const [step, setStep] = useState(1);
  const [selectedField, setSelectedField] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState<WorkType | ''>('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const inProgressStatuses: TaskStatus[] = ['assigned', 'accepted', 'working'];
  const filteredTasks = activeTab === 'all'
    ? tasks
    : activeTab === 'working'
      ? tasks.filter((t) => inProgressStatuses.includes(t.status))
      : tasks.filter((t) => t.status === activeTab);

  const allSelected = useMemo(() => {
    return filteredTasks.length > 0 && filteredTasks.every((t) => selectedTaskIds.includes(t.id));
  }, [filteredTasks, selectedTaskIds]);

  const handleToggleSelect = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    }
  };

  const handleBatchDelete = () => {
    batchDeleteTasks(selectedTaskIds);
    setSelectedTaskIds([]);
    setShowDeleteConfirm(false);
    setBatchMode(false);
  };

  const handleBatchUpdateStatus = (status: TaskStatus) => {
    batchUpdateTaskStatus(selectedTaskIds, status);
    setSelectedTaskIds([]);
    setShowStatusModal(false);
    setBatchMode(false);
  };

  const exitBatchMode = () => {
    setBatchMode(false);
    setSelectedTaskIds([]);
  };

  const getFieldName = (id: string) => fields.find((f) => f.id === id)?.name || '未知地块';
  const getMachineName = (id: string) => machines.find((m) => m.id === id)?.name || '未分配';

  const handleCreate = () => {
    if (selectedField && selectedWorkType && scheduledTime) {
      createTask(selectedField, selectedWorkType, scheduledTime);
      setShowTaskModal(false);
      setStep(1);
      setSelectedField('');
      setSelectedWorkType('');
      setScheduledTime('');
    }
  };

  return (
    <>
      <div className="h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden relative z-10">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">任务管理</h2>
          <div className="flex items-center gap-2">
            {!batchMode ? (
              <>
                <button
                  onClick={() => setBatchMode(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  批量操作
                </button>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  新建任务
                </button>
              </>
            ) : (
              <button
                onClick={exitBatchMode}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
                取消
              </button>
            )}
          </div>
        </div>

        {batchMode && (
          <div className="px-4 py-3 border-b border-gray-100 bg-blue-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSelectAll}
                className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600 transition-colors"
              >
                {allSelected ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium">全选</span>
              </button>
              <span className="text-sm text-gray-600">
                已选中 <span className="font-bold text-blue-600">{selectedTaskIds.length}</span> 项
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStatusModal(true)}
                disabled={selectedTaskIds.length === 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit3 className="w-4 h-4" />
                更改状态
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={selectedTaskIds.length === 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            </div>
          </div>
        )}

        <div className="px-4 py-2 border-b border-gray-100 flex gap-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setActiveTab(tab.value); setSelectedTaskIds([]); }}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === tab.value
                  ? 'bg-green-100 text-green-800 font-medium'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-lg transition-colors cursor-pointer ${
                selectedTaskIds.includes(task.id)
                  ? 'bg-blue-50 border-2 border-blue-300'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {batchMode && (
                    <button
                      onClick={(e) => handleToggleSelect(task.id, e)}
                      className="flex-shrink-0"
                    >
                      {selectedTaskIds.includes(task.id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  )}
                  <span className="text-lg">{workTypeOptions.find((o) => o.value === task.workType)?.icon}</span>
                  <span className="font-medium text-gray-800 text-sm">{getFieldName(task.fieldId)}</span>
                </div>
                <span
                  className="px-2 py-0.5 text-xs rounded-full"
                  style={{ background: getStatusColor(task.status) + '20', color: getStatusColor(task.status) }}
                >
                  {getStatusName(task.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Wrench className="w-3 h-3" />
                  {getWorkTypeName(task.workType)}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {getMachineName(task.machineId)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {task.scheduledTime}
                </div>
                {task.area !== undefined && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {formatArea(task.area)}
                  </div>
                )}
              </div>

              {task.status === 'assigned' && (
                <button
                  onClick={() => acceptTask(task.id)}
                  className="mt-2 w-full py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                >
                  模拟接单
                </button>
              )}

              {task.status === 'working' && (
                <button
                  onClick={() => completeTask(task.id)}
                  className="mt-2 w-full py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                >
                  模拟完成
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">创建作业任务</h3>
              <button
                onClick={() => { setShowTaskModal(false); setStep(1); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= s ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {s}
                    </div>
                    {s < 3 && (
                      <div className={`w-16 h-1 ${step > s ? 'bg-green-700' : 'bg-gray-200'}`}></div>
                    )}
                  </div>
                ))}
              </div>

              {step === 1 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">选择作业地块</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {fields.map((field) => (
                      <div
                        key={field.id}
                        onClick={() => setSelectedField(field.id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedField === field.id
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm text-gray-800">{field.name}</div>
                        <div className="text-xs text-gray-500">{field.area}亩 · {field.cropType}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">选择作业类型</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {workTypeOptions.map((opt) => (
                      <div
                        key={opt.value}
                        onClick={() => setSelectedWorkType(opt.value)}
                        className={`p-4 rounded-lg border-2 cursor-pointer text-center transition-all ${
                          selectedWorkType === opt.value
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={selectedWorkType === opt.value ? { borderColor: getWorkTypeColor(opt.value), background: getWorkTypeColor(opt.value) + '10' } : {}}
                      >
                        <div className="text-3xl mb-2">{opt.icon}</div>
                        <div className="font-medium text-gray-800">{opt.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">设定作业时间</h4>
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />

                  {selectedField && selectedWorkType && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">任务预览</div>
                      <div className="text-sm">
                        <span className="text-gray-500">地块: </span>
                        <span className="font-medium">{fields.find((f) => f.id === selectedField)?.name}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">作业: </span>
                        <span className="font-medium">{getWorkTypeName(selectedWorkType)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-between">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一步
              </button>
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={(step === 1 && !selectedField) || (step === 2 && !selectedWorkType)}
                  className="flex items-center gap-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一步 <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  disabled={!scheduledTime}
                  className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  创建任务
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">确认删除</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-gray-800 font-medium mb-2">确定要删除选中的任务吗？</p>
                <p className="text-sm text-gray-500">
                  您即将删除 <span className="font-bold text-red-600">{selectedTaskIds.length}</span> 个任务，此操作不可撤销。
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">批量更改状态</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                已选中 <span className="font-bold text-blue-600">{selectedTaskIds.length}</span> 个任务，请选择目标状态：
              </p>
              <div className="space-y-2">
                {batchStatusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleBatchUpdateStatus(opt.value)}
                    className="w-full p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all flex items-center gap-3"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: opt.color }}
                    />
                    <span className="font-medium text-gray-800">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
