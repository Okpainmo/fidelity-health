import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/rtk-base/hooks';
import { selectAccountType } from '@/rtk-base/slices/authSlice';
import { fetchProfile } from '@/rtk-base/slices/profileSlice';

export type HospitalVerification = 'pending' | 'verified' | 'rejected';

/**
 * For hospital accounts: the institution's verification status (loads the
 * profile if needed), or null while loading. Always null for patients.
 * Only verified institutions can search patients and upload records.
 */
export function useHospitalVerification(): HospitalVerification | null {
  const dispatch = useAppDispatch();
  const accountType = useAppSelector(selectAccountType);
  const { data, isLoading } = useAppSelector((state) => state.profile);
  const isHospital = accountType === 'hospital';

  useEffect(() => {
    if (isHospital && !data && !isLoading) dispatch(fetchProfile());
  }, [dispatch, isHospital, data, isLoading]);

  if (!isHospital || !data) return null;
  const status = data.verificationStatus;
  return status === 'verified' || status === 'rejected' ? status : 'pending';
}
