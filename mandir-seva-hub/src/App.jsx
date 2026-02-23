// src/App.jsx
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Search, X, Flame, Heart, Plus, RefreshCw,
  Loader, WifiOff, Filter, MapPin, Zap,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTemples } from './hooks/useTemples';
import TempleCard    from './components/TempleCard';
import MapContainer  from './components/MapContainer';
import SupportModal  from './components/SupportModal';
import AddTempleForm from './components/AddTempleForm';

// ─── Filter chip config ───────────────────────────────────────────────────────
const FILTER_CHIPS = [
  { id: 'all',    label: 'All',          emoji: '✨' },
  { id: 'prasad', label: 'Prasad Today', emoji: '🍬' },
  { id: 'kirtan', label: 'Kirtan Events',emoji: '🎵' },
  { id: 'near',   label: 'Near Me',      emoji: '📍' },
];

// ─── Helper: haversine distance (km) ─────────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function App() {
  const { events, loading, error, likedIds, reportedIds, handleLike, handleReport, handleAdd, reload } = useTemples();

  const [showSupport, setShowSupport] = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [search,      setSearch]      = useState('');
  const [activeChip,  setActiveChip]  = useState('all');
  const [highlighted, setHighlighted] = useState(null);
  const [userPos,     setUserPos]     = useState(null);
  const [showMap,     setShowMap]     = useState(true);
  const [toast,       setToast]       = useState(null);
  const cardRefs = useRef({});
  const feedRef  = useRef(null);

  // ── Geolocation for "Near Me" ─────────────────────────────────────────────
  useEffect(() => {
    if (activeChip !== 'near') return;
    if (userPos) return;
    navigator.geolocation?.getCurrentPosition(
      pos => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      ()  => showToast('Location access denied', 'warn'),
    );
  }, [activeChip]);

  const showToast = (msg, type='info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = events;
    const q = search.toLowerCase().trim();

    // text search
    if (q) {
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        (e.location_name || '').toLowerCase().includes(q) ||
        (e.prasad_type   || '').toLowerCase().includes(q) ||
        (e.description   || '').toLowerCase().includes(q)
      );
    }

    // chips
    if (activeChip === 'prasad') list = list.filter(e => e.occasion_type !== 'Kirtan');
    if (activeChip === 'kirtan') list = list.filter(e => e.occasion_type === 'Kirtan');
    if (activeChip === 'near' && userPos) {
      list = list
        .filter(e => e.lat && e.lng)
        .map(e => ({ ...e, _dist: haversine(userPos.lat, userPos.lng, e.lat, e.lng) }))
        .sort((a, b) => a._dist - b._dist)
        .slice(0, 15);
    }

    return list;
  }, [events, search, activeChip, userPos]);

  // ── Marker click → scroll to card ────────────────────────────────────────
  const handleMarkerClick = useCallback((id) => {
    setHighlighted(id);
    setTimeout(() => {
      const el = cardRefs.current[id];
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
    setTimeout(() => setHighlighted(null), 3000);
  }, []);

  // ── Submit new event ──────────────────────────────────────────────────────
  const handleFormSubmit = async (payload) => {
    await handleAdd(payload);
    showToast('🙏 Event posted! It\'s now live.', 'success');
  };

  const prasadCount  = events.filter(e => e.occasion_type !== 'Kirtan').length;
  const kirtanCount  = events.filter(e => e.occasion_type === 'Kirtan').length;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#fff8f0 0%,#fffaf5 100%)', fontFamily: "'Lato',sans-serif" }}>

      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Lato:wght@300;400;600;700;900&display=swap');
        @keyframes slideUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes modalIn   { from{opacity:0;transform:scale(0.92) translateY(16px)} to{opacity:1;transform:none} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes toastIn   { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:none} }
        @keyframes pulseRing { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:0} }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-fadeIn  { animation: fadeIn  0.3s ease both; }
        .animate-toast   { animation: toastIn 0.3s ease both; }
        .live-dot-outer  { position:relative; display:inline-block; }
        .live-dot-outer::before {
          content:''; position:absolute; inset:-3px; border-radius:50%;
          background:#ef4444; animation:pulseRing 2s infinite;
        }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#fff8f0; }
        ::-webkit-scrollbar-thumb { background:#ffb347; border-radius:4px; }
        input[type=range]::-webkit-slider-thumb { background:#FF9933; }
        * { box-sizing:border-box; }
      `}</style>

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-4 inset-x-0 flex justify-center z-[99999] pointer-events-none">
          <div className="animate-toast px-5 py-3 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2"
            style={{
              background: toast.type === 'success' ? '#d1fae5' : toast.type === 'warn' ? '#fff3e0' : '#e0f2fe',
              color: toast.type === 'success' ? '#065f46' : toast.type === 'warn' ? '#92400e' : '#0c4a6e',
              border: '1px solid',
              borderColor: toast.type === 'success' ? '#6ee7b7' : toast.type === 'warn' ? '#fed7aa' : '#bae6fd',
            }}>
            {toast.msg}
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 px-4 py-3"
        style={{ background: 'rgba(255,248,240,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #ffe0b2' }}>
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#FF9933,#ffb347)', boxShadow: '0 4px 14px rgba(255,153,51,0.35)' }}>
              <Flame size={20} color="white" />
            </div>
            <div>
              <h1 className="text-base font-black leading-none"
                style={{ color: '#4a1a00', fontFamily: "'Playfair Display',serif" }}>
                Mandir Seva Hub
              </h1>
              <p className="text-xs mt-0.5" style={{ color: '#b07040' }}>
                {loading ? 'Loading…' : `${events.length} live · ${prasadCount} prasad · ${kirtanCount} kirtan`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={reload} title="Refresh"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: '#fff3e0', color: '#FF9933' }}>
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setShowSupport(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#FF9933,#ffb347)', color: 'white', boxShadow: '0 4px 14px rgba(255,153,51,0.32)' }}>
              <Heart size={12} fill="white" /> Support
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-lg mx-auto px-4 pb-32">

        {/* Hero */}
        <div className="py-5 text-center">
          <h2 className="text-2xl font-black" style={{ color: '#4a1a00', fontFamily: "'Playfair Display',serif" }}>
            🛕 Live Temple Events
          </h2>
          <p className="text-sm mt-1" style={{ color: '#a05020' }}>
            Real-time prasad & kirtan tracker · Auto-expires · Community verified
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-3">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: 'white', border: '1.5px solid #ffe0b2', boxShadow: '0 2px 10px rgba(255,153,51,0.07)' }}>
            <Search size={16} color="#FF9933" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search temples, area, prasad type…"
              className="flex-1 text-sm bg-transparent"
              style={{ outline: 'none', color: '#4a1a00' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ color: '#b07040' }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {FILTER_CHIPS.map(chip => (
            <button key={chip.id} onClick={() => setActiveChip(chip.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all hover:scale-105 active:scale-95 flex-shrink-0"
              style={activeChip === chip.id
                ? { background: 'linear-gradient(135deg,#FF9933,#ffb347)', color: 'white', boxShadow: '0 4px 12px rgba(255,153,51,0.38)' }
                : { background: 'white', color: '#a05020', border: '1.5px solid #ffe0b2' }}>
              {chip.emoji} {chip.label}
            </button>
          ))}
        </div>

        {/* Map toggle */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black" style={{ color: '#e65c00' }}>📍 LIVE MAP</span>
          <button onClick={() => setShowMap(v => !v)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
            style={{ background: showMap ? '#fff3e0' : '#f1f5f9', color: showMap ? '#e65c00' : '#64748b' }}>
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>

        {/* Map */}
        {showMap && (
          <div className="mb-4 animate-fadeIn">
            <MapContainer
              events={filtered.filter(e => e.lat && e.lng)}
              highlightedId={highlighted}
              onMarkerClick={handleMarkerClick}
            />
          </div>
        )}

        {/* Live indicator */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="live-dot-outer">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444', position: 'relative', zIndex: 1 }} />
          </div>
          <span className="text-xs font-black tracking-widest" style={{ color: '#ef4444' }}>LIVE</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right,#ffe0b2,transparent)' }} />
          <span className="text-xs font-semibold" style={{ color: '#b07040' }}>
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}
            {(search || activeChip !== 'all') ? ' (filtered)' : ''}
          </span>
        </div>

        {/* Loading */}
        {loading && !events.length && (
          <div className="text-center py-16">
            <Loader size={32} color="#FF9933" className="animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold" style={{ color: '#a05020' }}>Fetching live events…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl p-5 mb-4 flex items-center gap-3"
            style={{ background: '#fff3e0', border: '1px solid #fde68a' }}>
            <WifiOff size={20} color="#d97706" />
            <div>
              <p className="font-bold text-sm" style={{ color: '#92400e' }}>Connection issue</p>
              <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>{error} — check your Supabase credentials.</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 animate-fadeIn">
            <div className="text-6xl mb-4">🛕</div>
            <h3 className="text-xl font-black mb-2" style={{ color: '#4a1a00', fontFamily: "'Playfair Display',serif" }}>
              {events.length === 0 ? 'No events yet' : 'Nothing matches'}
            </h3>
            <p className="text-sm mb-6" style={{ color: '#b07040' }}>
              {events.length === 0
                ? 'Be the first to add a temple event in your area!'
                : 'Try adjusting your search or changing filters.'}
            </p>
            {events.length === 0 && (
              <button onClick={() => setShowForm(true)}
                className="px-6 py-3 rounded-2xl font-black text-white text-sm transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#FF9933,#ffb347)', boxShadow: '0 6px 20px rgba(255,153,51,0.35)' }}>
                + Add First Event
              </button>
            )}
          </div>
        )}

        {/* Event feed */}
        <div ref={feedRef}>
          {filtered.map((event, i) => (
            <div
              key={event.id}
              ref={el => cardRefs.current[event.id] = el}
              className="animate-slideUp"
              style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
            >
              <TempleCard
                event={event}
                highlighted={highlighted === event.id}
                likedIds={likedIds}
                reportedIds={reportedIds}
                onLike={handleLike}
                onReport={handleReport}
                onClick={handleMarkerClick}
              />
            </div>
          ))}
        </div>

        {/* Stats bar */}
        {!loading && events.length > 0 && (
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { label: 'Live Events', val: events.length,  icon: '📋' },
              { label: 'Prasad',      val: prasadCount,     icon: '🪔' },
              { label: 'Kirtan',      val: kirtanCount,     icon: '🎵' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-3 text-center"
                style={{ background: 'white', border: '1px solid #ffe0b2', boxShadow: '0 2px 8px rgba(255,153,51,0.07)' }}>
                <p className="text-xl">{s.icon}</p>
                <p className="text-2xl font-black" style={{ color: '#FF9933', fontFamily: "'Playfair Display',serif" }}>{s.val}</p>
                <p className="text-xs font-semibold" style={{ color: '#b07040' }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Floating Add Button ── */}
      <div className="fixed bottom-6 inset-x-0 flex justify-center z-40 pointer-events-none">
        <button
          onClick={() => setShowForm(true)}
          className="pointer-events-auto flex items-center gap-2 px-7 py-4 rounded-full font-black text-white text-sm transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg,#FF9933,#ffb347)',
            boxShadow: '0 8px 32px rgba(255,153,51,0.55), 0 2px 8px rgba(255,153,51,0.25)',
          }}>
          <Plus size={20} strokeWidth={3} /> Add Event
        </button>
      </div>

      {/* ── Modals ── */}
      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
      {showForm    && <AddTempleForm onClose={() => setShowForm(false)} onSubmit={handleFormSubmit} />}
    </div>
  );
}
