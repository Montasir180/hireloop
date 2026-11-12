import ProfileSettings from "@/component/profile/ProfileSettings";

export const metadata = {
  title: "Seeker Settings · HireLoop",
  description: "Manage your HireLoop job seeker profile.",
};

export default function SeekerSettingsPage() {
  return <ProfileSettings role="seeker" />;
}
