import { redirect } from 'next/navigation';

// The web "ask a question" onboarding step has been removed — asking now lives in the app.
// This route is kept (it is the redirect target of app/onboarding/first-memory) and forwards
// straight to the dashboard so the onboarding flow does not 404.
export default function OnboardingSharePage() {
  redirect('/dashboard/our-family');
}
