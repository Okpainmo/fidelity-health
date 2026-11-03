import { useEffect } from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import HelpPatientsRegister from '@/components/HelpPatientsRegister';
import PageTitle from '@/components/PageTitle';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { selectAccountType, userUpdated } from '@/rtk-base/slices/authSlice';
import { clearProfileSaveStatus, fetchProfile, saveProfile } from '@/rtk-base/slices/profileSlice';
import { formatDate } from '@/utils/dates';
import { buildProfilePayload } from './buildPayload';
import ProfileForm from './components/ProfileForm';
import ProfileHeader from './components/ProfileHeader';
import { AllergiesMedicationsSection, ClinicalProfileSection } from './sections/HealthSections';
import { InstitutionSection, LocationSection, ResponsiblePeopleSection, ServicesSection } from './sections/HospitalSections';
import { ContactSection, IdentitySection, InsuranceSection, NextOfKinSection } from './sections/PatientSections';
import { str } from './values';

const PATIENT_SECTIONS = [
  { id: 'identity', title: 'Personal details' },
  { id: 'contact', title: 'Contact and address' },
  { id: 'next-of-kin', title: 'Next of kin' },
  { id: 'insurance', title: 'Insurance and payment' },
  { id: 'clinical', title: 'Health profile' },
  { id: 'allergies', title: 'Allergies and medications' },
] as const;

const HOSPITAL_SECTIONS = [
  { id: 'institution', title: 'Institution details' },
  { id: 'location', title: 'Location and contact' },
  { id: 'services', title: 'Services' },
  { id: 'people', title: 'Contacts' },
] as const;

const VERIFICATION_BADGES: Record<string, { label: string; className: string; dot: string }> = {
  verified: { label: 'Verified', className: 'bg-accent-soft text-accent-ink', dot: 'bg-accent' },
  rejected: { label: 'Verification declined', className: 'bg-red-50 text-danger', dot: 'bg-danger' },
  pending: { label: 'Verification pending', className: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
};

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2)).toUpperCase() || '?';
}

function LoadingState() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-5 pt-10 sm:pt-14" aria-busy="true" aria-label="Loading profile">
      <div className="h-40 rounded-3xl bg-muted" />
      <div className="mt-10 grid gap-6 lg:ml-[260px]">
        <div className="h-72 rounded-3xl bg-muted" />
        <div className="h-56 rounded-3xl bg-muted" />
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 pt-24 text-center">
      <HiOutlineExclamationTriangle className="size-10 text-danger" aria-hidden="true" />
      <h1 className="poppins mt-4 text-2xl font-medium">Couldn't load your profile</h1>
      <p className="mt-2 text-ink-soft">{message}</p>
      <button type="button" onClick={onRetry} className="mt-6 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:bg-accent-hover">
        Try again
      </button>
    </div>
  );
}

// /profile: the signed-in account's own profile, patient or institution.
// Loaded from and saved to the server (GET / PATCH /user/me/profile).
export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const accountType = useAppSelector(selectAccountType);
  const { data, isLoading, error, isSaving, saveError, savedAt } = useAppSelector((state) => state.profile);

  useEffect(() => {
    dispatch(fetchProfile());
    return () => {
      dispatch(clearProfileSaveStatus());
    };
  }, [dispatch]);

  if (!user) return null;
  const title = accountType === 'hospital' ? 'Institution profile' : 'My profile';

  if (!data) {
    return (
      <>
        <PageTitle title={title} />
        {error && !isLoading ? <ErrorState message={error} onRetry={() => dispatch(fetchProfile())} /> : <LoadingState />}
      </>
    );
  }

  async function onSave(form: HTMLFormElement) {
    const result = await dispatch(saveProfile(buildProfilePayload(accountType, form)));
    // The account name follows the profile (patient's name / institution name).
    if (saveProfile.fulfilled.match(result)) dispatch(userUpdated(result.payload.userProfile));
  }

  const formState = {
    onSave,
    saving: isSaving,
    saveError,
    saved: Boolean(savedAt),
    onEdit: () => dispatch(clearProfileSaveStatus()),
  };

  const name = user.name?.trim() || user.email;
  const memberSince = user.createdAt ? formatDate(user.createdAt) : undefined;

  if (accountType === 'hospital') {
    const badge = VERIFICATION_BADGES[str(data, 'verificationStatus')] ?? VERIFICATION_BADGES.pending;
    return (
      <>
        <PageTitle title={title} />
        <ProfileForm
          {...formState}
          sections={HOSPITAL_SECTIONS}
          header={
            <ProfileHeader
              initials={initialsOf(name)}
              name={name}
              email={user.email}
              idLabel="Institution ID"
              idValue={str(data, 'institutionId')}
              memberSince={memberSince}
              badge={
                <>
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-ink">Partner institution</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}>
                    <span className={`size-1.5 rounded-full ${badge.dot}`} aria-hidden="true" />
                    {badge.label}
                  </span>
                </>
              }
            />
          }
          intro={
            <>
              <p className="rounded-2xl bg-muted px-4 py-3 text-sm leading-6 text-ink-soft">
                Complete these details so Fidelity Health can verify your institution. Changing the institution name also renames your account.
              </p>
              <HelpPatientsRegister />
            </>
          }
        >
          <InstitutionSection values={data} institutionName={user.name ?? ''} />
          <LocationSection values={data} />
          <ServicesSection values={data} />
          <ResponsiblePeopleSection values={data} />
        </ProfileForm>
      </>
    );
  }

  return (
    <>
      <PageTitle title={title} />
      <ProfileForm
        {...formState}
        sections={PATIENT_SECTIONS}
        header={
          <ProfileHeader
            initials={initialsOf(name)}
            name={name}
            email={user.email}
            idLabel="Fidelity Health ID"
            idValue={str(data, 'fhId')}
            photoUrl={str(data, 'photoUrl') || null}
            memberSince={memberSince}
            badge={<span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-ink">Patient</span>}
          />
        }
        intro={
          <p className="rounded-2xl bg-muted px-4 py-3 text-sm leading-6 text-ink-soft">
            Hospitals use these details to find you and to treat you safely, so keep them up to date. Give your Fidelity Health ID at the hospital so staff
            can find you.
          </p>
        }
      >
        <IdentitySection values={data} />
        <ContactSection values={data} />
        <NextOfKinSection values={data} />
        <InsuranceSection values={data} />
        <ClinicalProfileSection values={data} />
        <AllergiesMedicationsSection values={data} />
      </ProfileForm>
    </>
  );
}
