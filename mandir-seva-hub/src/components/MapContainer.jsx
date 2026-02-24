// src/components/MapContainer.jsx
// Leaflet + OpenStreetMap — no API key required. Free forever.
import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Centre of India
const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

const SAFFRON_MARKER = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="36" height="48">
  <path d="M18 0C8.06 0 0 8.06 0 18c0 12 18 30 18 30s18-18 18-30C36 8.06 27.94 0 18 0z"
    fill="#FF9933" stroke="white" stroke-width="2"/>
  <text x="18" y="22" text-anchor="middle" font-size="14" fill="white">🛕</text>
</svg>`;

const saffronIcon = new L.DivIcon({
  html: SAFFRON_MARKER,
  className: 'saffron-marker',
  iconSize: [36, 48],
  iconAnchor: [18, 48],
});

// When highlightedId changes, fly to that event
function HighlightFlyTo({ events, highlightedId }) {
  const map = useMap();
  useEffect(() => {
    if (!highlightedId) return;
    const ev = events.find(e => e.id === highlightedId);
    if (!ev?.lat || !ev?.lng) return;
    map.flyTo([ev.lat, ev.lng], 13, { duration: 0.8 });
  }, [map, events, highlightedId]);
  return null;
}

export default function MapContainer({ events, highlightedId, onMarkerClick }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden flex flex-col items-center justify-center"
        style={{ height: 220, border: '1px solid #ffe0b2', boxShadow: '0 4px 20px rgba(255,153,51,0.1)', background: '#fff8f0' }}>
        <Loader size={28} color="#FF9933" className="animate-spin mb-2" />
        <p className="text-sm font-semibold" style={{ color: '#a05020' }}>Loading map…</p>
      </div>
    );
  }

  const eventsWithCoords = events.filter(e => e.lat != null && e.lng != null);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden"
      style={{ height: 220, border: '1px solid #ffe0b2', boxShadow: '0 4px 20px rgba(255,153,51,0.1)' }}>
      <LeafletMap
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full rounded-2xl"
        style={{ height: 220 }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HighlightFlyTo events={events} highlightedId={highlightedId} />
        {eventsWithCoords.map(ev => (
          <Marker
            key={ev.id}
            position={[ev.lat, ev.lng]}
            icon={saffronIcon}
            eventHandlers={{
              click: () => onMarkerClick?.(ev.id),
            }}
          >
            <Popup>
              <div style={{ fontFamily: "'Lato',sans-serif", padding: 4, maxWidth: 160 }}>
                <p style={{ fontWeight: 800, color: '#4a1a00', margin: '0 0 2px 0', fontSize: 13 }}>{ev.name}</p>
                <p style={{ color: '#FF9933', margin: 0, fontSize: 11 }}>🍬 {ev.prasad_type || ''}</p>
                <p style={{ color: '#b07040', margin: '4px 0 0', fontSize: 11 }}>{(ev.location_name || '').split(',')[0]}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </LeafletMap>
      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl text-xs font-black shadow-md z-[1000]"
        style={{ background: 'white', color: '#FF9933', border: '1px solid #ffe0b2' }}>
        🛕 {eventsWithCoords.length} on map
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Location search using Nominatim (OpenStreetMap) — free, no API key.
// Same interface as before: onPlaceSelected({ name, location_name, lat, lng })
// ─────────────────────────────────────────────────────────────────────────────
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_HEADERS = { 'User-Agent': 'MandirSevaHub/1.0 (temple event app)' };

export function PlacesAutocomplete({ value, onChange, onPlaceSelected, placeholder, className, style }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => setQuery(value || ''), [value]);

  const search = async (q) => {
    const t = (q || '').trim();
    if (!t) { setResults([]); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: t, format: 'json', limit: '5' });
      const res = await fetch(`${NOMINATIM_URL}?${params}`, { headers: NOMINATIM_HEADERS });
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange?.(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 400);
  };

  const select = (item) => {
    const name = item.name || item.display_name?.split(',')[0] || query;
    const location_name = item.display_name || '';
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setQuery(name);
    onChange?.(name);
    onPlaceSelected?.({ name, location_name, lat, lng });
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <input
        value={query}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder={placeholder}
        className={className}
        style={style}
        autoComplete="off"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader size={16} className="animate-spin" style={{ color: '#FF9933' }} />
        </div>
      )}
      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden shadow-lg z-50 max-h-48 overflow-y-auto"
          style={{ background: 'white', border: '1px solid #ffe0b2' }}>
          {results.map((item, i) => (
            <li
              key={i}
              onClick={() => select(item)}
              className="px-4 py-2.5 text-sm cursor-pointer hover:bg-orange-50 border-b border-orange-100 last:border-0"
              style={{ color: '#4a1a00' }}
            >
              <span className="font-semibold">{item.name || item.display_name?.split(',')[0]}</span>
              <br />
              <span className="text-xs" style={{ color: '#b07040' }}>{item.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
