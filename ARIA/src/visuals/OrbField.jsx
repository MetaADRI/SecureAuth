import { useEffect, useRef, useMemo } from 'react';
import './OrbField.css';

const PALETTE = [
  { r: 79, g: 209, b: 255 },   // cyan
  { r: 157, g: 111, b: 255 },  // violet
  { r: 79, g: 209, b: 255 },
  { r: 120, g: 160, b: 255 },
  { r: 157, g: 111, b: 255 },
];

const GOLD = { r: 240, g: 199, b: 94 };

function seeded(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function createOrbs(count) {
  const orbs = [];
  for (let i = 0; i < count; i++) {
    const layer = i % 3; // 0 fg, 1 mid, 2 bg
    const depth = layer === 0 ? 0.95 : layer === 1 ? 0.55 : 0.25;
    orbs.push({
      id: i,
      layer,
      depth,
      baseX: seeded(i) * 120 - 10,
      baseY: seeded(i + 20) * 120 - 10,
      size: (layer === 0 ? 90 : layer === 1 ? 140 : 200) + seeded(i + 40) * 60,
      phase: seeded(i + 60) * Math.PI * 2,
      speed: 0.35 + seeded(i + 80) * 0.55,
      colorIdx: Math.floor(seeded(i + 100) * PALETTE.length),
      mergePartner: i % 5 === 0 && i + 1 < count ? i + 1 : null,
    });
  }
  return orbs;
}

/**
 * Fixed 3D/4D orb background.
 * @param {number} intensity 0–1 animation amplitude
 * @param {number} speed 0–1 time scale
 * @param {boolean} celebrate gold burst mode
 */
export default function OrbField({
  intensity = 0.85,
  speed = 1,
  celebrate = false,
  className = '',
}) {
  const rootRef = useRef(null);
  const orbsRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef(0);
  const t0Ref = useRef(performance.now());
  const visibleRef = useRef(true);

  const orbCount = 20;
  const orbs = useMemo(() => createOrbs(orbCount), []);

  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    const onVis = () => {
      visibleRef.current = document.visibilityState === 'visible';
      if (visibleRef.current) t0Ref.current = performance.now() - (rafRef.current || 0);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  useEffect(() => {
    const nodes = orbsRef.current?.querySelectorAll('.orb');
    if (!nodes || !nodes.length) return;

    let last = performance.now();

    const tick = (now) => {
      if (!visibleRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = ((now - t0Ref.current) / 1000) * speed;

      const mx = (mouseRef.current.x - 0.5) * 2;
      const my = (mouseRef.current.y - 0.5) * 2;

      // Merge pulse every ~17s
      const mergeCycle = 17;
      const mergePhase = (t % mergeCycle) / mergeCycle;
      const mergeActive = mergePhase > 0.35 && mergePhase < 0.55;
      const mergeAmt = mergeActive
        ? Math.sin(((mergePhase - 0.35) / 0.2) * Math.PI)
        : 0;

      orbs.forEach((orb, i) => {
        const el = nodes[i];
        if (!el) return;

        // Non-repeating organic motion — offset sine waves
        const s1 = Math.sin(t * 0.12 * orb.speed + orb.phase);
        const s2 = Math.sin(t * 0.07 * orb.speed + orb.phase * 1.7);
        const s3 = Math.cos(t * 0.09 * orb.speed + orb.phase * 0.6);

        let x = orb.baseX + s1 * 6 * intensity + s2 * 3 * intensity;
        let y = orb.baseY + s3 * 5 * intensity + s1 * 2 * intensity;

        // Depth-based parallax — cursor moves orbs independently
        const parallax = orb.depth * 30 * intensity;
        x += mx * parallax;
        y += my * parallax;

        // Size / opacity breathing (20–40s cycle feel via slow waves)
        const sizeWave = 1 + s2 * 0.12 * intensity + s3 * 0.06 * intensity;
        const opacityWave = 0.35 + orb.depth * 0.4 + s1 * 0.08 * intensity;

        // Color drift cyan ↔ violet
        const cA = PALETTE[orb.colorIdx];
        const cB = PALETTE[(orb.colorIdx + 1) % PALETTE.length];
        const mix = (Math.sin(t * 0.05 + orb.phase) + 1) / 2;
        let r = cA.r + (cB.r - cA.r) * mix;
        let g = cA.g + (cB.g - cA.g) * mix;
        let b = cA.b + (cB.b - cA.b) * mix;

        // Merge / split: pull partner pair together + shared glow
        if (orb.mergePartner != null && mergeAmt > 0) {
          const partner = orbs[orb.mergePartner];
          if (partner) {
            const px =
              partner.baseX +
              Math.sin(t * 0.12 * partner.speed + partner.phase) * 6 * intensity;
            const py =
              partner.baseY +
              Math.cos(t * 0.09 * partner.speed + partner.phase * 0.6) * 5 * intensity;
            x = x + (px - x) * 0.35 * mergeAmt;
            y = y + (py - y) * 0.35 * mergeAmt;
          }
        }

        // Celebration: gold accent burst
        if (celebrate) {
          const burst = 0.55 + 0.45 * Math.sin(t * 4 + orb.phase);
          r = r + (GOLD.r - r) * burst;
          g = g + (GOLD.g - g) * burst;
          b = b + (GOLD.b - b) * burst;
        }

        const scale = sizeWave * (0.7 + orb.depth * 0.45);
        const blur =
          orb.layer === 0 ? 0 : orb.layer === 1 ? 8 : 18;
        const z = Math.round(orb.depth * 100);

        el.style.transform = `translate3d(${x}vw, ${y}vh, ${z}px) scale(${scale})`;
        el.style.opacity = String(
          Math.max(0.15, Math.min(0.95, opacityWave + (celebrate ? 0.15 : 0) + mergeAmt * 0.15))
        );
        el.style.filter = `blur(${blur}px)`;
        el.style.background = `
          radial-gradient(circle at 35% 30%,
            rgba(255,255,255,0.55) 0%,
            rgba(${r|0},${g|0},${b|0},0.75) 28%,
            rgba(${r|0},${g|0},${b|0},0.35) 55%,
            rgba(${r|0},${g|0},${b|0},0) 72%)
        `;
        el.style.boxShadow = celebrate
          ? `0 0 ${40 + orb.depth * 40}px rgba(${GOLD.r},${GOLD.g},${GOLD.b},0.45)`
          : `0 0 ${30 + orb.depth * 30}px rgba(${r|0},${g|0},${b|0},0.35),
             inset 0 0 20px rgba(255,255,255,0.12)`;
        el.style.width = `${orb.size}px`;
        el.style.height = `${orb.size}px`;
      });

      // Perspective tilt follows cursor — orbs feel 3D
      if (rootRef.current) {
        const rx = my * -10 * intensity;
        const ry = mx * 10 * intensity;
        rootRef.current.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.05)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [orbs, intensity, speed, celebrate]);

  return (
    <div className={`orb-field ${className}`} aria-hidden="true">
      <div className="orb-field__base" />
      <div className="orb-field__stage" ref={rootRef}>
        <div className="orb-field__orbs" ref={orbsRef}>
          {orbs.map((orb) => (
            <div
              key={orb.id}
              className={`orb orb--layer-${orb.layer}`}
              style={{
                width: orb.size,
                height: orb.size,
                willChange: 'transform, opacity',
              }}
            />
          ))}
        </div>
      </div>
      <div className="orb-field__vignette" />
    </div>
  );
}
