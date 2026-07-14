import { useState } from 'react';

const MESSAGES = [
  {
    id: 'msg1',
    from: 'IT Support <it-support@secureauth.co.za>',
    subject: 'Action Required: Password Expiry',
    body: 'Dear staff member,\n\nYour email password will expire in 24 hours. Click below to keep your current password.\n\nKeep my password → http://secureauth-passreset.xyz\n\nIT Helpdesk',
    flags: [
      { label: 'Suspicious link domain (secureauth-passreset.xyz not secureauth.co.za)', index: 4 },
      { label: 'Urgency tactic — "24 hours" pressure', index: 2 },
    ],
    legitimate: false,
  },
  {
    id: 'msg2',
    from: 'LinkedIn <notifications@linkedin.com>',
    subject: 'You have 3 new connection requests',
    body: 'Hi Alex,\n\nThree people want to connect with you on LinkedIn. View their profiles and decide.\n\nSee who wants to connect →\n\nThe LinkedIn Team',
    flags: [
      { label: 'Generic greeting "Hi Alex" could be guessable', index: 1 },
    ],
    legitimate: true,
  },
  {
    id: 'msg3',
    from: 'SASSA Grants <sassa-grants@mweb.co.zw>',
    subject: 'URGENT: COVID-19 Relief Payment',
    body: 'DEAR CITIZEN,\n\nYOU ARE ELIGIBLE FOR A COVID-19 RELIEF PAYMENT OF R2,500. THIS IS A FINAL NOTICE. CLICK HERE TO CLAIM YOUR PAYMENT NOW → http://bit.ly/3xR7s9K\n\nACT NOW OR LOSE THIS OPPORTUNITY.',
    flags: [
      { label: 'Mweb.co.zw is not an official government domain', index: 0 },
      { label: 'All caps urgency and "FINAL NOTICE" pressure', index: 2 },
      { label: 'Shortened bit.ly link hides the real destination', index: 4 },
      { label: 'Generic "DEAR CITIZEN" instead of your name', index: 1 },
    ],
    legitimate: false,
  },
  {
    id: 'msg4',
    from: 'Standard Bank <alerts@standardbank.co.za>',
    subject: 'Your monthly statement is ready',
    body: 'Hi Thabo,\n\nYour September statement is now available in the Standard Bank app.\n\nPlease log in to the app or Internet Banking to view your statement.\n\nStandard Bank Team',
    flags: [],
    legitimate: true,
  },
  {
    id: 'msg5',
    from: 'CEO Paul <ceo.paul@thecompany.email>',
    subject: 'Urgent wire transfer needed',
    body: 'Hi,\n\nI am in a meeting and cannot access the banking portal. We need to pay the supplier R45,000 immediately or the deal falls through. Please process this wire transfer now and I will sign off when I am back.\n\nSend to: FNB Acc 62819087623\n\n-Paul\n\nSent from my iPhone',
    flags: [
      { label: 'Unusual sender domain (thecompany.email, not thecompany.co.za)', index: 0 },
      { label: 'Pressure to bypass normal approval process', index: 2 },
      { label: 'Request to send money outside standard procedures', index: 3 },
      { label: '"Sent from my iPhone" is a common spoofing signature', index: 5 },
    ],
    legitimate: false,
  },
];

export default function PhishingSimulator({ onComplete }) {
  const [revealed, setRevealed] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [verdicts, setVerdicts] = useState({});

  const toggleReveal = (id) => {
    if (submitted) return;
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setVerdict = (id, isPhishing) => {
    if (submitted) return;
    setVerdicts((prev) => ({ ...prev, [id]: isPhishing }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    let correct = 0;
    MESSAGES.forEach((m) => {
      if (verdicts[m.id] === !m.legitimate) correct++;
    });
    onComplete?.({ correct, total: MESSAGES.length });
  };

  const allJudged = MESSAGES.every((m) => verdicts[m.id] !== undefined);

  return (
    <div className="phish-sim">
      <h3 className="phase__lead">Review each message. Is it a phishing attempt? Click to reveal red flags, then decide.</h3>

      {MESSAGES.map((m) => {
        const userVerdict = verdicts[m.id];
        const correct = submitted && userVerdict === !m.legitimate;
        const wrong = submitted && !correct;
        return (
          <div
            key={m.id}
            className={`phish-email glass ${revealed[m.id] ? 'phish-email--revealed' : ''} ${submitted ? (correct ? 'phish-email--correct' : 'phish-email--wrong') : ''}`}
          >
            <div className="phish-email__header">
              <span className="phish-email__label text-muted">From:</span>
              <span className="mono">{m.from}</span>
            </div>
            <div className="phish-email__header">
              <span className="phish-email__label text-muted">Subject:</span>
              <span>{m.subject}</span>
            </div>
            <pre className="phish-email__body">{m.body}</pre>

            {!submitted && (
              <div className="phish-email__actions">
                <button
                  type="button"
                  className={`btn btn--ghost ${userVerdict === true ? 'btn--primary' : ''}`}
                  onClick={() => setVerdict(m.id, true)}
                >
                  Phishing
                </button>
                <button
                  type="button"
                  className={`btn btn--ghost ${userVerdict === false ? 'btn--primary' : ''}`}
                  onClick={() => setVerdict(m.id, false)}
                >
                  Legitimate
                </button>
              </div>
            )}

            {submitted && (
              <p className={`phish-email__result ${correct ? 'text-cyan' : ''}`}
                 style={wrong ? { color: '#ff8f8f' } : {}}>
                {correct
                  ? `Correct — ${m.legitimate ? 'this is legitimate' : 'this is phishing'}`
                  : `Missed — ${m.legitimate ? 'this is actually legitimate' : 'this is actually phishing'}`}
              </p>
            )}

            <button
              type="button"
              className="btn btn--ghost"
              style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}
              onClick={() => toggleReveal(m.id)}
              disabled={submitted}
            >
              {revealed[m.id] ? 'Hide red flags' : `Show red flags (${m.flags.length})`}
            </button>

            {revealed[m.id] && m.flags.length > 0 && (
              <ul className="phish-email__flags">
                {m.flags.map((f, i) => (
                  <li key={i}>{f.label}</li>
                ))}
              </ul>
            )}
            {revealed[m.id] && m.flags.length === 0 && (
              <p className="text-muted" style={{ marginTop: '0.4rem', fontSize: '0.85rem' }}>
                No obvious red flags — this one looks legitimate.
              </p>
            )}
          </div>
        );
      })}

      <div className="phase__actions">
        <button
          type="button"
          className="btn btn--primary"
          disabled={!allJudged || submitted}
          onClick={handleSubmit}
        >
          Submit all judgments
        </button>
      </div>
    </div>
  );
}
