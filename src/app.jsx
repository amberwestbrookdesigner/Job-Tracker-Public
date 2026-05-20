const { useState, useEffect, useMemo } = React;

function App() {
  const [jobs,    setJobs]    = useState([]);
  const [tab, setTab] = useState(() => localStorage.getItem('jobTrackerActiveTab') || 'pipeline');
  const [filters, setFilters] = useState({ statuses: [], salaries: [], dateRange: 'all', search: '', favoritesOnly: false });
  const [editing, setEditing] = useState(null);
  const [adding,  setAdding]  = useState(false);

  // Persist on every change
  useEffect(() => {
  loadJobs().then(data => setJobs(data));
}, []);

  useEffect(() => {
    localStorage.setItem('jobTrackerActiveTab', tab);
  }, [tab]);

  const upsert = (job) => {
  const newJob = { ...job, id: job.id || uid() };
  saveJob(newJob);
  setJobs(curr => {
    const i = curr.findIndex(j => j.id === newJob.id);
    if (i < 0) return [newJob, ...curr];
    const copy = [...curr];
    copy[i] = newJob;
    return copy;
  });
};

  const remove = (id) => {
  deleteJob(id);
  setJobs(curr => curr.filter(j => j.id !== id));
};

  // Filtered job list used by all views
  const filtered = useMemo(() => {
    const cutoff = (() => {
      if (filters.dateRange === '7')  return new Date(Date.now() - 7  * 86400000);
      if (filters.dateRange === '30') return new Date(Date.now() - 30 * 86400000);
      return null;
    })();
    return jobs.filter(j => {
      if (filters.favoritesOnly && !j.favorite) return false;
      if (filters.statuses.length && !filters.statuses.includes(j.status)) return false;
      if (filters.salaries.length) {
        const band = salaryToBand(j.salary);
        if (!band || !filters.salaries.includes(band)) return false;
      }
      if (cutoff && j.date && new Date(j.date) < cutoff) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !(j.company || '').toLowerCase().includes(q) &&
          !(j.title   || '').toLowerCase().includes(q) &&
          !(j.contact || '').toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [jobs, filters]);

  // Reminder lists for dashboard + tab badge
  const today = todayISO();
  const reminders = useMemo(() => {
    const stale = [], followUp = [];
    for (const j of jobs) {
      if (j.status !== 'waiting' || !j.date) continue;
      const d = daysBetween(j.date, today);
      if (d != null && d >= STALE_DAYS)   stale.push({ ...j, daysOld: d });
      if (j.contact && d != null && d >= FOLLOWUP_DAYS) followUp.push({ ...j, daysOld: d });
    }
    return {
      stale:    stale.sort((a, b) => b.daysOld - a.daysOld),
      followUp: followUp.sort((a, b) => b.daysOld - a.daysOld),
    };
  }, [jobs, today]);

  // Stats for header tiles + dashboard chart
  const stats = useMemo(() => {
    const total     = jobs.length;
    const responded = jobs.filter(j => j.status !== 'waiting').length;
    const respRate  = total ? Math.round(responded / total * 100) : 0;

    const weeks = [0, 0, 0, 0];
    for (const j of jobs) {
      if (!j.date) continue;
      const d = daysBetween(j.date, today);
      if (d == null || d < 0) continue;
      const wIdx = Math.floor(d / 7);
      if (wIdx < 4) weeks[wIdx]++;
    }
    const avgPerWeek = Math.round(weeks.reduce((a, b) => a + b, 0) / 4);

    const respondedJobs = jobs.filter(j => j.status !== 'waiting' && j.date);
    const ttrDays = respondedJobs.length
      ? Math.round(respondedJobs.reduce((acc, j) => acc + daysBetween(j.date, today), 0) / respondedJobs.length)
      : null;

    return { total, respRate, responded, avgPerWeek, weeks, ttrDays };
  }, [jobs, today]);

  return (
    <div className="wrap">
      {/* Header */}
      <div className="header">
        <div className="brand">
          <h1>Job Tracker</h1>
          <div className="sub">applications, replies &amp; follow-ups</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-row">
        <div className="tabs">
          {[
            { id: 'pipeline',  label: 'Pipeline' },
            { id: 'table',     label: 'Table' },
            { id: 'cards',     label: 'Cards' },
            { id: 'dashboard', label: 'Dashboard' },
          ].map(it => (
            <button key={it.id} className={`tab ${tab === it.id ? 'active' : ''}`} onClick={() => setTab(it.id)}>
              {it.label}
              {it.id === 'dashboard' && reminders.stale.length > 0 && (
                <span className="pill chip-no" style={{ marginLeft: 6, fontSize: 11, padding: '1px 6px' }}>
                  {reminders.stale.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab !== 'table' && (
          <button className="candy-btn add" type="button" onClick={() => setAdding(true)}>
            + Add job
          </button>
        )}
      </div>

      <Stats stats={stats} />
      <Filters filters={filters} setFilters={setFilters} />

      <main>
        {tab === 'dashboard' && <Dashboard jobs={filtered} stats={stats} reminders={reminders} onOpen={setEditing} />}
        {tab === 'pipeline'  && <Pipeline  jobs={filtered} reminders={reminders} onOpen={setEditing} upsert={upsert} />}
        {tab === 'table'     && <TableView jobs={filtered} onOpen={setEditing} upsert={upsert} />}
        {tab === 'cards'     && <CardList  jobs={filtered} onOpen={setEditing} />}
      </main>

      <p className="footer-note">{jobs.length} applications tracked · saved in this browser</p>

      {adding && (
        <AddJobModal
          jobs={jobs}
          onClose={() => setAdding(false)}
          onSave={(job) => { upsert(job); setAdding(false); }}
        />
      )}

      {editing && (
        <DetailDrawer
          job={editing}
          onClose={() => setEditing(null)}
          onSave={(j) => { upsert(j); setEditing(null); }}
          onDelete={(id) => { remove(id); setEditing(null); }}
        />
      )}
    </div>
  );
}

function AddJobModal({ jobs, onClose, onSave }) {
  const [form, setForm] = useState({
    company: '',
    title: '',
    date: todayISO(),
    status: 'waiting',
    salary: '',
    customSalary: '',
    contact: '',
    notes: '',
    link: '',
    favorite: false,
  });

  const update = (key, value) => {
    setForm(curr => ({ ...curr, [key]: value }));
  };

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

  const titleSuggestions = [...new Set(
    jobs
      .map(job => job.title)
      .filter(Boolean)
      .map(title => title.trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  const submit = (event) => {
    event.preventDefault();
    if (!form.company.trim() || !form.title.trim()) return;

    onSave({
      id: uid(),
      company: form.company.trim(),
      title: form.title.trim(),
      date: form.date,
      status: form.status,
      salary: form.salary === 'custom' ? formatSalaryRange(form.customSalary) : form.salary,
      contact: form.contact.trim(),
      notes: form.notes.trim(),
      link: form.link.trim(),
      favorite: form.favorite,
    });
  };

  return (
    <div className="scrim" onClick={onClose}>
      <section className="sketch-box add-modal" onClick={(event) => event.stopPropagation()}>
        <div className="add-modal-head">
          <div>
            <h2>Add a job</h2>
            <p className="hint">Add the basics now. Future you can obsess over details later.</p>
          </div>
          <button className="sketch-btn" type="button" onClick={onClose}>Close</button>
        </div>

        <form className="add-job-form" onSubmit={submit}>
          <div className="row2">
            <div className="field">
              <label>Company</label>
              <input className="sketch-input" value={form.company} onChange={(event) => update('company', event.target.value)} required />
            </div>
            <div className="field">
              <label>Job title</label>
              <input
                className="sketch-input"
                list="job-title-suggestions"
                value={form.title}
                onChange={(event) => update('title', event.target.value)}
                required
              />
              <datalist id="job-title-suggestions">
                {titleSuggestions.map(title => (
                  <option key={title} value={title} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="row2">
            <div className="field">
              <label>Date applied</label>
              <input className="sketch-input" type="date" value={form.date} onChange={(event) => update('date', event.target.value)} />
            </div>
            <div className="field">
              <label>Status</label>
              <select className="sketch-input" value={form.status} onChange={(event) => update('status', event.target.value)}>
                <option value="waiting">Waiting</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="row2">
            <div className="field">
              <label>Salary</label>
              <select
                className="sketch-input"
                value={form.salary}
                onChange={(event) => update('salary', event.target.value)}
              >
                <option value="">Unknown / not listed</option>
                <option value="<$100">&lt;$100</option>
                <option value="$100 - $130">$100 - $130</option>
                <option value="$130 - $150">$130 - $150</option>
                <option value="$150 - $200">$150 - $200</option>
                <option value="$200+">$200+</option>
                <option value="custom">Custom</option>
              </select>

              {form.salary === 'custom' && (
                <input
                  className="sketch-input salary-custom-input"
                  value={form.customSalary}
                  onChange={(event) => update('customSalary', event.target.value)}
                  placeholder="$120 - $150"
                />
              )}
            </div>
            <div className="field">
              <label>Contact</label>
              <input className="sketch-input" value={form.contact} onChange={(event) => update('contact', event.target.value)} placeholder="Recruiter, hiring manager, referral..." />
            </div>
          </div>

          <div className="field">
            <label>Listing link</label>
            <input className="sketch-input" type="url" value={form.link} onChange={(event) => update('link', event.target.value)} placeholder="https://..." />
          </div>

          <div className="field">
            <label>Notes</label>
            <textarea className="sketch-input" value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Anything useful to remember about this one." />
          </div>

          <label className="favorite-toggle">
            <input
              type="checkbox"
              checked={form.favorite}
              onChange={(event) => update('favorite', event.target.checked)}
            />
            <span>💖 Add to favorites</span>
          </label>

          <div className="form-actions">
            <button className="sketch-btn" type="button" onClick={onClose}>Cancel</button>
            <button className="candy-btn add" type="submit">Add job</button>
          </div>
        </form>
      </section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
