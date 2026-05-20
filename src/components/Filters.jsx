function Filters({ filters, setFilters }) {
  const toggle = (key, val) => {
    setFilters(f => {
      const arr = f[key];
      return { ...f, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });
  };

  const hasActive = filters.statuses.length || filters.salaries.length
    || filters.dateRange !== 'all' || filters.search || filters.favoritesOnly;

  return (
    <div className="filters sketch-box">
      <input
        className="sketch-input filter-search"
        placeholder="search company, title…"
        value={filters.search}
        onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
      />

      <div className="filter-pills">
        <span className="label">status:</span>
        {STATUSES.map(s => (
          <button
            key={s.id}
            className={`filter-pill ${filters.statuses.includes(s.id) ? 'on' : ''}`}
            onClick={() => toggle('statuses', s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="filter-pills">
        <span className="label">salary</span>

        <button
          className={`filter-pill ${filters.favoritesOnly ? 'on' : ''}`}
          onClick={() => setFilters(f => ({ ...f, favoritesOnly: !f.favoritesOnly }))}
        >
          💖 favorites
        </button>

        {SALARY_BANDS.map(b => (
          <button
            key={b}
            className={`filter-pill ${filters.salaries.includes(b) ? 'on' : ''}`}
            onClick={() => toggle('salaries', b)}
          >
            {b}
          </button>
        ))}
      </div>

      <div className="filter-pills">
        <span className="label">when:</span>
        {['all', '7', '30'].map(d => (
          <button
            key={d}
            className={`filter-pill ${filters.dateRange === d ? 'on' : ''}`}
            onClick={() => setFilters(f => ({ ...f, dateRange: d }))}
          >
            {d === 'all' ? 'all' : `last ${d}d`}
          </button>
        ))}
      </div>

      {hasActive && (
        <button
          className="filter-pill"
          onClick={() => setFilters({ statuses: [], salaries: [], dateRange: 'all', search: '', favoritesOnly: false })}
          style={{ borderStyle: 'dashed' }}
        >
          clear ✕
        </button>
      )}
    </div>
  );
}
