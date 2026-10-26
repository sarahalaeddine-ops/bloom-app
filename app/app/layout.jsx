// Kept out of search engines until launch.
export const metadata = {
  title: "Bloom — Your IVF Companion",
  robots: { index: false, follow: false },
};

export default function RealAppLayout({ children }) {
  return <div className="app-column">{children}</div>;
}
