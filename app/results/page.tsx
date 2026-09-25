import {
  finishedMatches,
  hasLiveMatch,
  leaguePhaseStatus,
  loadFixtureWindow
} from "@/lib/fixtures";
import { dayKeyEAT, formatDayLabelEAT } from "@/lib/time";
import MatchRow from "@/app/components/MatchRow";
import LiveAutoRefresh from "@/app/components/LiveAutoRefresh";

export const revalidate = 90;

export default async function ResultsPage() {
  let finished: ReturnType<typeof finishedMatches> = [];
  let live = false;
  let errorMessage: string | null = null;

  try {
    // Same loader as Home — reuses cached per-day API responses
    const window = await loadFixtureWindow();
    finished = finishedMatches(window);
    live = hasLiveMatch(window);
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Failed to load results.";
  }

  const byDay = finished.reduce<Record<string, typeof finished>>((acc, m) => {
    const key = dayKeyEAT(m.date);
    acc[key] = acc[key] ?? [];
    acc[key].push(m);
    return acc;
  }, {});
  const dayKeys = Object.keys(byDay).sort().reverse();
  const phase = leaguePhaseStatus();

  return (
    <div className="page wrap">
      <LiveAutoRefresh active={live} />

      <div className="page__heading">
        <div>
          <h1>Results</h1>
          {phase && <p className="page__phase">{phase}</p>}
        </div>
      </div>

      <p className="page__intro">Full-time scores from recent matchdays.</p>

      {errorMessage && (
        <div className="empty-state">
          <strong>Couldn&apos;t load data</strong>
          {errorMessage}
        </div>
      )}

      {dayKeys.length > 0 ? (
        <section className="matchday">
          <div className="matchday__label">Full-time results</div>
          {dayKeys.map((day) => (
            <div key={day} style={{ marginBottom: 20 }}>
              <div className="matchday__sublabel">{formatDayLabelEAT(day)}</div>
              {byDay[day].map((match) => (
                <MatchRow key={match.id} match={match} />
              ))}
            </div>
          ))}
        </section>
      ) : (
        !errorMessage && (
          <div className="empty-state">No finished matches in the recent window.</div>
        )
      )}
    </div>
  );
}
