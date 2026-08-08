import React, { useState } from 'react';
import {
  ListVideo,
  Play,
  Pause,
  XCircle,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Download,
  Clipboard,
  Sparkles,
} from 'lucide-react';
import { DownloadItem } from '../types';

interface BulkDownloaderProps {
  queue: DownloadItem[];
  onAddBulkUrls: (urls: string[]) => Promise<void>;
  onPauseAll: () => void;
  onResumeAll: () => void;
  onCancelAll: () => void;
  onPauseItem: (id: string) => void;
  onResumeItem: (id: string) => void;
  onCancelItem: (id: string) => void;
  onRetryItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
}

export const BulkDownloader: React.FC<BulkDownloaderProps> = ({
  queue,
  onAddBulkUrls,
  onPauseAll,
  onResumeAll,
  onCancelAll,
  onPauseItem,
  onResumeItem,
  onCancelItem,
  onRetryItem,
  onRemoveItem,
}) => {
  const [bulkInput, setBulkInput] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleProcessBulk = async () => {
    const rawUrls = bulkInput
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 5 && (u.startsWith('http://') || u.startsWith('https://')));

    if (rawUrls.length === 0) return;

    setProcessing(true);
    try {
      await onAddBulkUrls(rawUrls);
      setBulkInput('');
    } finally {
      setProcessing(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setBulkInput((prev) => (prev ? `${prev}\n${text}` : text));
      }
    } catch (err) {
      console.error('Clipboard read error:', err);
    }
  };

  return (
    <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-2.5rem-2rem)] pb-12 bg-[#050505]">
      {/* Input Section */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <ListVideo className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Facebook Bulk Link Downloader</h2>
              <p className="text-xs text-gray-400">
                Paste multiple Facebook video links (one URL per line) to batch process in queue.
              </p>
            </div>
          </div>

          <button
            onClick={handlePasteClipboard}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Clipboard className="w-4 h-4 text-blue-400" />
            <span>Paste Multiple Links</span>
          </button>
        </div>

        <textarea
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          placeholder="https://www.facebook.com/watch/?v=...\nhttps://fb.watch/...\nhttps://www.facebook.com/reel/..."
          rows={5}
          className="w-full p-4 rounded-2xl glass-input text-xs text-white placeholder-gray-500 font-mono resize-none"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-mono">
            {bulkInput.split('\n').filter((l) => l.trim().length > 5).length} URLs Detected
          </span>

          <button
            onClick={handleProcessBulk}
            disabled={processing || !bulkInput.trim()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {processing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                <span>Analyzing Batch Queue...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add All URLs to Queue</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Batch Controls & Queue Table */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">Active Queue ({queue.length})</h3>
            <p className="text-xs text-gray-400">Multi-threaded parallel download engine</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onResumeAll}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume All</span>
            </button>
            <button
              onClick={onPauseAll}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause All</span>
            </button>
            <button
              onClick={onCancelAll}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel All</span>
            </button>
          </div>
        </div>

        {/* Queue Items List */}
        {queue.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs space-y-2">
            <ListVideo className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p>Queue is currently empty.</p>
            <p className="text-gray-500">Paste links above to start downloading in batch mode.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl glass-panel border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3 w-full md:w-1/3">
                  <div className="w-14 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate" title={item.title}>
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span className="font-mono text-blue-300">{item.resolution}</span>
                      <span>•</span>
                      <span className="font-mono text-purple-300">{item.format}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Status */}
                <div className="w-full md:w-1/2 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-300">
                    <span className="capitalize font-semibold text-blue-300">{item.status}</span>
                    <span>{item.progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-900/80 rounded-full h-2 overflow-hidden border border-white/10">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                    <span>{item.speedMBps} MB/s</span>
                    <span>ETA: {item.etaSeconds}s</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`/api/file/download?id=${item.id}&title=${encodeURIComponent(item.title)}&format=${item.format}&path=${encodeURIComponent(item.savePath)}`}
                    download={`${item.title}.${item.format.toLowerCase()}`}
                    className="p-1.5 rounded-lg bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-500/40 cursor-pointer"
                    title="Download File in Chrome Browser"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  {item.status === 'downloading' && (
                    <button
                      onClick={() => onPauseItem(item.id)}
                      className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {item.status === 'paused' && (
                    <button
                      onClick={() => onResumeItem(item.id)}
                      className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {(item.status === 'failed' || item.status === 'cancelled') && (
                    <button
                      onClick={() => onRetryItem(item.id)}
                      className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
