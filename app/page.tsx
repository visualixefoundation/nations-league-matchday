import {
  hasLiveMatch,
  leaguePhaseStatus,
  loadFixtureWindow
} from "@/lib/fixtures";
import { dayKeyEAT, formatDayLabelEAT } from "@/lib/time";
import RefreshButton from "./components/RefreshButton";
import KickoffCountdown from "./components/KickoffCountdown";
import MatchRow from "./components/MatchRow";
import LiveAutoRefresh from "./components/LiveAutoRefresh";
import type { Match } from "@/lib/highlightly";

export const revalidate = 90;

export default async function HomePage() {
  let matches: Match[] = [];
  let errorMessage: string | null = null;

  try {
    matches = await loadFixtureWindow();
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Failed to load fixtures.";
  }

  const byDay = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const key = dayKeyEAT(m.date);
    acc[key] = acc[key] ?? [];
    acc[key].push(m);
    return acc;
  }, {});

  const dayKeys = Object.keys(byDay).sort();

  const nextMatch = matches
    .filter((m) => m.state.description.toLowerCase() === "not started")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const live = hasLiveMatch(matches);
  const phase = leaguePhaseStatus();

  const quotaHit =
    errorMessage?.includes("429") ||
    errorMessage?.toLowerCase().includes("daily request");

  return (
    <div className="page wrap">
      <LiveAutoRefresh active={live} />

      <div className="page__heading">
        <div>
          <h1>Fixtures & live scores</h1>
          {phase && <p className="page__phase">{phase}</p>}
        </div>
        <RefreshButton />
      </div>

      {nextMatch && (
        <KickoffCountdown
          targetIso={nextMatch.date}
          label={`${nextMatch.homeTeam.name} vs ${nextMatch.awayTeam.name}`}
        />
      )}

      {errorMessage && (
        <div className="empty-state">
          <strong>
            {quotaHit ? "API daily limit reached" : "Couldn't load fixtures"}
          </strong>
          {quotaHit
            ? "Highlightly free tier is exhausted for today. Data returns after the daily reset (around 03:00 EAT)."
            : errorMessage}
        </div>
      )}

      {!errorMessage && matches.length === 0 && (
        <div className="empty-state">
          <strong>No Nations League matches in this window</strong>
          Check back around matchdays, or open Results after full-time.
        </div>
      )}

      {dayKeys.map((day) => {
        const dayMatches = [...byDay[day]].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        return (
          <section className="matchday" key={day}>
            <div className="matchday__label">{formatDayLabelEAT(day)}</div>
            {dayMatches.map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
          </section>
        );
      })}
    </div>
  );
}
