import React, { useState } from 'react';
import {
  History,
  Search,
  Trash2,
  Download,
  Folder,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Film,
} from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryViewProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  globalSearchQuery?: string;
  onRedownloadUrl: (url: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  globalSearchQuery = '',
  onRedownloadUrl,
}) => {
  const [searchTerm, setSearchTerm] = useState(globalSearchQuery);
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredHistory = history.filter((item) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.platform.toLowerCase().includes(query) ||
      item.resolution.toLowerCase().includes(query) ||
      item.fileName.toLowerCase().includes(query);

    const matchesPlatform =
      platformFilter === 'all' || item.platform.toLowerCase() === platformFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Date', 'Title', 'Platform', 'Resolution', 'Format', 'Size (MB)', 'Status', 'File Path'];
    const rows = history.map((item) => [
      item.date,
      `"${item.title.replace(/"/g, '""')}"`,
      item.platform,
      item.resolution,
      item.format,
      item.sizeMB,
      item.status,
      `"${item.savePath.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AbdulHadi_Download_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    if (history.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AbdulHadi_Download_History_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-2.5rem-2rem)] pb-12 bg-[#050505]">
      {/* Search & Export Header */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Persistent Download History</h2>
              <p className="text-xs text-gray-400">
                Search, filter, open, or export logs of all completed and past downloads.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={exportCSV}
              disabled={history.length === 0}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={exportJSON}
              disabled={history.length === 0}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
            >
              <FileJson className="w-3.5 h-3.5 text-blue-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={onClearHistory}
              disabled={history.length === 0}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, resolution, platform..."
              className="w-full h-10 pl-9 pr-3 rounded-xl glass-input text-xs text-white"
            />
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="h-10 px-3 rounded-xl glass-input text-xs text-white"
          >
            <option value="all">All Platforms</option>
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">X / Twitter</option>
            <option value="vimeo">Vimeo</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl glass-input text-xs text-white"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl overflow-x-auto">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs space-y-2">
            <History className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p>No download history found.</p>
            <p className="text-gray-500">Completed video and audio downloads will appear here.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 font-mono text-[11px] uppercase">
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Title</th>
                <th className="py-3 px-2">Platform</th>
                <th className="py-3 px-2">Quality</th>
                <th className="py-3 px-2">Size</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2 font-mono text-gray-400 text-[11px]">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2 font-semibold text-white max-w-xs truncate" title={item.title}>
                    {item.title}
                  </td>
                  <td className="py-3 px-2 capitalize font-mono text-blue-300">
                    {item.platform}
                  </td>
                  <td className="py-3 px-2 font-mono text-purple-300">
                    {item.resolution} ({item.format})
                  </td>
                  <td className="py-3 px-2 font-mono text-gray-300">
                    {item.sizeMB} MB
                  </td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/api/file/download?id=${item.id}&title=${encodeURIComponent(item.title)}&format=${item.format}&path=${encodeURIComponent(item.savePath)}`}
                        download={`${item.title}.${item.format.toLowerCase()}`}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 cursor-pointer flex items-center gap-1 font-semibold text-[11px]"
                        title="Download File in Chrome"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Chrome Download</span>
                      </a>
                      <button
                        onClick={() => onRedownloadUrl(item.url)}
                        className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 cursor-pointer"
                        title="Redownload URL"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
