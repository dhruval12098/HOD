'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { getCollectionHref } from '@/lib/browse-context';
import { supabase } from '@/lib/supabase';

type AuthMode = 'login' | 'signup';

type AuthFormProps = {
  mode: AuthMode
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isSignup = mode === 'signup';
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const formTitle = isSignup ? 'Create your private account' : 'Welcome back';
  const formBody = isSignup
    ? 'Open your House of Diams account to save favourites, revisit enquiries, and move through the collection with ease.'
    : 'Sign in to continue into your private House of Diams experience.';

  const alternateLink = useMemo(
    () =>
      isSignup
        ? { href: '/login', label: 'Already have an account? Sign in' }
        : { href: '/signup', label: 'New here? Create your account' },
    [isSignup]
  );

  const handleGoogleAuth = async () => {
    setError('');
    setToastMessage('');
    setSubmitting(true);

    try {
      const redirectTo =
        typeof window !== 'undefined' ? `${window.location.origin}/profile` : undefined;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : 'Unable to continue with Google right now.';
      setError(message);
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setToastMessage('');

    if (isSignup && username.trim().length < 2) {
      setError('Please enter a username with at least 2 characters.');
      return;
    }

    if (password.length < 8) {
      setError('Please use a password with at least 8 characters.');
      return;
    }

    setSubmitting(true);

    try {
      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: username.trim(),
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.session) {
          setToastMessage('Your account is ready. Redirecting to your profile...');
          router.replace('/profile');
          router.refresh();
          return;
        }

        setToastMessage('Your account was created. Please check your email to confirm your address, then sign in.');
        setPassword('');
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        throw signInError;
      }

      setToastMessage('Signed in successfully. Redirecting to your profile...');
      router.replace('/profile');
      router.refresh();
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {toastMessage ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[1200] w-[min(92vw,540px)] -translate-x-1/2 rounded-[18px] border border-[rgba(23,110,77,0.18)] bg-[rgba(255,255,255,0.96)] px-5 py-3 text-[12px] text-[#1c664b] shadow-[0_18px_45px_rgba(10,22,40,0.14)] backdrop-blur-xl">
          {toastMessage}
        </div>
      ) : null}

      <div className="mb-4">
        <div className="mb-3 inline-flex items-center gap-3 text-[9px] font-medium uppercase tracking-[0.32em] text-[var(--theme-muted-2)]">
          <span className="inline-block h-px w-8 bg-[rgba(184,149,74,0.72)]" />
          {isSignup ? 'Private Sign Up' : 'Private Sign In'}
        </div>

        <h2 className="max-w-[10ch] text-[clamp(1.55rem,2.1vw,2.1rem)] leading-[1] text-[var(--theme-ink)]">
          {formTitle}
        </h2>

        <p className="mt-2.5 max-w-[470px] text-[12px] leading-5.5 tracking-[0.02em] text-[var(--theme-muted)] sm:text-[13px]">
          {formBody}
        </p>
      </div>

      <div className="grid gap-3">
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={submitting}
          className="inline-flex h-11 items-center justify-center gap-3 rounded-full border border-[var(--theme-border)] bg-white px-7 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--theme-ink)] transition hover:border-[rgba(184,149,74,0.72)] hover:bg-[rgba(250,247,242,0.9)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.56 2.68-3.86 2.68-6.62Z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
            />
            <path
              fill="#FBBC05"
              d="M3.97 10.72A5.41 5.41 0 0 1 3.69 9c0-.6.1-1.19.28-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33Z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.32 0 2.5.45 3.43 1.33l2.57-2.57C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33c.71-2.12 2.69-3.7 5.03-3.7Z"
            />
          </svg>
          {isSignup ? 'Sign Up With Google' : 'Sign In With Google'}
        </button>

        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-[var(--theme-muted-2)]">
          <span className="h-px flex-1 bg-[var(--theme-border)]" />
          Or continue with email
          <span className="h-px flex-1 bg-[var(--theme-border)]" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3">
        {isSignup ? (
          <label className="grid gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--theme-muted-2)]">
              Username
            </span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              type="text"
              autoComplete="username"
              placeholder="Your name"
              className="h-11 rounded-[16px] border border-[var(--theme-border)] bg-white px-4 text-[14px] text-[var(--theme-ink)] outline-none transition focus:border-[rgba(184,149,74,0.72)] focus:shadow-[0_0_0_4px_rgba(184,149,74,0.12)]"
              required
            />
          </label>
        ) : null}

        <label className="grid gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--theme-muted-2)]">
            Email
          </span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            className="h-11 rounded-[16px] border border-[var(--theme-border)] bg-white px-4 text-[14px] text-[var(--theme-ink)] outline-none transition focus:border-[rgba(184,149,74,0.72)] focus:shadow-[0_0_0_4px_rgba(184,149,74,0.12)]"
            required
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--theme-muted-2)]">
            Password
          </span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            placeholder="Minimum 8 characters"
            className="h-11 rounded-[16px] border border-[var(--theme-border)] bg-white px-4 text-[14px] text-[var(--theme-ink)] outline-none transition focus:border-[rgba(184,149,74,0.72)] focus:shadow-[0_0_0_4px_rgba(184,149,74,0.12)]"
            required
          />
        </label>

        <div className="rounded-[18px] border border-[rgba(184,149,74,0.18)] bg-[linear-gradient(135deg,rgba(250,247,242,0.9),rgba(245,247,252,0.9))] px-4 py-3 text-[11px] leading-5 tracking-[0.02em] text-[var(--theme-muted)]">
          Passwords are never hashed in the browser by us manually. Supabase Auth securely hashes them server-side before storage, and your session is persisted in the client so you stay signed in across visits.
        </div>

        {error ? (
          <div className="rounded-[16px] border border-[rgba(179,69,69,0.18)] bg-[rgba(179,69,69,0.06)] px-4 py-2.5 text-[12px] text-[#8f2f2f]">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-0.5 inline-flex h-11 items-center justify-center rounded-full bg-[var(--theme-ink)] px-7 text-[10px] font-medium uppercase tracking-[0.28em] text-white transition hover:bg-[#13233b] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Please wait' : isSignup ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 flex flex-col gap-2.5 border-t border-[var(--theme-border)] pt-4 text-[11px] uppercase tracking-[0.2em] text-[var(--theme-muted-2)] sm:flex-row sm:items-center sm:justify-between">
        <Link href={alternateLink.href} className="transition hover:text-[var(--theme-ink)]">
          {alternateLink.label}
        </Link>
        <Link href={getCollectionHref()} className="transition hover:text-[var(--theme-ink)]">
          Continue Browsing
        </Link>
      </div>
    </div>
  );
}
