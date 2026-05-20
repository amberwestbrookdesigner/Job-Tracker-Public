function TableView({ jobs, onOpen, upsert }) {
  const { useState, useMemo } = React;
  const [sort,   setSort]   = useState({ key: 'date', dir: 'desc' });
  const [inline, setInline] = useState({
    company: '', title: '', date: todayISO(),
    status: 'waiting', salary: '', customSalary: '', notes: '', contact: '', link: '', favorite: false,
  });

  const sorted = useMemo(() => {
    const arr = [...jobs];
    arr.sort((a, b) => {
      const av = (a[sort.key] || '').toString().toLowerCase();
      const bv = (b[sort.key] || '').toString().toLowerCase();
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ?  1 : -1;
      return 0;
    });
    return arr;
  }, [jobs, sort]);

  const titleSuggestions = useMemo(() => (
    [...new Set(
      jobs
        .map(job => job.title)
        .filter(Boolean)
        .map(title => title.trim())
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b))
  ), [jobs]);

  const head = (k, label) => (
    <th onClick={() => setSort(s => ({ key: k, dir: s.key === k && s.dir === 'desc' ? 'asc' : 'desc' }))}>
      {label} {sort.key === k ? (sort.dir === 'asc' ? '↑' : '↓') : ''}
    </th>
  );

  const formatSalaryRange = (value) => {
    const cleaned = value.trim();
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

  const displaySalary = (value) => {
    if (!value) return '—';
    return formatSalaryRange(value);
  };

  const submitInline = () => {
    if (!inline.company.trim()) return;
    upsert({
      ...inline,
      id: uid(),
      salary: inline.salary === 'custom' ? formatSalaryRange(inline.customSalary) : inline.salary,
      favorite: inline.favorite,
    });
    setInline({
      company: '', title: '', date: todayISO(),
      status: 'waiting', salary: '', customSalary: '', notes: '', contact: '', link: '', favorite: false,
    });
  };

  return (
    <div className="sketch-box table-wrap">
      <table>
        <thead>
          <tr>
            {head('company', 'Company')}
            {head('title',   'Job title')}
            {head('date',    'Applied')}
            {head('status',  'Status')}
            {head('salary',  'Salary')}
            <th>Contact</th>
            <th>Notes</th>
            <th>Listing</th>
            <th>Fav</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {/* Inline add row — always visible at top of table */}
          <tr className="inline-add">
            <td><input placeholder="Company *" value={inline.company} onChange={e => setInline(s => ({ ...s, company: e.target.value }))} onKeyDown={e => e.key === 'Enter' && submitInline()} /></td>
            <td>
              <input
                placeholder="Job title"
                list="table-job-title-suggestions"
                value={inline.title}
                onChange={e => setInline(s => ({ ...s, title: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && submitInline()}
              />
              <datalist id="table-job-title-suggestions">
                {titleSuggestions.map(title => (
                  <option key={title} value={title} />
                ))}
              </datalist>
            </td>
            <td><input type="date" value={inline.date} onChange={e => setInline(s => ({ ...s, date: e.target.value }))} /></td>
            <td>
              <select value={inline.status} onChange={e => setInline(s => ({ ...s, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </td>
            <td>
              <select value={inline.salary} onChange={e => setInline(s => ({ ...s, salary: e.target.value }))}>
                <option value="">Unknown</option>
                <option value="<$100">&lt;$100</option>
                <option value="$100 - $130">$100 - $130</option>
                <option value="$130 - $150">$130 - $150</option>
                <option value="$150 - $200">$150 - $200</option>
                <option value="$200+">$200+</option>
                <option value="custom">Custom</option>
              </select>
              {inline.salary === 'custom' && (
                <input
                  placeholder="$120 - $150"
                  value={inline.customSalary}
                  onChange={e => setInline(s => ({ ...s, customSalary: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && submitInline()}
                  style={{ marginTop: 6 }}
                />
              )}
            </td>
            <td><input placeholder="LinkedIn contact" value={inline.contact} onChange={e => setInline(s => ({ ...s, contact: e.target.value }))} /></td>
            <td><input placeholder="notes…" value={inline.notes} onChange={e => setInline(s => ({ ...s, notes: e.target.value }))} /></td>
            <td><input placeholder="listing link" value={inline.link} onChange={e => setInline(s => ({ ...s, link: e.target.value }))} onKeyDown={e => e.key === 'Enter' && submitInline()} /></td>
            <td>
              <button
                type="button"
                className={`table-fav-btn ${inline.favorite ? 'on' : ''}`}
                onClick={() => setInline(s => ({ ...s, favorite: !s.favorite }))}
                title={inline.favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {inline.favorite ? '💖' : '♡'}
              </button>
            </td>
            <td>
              <button className="sketch-btn primary" onClick={submitInline} style={{ padding: '4px 10px', fontSize: 13 }}>
                add
              </button>
            </td>
          </tr>

          {sorted.length === 0 && (
            <tr><td colSpan={10} className="empty">no rows match your filters</td></tr>
          )}

          {sorted.map(j => (
            <tr key={j.id} onClick={() => onOpen(j)} style={{ cursor: 'pointer' }}>
              <td>
                <b>{j.favorite && <span className="favorite-heart">💖</span>}{j.company}</b>
              </td>
              <td>{j.title}</td>
              <td>{prettyDate(j.date)}</td>
              <td>
                <span className={`pill ${STATUS_MAP[j.status]?.cls || ''}`}>
                  {STATUS_MAP[j.status]?.label || j.status}
                </span>
              </td>
              <td>{displaySalary(j.salary)}</td>
              <td style={{ fontSize: 13, maxWidth: 180 }}>{j.contact || '—'}</td>
              <td style={{ fontSize: 13, maxWidth: 180, color: 'var(--ink-soft)' }}>{j.notes || '—'}</td>
              <td>
                {j.link ? (
                  <a
                    className="candy-btn link-purple"
                    href={j.link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                  >
                    View listing
                  </a>
                ) : '—'}
              </td>
              <td style={{ textAlign: 'center' }}>
                {j.favorite ? '💖' : '—'}
              </td>
              <td style={{ textAlign: 'right', color: 'var(--ink-faint)' }}>›</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
