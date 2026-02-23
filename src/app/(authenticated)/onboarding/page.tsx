import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { hasCompletedOnboarding } from "~/server/lib/onboarding";
import { OnboardingWizard } from "~/features/onboarding/components/OnboardingWizard";

export default async function OnboardingPage() {
  const session = await auth();

  if (session?.user?.id) {
    const onboarded = await hasCompletedOnboarding(session.user.id);
    if (onboarded) {
      redirect("/feed");
    }
  }

  return <OnboardingWizard />;
}
