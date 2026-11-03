import type { ComponentType, SVGProps } from 'react';
import {
  HiOutlineArrowRight,
  HiOutlineArrowUpTray,
  HiOutlineChatBubbleLeftRight,
  HiOutlineFolderOpen,
  HiOutlineLockClosed,
  HiOutlineUserCircle,
  HiOutlineUsers,
} from 'react-icons/hi2';
import { Link } from 'react-router';
import HelpPatientsRegister from '@/components/HelpPatientsRegister';
import VerificationNotice from '@/components/VerificationNotice';
import PageTitle from '@/components/PageTitle';
import { useAppSelector } from '@/rtk-base/hooks';
import { selectAccountType } from '@/rtk-base/slices/authSlice';
import { useHospitalVerification } from '@/utils/useHospitalVerification';

type Action = {
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  cta: string;
  missie?: boolean;
};

const ASK_MISSIE: Action = {
  to: '/missie/chat',
  icon: HiOutlineChatBubbleLeftRight,
  title: 'Ask Missie',
  description: 'Get quick, plain-language answers about records, access and sharing, partner hospitals and how data is protected.',
  cta: 'Start a conversation',
  missie: true,
};

const HOSPITAL_ACTIONS: Action[] = [
  {
    to: '/records/upload',
    icon: HiOutlineArrowUpTray,
    title: 'Upload record',
    description: "Find a registered patient and add a record: visit notes, lab results, imaging, prescriptions and more. Your records team verifies it before it reaches the patient's history.",
    cta: 'Start an upload',
  },
  {
    to: '/records',
    icon: HiOutlineUsers,
    title: 'Patient records',
    description: 'Browse every record your institution has submitted. Search by patient or Fidelity Health ID, and track what is still pending review.',
    cta: 'View patient records',
  },
  ASK_MISSIE,
];

const PATIENT_ACTIONS: Action[] = [
  {
    to: '/records',
    icon: HiOutlineFolderOpen,
    title: 'My records',
    description: 'Your complete medical history from every partner hospital, in one place. Search, filter and open any record with its attachments.',
    cta: 'View my records',
  },
  ASK_MISSIE,
  {
    to: '/profile',
    icon: HiOutlineUserCircle,
    title: 'My profile',
    description: 'Keep your personal details, emergency contacts, allergies and insurance up to date so hospitals can find you and treat you safely.',
    cta: 'Update my profile',
  },
];

function ActionCard({ to, icon: Icon, title, description, cta, missie }: Action) {
  return (
    <Link
      to={to}
      className={`group flex w-full flex-col rounded-3xl border p-6 transition sm:p-7 ${
        missie
          ? 'border-accent/30 bg-gradient-to-br from-accent-soft to-white hover:border-accent/50 hover:shadow-[0_8px_30px_rgba(27,127,121,0.12)]'
          : 'border-line bg-white hover:border-accent/40 hover:shadow-[0_8px_30px_rgba(27,127,121,0.08)]'
      }`}
    >
      <span className={`flex size-12 items-center justify-center rounded-2xl ${missie ? 'bg-accent text-accent-foreground' : 'bg-accent-soft text-accent'}`}>
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h2 className="poppins mt-6 text-xl font-medium">{title}</h2>
      <p className="mt-2 flex-1 text-[15px] leading-7 text-ink-soft">{description}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent">
        {cta}
        <HiOutlineArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  );
}

export default function HomePage() {
  const user = useAppSelector((state) => state.auth.user);
  const accountType = useAppSelector(selectAccountType);
  const isHospital = accountType === 'hospital';
  const verification = useHospitalVerification();
  const verificationNote = useAppSelector((state) => state.profile.data?.verificationNote);

  const greeting = isHospital ? (user?.name ? `Welcome, ${user.name}` : 'Welcome') : `Welcome back${user?.name ? `, ${user.name.trim().split(/\s+/)[0]}` : ''}`;
  const actions = isHospital ? HOSPITAL_ACTIONS : PATIENT_ACTIONS;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-14 pb-20 sm:pt-20">
      <PageTitle title="Home" />

      <header className="max-w-2xl">
        <p className="text-sm font-medium text-accent">{greeting}</p>
        <h1 className="poppins mt-3 text-[34px] leading-[1.15] font-medium tracking-tight sm:text-[44px]">
          {isHospital ? "Your patients' records, verified and in one place." : 'Your medical history, safely in one place.'}
        </h1>
        <p className="mt-4 text-[17px] leading-8 text-ink-soft">
          {isHospital
            ? 'Add records for registered patients, keep track of what you have submitted, and get help from Missie along the way.'
            : 'Fidelity Health works with partner hospitals to keep a complete, protected record of your care. Choose what you would like to do.'}
        </p>
      </header>

      {verification && verification !== 'verified' ? (
        <div className="mt-8 max-w-3xl">
          <VerificationNotice status={verification} note={typeof verificationNote === 'string' ? verificationNote : null} />
        </div>
      ) : null}

      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <li key={action.to} className="flex">
            <ActionCard {...action} />
          </li>
        ))}
      </ul>

      {isHospital ? (
        <div className="mt-8">
          <HelpPatientsRegister />
        </div>
      ) : null}

      <p className="mt-10 flex items-start gap-2.5 text-sm leading-6 text-ink-faint">
        <HiOutlineLockClosed className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Records are only shared with the people and hospitals the patient has allowed. Fidelity Health is a fictional demo platform, so please don't use real
        medical data.
      </p>
    </div>
  );
}
