import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full select-none">
      {toasts.map((toast) => {
        let borderClass = 'border-blue-500/40 bg-blue-950/80 text-blue-200';
        let Icon = Info;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200';
          Icon = CheckCircle2;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/40 bg-amber-950/80 text-amber-200';
          Icon = AlertTriangle;
        } else if (toast.type === 'error') {
          borderClass = 'border-red-500/40 bg-red-950/80 text-red-200';
          Icon = XCircle;
        }

        return (
          <div
            key={toast.id}
            className={`p-4 rounded-2xl glass-panel border ${borderClass} shadow-2xl flex items-start justify-between gap-3 animate-fade-in backdrop-blur-xl`}
          >
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-white mb-0.5">{toast.title}</h5>
                <p className="text-[11px] text-gray-300 leading-snug">{toast.message}</p>
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
