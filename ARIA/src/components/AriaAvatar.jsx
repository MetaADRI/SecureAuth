import { useEffect, useRef, useState, useCallback } from 'react';
import { speakMessage, stopSpeaking } from '../core/AriaSpeech.js';
import './AriaAvatar.css';

const EYE_RADIUS = 1.2;

export default function AriaAvatar({ message, speaking = false, compact = false, trackPointer = false }) {
  const rootRef = useRef(null);
  const [eyeOff, setEyeOff] = useState({ x: 0, y: 0 });
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (!trackPointer) { setEyeOff({ x: 0, y: 0 }); return; }
    const onMove = (e) => {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clamped = Math.min(dist, 1);
      const nx = dist > 0 ? (dx / dist) * clamped : 0;
      const ny = dist > 0 ? (dy / dist) * clamped : 0;
      setEyeOff({ x: nx * 2.5, y: ny * 2.5 });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [trackPointer]);

  const toggleListen = useCallback(() => {
    if (listening) {
      stopSpeaking();
      setListening(false);
    } else if (message) {
      speakMessage(message);
      setListening(true);
    }
  }, [listening, message]);

  useEffect(() => {
    if (!listening) return;
    if (!message) { setListening(false); return; }
    speakMessage(message);
    const timer = setInterval(() => {
      if (!window.speechSynthesis || !window.speechSynthesis.speaking) {
        setListening(false);
        clearInterval(timer);
      }
    }, 300);
    return () => clearInterval(timer);
  }, [message]);

  return (
    <div
      ref={rootRef}
      className={`aria-avatar ${compact ? 'aria-avatar--compact' : ''} ${speaking ? 'is-speaking' : ''} ${listening ? 'is-listening' : ''}`}
    >
      <div className="aria-avatar__shield" aria-hidden="true">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(79,209,255,0.18)" stroke="#4fd1ff" />
          <g style={{ transform: `translate(${eyeOff.x}px, ${eyeOff.y}px)`, transition: 'transform 0.1s ease-out' }}>
            <circle className="aria-eye" cx="9.5" cy="10.5" r={EYE_RADIUS} fill="#4fd1ff" />
          </g>
          <g style={{ transform: `translate(${eyeOff.x}px, ${eyeOff.y}px)`, transition: 'transform 0.1s ease-out' }}>
            <circle className="aria-eye" cx="14.5" cy="10.5" r={EYE_RADIUS} fill="#4fd1ff" />
          </g>
          <path d="M9.5 14.5 Q12 16 14.5 14.5" stroke="#4fd1ff" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        </svg>
        {speaking && (
          <span className="aria-avatar__waves--shield">
            <i /><i /><i />
          </span>
        )}
      </div>
      <div className="aria-avatar__body">
        <div className="aria-avatar__name">
          ARIA
          {speaking && <span className="aria-avatar__status">mentoring</span>}
        </div>
        {message && <p className="aria-avatar__message">{message}</p>}
        <button className="aria-avatar__listen-btn" onClick={toggleListen} title={listening ? 'Stop' : 'Read aloud'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {listening ? (
              <>
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </>
            ) : (
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 010 14.14" />
                <path d="M15.54 8.46a5 5 0 010 7.07" />
              </>
            )}
          </svg>
          <span>{listening ? 'Stop' : 'Listen'}</span>
        </button>
      </div>
    </div>
  );
}
