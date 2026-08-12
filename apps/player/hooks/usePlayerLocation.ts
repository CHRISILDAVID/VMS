import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { usePlayerStore } from '../stores/playerStore';
import { useUIStore } from '../stores/uiStore';
import { supabase } from '../lib/supabase';
import { createSocialService } from '@vms/shared/services';

const socialService = createSocialService(supabase);

/** Minimum distance (metres) before we bother updating the DB. Avoids write-storms. */
const MIN_UPDATE_DISTANCE_M = 500;

/**
 * usePlayerLocation
 *
 * Called once from the root layout after authentication.
 * 1. Requests foreground location permission (shows native prompt once).
 * 2. Gets the current GPS position.
 * 3. Stores coordinates in UIStore (used by all distance queries).
 * 4. Writes to DB if the player's stored location is > 500 m away (debounced).
 *
 * This hook does NOT return anything — it runs as a side-effect only.
 */
export function usePlayerLocation() {
  const playerProfile = usePlayerStore((s) => s.playerProfile);
  const { setUserCoords } = useUIStore();
  const hasRun = useRef(false);

  useEffect(() => {
    // Only run once per session and only when a player is logged in
    if (hasRun.current || !playerProfile) return;
    hasRun.current = true;

    (async () => {
      try {
        // 1. Request permission — expo-location shows the native system dialog
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('[Location] Permission denied — distance features disabled.');
          return;
        }

        // 2. Get current position (balanced accuracy is fine)
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = position.coords;

        // 3. Store in UIStore so all screens can read it without extra DB calls
        setUserCoords({ latitude, longitude });

        // 4. Check if the DB record needs updating
        const storedLat = playerProfile.latitude;
        const storedLon = playerProfile.longitude;

        const shouldUpdate =
          storedLat === null ||
          storedLon === null ||
          haversineMetres(latitude, longitude, storedLat, storedLon) > MIN_UPDATE_DISTANCE_M;

        if (shouldUpdate) {
          await socialService.updatePlayerLocation(playerProfile.id, latitude, longitude);
        }
      } catch (err) {
        // Location failures are non-fatal — the app works fine without GPS
        console.warn('[Location] Failed to get location:', err);
      }
    })();
  }, [playerProfile]);
}

/**
 * Haversine distance in metres (JS version, for the 500 m threshold check).
 * This avoids a round-trip to the DB just to check if we need to update.
 */
function haversineMetres(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in metres
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
