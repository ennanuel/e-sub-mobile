'use client';

import { forwardRef, type PointerEvent, type Ref } from 'react';
import { CityViewLogo } from '@/components/art/CityViewLogo';
import { RoadScene } from '@/components/art/RoadScene';
import { ArrowRight } from '@/components/icons';
import type { SkyLook } from '@/lib/sky';
import styles from './Cover.module.css';

interface CoverProps {
  sky: SkyLook;
  /** "Apo, Abuja" -> big "Apo" with "Abuja" in blue under it. */
  area: string;
  onGetStarted: () => void;
  onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
  isPaymentPlanAvailable: boolean;
  companyName: string;
  hidden: boolean;
  /** The home page moves the scene (this ref) and the words (the forwarded ref) during the swipe up. */
  sceneRef: Ref<HTMLDivElement>;
}

/** Page 1: the road scene. Swipe up or tap Get started to open the listing. */
export const Cover = forwardRef<HTMLDivElement, CoverProps>(function Cover(
  { sky, area, onGetStarted, onPointerDown, hidden, sceneRef, isPaymentPlanAvailable, companyName },
  textRef,
) {
  const [place, city] = area.split(',').map((s) => s.trim());

  return (
    <div className={styles.cover} style={{ background: sky.background }} onPointerDown={onPointerDown} hidden={hidden}>
      <div ref={sceneRef} className={styles.scene}>
        <RoadScene sky={sky} variant="home" />
      </div>

      <div ref={textRef} className={styles.text}>
        <div className={styles.fade} aria-hidden="true" />
        <div className={styles.top}>
          <CityViewLogo width={108} />
          <span className={styles.badge}>{companyName ?? 'NEW DEVELOPMENT'}</span>
        </div>
        <h1 className={styles.title}>
          {place}
          <span>{city}</span>
        </h1>
        <p className={styles.tagline}>
          {"At the end of this road there's a plot. "}
          <span>All it needs is your name on the title.</span>
        </p>
        <div className={styles.facts}>C OF O{isPaymentPlanAvailable ? ' · PAYMENT PLAN AVAILABLE' : ''}</div>
        <button type="button" className={styles.go} onClick={onGetStarted}>
          Get started
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
});
