// ---- Utility functions ----

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  if (!a || !b) return null;
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function prettyDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function uid() {
  return 'j_' + Math.random().toString(36).slice(2, 9);
}

function salaryToBand(s) {
  if (!s) return null;
  if (s.includes('200'))       return '200+';
  if (s.includes('150-200'))   return '150-200';
  if (s.includes('130-150'))   return '130-150';
  if (s.includes('100-130'))   return '100-130';
  if (s.startsWith('>110') || s.startsWith('<100')) return '<100';
  return null;
}

const SUPABASE_URL = 'HIDDEN';
const SUPABASE_KEY = 'HIDDEN';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

}

  };
  await supabaseClient.from('jobs').upsert(clean);
}

async function deleteJob(id) {
  await supabaseClient.from('jobs').delete().eq('id', id);
}
