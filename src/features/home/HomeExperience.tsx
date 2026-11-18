'use client';

/**
 * Home page and listing on one route, so the cover can turn into the listing with one gesture:
 * the words fade, the road scene rises a little, and the white listing sheet comes up from the bottom.
 * `?view=listing` in the URL opens straight on the listing (used by back links).
 */
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import type { Faq } from '@/lib/api/types';
import { designPx } from '@/lib/layout';
import { skyLook, skyPhase } from '@/lib/sky';
import { Cover } from './Cover';
import { Listing } from './Listing';
import { ProjectDetails } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { getProjectDetails } from '@/lib/load';
import { Center, Spinner } from '@chakra-ui/react';
import { useSession } from '@/lib/session';

type Mode = 'cover' | 'moving' | 'listing';

/* In design px (see lib/layout.ts). */
/** Height of the road scene on the listing (RoadScene "listing"). */
const SCENE_HEIGHT = 530;
/** The sheet overlaps the scene by this much (Listing.module.css .sheet margin-top, screen px). */
const SHEET_OVERLAP = 28;
/** Where the sheet stops when the listing opens: this far up from its resting place. */
const OPEN_AT = 369;
/** How far a finger moves for a full open. */
const SWIPE_LENGTH = 340;
/** Movement below this is a tap, not a swipe. */
const TAP_SLOP = 6;
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
const easeInOut = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

export function HomeExperience({ listing, faq, startOnListing }: { listing: ProjectDetails; faq: Faq; startOnListing: boolean }) {
  const { isLoadingAgent, agent } = useSession();

  const { isLoading, data } = useQuery({
    queryKey: ['listingDetails', listing?.id?.toString()],
    queryFn: () => getProjectDetails(listing?.id?.toString()),
    enabled: !!listing?.id?.toString(),
  });

  const [sky, setSky] = useState(() => skyLook('up'));
  useEffect(() => {
    setSky(skyLook(skyPhase()));
  }, []);

  const [mode, setMode] = useState<Mode>(startOnListing ? 'listing' : 'cover');
  const sceneRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const progress = useRef(startOnListing ? 1 : 0);
  const openY = useRef(startOnListing ? 0 : OPEN_AT);
  const frame = useRef(0);
  const drag = useRef<{ y0: number; p0: number; moved: number } | null>(null);

  /** Draw the in-between state for progress p (0 = cover, 1 = listing). */
  const render = useCallback((p: number) => {
    progress.current = Math.max(0, Math.min(1, p));
    const u = designPx();
    const e = easeOut(progress.current);
    const fade = Math.max(0, 1 - progress.current * 2.2);
    if (sceneRef.current) sceneRef.current.style.transform = `translateY(${-50 * e * u}px)`;
    if (wordsRef.current) {
      wordsRef.current.style.opacity = String(fade);
      wordsRef.current.style.transform = `translateY(${-24 * e * u}px)`;
      wordsRef.current.style.pointerEvents = fade < 0.2 ? 'none' : '';
    }
    if (sheetRef.current) {
      const restingTop = SCENE_HEIGHT * u - SHEET_OVERLAP;
      const from = window.innerHeight - restingTop + 24 * u;
      sheetRef.current.style.transform = `translateY(${from * (1 - e) - openY.current * e}px)`;
    }
  }, []);

  /** Animate to the cover (0) or the listing (1). */
  const settle = useCallback(
    (to: 0 | 1) => {
      cancelAnimationFrame(frame.current);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const from = progress.current;
      const duration = reduce ? 1 : 560 * Math.abs(to - from) + 80;
      let t0: number | null = null;
      setMode('moving');
      const step = (t: number) => {
        if (t0 === null) t0 = t;
        const k = Math.min(1, (t - t0) / duration);
        render(from + (to - from) * easeInOut(k));
        if (k < 1) {
          frame.current = requestAnimationFrame(step);
          return;
        }
        setMode(to === 1 ? 'listing' : 'cover');
        window.history.replaceState(null, '', to === 1 ? '?view=listing' : window.location.pathname);
      };
      frame.current = requestAnimationFrame(step);
    },
    [render],
  );

  // Entering listing mode: the sheet goes back into the page flow, scrolled to where the animation left it.
  useEffect(() => {
    if (mode !== 'listing') return;
    if (sheetRef.current) sheetRef.current.style.transform = '';
    if (progress.current === 1 && openY.current) {
      window.scrollTo(0, openY.current);
      openY.current = 0;
    }
  }, [mode]);

  // Entering cover mode: draw the closed state.
  useEffect(() => {
    if (mode === 'cover') render(0);
  }, [mode, render]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const open = () => {
    openY.current = OPEN_AT * designPx();
    window.scrollTo(0, 0);
    settle(1);
  };

  const close = () => {
    // Start the sheet from where it is on screen now.
    openY.current = Math.min(window.scrollY, 900);
    window.scrollTo(0, 0);
    setMode('moving');
    requestAnimationFrame(() => {
      render(1);
      settle(0);
    });
  };

  // Swipe up on the cover, following the finger.
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    cancelAnimationFrame(frame.current);
    drag.current = { y0: e.clientY, p0: progress.current, moved: 0 };
  };

  useEffect(() => {
    const onMove = (e: globalThis.PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dy = (d.y0 - e.clientY) / designPx();
      d.moved = Math.max(d.moved, Math.abs(dy));
      if (d.moved > TAP_SLOP) {
        openY.current = OPEN_AT * designPx();
        setMode('moving');
        render(d.p0 + dy / SWIPE_LENGTH);
      }
    };
    const onUp = () => {
      const d = drag.current;
      drag.current = null;
      if (!d || d.moved <= TAP_SLOP) return;
      settle(progress.current > 0.3 ? 1 : 0);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [render, settle]);

  if (isLoading)
    return (
      <Center width="100%" height="100dvh">
        <Spinner size="xl" ringColor="var(--blue)" />
      </Center>
    );

  return (
    <>
      <Cover
        ref={wordsRef}
        sceneRef={sceneRef}
        sky={sky}
        area={listing?.address}
        hidden={mode === 'listing'}
        onGetStarted={open}
        onPointerDown={onPointerDown}
        isPaymentPlanAvailable={data?.payment_plan_is_available ?? listing?.payment_plan_is_available}
        companyName={listing?.constructed_by}
      />
      <Listing
        detail={data ?? listing}
        faq={faq}
        sky={sky}
        morphing={mode !== 'listing'}
        onBack={close}
        sheetRef={sheetRef}
        agentDetails={agent ?? null}
        isLoadingAgentDetails={isLoadingAgent}
      />
    </>
  );
}
