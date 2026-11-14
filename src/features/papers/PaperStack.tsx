'use client';

import { useState } from 'react';
import { ArrowRight, Lock } from '@/components/icons';
import type { PaperId } from '@/lib/api/types';
import styles from './PaperStack.module.css';

interface PaperSummary {
  id: PaperId;
  label: string;
  title: string;
}

/** Card colours per paper (design, not data). */
const LOOK: Record<PaperId, { background: string; label: string }> = {
  rofo: { background: 'var(--red)', label: 'rgba(255,255,255,.75)' },
  survey: { background: '#14143A', label: 'rgba(255,255,255,.6)' },
  cofo: { background: 'var(--blue)', label: 'rgba(255,255,255,.7)' },
};

/** Card positions, back to front, drawn on a 342px-wide stack. */
const SLOTS = {
  preview: {
    height: 380,
    cards: [
      { left: 21, width: 301, top: 41, height: 339 },
      { left: 11, width: 319, top: 113, height: 267 },
      { left: 0, width: 342, top: 192, height: 188 },
    ],
  },
  open: {
    height: 420,
    cards: [
      { left: 21, width: 301, top: 0, height: 420 },
      { left: 11, width: 319, top: 84, height: 336 },
      { left: 0, width: 342, top: 168, height: 252 },
    ],
  },
};

interface PaperStackProps {
  papers: PaperSummary[];
  /** preview: before sign-in, cards only. open: the front card has Open and the viewer's name. */
  variant: 'preview' | 'open';
  /** Shown on the front card, e.g. "CityView estate, Apo, Abuja". */
  estate: string;
  viewerName?: string;
  /** While false, the front card says the papers are loading and does not open. */
  ready?: boolean;
  onOpen?: (id: PaperId) => void;
}

/** Three stacked cards. Tap a card to bring it forward; tap the front card to open it. */
export function PaperStack({ papers, variant, estate, viewerName, ready = true, onOpen }: PaperStackProps) {
  const [order, setOrder] = useState<PaperId[]>(papers.map((p) => p.id));
  const layout = SLOTS[variant];

  const tap = (id: PaperId) => {
    if (order[order.length - 1] === id) {
      if (ready) onOpen?.(id);
      return;
    }
    setOrder([...order.filter((x) => x !== id), id]);
  };

  return (
    <div className={styles.stack} style={{ height: layout.height }}>
      {papers.map((paper) => {
        const i = order.indexOf(paper.id);
        const slot = layout.cards[i];
        const front = i === order.length - 1;
        const look = LOOK[paper.id];
        return (
          <button
            key={paper.id}
            type="button"
            className={styles.card}
            style={{
              background: look.background,
              left: `${(slot.left / 342) * 100}%`,
              width: `${(slot.width / 342) * 100}%`,
              top: slot.top,
              height: slot.height,
              zIndex: i + 1,
            }}
            aria-label={front ? (onOpen ? `Open ${paper.title}` : paper.title) : `Bring ${paper.title} to the front`}
            onClick={() => tap(paper.id)}
          >
            <span className={styles.words}>
              <span className={styles.label} style={{ color: look.label }}>
                {paper.label}
              </span>
              <span className={styles.title}>{paper.title}</span>
              {front && <span className={styles.estate}>{estate}</span>}
            </span>
            {front && variant === 'preview' && (
              <span className={styles.thumb} aria-hidden="true">
                <i style={{ width: '80%' }} />
                <i style={{ width: '64%' }} />
                <i style={{ width: '74%' }} />
                <i style={{ width: '56%' }} />
              </span>
            )}
            {front && variant === 'open' && (
              <>
                <span className={styles.open}>
                  {ready ? 'Open' : 'Loading'}
                  {ready && <ArrowRight size={14} strokeWidth={2.4} />}
                </span>
                <span className={styles.who}>
                  <Lock size={14} strokeWidth={2.2} />
                  Opened for {viewerName}
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
