'use client';

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import useUser from './hooks/useUser';
import { useQuery } from '@tanstack/react-query';
import { getESubDetails } from '@/api/equity';

type SessionState = ReturnType<typeof useUser>;

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const userState = useUser();

  const { isLoading: isLoadingStoreDetails, data } = useQuery({
    queryKey: ['store_info'],
    queryFn: () => getESubDetails().then((res) => res.store),
  });

  const value = useMemo(() => ({ ...userState }), [userState]);

  useEffect(() => {
    if (data) userState.refetch();
  }, [data]);

  if (isLoadingStoreDetails) return null;

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
