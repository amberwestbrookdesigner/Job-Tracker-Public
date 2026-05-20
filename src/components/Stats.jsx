function Stats({ stats }) {
  return (
    <div className="stats">
      <div className="stat sketch-box">
        <div className="k">{stats.total}</div>
        <div className="l">total applications</div>
      </div>
      <div className="stat sketch-box">
        <div className="k">{stats.respRate}%</div>
        <div className="l">response rate</div>
        <div className="delta">{stats.responded} of {stats.total} heard back</div>
      </div>
      <div className="stat sketch-box">
        <div className="k">{stats.avgPerWeek}</div>
        <div className="l">avg / week (last 4)</div>
      </div>
      <div className="stat sketch-box">
        <div className="k">
          {stats.ttrDays != null ? stats.ttrDays : '—'}
          <span style={{fontSize:'16px', marginLeft:3, color:'var(--ink-soft)'}}>d</span>
        </div>
        <div className="l">avg time to response</div>
      </div>
    </div>
  );
}
