import React, { useState } from 'react';
import {
  Terminal,
  Trash2,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  FileText,
} from 'lucide-react';
import { AppLog } from '../types';

interface LogsViewProps {
  logs: AppLog[];
  onClearLogs: () => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ logs, onClearLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = logTypeFilter === 'all' || log.type === logTypeFilter;

    return matchesSearch && matchesType;
  });

  const exportLogs = () => {
    if (logs.length === 0) return;
    const textContent = logs
      .map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message} ${l.details ? ':: ' + l.details : ''}`)
      .join('\n');

    const element = document.createElement('a');
    const file = new Blob([textContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `AbdulHadi_AppLogs_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getTypeBadge = (type: AppLog['type']) => {
    switch (type) {
      case 'success':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase font-mono">SUCCESS</span>;
      case 'error':
        return <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold uppercase font-mono">ERROR</span>;
      case 'warn':
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase font-mono">WARN</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase font-mono">INFO</span>;
    }
  };

  return (
    <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-2.5rem-2rem)] pb-12 bg-[#050505]">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">System Logs & Diagnostics</h2>
              <p className="text-xs text-gray-400">
                Real-time operational events, network status, engine threads, and error traces.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportLogs}
              disabled={logs.length === 0}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Export Log File</span>
            </button>

            <button
              onClick={onClearLogs}
              disabled={logs.length === 0}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Console</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs message or trace..."
              className="w-full h-10 pl-9 pr-3 rounded-xl glass-input text-xs text-white"
            />
          </div>

          <select
            value={logTypeFilter}
            onChange={(e) => setLogTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-xl glass-input text-xs text-white"
          >
            <option value="all">All Event Levels</option>
            <option value="info">INFO</option>
            <option value="success">SUCCESS</option>
            <option value="warn">WARN</option>
            <option value="error">ERROR</option>
          </select>
        </div>
      </div>

      {/* Terminal View Container */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl bg-black/80 font-mono text-xs overflow-y-auto max-h-[500px]">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs">
            No system log entries to display.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-1 border-b border-white/5 leading-relaxed">
                <span className="text-gray-500 text-[10px] shrink-0 pt-0.5">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <div className="shrink-0">{getTypeBadge(log.type)}</div>
                <div className="flex-1">
                  <span className="text-gray-200">{log.message}</span>
                  {log.details && (
                    <span className="text-gray-400 text-[11px] block mt-0.5 font-mono">
                      → {log.details}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
