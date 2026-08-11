import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../components/ui/PageHeader';
import { Plus, Edit2, Ban, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createCoachesService, createVenuesService } from '@vms/shared/services';
import type { Coach } from '@vms/shared/types';

const coachesService = createCoachesService(supabase);
const venuesService = createVenuesService(supabase);

export function CoachManagementPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);

  // Queries
  const { data: coaches = [], isLoading: isCoachesLoading } = useQuery({
    queryKey: ['adminCoaches'],
    queryFn: () => coachesService.getAllCoaches(),
  });

  const { data: venues = [] } = useQuery({
    queryKey: ['adminVenues'],
    queryFn: () => venuesService.getVenues(''),
  });

  // Mutations
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
      if (isActive) {
        await coachesService.deactivateCoach(id);
      } else {
        await coachesService.reactivateCoach(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoaches'] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const adminId = sessionData.session?.user.id;
      if (!adminId) throw new Error('Not authenticated');

      const payload = {
        full_name: data.full_name,
        venue_id: data.venue_id || undefined,
        photo_url: data.photo_url || undefined,
        specialty: data.specialty.split(',').map((s: string) => s.trim()).filter(Boolean),
        bio: data.bio || undefined,
        price_per_session: parseInt(data.price_per_session) * 100, // to paise
      };

      if (editingCoach) {
        await coachesService.updateCoach(editingCoach.id, payload);
      } else {
        await coachesService.createCoach(adminId, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCoaches'] });
      setShowForm(false);
      setEditingCoach(null);
    },
    onError: (err: any) => {
      alert(`Error saving coach: ${err.message}`);
    }
  });

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    venue_id: '',
    photo_url: '',
    specialty: '',
    bio: '',
    price_per_session: '',
  });

  const openNewForm = () => {
    setEditingCoach(null);
    setFormData({
      full_name: '',
      venue_id: '',
      photo_url: '',
      specialty: '',
      bio: '',
      price_per_session: '',
    });
    setShowForm(true);
  };

  const openEditForm = (coach: Coach) => {
    setEditingCoach(coach);
    setFormData({
      full_name: coach.full_name,
      venue_id: coach.venue_id || '',
      photo_url: coach.photo_url || '',
      specialty: coach.specialty?.join(', ') || '',
      bio: coach.bio || '',
      price_per_session: String(Math.round(coach.price_per_session / 100)),
    });
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 flex">
      <div className="flex-1 min-w-0 pr-8">
        <PageHeader 
          title="Coach Management" 
          description="Manage coaches, their specialties, and session pricing."
          actions={
            <button
              onClick={openNewForm}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Add Coach
            </button>
          }
        />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {isCoachesLoading ? (
            <div className="p-8 text-center text-slate-500">Loading coaches...</div>
          ) : coaches.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Plus size={24} className="text-slate-400" />
              </div>
              <p className="font-semibold text-slate-900 mb-1">No coaches found</p>
              <p>Get started by adding a coach profile.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Coach</th>
                  <th className="px-6 py-4 font-semibold">Venue</th>
                  <th className="px-6 py-4 font-semibold">Specialties</th>
                  <th className="px-6 py-4 font-semibold text-right">Price/Session</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coaches.map(coach => (
                  <tr key={coach.id} className={`hover:bg-slate-50 ${!coach.is_active ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                          {coach.photo_url ? (
                            <img src={coach.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={18} className="text-slate-400" />
                          )}
                        </div>
                        <span className="font-bold text-slate-900">{coach.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {coach.venue?.name || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {coach.specialty?.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] uppercase font-bold rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      ₹{Math.round(coach.price_per_session / 100)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                        coach.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {coach.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(coach)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => toggleActiveMutation.mutate({ id: coach.id, isActive: coach.is_active })}
                          className={`p-2 rounded-lg transition-colors ${
                            coach.is_active 
                              ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' 
                              : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={coach.is_active ? 'Deactivate' : 'Reactivate'}
                        >
                          {coach.is_active ? <Ban size={16} /> : <CheckCircle size={16} />}
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

      {/* Drawer Form */}
      {showForm && (
        <div className="w-96 bg-white border-l border-slate-200 shadow-xl overflow-y-auto flex flex-col h-full -my-8 -mr-8">
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
            <h3 className="font-bold text-lg text-slate-900">
              {editingCoach ? 'Edit Coach' : 'Add Coach'}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              ✕
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-5 flex-1">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Photo URL</label>
              <input
                type="url"
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Assigned Venue</label>
              <select
                value={formData.venue_id}
                onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None (Independent)</option>
                {venues.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.city})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Specialties</label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="e.g. Beginners, Advanced, Fitness"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">Comma-separated</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Price per Session (₹) *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.price_per_session}
                onChange={(e) => setFormData({ ...formData, price_per_session: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Bio</label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white py-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-6 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm shadow-blue-600/20"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Coach'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
