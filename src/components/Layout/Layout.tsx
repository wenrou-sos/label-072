import { useState } from 'react';
import { Map, ListTodo, BarChart3, Menu, X, Leaf } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: typeof Map;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: '调度面板', icon: Map },
  { id: 'tasks', label: '任务管理', icon: ListTodo },
  { id: 'statistics', label: '数据统计', icon: BarChart3 },
];

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onPageChange: (page: string) => void;
}

export const Layout = ({ children, activePage, onPageChange }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside
        className={`bg-gradient-to-b from-green-800 to-green-900 text-white transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        <div className="p-4 flex items-center gap-3 border-b border-green-700">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Leaf className="w-6 h-6" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="font-bold text-lg">农机调度</h1>
              <p className="text-xs text-green-300">智慧农业管理系统</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white bg-opacity-20 text-white font-medium'
                    : 'text-green-200 hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-green-700">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-green-300 hover:bg-white hover:bg-opacity-10 transition-colors"
          >
            {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {navItems.find((n) => n.id === activePage)?.label}
            </h2>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-800">调度员</div>
              <div className="text-xs text-gray-500">管理员</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-medium">
              调
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
};
