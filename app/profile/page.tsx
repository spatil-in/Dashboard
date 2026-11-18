import { ProfileForm } from "@/components/community/MemberForms";

export const metadata = { title: "Your profile" };

export default function ProfilePage() {
  return (
    <section className="simple-page">
      <span className="dialog-eyebrow">YOUR COMMUNITY PROFILE</span>
      <h1>A little about you.</h1>
      <p>Help the community get to know the person behind the ideas.</p>
      <ProfileForm />
    </section>
  );
}
