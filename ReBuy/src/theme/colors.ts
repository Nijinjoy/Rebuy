// Raw brand palette. Screens should use `colors` below, not these directly.
export const palette = {
  ivory: '#FBF6EE',
  sand: '#F1E4CC',
  gold: '#C8A15A',
  ink: '#1F2A2E',
  white: '#FFFFFF',
  red: '#C2412D',
} as const;

// Converts a `#RRGGBB` color to `rgba(...)` with the given opacity.
export function withAlpha(hex: string, alpha: number) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Colors by role, used across the app.
export const colors = {
  background: palette.ivory,
  backgroundAlt: palette.sand,

  textPrimary: palette.ink,
  textSecondary: withAlpha(palette.ink, 0.55),

  accent: palette.gold,
  accentTint: withAlpha(palette.gold, 0.06),
  accentSoft: withAlpha(palette.gold, 0.22),

  surface: palette.white,
  border: withAlpha(palette.ink, 0.12),
  placeholder: withAlpha(palette.ink, 0.4),

  primary: palette.ink,
  onPrimary: palette.ivory,

  error: palette.red,

  shadow: withAlpha(palette.ink, 0.18),
} as const;
