import React from 'react';
import { AlertCircle, CheckCircle, Clock, Truck, ShieldCheck } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const configs = {
    REPORTED: {
      label: 'Reported',
      bg: 'bg-amber-950/70 border-amber-500/50 text-amber-300',
      dot: 'bg-amber-400 animate-pulse',
      icon: Clock
    },
    VERIFIED: {
      label: 'Verified',
      bg: 'bg-blue-950/70 border-blue-500/50 text-blue-300',
      dot: 'bg-blue-400',
      icon: ShieldCheck
    },
    ASSISTANCE_DISPATCHED: {
      label: 'Assistance On The Way',
      bg: 'bg-orange-950/80 border-orange-500/50 text-orange-300',
      dot: 'bg-orange-400 animate-ping',
      icon: Truck
    },
    HELP_REACHED: {
      label: 'Help Reached',
      bg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
      dot: 'bg-emerald-400',
      icon: CheckCircle
    },
    CLOSED: {
      label: 'Resolved & Closed',
      bg: 'bg-slate-800 border-slate-700 text-slate-300',
      dot: 'bg-slate-500',
      icon: CheckCircle
    }
  };

  const config = configs[status] || configs.REPORTED;
  const Icon = config.icon;

  const sizeClasses = size === 'lg' 
    ? 'px-3 py-1.5 text-sm gap-2' 
    : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${sizeClasses}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
      <span>{config.label}</span>
    </span>
  );
}

export function PriorityBadge({ priority, score }) {
  const styles = {
    CRITICAL: 'bg-rose-950/80 border-rose-500 text-rose-300',
    HIGH: 'bg-orange-950/80 border-orange-500 text-orange-300',
    MEDIUM: 'bg-amber-950/80 border-amber-500 text-amber-300',
    LOW: 'bg-slate-800 border-slate-600 text-slate-300'
  };

  const style = styles[priority] || styles.MEDIUM;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{priority}</span>
      {score !== undefined && <span className="opacity-75 font-mono">({score})</span>}
    </span>
  );
}
