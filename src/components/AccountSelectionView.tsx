import React, { useState } from 'react';
import { User, Plus, Trash2, ArrowRight, Dumbbell, ShieldCheck } from 'lucide-react';
import type { UserAccount } from '../types';

interface AccountSelectionViewProps {
  accounts: UserAccount[];
  onSelectAccount: (accountId: string) => void;
  onCreateAccount: (name: string, weightKg: number) => void;
  onDeleteAccount: (accountId: string) => void;
}

export const AccountSelectionView: React.FC<AccountSelectionViewProps> = ({
  accounts,
  onSelectAccount,
  onCreateAccount,
  onDeleteAccount,
}) => {
  const [newName, setNewName] = useState('');
  const [newWeight, setNewWeight] = useState(75);
  const [isCreating, setIsCreating] = useState(accounts.length === 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateAccount(newName.trim(), Number(newWeight) || 75);
    setNewName('');
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-center items-center px-4 py-10 selection:bg-accent selection:text-white">
      <div className="max-w-md w-full space-y-6">
        {/* App Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-accent-subtle border border-accent-border rounded-2xl text-accent mb-2">
            <Dumbbell size={36} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Gym Builder
          </h1>
          <p className="text-sm text-zinc-400">
            Seleziona il tuo profilo per accedere alla tua scheda e al tuo storico carichi.
          </p>
        </div>

        {/* Existing Accounts List */}
        {accounts.length > 0 && !isCreating && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400 px-1">
              <span>Profili Disponibili</span>
              <span>{accounts.length} {accounts.length === 1 ? 'account' : 'account'}</span>
            </div>

            <div className="space-y-2">
              {accounts.map((acc) => {
                const totalWorkouts = acc.sessions?.length || 0;
                const hasRoutine = !!acc.routine;

                return (
                  <div
                    key={acc.id}
                    onClick={() => onSelectAccount(acc.id)}
                    className="group bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-accent-border rounded-2xl p-4 transition-all duration-200 cursor-pointer flex items-center justify-between shadow-lg"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-accent-subtle border border-accent-border flex items-center justify-center text-accent font-bold text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                        {acc.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-base group-hover:text-accent transition-colors truncate">
                          {acc.name}
                        </h3>
                        <p className="text-xs text-zinc-400 truncate">
                          {hasRoutine ? 'Scheda attiva' : 'Nessuna scheda'} · {totalWorkouts} {totalWorkouts === 1 ? 'allenamento' : 'allenamenti'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {accounts.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Eliminare l'account di ${acc.name} e tutti i suoi dati?`)) {
                              onDeleteAccount(acc.id);
                            }
                          }}
                          className="p-2 text-zinc-600 hover:text-red-400 rounded-lg transition-colors"
                          title="Elimina profilo"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <div className="p-2 text-zinc-400 group-hover:text-accent transition-colors">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 border-dashed rounded-2xl text-sm font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-all mt-4"
            >
              <Plus size={18} className="text-accent" />
              <span>Crea un nuovo account</span>
            </button>
          </div>
        )}

        {/* Create Account Form */}
        {(isCreating || accounts.length === 0) && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <User size={18} className="text-accent" />
                <h3 className="font-bold text-white text-sm uppercase tracking-wide">
                  Nuovo Profilo
                </h3>
              </div>
              {accounts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Torna ai profili
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Il tuo nome o nickname:
                </label>
                <input
                  type="text"
                  required
                  placeholder="es. Alessandro"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-accent rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 text-sm outline-none transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Peso corporeo indicativo (kg):
                </label>
                <input
                  type="number"
                  min="30"
                  max="250"
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-accent rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 text-sm outline-none transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  className="w-full py-3 px-4 bg-accent hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <span>Entra in Palestra</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
          <ShieldCheck size={14} className="text-zinc-400" />
          <span>I tuoi dati rimangono memorizzati e separati sul dispositivo.</span>
        </div>
      </div>
    </div>
  );
};
