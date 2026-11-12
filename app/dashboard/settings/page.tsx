import type { Metadata } from "next";
import { PasswordForm, ProfileForm } from "@/components/dashboard/SettingsForms";
import { signOutAction } from "@/lib/actions/auth";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser("/dashboard/settings");
  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <section aria-labelledby="profile-title" className="rounded-lg border border-navy/10 bg-white p-6 sm:p-8 lg:col-span-7">
        <h2 id="profile-title" className="text-2xl font-bold tracking-tight">
          Profile
        </h2>
        <p className="mb-8 mt-1 text-sm text-muted">This is what people see on your creator page and next to your designs.</p>
        <ProfileForm user={{ name: user.name, username: user.username, email: user.email, bio: user.bio, image: user.image }} />
      </section>
      <div className="grid content-start gap-10 lg:col-span-5">
        <section aria-labelledby="password-title" className="rounded-lg border border-navy/10 bg-white p-6 sm:p-8">
          <h2 id="password-title" className="text-2xl font-bold tracking-tight">
            Password
          </h2>
          <p className="mb-8 mt-1 text-sm text-muted">
            {user.passwordHash ? "Change it any time." : "You sign in with Google. Add a password if you'd like a backup way in."}
          </p>
          <PasswordForm hasPassword={Boolean(user.passwordHash)} />
        </section>
        <section className="rounded-lg border border-navy/10 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight">Session</h2>
          <form action={signOutAction} className="mt-6">
            <button type="submit" className="inline-flex h-11 items-center rounded-full border border-navy/30 px-5 text-sm font-semibold hover:border-navy">
              Sign out
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
