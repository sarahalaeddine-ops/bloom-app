import LegalPage from "../../components/site/LegalPage";

// Public support page (App Store "Support URL").
export const metadata = {
  title: "Help and support · Bloom",
  description: "Contact Bloom and find answers about your account, reminders and privacy.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return <LegalPage doc="support" />;
}
