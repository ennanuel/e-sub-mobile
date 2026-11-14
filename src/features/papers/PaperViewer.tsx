'use client';

import { ChevronDown } from '@/components/icons';
import type { Paper } from '@/lib/api/types';
import styles from './PaperViewer.module.css';

/** One paper: every plot's scan, one under the other, each with a watermark that leads with the viewer's name. */
export function PaperViewer({ paper, viewer, stamp }: { paper: Paper; viewer: string; stamp: string }) {
  return (
    <div className={styles.docs} onContextMenu={(e) => e.preventDefault()}>
      {paper.pages.map((page, k) => {
        const next = paper.pages[k + 1];
        return (
          <div key={page.plotNumber}>
            <div className={styles.plot}>
              <b>Plot {page.plotNumber}</b>
              <span>
                {page.area.toUpperCase()} · {k + 1} OF {paper.pages.length}
              </span>
            </div>
            <div className={styles.doc}>
              <img src={page.imageUrl} alt={`${paper.title}, plot ${page.plotNumber}`} draggable={false} />
              <Watermark viewer={viewer} stamp={stamp} />
            </div>
            {next && (
              <div className={styles.nextPlot} aria-hidden="true">
                <span>
                  Scroll for plot {next.plotNumber}
                  <ChevronDown size={15} strokeWidth={2.4} />
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Diagonal rows of "NAME · VIEW ONLY · date", the name bolder so it is always readable. */
function Watermark({ viewer, stamp }: { viewer: string; stamp: string }) {
  const rows = Array.from({ length: 40 }, (_, i) => i);
  const repeats = Array.from({ length: 6 }, (_, i) => i);
  return (
    <div className={styles.watermark} aria-hidden="true">
      <div>
        {rows.map((r) => (
          <div key={r} style={{ marginLeft: ((3 - (r % 3)) % 3) * 60 }}>
            {repeats.map((n) => (
              <span key={n}>
                {n > 0 && '  ·  '}
                <b>{viewer.toUpperCase()}</b> · VIEW ONLY · {stamp}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
