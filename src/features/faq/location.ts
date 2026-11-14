import type { MapLocation } from './MapCard';
import { ProjectDetails } from '@/types';

export const locationOf = (d: ProjectDetails): MapLocation => ({ place: d.name, address: d.address, mapsUrl: generateMapUrl(d) });

const generateMapUrl = (d: ProjectDetails) => {
  if (typeof d.longitude !== 'number' || typeof d.latitude !== 'number') return null;
  const lngLat = encodeURIComponent(`${d.latitude},${d.longitude}`);
  const mapUrl = `https://www.google.com/maps/dir/Current+Location/${lngLat}`;
  return mapUrl;
};
