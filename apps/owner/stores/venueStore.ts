import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    SecureStore.setItem(name, value);
  },
  getItem: (name) => {
    return SecureStore.getItem(name);
  },
  removeItem: (name) => {
    SecureStore.deleteItemAsync(name);
  },
};

interface VenueState {
  selectedVenueId: string | null
  setSelectedVenueId: (id: string | null) => void
}

export const useVenueStore = create<VenueState>()(
  persist(
    (set) => ({
      selectedVenueId: null,
      setSelectedVenueId: (id) => set({ selectedVenueId: id }),
    }),
    {
      name: 'venue-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
)
