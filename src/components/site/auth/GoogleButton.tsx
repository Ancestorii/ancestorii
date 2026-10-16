import { getBrowserClient } from '@/lib/supabase/browser';
import { safeRedirect } from '@/lib/safeRedirect';
import auth from '@/components/site/auth.module.css';

/**
 * Sends the visitor to Google; /auth/callback finishes signing them in and applies what the
 * page left in sessionStorage (post_login_redirect here, plus invite_token and family_name from
 * Sign Up). Resolves with the error only if Google could not be reached.
 */
export async function signInWithGoogle() {
  const searchParams = new URLSearchParams(window.location.search);
  const redirectTo = safeRedirect(searchParams.get('redirect'));
  if (redirectTo) sessionStorage.setItem('post_login_redirect', redirectTo);

  const { error } = await getBrowserClient().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return error;
}

/** "Continue with Google" for Log In and Sign Up, in Google's own four-colour G (never recolour it). */
export default function GoogleButton({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={`${auth.social} ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.2 0 6 1.1 8.2 3.2l6.1-6.1C34.6 2.4 29.7 0 24 0 14.6 0 6.4 5.8 2.6 14.2l7.5 5.8C12.1 13.2 17.6 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4H24v7.6h12.6c-.3 2-1.6 5-4.4 7l6.8 5.3c4-3.7 7.1-9.2 7.1-15.9z"/>
        <path fill="#FBBC05" d="M10.1 28c-1-3-1-6.2 0-9.2l-7.5-5.8C.9 16.3 0 20 0 24c0 4 1 7.7 2.6 11l7.5-5.8z"/>
        <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-6.8-5.3c-1.9 1.3-4.5 2.2-9.2 2.2-6.4 0-11.9-3.7-13.9-8.5l-7.5 5.8C6.4 42.2 14.6 48 24 48z"/>
      </svg>
      Continue with Google
    </button>
  );
}
