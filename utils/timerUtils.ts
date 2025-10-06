export interface TimeSegments {
  hours: number;
  minutes: number;
  seconds: number;
}

export function millisecondsToSegments(ms: number | undefined): TimeSegments {
  if (ms === undefined) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

export function segmentsToMilliseconds(segments: TimeSegments): number {
  return (
    (segments.hours * 3600 + segments.minutes * 60 + segments.seconds) * 1000
  );
}
