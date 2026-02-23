// src/components/TempleCard.jsx
import { useState, useRef, useEffect } from 'react';
import {
  MapPin, Clock, ChevronDown, ThumbsDown, Heart,
  AlertTriangle, ExternalLink, Music, Calendar,
  Utensils, Flag, Eye, EyeOff
} from 'lucide-react';
import { formatDistanceToNow, addHours, differenceInMinutes } from 'date-fns';

const OCCASION_COLORS = {
  Puja:       { bg: '#fff3e0', text: '#e65c00', emoji: '🪔' },
  Marriage:   { bg: '#fce7f3', text: '#be185d', emoji: '💍' },
  Annaprasan: { bg: '#e8f5e9', text: '#2e7d32', emoji: '🍚' },
  Kirtan:     { bg: '#ede9fe', text: '#6d28d9', emoji: '🎵' },
  Other:      { bg: '#f0f9ff', text: '#0369a1', emoji: '✨' },
};

export default function TempleCard({
  event, highlighted, onLike, onReport,
  likedIds, reportedIds, onClick,
}) {
  const [expanded, setExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);
  const isLiked    = likedIds.has(event.id);
  const isReported = reportedIds.has(event.id);
  const isPending  = event.status === 'pending' || event.reports >= 5;

  const occ = OCCASION_COLORS[event.occasion_type] || OCCASION_COLORS.Other;

  // Compute expiry countdown
  const expiresAt = addHours(new Date(event.created_at), event.expiry_hours);
  const minsLeft  = differenceInMinutes(expiresAt, new Date());
  const hoursLeft = Math.floor(minsLeft / 60);
  const isExpiringSoon = minsLeft < 60;
  const timeLeftLabel = hoursLeft > 0 ? `${hoursLeft}h ${minsLeft % 60}m` : `${minsLeft}m`;

  // Accordion measurement
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(expanded ? contentRef.current.scrollHeight : 0);
    }
  }, [expanded]);

  const handleCardClick = () => {
    setExpanded(e => !e);
    onClick?.(event);
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-300 mb-3 cursor-pointer ${highlighted ? 'ring-2 ring-offset-2' : ''}`}
      style={{
        background: 'white',
        border: highlighted ? '2px solid #FF9933' : '1px solid #ffe0b2',
        boxShadow: highlighted
          ? '0 0 0 3px rgba(255,153,51,0.2), 0 8px 24px rgba(255,153,51,0.15)'
          : '0 2px 12px rgba(255,153,51,0.08)',
        transform: highlighted ? 'scale(1.01)' : 'scale(1)',
        '--tw-ring-color': '#FF9933',
      }}
      onClick={handleCardClick}
    >
      {/* Pending warning */}
      {isPending && (
        <div className="flex items-center gap-2 px-4 py-2"
          style={{ background: '#fff3e0', borderBottom: '1px solid #ffe0b2' }}>
          <AlertTriangle size={12} color="#e65c00" />
          <span className="text-xs font-bold" style={{ color: '#e65c00' }}>
            Community flagged — Content under review
          </span>
          <Eye size={11} color="#e65c00" className="ml-auto" />
        </div>
      )}

      {/* Expiring soon ribbon */}
      {isExpiringSoon && !isPending && (
        <div className="flex items-center gap-2 px-4 py-1.5"
          style={{ background: '#fef3c7', borderBottom: '1px solid #fde68a' }}>
          <Clock size={11} color="#d97706" />
          <span className="text-xs font-bold" style={{ color: '#d97706' }}>
            Expiring in {timeLeftLabel}
          </span>
        </div>
      )}

      {/* Card body */}
      <div className={`transition-all duration-200 ${isPending ? 'blur-[3px] select-none' : ''}`}>

        {/* Collapsed header */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Occasion icon pill */}
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
              style={{ background: occ.bg }}>
              {occ.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-xs font-black"
                  style={{ background: occ.bg, color: occ.text }}>
                  {event.occasion_type}
                </span>
                <span className="text-xs" style={{ color: '#b07040' }}>
                  {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                </span>
              </div>
              <h3 className="font-black text-base leading-snug truncate"
                style={{ color: '#4a1a00', fontFamily: "'Playfair Display', serif" }}>
                {event.name}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-semibold" style={{ color: '#a05020' }}>
                  🍬 {event.prasad_type || 'Prasad'}
                </span>
                {event.location_name && (
                  <span className="text-xs flex items-center gap-1 truncate" style={{ color: '#b07040' }}>
                    <MapPin size={10} /> {event.location_name.split(',')[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Expand icon */}
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{ background: '#fff8f0', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <ChevronDown size={16} color="#FF9933" />
            </div>
          </div>
        </div>

        {/* Accordion expanded content */}
        <div
          style={{
            maxHeight: contentHeight,
            overflow: 'hidden',
            transition: 'max-height 0.38s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <div ref={contentRef}>
            <div className="px-4 pb-4" style={{ borderTop: '1px solid #fff3e0' }}>
              <div className="pt-3 space-y-3">

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-2">
                  {event.puja_details && (
                    <div className="rounded-xl p-3" style={{ background: '#fff8f0' }}>
                      <p className="text-xs font-black mb-0.5" style={{ color: '#FF9933' }}>Puja / Event</p>
                      <p className="text-sm font-semibold" style={{ color: '#4a1a00' }}>{event.puja_details}</p>
                    </div>
                  )}
                  <div className="rounded-xl p-3" style={{ background: '#fff8f0' }}>
                    <p className="text-xs font-black mb-0.5" style={{ color: '#FF9933' }}>Prasad</p>
                    <p className="text-sm font-semibold" style={{ color: '#4a1a00' }}>{event.prasad_type}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: '#fff8f0' }}>
                    <p className="text-xs font-black mb-0.5" style={{ color: '#FF9933' }}>Expires</p>
                    <p className="text-sm font-semibold" style={{ color: isExpiringSoon ? '#d97706' : '#4a1a00' }}>
                      {timeLeftLabel} left
                    </p>
                  </div>
                </div>

                {/* Kirtan dates */}
                {event.kirtan_start_date && (
                  <div className="rounded-xl p-3 flex items-center gap-3"
                    style={{ background: '#ede9fe', border: '1px solid #ddd6fe' }}>
                    <Music size={16} color="#7c3aed" />
                    <div>
                      <p className="text-xs font-black" style={{ color: '#7c3aed' }}>Kirtan Duration</p>
                      <p className="text-sm font-semibold" style={{ color: '#4a1a00' }}>
                        {new Date(event.kirtan_start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        {event.kirtan_end_date && ` → ${new Date(event.kirtan_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Location link */}
                {event.lat && event.lng ? (
                  <a
                    href={`https://www.google.com/maps?q=${event.lat},${event.lng}`}
                    target="_blank" rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-2 rounded-xl p-3 transition-all hover:opacity-80"
                    style={{ background: '#e8f5e9', border: '1px solid #c8e6c9' }}>
                    <MapPin size={14} color="#2e7d32" />
                    <span className="text-sm font-semibold flex-1 truncate" style={{ color: '#1b5e20' }}>
                      {event.location_name}
                    </span>
                    <ExternalLink size={12} color="#2e7d32" />
                  </a>
                ) : event.location_name ? (
                  <div className="flex items-center gap-2 rounded-xl p-3"
                    style={{ background: '#f1f5f9' }}>
                    <MapPin size={14} color="#64748b" />
                    <span className="text-sm" style={{ color: '#475569' }}>{event.location_name}</span>
                  </div>
                ) : null}

                {/* Description */}
                {event.description && (
                  <p className="text-sm leading-relaxed px-1" style={{ color: '#6d3a00' }}>
                    {event.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2"
                  onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onLike(event)}
                    disabled={isLiked}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                    style={{
                      background: isLiked ? '#fee2e2' : '#fff3e0',
                      color: isLiked ? '#e11d48' : '#e65c00',
                      border: '1px solid',
                      borderColor: isLiked ? '#fecdd3' : '#ffe0b2',
                    }}>
                    <Heart size={13} fill={isLiked ? '#e11d48' : 'none'} />
                    {event.likes} {isLiked ? 'Liked!' : 'Like'}
                  </button>

                  <button
                    onClick={() => onReport(event)}
                    disabled={isReported}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                    style={{
                      background: isReported ? '#f1f5f9' : '#fff8f0',
                      color: isReported ? '#64748b' : '#b07040',
                      border: '1px solid #e2e8f0',
                    }}>
                    <Flag size={11} />
                    {isReported ? 'Reported' : `Report (${event.reports})`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
