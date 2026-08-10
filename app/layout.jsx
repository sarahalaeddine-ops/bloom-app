import "./globals.css";

export const metadata = {
  title: "Bloom — Your IVF Companion",
  description: "The world first dedicated IVF companion app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
