import {
  finishedMatches,
  hasLiveMatch,
  leaguePhaseStatus,
  loadAllMatches
} from "@/lib/fixtures";
import { dayKeyEAT, formatDayLabelEAT } from "@/lib/time";
import MatchRow from "@/app/components/MatchRow";
import LiveAutoRefresh from "@/app/components/LiveAutoRefresh";

export const revalidate = 300;

export default async function ResultsPage() {
  let finished: ReturnType<typeof finishedMatches> = [];
  let live = false;
  let errorMessage: string | null = null;

  try {
    const all = await loadAllMatches();
    finished = finishedMatches(all);
    live = hasLiveMatch(all);
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

      <p className="page__intro">Full-time scores from this Nations League season.</p>

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
          <div className="empty-state">No finished matches yet this season.</div>
        )
      )}
    </div>
  );
}
