import LegalPage from "../../components/site/LegalPage";

// Public privacy policy (linked from the app and the store listings). DRAFT pending legal review.
export const metadata = {
  title: "Privacy policy · Bloom",
  description: "How Bloom, the IVF companion, collects, uses and protects your data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalPage doc="privacy" />;
}
