// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4338CA",   // Indigo profond
          light: "#6366F1",     // Indigo clair
          dark: "#312E81",      // Indigo foncé
        },
        accent: {
          DEFAULT: "#FACC15",   // Jaune doré
          light: "#FDE047",     // Jaune clair
          dark: "#CA8A04",      // Jaune foncé
        },
        neutral: {
          DEFAULT: "#111827",   // Gris presque noir
          light: "#6B7280",     // Gris moyen
          bg: "#F9FAFB",        // Fond clair
        }
      },
    },
  },
  
  plugins: [],
}
