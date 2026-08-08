import React, { useState } from 'react';
import {
  Layers,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  Download,
  Filter,
  Check,
  Video,
} from 'lucide-react';
import { PlaylistInfo, PlaylistItem } from '../types';

interface PlaylistModalProps {
  onAnalyzePlaylist: (url: string) => Promise<PlaylistInfo | null>;
  onEnqueueItems: (items: PlaylistItem[]) => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  onAnalyzePlaylist,
  onEnqueueItems,
}) => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [playlistData, setPlaylistData] = useState<PlaylistInfo | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl.trim()) return;
    setAnalyzing(true);
    setPlaylistData(null);
    try {
      const res = await onAnalyzePlaylist(playlistUrl.trim());
      if (res) {
        setPlaylistData(res);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleItemSelect = (id: string) => {
    if (!playlistData) return;
    const updated = playlistData.items.map((item) =>
      item.id === id ? { ...item, selected: !item.selected } : item
    );
    setPlaylistData({ ...playlistData, items: updated });
  };

  const setRangeSelect = (startIdx: number, endIdx: number, selectedState: boolean) => {
    if (!playlistData) return;
    const updated = playlistData.items.map((item, idx) =>
      idx >= startIdx && idx <= endIdx ? { ...item, selected: selectedState } : item
    );
    setPlaylistData({ ...playlistData, items: updated });
  };

  const handleSelectAll = (state: boolean) => {
    if (!playlistData) return;
    const updated = playlistData.items.map((item) => ({ ...item, selected: state }));
    setPlaylistData({ ...playlistData, items: updated });
  };

  const selectedCount = playlistData?.items.filter((i) => i.selected).length || 0;
  const selectedTotalSizeMB = playlistData?.items
    .filter((i) => i.selected)
    .reduce((acc, curr) => acc + curr.estimatedSizeMB, 0)
    .toFixed(1);

  const handleEnqueue = () => {
    if (!playlistData) return;
    const selected = playlistData.items.filter((i) => i.selected);
    onEnqueueItems(selected);
  };

  return (
    <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-2.5rem-2rem)] pb-12 bg-[#050505]">
      {/* Search Input Card */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">FB Watch & Series Collection Analyzer</h2>
            <p className="text-xs text-gray-400">
              Analyze Facebook Watch series, show playlists, or video collection links to selectively download items.
            </p>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            placeholder="https://www.facebook.com/watch/... or Facebook collection link"
            className="flex-1 h-12 px-4 rounded-2xl glass-input text-sm text-white placeholder-gray-400"
          />

          <button
            type="submit"
            disabled={analyzing || !playlistUrl.trim()}
            className="h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                <span>Parsing Playlist...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analyze Playlist</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Playlist Items & Range Selectors */}
      {playlistData && (
        <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-6 shadow-2xl animate-fade-in">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">{playlistData.title}</h3>
              <p className="text-xs text-gray-400">By {playlistData.uploader}</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-gray-300">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                {playlistData.totalVideos} Videos Total
              </span>
              <span className="text-purple-300">
                Est. {playlistData.estimatedTotalSizeMB} MB
              </span>
            </div>
          </div>

          {/* Quick Range Selector Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Range Select:
              </span>
              <button
                type="button"
                onClick={() => setRangeSelect(0, 9, true)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-mono cursor-pointer"
              >
                Videos 1 - 10
              </button>
              <button
                type="button"
                onClick={() => setRangeSelect(10, 19, true)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-mono cursor-pointer"
              >
                Videos 11 - 20
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-semibold hover:bg-blue-500/30 cursor-pointer"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="px-3 py-1 rounded-lg bg-gray-500/20 text-gray-300 text-xs font-semibold hover:bg-gray-500/30 cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Items Checkbox List */}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {playlistData.items.map((item, index) => (
              <div
                key={item.id}
                onClick={() => toggleItemSelect(item.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  item.selected
                    ? 'bg-blue-900/30 border-blue-500/50 text-white'
                    : 'bg-slate-900/30 border-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.selected ? (
                    <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-500 shrink-0" />
                  )}
                  <span className="text-xs font-mono text-gray-400 w-6">#{index + 1}</span>
                  <div className="w-12 h-8 rounded overflow-hidden border border-white/10 shrink-0">
                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-medium line-clamp-1">{item.title}</span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  <span className="text-gray-400">{item.durationFormatted}</span>
                  <span className="text-purple-300">{item.estimatedSizeMB} MB</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Enqueue Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="text-xs text-gray-300 font-mono">
              Selected: <span className="font-bold text-blue-400">{selectedCount} Items</span> (~{selectedTotalSizeMB} MB)
            </div>

            <button
              onClick={handleEnqueue}
              disabled={selectedCount === 0}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Enqueue Selected {selectedCount} Videos</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
