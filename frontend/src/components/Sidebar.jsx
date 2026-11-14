import React from 'react';
import {
  LayoutDashboard,
  Server,
  PlusCircle,
  ShieldCheck,
  Activity,
  History,
  Settings,
  Radio,
  Database,
  Wifi,
  ChevronRight,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, networkStatus, isMobileOpen, setIsMobileOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Device Inventory', icon: Server },
    { id: 'add-device', label: 'Add Device', icon: PlusCircle },
    { id: 'ipv4-validator', label: 'IPv4 Validator', icon: ShieldCheck, badge: 'Key CN' },
    { id: 'monitoring', label: 'Network Monitoring', icon: Activity },
    { id: 'activity-logs', label: 'Activity Logs', icon: History, badge: 'Live DB' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-navy-900 border-r border-navy-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 px-6 border-b border-navy-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
                NetInventory
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded font-mono">
                  IPv4
                </span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium">CN Project Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Management & Monitoring
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-300 hover:text-white hover:bg-navy-800/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-navy-800 text-slate-300 border border-navy-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Real-time Connection Status Footer */}
        <div className="p-4 border-t border-navy-800 bg-navy-950/40">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Connection Health</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="space-y-2 text-xs">
            {/* Client Status */}
            <div className="flex flex-col px-2.5 py-1.5 bg-navy-850/80 rounded-lg border border-navy-750">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Wifi className="w-3.5 h-3.5 text-blue-400" />
                  <span>Client App</span>
                </div>
                <span
                  className={`font-semibold flex items-center gap-1 ${
                    networkStatus?.clientConnected ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      networkStatus?.clientConnected ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                  />
                  {networkStatus?.clientConnected ? 'Connected' : 'Offline'}
                </span>
              </div>
              {networkStatus?.lastSuccessful && (
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 pl-5.5">
                  Last Sync: {new Date(networkStatus.lastSuccessful).toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Server Status */}
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-navy-850/80 rounded-lg border border-navy-750">
              <div className="flex items-center space-x-2 text-slate-300">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>Express API</span>
              </div>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  networkStatus?.serverOnline ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    networkStatus?.serverOnline ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                {networkStatus?.serverOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* MongoDB Atlas Status */}
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-navy-850/80 rounded-lg border border-navy-750">
              <div className="flex items-center space-x-2 text-slate-300">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>MongoDB Atlas</span>
              </div>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  networkStatus?.databaseConnected ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    networkStatus?.databaseConnected ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                {networkStatus?.databaseConnected ? 'Connected' : 'Connecting'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
