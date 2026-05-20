function Pipeline({ jobs, onOpen, upsert }) {
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

  const today   = todayISO();
  const grouped = {};

  for (const s of STATUSES) grouped[s.id] = [];
  for (const j of jobs) if (grouped[j.status]) grouped[j.status].push(j);
  for (const s of STATUSES) grouped[s.id] = sortJobs(grouped[s.id]);

  const handleDragStart = (event, jobId) => {
    event.dataTransfer.setData('text/plain', jobId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (event, status) => {
    event.preventDefault();
    event.stopPropagation();

    const jobId = event.dataTransfer.getData('text/plain');
    const job = jobs.find(item => item.id === jobId);

    if (!job || job.status === status || !upsert) return;

    upsert({ ...job, status });
  };

  const allowDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
  };

  return (
    <>
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

      <div className="pipeline">
        {STATUSES.map(s => (
          <div
            key={s.id}
            className="col sketch-box drop-col"
            onDragOver={allowDrop}
            onDrop={(event) => handleDrop(event, s.id)}
          >
            <div className="col-head">
              <h3>{s.label}</h3>
              <span className={`pill ${s.cls}`}>{grouped[s.id].length}</span>
            </div>
            <div
              className="col-list drop-list"
              onDragOver={allowDrop}
              onDrop={(event) => handleDrop(event, s.id)}
            >
              {grouped[s.id].length === 0 && <div className="empty">empty</div>}
              {grouped[s.id].map(j => {
                const old   = daysBetween(j.date, today);
                const stale = s.id === 'waiting' && old >= STALE_DAYS;
                return (
                  <div
                    key={j.id}
                    className="job-card draggable-card"
                    draggable
                    onDragStart={(event) => handleDragStart(event, j.id)}
                    onClick={() => onOpen(j)}
                  >
                    <div className="co">
                      {stale && <span className="stale-dot" title={`${old}d old`}></span>}
                      {j.favorite && <span className="favorite-heart">💖</span>}
                      {j.company}
                    </div>
                    <div className="ti">{j.title}</div>
                    <div className="meta">
                      <span>{prettyDate(j.date)}</span>
                      {j.salary && <span>· {formatSalaryRange(j.salary)}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
