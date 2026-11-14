'use client';

import { useEffect, useRef } from 'react';
import styles from './PhotoViewer.module.css';
import { Photo } from '@/types';

interface PhotoViewerProps {
  photos: Photo[];
  listingName: string;
  listingLocation: string;
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}

/** Full-screen photos. Tap the sides or swipe to move, Escape or Close to leave. */
export function PhotoViewer({ photos, listingName, listingLocation, index, onIndex, onClose }: PhotoViewerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const startX = useRef<number | null>(null);
  const photo = photos[index];
  const go = (step: number) => onIndex((index + step + photos.length) % photos.length);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((index + 1) % photos.length);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + photos.length) % photos.length);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, photos.length, onClose, onIndex]);

  return (
    <div
      className={styles.viewer}
      role="dialog"
      aria-modal="true"
      aria-label="Photos"
      onPointerDown={(e) => (startX.current = e.clientX)}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const d = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(d) > 40) go(d < 0 ? 1 : -1);
      }}
    >
      <div className={styles.top}>
        <span className={styles.count}>
          {index + 1} of {photos.length}
        </span>
        <button ref={closeRef} type="button" className={styles.close} onClick={onClose}>
          Close
        </button>
      </div>
      <button type="button" className={`${styles.side} ${styles.prev}`} aria-label="Previous photo" onClick={() => go(-1)} />
      <button type="button" className={`${styles.side} ${styles.next}`} aria-label="Next photo" onClick={() => go(1)} />
      <div className={styles.image}>
        <img src={photo.photo} alt={'Listing image'} />
      </div>
      <div className={styles.caption}>
        <b>{listingName}</b>
        <span>{listingLocation}</span>
      </div>
    </div>
  );
}
