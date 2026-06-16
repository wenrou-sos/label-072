import { useState } from 'react';
import { useAppStore } from '../../store/useStore';
import { getWorkTypeName, getWorkTypeColor, getStatusName, getStatusColor, formatArea } from '../../utils/format';
import type { WorkType, TaskStatus } from '../../types';
import { Plus, X, MapPin, Wrench, Clock, CheckCircle, ArrowRight } from 'lucide-react';

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

export const TaskPanel = () => {
  const { tasks, fields, machines, createTask, setShowTaskModal, showTaskModal } = useAppStore();
  const [activeTab, setActiveTab] = useState<TaskStatus | 'all'>('all');
  const [step, setStep] = useState(1);
  const [selectedField, setSelectedField] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState<WorkType | ''>('');
  const [scheduledTime, setScheduledTime] = useState('');

  const filteredTasks = activeTab === 'all'
    ? tasks
    : tasks.filter((t) => t.status === activeTab);

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
      <div className="h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">任务管理</h2>
          <button
            onClick={() => setShowTaskModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建任务
          </button>
        </div>

        <div className="px-4 py-2 border-b border-gray-100 flex gap-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
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
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
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
                <button className="mt-2 w-full py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors">
                  模拟接单
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
    </>
  );
};
