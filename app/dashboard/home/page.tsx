import { redirect } from 'next/navigation';

// The "Family Feed" page has been removed — "My Family" (/dashboard/our-family) is now the
// home/landing. This route is kept as a redirect (NOT deleted) because many flows still point at
// /dashboard/home: checkout success, transactional email links, deep links, post-delete navigation,
// the top nav and mobile bottom-nav "home" tab. They now all forward to My Family.
export default function DashboardHomePage() {
  redirect('/dashboard/our-family');
}
