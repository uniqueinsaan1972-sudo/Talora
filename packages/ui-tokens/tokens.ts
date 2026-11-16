// Palette taken from the TALORA brand sheet (navy, blue, sky, violet, lavender, cream)
export const colors = {
  navy: "#1B2A6B", blue: "#2F7DE8", sky: "#8CCBFA",
  violet: "#6D4AE0", lavender: "#B9A2F5", cream: "#F7EDD6",
  mint: "#BFE8C8", sun: "#F7C948", orange: "#F59A3D",
  ink: "#1F2430", paper: "#FFFFFF", warm: "#FBF8F2",
} as const;

export const lightTheme = {
  bg: colors.warm, surface: colors.paper, text: colors.ink, heading: colors.navy,
  primary: colors.blue, primaryText: "#FFFFFF", accent: colors.sun, success: "#2E9E5B", danger: "#D9534F",
};
// Dark theme is designed separately, not inverted.
export const darkTheme = {
  bg: "#0F1730", surface: "#18224A", text: "#E8ECF8", heading: "#CFE3FF",
  primary: "#5B9CF0", primaryText: "#0B1226", accent: "#F2C14E", success: "#5CC98A", danger: "#F08A86",
};
export const radius = { card: 20, button: 16, pill: 999 } as const;
export const fonts = { latin: "Nunito, system-ui, sans-serif", urdu: "'Noto Nastaliq Urdu', serif", hindi: "'Noto Sans Devanagari', sans-serif" } as const;
export const touchTarget = 48; // px, large targets for older learners
