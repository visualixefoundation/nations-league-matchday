import {
  getMatchesWindow,
  isFinished,
  todayEAT,
  type Match
} from "@/lib/highlightly";
import { dayKeyEAT, formatDayLabelEAT } from "@/lib/time";
import MatchRow from "@/app/components/MatchRow";

export const revalidate = 90;

export default async function ResultsPage() {
  const today = todayEAT();
  let finished: Match[] = [];
  let errorMessage: string | null = null;

  try {
    // Include today + a few past days so FT scores show the same evening
    const window = await getMatchesWindow(today, 1, 5);
    finished = window
      .filter((m) => isFinished(m.state.description))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Failed to load results.";
  }

  const byDay = finished.reduce<Record<string, Match[]>>((acc, m) => {
    const key = dayKeyEAT(m.date);
    acc[key] = acc[key] ?? [];
    acc[key].push(m);
    return acc;
  }, {});
  const dayKeys = Object.keys(byDay).sort().reverse();

  return (
    <div className="page wrap">
      <div className="page__heading">
        <h1>Results</h1>
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
