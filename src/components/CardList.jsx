function CardList({ jobs, onOpen }) {
  const [sortKey, setSortKey] = React.useState('date');
  const [sortDir, setSortDir] = React.useState('desc');

  const formatSalaryRange = (value) => {
    const cleaned = (value || '').trim();
    if (!cleaned) return '';

    const numbers = cleaned.match(/\d+/g);
    if (!numbers || numbers.length === 0) return cleaned;

    if (cleaned.includes('<')) {
      return `<$${numbers[0]}`;
    }

    if (cleaned.includes('+')) {
      return `$${numbers[0]}+`;
    }

    if (numbers.length === 1) {
      return `$${numbers[0]}`;
    }

    return `$${numbers[0]} - $${numbers[1]}`;
  };

  const salaryNumber = (value) => {
    const numbers = (value || '').match(/\d+/g);
    return numbers ? Number(numbers[0]) : -Infinity;
  };

  const sortValue = (job) => {
    if (sortKey === 'company') return (job.company || '').toLowerCase();
    if (sortKey === 'title') return (job.title || '').toLowerCase();
    if (sortKey === 'date') return job.date || '';
    if (sortKey === 'status') return STATUS_MAP[job.status]?.label || job.status || '';
    if (sortKey === 'salary') return salaryNumber(job.salary);
    return '';
  };

  const sortJobs = (items) => {
    return [...items].sort((a, b) => {
      const av = sortValue(a);
      const bv = sortValue(b);

      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }

      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  };

  const today  = todayISO();
  const groups = {};

  for (const j of jobs) {
    const k = j.date || 'undated';
    if (!groups[k]) groups[k] = [];
    groups[k].push(j);
  }

  const keys = Object.keys(groups).sort((a, b) => (
    sortDir === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
  ));

  return (
    <div>
      <div className="view-sort-controls sketch-box">
        <label>
          Sort by
          <select className="sketch-input" value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
            <option value="company">Company</option>
            <option value="title">Job title</option>
            <option value="date">Date Applied</option>
            <option value="status">Status</option>
            <option value="salary">Salary</option>
          </select>
        </label>

        <label>
          Order
          <select className="sketch-input" value={sortDir} onChange={(event) => setSortDir(event.target.value)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
      </div>
      {keys.length === 0 && <div className="empty">no applications</div>}
      {keys.map(k => (
        <div key={k} className="date-group">
          <h3>
            {k === 'undated' ? 'no date' : prettyDate(k)}
            <span style={{ fontSize: 13, color: 'var(--ink-soft)', marginLeft: 8, fontWeight: 400 }}>
              ({groups[k].length})
            </span>
          </h3>
          <div className="card-list">
            {sortJobs(groups[k]).map(j => {
              const stale = j.status === 'waiting' && daysBetween(j.date, today) >= STALE_DAYS;
              return (
                <div key={j.id} className="job-card sketch-box" onClick={() => onOpen(j)} style={{ padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <div>
                      <div className="co" style={{ fontSize: 15 }}>
                        {stale && <span className="stale-dot"></span>}
                        {j.favorite && <span className="favorite-heart">💖</span>}
                        {j.company}
                      </div>
                      <div className="ti">{j.title}</div>
                    </div>
                    <span className={`pill ${STATUS_MAP[j.status]?.cls || ''}`}>
                      {STATUS_MAP[j.status]?.label || j.status}
                    </span>
                  </div>
                  <hr className="sketch-line" style={{ margin: '10px 0' }} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12, color: 'var(--ink-soft)' }}>
                    {j.salary && <span>💰 {formatSalaryRange(j.salary)}</span>}
                    {j.contact && <span>👤 {j.contact.split(',')[0]}</span>}
                    {j.notes   && (
                      <span style={{ fontStyle: 'italic' }}>
                        "{j.notes.slice(0, 40)}{j.notes.length > 40 ? '…' : ''}"
                      </span>
                    )}
                  </div>

                  {j.link && (
                    <div className="listing-action">
                      <a
                        className="candy-btn link-pink"
                        href={j.link}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                      >
                        View listing
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
