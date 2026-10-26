import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmResetModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmResetModal: React.FC<ConfirmResetModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  const [confirmationText, setConfirmationText] = useState('');

  if (!isOpen) return null;

  const isConfirmed = confirmationText.trim().toUpperCase() === 'RESET';

  return (
    <div className="fixed inset-0 z-50 bg-charcoal-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-charcoal-900 border border-rose-800/60 rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center gap-3 text-rose-400 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-950 flex items-center justify-center border border-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-charcoal-100">Destructive Profile Reset</h2>
            <p className="text-xs text-rose-300">Permanent and non-reversible action</p>
          </div>
        </div>

        <p className="text-xs text-charcoal-300 mb-4 leading-relaxed">
          This will permanently wipe all local profile data, saved games, lesson progress, tactical ratings, and mistake archives from your local disk.
        </p>

        <div className="mb-4">
          <label className="block text-[11px] font-mono text-charcoal-400 mb-1">
            Type <span className="font-bold text-rose-400">RESET</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            className="w-full bg-charcoal-800 border border-charcoal-700 rounded px-3 py-2 text-charcoal-100 font-mono text-xs focus:outline-none focus:border-rose-500"
            placeholder="Type RESET"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isConfirmed}
            className="px-4 py-2 rounded bg-rose-700 hover:bg-rose-600 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
