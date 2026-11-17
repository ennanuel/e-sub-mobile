'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ChevronLeft } from '@/components/icons';
import { IconButton } from './IconButton';
import styles from './Screen.module.css';
import { Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

interface ScreenProps {
  /** Where back goes. A function is called instead of navigating (e.g. previous tab). */
  back?: string | (() => ({isRerouting: boolean} | void));
  backLabel?: string;
  /** Shown in the middle of the top bar. */
  title?: ReactNode;
  /** Shown on the right of the top bar. */
  actions?: ReactNode;
  /** Sticky at the bottom (main button). */
  footer?: ReactNode;
  /** Slide in from the right (default), fade in, or no entrance. */
  entrance?: 'slide' | 'fade' | 'none';
  /** Tighter top bar (plot page). */
  compactBar?: boolean;
  disabled?: boolean;
  label: string;
  children: ReactNode;
}

/** The standard page: top bar with back, scrolling body, sticky footer. */
export function Screen({ back, disabled, backLabel = 'Back', title, actions, footer, entrance = 'slide', compactBar, label, children }: ScreenProps) {
  const router = useRouter();
  const [isRerouting, setIsRerouting] = useState(false);

  const onBack = () => {
    if (typeof back === 'function') {
      const verdict = back()
      if (verdict) setIsRerouting(verdict.isRerouting)
    }
    else if (back) {
      setIsRerouting(true);
      router.push(back);
    }
  };

  useEffect(() => {
    return () => {
      setIsRerouting(false);
    }
  }, [])

  return (
    <main 
      className={`${styles.screen} ${styles[entrance]}`}
      aria-label={label}
      style={{pointerEvents: disabled || isRerouting ? 'none' : undefined}
    }>
      <div className={`${styles.bar} ${compactBar ? styles.compact : ''}`}>
        {back ? (
          <IconButton label={backLabel} onClick={onBack}>
            <ChevronLeft size={19} />
          </IconButton>
        ) : (
          <span className={styles.spacer} />
        )}
        <span className={styles.title}>{title}</span>
        {actions ?? <span className={styles.spacer} />}
        <NavProgress isShowing={isRerouting} />
      </div>
      <div className={styles.body} style={{position: 'relative', paddingTop: '16px'}}>
        {(disabled || isRerouting) && <Box width="100%" height="100%" position="absolute" top="0" left="0" bg='rgba(255, 255, 255, 0.3)' zIndex={9999} />}
        {children
        }</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </main>
  );
}

// const PROGRESS_COLOR = activeLinkColors.color;
const PROGRESS_COLOR = "var(--blue)";
const HEIGHT = "3px";

const LOOP_DURATION_MS = 1200;
const FADE_OUT_MS = 150;

const slideLoop = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
`;



export function NavProgress({isShowing}: {isShowing: boolean}) {

  return (
    <Box
      position="absolute"
      className="custom-nav-progress-bar"
      top="100%"
      width="100%"
      height={HEIGHT}
      overflow="hidden"
      display="block"
      zIndex={2}
      opacity={isShowing ? 1 : 0}
      pointerEvents="none"
      transition={`opacity ${FADE_OUT_MS}ms ease-out`}
      _after={{
        content: "''",
        position: "relative",
        display: "block",
        width: "25%",
        height: HEIGHT,
        bg: PROGRESS_COLOR,
        animation: `${slideLoop} ${LOOP_DURATION_MS}ms ease-in-out infinite`,
      }}
    />
  )
}