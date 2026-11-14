import React from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Database,
  Globe,
  Clock,
  Shield,
  Laptop,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function Settings({
  networkStatus,
  pollingInterval,
  setPollingInterval,
  theme,
  toggleTheme,
}) {
  const currentApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 bg-navy-900 border border-navy-800 rounded-2xl shadow-xl flex items-center space-x-3.5">
        <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
          <SettingsIcon className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">System & Network Parameters</h3>
          <p className="text-xs text-slate-400 mt-1">
            Configure backend API bindings, real-time polling cadence, and project environment settings.
          </p>
        </div>
      </div>

      {/* Network & Polling Configuration */}
      <div className="p-6 bg-navy-900 border border-navy-800 rounded-2xl shadow-xl space-y-5">
        <h4 className="text-sm font-bold text-white flex items-center space-x-2 pb-2 border-b border-navy-800">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Telemetry & Polling Cadence</span>
        </h4>

        <div className="space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-navy-950 border border-navy-750 rounded-xl">
            <div>
              <span className="font-semibold text-white block">Health-Check Polling Interval</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Frequency at which the frontend pings <code>GET /api/health</code> to measure server uptime and latency.
              </p>
            </div>
            <select
              value={pollingInterval}
              onChange={(e) => setPollingInterval(Number(e.target.value))}
              className="bg-navy-900 border border-navy-700 text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value={5000}>5 Seconds (High Frequency)</option>
              <option value={8000}>8 Seconds (Recommended)</option>
              <option value={15000}>15 Seconds (Normal)</option>
              <option value={30000}>30 Seconds (Low Power)</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-navy-950 border border-navy-750 rounded-xl">
            <div>
              <span className="font-semibold text-white block">Backend REST API Endpoint</span>
              <p className="text-slate-400 text-[11px] mt-0.5">Configured via environment variable <code>VITE_API_URL</code>.</p>
            </div>
            <span className="font-mono text-cyan-300 px-3 py-1 bg-navy-900 border border-navy-800 rounded-lg">
              {currentApiUrl}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-navy-950 border border-navy-750 rounded-xl">
            <div>
              <span className="font-semibold text-white block">Theme Appearance</span>
              <p className="text-slate-400 text-[11px] mt-0.5">Dark Navy Cyber Blue Theme.</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3.5 py-1.5 bg-navy-900 hover:bg-navy-850 border border-navy-700 text-slate-200 rounded-lg font-medium"
            >
              Current: {theme === 'dark' ? 'Dark Navy' : 'Light Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* College Project Specifications */}
      <div className="p-6 bg-navy-900 border border-navy-800 rounded-2xl shadow-xl space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center space-x-2 pb-2 border-b border-navy-800">
          <Info className="w-4 h-4 text-emerald-400" />
          <span>Computer Networks Project Specifications</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-1">
            <span className="text-slate-400 font-semibold block">Addressing Model</span>
            <span className="font-mono text-white">IPv4 (Classful & Classless CIDR)</span>
          </div>
          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-1">
            <span className="text-slate-400 font-semibold block">Client-Server Model</span>
            <span className="font-mono text-white">Three-Tier Web Architecture</span>
          </div>
          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-1">
            <span className="text-slate-400 font-semibold block">Transport / Network Layer</span>
            <span className="font-mono text-white">TCP/IP, ICMP & HTTP/1.1</span>
          </div>
          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-1">
            <span className="text-slate-400 font-semibold block">Storage Engine</span>
            <span className="font-mono text-white">MongoDB Atlas (Mongoose ODM)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
