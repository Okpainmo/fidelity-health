import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { FormEvent } from 'react';
import AuthShell from '@/routes/auth/components/AuthShell';
import TextField from '@/routes/auth/components/TextField';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { clearAuthError, handleSignup } from '@/rtk-base/slices/authSlice';

// Patient sign-up. Signing up starts a session straight away (the server
// issues tokens on register), so the auth layout redirects home once it succeeds.
// Hospitals register at /signup/hospital.
export default function SignupPage() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    // The server validates the password rules and returns a readable message.
    dispatch(handleSignup({ accountType: 'patient', name: name.trim(), email: email.trim(), password }));
  }

  return (
    <AuthShell
      pageTitle="Sign up"
      title="Create your patient account"
      description="See your medical history from every partner hospital in one place."
      submitLabel="Create account"
      submitting={isLoading}
      errorMessage={formError || error}
      onSubmit={onSubmit}
      switchPrompt="Already have an account?"
      switchLinkLabel="Log in"
      switchHref="/login"
      secondaryLink={{ prompt: 'Registering a hospital or clinic?', label: 'Create an institution account', href: '/signup/hospital' }}
      notice={
        <>
          By creating an account, you agree to the{' '}
          <Link to="/legal/terms-of-use" className="text-ink-soft underline underline-offset-2 hover:text-foreground">
            Terms of Use
          </Link>{' '}
          and{' '}
          <Link to="/legal/privacy-policy" className="text-ink-soft underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </>
      }
      fields={
        <>
          <TextField
            label="Full name"
            name="name"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            maxLength={100}
            required
          />
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
            autoComplete="new-password"
            placeholder="Create a password"
            hint="At least 8 characters, with upper and lower case letters, a number and a symbol."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            minLength={8}
            required
          />
          <TextField
            label="Confirm password"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </>
      }
    />
  );
}
