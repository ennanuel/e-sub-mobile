import { MapIllustration } from '@/components/art/MapIllustration';
import { ExternalLink, MapPin } from '@/components/icons';
import styles from './Faq.module.css';

/** The map card in "Where is …?". The whole card opens Google Maps in a new tab. */
export interface MapLocation {
  place: string;
  address: string;
  mapsUrl: string | null;
}

export function MapCard({ place, address, mapsUrl }: MapLocation) {
  if (mapsUrl) return;
  return (
    <a
      className={styles.map}
      href={mapsUrl!}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${place}, ${address}, in Google Maps`}
    >
      <span className={styles.mapArt}>
        <MapIllustration />
      </span>
      <span className={styles.mapBar}>
        <MapPin />
        <span className={styles.mapText}>
          <b>{place}</b>
          <span>{address}</span>
        </span>
        <span className={styles.mapGo}>
          Open in Maps
          <ExternalLink size={16} strokeWidth={2.2} />
        </span>
      </span>
    </a>
  );
}
