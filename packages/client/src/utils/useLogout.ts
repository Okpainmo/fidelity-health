import { useNavigate } from 'react-router';
import { requestConfirmation } from '@/components/ConfirmModalRoot';
import { useAppDispatch } from '@/rtk-base/hooks';
import { logout } from '@/rtk-base/slices/authSlice';

/** Asks for confirmation, then logs out and goes straight to the login page. */
export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return async function logOut() {
    const confirmed = await requestConfirmation({
      title: 'Log out?',
      message: "You'll need to log in again to keep chatting with Missie.",
      confirmLabel: 'Log out',
    });
    if (!confirmed) return;

    dispatch(logout());
    navigate('/login', { replace: true });
  };
}
