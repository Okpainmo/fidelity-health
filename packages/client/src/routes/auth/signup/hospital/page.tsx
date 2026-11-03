import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router';
import AuthShell from '@/routes/auth/components/AuthShell';
import TextField from '@/routes/auth/components/TextField';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { clearAuthError, handleSignup } from '@/rtk-base/slices/authSlice';

// Hospital / medical institution sign-up. The account's name is the
// institution's name; licence and contact details are added in the profile.
export default function HospitalSignupPage() {
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

    dispatch(handleSignup({ accountType: 'hospital', name: name.trim(), email: email.trim(), password }));
  }

  return (
    <AuthShell
      pageTitle="Register an institution"
      title="Register your institution"
      description="For hospitals and medical institutions partnering with Fidelity Health."
      submitLabel="Create institution account"
      submitting={isLoading}
      errorMessage={formError || error}
      onSubmit={onSubmit}
      switchPrompt="Already registered?"
      switchLinkLabel="Log in"
      switchHref="/login"
      secondaryLink={{ prompt: 'Signing up as a patient?', label: 'Create a patient account', href: '/signup' }}
      notice={
        <>
          By registering, you confirm you're authorised to act for this institution and agree to the{' '}
          <Link to="/legal/terms-of-use" className="text-ink-soft underline underline-offset-2 hover:text-foreground">
            Terms of Use
          </Link>{' '}
          and{' '}
          <Link to="/legal/privacy-policy" className="text-ink-soft underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </Link>
          . You'll add licence and contact details in your profile next.
        </>
      }
      fields={
        <>
          <TextField
            label="Institution name"
            name="name"
            autoComplete="organization"
            placeholder="e.g. Crestview Specialist Hospital"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            maxLength={100}
            required
          />
          <TextField
            label="Official email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="records@yourhospital.org"
            hint="Used to sign in. Use a shared address, such as the records office, rather than a personal one."
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
