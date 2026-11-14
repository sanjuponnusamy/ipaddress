import React from 'react';

export default function StatusBadge({ status, size = 'sm' }) {
  const norm = (status || '').toLowerCase();

  let colors = 'bg-slate-700/50 text-slate-300 border-slate-600/50';
  let dotColor = 'bg-slate-400';
  let label = 'Unknown';

  if (norm === 'online' || norm === 'connected' || norm === 'active') {
    colors = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    dotColor = 'bg-emerald-400 animate-pulse';
    label = 'Online';
  } else if (norm === 'offline' || norm === 'disconnected') {
    colors = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    dotColor = 'bg-rose-400';
    label = 'Offline';
  } else if (norm === 'warning' || norm === 'degraded') {
    colors = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    dotColor = 'bg-amber-400 animate-ping';
    label = 'Warning';
  } else if (norm === 'invalid') {
    colors = 'bg-rose-900/30 text-rose-300 border-rose-600/50';
    dotColor = 'bg-rose-500';
    label = 'Invalid IP';
  }

  const sizeClasses = size === 'xs' 
    ? 'text-[10px] px-2 py-0.5' 
    : size === 'lg' 
    ? 'text-sm px-3.5 py-1.5' 
    : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${colors} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
}
