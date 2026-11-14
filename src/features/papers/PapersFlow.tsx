'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BrandName } from '@/components/BrandName';
import { Screen } from '@/components/ui/Screen';
import { SlideToConfirm } from '@/components/ui/SlideToConfirm';
import text from '@/components/ui/text.module.css';
import { api, errorMessage, isSessionExpired } from '@/lib/api';
import type { Paper, PaperId } from '@/lib/api/types';
import { viewStamp } from '@/lib/format';
import { routes } from '@/lib/routes';
import { useSession } from '@/lib/session';
import { PaperStack } from './PaperStack';
import { PaperViewer } from './PaperViewer';
import { SignInSheet } from './SignInSheet';
import { ViewOnlyNotice } from './ViewOnlyNotice';
import styles from './PapersFlow.module.css';
import { Paperwork, ProjectDetails } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { getESubDetails } from '@/api/equity';

interface PapersFlowProps {
  listing: ProjectDetails;
  paperwork: Paperwork | null;
  openPaper?: PaperId;
}
export function PapersFlow({ listing, paperwork, openPaper }: PapersFlowProps) {
  const router = useRouter();
  const { user, token } = useSession();
  const [isShowingNotice, setIsShowingNotice] = useState(false);

  const showNotice = () => {
    setIsShowingNotice(true);
  };
  const hideNotice = () => {
    setIsShowingNotice(false);
  };

  useQuery({
    queryKey: ['123'],
    queryFn: () => {
      getESubDetails().then((res) => {
        console.warn(res);
      });
    },
  });

  const [sheetOpen, setSheetOpen] = useState(false);
  const [slideKey, setSlideKey] = useState(0);
  const [papers, setPapers] = useState<Paper[] | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [stamp, setStamp] = useState('');

  const slug = listing?.id?.toString();
  const estate = `${listing?.name}, ${listing?.address}`;
  const brand = <Brand name={listing?.name} area={listing?.address} />;

  const viewer = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim();

  useEffect(() => {
    if (papers) return;
    let live = true;
    setError('');
    api
      .getPapers(slug, token ?? '')
      .then((p) => live && setPapers(p))
      .catch((e) => {
        if (!live) return;
        setError(errorMessage(e, 'Could not load the papers.'));
      });
    return () => {
      live = false;
    };
  }, [slug, papers, attempt]);

  useEffect(() => {
    setStamp(viewStamp());
  }, [token, openPaper]);

  if (!user) {
    return (
      <>
        <Screen label="Paperwork" back={routes.listing(slug)} backLabel="Back to the listing" title={brand}>
          <div className={styles.intro}>
            <h1 className={styles.heading}>Paperwork</h1>
            <p className={styles.sub}>The title documents for the estate, in one place</p>
            <PaperStack papers={paperwork?.documents ?? []} variant="preview" estate={estate} />
            <div className={styles.slide}>
              <SlideToConfirm key={slideKey} label="Slide to view" onConfirm={() => setTimeout(() => setSheetOpen(true), 180)} />
            </div>
          </div>
        </Screen>
        {sheetOpen && (
          <SignInSheet
            onSignUp={() => {
              showNotice();
            }}
            onClose={() => {
              setSheetOpen(false);
              setSlideKey((k) => k + 1);
            }}
          />
        )}
      </>
    );
  }

  if (isShowingNotice) {
    return (
      <ViewOnlyNotice
        name={viewer}
        email={user?.email}
        stamp={stamp}
        onAccept={() => {
          hideNotice();
        }}
      />
    );
  }

  const paper = openPaper && papers?.find((p) => p.id === openPaper);
  if (paper) {
    return (
      <Screen
        key={paper.id}
        label={paper.title}
        back={() => router.back()}
        backLabel="Back to the papers"
        title={
          <span className={styles.viewTitle}>
            <span className={styles.viewLabel}>{paper.label}</span>
            <span className={styles.viewName}>{paper.title}</span>
          </span>
        }
        actions={<span className={styles.count}>{paper.pages.length} PLOTS</span>}
      >
        <PaperViewer paper={paper} viewer={viewer} stamp={stamp} />
      </Screen>
    );
  }

  return (
    <Screen
      label="The papers"
      back={routes.listing(slug)}
      title={brand}
      actions={<span className={styles.initials}>{(user?.first_name?.[0] + user?.last_name?.[0]).toUpperCase()}</span>}
    >
      <h1 className={`${styles.heading} ${styles.greeting}`}>
        Hi {user?.first_name}, here are
        <br />
        the papers
      </h1>
      <p className={styles.sub}>Tap a card to bring it forward, then Open.</p>
      {error && (
        <p className={text.error}>
          {error}{' '}
          <button type="button" className={text.inlineLink} onClick={() => setAttempt((n) => n + 1)}>
            Try again
          </button>
        </p>
      )}
      <PaperStack
        papers={paperwork?.documents ?? []}
        variant="open"
        estate={estate}
        viewerName={viewer}
        ready={!!papers}
        onOpen={(id) => router.push(routes.paper(slug, id))}
      />
    </Screen>
  );
}

/** Top bar: the estate's name and area, left-aligned next to back. */
function Brand({ name, area }: { name: string; area: string }) {
  return (
    <span className={styles.brand}>
      <b>
        <BrandName name={name} />
      </b>
      <small>{area}</small>
    </span>
  );
}
