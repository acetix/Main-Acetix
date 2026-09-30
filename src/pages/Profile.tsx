import { useEffect, useState } from 'react';
import { AlertCircle, Github, Loader2, LogOut } from 'lucide-react';
import Reveal from '../components/Reveal';
import { usePageSeo } from '../lib/usePageSeo';
import {
  auth,
  firebaseEnabled,
  onAuthStateChanged,
  signInWithProvider,
  signOut,
  type User,
} from '../lib/firebase';

type AuthStatus = 'checking' | 'ready' | 'busy';

function avatarLetter(user: User): string {
  const name = user.displayName || user.email || 'A';
  return name.charAt(0).toUpperCase();
}

function GoogleMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.35 11.1H12v2.9h5.35c-.5 2.4-2.55 3.5-5.35 3.5a5.9 5.9 0 0 1 0-11.8c1.5 0 2.85.55 3.9 1.45l2.1-2.1A8.9 8.9 0 0 0 12 2a9 9 0 0 0 0 18c4.6 0 8.7-3.35 8.7-9 0-.3-.05-.6-.1-.9h-.25z"
      />
    </svg>
  );
}

export default function Profile() {
  usePageSeo(
    'Profile — your account',
    'Your acetix profile: sign in or create an account with Google or GitHub. No passwords to remember.',
    '/profile',
  );
  const [user, setUser] = useState<User | null>(auth?.currentUser ?? null);
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setStatus('ready');
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setStatus('ready');
    });
    return unsub;
  }, []);

  async function handleSignIn(provider: 'google' | 'github') {
    setError(null);
    setStatus('busy');
    try {
      const u = await signInWithProvider(provider);
      setUser(u);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Sign-in failed. Please try again.';
      setError(
        /auth\/(operation-not-allowed|unauthorized-domain)/.test(message)
          ? 'This provider is not enabled yet — turn it on in the backend Console → Authentication → Sign-in method.'
          : message,
      );
    } finally {
      setStatus('ready');
    }
  }

  async function handleSignOut() {
    setError(null);
    try {
      await signOut(auth!);
      setUser(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-out failed. Please try again.');
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl min-w-0 overflow-x-clip px-6 pb-24 pt-32 md:pt-40">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
          Profile
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          Your account.
        </h1>
        <p className="mt-4 leading-relaxed text-smoke">
          Sign in to keep your acetix profile in one place. Only Google and
          GitHub sign-in are offered — no passwords to remember.
        </p>
      </Reveal>

      <Reveal delay={0.08} className="min-w-0">
        <div className="mt-12 min-w-0 rounded-3xl border border-ink/10 bg-white p-7 md:p-10">
          {!firebaseEnabled || !auth ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sand">
                <AlertCircle className="h-6 w-6 text-smoke" />
              </span>
              <p className="font-display text-xl font-bold">Sign-in unavailable</p>
              <p className="max-w-sm text-sm leading-relaxed text-smoke">
                Backend is not configured for this build, so login is turned
                off. Connect the backend to enable Google and GitHub sign-in.
              </p>
            </div>
          ) : status === 'checking' ? (
            <div className="flex items-center justify-center gap-3 py-10 text-sm text-smoke">
              <Loader2 className="h-5 w-5 animate-spin" /> Checking session…
            </div>
          ) : user ? (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-20 w-20 rounded-full border border-ink/10 object-cover"
                />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand to-sun font-display text-3xl font-bold text-white">
                  {avatarLetter(user)}
                </span>
              )}
              <div>
                <h2 className="font-display text-2xl font-bold">
                  {user.displayName || 'Welcome back'}
                </h2>
                {user.email && <p className="mt-1 text-sm text-smoke">{user.email}</p>}
              </div>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition hover:bg-brand"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          ) : (
            <div className="flex min-w-0 flex-col gap-4">
              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 [&>*]:min-w-0">
                <div className="rounded-2xl border border-ink/10 bg-paper p-5">
                  <h2 className="font-display text-lg font-bold">Login</h2>
                  <p className="mt-1 text-xs leading-relaxed text-smoke">
                    Already have an account? Sign back in below.
                  </p>
                  <div className="mt-4 flex flex-col gap-3">
                    <button
                      type="button"
                      disabled={status === 'busy'}
                      onClick={() => void handleSignIn('google')}
                      className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-ink/15 bg-paper px-5 py-3 text-sm font-bold transition hover:border-ink hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === 'busy' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <GoogleMark className="h-5 w-5" />
                      )}
                      Login with Google
                    </button>
                    <button
                      type="button"
                      disabled={status === 'busy'}
                      onClick={() => void handleSignIn('github')}
                      className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-paper transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === 'busy' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Github className="h-5 w-5" />
                      )}
                      Login with GitHub
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-paper p-5">
                  <h2 className="font-display text-lg font-bold">Signup</h2>
                  <p className="mt-1 text-xs leading-relaxed text-smoke">
                    New here? Create your profile in one click.
                  </p>
                  <div className="mt-4 flex flex-col gap-3">
                    <button
                      type="button"
                      disabled={status === 'busy'}
                      onClick={() => void handleSignIn('google')}
                      className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-ink/15 bg-paper px-5 py-3 text-sm font-bold transition hover:border-ink hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === 'busy' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <GoogleMark className="h-5 w-5" />
                      )}
                      Signup with Google
                    </button>
                    <button
                      type="button"
                      disabled={status === 'busy'}
                      onClick={() => void handleSignIn('github')}
                      className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-paper transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === 'busy' ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Github className="h-5 w-5" />
                      )}
                      Signup with GitHub
                    </button>
                  </div>
                </div>
              </div>
              {error && (
                <p className="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-brand">{error}</p>
              )}
              <p className="text-center text-xs leading-relaxed text-smoke">
                One click is all it takes — login and signup both use your
                Google or GitHub account, no passwords needed.
              </p>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
