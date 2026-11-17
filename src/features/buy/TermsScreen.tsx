'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Screen } from '@/components/ui/Screen';
import { SlideToConfirm } from '@/components/ui/SlideToConfirm';
import text from '@/components/ui/text.module.css';
import type { Terms } from '@/lib/api/types';
import { usePurchase } from '@/lib/purchase';
import { routes } from '@/lib/routes';
import { useSession } from '@/lib/session';
import styles from './TermsScreen.module.css';
import { Center, Spinner } from '@chakra-ui/react';

/** Every clause of the deal. The slider unlocks only when the buyer has scrolled to the end. */
export function TermsScreen({ slug, developmentName, terms }: { slug: string; developmentName: string; terms: Terms }) {
  const router = useRouter();
  const purchase = usePurchase();
  const { user } = useSession();
  const endRef = useRef<HTMLSpanElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const [read, setRead] = useState(false);
  const [progress, setProgress] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [nudge, setNudge] = useState(0);
  const clauseCount = terms.sections.reduce((n, s) => n + s.clauses.length, 0);
  
  const [isRouting, setIsRouting] = useState(false);

  const check = useCallback(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 1;
    setProgress(p);
    const end = endRef.current?.getBoundingClientRect().bottom ?? Infinity;
    const slider = slideRef.current?.getBoundingClientRect().top ?? 0;
    if (end <= slider + 4 || p > 0.985) setRead(true);
  }, []);

  useEffect(() => {
    if (read) return;
    
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [read, check]);

  useEffect(() => {
    if (!purchase.unitId) router.push(routes.listing(slug));
  }, [purchase]);

  useEffect(() => {
    return () => {
      setIsRouting(false);
    }
  }, [])

  const percent = Math.round(progress * 100);
  const label = agreed ? 'Agreed' : read ? 'Slide to agree' : percent < 3 ? 'Read to the end to slide' : `Keep reading · ${percent}%`;

  const agree = () => {
    setAgreed(true);
    purchase.agreeTerms(terms.version);
    setTimeout(() => router.push(user ? routes.buy.details(slug) : routes.buy.email(slug)), 800);
    setIsRouting(true);
  };

  if (!purchase.unitId) return <Center width="100%" height="100dvh">
    <Spinner size='xl' />
  </Center>

  return (
    <Screen
      disabled={isRouting}
      label="Terms of the deal"
      back={
        purchase.unitId?.toString()
          ? routes.plot(slug, purchase.unitId?.toString() ?? '', purchase.paymentPlan?.payment_period_in_months)
          : routes.listing(slug)
      }
      footer={
        <div ref={slideRef}>
          <SlideToConfirm
            label={label}
            locked={!read}
            progress={progress}
            done={agreed}
            onConfirm={agree}
            onLockedAttempt={() => setNudge((n) => n + 1)}
          />
          {nudge > 0 && !read && (
            <p key={nudge} className={styles.nudge} role="alert">
              Please read all the terms first
            </p>
          )}
        </div>
      }
    >
      <div className={text.kicker}>Terms of the deal</div>
      <h1 className={styles.title}>Read, then slide</h1>
      <p className={styles.intro}>
        These are all the terms of your {developmentName} deal with LCR LIMITED: {terms.sections.length} sections, {clauseCount} clauses.
        Please read every one.
      </p>
      {terms.sections.map((section, i) => (
        <section key={section.title} className={styles.section}>
          <div className={styles.sectionHead}>
            <b>{String(i + 1).padStart(2, '0')}</b>
            <h2>{section.title}</h2>
          </div>
          {section.clauses.map((clause, k) => (
            <p key={k} className={styles.clause}>
              <span>
                {i + 1}.{k + 1}
              </span>
              <span>{clause}</span>
            </p>
          ))}
        </section>
      ))}
      <span ref={endRef} className={styles.end} />
    </Screen>
  );
}
