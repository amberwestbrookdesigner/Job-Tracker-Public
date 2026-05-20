// ---- App-wide constants ----
// Edit these to change statuses, salary bands, or reminder thresholds.

const STORAGE_KEY   = 'jobTracker.v1';
const STALE_DAYS    = 7;   // days before a waiting job is flagged as stale
const FOLLOWUP_DAYS = 10;  // days before a contact gets a follow-up nudge

const STATUSES = [
  { id: 'waiting',   label: 'Waiting',   cls: 'chip-waiting' },
  { id: 'interview', label: 'Interview', cls: 'chip-interview' },
  { id: 'yes',       label: 'Offer',     cls: 'chip-yes' },
  { id: 'no',        label: 'Rejected',  cls: 'chip-no' },
];

const STATUS_MAP = Object.fromEntries(STATUSES.map(s => [s.id, s]));

const SALARY_BANDS = ['<100', '100-130', '130-150', '150-200', '200+'];
