function FormFields({ value, onChange }) {
  const f   = value;
  const set = (k) => (e) => onChange({ ...f, [k]: e.target.value });
  const salaryOptions = ['', '<$100', '$100 - $130', '$130 - $150', '$150 - $200', '$200+'];
  const currentSalary = salaryOptions.includes(f.salary || '') ? (f.salary || '') : 'custom';

  return (
    <>
      <div className="row2">
        <div className="field">
          <label>Company *</label>
          <input className="sketch-input" value={f.company || ''} onChange={set('company')} placeholder="Acme Co." />
        </div>
        <div className="field">
          <label>Job title</label>
          <input className="sketch-input" value={f.title || ''} onChange={set('title')} placeholder="Senior Product Designer" />
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label>Date applied</label>
          <input className="sketch-input" type="date" value={f.date || ''} onChange={set('date')} />
        </div>
        <div className="field">
          <label>Status</label>
          <select className="sketch-input" value={f.status || 'waiting'} onChange={set('status')}>
            {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="row2">
        <div className="field">
          <label>Salary</label>
          <select
            className="sketch-input"
            value={currentSalary}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                onChange({
                  ...f,
                  salary: 'custom',
                  customSalary: f.salary && f.salary !== 'custom' ? f.salary : '',
                });
              } else {
                onChange({ ...f, salary: e.target.value, customSalary: '' });
              }
            }}
          >
            <option value="">Unknown / not listed</option>
            <option value="<$100">&lt;$100</option>
            <option value="$100 - $130">$100 - $130</option>
            <option value="$130 - $150">$130 - $150</option>
            <option value="$150 - $200">$150 - $200</option>
            <option value="$200+">$200+</option>
            <option value="custom">Custom</option>
          </select>

          {currentSalary === 'custom' && (
            <input
              className="sketch-input salary-custom-input"
              value={f.customSalary || ''}
              onChange={(e) => onChange({ ...f, customSalary: e.target.value, salary: 'custom' })}
              placeholder="$120 - $150"
            />
          )}
        </div>
        <div className="field">
          <label>LinkedIn contact</label>
          <input className="sketch-input" value={f.contact || ''} onChange={set('contact')} placeholder="Name, role" />
        </div>
      </div>

      <div className="field">
        <label>Link to JD</label>
        <input className="sketch-input" value={f.link || ''} onChange={set('link')} placeholder="https://…" />
      </div>

      <div className="field">
        <label>Notes</label>
        <textarea className="sketch-input" rows={3} value={f.notes || ''} onChange={set('notes')} placeholder="anything to remember…" />
      </div>

      <label className="favorite-toggle">
        <input
          type="checkbox"
          checked={!!f.favorite}
          onChange={(event) => onChange({ ...f, favorite: event.target.checked })}
        />
        <span>{f.favorite ? '💖 Favorited' : '♡ Add to favorites'}</span>
      </label>
    </>
  );
}

function DetailDrawer({ job, onClose, onSave, onDelete }) {
  const { useState, useEffect } = React;
  const [j, setJ] = useState(job);

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

  const saveJob = () => {
    const salary = j.salary === 'custom' ? formatSalaryRange(j.customSalary) : j.salary;
    const { customSalary, ...jobToSave } = j;
    onSave({ ...jobToSave, salary });
  };

  useEffect(() => setJ(job), [job?.id]);

  return (
    <>
      <div className="scrim drawer-scrim" onClick={onClose}></div>

      <aside
        className="detail sketch-box"
        onClick={(event) => event.stopPropagation()}
        style={{
          borderRadius: 0,
          boxShadow: '-18px 0 45px rgba(43,34,68,.14)',
          border: 'none',
          borderLeft: '1px solid var(--line-soft)',
          background: 'rgba(255,249,254,.98)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2>{j.favorite ? '💖 ' : ''}{j.company || 'application'}</h2>
          <button className="sketch-btn" onClick={onClose} style={{ padding: '6px 10px' }}>✕</button>
        </div>

        <FormFields value={j} onChange={setJ} />

        {j.link && (
          <div className="listing-action">
            <a className="candy-btn link-yellow" href={j.link} target="_blank" rel="noreferrer">
              Open job listing
            </a>
          </div>
        )}

        <hr className="sketch-line" />

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <button
            className="sketch-btn"
            onClick={() => { if (confirm('Delete this application?')) onDelete(j.id); }}
            style={{ color: 'var(--no)', borderColor: 'var(--no)' }}
          >
            delete
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="sketch-btn" onClick={onClose}>close</button>
            <button className="sketch-btn primary" onClick={saveJob}>save</button>
          </div>
        </div>
      </aside>
    </>
  );
}
