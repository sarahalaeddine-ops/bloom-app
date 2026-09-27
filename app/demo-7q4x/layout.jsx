// The app demo lives at an unlisted address so the public site doesn't show the product.
// It is hidden, not password-protected: anyone with the link can open it.
export const metadata = {
  title: "Bloom — Your IVF Companion",
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }) {
  return <div className="app-column">{children}</div>;
}
