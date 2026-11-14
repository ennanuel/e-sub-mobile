/**
 * The home and listing sky follows the time in Abuja (UTC+1):
 * sunrise look 6 to 7am, sun up 7am to 6pm, sunset look from 6pm to 6am.
 */
export type SkyPhase = 'rise' | 'up' | 'set';

export function skyPhase(now = new Date()): SkyPhase {
  const abuja = new Date(now.getTime() + 60 * 60 * 1000);
  const minutes = abuja.getUTCHours() * 60 + abuja.getUTCMinutes();
  if (minutes >= 360 && minutes < 420) return 'rise';
  if (minutes >= 420 && minutes < 1080) return 'up';
  return 'set';
}

export interface SkyLook {
  background: string;
  hills: string;
  sun: string;
  /** The sun sits low on the hills at sunrise and sunset. */
  sunLow: boolean;
}

export function skyLook(phase: SkyPhase): SkyLook {
  if (phase === 'set') {
    return { background: 'linear-gradient(180deg, #FFF1C9 0%, #FFD678 46%)', hills: '#E8A800', sun: '#FFFFFF', sunLow: true };
  }
  return { background: '#FFFFFF', hills: '#DCDCFF', sun: '#FFD678', sunLow: phase === 'rise' };
}
