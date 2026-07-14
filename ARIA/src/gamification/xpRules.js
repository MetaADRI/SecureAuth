/**
 * XP awarded per action + helpers for applying awards.
 */

export const XP_RULES = {
  LESSON_COMPLETE: 50,
  PRACTICAL_PASSED: 30,
  DAILY_STREAK_BONUS: 10,
  /** Cap how much streak bonus can contribute toward rank pressure in a single day */
  STREAK_DAILY_CAP: 10,
};

/** Badge definitions — locked ones show as "?" on the grid */
export const BADGES = [
  {
    id: 'first_lesson',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '◉',
  },
  {
    id: 'auth_fundamentals',
    name: 'Hash Guardian',
    description: 'Master Authentication Fundamentals',
    icon: '⬡',
  },
  {
    id: 'jwt_sessions',
    name: 'Token Keeper',
    description: 'Complete JWT & Sessions',
    icon: '◈',
  },
  {
    id: 'rate_limit',
    name: 'Brute Force Breaker',
    description: 'Complete Rate Limiting & Account Lockout',
    icon: '▣',
  },
  {
    id: 'owasp_injection',
    name: 'Injection Shield',
    description: 'Complete OWASP Injection & XSS',
    icon: '⬡',
  },
  {
    id: 'secure_deploy',
    name: 'Deploy Hardener',
    description: 'Complete Secure Deployment Basics',
    icon: '▲',
  },
  {
    id: 'path_complete',
    name: 'Developer Path Graduate',
    description: 'Complete all Developer path lessons',
    icon: '★',
  },
  {
    id: 'streak_3',
    name: 'Consistent Cadet',
    description: 'Maintain a 3-day login streak',
    icon: '✦',
  },
  {
    id: 'intro_cybersecurity',
    name: 'Cyber Aware',
    description: 'Complete Introduction to Cybersecurity',
    icon: '◉',
  },
  {
    id: 'password_security',
    name: 'Password Guardian',
    description: 'Complete Password Security',
    icon: '◈',
  },
  {
    id: 'two_factor_auth',
    name: 'Two-Factor Champion',
    description: 'Complete Two-Factor Authentication',
    icon: '⬡',
  },
  {
    id: 'safe_browsing',
    name: 'Safe Surfer',
    description: 'Complete Safe Browsing Practices',
    icon: '▲',
  },
  {
    id: 'phishing_social_engineering',
    name: 'Phish Spotter',
    description: 'Complete Phishing & Social Engineering',
    icon: '✦',
  },
  {
    id: 'web_app_security',
    name: 'Web Guardian',
    description: 'Complete Web Application Security',
    icon: '▣',
  },
  {
    id: 'cryptography_basics',
    name: 'Crypto Scholar',
    description: 'Complete Cryptography Basics',
    icon: '◈',
  },
  {
    id: 'network_security',
    name: 'Network Shield',
    description: 'Complete Network Security',
    icon: '⬡',
  },
  {
    id: 'cybersecurity_best_practices',
    name: 'Security Sage',
    description: 'Complete Cybersecurity Best Practices',
    icon: '◆',
  },
  {
    id: 'case_closed',
    name: 'Case Closed',
    description: 'Complete the Case Studies lesson',
    icon: '◆',
  },
  {
    id: 'phish_spotter_badge',
    name: 'Phish Spotter Elite',
    description: 'Identify all phishing attempts in the Phishing Simulation',
    icon: '⬡',
  },
  {
    id: 'digital_native',
    name: 'Digital Native',
    description: 'Complete all Student path lessons',
    icon: '★',
  },
];

/** Map lesson id → badge unlocked on completion */
export const LESSON_BADGE_MAP = {
  auth_fundamentals: 'auth_fundamentals',
  jwt_sessions: 'jwt_sessions',
  rate_limiting: 'rate_limit',
  owasp_injection: 'owasp_injection',
  secure_deployment: 'secure_deploy',
  intro_cybersecurity: 'intro_cybersecurity',
  password_security: 'password_security',
  two_factor_auth: 'two_factor_auth',
  safe_browsing: 'safe_browsing',
  phishing_social_engineering: 'phishing_social_engineering',
  web_app_security: 'web_app_security',
  cryptography_basics: 'cryptography_basics',
  network_security: 'network_security',
  cybersecurity_best_practices: 'cybersecurity_best_practices',
  case_studies: 'case_closed',
  phishing_sim: 'phish_spotter_badge',
};

export const STUDENT_PATH_BADGE = 'digital_native';
