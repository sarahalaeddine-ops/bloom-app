// The app demo lives at an unlisted address so the public site doesn't show the product.
// proxy.js password-protects it (DEMO_PASSWORD), and it is kept out of search engines.
export const metadata = {
  title: "Bloom — Your IVF Companion",
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }) {
  return <div className="app-column">{children}</div>;
}
