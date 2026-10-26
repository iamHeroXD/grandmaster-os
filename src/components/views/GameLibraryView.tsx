import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { ChessGameController } from '../../services/chessEngine';
import { GameSummary } from '../../types/chess';
import { FolderArchive, Upload, Download, Search, Trash2, ArrowRight, FileText } from 'lucide-react';

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
    <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4 max-w-6xl mx-auto w-full text-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-charcoal-900 border border-charcoal-800 rounded-xl p-4 shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-charcoal-800 border border-charcoal-700 flex items-center justify-center text-charcoal-200">
            <FolderArchive className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-charcoal-100">Local Game Library</h1>
            <p className="text-xs text-charcoal-400">
              {games.length} stored games on your private disk. Complete PGN export and import.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-100 font-semibold rounded shadow flex items-center gap-1.5 transition-colors border border-charcoal-700"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Import PGN</span>
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-charcoal-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by player or time control..."
            className="w-full bg-charcoal-900 border border-charcoal-800 rounded pl-9 pr-3 py-2 text-charcoal-200 focus:outline-none focus:border-chess-green"
          />
        </div>

        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value as 'all' | '1-0' | '0-1' | '1/2-1/2')}
          className="bg-charcoal-900 border border-charcoal-800 rounded px-3 py-2 text-charcoal-300"
        >
          <option value="all">All Results</option>
          <option value="1-0">1-0 (White Win)</option>
          <option value="0-1">0-1 (Black Win)</option>
          <option value="1/2-1/2">½-½ (Draw)</option>
        </select>
      </div>

      {/* Games List */}
      <div className="flex-1 bg-charcoal-900 border border-charcoal-800 rounded-xl overflow-hidden flex flex-col shadow">
        {filteredGames.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-charcoal-500 italic">
            No games found matching your search.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-charcoal-800/60 font-mono">
            {filteredGames.map((g) => (
              <div
                key={g.id}
                onClick={() => onSelectGameForAnalysis(g)}
                className="p-3.5 flex items-center justify-between hover:bg-charcoal-850/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      g.result === '1-0'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : g.result === '0-1'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-charcoal-800 text-charcoal-300'
                    }`}
                  >
                    {g.result}
                  </span>

                  <div>
                    <div className="font-sans font-semibold text-charcoal-100 text-xs">
                      {g.whiteName} vs {g.blackName}
                    </div>
                    <div className="text-[10px] text-charcoal-400 font-sans mt-0.5 flex items-center gap-2">
                      <span>{g.timeControl}</span>
                      <span>•</span>
                      <span>{g.moves.length} half-moves</span>
                      <span>•</span>
                      <span>{new Date(g.playedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-sans">
                  {g.accuracyWhite !== undefined && (
                    <span className="text-[11px] text-emerald-400 font-mono">
                      Acc: {g.accuracyWhite}%
                    </span>
                  )}
                  <button
                    onClick={(e) => handleExportPgn(g, e)}
                    title="Export PGN file"
                    className="p-1.5 rounded hover:bg-charcoal-700 text-charcoal-400 hover:text-charcoal-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => g.id && handleDelete(g.id, e)}
                    title="Delete Game"
                    className="p-1.5 rounded hover:bg-rose-950/60 text-charcoal-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="text-chess-green font-semibold flex items-center gap-1 text-xs">
                    <span>Analyze</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl max-w-lg w-full p-5 shadow-2xl flex flex-col gap-3">
            <h2 className="text-sm font-bold text-charcoal-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Import PGN Game</span>
            </h2>

            {importError && (
              <div className="p-2 bg-rose-950/60 border border-rose-800/60 rounded text-rose-300 text-xs">
                {importError}
              </div>
            )}

            <form onSubmit={handleImportSubmit} className="flex flex-col gap-3">
              <textarea
                rows={8}
                value={pgnImportText}
                onChange={(e) => setPgnImportText(e.target.value)}
                placeholder="Paste standard PGN text here (e.g. 1. e4 e5 2. Nf3 Nc6 3. Bb5 ...)"
                className="w-full bg-charcoal-800 border border-charcoal-700 rounded p-3 text-xs font-mono text-charcoal-100 focus:outline-none focus:border-chess-green"
              />

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 rounded font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-chess-green hover:bg-chess-greenLight text-white rounded font-semibold text-xs"
                >
                  Import Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
