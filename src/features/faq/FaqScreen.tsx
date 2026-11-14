'use client';

import { useMemo, useState } from 'react';
import { Search } from '@/components/icons';
import { Screen } from '@/components/ui/Screen';
import text from '@/components/ui/text.module.css';
import type { Faq, FaqCategory } from '@/lib/api/types';
import { routes } from '@/lib/routes';
import { answerText } from './FaqAnswer';
import { FaqItemRow } from './FaqItemRow';
import { matches } from './Highlight';
import { locationOf } from './location';
import styles from './Faq.module.css';
import { ProjectDetails } from '@/types';

const CATEGORIES: ('All' | FaqCategory)[] = ['All', 'Prices', 'Papers', 'Building', 'The estate'];

interface FaqScreenProps {
  project: ProjectDetails;
  faq: Faq;
}

/** All the questions, with search (matches in yellow) and topics. */
export function FaqScreen({ project, faq }: FaqScreenProps) {
  const location = locationOf(project);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [opened, setOpened] = useState<Set<string>>(new Set());
  // Answers the search opened that the person then closed.
  const [closed, setClosed] = useState<Set<string>>(new Set());

  const q = query.trim();
  const rows = useMemo(
    () =>
      faq.items
        .filter((item) => category === 'All' || item.category === category)
        .map((item) => {
          const inQuestion = !!q && matches(item.question, q);
          const inAnswer = !!q && matches(answerText(item.answer), q);
          return { item, visible: !q || inQuestion || inAnswer, autoOpen: inAnswer };
        })
        .filter((r) => r.visible),
    [faq.items, category, q],
  );

  const isOpen = (id: string, autoOpen: boolean) => opened.has(id) || (autoOpen && !closed.has(id));

  const toggle = (id: string, autoOpen: boolean) => {
    const open = isOpen(id, autoOpen);
    setOpened((s) => {
      const n = new Set(s);
      if (open) n.delete(id);
      else n.add(id);
      return n;
    });
    if (open && autoOpen) setClosed((s) => new Set(s).add(id));
  };

  return (
    <Screen label="Questions people ask" back={routes.listing(project?.id?.toString())}>
      <div className={text.kicker}>{project.name} · FAQ</div>
      <h1 className={text.heading}>Questions people ask</h1>

      <label className={styles.search}>
        <Search size={18} />
        <input
          type="search"
          placeholder={`Search ${faq.items.length} questions`}
          aria-label="Search the questions"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setClosed(new Set());
          }}
        />
      </label>

      <div className={styles.chips} role="group" aria-label="Topics">
        {CATEGORIES.map((c) => (
          <button key={c} type="button" className={styles.chip} aria-pressed={category === c} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div>
        {rows.map(({ item, autoOpen }) => (
          <FaqItemRow
            key={item.id}
            item={item}
            query={q}
            open={isOpen(item.id, autoOpen)}
            onToggle={() => toggle(item.id, autoOpen)}
            location={location}
          />
        ))}
      </div>
      {rows.length === 0 && <p className={styles.none}>No question matches that. Try another word.</p>}
    </Screen>
  );
}
