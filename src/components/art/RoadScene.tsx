/** The road through the rock to the estate: drawn at 390 x 700, used on the home page and the listing. */
import { useId, type ReactNode } from 'react';
import type { SkyLook } from '@/lib/sky';
import styles from './RoadScene.module.css';

interface RoadSceneProps {
  sky: SkyLook;
  /** "home" shows the full 700px scene; "listing" crops to 530px from y=50. */
  variant: 'home' | 'listing';
}

export function RoadScene({ sky, variant }: RoadSceneProps) {
  const id = useId().replace(/:/g, '');
  const leftClip = `rock-left-${id}`;
  const rightClip = `rock-right-${id}`;
  const listing = variant === 'listing';

  return (
    <div className={`${styles.scene} ${listing ? styles.listing : styles.home}`} style={{ background: sky.background }} aria-hidden="true">
      <svg className={styles.art} viewBox={listing ? '0 50 390 530' : '0 0 390 700'}>
        <defs>
          <clipPath id={leftClip}>
            <polygon points="0,318 30,300 58,326 92,318 120,352 146,378 166,400 180,420 0,680" />
          </clipPath>
          <clipPath id={rightClip}>
            <polygon points="390,150 356,134 332,168 300,160 276,222 252,290 232,356 210,420 390,680" />
          </clipPath>
        </defs>
        <g
          style={{
            transformOrigin: '292px 98px',
            transform: sky.sunLow ? 'translate(-97px, 306px) scale(1.33)' : 'none',
            transition: 'transform 1.6s ease-in-out',
          }}
        >
          <circle cx="292" cy="98" r="46" fill={sky.sun} opacity=".35" />
          <circle cx="292" cy="98" r="30" fill={sky.sun} />
        </g>
        <path d="M0 420 C 50 396, 110 410, 160 414 L 230 414 C 262 408, 300 400, 390 418 V430 H0 Z" fill={sky.hills} />
        <rect x="0" y="420" width="390" height="280" fill="#0B0B3B" />
        <polygon points="186,420 204,420 380,680 10,680" fill="#4A4AFE" />
        <path d="M187 420 L18 680 M203 420 L372 680" stroke="#FFFFFF" strokeWidth="1.5" opacity=".7" fill="none" />
        <g fill="#FFFFFF">
          <polygon points="191.4,587.7 198.6,587.7 198.0,556.8 192.0,556.8" />
          <polygon points="192.5,528.3 197.5,528.3 197.1,506.7 192.9,506.7" />
          <polygon points="193.3,486.7 196.7,486.7 196.4,472.0 193.6,472.0" />
          <polygon points="193.8,460.0 196.2,460.0 196.0,450.6 194.0,450.6" />
          <polygon points="194.1,443.6 195.9,443.6 195.7,437.3 194.3,437.3" />
          <polygon points="194.3,433.0 195.7,433.0 195.6,428.7 194.4,428.7" />
        </g>
        <polygon points="0,318 30,300 58,326 92,318 120,352 146,378 166,400 180,420 0,680" fill="#14143A" />
        <polygon points="92,318 120,352 146,378 166,400 180,420 118,500 96,420 84,360" fill="#2E2EB8" />
        <polygon points="30,300 58,326 48,366 16,348" fill="#4A4AFE" />
        <g clipPath={`url(#${leftClip})`} stroke="#A9A9FF" strokeWidth="1.3" opacity=".4" fill="none">
          <path d="M0 350 L195 420" />
          <path d="M0 395 L195 420" />
          <path d="M0 440 L195 420" />
          <path d="M0 500 L195 420" />
          <path d="M0 580 L195 420" />
        </g>
        <polygon points="390,150 356,134 332,168 300,160 276,222 252,290 232,356 210,420 390,680" fill="#14143A" />
        <polygon points="300,160 276,222 252,290 232,356 210,420 270,500 292,380 306,250" fill="#2E2EB8" />
        <polygon points="306,250 292,380 330,420 350,300" fill="#24248F" />
        <polygon points="356,134 332,168 344,226 376,200" fill="#4A4AFE" />
        <g clipPath={`url(#${rightClip})`} stroke="#A9A9FF" strokeWidth="1.3" opacity=".4" fill="none">
          <path d="M390 200 L195 420" />
          <path d="M390 270 L195 420" />
          <path d="M390 340 L195 420" />
          <path d="M390 410 L195 420" />
          <path d="M390 480 L195 420" />
          <path d="M390 570 L195 420" />
        </g>
      </svg>
      {/* Cars driving away from and towards the viewer. */}
      <span className={`${styles.car} ${styles.away}`}>
        <CarAwayYellow />
      </span>
      <span className={`${styles.car} ${styles.away} ${styles.away2}`}>
        <CarAwayWhite />
      </span>
      <span className={`${styles.car} ${styles.toward}`}>
        <CarTowardWhite />
      </span>
      <span className={`${styles.car} ${styles.toward} ${styles.toward2}`}>
        <CarTowardLilac />
      </span>
    </div>
  );
}

