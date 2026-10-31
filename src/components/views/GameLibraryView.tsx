import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { ChessGameController } from '../../services/chessEngine';
import { GameSummary } from '../../types/chess';
import { FolderArchive, Upload, Download, Search, Trash2, ArrowRight } from 'lucide-react';

interface GameLibraryViewProps {
  onSelectGameForAnalysis: (game: GameSummary) => void;
}

export const GameLibraryView: React.FC<GameLibraryViewProps> = ({ onSelectGameForAnalysis }) => {
  const [games, setGames] = useState<GameSummary[]>(() => StorageService.getGames());
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState<'all' | '1-0' | '0-1' | '1/2-1/2'>('all');
  const [pgnImportText, setPgnImportText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importError, setImportError] = useState('');

  const filteredGames = games.filter((g) => {
    const matchesSearch =
      g.whiteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.blackName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.timeControl.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesResult = resultFilter === 'all' || g.result === resultFilter;
    return matchesSearch && matchesResult;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.deleteGame(id);
    setGames(StorageService.getGames());
  };

  const handleExportPgn = (game: GameSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([game.pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.whiteName}_vs_${game.blackName}_${Date.now()}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pgnImportText.trim()) return;

    try {
      const c = new ChessGameController();
      const success = c.loadPgn(pgnImportText);
      if (!success) {
        setImportError('Invalid PGN format or illegal move sequence detected.');
        return;
      }

      const history = c.getHistory();
      const importedGame: GameSummary = {
        id: 'game_imported_' + Date.now(),
        whiteName: 'Imported White',
        blackName: 'Imported Black',
        whiteColor: 'user',
        blackColor: 'computer',
        result: '*',
        terminationReason: 'agreement',
        timeControl: 'Imported',
        initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        pgn: pgnImportText,
        moves: history,
        playedAt: new Date().toISOString(),
      };

      StorageService.saveGame(importedGame);
      setGames(StorageService.getGames());
      setShowImportModal(false);
      setPgnImportText('');
      setImportError('');
    } catch (err: unknown) {
      setImportError('Failed to parse PGN: ' + (err as Error).message);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 gap-4 max-w-[1400px] mx-auto w-full text-xs font-sans">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-[#111722] border border-[#1b2536] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#14231b] border border-emerald-800/50 flex items-center justify-center text-emerald-400">
            <FolderArchive className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-100">Local Game Library</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {games.length} stored games on your private disk. Complete PGN export and import.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 bg-[#141c28] hover:bg-[#1a2434] text-slate-100 font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-colors border border-[#202b3c] text-xs"
        >
          <Upload className="w-3.5 h-3.5 text-emerald-400" />
          <span>Import PGN</span>
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by player or time control..."
            className="w-full bg-[#111722] border border-[#1b2536] rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value as 'all' | '1-0' | '0-1' | '1/2-1/2')}
          className="bg-[#111722] border border-[#1b2536] rounded-xl px-4 py-2 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Results</option>
          <option value="1-0">1-0 (White Win)</option>
          <option value="0-1">0-1 (Black Win)</option>
          <option value="1/2-1/2">½-½ (Draw)</option>
        </select>
      </div>

      {/* Games List */}
      <div className="flex-1 bg-[#111722] border border-[#1b2536] rounded-2xl overflow-hidden flex flex-col shadow-sm">
        {filteredGames.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 italic">
            No games found matching your search.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-[#17202c]">
            {filteredGames.map((g) => (
              <div
                key={g.id}
                onClick={() => onSelectGameForAnalysis(g)}
                className="p-4 flex items-center justify-between hover:bg-[#141c28] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`font-mono font-bold px-2.5 py-1 rounded text-[10px] border ${
                      g.result === '1-0'
                        ? 'bg-[#10241c] text-emerald-300 border-emerald-800/40'
                        : g.result === '0-1'
                        ? 'bg-rose-950/60 text-rose-300 border-rose-800/40'
                        : 'bg-[#182332] text-slate-300 border-[#233144]'
                    }`}
                  >
                    {g.result === '1/2-1/2' ? '½ - ½' : g.result.replace('-', ' - ')}
                  </span>

                  <div>
                    <div className="font-semibold text-slate-100 text-xs">
                      {g.whiteName} vs {g.blackName}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{g.timeControl}</span>
                      <span>•</span>
                      <span>{g.moves.length} half-moves</span>
                      <span>•</span>
                      <span>{new Date(g.playedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  {g.accuracyWhite !== undefined && (
                    <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                      Acc: {g.accuracyWhite}%
                    </span>
                  )}
                  <button
                    onClick={(e) => handleExportPgn(g, e)}
                    title="Export PGN file"
                    className="p-2 rounded-lg hover:bg-[#1b2536] text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => g.id && handleDelete(g.id, e)}
                    title="Delete Game"
                    className="p-2 rounded-lg hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 text-xs">
                    <span>Analyze</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PGN Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#111722] border border-[#1b2536] rounded-2xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-100">Import PGN</h3>
            <textarea
              value={pgnImportText}
              onChange={(e) => setPgnImportText(e.target.value)}
              placeholder="Paste standard PGN notation here..."
              rows={8}
              className="w-full bg-[#141c28] border border-[#202b3c] rounded-xl p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
            {importError && (
              <p className="text-xs text-rose-400 font-medium">{importError}</p>
            )}
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportError('');
                }}
                className="px-4 py-2 rounded-xl bg-[#141c28] hover:bg-[#1a2434] text-slate-300 font-semibold text-xs border border-[#202b3c]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
