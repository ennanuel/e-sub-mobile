'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import useUser from './hooks/useUser';
import { useQuery } from '@tanstack/react-query';
import { getESubDetails } from '@/api/equity';
import { fetchRealtorByReferralId, ReferralRealtor } from './load';

type SessionState = ReturnType<typeof useUser> & { isLoadingAgent: boolean; agent: ReferralRealtor | null };

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const userState = useUser();
  const [agentReferralId, setAgentReferralId] = useState<string | null>();

  const { isLoading: isLoadingStoreDetails, data } = useQuery({
    queryKey: ['store_info'],
    queryFn: () => getESubDetails().then((res) => res.store),
  });

  const { isLoading: isLoadingAgent, data: agentData } = useQuery({
    queryKey: ['agent_details', agentReferralId],
    queryFn: () => fetchRealtorByReferralId(agentReferralId!),
    enabled: !!agentReferralId,
  });

  const agent = useMemo(() => agentData?.data ?? null, [agentData]);

  const value = useMemo(() => ({ ...userState, isLoadingAgent, agent }), [userState, isLoadingAgent, agent]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      const agentReferralIdParam = searchParams.get('agent_referral_id');
      setAgentReferralId(agentReferralIdParam ?? null);
    }
  }, []);

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
