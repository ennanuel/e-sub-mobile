/** Drawn map of the area around the estate, with a pulsing pin. Not to scale: tapping it opens Google Maps. */
import styles from './MapIllustration.module.css';

export function MapIllustration() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 342 190"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <rect width="100%" height="100%" fill="#EEF0F4" />
      <rect x="10" y="12" width="70" height="40" rx="6" fill="#E6E8EE" />
      <rect x="95" y="8" width="60" height="30" rx="6" fill="#E6E8EE" />
      <rect x="220" y="14" width="80" height="36" rx="6" fill="#E6E8EE" />
      <rect x="18" y="120" width="60" height="52" rx="6" fill="#E6E8EE" />
      <rect x="250" y="120" width="80" height="58" rx="6" fill="#E6E8EE" />
      <rect x="120" y="140" width="70" height="40" rx="6" fill="#E6E8EE" />
      <path d="M150 70 q30 -12 60 4 q16 10 14 30 q-20 16 -54 8 q-26 -8 -20 -42z" fill="#D6EBD4" />
      <path d="M-10 168 C 60 150, 110 182, 180 160 S 300 150, 360 172" fill="none" stroke="#CFE0F5" strokeWidth="7" />
      <path d="M-5 60 L 350 98" fill="none" stroke="#D9DCE4" strokeWidth="9" strokeLinecap="round" />
      <path d="M-5 60 L 350 98" fill="none" stroke="#FFFFFF" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M70 -5 L 110 200" fill="none" stroke="#D9DCE4" strokeWidth="9" strokeLinecap="round" />
      <path d="M70 -5 L 110 200" fill="none" stroke="#FFFFFF" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M250 -5 L 214 200" fill="none" stroke="#D9DCE4" strokeWidth="9" strokeLinecap="round" />
      <path d="M250 -5 L 214 200" fill="none" stroke="#FFFFFF" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M-5 140 L 130 120 L 350 132" fill="none" stroke="#D9DCE4" strokeWidth="9" strokeLinecap="round" />
      <path d="M-5 140 L 130 120 L 350 132" fill="none" stroke="#FFFFFF" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M-10 30 C 80 40, 140 20, 200 46 S 300 70, 360 52" fill="none" stroke="#E8B94E" strokeWidth="12" strokeLinecap="round" />
      <path d="M-10 30 C 80 40, 140 20, 200 46 S 300 70, 360 52" fill="none" stroke="#FFD678" strokeWidth="9" strokeLinecap="round" />
      <text x="18" y="24" fontFamily="Instrument Sans, sans-serif" fontSize="8.5" fontWeight="600" fill="rgba(11,11,59,.55)">
        Outer Southern Expressway
      </text>
      <text x="262" y="112" fontFamily="Instrument Sans, sans-serif" fontSize="8.5" fontWeight="600" fill="rgba(11,11,59,.55)">
        Apo–Karshi Rd
      </text>
      <circle className={styles.ring} cx="171" cy="92" r="26" fill="#E4100E" />
      <circle className={`${styles.ring} ${styles.ring2}`} cx="171" cy="92" r="26" fill="#E4100E" />
      <circle className={`${styles.ring} ${styles.ring3}`} cx="171" cy="92" r="26" fill="#E4100E" />
      <circle cx="171" cy="92" r="5" fill="#E4100E" opacity=".35" />
      <path d="M171 62a12 12 0 0 0-12 12c0 9 12 22 12 22s12-13 12-22a12 12 0 0 0-12-12z" fill="#E4100E" />
      <circle cx="171" cy="74" r="4.5" fill="#FFFFFF" />
    </svg>
  );
}
