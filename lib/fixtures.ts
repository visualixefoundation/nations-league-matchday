import { cache } from "react";
import {
  getMatchesWindow,
  isFinished,
  isLive,
  todayEAT,
  type Match
} from "@/lib/highlightly";

/** Same window for Home + Results so per-day API responses share the Data Cache. */
export const FIXTURE_FORWARD_DAYS = 6;
export const FIXTURE_PAST_DAYS = 2;

/**
 * One shared loader for the fixture window. React cache() dedupes within a
 * request; Next fetch cache dedupes across Home/Results for the same dates.
 */
export const loadFixtureWindow = cache(async (): Promise<Match[]> => {
  const today = todayEAT();
  return getMatchesWindow(today, FIXTURE_FORWARD_DAYS, FIXTURE_PAST_DAYS);
});

export function finishedMatches(matches: Match[]): Match[] {
  return matches
    .filter((m) => isFinished(m.state.description))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function hasLiveMatch(matches: Match[]): boolean {
  return matches.some((m) => isLive(m.state.description));
}

/** 2026/27 league-phase windows (EAT calendar dates, inclusive). */
const PHASES: { id: string; label: string; start: string; end: string }[] = [
  { id: "MD1", label: "Matchday 1", start: "2026-09-24", end: "2026-09-26" },
  { id: "MD2", label: "Matchday 2", start: "2026-09-27", end: "2026-09-29" },
  { id: "MD3", label: "Matchday 3", start: "2026-10-01", end: "2026-10-03" },
  { id: "MD4", label: "Matchday 4", start: "2026-10-04", end: "2026-10-06" },
  { id: "MD5", label: "Matchday 5", start: "2026-11-12", end: "2026-11-14" },
  { id: "MD6", label: "Matchday 6", start: "2026-11-15", end: "2026-11-17" }
];

function formatShort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return dt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC"
  });
}

/** Short status under the page heading, e.g. "MD1 in progress · MD2 starts 27 Sep". */
export function leaguePhaseStatus(today = todayEAT()): string | null {
  const current = PHASES.find((p) => today >= p.start && today <= p.end);
  const next = PHASES.find((p) => today < p.start);
  const prev = [...PHASES].reverse().find((p) => today > p.end);

  if (current && next) {
    return `${current.id} in progress · ${next.id} starts ${formatShort(next.start)}`;
  }
  if (current) {
    return `${current.id} in progress · ends ${formatShort(current.end)}`;
  }
  if (prev && next) {
    return `${prev.id} complete · ${next.id} starts ${formatShort(next.start)}`;
  }
  if (next) {
    return `Next up: ${next.label} · ${formatShort(next.start)}`;
  }
  if (prev) {
    return `League phase complete (${prev.id})`;
  }
  return null;
}
