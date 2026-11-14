import React, { useMemo } from 'react';
import {
  Server,
  Wifi,
  WifiOff,
  AlertTriangle,
  Activity,
  Database,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard({
  devices = [],
  activityLogs = [],
  networkStatus,
  onNavigate,
}) {
  // Compute summary metrics
  const stats = useMemo(() => {
    const total = devices.length;
    const online = devices.filter((d) => (d.status || '').toLowerCase() === 'online').length;
    const offline = devices.filter((d) => (d.status || '').toLowerCase() === 'offline').length;
    const invalid = devices.filter((d) => (d.status || '').toLowerCase() === 'invalid' || d.isInvalidIp).length;

    return { total, online, offline, invalid };
  }, [devices]);

  // Data for Status Distribution Donut Chart
  const statusChartData = useMemo(() => {
    const online = stats.online;
    const offline = stats.offline;
    const others = stats.total - (online + offline);

    const data = [
      { name: 'Online', value: online, color: '#10b981' },
      { name: 'Offline', value: offline, color: '#f43f5e' },
    ];
    if (others > 0) {
      data.push({ name: 'Pending / Other', value: others, color: '#f59e0b' });
    }
    // If empty, supply placeholder so chart renders neatly
    if (stats.total === 0) {
      return [{ name: 'No Devices Registered', value: 1, color: '#334155' }];
    }
    return data;
  }, [stats]);

  // Data for Device Type Distribution Bar Chart
  const typeChartData = useMemo(() => {
    const counts = {
      Router: 0,
      Switch: 0,
      Server: 0,
      Computer: 0,
      Printer: 0,
      Other: 0,
    };

    devices.forEach((d) => {
      const type = d.deviceType || 'Other';
      if (counts[type] !== undefined) {
        counts[type]++;
      } else {
        counts.Other++;
      }
    });

    return Object.keys(counts).map((key) => ({
      name: key,
      count: counts[key],
    }));
  }, [devices]);

  // Format uptime
  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Infrastructure Telemetry Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-navy-750 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Three-Tier Architecture Health</h3>
                <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full font-mono">
                  Live CN Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Client (Vite React) ↔ Backend (Express REST) ↔ Database (MongoDB Atlas)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Client Status */}
            <div className="p-2.5 bg-navy-950/80 border border-navy-800 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Client</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className={`w-2 h-2 rounded-full ${networkStatus?.clientConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span className="text-xs font-bold text-white">
                  {networkStatus?.clientConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                {networkStatus?.lastSuccessful
                  ? `Sync: ${new Date(networkStatus.lastSuccessful).toLocaleTimeString()}`
                  : 'No Sync'}
              </span>
            </div>

            {/* Server Status */}
            <div className="p-2.5 bg-navy-950/80 border border-navy-800 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Server</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className={`w-2 h-2 rounded-full ${networkStatus?.serverOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span className="text-xs font-bold text-white">
                  {networkStatus?.serverOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Database Status */}
            <div className="p-2.5 bg-navy-950/80 border border-navy-800 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">MongoDB</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className={`w-2 h-2 rounded-full ${networkStatus?.databaseConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className="text-xs font-bold text-white">
                  {networkStatus?.databaseConnected ? 'Connected' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Response Time & Uptime */}
            <div className="p-2.5 bg-navy-950/80 border border-navy-800 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Latency / Uptime</span>
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mt-1 font-mono">
                <span>{networkStatus?.responseTime ?? '--'}ms</span>
                <span className="text-[10px] text-slate-400">{formatUptime(networkStatus?.uptime)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Devices */}
        <div className="p-5 bg-navy-900 border border-navy-800 rounded-2xl shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Devices</span>
            <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{stats.total}</span>
            <span className="text-xs text-slate-400">nodes indexed</span>
          </div>
          <div className="mt-3 flex items-center text-xs text-blue-400 hover:text-blue-300 cursor-pointer" onClick={() => onNavigate('inventory')}>
            <span>Manage inventory</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Online Devices */}
        <div className="p-5 bg-navy-900 border border-navy-800 rounded-2xl shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Online Devices</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <Wifi className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">{stats.online}</span>
            <span className="text-xs text-slate-400">
              {stats.total > 0 ? `${Math.round((stats.online / stats.total) * 100)}% available` : '0%'}
            </span>
          </div>
          <div className="mt-3 flex items-center text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer" onClick={() => onNavigate('monitoring')}>
            <span>Live monitoring</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Offline Devices */}
        <div className="p-5 bg-navy-900 border border-navy-800 rounded-2xl shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Offline Devices</span>
            <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/20">
              <WifiOff className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-rose-400 font-mono">{stats.offline}</span>
            <span className="text-xs text-slate-400">unreachable nodes</span>
          </div>
          <div className="mt-3 flex items-center text-xs text-rose-400 hover:text-rose-300 cursor-pointer" onClick={() => onNavigate('monitoring')}>
            <span>Diagnose connection</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Invalid IPv4 Addresses */}
        <div className="p-5 bg-navy-900 border border-navy-800 rounded-2xl shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Invalid IPv4 Flagged</span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">{stats.invalid}</span>
            <span className="text-xs text-slate-400">validation warnings</span>
          </div>
          <div className="mt-3 flex items-center text-xs text-amber-400 hover:text-amber-300 cursor-pointer" onClick={() => onNavigate('ipv4-validator')}>
            <span>Test IPv4 rules</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Donut Chart */}
        <div className="p-5 bg-navy-900 border border-navy-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-navy-800">
            <div>
              <h3 className="text-sm font-bold text-white">Device Status Distribution</h3>
              <p className="text-xs text-slate-400">Operational state of all registered nodes</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{stats.total} total</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0b132b" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b132b',
                    borderColor: '#233256',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span className="text-xs text-slate-300">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Type Distribution Bar Chart */}
        <div className="p-5 bg-navy-900 border border-navy-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-navy-800">
            <div>
              <h3 className="text-sm font-bold text-white">Device Type Breakdown</h3>
              <p className="text-xs text-slate-400">Distribution across network hardware categories</p>
            </div>
            <span className="text-xs text-blue-400 font-mono">6 Hardware Types</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b132b',
                    borderColor: '#233256',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Device Activity & Quick Network Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed (2 Cols) */}
        <div className="lg:col-span-2 p-5 bg-navy-900 border border-navy-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Recent Database Activity</h3>
            </div>
            <button
              onClick={() => onNavigate('activity-logs')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
            >
              <span>View full audit log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activityLogs && activityLogs.length > 0 ? (
            <div className="space-y-3">
              {activityLogs.slice(0, 5).map((log, idx) => {
                const action = (log.actionType || log.action || 'ACTIVITY').toUpperCase();
                let badgeClass = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                if (action === 'CREATE') badgeClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                if (action === 'UPDATE') badgeClass = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                if (action === 'DELETE') badgeClass = 'bg-rose-500/20 text-rose-400 border-rose-500/30';

                return (
                  <div
                    key={log._id || idx}
                    className="p-3 bg-navy-850/80 rounded-xl border border-navy-750 flex items-start justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${badgeClass}`}>
                          {action}
                        </span>
                        <span className="font-semibold text-white">
                          {log.deviceName || 'Network Device'}
                        </span>
                        {log.ipv4Address && (
                          <span className="text-slate-400 font-mono">({log.ipv4Address})</span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        {log.details || `Operation executed on MongoDB Atlas collection`}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-500 shrink-0 font-mono">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 space-y-2">
              <Database className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm">No activity logs recorded yet in MongoDB Atlas.</p>
              <p className="text-xs text-slate-400">
                Any CREATE, UPDATE, or DELETE on devices will automatically generate visible audit logs here.
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions & Shortcuts (1 Col) */}
        <div className="p-5 bg-navy-900 border border-navy-800 rounded-2xl shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-navy-800">
            Quick Network Actions
          </h3>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('add-device')}
              className="w-full p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg shadow-blue-600/20 transition-all"
            >
              <div className="flex items-center space-x-2.5">
                <PlusCircle className="w-4 h-4" />
                <span>Register New Device</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('ipv4-validator')}
              className="w-full p-3 bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700/80 rounded-xl text-xs font-semibold flex items-center justify-between transition-all"
            >
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Validate IPv4 Address</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('monitoring')}
              className="w-full p-3 bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700/80 rounded-xl text-xs font-semibold flex items-center justify-between transition-all"
            >
              <div className="flex items-center space-x-2.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Run Network Node Ping</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="pt-3 border-t border-navy-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between">
              <span>Addressing Standard</span>
              <span className="font-mono text-slate-200">IPv4 (32-bit)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Database Backend</span>
              <span className="font-mono text-slate-200">MongoDB Atlas</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Protocol Stack</span>
              <span className="font-mono text-slate-200">TCP/IP & HTTP REST</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
