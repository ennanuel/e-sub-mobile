import type { FaqBlock } from '@/lib/api/types';
import { MapCard, type MapLocation } from './MapCard';
import { Highlight } from './Highlight';
import styles from './Faq.module.css';

/** Renders one structured answer. `query` highlights matching text in yellow. */
export function FaqAnswer({ blocks, query, location }: { blocks: FaqBlock[]; query?: string; location: MapLocation }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={i}>
                <Highlight text={block.text} query={query} />
              </p>
            );
          case 'note':
            return (
              <p key={i} className={styles.note}>
                <Highlight text={block.text} query={query} />
              </p>
            );
          case 'list':
            return (
              <ul key={i}>
                {block.items.map((item) => (
                  <li key={item}>
                    <Highlight text={item} query={query} />
                  </li>
                ))}
              </ul>
            );
          case 'table':
            return (
              <div key={i} className={styles.tableWrap}>
                <table className={styles.table}>
                  {block.head && (
                    <thead>
                      <tr>
                        {block.head.map((h) => (
                          <th key={h} scope="col">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {block.rows.map((row) => (
                      <tr key={row.join('|')}>
                        {row.map((cell, c) => (
                          <td key={c}>
                            <Highlight text={cell} query={query} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'map':
            return <MapCard key={i} {...location} />;
        }
      })}
    </>
  );
}

/** Plain text of an answer, for search. */
export function answerText(blocks: FaqBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'paragraph':
        case 'note':
          return b.text;
        case 'list':
          return b.items.join(' ');
        case 'table':
          return [...(b.head ?? []), ...b.rows.flat()].join(' ');
        case 'map':
          return '';
      }
    })
    .join(' ');
}
