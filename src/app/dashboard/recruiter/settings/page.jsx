import ProfileSettings from "@/component/profile/ProfileSettings";

export const metadata = {
  title: "Recruiter Settings · HireLoop",
  description: "Manage your HireLoop recruiter profile.",
};

export default function RecruiterSettingsPage() {
  return <ProfileSettings role="recruiter" />;
}