const Car = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 80 64" width="100%" height="100%" style={{ display: 'block' }}>
    {children}
  </svg>
);

const CarAwayYellow = () => (
  <Car>
    <ellipse cx="40" cy="59" rx="34" ry="4" fill="#0B0B3B" opacity=".45" />
    <rect x="12" y="48" width="12" height="12" rx="3" fill="#0B0B3B" />
    <rect x="56" y="48" width="12" height="12" rx="3" fill="#0B0B3B" />
    <path d="M17 30 L24 11 Q25 8 28 8 H52 Q55 8 56 11 L63 30 Z" fill="#E8A800" />
    <path d="M24 27 L28 13 H52 L56 27 Z" fill="#0B0B3B" />
    <rect x="7" y="26" width="66" height="28" rx="8" fill="#FFD678" />
    <rect x="10" y="32" width="13" height="6" rx="2" fill="#FF5A5A" />
    <rect x="57" y="32" width="13" height="6" rx="2" fill="#FF5A5A" />
    <rect x="31" y="38" width="18" height="8" rx="1.5" fill="#FFFFFF" stroke="#0B0B3B" strokeWidth="1" />
  </Car>
);
const CarAwayWhite = () => (
  <Car>
    <ellipse cx="40" cy="59" rx="34" ry="4" fill="#0B0B3B" opacity=".45" />
    <rect x="12" y="48" width="12" height="12" rx="3" fill="#0B0B3B" />
    <rect x="56" y="48" width="12" height="12" rx="3" fill="#0B0B3B" />
    <path d="M17 30 L24 11 Q25 8 28 8 H52 Q55 8 56 11 L63 30 Z" fill="#DCDCFF" />
    <path d="M24 27 L28 13 H52 L56 27 Z" fill="#0B0B3B" />
    <rect x="7" y="26" width="66" height="28" rx="8" fill="#FFFFFF" />
    <rect x="10" y="32" width="13" height="6" rx="2" fill="#FF5A5A" />
    <rect x="57" y="32" width="13" height="6" rx="2" fill="#FF5A5A" />
    <rect x="31" y="38" width="18" height="8" rx="1.5" fill="#FFFFFF" stroke="#0B0B3B" strokeWidth="1" />
  </Car>
);
const CarTowardWhite = () => (
  <Car>
    <ellipse cx="40" cy="59" rx="34" ry="4" fill="#0B0B3B" opacity=".45" />
    <rect x="12" y="48" width="12" height="12" rx="3" fill="#0B0B3B" />
    <rect x="56" y="48" width="12" height="12" rx="3" fill="#0B0B3B" />
    <path d="M17 30 L24 11 Q25 8 28 8 H52 Q55 8 56 11 L63 30 Z" fill="#DCDCFF" />
    <path d="M22 28 L27 12 H53 L58 28 Z" fill="#0B0B3B" />
    <rect x="7" y="26" width="66" height="28" rx="8" fill="#FFFFFF" />
    <circle cx="18" cy="36" r="5" fill="#FFF3CF" stroke="#0B0B3B" strokeWidth="1" />
    <circle cx="62" cy="36" r="5" fill="#FFF3CF" stroke="#0B0B3B" strokeWidth="1" />
    <rect x="28" y="34" width="24" height="6" rx="2" fill="#0B0B3B" />
    <rect x="31" y="43" width="18" height="7" rx="1.5" fill="#FFFFFF" stroke="#0B0B3B" strokeWidth="1" />
  </Car>
);
const CarTowardLilac = () => (
  <Car>
    <ellipse cx="40" cy="59" rx="34" ry="4" fill="#0B0B3B" opacity=".45" />
    <rect x="12" y="48" width="12" height="12" rx="3" fill="#0B0B3B" />
    <rect x="56" y="48" width="12" height="12" rx="3" fill="#0B0B3B" />
    <path d="M17 30 L24 11 Q25 8 28 8 H52 Q55 8 56 11 L63 30 Z" fill="#7676FF" />
    <path d="M22 28 L27 12 H53 L58 28 Z" fill="#0B0B3B" />
    <rect x="7" y="26" width="66" height="28" rx="8" fill="#A9A9FF" />
    <circle cx="18" cy="36" r="5" fill="#FFF3CF" stroke="#0B0B3B" strokeWidth="1" />
    <circle cx="62" cy="36" r="5" fill="#FFF3CF" stroke="#0B0B3B" strokeWidth="1" />
    <rect x="28" y="34" width="24" height="6" rx="2" fill="#0B0B3B" />
    <rect x="31" y="43" width="18" height="7" rx="1.5" fill="#FFFFFF" stroke="#0B0B3B" strokeWidth="1" />
  </Car>
);
