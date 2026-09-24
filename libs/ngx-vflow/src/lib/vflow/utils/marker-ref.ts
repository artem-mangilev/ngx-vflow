import { MARKER_DEFAULT_TYPE, Marker, MarkerRef } from '../interfaces/marker.interface';
import { hashCode } from './hash';

/** The marker a reference stands for, in canonical form: `type` set, fields in a fixed order, none undefined. */
export function normalizeMarker(ref: MarkerRef): Marker {
  const source = typeof ref === 'string' ? { type: ref } : ref;
  const marker: Marker = { type: source.type ?? MARKER_DEFAULT_TYPE };

  if (source.width !== undefined) marker.width = source.width;
  if (source.height !== undefined) marker.height = source.height;
  if (source.orient !== undefined) marker.orient = source.orient;
  if (source.strokeWidth !== undefined) marker.strokeWidth = source.strokeWidth;

  return marker;
}

/** Id of the `<marker>` element the flow renders for a marker; equal markers share one element. */
export function markerId(ref: MarkerRef): number {
  return hashCode(JSON.stringify(normalizeMarker(ref)));
}

/** Value of `marker-start` / `marker-end` for a marker. */
export function markerUrl(ref: MarkerRef | undefined): string {
  return ref ? `url(#${markerId(ref)})` : '';
}
