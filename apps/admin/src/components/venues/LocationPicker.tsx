import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet';
import { MapPin, Search } from 'lucide-react';

// Fix Leaflet's default icon path issues in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface LocationDetails {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number, details?: LocationDetails) => void;
}

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // India Center

function MapEvents({ onChange, setPosition }: { onChange: (lat: number, lng: number, details?: LocationDetails) => void, setPosition: (p: L.LatLng) => void }) {
  useMapEvents({
    async click(e) {
      setPosition(e.latlng);
      
      let details: LocationDetails | undefined;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}&zoom=18&addressdetails=1`, {
          headers: { 'Accept-Language': 'en' }
        });
        const data = await response.json();
        if (data && data.address) {
          const addr = data.address;
          const city = addr.city || addr.town || addr.village || addr.county || '';
          const state = addr.state || '';
          const pincode = addr.postcode || '';
          
          const addressParts = [];
          if (addr.road) addressParts.push(addr.road);
          if (addr.suburb) addressParts.push(addr.suburb);
          if (addr.neighbourhood) addressParts.push(addr.neighbourhood);
          const address = addressParts.join(', ');
          
          details = { city, state, pincode, address };
        }
      } catch (err) {
        console.error('Reverse geocoding error', err);
      }
      
      onChange(e.latlng.lat, e.latlng.lng, details);
    },
  });
  return null;
}

export function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    latitude && longitude ? new L.LatLng(latitude, longitude) : null
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<L.Map>(null);
  
  const provider = useMemo(() => new OpenStreetMapProvider(), []);

  const handleSearch = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await provider.search({ query: searchQuery });
      if (results && results.length > 0) {
        const result = results[0];
        const newPos = new L.LatLng(result.y, result.x);
        setPosition(newPos);
        mapRef.current?.setView(newPos, 14);
        
        // Reverse geocode the searched location to get structured details
        let details: LocationDetails | undefined;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}&zoom=18&addressdetails=1`, {
            headers: { 'Accept-Language': 'en' }
          });
          const data = await response.json();
          if (data && data.address) {
            const addr = data.address;
            const city = addr.city || addr.town || addr.village || addr.county || '';
            const state = addr.state || '';
            const pincode = addr.postcode || '';
            
            const addressParts = [];
            if (addr.road) addressParts.push(addr.road);
            if (addr.suburb) addressParts.push(addr.suburb);
            if (addr.neighbourhood) addressParts.push(addr.neighbourhood);
            const address = addressParts.join(', ');
            
            details = { city, state, pincode, address };
          }
        } catch (err) {
          console.error('Reverse geocoding error', err);
        }
        
        onChange(newPos.lat, newPos.lng, details);
      }
    } catch (err) {
      console.error('Geosearch error', err);
    } finally {
      setIsSearching(false);
    }
  };

  const center = position || DEFAULT_CENTER;
  const zoom = position ? 14 : 4;

  return (
    <div className="flex flex-col gap-3">
      {/* Search Bar */}
      <div className="flex gap-2 relative z-10">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md leading-5 bg-white dark:bg-slate-900 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-900 dark:text-slate-100"
            placeholder="Search for a city or area to drop pin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => handleSearch()}
          disabled={isSearching}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-sm font-medium"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Map Container */}
      <div className="h-[400px] w-full rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 relative z-0">
        <MapContainer 
          center={center} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && (
            <Marker 
              position={position}
              draggable={true}
              eventHandlers={{
                dragend: async (e) => {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  setPosition(pos);
                  
                  let details: LocationDetails | undefined;
                  try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}&zoom=18&addressdetails=1`, {
                      headers: { 'Accept-Language': 'en' }
                    });
                    const data = await response.json();
                    if (data && data.address) {
                      const addr = data.address;
                      const city = addr.city || addr.town || addr.village || addr.county || '';
                      const state = addr.state || '';
                      const pincode = addr.postcode || '';
                      
                      const addressParts = [];
                      if (addr.road) addressParts.push(addr.road);
                      if (addr.suburb) addressParts.push(addr.suburb);
                      if (addr.neighbourhood) addressParts.push(addr.neighbourhood);
                      const address = addressParts.join(', ');
                      
                      details = { city, state, pincode, address };
                    }
                  } catch (err) {
                    console.error('Reverse geocoding error', err);
                  }
                  
                  onChange(pos.lat, pos.lng, details);
                },
              }}
            />
          )}
          <MapEvents onChange={onChange} setPosition={setPosition} />
        </MapContainer>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
        <MapPin className="h-3 w-3" />
        Click anywhere on the map or drag the pin to set the exact venue location.
      </p>
    </div>
  );
}
