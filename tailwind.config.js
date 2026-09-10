export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "SF Pro Display",
          "SF Pro Text",
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        ink: "#111114",
        paper: "#f7f5ef",
        graphite: "#22242a",
        mist: "#e9edf1",
        signal: "#2f6f64",
        amberline: "#b5894b",
        iris: "#6f6aa9",
      },
      boxShadow: {
        phone: "0 44px 90px rgba(16,18,22,.34), 0 12px 28px rgba(16,18,22,.18)",
        glass: "0 20px 70px rgba(24, 26, 32, .18), inset 0 1px 0 rgba(255,255,255,.48)",
      },
      backgroundImage: {
        "noise": "radial-gradient(circle at 20% 20%, rgba(255,255,255,.5), transparent 28%), radial-gradient(circle at 84% 8%, rgba(111,106,169,.16), transparent 24%), radial-gradient(circle at 72% 88%, rgba(47,111,100,.14), transparent 22%)",
      },
    },
  },
  plugins: [],
};
