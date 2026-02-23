// src/components/AddTempleForm.jsx
import { useState } from 'react';
import { X, Loader, CheckCircle, ChevronRight, ChevronLeft, MapPin, Clock, Music } from 'lucide-react';
import { PlacesAutocomplete } from './MapContainer';

const PRASAD_OPTIONS  = ['Khichuri', 'Puspanno', 'Onno (Rice)', 'Ladoo', 'Halwa', 'Modak', 'Panchamrit', 'Fruits', 'Other…'];
const OCCASION_OPTIONS = ['Puja', 'Marriage', 'Annaprasan', 'Kirtan', 'Other'];
const DURATION_OPTIONS = [
  { label: '6 hours',  value: 6  },
  { label: '12 hours', value: 12 },
  { label: '24 hours', value: 24 },
  { label: '48 hours', value: 48 },
];

const inputStyle = (err) => ({
  background: '#fff8f0',
  border: `1.5px solid ${err ? '#ef4444' : '#ffe0b2'}`,
  color: '#4a1a00',
  outline: 'none',
  borderRadius: '1rem',
  padding: '12px 16px',
  fontSize: 14,
  width: '100%',
  transition: 'border-color 0.2s',
});

const selectStyle = {
  ...inputStyle(false),
  appearance: 'none',
  cursor: 'pointer',
};

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-xs font-black mb-1.5 block tracking-wide" style={{ color: '#e65c00' }}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs mt-1 font-semibold" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  );
}

