import Link from 'next/link';
import styles from './status.module.css';

export default function NotFound() {
  return (
    <main className={styles.page}>
      <p className="label">Not found</p>
      <h1 className={styles.title}>This page isn’t here.</h1>
      <Link className={styles.link} href="/">
        Go to CityView
      </Link>
    </main>
  );
}
