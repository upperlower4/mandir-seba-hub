// src/components/SupportModal.jsx
import { useState } from 'react';
import { X, Copy, Check, Coffee, Mail, Github, Heart, Sparkles } from 'lucide-react';

export default function SupportModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  const upi = 'devmandir@upi';

  const copy = async () => {
    await navigator.clipboard.writeText(upi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(160deg, #fffbf5 0%, #fff8ee 60%, #fff3e0 100%)',
          animation: 'modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Decorative top bar */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #FF9933, #ffb347, #FF9933)' }} />

        {/* Glow blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #FF9933, transparent 70%)', transform: 'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #ffb347, transparent 70%)', transform: 'translate(-30%,30%)' }} />

        <div className="relative p-7">
          {/* Close */}
          <button onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,153,51,0.12)', color: '#FF9933' }}>
            <X size={15} />
          </button>

          {/* Avatar + title */}
          <div className="text-center mb-6">
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: 'linear-gradient(135deg,#FF9933,#ffb347)', boxShadow: '0 10px 30px rgba(255,153,51,0.4)' }}>
                <Sparkles size={36} color="white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: '#e74c3c' }}>
                <Heart size={12} color="white" fill="white" />
              </div>
            </div>
            <h2 className="text-2xl font-black" style={{ color: '#7c2d00', fontFamily: "'Playfair Display', serif" }}>
              Support Dev 🙏
            </h2>
            <p className="text-sm mt-1" style={{ color: '#a05020' }}>
              Built with devotion for the community
            </p>
          </div>

          {/* UPI Block */}
          <div className="rounded-2xl p-4 mb-3"
            style={{ background: 'rgba(255,153,51,0.08)', border: '1.5px solid rgba(255,153,51,0.2)' }}>
            <p className="text-xs font-black mb-2 tracking-widest" style={{ color: '#FF9933' }}>UPI · DONATE</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm px-3 py-2.5 rounded-xl font-mono"
                style={{ background: 'white', color: '#7c2d00', letterSpacing: '0.03em' }}>
                {upi}
              </code>
              <button onClick={copy}
                className="px-3 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                style={{ background: copied ? '#22c55e' : '#FF9933', color: 'white', minWidth: 72 }}>
                {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
          </div>

          {/* Links */}
          {[
            { icon: Coffee, label: 'Buy me a chai ☕', href: 'https://buymeacoffee.com', color: '#FF9933' },
            { icon: Mail,   label: 'dev@mandirsevas.app', href: 'mailto:dev@mandirsevas.app', color: '#3b82f6' },
            { icon: Github, label: 'github.com/mandirsevas', href: 'https://github.com', color: '#1f2937' },
          ].map(({ icon: Icon, label, href, color }) => (
            <a key={href} href={href} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl p-3 mb-2 transition-all hover:scale-[1.02] hover:shadow-md"
              style={{ background: 'rgba(255,153,51,0.06)', border: '1px solid rgba(255,153,51,0.12)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: color }}>
                <Icon size={16} color="white" />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#4a1a00' }}>{label}</span>
            </a>
          ))}

          <p className="text-center text-xs mt-4" style={{ color: '#c07040' }}>
            🛕 Jai Shri Ram · Har Har Mahadev · Your support is a blessing
          </p>
        </div>
      </div>
    </div>
  );
}
