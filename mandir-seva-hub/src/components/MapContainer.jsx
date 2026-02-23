// src/components/MapContainer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Requires: VITE_GOOGLE_MAPS_KEY in your .env
//   VITE_GOOGLE_MAPS_KEY=AIzaSy...
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader } from 'lucide-react';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(window.google.maps); return; }
    const existing = document.querySelector('script[data-gm]');
    if (existing) { existing.addEventListener('load', () => resolve(window.google.maps)); return; }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places`;
    script.async = true;
    script.setAttribute('data-gm', '1');
    script.onload  = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

const SAFFRON_MARKER = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="36" height="48">
  <path d="M18 0C8.06 0 0 8.06 0 18c0 12 18 30 18 30s18-18 18-30C36 8.06 27.94 0 18 0z"
    fill="#FF9933" stroke="white" stroke-width="2"/>
  <text x="18" y="22" text-anchor="middle" font-size="14" fill="white">🛕</text>
</svg>`;

export default function MapContainer({ events, highlightedId, onMarkerClick }) {
  const mapRef  = useRef(null);
  const gmap    = useRef(null);
  const markers = useRef({});
  const [status, setStatus] = useState('loading'); // loading | ready | error | nokey

  useEffect(() => {
    if (!MAPS_KEY) { setStatus('nokey'); return; }
    loadGoogleMaps()
      .then((maps) => {
        gmap.current = new maps.Map(mapRef.current, {
          center: { lat: 20.5937, lng: 78.9629 }, // Centre of India
          zoom: 5,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { featureType: 'water',      stylers: [{ color: '#dbeafe' }] },
            { featureType: 'landscape',  stylers: [{ color: '#fff8f0' }] },
            { featureType: 'road',       stylers: [{ color: '#ffe0b2' }] },
            { featureType: 'poi',        stylers: [{ visibility: 'off' }] },
            { featureType: 'transit',    stylers: [{ visibility: 'off' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#7c2d00' }] },
          ],
        });
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  // Sync markers
  useEffect(() => {
    if (status !== 'ready' || !gmap.current) return;
    const maps = window.google.maps;

    // Remove stale markers
    Object.keys(markers.current).forEach(id => {
      if (!events.find(e => e.id === id)) {
        markers.current[id].setMap(null);
        delete markers.current[id];
      }
    });

    // Add new markers
    events.forEach(ev => {
      if (!ev.lat || !ev.lng) return;
      if (markers.current[ev.id]) return; // already exists
      const marker = new maps.Marker({
        position: { lat: ev.lat, lng: ev.lng },
        map: gmap.current,
        title: ev.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(SAFFRON_MARKER)}`,
          scaledSize: new maps.Size(36, 48),
          anchor: new maps.Point(18, 48),
        },
      });
      const infoWindow = new maps.InfoWindow({
        content: `
          <div style="font-family:'Lato',sans-serif;padding:4px;max-width:160px">
            <p style="font-weight:800;color:#4a1a00;margin:0 0 2px 0;font-size:13px">${ev.name}</p>
            <p style="color:#FF9933;margin:0;font-size:11px">🍬 ${ev.prasad_type || ''}</p>
            <p style="color:#b07040;margin:4px 0 0;font-size:11px">${(ev.location_name || '').split(',')[0]}</p>
          </div>`,
      });
      marker.addListener('click', () => {
        infoWindow.open(gmap.current, marker);
        onMarkerClick?.(ev.id);
      });
      markers.current[ev.id] = marker;
    });
  }, [events, status, onMarkerClick]);

  // Highlight effect
  useEffect(() => {
    if (!highlightedId || !gmap.current) return;
    const marker = markers.current[highlightedId];
    if (!marker) return;
    gmap.current.panTo(marker.getPosition());
    gmap.current.setZoom(13);
    marker.setAnimation(window.google.maps.Animation.BOUNCE);
    setTimeout(() => marker.setAnimation(null), 2200);
  }, [highlightedId]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden"
      style={{ height: 220, border: '1px solid #ffe0b2', boxShadow: '0 4px 20px rgba(255,153,51,0.1)' }}>
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: '#fff8f0' }}>
          <Loader size={28} color="#FF9933" className="animate-spin mb-2" />
          <p className="text-sm font-semibold" style={{ color: '#a05020' }}>Loading map…</p>
        </div>
      )}

      {/* Error / No key overlay */}
      {(status === 'error' || status === 'nokey') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
          style={{ background: 'linear-gradient(135deg,#fff8f0,#fff3e0)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: '#FF9933' }}>
            <MapPin size={22} color="white" />
          </div>
          <p className="font-black text-sm mb-1" style={{ color: '#4a1a00' }}>Map Preview</p>
          <p className="text-xs leading-relaxed" style={{ color: '#a05020' }}>
            {status === 'nokey'
              ? 'Add VITE_GOOGLE_MAPS_KEY to .env to enable the live map with all temple markers.'
              : 'Could not load Google Maps. Check your API key and domain restrictions.'}
          </p>
          {/* Static fallback grid showing event locations */}
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {/* intentionally left minimal */}
          </div>
        </div>
      )}

      {/* Event count badge */}
      {status === 'ready' && (
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl text-xs font-black shadow-md"
          style={{ background: 'white', color: '#FF9933', border: '1px solid #ffe0b2' }}>
          🛕 {events.filter(e => e.lat && e.lng).length} on map
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Autocomplete input — used inside AddTempleForm
// Emits: onPlaceSelected({ name, location_name, lat, lng })
// ─────────────────────────────────────────────────────────────────────────────
export function PlacesAutocomplete({ value, onChange, onPlaceSelected, placeholder, className, style }) {
  const inputRef = useRef(null);
  const acRef    = useRef(null);

  useEffect(() => {
    if (!MAPS_KEY) return;
    loadGoogleMaps().then((maps) => {
      if (!inputRef.current || acRef.current) return;
      acRef.current = new maps.places.Autocomplete(inputRef.current, {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'in' },
        fields: ['name', 'formatted_address', 'geometry'],
      });
      acRef.current.addListener('place_changed', () => {
        const place = acRef.current.getPlace();
        if (!place.geometry) return;
        onPlaceSelected?.({
          name:          place.name || value,
          location_name: place.formatted_address || '',
          lat:           place.geometry.location.lat(),
          lng:           place.geometry.location.lng(),
        });
        onChange?.(place.name || value);
      });
    }).catch(() => {});
  }, []);

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={className}
      style={style}
      autoComplete="off"
    />
  );
}
