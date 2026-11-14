import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Play,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Clock,
  RefreshCw,
  Server,
  Zap,
  Info,
  Timer,
  Pause
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function NetworkMonitoring({
  devices = [],
  monitoringLogs = [],
  onPingDevice,
  onPingAll,
  isPinging = false,
}) {
  const [filterResult, setFilterResult] = useState('ALL');
  const [autoPoll, setAutoPoll] = useState(false);
  const [pollIntervalSec, setPollIntervalSec] = useState(20);
  const [countdown, setCountdown] = useState(20);
  const timerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // Auto-polling effect with guaranteed cleanup on unmount
  useEffect(() => {
    if (!autoPoll || devices.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      return;
    }

    setCountdown(pollIntervalSec);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : pollIntervalSec));
    }, 1000);

    timerRef.current = setInterval(() => {
      onPingAll();
    }, pollIntervalSec * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [autoPoll, pollIntervalSec, devices.length, onPingAll]);

  const filteredLogs = monitoringLogs.filter((log) => {
    if (filterResult === 'ALL') return true;
    return (log.status || '').toUpperCase() === filterResult;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Banner */}
      <div className="p-6 bg-navy-900 border border-navy-800 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-emerald-600/20 border border-emerald-500/40 rounded-xl text-emerald-400">
            <Activity className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Network Availability & Node Ping Engine</h3>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-mono">
                TCP / Socket Probes
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Verify real connectivity across your subnet nodes. Each probe latency is stored in MongoDB Atlas.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Auto-Poll Toggle */}
          <button
            onClick={() => setAutoPoll(!autoPoll)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
              autoPoll
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                : 'bg-navy-950 border-navy-750 text-slate-400 hover:text-white'
            }`}
          >
            {autoPoll ? (
              <>
                <Timer className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>Auto-Polling ({countdown}s)</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start Auto-Polling</span>
              </>
            )}
          </button>

          {/* Manual Ping Sweep */}
          <button
            onClick={onPingAll}
            disabled={isPinging || devices.length === 0}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-600/25 disabled:opacity-50 transition-all"
          >
            <Play className={`w-4 h-4 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? 'Probing All Nodes...' : 'Ping All Devices'}</span>
          </button>
        </div>
      </div>

      {/* Distinction Disclaimer Banner */}
      <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center space-x-2.5 text-xs text-blue-300">
        <Info className="w-4 h-4 text-blue-400 shrink-0" />
        <span>
          <strong>Monitoring Accuracy Rule:</strong> Devices are marked as <em>Unknown</em> until a real probe check has executed. Actual network responses are recorded with their latency timestamps and probe method (e.g. <code>TCP_HANDSHAKE_ESTABLISHED</code> or <code>TCP_RST_HOST_RESPONDED</code>).
        </span>
      </div>

      {/* Grid: Monitored Nodes List (Left 2 cols) & Live Probe Log (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monitored Nodes (2 cols) */}
        <div className="lg:col-span-2 bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-navy-800">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Configured Network Nodes ({devices.length})</span>
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              {autoPoll ? `Auto-refreshing every ${pollIntervalSec}s` : 'Manual on-demand check'}
            </span>
          </div>

          <div className="space-y-2.5">
            {devices.length > 0 ? (
              devices.map((dev) => (
                <div
                  key={dev._id || dev.id}
                  className="p-3.5 bg-navy-950/80 rounded-xl border border-navy-800 flex items-center justify-between hover:border-navy-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-navy-900 border border-navy-800 text-slate-300">
                      <Server className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{dev.deviceName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-navy-800 text-slate-400 rounded border border-navy-700">
                          {dev.deviceType || 'Node'}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-cyan-300 mt-0.5">
                        {dev.ipv4Address}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right hidden sm:block">
                      <StatusBadge status={dev.status} />
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {dev.lastPing ? `Checked: ${new Date(dev.lastPing).toLocaleTimeString()}` : 'Unchecked (Unknown)'}
                      </div>
                    </div>

                    <button
                      onClick={() => onPingDevice(dev._id || dev.id)}
                      disabled={isPinging}
                      className="px-3 py-1.5 bg-navy-850 hover:bg-navy-800 text-emerald-300 border border-navy-700/80 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Check</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-slate-500 text-xs">
                No devices configured in inventory yet. Add devices to start monitoring.
              </div>
            )}
          </div>
        </div>

        {/* Live Probe History (1 col) */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-navy-800">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Probe Telemetry Logs</span>
            </h4>
            <span className="text-xs font-mono text-slate-400">{monitoringLogs.length} entries</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {monitoringLogs.length > 0 ? (
              monitoringLogs.map((log, idx) => {
                const isOnline = (log.status || '').toLowerCase() === 'online';
                const method = log.checkMethod || 'TCP_SOCKET';
                return (
                  <div
                    key={log._id || idx}
                    className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-200">
                        {log.ipv4Address || '192.168.1.1'}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          isOnline
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {isOnline ? 'RESPONDED' : 'UNREACHABLE'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono text-cyan-300">
                        {log.responseTime !== null ? `${log.responseTime}ms` : 'Timeout'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-navy-900 text-slate-400 rounded border border-navy-850 font-mono">
                        {method}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono text-right">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Just now'}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                <Activity className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p>No ping records yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Click "Ping All Devices" or "Check" on any node to execute an active probe.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
