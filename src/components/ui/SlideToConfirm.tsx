'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ArrowRight, Check, ChevronRight } from '@/components/icons';
import styles from './SlideToConfirm.module.css';

interface SlideToConfirmProps {
  label: string;
  onConfirm: () => void;
  /** Locked: the knob does not move, and `progress` fills the track (e.g. how much has been read). */
  locked?: boolean;
  progress?: number;
  onLockedAttempt?: () => void;
  /** Done: green, with a tick, and no longer moves. */
  done?: boolean;
}

const KNOB = 61; // knob width plus its inset, in px

/** Drag the knob to the end to confirm. Keyboard: Enter, Space or Right arrow. */
export function SlideToConfirm({ label, onConfirm, locked = false, progress = 0, onLockedAttempt, done = false }: SlideToConfirmProps) {
  const track = useRef<HTMLDivElement>(null);
  const start = useRef<number | null>(null);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const max = () => (track.current ? track.current.clientWidth - KNOB : 0);

  const finish = () => {
    setX(max());
    onConfirm();
  };

  const onPointerDown = (e: PointerEvent<HTMLSpanElement>) => {
    if (done) return;
    if (locked) {
      onLockedAttempt?.();
      return;
    }
    start.current = e.clientX - x;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (start.current === null) return;
    setX(Math.max(0, Math.min(max(), e.clientX - start.current)));
  };

  const onPointerUp = () => {
    if (start.current === null) return;
    start.current = null;
    setDragging(false);
    if (x > max() * 0.82) finish();
    else setX(0);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (done || !['Enter', ' ', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    if (locked) onLockedAttempt?.();
    else finish();
  };

  const position = done ? max() : x;
  const fraction = max() ? position / max() : 0;
  const textOpacity = done ? 1 : Math.max(0, 1 - fraction * 1.4);

  return (
    <div
      ref={track}
      className={`${styles.track} ${locked ? styles.locked : ''} ${done ? styles.done : ''} ${dragging ? styles.dragging : ''}`}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(fraction * 100)}
      aria-disabled={locked || undefined}
      onKeyDown={onKeyDown}
    >
      {locked && <span className={styles.read} style={{ width: `${Math.round(progress * 100)}%` }} />}
      <span className={styles.fill} style={{ width: position + 60 }} />
      <span className={styles.text} style={{ opacity: textOpacity }}>
        {label}
      </span>
      {!locked && !done && (
        <span className={styles.chevrons} style={{ opacity: textOpacity }} aria-hidden="true">
          <ChevronRight size={16} strokeWidth={2.6} />
          <ChevronRight size={16} strokeWidth={2.6} />
        </span>
      )}
      <span
        className={styles.knob}
        style={{ transform: `translateX(${position}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {done ? <Check size={22} strokeWidth={2.6} /> : <ArrowRight size={20} strokeWidth={2.3} />}
      </span>
    </div>
  );
}
