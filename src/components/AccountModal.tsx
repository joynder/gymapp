import React, { useState } from 'react';
import {
  getAppDatabase,
  getActiveUser,
  saveUserPreferences,
  switchActiveUser,
  createUserAccount,
  deleteUserAccount,
  exportGitDatabaseJSON,
  importGitDatabaseJSON,
} from '../utils/storage';
import { User, Plus, Trash2, Check, Download, Upload, X, FileJson, Palette } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountChanged: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onAccountChanged,
}) => {
  const [db, setDb] = useState(() => getAppDatabase());
  const [isCreating, setIsCreating] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newWeight, setNewWeight] = useState(75);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const usersList = Object.values(db.users);
  const activeUser = db.users[db.activeUserId];

  const handleSelectUser = (id: string) => {
    switchActiveUser(id);
    setDb(getAppDatabase());
    onAccountChanged();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    createUserAccount(newUsername, newName, Number(newWeight) || 75);
    setDb(getAppDatabase());
    setIsCreating(false);
    setNewUsername('');
    setNewName('');
    onAccountChanged();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Sei sicuro di voler eliminare l'account di ${name}?`)) {
      deleteUserAccount(id);
      setDb(getAppDatabase());
      onAccountChanged();
    }
  };

  const handleSelectTheme = (theme: 'orange' | 'green' | 'pink' | 'blue') => {
    const current = getActiveUser();
    const updatedPrefs = {
      ...(current.preferences || {}),
      themeColor: theme,
    };
    saveUserPreferences(updatedPrefs as any);
    document.documentElement.setAttribute('data-theme', theme);
    setDb(getAppDatabase());
    onAccountChanged();
  };

  const handleDownloadGitBackup = () => {
    const jsonStr = exportGitDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gymapp_git_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = importGitDatabaseJSON(text);
      if (success) {
        setDb(getAppDatabase());
        setImportStatus('Dati ripristinati con successo da file Git!');
        onAccountChanged();
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Errore: formato file JSON non valido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl text-zinc-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/40 text-orange-400 flex items-center justify-center">
              <User size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Gestione Account</h2>
              <span className="text-[11px] font-mono text-zinc-400">
                Profili e Sincronizzazione Dati
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-5 text-xs">
          {/* Active Account Banner */}
          <div className="p-3.5 bg-zinc-900/90 border border-orange-500/40 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-orange-400 block font-semibold">
                Account Attualmente Attivo
              </span>
              <div className="text-base font-bold text-white mt-0.5">{activeUser?.name}</div>
              <div className="text-[11px] font-mono text-zinc-400">
                @{activeUser?.username} • Peso: {activeUser?.preferences?.bodyWeightKg || 75} kg
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center">
              <Check size={14} />
            </div>
          </div>

          {/* Theme Color Selector */}
          <div className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-zinc-200 flex items-center gap-1.5">
                <Palette size={14} className="text-accent" /> Colore del Tema
              </span>
              <span className="text-[11px] text-zinc-500">Accento grafico</span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { id: 'orange', name: 'Arancione', bg: 'bg-[#f97316]' },
                { id: 'green', name: 'Verde', bg: 'bg-[#22c55e]' },
                { id: 'pink', name: 'Rosa', bg: 'bg-[#ec4899]' },
                { id: 'blue', name: 'Azzurro', bg: 'bg-[#0ea5e9]' },
              ].map((t) => {
                const currentTheme = activeUser?.preferences?.themeColor || 'orange';
                const isSelected = currentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTheme(t.id as any)}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-white bg-zinc-800 text-white font-bold'
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-400'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${t.bg}`} />
                    <span className="text-[11px]">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accounts List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono uppercase text-[11px] text-zinc-400 font-semibold">
                I Tuoi Profili ({usersList.length})
              </span>
              <button
                type="button"
                onClick={() => setIsCreating(!isCreating)}
                className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 font-mono text-[11px]"
              >
                <Plus size={13} /> Crea Profilo
              </button>
            </div>

            {/* Create Form */}
            {isCreating && (
              <form onSubmit={handleCreate} className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2.5 mb-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">
                      Nome Atleta
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Es. Marco"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">
                      Username Univoco
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="es. marco_fit"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">
                    Peso Corporeo (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="30"
                    max="200"
                    value={newWeight}
                    onChange={(e) => setNewWeight(parseFloat(e.target.value) || 75)}
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded font-bold text-xs"
                  >
                    Salva Nuovo Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-1.5 bg-zinc-800 text-zinc-400 hover:text-white rounded"
                  >
                    Annulla
                  </button>
                </div>
              </form>
            )}

            {/* List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {usersList.map((user) => {
                const isCurrent = user.id === db.activeUserId;
                return (
                  <div
                    key={user.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                      isCurrent
                        ? 'bg-orange-950/20 border-orange-600/60 text-white'
                        : 'bg-zinc-900 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div
                      onClick={() => handleSelectUser(user.id)}
                      className="flex-1 cursor-pointer min-w-0"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white truncate">{user.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-orange-600 text-white font-bold">
                            ATTIVO
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400">
                        @{user.username} • {user.sessions?.length || 0} sessioni salvate
                      </div>
                    </div>

                    {!isCurrent && usersList.length > 1 && (
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-800"
                        title="Elimina questo profilo"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Git Backup & Export Data Section */}
          <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-white">
              <FileJson size={14} className="text-orange-400" />
              <span>Sincronizzazione Dati con Git</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Tutti i profili, le schede create e lo storico dei pesi possono essere esportati in
              un singolo file JSON per essere inseriti direttamente nel repository Git.
            </p>

            {importStatus && (
              <div className="p-2 bg-orange-950/40 border border-orange-500/50 rounded text-[11px] text-orange-300 font-mono">
                {importStatus}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadGitBackup}
                className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-zinc-700"
              >
                <Download size={13} className="text-orange-400" /> Esporta JSON per Git
              </button>

              <label className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-zinc-700 cursor-pointer">
                <Upload size={13} className="text-orange-400" /> Ripristina JSON da Git
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-bold text-xs border border-zinc-800"
          >
            Fatto
          </button>
        </div>
      </div>
    </div>
  );
};
