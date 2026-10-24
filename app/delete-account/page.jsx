import LegalPage from "../../components/site/LegalPage";

// Public account-deletion page (Google Play requires a web link that works without the app).
export const metadata = {
  title: "Delete your account · Bloom",
  description: "How to delete your Bloom account and all your data, in the app or without it.",
  alternates: { canonical: "/delete-account" },
};

export default function DeleteAccountPage() {
  return <LegalPage doc="deletion" />;
}
