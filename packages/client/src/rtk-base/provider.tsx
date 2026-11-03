import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { useAppDispatch } from './hooks';
import { forceLoggedOut } from './slices/authSlice';
import { store } from './store';
import { SESSION_EXPIRED_EVENT } from '@/utils/sessionExpiry';
import ConfirmModalRoot from '@/components/ConfirmModalRoot';

// Turns the axios layer's "session expired" event into store state, so the
// route guard can send the user back to /login.
function SessionExpiryListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    function handleExpiredSession() {
      dispatch(forceLoggedOut());
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpiredSession);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpiredSession);
  }, [dispatch]);

  return null;
}

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <SessionExpiryListener />
      {children}
      <ConfirmModalRoot />
    </Provider>
  );
}
