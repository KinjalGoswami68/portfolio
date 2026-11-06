// true when the visitor has asked their system for less motion
// (Windows: Settings > Accessibility > Visual effects > Animation effects OFF).
// Read once when the page loads.
export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
