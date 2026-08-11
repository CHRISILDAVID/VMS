import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../components/ui/PageHeader';
import { Search, Plus, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createPlayersService } from '@vms/shared/services';
import type { Player, PlayerTransaction, PlayerWallet } from '@vms/shared/types';
import { useDebounce } from '../hooks/useDebounce'; // Assuming you have a standard debounce hook or we can do it inline

const playersService = createPlayersService(supabase);

export function WalletManagementPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Simple debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('admin_topup');

  // Search query
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['playersSearch', debouncedSearchTerm],
    queryFn: () => playersService.searchPlayers(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 2,
  });

  // Wallet Query
  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: ['playerWallet', selectedPlayer?.id],
    queryFn: () => playersService.getWallet(selectedPlayer!.id),
    enabled: !!selectedPlayer,
  });

  // Transactions Query
  const { data: transactions = [], isLoading: isTxLoading } = useQuery({
    queryKey: ['walletTransactions', wallet?.id],
    queryFn: () => playersService.getWalletTransactions(wallet!.id, 20),
    enabled: !!wallet?.id,
  });

  // Credit Mutation
  const creditMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPlayer || !wallet) throw new Error('No wallet selected');
      const amountPaise = parseInt(creditAmount) * 100;
      if (isNaN(amountPaise) || amountPaise <= 0) throw new Error('Invalid amount');
      
      const { data: sessionData } = await supabase.auth.getSession();
      const adminId = sessionData.session?.user.id;
      if (!adminId) throw new Error('Not authenticated');

      await playersService.adminCreditWallet({
        playerId: selectedPlayer.id,
        walletId: wallet.id,
        amountPaise,
        reason: creditReason,
        creditedBy: adminId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerWallet', selectedPlayer?.id] });
      queryClient.invalidateQueries({ queryKey: ['walletTransactions', wallet?.id] });
      setShowCreditModal(false);
      setCreditAmount('');
    },
    onError: (error: any) => {
      alert(`Error crediting wallet: ${error.message}`);
    }
  });

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setSearchTerm(''); // Clear search
  };

  const handleCredit = (e: React.FormEvent) => {
    e.preventDefault();
    creditMutation.mutate();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
      <PageHeader 
        title="Wallet Management" 
        description="View and manage player wallets and transactions." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Search & Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Find Player</h3>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {debouncedSearchTerm.length > 2 && (
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-slate-500">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">No players found.</div>
                ) : (
                  searchResults.map(player => (
                    <button
                      key={player.id}
                      onClick={() => handleSelectPlayer(player)}
                      className="w-full text-left p-3 hover:bg-slate-50 flex flex-col gap-1 transition-colors"
                    >
                      <span className="font-medium text-slate-900">{player.full_name}</span>
                      <span className="text-sm text-slate-500">{player.phone}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Wallet Details */}
        <div className="lg:col-span-2">
          {!selectedPlayer ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-400 h-full">
              <Wallet size={48} className="mb-4 text-slate-300" />
              <p>Select a player to view their wallet details.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Wallet Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedPlayer.full_name}</h2>
                  <p className="text-sm text-slate-500">{selectedPlayer.phone}</p>
                  {selectedPlayer.player_id && (
                    <span className="inline-block mt-2 px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded">
                      ID: {selectedPlayer.player_id}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-500 uppercase">Balance</p>
                    <p className="text-3xl font-black text-slate-900">
                      {isWalletLoading ? '...' : wallet ? `₹${wallet.balance / 100}` : '₹0'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreditModal(true)}
                    disabled={!wallet}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Plus size={18} />
                    Credit
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                  <h3 className="font-semibold text-slate-800">Recent Transactions</h3>
                </div>
                {isTxLoading ? (
                  <div className="p-8 text-center text-slate-500">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No transactions found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Date</th>
                          <th className="px-6 py-3 font-semibold">Type</th>
                          <th className="px-6 py-3 font-semibold">Reason</th>
                          <th className="px-6 py-3 font-semibold text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                              {new Date(tx.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                tx.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {tx.type === 'credit' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                                {tx.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 capitalize">
                              {tx.reason.replace('_', ' ')}
                            </td>
                            <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${
                              tx.type === 'credit' ? 'text-green-600' : 'text-slate-900'
                            }`}>
                              {tx.type === 'credit' ? '+' : '-'}₹{Math.abs(tx.amount) / 100}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Credit Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900">Credit Wallet</h3>
              <button onClick={() => setShowCreditModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCredit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Player</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                  {selectedPlayer?.full_name} ({selectedPlayer?.phone})
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Reason</label>
                <select
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin_topup">Admin Topup</option>
                  <option value="refund">Refund</option>
                  <option value="promotional">Promotional</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreditModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creditMutation.isPending || !creditAmount}
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {creditMutation.isPending ? 'Processing...' : 'Confirm Credit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
