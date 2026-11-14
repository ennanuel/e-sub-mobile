'use client';

import { useId } from 'react';
import { PlusMinus } from '@/components/icons';
import type { FaqItem } from '@/lib/api/types';
import { FaqAnswer } from './FaqAnswer';
import { Highlight } from './Highlight';
import type { MapLocation } from './MapCard';
import styles from './Faq.module.css';

interface FaqItemRowProps {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
  query?: string;
  location: MapLocation;
}

/** One question. Tap to show or hide the answer. */
export function FaqItemRow({ item, open, onToggle, query, location }: FaqItemRowProps) {
  const answerId = useId();
  return (
    <div className={styles.item}>
      <button type="button" className={styles.question} aria-expanded={open} aria-controls={answerId} onClick={onToggle}>
        <span>
          <Highlight text={item.question} query={query} />
        </span>
        <PlusMinus open={open} />
      </button>
      <div id={answerId} className={styles.answer} hidden={!open}>
        <FaqAnswer blocks={item.answer} query={query} location={location} />
      </div>
    </div>
  );
}
