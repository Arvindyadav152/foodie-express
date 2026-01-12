/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // New Appetizing Color Palette
        "primary": "#FF6B6B",        // Warm Coral - appetite stimulating
        "primary-dark": "#E55555",   // Darker coral for pressed states
        "secondary": "#1A1D3B",      // Deep Navy - premium & trust
        "accent": "#FFE66D",         // Golden Yellow - happiness
        "success": "#4ECDC4",        // Teal - fresh & modern success
        "warning": "#FF9F43",        // Orange warning
        "danger": "#EE5A5A",         // Red for errors
        "background-light": "#FEFEFE",
        "background-dark": "#1A1D3B",
        "card": "#FFFFFF",
        "muted": "#6B7280",
      },
      fontFamily: {
        "display": ["System"]
      }
    },
  },
  plugins: [],
}
