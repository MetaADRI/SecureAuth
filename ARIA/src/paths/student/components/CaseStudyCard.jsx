import { useState } from 'react';

const INCIDENTS = [
  {
    id: 'zambia',
    title: 'Bank of Zambia & Zanaco Clop Ransomware',
    date: 'November 2025',
    stages: [
      {
        label: 'Initial access',
        description:
          'The Clop ransomware group exploited a known vulnerability in file-transfer software (MOVEit). The attackers gained access to internal banking systems through unpatched infrastructure.',
      },
      {
        label: 'Lateral movement',
        description:
          'Once inside, Clop moved across the network, identifying critical systems at both the Bank of Zambia (central bank) and Zanaco (Zambia National Commercial Bank).',
      },
      {
        label: 'Encryption & impact',
        description:
          'Systems were encrypted, halting interbank transfers, ATM services, and branch operations. The Bank of Zambia took systems offline to contain the spread, disrupting national payments for days.',
      },
      {
        label: 'Response & recovery',
        description:
          'Both banks isolated affected systems, engaged cybersecurity teams, and worked with international partners. Services were gradually restored over several days. The attackers exfiltrated data before encryption.',
      },
    ],
    lesson: 'Ransomware can shut down national financial infrastructure. Isolation is the first response, and unpatched software is the most common entry point.',
  },
  {
    id: 'coinbase',
    title: 'Coinbase 2025 Breach',
    date: 'Early 2025',
    stages: [
      {
        label: 'Reconnaissance',
        description:
          'Attackers researched Coinbase employees on LinkedIn and other professional networks, identifying targets in IT and support roles with access to sensitive systems.',
      },
      {
        label: 'Vishing attack',
        description:
          'Employees received convincing phone calls from attackers impersonating Coinbase IT staff. The callers claimed there was an account issue requiring immediate credential verification.',
      },
      {
        label: 'Credential compromise',
        description:
          'Several employees entered their credentials into a phishing site that mimicked the Coinbase internal portal. The attackers used these to access internal systems.',
      },
      {
        label: 'Containment & disclosure',
        description:
          'Coinbase detected unusual activity within hours, revoked affected credentials, and forced password resets. They disclosed the breach publicly, noting that customer funds were not compromised.',
      },
    ],
    lesson: 'Even well-resourced crypto platforms are vulnerable to social engineering. Technical security controls fail when employees are manipulated into handing over credentials.',
  },
  {
    id: 'mands',
    title: 'Marks & Spencer April 2025 Incident',
    date: 'April 2025',
    stages: [
      {
        label: 'Unauthorised access',
        description:
          'Attackers gained access to customer accounts through credential stuffing — using credentials leaked from other breaches to log into M&S accounts.',
      },
      {
        label: 'Account takeover',
        description:
          'Hijacked accounts were used to view personal details including names, addresses, order history, and loyalty card information. The attackers exploited password reuse across services.',
      },
      {
        label: 'Detection',
        description:
          'M&S security systems flagged unusual login patterns — multiple accounts accessed from similar IP addresses in rapid succession.',
      },
      {
        label: 'Response',
        description:
          'M&S forced password resets on affected accounts, notified customers, and recommended enabling two-factor authentication. The incident disrupted both online and in-store operations temporarily.',
      },
    ],
    lesson: 'Credential stuffing works because people reuse passwords. A breach on one platform cascades into account takeovers everywhere. Unique passwords per service prevent this.',
  },
];

export default function CaseStudyCard({ onReflection }) {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [reflectionAnswer, setReflectionAnswer] = useState(null);

  const handleReflection = (idx) => {
    setReflectionAnswer(idx);
    onReflection?.();
  };

  if (!selectedIncident) {
    return (
      <div className="case-study-select">
        <h3 className="phase__lead">Choose a real incident to examine. Each teaches a different security lesson.</h3>
        <div className="case-study-grid">
          {INCIDENTS.map((inc) => (
            <button
              key={inc.id}
              type="button"
              className="case-study-card glass glass--hot"
              onClick={() => setSelectedIncident(inc)}
            >
              <span className="case-study__date text-muted">{inc.date}</span>
              <h3>{inc.title}</h3>
              <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
                Click to examine the attack chain
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="case-study-detail">
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => {
          setSelectedIncident(null);
          setReflectionAnswer(null);
        }}
        style={{ marginBottom: '1rem' }}
      >
        ← Back to case studies
      </button>

      <div className="glass glass--strong" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {selectedIncident.date}
        </span>
        <h2 style={{ margin: '0.3rem 0 0.75rem' }}>{selectedIncident.title}</h2>

        <div className="timeline">
          {selectedIncident.stages.map((stage, i) => (
            <div key={i} className="timeline__stage">
              <div className="timeline__marker">
                <span className="timeline__num">{i + 1}</span>
              </div>
              <div className="timeline__content">
                <h4 className="timeline__label">{stage.label}</h4>
                <p className="text-muted">{stage.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="case-study__lesson glass" style={{ padding: '1rem', marginTop: '1rem' }}>
          <strong className="text-violet">Lesson:</strong>
          <p className="text-muted" style={{ marginTop: '0.3rem', lineHeight: '1.5' }}>
            {selectedIncident.lesson}
          </p>
        </div>
      </div>

      <div className="case-study__reflection glass" style={{ padding: '1.25rem' }}>
        <h4>Quick reflection</h4>
        <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
          What is the single most important practice that would prevent attacks like these?
        </p>
        <div className="quiz-question__options">
          {[
            'Use unique passwords for every account and enable 2FA',
            'Install more antivirus software',
            'Block all incoming email attachments',
            'Only use mobile apps instead of websites',
          ].map((opt, i) => (
            <button
              key={i}
              type="button"
              className={`quiz-option ${reflectionAnswer !== null ? (i === 0 ? 'quiz-option--correct' : 'quiz-option--dim') : ''}`}
              onClick={() => handleReflection(i)}
              disabled={reflectionAnswer !== null}
            >
              {opt}
            </button>
          ))}
        </div>
        {reflectionAnswer !== null && (
          <p className="text-cyan" style={{ marginTop: '0.75rem' }}>
            Correct. Unique passwords prevent credential stuffing, and 2FA stops most account takeovers even if a password is stolen.
          </p>
        )}
      </div>
    </div>
  );
}
