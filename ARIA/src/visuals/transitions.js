/**
 * Screen-to-screen motion helpers (CSS class names + timings).
 */

export const TRANSITION = {
  fadeMs: 320,
  pullMs: 480,
  celebrateMs: 2200,
};

/** CSS class applied during role → dashboard pull */
export const CLASS = {
  screenEnter: 'screen-enter',
  screenExit: 'screen-exit',
  pullFocus: 'orb-pull-focus',
  celebrate: 'celebrate-burst',
  xpPulse: 'xp-pulse',
};

/**
 * Wait for a CSS transition window (promise-based).
 */
export function waitMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
