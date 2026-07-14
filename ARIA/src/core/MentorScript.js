/**
 * MentorScript — ARIA's dialogue interface.
 *
 * AI-readiness seam: getAriaResponse(context) -> string
 * Today: static script keyed by lesson/state.
 * Later: swap internals for OpenAI/Claude without touching callers.
 */

const SCRIPTS = {
  // ── Role / shell ──────────────────────────────────────────
  welcome: {
    default:
      "Welcome to the Academy. I'm ARIA — I'll walk you through authentication the way a senior engineer would walk a junior through a production review: why first, then how.",
  },

  role_selected_developer: {
    default:
      "Developer path. Good choice. We'll cover the security decisions that actually ship — hashing, tokens, lockouts, injection, and how you deploy without undoing the work.",
  },

  dashboard_return: {
    default:
      "Back on the board. Your next step is marked — take it when you're ready. Depth beats speed.",
  },

  // ── Lesson 1: Authentication Fundamentals ─────────────────
  auth_fundamentals: {
    intro:
      "Passwords are not secrets you store — they're secrets you verify. If your database is ever copied, the difference between a hash and plaintext is whether that breach becomes a career-ending incident or a recoverable event.",
    concept:
      "Hashing is one-way by design. bcrypt (and its cousins) add a salt and a work factor so each guess costs real compute. That cost is the entire point — attackers scale; you make each attempt expensive.",
    practical_prompt:
      "Initialize SecureAuth in a project the way you'd hand it to a teammate: one command, clear defaults, no ceremony.",
    practical_success:
      "Solid. You ran the init path — that's the moment security stops being a slide deck and starts being code in the repo.",
    practical_hint:
      "Look for the CLI entry point. The command is the one that scaffolds SecureAuth into a project root.",
    complete:
      "Lesson one is closed. You understand why we never store passwords — and you've touched the tool that enforces it. Next, we talk about what happens after the user is authenticated.",
  },

  // ── Lesson 2: JWT & Sessions ──────────────────────────────
  jwt_sessions: {
    intro:
      "Once identity is proven, you still need a way to remember that decision across requests. Tokens and sessions are two answers to the same question: who is this, and for how long do we trust that answer?",
    concept:
      "A JWT is three Base64 segments: header, payload, signature. The payload is readable — never put secrets there. The signature is what you verify. Expiry and refresh exist because infinite trust is how accounts get stolen.",
    practical_prompt:
      "Inspect a real JWT. Decode the payload and identify expiry (exp) and subject (sub). Treat the middle segment as data, not magic.",
    practical_success:
      "Good — you read the claims instead of trusting the token as a black box. Most people miss that the payload is public.",
    practical_hint:
      "Split on the dots. The middle segment is Base64URL JSON. Look for exp and sub.",
    complete:
      "You can now read a token the way an attacker would. Next we slow them down when they try to force their way in.",
  },

  // ── Lesson 3: Rate Limiting & Account Lockout ─────────────
  rate_limiting: {
    intro:
      "Brute force is not clever — it's volume. Your job is to make volume unprofitable: progressive delays, hard lockouts, and clear signals that guessing is the wrong strategy.",
    concept:
      "Rate limiting caps attempts per window. Progressive slowdown increases wait after each failure. Account lockout is the hard stop. Together they turn a million guesses into a long, loud, and expensive campaign.",
    practical_prompt:
      "Trigger the lockout path against the SecureAuth demo. Watch how response timing changes as failures stack — that timing is the control working.",
    practical_success:
      "Good — you caught the progressive slowdown most people dismiss as 'the server is slow.' That delay is intentional defense.",
    practical_hint:
      "Submit several failed logins in a row. Count how the system responds after the threshold.",
    complete:
      "You felt the lockout from the attacker's side. That's the right order to learn it. Next: when the input itself is the weapon.",
  },

  // ── Lesson 4: OWASP Injection & XSS ───────────────────────
  owasp_injection: {
    intro:
      "Injection and XSS share a root cause: untrusted data treated as code. The fix is not a single library — it's a habit of never concatenating authority into queries or the DOM.",
    concept:
      "SQL injection rides on string-built queries. XSS rides on HTML or script contexts that trust user content. Parameterized queries and output encoding are the default answers; frameworks help only if you don't bypass them.",
    practical_prompt:
      "Compare the vulnerable snippet with the fixed one. Identify exactly where untrusted input crossed a trust boundary.",
    practical_success:
      "That's the right instinct — you pointed at the boundary, not the symptom. Fix the boundary and the class of bugs shrinks.",
    practical_hint:
      "Find where user input is concatenated into a query or written into HTML without encoding.",
    complete:
      "You can spot the pattern. Deployment is next — because secure code on an open config is still a breach waiting to happen.",
  },

  // ── Lesson 5: Secure Deployment Basics ────────────────────
  secure_deployment: {
    intro:
      "Everything you built can be undone by a misconfigured cookie flag or a secret committed to git. Deployment security is not ops theater — it's the last mile of the same discipline.",
    concept:
      "Secrets live in environment variables, not source. HTTPS is non-negotiable for session cookies. Secure, HttpOnly, and SameSite flags close common theft paths. Checklists exist because memory fails under ship pressure.",
    practical_prompt:
      "Walk the deployment checklist. Confirm each item — env isolation, HTTPS, cookie flags — as if this were a go-live review.",
    practical_success:
      "Checklist discipline is underrated. The teams that ship clean are the ones that refuse to skip the boring items.",
    practical_hint:
      "Mark each control as verified only when you can explain why it exists, not just that a box is ticked.",
    complete:
      "Developer path complete. You now have a vertical slice of production security thinking — from hash to deploy. Keep the rank honest by practicing, not by farming XP.",
  },

  role_selected_student: {
    default:
      "Student path. Smart choice. We'll build your security literacy from the ground up — starting with what cybersecurity actually means, then layering in passwords, two-factor, safe browsing, and real-world incidents. Your dashboard shows the full roadmap.",
  },

  // ── Lesson 1: Introduction to Cybersecurity ──────────────
  intro_cybersecurity: {
    intro:
      "Welcome to your first lesson. Before we talk about passwords or phishing, we need to understand what cybersecurity actually means. It's not just about hackers in hoodies — it's about protecting your data, your money, and your identity in a world where everything is connected.",
    concept:
      "The CIA triad is the foundation of all security thinking. Confidentiality means keeping secrets secret. Integrity means data hasn't been tampered with. Availability means you can access what you need when you need it. Every tool we discuss maps to one of these three pillars.",
    practical_prompt:
      "Time to test your understanding with a short quiz. Answer each question carefully — the concepts here set the stage for every lesson that follows.",
    practical_success:
      "Solid start. You understand the core principles that everything else builds on.",
    practical_hint:
      "Think about what each CIA pillar protects against — not just definitions, but real scenarios.",
    complete:
      "Good work. You now know the CIA triad and why cybersecurity is everyone's responsibility. Next, we'll layer on password security — because a strong foundation needs strong locks.",
  },

  // ── Lesson 2: Password Security ──────────────────────────
  password_security: {
    intro:
      "Passwords are still the most common way we prove who we are online. But most people use passwords that are easy to guess or reuse the same one everywhere. This lesson covers how to create passwords that actually protect you.",
    concept:
      "Length beats complexity. A 16-character passphrase like 'correct-horse-battery-staple' is harder to crack than 'P@ss1!' — and easier to remember. Password managers generate and store unique passwords so you never need to reuse.",
    practical_prompt:
      "Quiz time. Test your knowledge of password strength and safe password practices.",
    practical_success:
      "Good instincts. Strong, unique passwords backed by a password manager stop most common attacks.",
    practical_hint:
      "Think about what makes a password hard to guess: length, randomness, and uniqueness.",
    complete:
      "You understand the fundamentals of password security. Next: adding a second layer of protection.",
  },

  // ── Lesson 3: Two-Factor Authentication ───────────────────
  two_factor_auth: {
    intro:
      "A password alone is a single point of failure. If it gets stolen — through a data breach or phishing — your account is gone. Two-factor authentication adds a second check: something you know plus something you have.",
    concept:
      "2FA comes in three forms: SMS codes (better than nothing), authenticator app codes (strong), and hardware keys (strongest). App-based codes are the sweet spot — they don't rely on your phone number being secure.",
    practical_prompt:
      "Quiz time. Test your understanding of how 2FA works and which forms are most secure.",
    practical_success:
      "Good. You now know why a second factor matters and which type to choose.",
    practical_hint:
      "Think about what an attacker would need to bypass each type of 2FA.",
    complete:
      "You understand why 2FA is essential and which form offers the best protection. Next: staying safe while browsing the web.",
  },

  // ── Lesson 4: Safe Browsing Practices ─────────────────────
  safe_browsing: {
    intro:
      "Your browser is your window to the internet — but not every site is what it seems. Malicious websites, fake login pages, and unencrypted connections put your data at risk every time you click.",
    concept:
      "HTTPS encrypts everything between you and the website — no one on the same Wi-Fi can read it. But the padlock only means the connection is private, not that the site is trustworthy. Check the domain name carefully before entering sensitive data.",
    practical_prompt:
      "Quiz time. Test your safe browsing knowledge.",
    practical_success:
      "You're browsing with the right level of caution. That habit alone prevents most web-based attacks.",
    practical_hint:
      "Look for the padlock AND the actual domain name — both matter.",
    complete:
      "You know how to verify a safe connection and spot risky browsing situations. Next: recognizing when someone is trying to deceive you.",
  },

  // ── Lesson 5: Phishing & Social Engineering ───────────────
  phishing_social_engineering: {
    intro:
      "Phishing is the most common way accounts get stolen. Attackers don't break in — they trick you into opening the door. Urgency, impersonation, and fake links are their tools. Your skepticism is the defense.",
    concept:
      "Length is your strongest defense. A 16-character passphrase (like 'blue-truck-sings-jazz-42') is exponentially harder to crack than 'P@ss1!' — and easier to remember. A password manager generates and stores unique passwords so you never need to reuse.",
    practical_prompt:
      "Time to test your understanding with a short quiz. Answer each question, check your answer individually, then submit when all are done.",
    practical_success:
      "Good instincts. Strong passwords and a password manager are the foundation — most attacks stop here.",
    practical_hint:
      "Think about what makes a password actually hard to guess, not just hard to remember.",
    complete:
      "Solid foundation. You understand why length beats complexity and why reusing passwords is the fastest way to get hacked. Next: spotting when someone is trying to trick you.",
  },

  // ── Lesson 2: Phishing & Social Engineering ───────────────
  phishing_social_engineering: {
    intro:
      "Phishing is the most common way accounts get stolen. Attackers don't break in — they trick you into opening the door. Urgency, impersonation, and fake links are their tools. Your skepticism is the defense.",
    concept:
      "Three checks stop most phishing: reveal the real sender address (not the display name), hover over links before clicking, and never act on urgent threats without verifying through a separate channel. Spear-phishing uses your name and details to feel real.",
    practical_prompt:
      "Quiz time. Apply the three checks to spot the phishing attempts.",
    practical_success:
      "You're developing a healthy suspicion — exactly what attackers hate to see.",
    practical_hint:
      "Look for urgency, mismatched domains, and pressure to bypass normal procedures.",
    complete:
      "You can now spot the tactics phishers use. That skepticism is the most transferable skill in security. Next: understanding how web applications get hacked and defended.",
  },

  // ── Lesson 6: Web Application Security ────────────────────
  web_app_security: {
    intro:
      "Every website is an application running on a server. If that application isn't built securely, attackers can inject malicious code, steal data, or take control. Understanding how web apps get hacked helps you appreciate why updates and patches matter.",
    concept:
      "SQL injection happens when user input is treated as database commands. Cross-site scripting (XSS) happens when user input is treated as code in your browser. Both are prevented by never trusting raw input — frameworks help, but the discipline has to be yours.",
    practical_prompt:
      "Quiz time. Test your understanding of web application vulnerabilities.",
    practical_success:
      "Good awareness. You understand the most common ways web applications are exploited.",
    practical_hint:
      "Think about what happens when a website displays user-submitted content without checking it.",
    complete:
      "You understand why web applications are frequent targets and how simple mistakes lead to major breaches. Next: the science of keeping secrets.",
  },

  // ── Lesson 7: Cryptography Basics ─────────────────────────
  cryptography_basics: {
    intro:
      "Encryption is what keeps your messages private, your transactions secure, and your passwords safe. It's not magic — it's math. Understanding the basics helps you see why some security measures are stronger than others.",
    concept:
      "Symmetric encryption uses one key to lock and unlock (like a door key). Asymmetric encryption uses a public key to lock and a private key to unlock (like a mailbox). Hashing is one-way — you can't reverse it, which is why passwords are hashed, not encrypted.",
    practical_prompt:
      "Quiz time. Test your cryptography knowledge.",
    practical_success:
      "Solid. You understand the difference between encryption, hashing, and the role of keys.",
    practical_hint:
      "Think about what each method protects against and where it's used in everyday browsing.",
    complete:
      "You now understand the cryptographic building blocks that secure the internet. Next: how networks themselves are defended.",
  },

  // ── Lesson 8: Network Security ────────────────────────────
  network_security: {
    intro:
      "Your data travels across multiple networks between your device and the services you use. Each hop is a potential interception point. Network security is about protecting data in transit and keeping unauthorized devices out.",
    concept:
      "Firewalls block unwanted traffic. VPNs encrypt everything between you and a trusted server. Wi-Fi security (WPA3) prevents nearby devices from eavesdropping. Together they create layers of defense around your connection.",
    practical_prompt:
      "Quiz time. Test your network security knowledge.",
    practical_success:
      "Good. You understand how data stays safe while traveling across the internet.",
    practical_hint:
      "Think about each layer of a network connection — from your device to the website — and where attacks can happen.",
    complete:
      "You understand the basic tools that protect network traffic. Next: putting everything together into daily security habits.",
  },

  // ── Lesson 9: Cybersecurity Best Practices ────────────────
  cybersecurity_best_practices: {
    intro:
      "Security isn't a one-time setup — it's a set of habits. Software updates, backups, cautious clicking, and knowing when something feels wrong are the daily practices that keep you safe. This lesson ties everything together.",
    concept:
      "Update everything — software updates contain security fixes. Back up important data — ransomware can't hold what you already have saved. Think before you click — if something feels off, pause and verify. These three habits prevent the majority of security incidents.",
    practical_prompt:
      "Final quiz before the case studies. Test your knowledge of everyday security practices.",
    practical_success:
      "Excellent. You have the habits and mindset of someone who takes security seriously.",
    practical_hint:
      "The best security practices are the ones that become automatic — update, backup, verify.",
    complete:
      "You now have a complete set of security habits. The case studies waiting for you will show how real incidents happen when these practices aren't followed.",
  },

  // ── Lesson 10: Mobile Security (legacy ref) ───────────────
  mobile_security: {
    intro:
      "Your phone is a computer in your pocket — and most people treat it with far less caution than their laptop. Sideloaded apps, excessive permissions, and unencrypted connections are the top mobile risks.",
    concept:
      "Official app stores review apps before listing them. Sideloading bypasses that review. Every permission should make sense — a calculator doesn't need your location. The padlock in your browser means the connection is encrypted, not that the site is trustworthy.",
    practical_prompt:
      "Quiz: how well do you know your mobile defenses?",
    practical_success:
      "Strong awareness. You're treating your phone with the same caution as your computer.",
    practical_hint:
      "Think about what each app actually needs to do its job — permissions tell you what it can do, not what it should do.",
    complete:
      "Your phone is now a defended device. You know what sideloading costs, which permissions to deny, and what the padlock really means. Next: the scams designed to separate you from your money.",
  },

  // ── Lesson 4: Online Scams & Financial Fraud ──────────────
  online_scams: {
    intro:
      "Scammers don't hack accounts — they hack trust. Romance scams, fake investments, imposter calls, and 'too good to be true' offers all follow the same playbook: build false credibility, create urgency, and ask for irreversible payment.",
    concept:
      "The payment method is the giveaway. Gift cards, wire transfers, and cryptocurrency are the scammer's preferred tools because they cannot be reversed. Legitimate businesses take credit cards. If someone you know asks for money urgently via a new number, verify through their old contact method.",
    practical_prompt:
      "Quiz: can you pick the scam from the legitimate request?",
    practical_success:
      "You have good scam radar. Keep trusting that uncomfortable feeling when something doesn't add up.",
    practical_hint:
      "If a 'bank' tells you to move money to a 'safe account', it's a scam by definition.",
    complete:
      "You can now recognise the major fraud patterns. The common thread is always the same: pressure, unusual payment, and impersonation. Next: real-world incidents where these threats became crises.",
  },

  // ── Lesson 5: Case Studies ──────────────────────────────
  case_studies: {
    intro:
      "Theory is valuable, but real incidents teach harder lessons. We examine three actual cybersecurity events that affected banks, crypto platforms, and retailers. Each shows how the concepts you've learned played out in practice.",
    concept:
      "The Bank of Zambia Clop ransomware attack shut down national banking for days. Coinbase 2025 started with a phone call — employees were socially engineered. Marks & Spencer April 2025 was credential stuffing: passwords leaked from other sites used to access customer accounts.",
    practical_prompt:
      "Run through the phishing simulator, then examine each case study. Judge real messages, study real attacks.",
    practical_success:
      "You've completed the full student path. You now have working security literacy — from passwords to real incident analysis.",
    practical_hint:
      "Apply everything you've learned. Every red flag you spot is a skill you built in the previous lessons.",
    complete:
      "Student path complete. You started with password hygiene and ended by analyzing real ransomware and social engineering attacks. That's the arc of security literacy. Your certificate is waiting.",
  },

  // ── Generic / fallbacks ───────────────────────────────────
  practical_fail: {
    default:
      "Not quite. Re-read the prompt and try again — the goal is understanding the control, not guessing the answer.",
  },

  rank_up: {
    default:
      "Rank updated. That threshold is earned XP, not a participation trophy. Carry the standard into the next lesson.",
  },

  badge_unlock: {
    default:
      "New badge on the board. Treat it as a receipt for skill, not decoration.",
  },
};

/**
 * @param {{ lessonId?: string, state?: string, key?: string }} context
 * @returns {string}
 */
export function getAriaResponse(context = {}) {
  const { lessonId, state: scriptState, key } = context;

  // Explicit key lookup (e.g. welcome, rank_up)
  if (key) {
    const block = SCRIPTS[key];
    if (!block) return fallback(key);
    if (typeof block === 'string') return block;
    return block[scriptState] || block.default || fallback(key);
  }

  // Lesson + state (intro | concept | practical_prompt | …)
  if (lessonId) {
    const block = SCRIPTS[lessonId];
    if (!block) return fallback(lessonId);
    const phase = scriptState || 'intro';
    return block[phase] || block.intro || fallback(`${lessonId}.${phase}`);
  }

  return SCRIPTS.welcome.default;
}

function fallback(label) {
  return `ARIA is thinking about "${label}". Continue when ready.`;
}

export default { getAriaResponse };
