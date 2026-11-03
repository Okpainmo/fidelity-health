import type { ComponentType, SVGProps } from 'react';
import {
  HiOutlineArrowRightStartOnRectangle,
  HiOutlineBeaker,
  HiOutlineBuildingOffice2,
  HiOutlineChevronRight,
  HiOutlineClipboardDocumentList,
  HiOutlineDocument,
  HiOutlineEnvelope,
  HiOutlineHeart,
  HiOutlinePaperClip,
  HiOutlinePhoto,
  HiOutlineScissors,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';
import { Link } from 'react-router';
import StatusBadge from '@/components/StatusBadge';
import { recordTypeLabel } from '@/data/records';
import type { RecordTypeValue } from '@/data/records';
import type { RecordSummary } from '@/rtk-base/slices/recordsSlice';
import { formatDate } from '@/utils/dates';

export const TYPE_ICONS: Record<RecordTypeValue, ComponentType<SVGProps<SVGSVGElement>>> = {
  outpatient: HiOutlineHeart,
  admission: HiOutlineBuildingOffice2,
  discharge: HiOutlineArrowRightStartOnRectangle,
  lab: HiOutlineBeaker,
  imaging: HiOutlinePhoto,
  prescription: HiOutlineClipboardDocumentList,
  immunization: HiOutlineShieldCheck,
  surgery: HiOutlineScissors,
  referral: HiOutlineEnvelope,
  other: HiOutlineDocument,
};

// One record in a list, linking to its detail page. `showPatient` is for
// hospitals and admins (who see many patients' records).
export default function RecordRow({ record, showPatient = false, showHospital = true }: { record: RecordSummary; showPatient?: boolean; showHospital?: boolean }) {
  const Icon = TYPE_ICONS[record.recordType] ?? HiOutlineDocument;

  return (
    <li>
      <Link
        to={`/records/${record.id}`}
        className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition hover:border-accent/40 hover:shadow-[0_6px_24px_rgba(27,127,121,0.07)] sm:p-5"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
          <Icon className="size-5 text-accent" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          {showPatient ? (
            <span className="block truncate text-xs font-medium tracking-wide text-accent-ink uppercase">
              {record.patient.name} · {record.patient.fhId}
            </span>
          ) : null}
          <span className="block truncate text-[15px] font-semibold text-foreground">{record.title}</span>
          <span className="mt-0.5 block truncate text-sm text-ink-soft">
            {recordTypeLabel(record.recordType)} · {showHospital ? record.hospital.name : record.department}
            {record.attachmentCount > 0 ? (
              <span className="ml-2 inline-flex items-center gap-0.5 text-ink-faint">
                <HiOutlinePaperClip className="size-3.5" aria-hidden="true" />
                {record.attachmentCount}
              </span>
            ) : null}
          </span>
        </span>
        <span className="hidden shrink-0 text-right sm:block">
          <span className="block text-sm text-foreground">{formatDate(record.encounterDate)}</span>
          <span className="mt-1 block">
            <StatusBadge status={record.status} />
          </span>
        </span>
        <HiOutlineChevronRight className="size-5 shrink-0 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
      </Link>
    </li>
  );
}
