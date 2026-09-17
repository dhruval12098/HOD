'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const formTitle = isSignup ? 'Create Account' : 'Welcome Back';
  const formBody = isSignup
    ? 'Please create an account to save your details.'
    : 'Please sign in to access your account.';

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
    <div className="relative font-secondary">
      {toastMessage ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[1200] w-[min(92vw,540px)] -translate-x-1/2 border border-[rgba(23,110,77,0.18)] bg-white px-5 py-3 text-[12px] text-[#1c664b] shadow-[0_18px_45px_rgba(10,22,40,0.14)]">
          {toastMessage}
        </div>
      ) : null}

      <div>
        <h2 className="font-primary-display text-[clamp(1.7rem,2.6vw,2.25rem)] font-medium leading-none text-[var(--theme-ink)]">
          {formTitle}
        </h2>
        <p className="mt-3 text-[13px] leading-5 text-[var(--theme-muted)]">{formBody}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
        {isSignup ? (
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            type="text"
            autoComplete="username"
            placeholder="Username*"
            className="h-11 border border-[#b8b8b8] bg-white px-4 font-secondary text-[13px] text-[var(--theme-ink)] outline-none transition placeholder:text-[#4f5662] focus:border-[var(--theme-ink)]"
            required
          />
        ) : null}

        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          placeholder="Email*"
          className="h-11 border border-[#b8b8b8] bg-white px-4 font-secondary text-[13px] text-[var(--theme-ink)] outline-none transition placeholder:text-[#4f5662] focus:border-[var(--theme-ink)]"
          required
        />

        <div className="relative">
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type={showPassword ? 'text' : 'password'}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            placeholder="Password*"
            className="h-11 w-full border border-[#b8b8b8] bg-white px-4 pr-11 font-secondary text-[13px] text-[var(--theme-ink)] outline-none transition placeholder:text-[#4f5662] focus:border-[var(--theme-ink)]"
            required
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((current) => !current)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#737982] transition hover:text-[var(--theme-ink)]"
          >
            {showPassword ? <EyeOff size={17} strokeWidth={1.8} /> : <Eye size={17} strokeWidth={1.8} />}
          </button>
        </div>

        {!isSignup ? (
          <Link
            href="/login"
            className="w-fit font-primary-display text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--theme-ink)] underline-offset-4 transition hover:underline"
          >
            Forgot your password?
          </Link>
        ) : null}

        {error ? (
          <div className="border border-[rgba(179,69,69,0.28)] bg-[rgba(179,69,69,0.06)] px-4 py-2.5 text-[12px] text-[#8f2f2f]">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="brand-button mt-0.5 h-11 w-full justify-center bg-black text-white hover:bg-[#222] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Please Wait' : isSignup ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      <div className="my-6 h-px bg-[var(--theme-border)]" />

      <div className="border border-[var(--theme-border)] p-4 sm:p-5">
        <h3 className="font-primary-display text-[18px] font-medium leading-tight text-[var(--theme-ink)]">
          {isSignup ? 'Already Have An Account?' : "Don't Have An Account?"}
        </h3>
        <Link
          href={isSignup ? '/login' : '/signup'}
          className="brand-button mt-3 h-11 w-full justify-center bg-black text-white hover:bg-[#222]"
        >
          {isSignup ? 'Sign In' : 'Create Account'}
        </Link>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={submitting}
          className="font-primary-display text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--theme-muted)] transition hover:text-[var(--theme-ink)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSignup ? 'Sign Up With Google' : 'Sign In With Google'}
        </button>
      </div>

      <div className="mt-4 text-center">
        <Link href={getCollectionHref()} className="font-primary-display text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--theme-muted)] transition hover:text-[var(--theme-ink)]">
          Continue Browsing
        </Link>
      </div>
    </div>
  );
}