export default function AddTempleForm({ onClose, onSubmit }) {
  const [step, setSt] = useState(1);
  const TOTAL_STEPS = 3;

  const [form, setForm] = useState({
    name: '', location_name: '', lat: null, lng: null,
    prasad_type: '', custom_prasad: '',
    occasion_type: '', puja_details: '',
    description: '',
    expiry_hours: 24,
    kirtan_start_date: '', kirtan_end_date: '',
  });
  const [errors, setErr] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const clearErr = (k) => setErr(e => { const n = {...e}; delete n[k]; return n; });

  // ── Validation ──────────────────────────────────────────────
  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.name.trim())         e.name = 'Temple name is required';
      if (!form.location_name.trim()) e.location_name = 'Location is required';
    }
    if (s === 2) {
      if (!form.prasad_type)   e.prasad_type = 'Select a prasad type';
      if (form.prasad_type === 'Other…' && !form.custom_prasad.trim()) e.custom_prasad = 'Enter custom prasad name';
      if (!form.occasion_type) e.occasion_type = 'Select an occasion';
      if (form.occasion_type === 'Puja' && !form.puja_details.trim()) e.puja_details = 'Enter which puja';
    }
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setSt(s => Math.min(s+1, TOTAL_STEPS)); };
  const prev = () => setSt(s => Math.max(s-1, 1));

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate(step)) return;
    setSaving(true);
    const prasadFinal = form.prasad_type === 'Other…' ? form.custom_prasad : form.prasad_type;
    const payload = {
      name:             form.name.trim(),
      location_name:    form.location_name.trim(),
      lat:              form.lat,
      lng:              form.lng,
      prasad_type:      prasadFinal,
      occasion_type:    form.occasion_type,
      puja_details:     form.puja_details.trim() || null,
      description:      form.description.trim() || null,
      expiry_hours:     form.expiry_hours,
      kirtan_start_date: form.kirtan_start_date || null,
      kirtan_end_date:   form.kirtan_end_date || null,
      likes: 0, reports: 0, status: 'active',
    };
    try {
      await onSubmit(payload);
      setDone(true);
      setTimeout(onClose, 1800);
    } catch (err) {
      setErr({ submit: err.message || 'Failed to post. Try again.' });
    } finally {
      setSaving(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────
  if (done) return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-lg rounded-t-3xl p-10 flex flex-col items-center"
        style={{ background: 'white', animation: 'slideUp 0.4s ease' }}>
        <CheckCircle size={64} color="#22c55e" className="mb-4" />
        <h2 className="text-2xl font-black" style={{ color: '#4a1a00', fontFamily: "'Playfair Display',serif" }}>
          Posted! 🙏
        </h2>
        <p className="text-sm mt-2" style={{ color: '#a05020' }}>Jai Shri Ram — Your seva is live</p>
      </div>
    </div>
  );

  // ── Step indicator ───────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(7px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-t-3xl shadow-2xl"
        style={{ background: 'white', maxHeight: '94vh', overflowY: 'auto', animation: 'slideUp 0.38s cubic-bezier(0.34,1.2,0.64,1)' }}>

        {/* Header */}
        <div className="sticky top-0 z-10 rounded-t-3xl px-5 pt-5 pb-4"
          style={{ background: 'linear-gradient(135deg,#FF9933,#ffb347)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-black text-white" style={{ fontFamily: "'Playfair Display',serif" }}>
                🛕 Add Temple Event
              </h2>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Step {step} of {TOTAL_STEPS}</p>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              <X size={18} color="white" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: 'white' }} />
          </div>
        </div>

        <div className="p-5 space-y-4">

          {/* ── STEP 1: Temple & Location ─────────────────── */}
          {step === 1 && (
            <>
              <Field label="Temple Name *" error={errors.name}>
                <PlacesAutocomplete
                  value={form.name}
                  onChange={v => { set('name', v); clearErr('name'); }}
                  onPlaceSelected={({ name, location_name, lat, lng }) => {
                    setForm(f => ({ ...f, name, location_name, lat, lng }));
                    clearErr('name'); clearErr('location_name');
                  }}
                  placeholder="e.g. ISKCON Temple, Juhu"
                  style={inputStyle(errors.name)}
                />
              </Field>

              <Field label="Location / Address *" error={errors.location_name}>
                <input
                  value={form.location_name}
                  onChange={e => { set('location_name', e.target.value); clearErr('location_name'); }}
                  placeholder="e.g. Juhu, Mumbai, Maharashtra"
                  style={inputStyle(errors.location_name)}
                />
              </Field>

              {form.lat && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                  <MapPin size={12} /> Location pinned on map ({form.lat.toFixed(4)}, {form.lng.toFixed(4)})
                </div>
              )}

              <Field label="Description (optional)">
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Details about prasad distribution, timing, special notes..."
                  rows={3}
                  style={{ ...inputStyle(false), resize: 'none' }}
                />
              </Field>
            </>
          )}

          {/* ── STEP 2: Occasion & Prasad ─────────────────── */}
          {step === 2 && (
            <>
              <Field label="Occasion Type *" error={errors.occasion_type}>
                <select value={form.occasion_type}
                  onChange={e => { set('occasion_type', e.target.value); clearErr('occasion_type'); }}
                  style={selectStyle}>
                  <option value="">Select Occasion</option>
                  {OCCASION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>

              {/* Conditional: Which Puja? */}
              {form.occasion_type === 'Puja' && (
                <Field label="Which Puja? *" error={errors.puja_details}>
                  <input
                    value={form.puja_details}
                    onChange={e => { set('puja_details', e.target.value); clearErr('puja_details'); }}
                    placeholder="e.g. Satyanarayan Katha, Rudrabhishek, Mangala Aarti"
                    style={inputStyle(errors.puja_details)}
                  />
                </Field>
              )}

              {/* Kirtan date range */}
              {form.occasion_type === 'Kirtan' && (
                <div>
                  <label className="text-xs font-black mb-2 flex items-center gap-1.5" style={{ color: '#7c3aed' }}>
                    <Music size={12} /> Kirtan Duration
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start Date">
                      <input type="date" value={form.kirtan_start_date}
                        onChange={e => set('kirtan_start_date', e.target.value)}
                        style={inputStyle(false)} />
                    </Field>
                    <Field label="End Date">
                      <input type="date" value={form.kirtan_end_date}
                        onChange={e => set('kirtan_end_date', e.target.value)}
                        style={inputStyle(false)} />
                    </Field>
                  </div>
                </div>
              )}

              <Field label="Prasad Category *" error={errors.prasad_type}>
                <select value={form.prasad_type}
                  onChange={e => { set('prasad_type', e.target.value); clearErr('prasad_type'); }}
                  style={selectStyle}>
                  <option value="">Select Prasad Type</option>
                  {PRASAD_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>

              {/* Custom prasad input */}
              {form.prasad_type === 'Other…' && (
                <Field label="Custom Prasad Name *" error={errors.custom_prasad}>
                  <input
                    value={form.custom_prasad}
                    onChange={e => { set('custom_prasad', e.target.value); clearErr('custom_prasad'); }}
                    placeholder="Enter prasad name"
                    style={inputStyle(errors.custom_prasad)}
                  />
                </Field>
              )}
            </>
          )}

          {/* ── STEP 3: Event Duration ────────────────────── */}
          {step === 3 && (
            <>
              <div>
                <label className="text-xs font-black mb-3 flex items-center gap-2" style={{ color: '#e65c00' }}>
                  <Clock size={12} /> Post stays live for…
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {DURATION_OPTIONS.map(d => (
                    <button key={d.value} onClick={() => set('expiry_hours', d.value)}
                      className="py-4 rounded-2xl font-black text-sm transition-all hover:scale-[1.03] active:scale-[0.97]"
                      style={form.expiry_hours === d.value
                        ? { background: 'linear-gradient(135deg,#FF9933,#ffb347)', color: 'white', boxShadow: '0 6px 18px rgba(255,153,51,0.38)' }
                        : { background: '#fff8f0', color: '#a05020', border: '1.5px solid #ffe0b2' }}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview card */}
              <div className="rounded-2xl p-4 mt-2"
                style={{ background: '#fff8f0', border: '1.5px solid #ffe0b2' }}>
                <p className="text-xs font-black mb-2" style={{ color: '#FF9933' }}>PREVIEW</p>
                <p className="font-black text-base" style={{ color: '#4a1a00', fontFamily: "'Playfair Display',serif" }}>
                  {form.name || '—'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#a05020' }}>
                  🍬 {form.prasad_type === 'Other…' ? form.custom_prasad : form.prasad_type} ·
                  {' '}{form.occasion_type} ·
                  {' '}expires in {form.expiry_hours}h
                </p>
                {form.location_name && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#b07040' }}>
                    <MapPin size={10} /> {form.location_name}
                  </p>
                )}
              </div>

              {errors.submit && (
                <div className="rounded-xl p-3 text-sm font-semibold"
                  style={{ background: '#fee2e2', color: '#b91c1c' }}>
                  ⚠️ {errors.submit}
                </div>
              )}
            </>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-2 pb-3">
            {step > 1 && (
              <button onClick={prev}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                style={{ background: '#fff3e0', color: '#e65c00', border: '1.5px solid #ffe0b2' }}>
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <button
              onClick={step < TOTAL_STEPS ? next : handleSubmit}
              disabled={saving}
              className="flex-1 py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.97] disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg,#FF9933,#ffb347)', boxShadow: '0 6px 20px rgba(255,153,51,0.38)' }}>
              {saving
                ? <><Loader size={16} className="animate-spin" /> Posting…</>
                : step < TOTAL_STEPS
                  ? <>Next <ChevronRight size={16} /></>
                  : '🙏 Post Event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
