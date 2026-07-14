import { useEffect, useRef, useState } from 'react';
import { getRankForXp } from '../../../gamification/ranks.js';

export default function CertificateModal({ studentName, xp, rank, onClose }) {
  const canvasRef = useRef(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0a0e1a');
    grad.addColorStop(0.5, '#0d1526');
    grad.addColorStop(1, '#121c32');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Border glow
    ctx.strokeStyle = 'rgba(240, 199, 94, 0.6)';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(240, 199, 94, 0.35)';
    ctx.shadowBlur = 20;
    ctx.strokeRect(20, 20, w - 40, h - 40);
    ctx.shadowBlur = 0;

    // Inner border
    ctx.strokeStyle = 'rgba(79, 209, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(35, 35, w - 70, h - 70);

    // Title
    ctx.fillStyle = '#f0c75e';
    ctx.font = 'bold 36px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(240, 199, 94, 0.5)';
    ctx.shadowBlur = 15;
    ctx.fillText('Certificate of Completion', w / 2, 100);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.fillStyle = '#8b9bb8';
    ctx.font = '16px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('ARIA Cybersecurity Academy', w / 2, 135);

    // Student name
    ctx.fillStyle = '#e8eef8';
    ctx.font = 'bold 28px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(studentName || 'Student', w / 2, 200);

    // Awarded text
    ctx.fillStyle = '#8b9bb8';
    ctx.font = '18px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('has successfully completed the', w / 2, 238);
    ctx.fillStyle = '#4fd1ff';
    ctx.font = 'bold 22px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('Student Path', w / 2, 272);

    // Details
    ctx.fillStyle = '#8b9bb8';
    ctx.font = '15px "Segoe UI", system-ui, sans-serif';
    const dateStr = new Date().toLocaleDateString('en-ZA', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    ctx.fillText(`Completed: ${dateStr}`, w / 2, 320);

    // Rank & XP
    ctx.fillText(
      `Rank: ${rank.name}  ·  XP Earned: ${xp}`,
      w / 2, 350
    );

    // Seal / ARIA logo
    ctx.fillStyle = 'rgba(79, 209, 255, 0.2)';
    ctx.font = 'bold 48px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('ARIA', w / 2, 420);

    // Footer
    ctx.fillStyle = 'rgba(240, 199, 94, 0.5)';
    ctx.font = '12px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('SecureAuth Dissertation Project', w / 2, 470);
  }, [studentName, xp, rank]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `ARIA-Certificate-${studentName || 'Student'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setDownloaded(true);
  };

  return (
    <div className="certificate-overlay" onClick={onClose}>
      <div className="certificate-modal glass glass--gold" onClick={(e) => e.stopPropagation()}>
        <div className="certificate-burst text-gold">Path Complete</div>
        <h2>Your Certificate</h2>

        <canvas
          ref={canvasRef}
          width={560}
          height={500}
          className="certificate-canvas"
          style={{
            width: '100%',
            maxWidth: '560px',
            height: 'auto',
            aspectRatio: '560 / 500',
            borderRadius: '12px',
          }}
        />

        <div className="certificate__actions">
          <button
            type="button"
            className={`btn ${downloaded ? 'btn--gold' : 'btn--primary'}`}
            onClick={handleDownload}
          >
            {downloaded ? '✓ Downloaded!' : 'Download Certificate (PNG)'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
