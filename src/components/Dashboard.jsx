function WeekBars({ weeks }) {
  const ordered = [...weeks].reverse(); // oldest → newest
  const labels  = ['3w ago', '2w ago', 'last wk', 'this wk'];
  const max     = Math.max(1, ...ordered);
  return (
    <div className="barchart-wrap">
      <div className="barchart">
        {ordered.map((v, i) => (
          <div
            key={i}
            className={`bar ${i === ordered.length - 1 ? 'active' : ''}`}
            style={{ height: `${(v / max) * 100}%` }}
          >
            <span className="lbl">{labels[i]} · {v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Donut({ jobs }) {
  const counts = {};
  for (const s of STATUSES) counts[s.id] = 0;
  for (const j of jobs) if (counts[j.status] != null) counts[j.status]++;

  const total = jobs.length || 1;
  let offset  = 0;
  const C     = 2 * Math.PI * 36;
  const colors = {
    waiting:   'var(--waiting)',
    yes:       'var(--yes)',
    no:        'var(--no)',
    interview: 'var(--interview)',
  };

  return (
    <div className="donut">
      <svg viewBox="0 0 100 100" className="donut-svg">
        <circle cx="50" cy="50" r="36" fill="none" stroke="var(--paper-2)" strokeWidth="14" />
        {STATUSES.map(s => {
          const frac = counts[s.id] / total;
          if (!frac) return null;
          const len  = frac * C;
          const dash = `${len} ${C - len}`;
          const el   = (
            <circle
              key={s.id}
              cx="50" cy="50" r="36"
              fill="none"
              stroke={colors[s.id]}
              strokeWidth="14"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform="rotate(-90 50 50)"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="donut-legend">
        {STATUSES.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="dot" style={{ background: colors[s.id] }}></span>
            {s.label}: <b>{counts[s.id]}</b>
            <span style={{ color: 'var(--ink-soft)', marginLeft: 2 }}>
              ({total ? Math.round(counts[s.id] / total * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ jobs, stats, reminders, onOpen }) {
  const recent = [...jobs]
    .filter(j => j.date)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <div className="dash-grid">
      {/* Left column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="panel sketch-box">
          <h3>applications, last 4 weeks</h3>
          <WeekBars weeks={stats.weeks} />
        </div>

        <div className="panel sketch-box">
          <h3>recent activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recent.length === 0 && <div className="empty">no applications yet</div>}
            {recent.map(j => (
              <div key={j.id} className="job-card" onClick={() => onOpen(j)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                  <div>
                    <div className="co">{j.company}</div>
                    <div className="ti">{j.title}</div>
                  </div>
                  <span className={`pill ${STATUS_MAP[j.status]?.cls || ''}`}>
                    {STATUS_MAP[j.status]?.label || j.status}
                  </span>
                </div>
                <div className="meta">
                  <span>📅 {prettyDate(j.date)}</span>
                  {j.salary  && <span>💰 {j.salary}k</span>}
                  {j.contact && <span>👤 {j.contact.split(',')[0]}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="panel sketch-box">
          <h3>status breakdown</h3>
          <Donut jobs={jobs} />
        </div>

        <div className="panel sketch-box">
          <h3>⏰ stale — needs a nudge</h3>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '-8px 0 10px' }}>
            waiting with no response in {STALE_DAYS}+ days
          </p>
          <div className="reminder-list">
            {reminders.stale.length === 0 && <div className="empty">all caught up ✨</div>}
            {reminders.stale.slice(0, 8).map(j => (
              <div key={j.id} className="reminder-item" onClick={() => onOpen(j)} style={{ cursor: 'pointer' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{j.company}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{j.title}</div>
                  <div className="why">
                    {j.daysOld}d old{j.contact ? ` · follow up ${j.contact.split(',')[0]}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
