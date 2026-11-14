import React, { useState, useEffect, useRef } from 'react';
import {
  History,
  Database,
  PlusCircle,
  Edit2,
  Trash2,
  RefreshCw,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  Layers,
  FileText,
  Activity,
  ArrowRightLeft
} from 'lucide-react';

export default function ActivityLogs({ activityLogs = [], onRefresh, isLoading = false }) {
  const [filterAction, setFilterAction] = useState('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const timerRef = useRef(null);

  // Auto-polling for live database changes (polls every 5s while page is open)
  useEffect(() => {
    if (!autoRefresh) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      onRefresh();
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh, onRefresh]);

  const filteredLogs = activityLogs.filter((log) => {
    if (filterAction === 'ALL') return true;
    return (log.actionType || log.action || '').toUpperCase() === filterAction;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="p-6 bg-navy-900 border border-navy-800 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Live MongoDB Atlas Database Change Tracker</h3>
              <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full font-mono">
                Collection: activitylogs
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time audit log of all CREATE, UPDATE, and DELETE mutations executed on MongoDB Atlas.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Polling Indicator */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
              autoRefresh
                ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                : 'bg-navy-950 border-navy-750 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>{autoRefresh ? 'Live Polling Active (5s)' : 'Polling Paused'}</span>
          </button>

          {/* Action Filter */}
          <div className="flex items-center space-x-1.5 bg-navy-950 border border-navy-750 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-navy-900">All Operations</option>
              <option value="CREATE" className="bg-navy-900">CREATE Only</option>
              <option value="UPDATE" className="bg-navy-900">UPDATE Only</option>
              <option value="DELETE" className="bg-navy-900">DELETE Only</option>
            </select>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-750 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh Live Logs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div className="space-y-4">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log, index) => {
            const action = (log.actionType || log.action || 'ACTIVITY').toUpperCase();

            let badgeColor = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
            let icon = <Database className="w-4 h-4" />;

            if (action === 'CREATE') {
              badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
              icon = <PlusCircle className="w-4 h-4 text-emerald-400" />;
            } else if (action === 'UPDATE') {
              badgeColor = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
              icon = <Edit2 className="w-4 h-4 text-amber-400" />;
            } else if (action === 'DELETE') {
              badgeColor = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
              icon = <Trash2 className="w-4 h-4 text-rose-400" />;
            }

            return (
              <div
                key={log._id || index}
                className="p-5 bg-navy-900 border border-navy-800 rounded-2xl shadow-xl hover:border-navy-700 transition-all space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-navy-800">
                  <div className="flex items-center space-x-2.5">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border flex items-center space-x-1.5 ${badgeColor}`}>
                      {icon}
                      <span>{action} DEVICE</span>
                    </span>
                    <span className="text-sm font-bold text-white">
                      Device: {log.deviceName || 'Network Device'}
                    </span>
                    {log.ipv4Address && (
                      <span className="text-xs font-mono text-cyan-300 px-2 py-0.5 bg-navy-950 rounded border border-navy-800">
                        IP: {log.ipv4Address}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
                    <span className="text-[11px] px-2 py-0.5 bg-navy-950 rounded border border-navy-800 text-slate-300">
                      Database: devices collection
                    </span>
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}</span>
                    </span>
                  </div>
                </div>

                {/* Body Details / Diff Comparison */}
                <div className="text-xs space-y-2">
                  {/* Status indicator */}
                  <div className="flex items-center space-x-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Status: <strong className="text-emerald-400">{log.status || 'Saved successfully.'}</strong>
                    </span>
                  </div>

                  {/* UPDATE Before & After Diff Box */}
                  {action === 'UPDATE' && (log.previousData || log.updatedData) && (
                    <div className="mt-3 p-3.5 bg-navy-950 border border-navy-800 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        <span>Changed Fields: {log.changedFields && log.changedFields.length > 0 ? log.changedFields.join(', ') : 'Updated Parameters'}</span>
                        <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                        <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl space-y-1">
                          <span className="text-rose-400 font-bold block mb-1">Previous Data (Before):</span>
                          {log.previousData?.ipv4Address && (
                            <div className="text-rose-200">Old IP: <strong>{log.previousData.ipv4Address}</strong></div>
                          )}
                          {log.previousData?.deviceName && (
                            <div className="text-rose-200">Old Name: {log.previousData.deviceName}</div>
                          )}
                          {log.previousData?.location && (
                            <div className="text-rose-200">Old Location: {log.previousData.location}</div>
                          )}
                          {log.previousData?.status && (
                            <div className="text-rose-200">Old Status: {log.previousData.status}</div>
                          )}
                        </div>

                        <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-1">
                          <span className="text-emerald-400 font-bold block mb-1">Updated Data (After):</span>
                          {log.updatedData?.ipv4Address && (
                            <div className="text-emerald-200">New IP: <strong>{log.updatedData.ipv4Address}</strong></div>
                          )}
                          {log.updatedData?.deviceName && (
                            <div className="text-emerald-200">New Name: {log.updatedData.deviceName}</div>
                          )}
                          {log.updatedData?.location && (
                            <div className="text-emerald-200">New Location: {log.updatedData.location}</div>
                          )}
                          {log.updatedData?.status && (
                            <div className="text-emerald-200">New Status: {log.updatedData.status}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CREATE Details Box */}
                  {action === 'CREATE' && log.updatedData && (
                    <div className="mt-2 p-3 bg-navy-950 border border-navy-800 rounded-xl font-mono text-[11px] text-slate-300 space-y-1">
                      <span className="text-emerald-400 font-bold block mb-1">Inserted Device Details:</span>
                      <div>Device: {log.updatedData.deviceName}</div>
                      <div>IP: {log.updatedData.ipv4Address}</div>
                      <div>Subnet Mask: {log.updatedData.subnetMask || '255.255.255.0'}</div>
                      <div>Location: {log.updatedData.location || 'Server Room'}</div>
                      <div>Type: {log.updatedData.deviceType || 'Router'}</div>
                    </div>
                  )}

                  {/* DELETE Details Box */}
                  {action === 'DELETE' && log.previousData && (
                    <div className="mt-2 p-3 bg-navy-950 border border-navy-800 rounded-xl font-mono text-[11px] text-slate-300 space-y-1">
                      <span className="text-rose-400 font-bold block mb-1">Deleted Device Snapshot:</span>
                      <div>Deleted Node: {log.previousData.deviceName}</div>
                      <div>IPv4 Address: {log.previousData.ipv4Address}</div>
                      <div>Location: {log.previousData.location || 'Server Rack'}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-navy-900 border border-navy-800 rounded-2xl shadow-xl space-y-3">
            <History className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white">No Database Activity Logs Found</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Every device addition, modification, or deletion will automatically persist an audit entry in the MongoDB Atlas <code>activitylogs</code> collection and appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
