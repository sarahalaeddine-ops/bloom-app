import "./globals.css";

// Root layout of the native app build only (BUILD_TARGET=app, see next.config.ts). The web build
// ignores this file and uses app/layout.jsx. No manifest or service worker here: the app uses
// native notifications (lib/native.js) instead.
export const metadata = {
  title: "Bloom",
  description: "Your IVF companion",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FAF7F4",
};

export default function AppRootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=Noto+Naskh+Arabic:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="native-app">
        <div className="app-column">{children}</div>
      </body>
    </html>
  );
}
