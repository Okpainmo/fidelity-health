import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import AuthShell from '@/routes/auth/components/AuthShell';
import TextField from '@/routes/auth/components/TextField';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { clearAuthError, handleLogin } from '@/rtk-base/slices/authSlice';

// After a successful login the auth layout redirects to `?next=` or /chat.
export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Don't carry a stale error over to the next page.
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(handleLogin({ email, password }));
  }

  return (
    <AuthShell
      pageTitle="Log in"
      title="Welcome back"
      description="Log in to pick up where you left off."
      submitLabel="Log in"
      submitting={isLoading}
      errorMessage={error}
      onSubmit={onSubmit}
      switchPrompt="Don't have an account?"
      switchLinkLabel="Sign up"
      switchHref="/signup"
      fields={
        <>
          <TextField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </>
      }
    />
  );
}
