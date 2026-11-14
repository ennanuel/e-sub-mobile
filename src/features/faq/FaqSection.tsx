'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Faq } from '@/lib/api/types';
import { routes } from '@/lib/routes';
import { FaqItemRow } from './FaqItemRow';
import { locationOf } from './location';
import styles from './Faq.module.css';
import { ProjectDetails } from '@/types';

/** "Questions people ask" at the end of the listing: the featured questions, all closed, and a link to the rest. */
export function FaqSection({ listing, faq }: { listing: ProjectDetails; faq: Faq }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const featured = faq.items.slice(0, faq.featuredCount);
  const location = locationOf(listing);

  return (
    <section className={styles.section} aria-labelledby="faq-heading">
      <h2 id="faq-heading" className={`label ${styles.sectionTitle}`}>
        Questions people ask
      </h2>
      <div>
        {featured.map((item) => (
          <FaqItemRow
            key={item.id}
            item={item}
            open={open.has(item.id)}
            onToggle={() =>
              setOpen((s) => {
                const n = new Set(s);
                if (n.has(item.id)) n.delete(item.id);
                else n.add(item.id);
                return n;
              })
            }
            location={location}
          />
        ))}
      </div>
      <Link className={styles.seeAll} href={routes.faq(listing?.id?.toString())}>
        See all {faq.items.length} questions
      </Link>
    </section>
  );
}
