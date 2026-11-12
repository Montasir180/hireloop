import ProfileSettings from "@/component/profile/ProfileSettings";

export const metadata = {
  title: "Admin Settings · HireLoop",
  description: "Manage your HireLoop administrator profile.",
};

export default function AdminSettingsPage() {
  return <ProfileSettings role="admin" />;
}
