import React from 'react';
import { Menu, RefreshCw, Sun, Moon, Activity, Wifi, Server, Database } from 'lucide-react';

export default function Header({
  activeTab,
  networkStatus,
  onRefresh,
  theme,
  toggleTheme,
  setIsMobileOpen,
}) {
  const getTabInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Network Overview Dashboard',
          subtitle: 'Real-time telemetry, device distribution & infrastructure health',
        };
      case 'inventory':
        return {
          title: 'Device Inventory Management',
          subtitle: 'Full CRUD registry of all network nodes with search, filter & sort',
        };
      case 'add-device':
        return {
          title: 'Register New Network Device',
          subtitle: 'Add router, switch, server, or host with IPv4 validation checks',
        };
      case 'ipv4-validator':
        return {
          title: 'IPv4 Address Validation & Analyzer',
          subtitle: '32-bit octet verification, Class A-E classification & RFC 1918 scope',
        };
      case 'monitoring':
        return {
          title: 'Live Network Device Monitoring',
          subtitle: 'Active ICMP/socket heartbeat checks, latency tracking & logs',
        };
      case 'activity-logs':
        return {
          title: 'Live Database Activity Logs',
          subtitle: 'Real-time change stream audit of CREATE, UPDATE & DELETE operations in MongoDB Atlas',
        };
      case 'settings':
        return {
          title: 'System & Network Settings',
          subtitle: 'API endpoints, polling frequencies, and application preferences',
        };
      default:
        return {
          title: 'Network Device Inventory',
          subtitle: 'Computer Networks Project Management System',
        };
    }
  };

  const { title, subtitle } = getTabInfo();

  return (
    <header className="sticky top-0 z-30 h-16 bg-navy-900/90 backdrop-blur-md border-b border-navy-800 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Active title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
            {title}
          </h2>
          <p className="hidden md:block text-xs text-slate-400 font-medium">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Heartbeat pills & actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Latency badge */}
        {networkStatus?.responseTime !== null && (
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-navy-950/70 border border-navy-750 rounded-lg text-xs font-mono text-cyan-400">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>{networkStatus.responseTime}ms</span>
          </div>
        )}

        {/* Server & DB status indicators */}
        <div className="hidden xl:flex items-center space-x-2">
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
              networkStatus?.serverOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>API: {networkStatus?.serverOnline ? 'Online' : 'Offline'}</span>
          </div>

          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
              networkStatus?.databaseConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>DB: {networkStatus?.databaseConnected ? 'Connected' : 'Pending'}</span>
          </div>
        </div>

        {/* Manual Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={networkStatus?.isChecking}
          title="Refresh Network Status & Data"
          className="p-2 text-slate-300 hover:text-white bg-navy-850 hover:bg-navy-800 border border-navy-700/60 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${networkStatus?.isChecking ? 'animate-spin text-blue-400' : ''}`}
          />
        </button>

        {/* Light/Dark Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="p-2 text-slate-300 hover:text-white bg-navy-850 hover:bg-navy-800 border border-navy-700/60 rounded-lg transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-blue-400" />
          )}
        </button>
      </div>
    </header>
  );
}
