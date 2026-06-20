const I = {
  check:'<circle cx="12" cy="12" r="9"/><path d="m8.4 12.4 2.4 2.4 4.8-5.2"/>',
  shield:'<path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
  bulb:'<path d="M9.5 18h5"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3Z"/>',
  xcircle:'<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6m0-6 6 6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5l3 1.8"/>',
  link:'<path d="M9.5 14.5 14.5 9.5"/><path d="M11 6.5 12 5.5a4 4 0 0 1 6 6l-1 1"/><path d="M13 17.5 12 18.5a4 4 0 0 1-6-6l1-1"/>',
  chart:'<path d="M4 5v14h16"/><circle cx="9" cy="13" r="1.3"/><circle cx="13" cy="9" r="1.3"/><circle cx="17" cy="11" r="1.3"/>',
  cash:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.4"/>',
  wave:'<path d="M3 12c2 0 2-5 4-5s2 10 4 10 2-10 4-10 2 5 4 5"/>',
  bars:'<path d="M5 20V11M10 20V5M15 20v-6M20 20v-3"/>',
  flask:'<path d="M9 3h6M10 3v6l-4.4 8A2 2 0 0 0 7.4 20h9.2a2 2 0 0 0 1.8-3L14 9V3"/>',
  flame:'<path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.6C9 9 9 6 12 3Z"/>',
  github:'<path d="M9 19c-4 1.4-4-2-5-2m10 4v-3.4c0-1 .1-1.4-.5-2 2.5-.3 5-1.2 5-5.5 0-1.2-.4-2.2-1-3 .3-.8.3-2-.1-2.8 0 0-1-.3-3 1.2a10 10 0 0 0-5 0C6.5 3.8 5.5 4 5.5 4c-.4.8-.4 2-.1 2.8-.6.8-1 1.8-1 3 0 4.3 2.5 5.2 5 5.5-.4.4-.6 1-.5 1.6V21"/>',
  usercheck:'<circle cx="9" cy="8" r="3.4"/><path d="M3.5 20c0-3.4 2.8-5.4 5.5-5.4 1.3 0 2.6.4 3.5 1.2"/><path d="m15.5 12 2 2 4-4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  plug:'<path d="M9 7V3M15 7V3M7 7h10v3.5a5 5 0 0 1-10 0z"/><path d="M12 16v5"/>',
  lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  robot:'<rect x="4.5" y="8" width="15" height="11" rx="2.5"/><path d="M12 8V5"/><circle cx="12" cy="4" r="1.1"/><path d="M9.4 13h.2M14.4 13h.2"/><path d="M3 14v2M21 14v2"/>',
  chevron:'<path d="m6 9.5 6 6 6-6"/>',
  inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-7z"/>',
  arrowleft:'<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  msg:'<path d="M21 11.5a8 8 0 0 1-11.5 7.2L3 20.5l1.8-6A8 8 0 1 1 21 11.5Z"/><path d="M12 8v6M9 11h6"/>',
  bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  alert:'<path d="M12 9.5v4M12 17h.01"/><path d="M10.3 4.3 2.7 17.5a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z"/>',
  refresh:'<path d="M20.5 12a8.5 8.5 0 1 1-2.4-6M20.5 4.5V10h-5.5"/>',
  stack:'<path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="M2 12l10 5 10-5"/><path d="M2 17l10 5 10-5"/>',
  trash:'<path d="M4 7h16"/><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2"/><path d="M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12"/><path d="M10 11v5M14 11v5"/>',
  x:'<path d="m6 6 12 12M18 6 6 18"/>',
};
const icon = (n, s = 16) =>
  `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${I[n] || ''}</svg>`;

const STATUS = {
  'tested-confirmed': { label: 'Tested', cls: 'b-tested', i: 'check' },
  'verified': { label: 'Verified', cls: 'b-verified', i: 'shield' },
  'human-approved': { label: 'Approved', cls: 'b-verified', i: 'shield' },
  'proposed': { label: 'Proposed', cls: 'b-proposed', i: 'bulb' },
  'disproven': { label: 'Disproven', cls: 'b-disproven', i: 'xcircle' },
  'tested-failed': { label: 'Failed', cls: 'b-disproven', i: 'xcircle' },
  'rejected': { label: 'Rejected', cls: 'b-stale', i: 'xcircle' },
  'supported': { label: 'Supported', cls: 'b-supported', i: 'link' },
  'stale': { label: 'Stale', cls: 'b-stale', i: 'clock' },
};
const FILTERS = [
  { k: 'all', label: 'All' },
  { k: 'tested-confirmed', label: 'Tested' },
  { k: 'verified', label: 'Verified' },
  { k: 'proposed', label: 'Needs review' },
  { k: 'stale', label: 'Stale' },
];
// timeline node look, keyed by event effect/status/type
const NODE = {
  proposed: { i: 'bulb', c: 'n-amber' },
  support: { i: 'link', c: 'n-gray' },
  confirmed: { i: 'check', c: 'n-green' },
  verified: { i: 'shield', c: 'n-blue' },
  'tested-confirmed': { i: 'check', c: 'n-green' },
  'human-approved': { i: 'usercheck', c: 'n-blue' },
  disproven: { i: 'xcircle', c: 'n-red' },
  'tested-failed': { i: 'xcircle', c: 'n-red' },
  rejected: { i: 'xcircle', c: 'n-red' },
  context: { i: 'msg', c: 'n-gray' },
  dispute: { i: 'alert', c: 'n-amber' },
};
const NODE_DEF = { i: 'clock', c: 'n-gray' };
const cap = (s) => s ? s[0].toUpperCase() + s.slice(1) : s;

const state = { data: null, filter: 'all', query: '', space: localStorage.getItem('space') || 'all', recall: { query: '', scope: {} } };
const inSpace = (c) => state.space === 'all' || c.space === state.space;
const view = document.getElementById('view');
const esc = (s) => (s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const effStatus = (c) => (c.stale && c.status !== 'proposed' ? 'stale' : c.status);

async function load() {
  state.data = await (await fetch('/api/data')).json();
  renderSpaceSwitch();
  renderSys();
  render();
}

function relTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d)) return ts;
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return String(ts).slice(0, 10);
}

function renderSys() {
  const el = document.getElementById('sysbar');
  if (!el || !state.data) return;
  const sys = state.data.sys || {};
  const claims = state.data.claims || [];
  const review = claims.filter((c) => effStatus(c) === 'proposed').length;
  const stale = claims.filter((c) => effStatus(c) === 'stale').length;
  const disputed = claims.filter((c) => c.disputed).length;
  const le = sys.last_event;
  const evHtml = le
    ? `<span class="sys-ev">last: <b>${esc(le.effect || le.type || '')}</b> · ${esc(le.by || '')} · ${esc(relTime(le.ts) || le.at || '')}</span>`
    : '<span class="sys-ev">no events yet</span>';
  const git = sys.git === 'clean' ? '<span class="sys-ok">git ✓</span>'
    : sys.git === 'dirty' ? '<span class="sys-warn" title="memory/ has uncommitted changes">git ±</span>' : '';
  el.innerHTML = `
    <span class="sys-live"><i></i> memotrust</span>
    ${evHtml}
    <span class="sys-right">
      <button class="${review + stale ? 'sys-need' : 'sys-need sys-dim'}" id="sys-need">review ${review} · stale ${stale}</button>
      <span class="sys-dim">disputed ${disputed}</span>
      <span class="sys-dim">events today <b>${sys.events_today || 0}</b></span>
      ${git}
    </span>`;
  const need = el.querySelector('#sys-need');
  if (need) need.onclick = () => { location.hash = '#/inbox'; };
}

function renderSpaceSwitch() {
  const el = document.getElementById('spaceswitch');
  if (!el) return;
  const spaces = (state.data && state.data.spaces) || [];
  if (state.space !== 'all' && !spaces.includes(state.space)) state.space = 'all';
  el.innerHTML = `${icon('stack', 14)}<select id="space-sel" aria-label="Space">
    <option value="all"${state.space === 'all' ? ' selected' : ''}>All spaces</option>
    ${spaces.map((s) => `<option value="${esc(s)}"${state.space === s ? ' selected' : ''}>${esc(s)}</option>`).join('')}
  </select>`;
  el.querySelector('#space-sel').onchange = (e) => setSpace(e.target.value);
}

function setSpace(s) {
  state.space = s;
  try { localStorage.setItem('space', s); } catch (e) { /* private mode */ }
  renderSpaceSwitch();
  render();
}

let lastKey = '';
function parseRoute(hash) {
  const parts = (hash || '').replace(/^#\/?/, '').split('/');
  return { name: parts[0] || 'memory', id: parts[1] ? decodeURIComponent(parts[1]) : null };
}
function render() {
  const { name, id } = parseRoute(location.hash);
  document.querySelectorAll('.nav-link').forEach((a) =>
    a.classList.toggle('active', a.dataset.route === name || (name === 'claim' && a.dataset.route === 'memory')));
  const views = { inbox: inboxView, verifiers: verifiersView, memory: memoryView, claim: () => claimView(id), recall: recallView };
  view.innerHTML = (views[name] || memoryView)();
  wire(name);
  const key = name + '/' + (id || '');
  if (key !== lastKey) { window.scrollTo(0, 0); lastKey = key; }
}

function inboxView() {
  const d = state.data;
  const base = (d.claims || []).filter(inSpace);
  const byStatus = (st) => base.filter((c) => effStatus(c) === st);
  const proposed = byStatus('proposed');
  const stale = byStatus('stale');
  const disputed = base.filter((c) => c.disputed);
  const disproven = base.filter((c) => ['disproven', 'tested-failed'].includes(effStatus(c)));
  const box = (items, selectable) =>
    `<div class="listbox"><div class="lbody">${items.map((c) => row(c, selectable === true)).join('')}</div></div>`;
  const grp = (title, sub, items, opts = {}) => items.length ? `
    <div class="ibx-grp">
      <div class="ibx-head"><span class="ibx-title">${title}</span><span class="ibx-n">${items.length}</span></div>
      <p class="ibx-sub">${sub}</p>
      ${items.length > 1 && opts.bulk ? `
      <div class="bulkbar">
        <label class="bulk-all"><input type="checkbox" id="bulk-all"> Select all</label>
        <span class="bulk-count" id="bulk-count">0 selected</span>
        <span class="bulk-actions">
          <button class="btn primary" id="bulk-approve" disabled>Approve selected</button>
          <button class="btn" id="bulk-reject" disabled>Reject selected</button>
        </span>
      </div>` : ''}
      ${box(items, opts.bulk)}
    </div>` : '';
  const actionable = proposed.length + stale.length + disputed.length;
  return `
  <div class="page-head row-head">
    <div>
      <h1 class="page-title">Inbox</h1>
      <p class="page-sub">${actionable ? 'What needs you right now.' : "You're all caught up."}</p>
    </div>
    <a href="#/memory" class="btn inbox-btn">${icon('arrowleft', 15)} Back</a>
  </div>
  ${grp('Needs your review', 'New memories waiting for a yes or no — approve to make them trusted.', proposed, { bulk: true })}
  ${grp('Disputed — needs a call', 'Someone flagged a counter-read on a trusted claim. Re-verify or re-affirm to settle it.', disputed)}
  ${grp('Gone stale — re-test', 'Confidence has expired. Re-check to confirm these still hold.', stale)}
  ${grp('Disproven', 'Tested and failed — kept as warnings so agents steer clear.', disproven)}
  ${actionable === 0 && !disproven.length ? `<div class="ibx-empty">${icon('check', 24)}<span>All clear — nothing needs you.</span></div>` : ''}`;
}

/* ---------------- memory ---------------- */
function memoryView() {
  const d = state.data;
  const base = (d.claims || []).filter(inSpace);
  const total = base.length;
  const counts = {};
  base.forEach((c) => { const k = effStatus(c); counts[k] = (counts[k] || 0) + 1; });
  const chips = FILTERS.map((f) => {
    const n = f.k === 'all' ? total : (counts[f.k] || 0);
    return `<button class="chip ${state.filter === f.k ? 'on' : ''}" data-filter="${f.k}">${f.label} <span class="n">${n}</span></button>`;
  }).join('');

  const q = state.query || '';
  let claims = base.filter((c) => state.filter === 'all' ? true : effStatus(c) === state.filter);
  if (q) claims = claims.filter((c) =>
    (c.claim + ' ' + Object.values(c.scope || {}).join(' ')).toLowerCase().includes(q));

  const inboxN = base.filter((c) => ['proposed', 'stale'].includes(effStatus(c)) || c.disputed).length;
  const spaceDesc = state.space !== 'all'
    ? `<div class="space-desc"><span class="sd-name">${icon('stack', 13)} ${esc(state.space)}</span><input class="sd-input" data-spacedesc="${esc(state.space)}" value="${esc((d.space_desc || {})[state.space] || '')}" placeholder="Describe this space — what is it? e.g. the Acme web app"></div>`
    : '';

  const stateOf = (c) => {
    const st = effStatus(c);
    if (c.disputed || ['disproven', 'tested-failed'].includes(st)) return 'cov-contested';
    if (st === 'stale') return 'cov-stale';
    if (['verified', 'tested-confirmed', 'human-approved'].includes(st)) return 'cov-trusted';
    return 'cov-unproven';
  };
  const bk = { 'cov-trusted': 'trusted', 'cov-stale': 'stale', 'cov-contested': 'contested', 'cov-unproven': 'unproven' };
  const buckets = { trusted: 0, stale: 0, contested: 0, unproven: 0 };
  base.forEach((c) => { buckets[bk[stateOf(c)]]++; });
  const rank = { 'cov-trusted': 0, 'cov-stale': 1, 'cov-contested': 2, 'cov-unproven': 3 };
  const STATE_LABEL = { 'cov-trusted': 'Trusted', 'cov-stale': 'Stale', 'cov-contested': 'Contested', 'cov-unproven': 'Unproven' };
  const cells = base.map((c) => ({ cls: stateOf(c), id: c.id }))
    .sort((a, b) => rank[a.cls] - rank[b.cls])
    .map((x) => `<a class="cov-cell ${x.cls}" href="#/claim/${esc(x.id)}" aria-label="${STATE_LABEL[x.cls]}" data-tip="${STATE_LABEL[x.cls]}"></a>`).join('');
  const leg = (n, cls, label) => n ? `<span><i class="${cls}"></i> ${n} ${label}</span>` : '';
  const dense = base.length > 40 ? ' dense' : ''; // discrete cells until 40; unit-bar only at scale
  const coverage = `
  <div class="coverage">
    <div class="cov-row">
      <div class="cov-metric"><span class="cov-pct">${Math.round(buckets.trusted / (total || 1) * 100)}%</span><span class="cov-label">trusted · ${total} claims</span></div>
      <div class="cov-cells${dense}">${cells}</div>
      <div class="cov-legend">${leg(buckets.trusted, 'cov-trusted', 'trusted')}${leg(buckets.stale, 'cov-stale', 'stale')}${leg(buckets.contested, 'cov-contested', 'contested')}${leg(buckets.unproven, 'cov-unproven', 'unproven')}</div>
    </div>
  </div>`;

  return `
  <div class="page-head row-head">
    <div>
      <h1 class="page-title">Agents Memory</h1>
      <p class="page-sub">Everything your agents know — and exactly how much of it is proven.</p>
    </div>
    <a href="#/inbox" class="btn inbox-btn">${icon('inbox', 15)} Inbox${inboxN ? ` <span class="ib-count">${inboxN}</span>` : ''}</a>
  </div>
  ${spaceDesc}
  ${coverage}
  <div class="capture">
    ${icon('msg', 18)}
    <input id="capture" placeholder="remember that…   ·   forget that…   ·   that's confirmed" autocomplete="off">
    <span class="hint">⏎ to propose</span>
  </div>
  <div class="listbox">
    <div class="lhead"><div class="filters">${chips}</div><span class="lhead-right">${claims.length} of ${total}</span></div>
    <div class="lbody">${claims.map(row).join('') || empty()}</div>
  </div>`;
}

function row(c, selectable) {
  const st = effStatus(c);
  const s = STATUS[st] || STATUS.proposed;
  const sel = selectable === true
    ? `<input type="checkbox" class="rowsel" data-bulksel="${esc(c.id)}" aria-label="Select ${esc(c.id)}">` : '';
  const dim = ['disproven', 'tested-failed', 'stale', 'rejected'].includes(st);
  const labels = Object.values(c.scope || {}).map((v) => `<span class="label">${esc(v)}</span>`).join('');
  const proofE = (c.evidence || []).find((e) => e.type === 'verifier' && e.query);
  const ev = (c.evidence || []).filter((e) => e !== proofE).map((e) =>
    `<div class="ev ${e.effect === 'support' ? 'support' : ''}"><span class="src">${esc(e.source)}</span><span>${esc(e.detail)}</span></div>`).join('');
  const warn = (st === 'disproven' || st === 'tested-failed')
    ? `<div class="warn">${icon('alert', 13)} Agents are warned before reusing this</div>` : '';

  let actions = '';
  if (st === 'proposed')
    actions = `<button class="btn primary" data-act="human-approved" data-id="${c.id}">Approve</button><button class="btn" data-act="rejected" data-id="${c.id}">Reject</button>`;
  else if (st === 'stale')
    actions = `<button class="btn" data-act="tested-confirmed" data-id="${c.id}">${icon('refresh', 13)} Recheck</button>`;

  const conf = c.confidence && c.confidence !== 'none' ? `${esc(c.confidence)} confidence` : '';
  let meta;
  if (st === 'proposed') meta = c.proposed_by ? `by ${esc(c.proposed_by)} · awaiting review` : 'awaiting review';
  else if (st === 'stale') meta = `last confirmed ${esc(c.last_confirmed || c.expires || '')}`;
  else if (st === 'disproven' || st === 'tested-failed') meta = `failed${c.last_confirmed ? ` ${esc(c.last_confirmed)}` : ''}`;
  else meta = [c.last_confirmed, conf].filter(Boolean).map(esc).join(' · ');

  return `
  <div class="row ${s.cls} ${dim ? 'dim' : ''}">
    ${sel}
    <span class="st">${icon(s.i, 18)}</span>
    <div class="body">
      <div class="title"><a class="claim-text" href="#/claim/${esc(c.id)}">${esc(c.claim)}</a>${labels ? `<span class="labels">${labels}</span>` : ''}</div>
      <div class="subline"><span class="st-word">${s.label}</span>${c.disputed ? ` · <span class="disputed-flag">${icon('alert', 12)} Disputed</span>` : ''}${meta ? ` · ${meta}` : ''}</div>
      ${ev ? `<div class="evidence">${ev}</div>` : ''}
      ${warn}
      ${receipt(c)}
    </div>
    ${actions ? `<div class="side">${actions}</div>` : ''}
  </div>`;
}

const empty = () => `<div class="row"><span class="st"></span><div class="body"><div class="claim-text" style="color:var(--faint);font-weight:400">No memories match.</div></div></div>`;

const proofSrc = (p) => ((p.query && p.query.source) || p.source || 'a verifier').replace(' (read-only)', '');
const proofOk = (p) => p.effect === 'verified' || p.effect === 'confirmed';

function proofToggle(targetId, ok, src) {
  return `<button class="receipt-toggle" data-toggle="${targetId}"><span class="rt-ic ${ok ? '' : 'no'}">${icon(ok ? 'check' : 'xcircle', 15)}</span><span class="rt-lbl">${ok ? 'Verified' : 'Refuted'} by ${esc(src)}</span><span class="rt-dot">&middot;</span><span class="rt-act">View proof ${icon('chevron', 14)}</span></button>`;
}

function proofPanel(p, panelId, opts = {}) {
  const ok = proofOk(p), src = proofSrc(p), q = p.query || {};
  const qrows = [['event', q.event], ['breakdown', q.breakdown], ['window', q.window], ['source', q.source]]
    .filter((r) => r[1])
    .map(([k, v]) => `<div><span class="rc-k">${k}</span>${esc(String(v))}</div>`).join('');
  const r = p.result || {};
  let rrows = '';
  if (r.rows) {
    rrows = r.rows.map((row, i) =>
      `<div>${esc(String(row[0]))}<span class="rc-n">${Number(row[1]).toLocaleString()}${i === 0 ? ' &larr; top' : ''}</span></div>`).join('');
    rrows += `<div class="rc-k">&hellip; ${r.n} countries &middot; ${Number(r.total).toLocaleString()} total</div>`;
  } else if (r.observed !== undefined) {
    rrows = `<div>${esc(String(r.observed))}<span class="rc-n">observed</span></div>`;
  } else if (r.value !== undefined) {
    rrows = `<div>${esc(String(r.value))}</div>`;
  }
  const rerunBtn = opts.showRerun ? `<button class="btn rc-rerun" data-rerun="${opts.claimId}">${icon('refresh', 13)} Re-run</button>` : '';
  const rerunSlot = opts.showRerun ? `<div class="rc-status" id="rcs-${opts.claimId}"></div>` : '';
  return `
    <div class="receipt" id="${panelId}"${opts.open ? '' : ' hidden'}>
      <div class="rc-head">
        <span class="rc-ok">${icon('check', 14)} ${ok ? 'Confirmed' : 'Refuted'} by ${esc(src)}</span>
        <span class="rc-by">${icon('robot', 13)} read by ${esc(p.read_by || 'agent')}${p.at ? ' &middot; ' + esc(p.at) : ''}</span>
        ${rerunBtn}
      </div>
      <div class="rc-body">
        <div><div class="rc-l">Claim expects</div><div>${esc(p.expected || '')}</div></div>
        <div><div class="rc-l">Query the agent ran &middot; read-only</div><div class="rc-mono">${qrows}</div></div>
        <div><div class="rc-l">Raw result it got back</div><div class="rc-mono tbl">${rrows}</div></div>
        <div><div class="rc-l">memotrust judged (not the agent)</div><div class="rc-judge"><span>${esc(p.judged || '')}</span><span class="rc-pill ${ok ? '' : 'no'}">${ok ? 'confirmed' : 'refuted'}</span></div></div>
        ${rerunSlot}
      </div>
    </div>`;
}

function receipt(c) {
  const p = (c.evidence || []).find((e) => e.type === 'verifier' && e.query);
  if (!p) return '';
  return `
  <div class="receipt-wrap">
    ${proofToggle('rc-' + c.id, proofOk(p), proofSrc(p))}
    ${proofPanel(p, 'rc-' + c.id, { showRerun: true, claimId: c.id })}
  </div>`;
}

/* ---------------- verifiers ---------------- */
function verifiersView() {
  const groups = (state.data.verifiers.groups || []).map((g, gi) => {
    const cards = g.items.map((v, i) => {
      const foot = v.status === 'active'
        ? `<span class="v-active">${icon('check', 13)} Active</span>`
        : v.status === 'builtin'
        ? `<span class="v-builtin">Built-in</span>`
        : `<span class="v-connect">${icon('plug', 14)} Connect</span>`;
      return `
      <div class="vcard ${v.status === 'active' ? 'on' : ''}">
        <div class="vtop"><span class="vi">${icon(v.icon || 'plug', 20)}</span>
          <span class="vname">${esc(v.name)}</span>
          ${v.mcp ? '<span class="vmcp">MCP</span>' : ''}
          ${v.access === 'read-only' ? `<span class="vro">${icon('lock', 11)} read-only</span>` : ''}</div>
        <div class="vverify">${esc(v.verifies)}</div>
        <div class="vfoot">${foot}<span></span></div>
      </div>`;
    }).join('');
    return `<div class="vgroup"><div class="gtitle">${esc(g.title)}</div><div class="gdesc">${esc(g.desc)}</div><div class="vgrid">${cards}</div></div>`;
  }).join('');

  return `
  <div class="v-head">
    <div class="page-head" style="margin:0">
      <h1 class="page-title">Verifiers</h1>
      <p class="page-sub">Connect the systems that turn proposed memories into trusted knowledge.</p>
    </div>
    <button class="btn primary">${icon('plus', 14)} Add verifier</button>
  </div>
  ${state.data.verifiers.access_note ? `<p class="ro-note">${icon('lock', 13)} ${esc(state.data.verifiers.access_note)}</p>` : ''}
  <div class="search">${icon('search', 17)}<input placeholder="Search verifiers"></div>
  ${groups}
  <div class="vgroup">
    <div class="gtitle">Custom</div>
    <div class="gdesc">Point at any MCP server to verify a claim type.</div>
    <div class="vcustom">
      <span class="bolt">${icon('bolt', 22)}</span>
      <div style="flex:1">
        <h4>Add a custom MCP verifier</h4>
        <p>Paste an MCP endpoint and token, map it to a claim type, and it confirms automatically.</p>
      </div>
      <button class="btn">${icon('plus', 14)} Add</button>
    </div>
  </div>`;
}

/* ---------------- agent view (recall) ---------------- */
function recallView() {
  const r = state.recall;
  const claims = ((state.data && state.data.claims) || []).filter(inSpace);
  const keys = [...new Set(claims.flatMap((c) => Object.keys(c.scope || {})))].sort();
  Object.keys(r.scope).forEach((k) => { if (!keys.includes(k)) delete r.scope[k]; });
  const scopeSel = (key) => {
    const vals = [...new Set(claims.map((c) => c.scope && c.scope[key]).filter(Boolean))].sort();
    return `<label class="rcl-sel"><span class="rcl-sel-k">${esc(cap(key))}</span>
      <select data-scope="${esc(key)}"><option value="">Any</option>${vals.map((v) =>
        `<option value="${esc(v)}"${r.scope[key] === v ? ' selected' : ''}>${esc(v)}</option>`).join('')}</select></label>`;
  };
  return `
  <div class="page-head">
    <h1 class="page-title">Agent view</h1>
    <p class="page-sub">Exactly what an agent gets back when it calls <code>recall()</code> — only memory that has earned trust, plus warnings. Everything unproven or stale is withheld.</p>
  </div>
  <div class="rcl-bar">
    ${keys.map(scopeSel).join('')}
    <label class="rcl-sel rcl-q"><span class="rcl-sel-k">Query</span><input id="rcl-q" placeholder="optional keyword" value="${esc(r.query)}"></label>
  </div>
  <div class="rcl-call" id="rcl-call"></div>
  <div id="rcl-result" class="rcl-result"></div>`;
}

function recallCall() {
  const r = state.recall;
  const pairs = Object.entries(r.scope).filter(([, v]) => v).map(([k, v]) => `${k}: "${esc(v)}"`);
  const scopeStr = pairs.length ? `{ ${pairs.join(', ')} }` : '';
  const spaceStr = state.space !== 'all' ? `space="${esc(state.space)}"` : '';
  const args = [r.query ? `"${esc(r.query)}"` : '', scopeStr, spaceStr].filter(Boolean).join(', ');
  return `<span class="rcl-fn">recall</span><span class="rcl-punc">(</span>${args}<span class="rcl-punc">)</span>`;
}

function recallResult(res) {
  const trusted = res.trusted || [], warnings = res.warnings || [];
  const tItem = (t) => {
    const meta = [t.status, t.confidence && t.confidence !== 'none' ? `${t.confidence} confidence` : '',
      t.last_confirmed ? `confirmed ${t.last_confirmed}` : ''].filter(Boolean).map(esc).join(' · ');
    const sc = Object.values(t.scope || {}).map((v) => `<span class="label">${esc(v)}</span>`).join('');
    return `<a class="rcl-item ok" href="#/claim/${esc(t.id)}"><span class="rcl-ic">${icon('check', 16)}</span>
      <div class="rcl-itxt"><div class="rcl-claim">${esc(t.claim)}</div><div class="rcl-meta">${meta}${sc ? ` <span class="rcl-scope">${sc}</span>` : ''}</div></div></a>`;
  };
  const wItem = (w) => `<a class="rcl-item no" href="#/claim/${esc(w.id)}"><span class="rcl-ic">${icon('alert', 16)}</span>
    <div class="rcl-itxt"><div class="rcl-claim">${esc(w.do_not)}</div><div class="rcl-meta">${esc(w.why || '')}</div></div></a>`;
  return `
  <div class="rcl-summary">${icon('robot', 15)}<span>${esc(res.note || '')}</span></div>
  <div class="rcl-sec">
    <div class="rcl-sec-h ok">${icon('check', 14)} Trusted <span class="rcl-subtle">— the agent acts on these</span><span class="rcl-n">${trusted.length}</span></div>
    ${trusted.length ? `<div class="rcl-list">${trusted.map(tItem).join('')}</div>`
      : `<div class="rcl-empty">Nothing trusted in this scope yet.</div>`}
  </div>
  ${warnings.length ? `<div class="rcl-sec">
    <div class="rcl-sec-h no">${icon('alert', 14)} Warnings <span class="rcl-subtle">— the agent is told to avoid these</span><span class="rcl-n">${warnings.length}</span></div>
    <div class="rcl-list">${warnings.map(wItem).join('')}</div>
  </div>` : ''}
  <div class="rcl-withheld">${icon('lock', 14)} ${res.withheld_count || 0} withheld — unproven or stale. Agents never see these.</div>`;
}

async function runRecall() {
  const callEl = view.querySelector('#rcl-call');
  if (callEl) callEl.innerHTML = recallCall();
  const r = state.recall;
  let res;
  try {
    res = await (await fetch('/api/recall', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: r.query || null, scope: r.scope, space: state.space === 'all' ? null : state.space }),
    })).json();
  } catch (e) { res = { trusted: [], warnings: [], withheld_count: 0, note: 'recall failed' }; }
  const el = view.querySelector('#rcl-result');
  if (el) el.innerHTML = recallResult(res);
}

/* ---------------- claim detail ---------------- */
const railRow = (k, v) => v ? `<div class="rail-row"><span class="rail-k">${k}</span>${v}</div>` : '';

function claimView(id) {
  if (!state.data) return '';
  const c = (state.data.claims || []).find((x) => x.id === id);
  if (!c) return notFoundView(id);

  const st = effStatus(c);
  const s = STATUS[st] || STATUS.proposed;
  const proof = (c.evidence || []).find((e) => e.type === 'verifier' && e.query);
  const hasProof = !!proof;

  const warn = (st === 'disproven' || st === 'tested-failed')
    ? `<div class="cl-warn">${icon('alert', 15)} Tested and failed — kept so agents are warned before reusing it.</div>` : '';
  const disputed = c.disputed
    ? `<div class="cl-warn cl-disputed">${icon('alert', 15)}<span class="cl-warn-text">Disputed — a counter-read was flagged. Agents won't rely on this until it's re-verified or re-affirmed.</span><button class="btn" data-affirm="${c.id}">Re-affirm</button></div>` : '';
  const notes = c.notes
    ? `<div class="cl-notes">${c.notes.split(/\n\s*\n/).map((para) => `<p>${esc(para.replace(/\s*\n\s*/g, ' '))}</p>`).join('')}</div>` : '';

  const conf = c.confidence && c.confidence !== 'none' ? esc(c.confidence) : '';
  const tagKeys = [...new Set((state.data.claims || []).flatMap((x) => Object.keys(x.scope || {})))].sort();
  const tagChips = Object.entries(c.scope || {}).map(([k, v]) =>
    `<span class="tagchip"><span class="tagchip-k">${esc(cap(k))}</span><span class="tagchip-v">${esc(v)}</span><button class="tagchip-x" data-rmtag="${esc(c.id)}" data-k="${esc(k)}" aria-label="Remove ${esc(k)}">${icon('x', 11)}</button></span>`).join('');
  const tagEditor = `
    <div class="rail-tags">
      <span class="rail-k">Tags</span>
      <div class="tagedit">
        ${tagChips}
        <button class="tagadd" data-addtag="${esc(c.id)}" aria-label="Add tag">${icon('plus', 12)}</button>
        <span class="tagform" hidden>
          <input class="ti-k" list="cl-tagkeys" placeholder="key" aria-label="Tag key">
          <input class="ti-v" placeholder="value" aria-label="Tag value">
          <button class="tagsave" data-savetag="${esc(c.id)}" aria-label="Save tag">${icon('check', 13)}</button>
        </span>
      </div>
    </div>`;
  const decay = decayText(c);
  const verifiedBy = proof ? proofSrc(proof) : '';
  const spaces = (state.data && state.data.spaces) || [];
  const spOpt = (val, label, on) =>
    `<button class="sp-opt${on ? ' on' : ''}" data-spset="${esc(val)}"><span class="sp-check">${icon('check', 14)}</span>${esc(label)}</button>`;
  const spaceRow = `
    <div class="rail-row">
      <span class="rail-k">Space</span>
      <div class="spacepick" data-spacepick="${esc(c.id)}">
        <button class="sp-trigger" data-sptoggle><span class="sp-cur${c.space ? '' : ' muted'}">${c.space ? esc(c.space) : 'Unfiled'}</span>${icon('chevron', 13)}</button>
        <div class="sp-menu" hidden>
          ${spOpt('', 'Unfiled', !c.space)}
          ${spaces.map((sp) => spOpt(sp, sp, c.space === sp)).join('')}
          <div class="sp-div"></div>
          <button class="sp-new" data-spnew>${icon('plus', 12)} New space…</button>
          <div class="sp-newform" hidden>
            <input class="sp-newinput" placeholder="Name" aria-label="New space name">
            <button class="sp-newsave" aria-label="Create space">${icon('check', 13)}</button>
          </div>
        </div>
      </div>
    </div>`;

  let actions;
  if (st === 'proposed')
    actions = `<button class="btn primary" data-act="human-approved" data-id="${c.id}">Approve</button>
      <button class="btn" data-act="rejected" data-id="${c.id}">Reject</button>`;
  else if (st === 'stale')
    actions = `<button class="btn" data-act="tested-confirmed" data-id="${c.id}">${icon('refresh', 13)} Recheck</button>`;
  else
    actions = `<button class="btn" data-rerun="${c.id}">${icon('refresh', 13)} Re-verify</button>`;

  const rail = `
    <div class="rail-box">
      ${railRow('Status', `<span class="rail-status ${s.cls}">${icon(s.i, 14)} ${s.label}</span>`)}
      ${spaceRow}
      ${conf ? railRow('Confidence', `<span class="rail-v">${conf}</span>`) : ''}
      ${tagEditor}
      ${c.created ? railRow('Created', `<span class="rail-v mono">${esc(c.created)}</span>`) : ''}
      ${c.last_confirmed ? railRow('Last confirmed', `<span class="rail-v mono">${esc(c.last_confirmed)}</span>`) : ''}
      ${decay ? railRow('Decay', `<span class="rail-decay ${decay.cls}">${esc(decay.text)}</span>`) : ''}
      ${verifiedBy ? railRow('Verified by', `<span class="rail-v">${esc(verifiedBy)}</span>`) : ''}
      <div class="rail-actions">${actions}<div class="rc-status" id="rcs-${c.id}"></div></div>
    </div>
    <datalist id="cl-tagkeys">${tagKeys.map((k) => `<option value="${esc(k)}">`).join('')}</datalist>`;

  const nudge = (st === 'proposed' && !hasProof)
    ? `<div class="tl-nudge">Not verified yet — connect a verifier or approve it manually to make it trusted.</div>` : '';

  const related = (state.data.claims || []).filter((o) => o.id !== c.id).map((o) => ({
    o, shared: Object.keys(c.scope || {}).filter((k) => c.scope[k] && o.scope[k] === c.scope[k]),
  })).filter((x) => x.shared.length).sort((a, b) => b.shared.length - a.shared.length);
  const relatedHtml = related.length ? `
    <div class="cl-related">
      <div class="rel-head">Related memory</div>
      <p class="cl-related-sub">Claims that share this scope. If two of them disagree, that is a contradiction to resolve.</p>
      <div class="rel-list">${related.slice(0, 8).map(({ o, shared }) => {
        const rs = STATUS[effStatus(o)] || STATUS.proposed;
        const chips = shared.map((k) => `<span class="label">${esc(o.scope[k])}</span>`).join('');
        return `<a class="rel-item" href="#/claim/${esc(o.id)}"><span class="rel-ic ${rs.cls}">${icon(rs.i, 15)}</span><span class="rel-claim">${esc(o.claim)}</span>${o.disputed ? `<span class="disputed-flag">${icon('alert', 12)} Disputed</span>` : ''}<span class="rel-chips">${chips}</span></a>`;
      }).join('')}</div>
    </div>` : '';

  return `
  <nav class="crumb"><a href="#/memory">${icon('arrowleft', 14)} Memory</a><span class="crumb-sep">/</span><span class="crumb-id">${esc(c.id)}</span></nav>
  <div class="cl-grid">
    <div class="cl-head">
      <h1 class="cl-claim">${esc(c.claim)}</h1>
      <div class="cl-meta"><span class="cl-pill ${s.cls}">${icon(s.i, 14)} ${s.label}</span><span class="cl-why">${esc(whyLine(c))}</span></div>
      ${warn}
      ${disputed}
      ${notes}
    </div>
    <aside class="cl-rail">${rail}</aside>
    <div class="cl-body">
      <div class="cl-sec-title">Evidence</div>
      <div class="timeline">${timeline(c)}</div>
      ${nudge}
      ${addEvidenceBox(c)}
      ${relatedHtml}
      <div class="cl-danger">
        <button class="btn-del" data-delclaim="${esc(c.id)}">${icon('trash', 14)} Delete memory</button>
        <span class="cl-danger-hint">Removes the claim and its evidence.</span>
      </div>
    </div>
  </div>`;
}

function addEvidenceBox(c) {
  return `
  <div class="addev">
    <div class="addev-head">${icon('msg', 15)} Add evidence or context</div>
    <textarea id="ev-text" class="addev-text" placeholder="What you tested, saw, or already know — it's kept in this claim's trail."></textarea>
    <div class="addev-foot">
      <div class="seg" id="ev-kind" role="group" aria-label="Kind of note">
        <button class="seg-btn on" data-kind="context">Context</button>
        <button class="seg-btn" data-kind="supports">Supports</button>
        <button class="seg-btn" data-kind="disputes">Disputes</button>
      </div>
      <button class="btn primary" id="ev-add" data-id="${c.id}">Add evidence</button>
    </div>
  </div>`;
}

function notFoundView(id) {
  return `
  <div class="cl-empty">
    ${icon('search', 28)}
    <h2>Claim not found</h2>
    <p>No memory with id <span class="mono">${esc(id || '')}</span>.</p>
    <a class="btn" href="#/memory">${icon('arrowleft', 14)} Back to memory</a>
  </div>`;
}

function timeline(c) {
  const evs = c.evidence || [];
  if (!evs.length) return `<div class="tl-nudge">No events recorded yet.</div>`;
  return evs.map((e, i) => {
    const key = e.effect || e.status || e.type;
    const n = NODE[key] || NODE_DEF;
    const isProof = e.type === 'verifier' && e.query;
    const pid = 'pf-' + c.id + '-' + i;
    const src = e.source ? `<span class="tl-src">${esc(e.source)}</span>` : '';
    const by = e.by ? `<span class="tl-by">by ${esc(e.by)}</span>` : '';
    const proofHtml = isProof
      ? `<div class="tl-proof">${proofPanel(e, pid, { open: true })}</div>` : '';
    return `
    <div class="tl-node ${n.c}">
      <span class="tl-dot">${icon(n.i, 15)}</span>
      <div class="tl-body">
        <div class="tl-line">${src}<span class="tl-detail">${esc(e.detail || key)}</span>${by}<span class="tl-when">${esc(e.at || '')}</span></div>
        ${proofHtml}
      </div>
    </div>`;
  }).join('');
}

function whyLine(c) {
  const st = effStatus(c);
  const proof = (c.evidence || []).slice().reverse().find((e) => e.type === 'verifier' && e.query);
  const src = proof ? proofSrc(proof) : '';
  switch (st) {
    case 'verified': return src ? `Verified by ${src}` : 'Verified';
    case 'tested-confirmed': return 'Tested and confirmed';
    case 'human-approved': return 'Approved by you';
    case 'proposed': return c.proposed_by ? `Proposed by ${c.proposed_by} · awaiting your review` : 'Awaiting your review';
    case 'supported': return 'Supported by evidence, not yet verified';
    case 'stale': return 'Confidence expired — needs a re-test';
    case 'disproven':
    case 'tested-failed': return 'Tested and failed — kept as a warning';
    case 'rejected': return 'Rejected';
    default: return '';
  }
}

function decayText(c) {
  if (!['tested-confirmed', 'verified'].includes(c.status) || !c.expires) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const exp = new Date(c.expires + 'T00:00:00');
  const days = Math.round((exp - today) / 86400000);
  if (days > 14) return { cls: 'd-ok', text: `Fresh for ${days} more days` };
  if (days >= 0) return { cls: 'd-warn', text: days === 0 ? 'Expires today' : `Expires in ${days} day${days === 1 ? '' : 's'}` };
  const ago = -days;
  return { cls: 'd-bad', text: `Expired ${ago} day${ago === 1 ? '' : 's'} ago — needs a re-test` };
}

/* ---------------- interactions ---------------- */
function wire(route) {
  view.querySelectorAll('[data-filter]').forEach((b) =>
    b.onclick = () => { state.filter = b.dataset.filter; render(); });
  view.querySelectorAll('[data-act]').forEach((b) =>
    b.onclick = () => setStatus(b.dataset.id, b.dataset.act));
  view.querySelectorAll('[data-toggle]').forEach((b) =>
    b.onclick = () => {
      const el = view.querySelector('#' + b.dataset.toggle);
      if (el) { el.hidden = !el.hidden; b.classList.toggle('open', !el.hidden); }
    });
  view.querySelectorAll('[data-rerun]').forEach((b) =>
    b.onclick = () => rerun(b.dataset.rerun, b));
  view.querySelectorAll('[data-affirm]').forEach((b) =>
    b.onclick = () => resolveDispute(b.dataset.affirm));
  const sp = view.querySelector('.spacepick');
  if (sp) {
    const sid = sp.dataset.spacepick;
    const menu = sp.querySelector('.sp-menu');
    sp.querySelector('[data-sptoggle]').onclick = (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; };
    sp.querySelectorAll('[data-spset]').forEach((b) => b.onclick = () => setClaimSpace(sid, b.dataset.spset));
    const newBtn = sp.querySelector('[data-spnew]');
    const newForm = sp.querySelector('.sp-newform');
    const ni = newForm && newForm.querySelector('.sp-newinput');
    const saveNew = () => { const v = (ni.value || '').trim(); if (v) setClaimSpace(sid, v); };
    if (newBtn) newBtn.onclick = () => { newForm.hidden = false; newBtn.hidden = true; if (ni) ni.focus(); };
    const sv = newForm && newForm.querySelector('.sp-newsave');
    if (sv) sv.onclick = saveNew;
    if (ni) ni.onkeydown = (e) => { if (e.key === 'Enter') saveNew(); };
  }
  view.querySelectorAll('[data-spacedesc]').forEach((inp) =>
    inp.onchange = () => describeSpace(inp.dataset.spacedesc, inp.value.trim()));
  view.querySelectorAll('[data-rmtag]').forEach((b) =>
    b.onclick = () => removeTag(b.dataset.rmtag, b.dataset.k));
  view.querySelectorAll('[data-addtag]').forEach((b) =>
    b.onclick = () => {
      const form = b.parentElement.querySelector('.tagform');
      if (!form) return;
      form.hidden = false; b.hidden = true;
      const k = form.querySelector('.ti-k'); if (k) k.focus();
    });
  const saveTagFrom = (form, id) =>
    addTag(id, form.querySelector('.ti-k').value, form.querySelector('.ti-v').value);
  view.querySelectorAll('[data-savetag]').forEach((b) =>
    b.onclick = () => saveTagFrom(b.closest('.tagform'), b.dataset.savetag));
  view.querySelectorAll('.tagform .ti-v').forEach((inp) =>
    inp.onkeydown = (e) => {
      if (e.key === 'Enter') { const form = inp.closest('.tagform'); saveTagFrom(form, form.querySelector('.tagsave').dataset.savetag); }
    });
  const bulkSel = () => [...view.querySelectorAll('[data-bulksel]:checked')].map((x) => x.dataset.bulksel);
  const bulkSync = () => {
    const n = bulkSel().length;
    const count = view.querySelector('#bulk-count');
    if (count) count.textContent = `${n} selected`;
    ['#bulk-approve', '#bulk-reject'].forEach((sel) => {
      const b = view.querySelector(sel);
      if (b) b.disabled = n === 0;
    });
    const all = view.querySelector('#bulk-all');
    const boxes = view.querySelectorAll('[data-bulksel]');
    if (all) all.checked = n > 0 && n === boxes.length;
  };
  view.querySelectorAll('[data-bulksel]').forEach((x) => x.onchange = bulkSync);
  const bulkAll = view.querySelector('#bulk-all');
  if (bulkAll) bulkAll.onchange = () => {
    view.querySelectorAll('[data-bulksel]').forEach((x) => { x.checked = bulkAll.checked; });
    bulkSync();
  };
  const bulkApprove = view.querySelector('#bulk-approve');
  if (bulkApprove) bulkApprove.onclick = () => bulkStatus(bulkSel(), 'human-approved');
  const bulkReject = view.querySelector('#bulk-reject');
  if (bulkReject) bulkReject.onclick = () => bulkStatus(bulkSel(), 'rejected');
  view.querySelectorAll('[data-delclaim]').forEach((b) =>
    b.onclick = () => {
      if (b.dataset.armed) { deleteClaim(b.dataset.delclaim); return; }
      b.dataset.armed = '1'; b.classList.add('armed');
      b.innerHTML = `${icon('trash', 14)} Click again to confirm`;
      setTimeout(() => {
        if (b.dataset.armed && b.isConnected) {
          delete b.dataset.armed; b.classList.remove('armed');
          b.innerHTML = `${icon('trash', 14)} Delete memory`;
        }
      }, 3000);
    });
  const cap = view.querySelector('#capture');
  if (cap) cap.onkeydown = (e) => {
    if (e.key === 'Enter' && cap.value.trim()) propose(cap.value.trim());
  };
  const seg = view.querySelector('#ev-kind');
  if (seg) seg.querySelectorAll('.seg-btn').forEach((b) =>
    b.onclick = () => { seg.querySelectorAll('.seg-btn').forEach((x) => x.classList.remove('on')); b.classList.add('on'); });
  const evAdd = view.querySelector('#ev-add');
  if (evAdd) evAdd.onclick = () => addEvidence(evAdd.dataset.id);
  if (route === 'recall') {
    view.querySelectorAll('[data-scope]').forEach((s) =>
      s.onchange = () => { state.recall.scope[s.dataset.scope] = s.value; runRecall(); });
    const q = view.querySelector('#rcl-q');
    if (q) q.oninput = () => { state.recall.query = q.value.trim(); clearTimeout(window.__rq); window.__rq = setTimeout(runRecall, 220); };
    runRecall();
  }
}

async function bulkStatus(ids, status) {
  if (!ids.length) return;
  await fetch('/api/claims/bulk-status', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, status }),
  });
  await load();
}

async function setStatus(id, status) {
  await fetch(`/api/claims/${id}/status`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  await load();
}

async function propose(text) {
  await fetch('/api/claims', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claim: text, space: state.space === 'all' ? null : state.space }),
  });
  state.filter = 'proposed';
  await load();
}

async function resolveDispute(id) {
  await fetch(`/api/claims/${id}/resolve-dispute`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
  });
  await load();
}

async function setClaimSpace(id, space) {
  await fetch(`/api/claims/${id}/space`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ space }),
  });
  await load();
}

async function setTags(id, tags) {
  await fetch(`/api/claims/${id}/tags`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags }),
  });
  await load();
}

function removeTag(id, key) {
  const c = (state.data.claims || []).find((x) => x.id === id);
  if (!c) return;
  const tags = { ...c.scope }; delete tags[key];
  setTags(id, tags);
}

function addTag(id, key, value) {
  key = (key || '').trim(); value = (value || '').trim();
  if (!key || !value) return;
  const c = (state.data.claims || []).find((x) => x.id === id);
  if (!c) return;
  setTags(id, { ...c.scope, [key]: value });
}

async function deleteClaim(id) {
  await fetch(`/api/claims/${id}/delete`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
  });
  location.hash = '#/memory';
  await load();
}

async function describeSpace(space, desc) {
  await fetch('/api/spaces/describe', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ space, description: desc }),
  });
  await load();
}

async function addEvidence(id) {
  const ta = view.querySelector('#ev-text');
  const text = ta ? ta.value.trim() : '';
  if (!text) { if (ta) ta.focus(); return; }
  const kindBtn = view.querySelector('#ev-kind .seg-btn.on');
  const kind = kindBtn ? kindBtn.dataset.kind : 'context';
  const btn = view.querySelector('#ev-add');
  if (btn) btn.disabled = true;
  await fetch(`/api/claims/${id}/evidence`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, kind }),
  });
  await load();
}

async function rerun(id, btn) {
  const s = view.querySelector('#rcs-' + id);
  btn.disabled = true;
  if (s) s.innerHTML = `${icon('refresh', 13)} Re-running the same query…`;
  let r;
  try {
    r = await (await fetch(`/api/claims/${id}/verify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    })).json();
  } catch (e) { r = { outcome: 'error' }; }
  btn.disabled = false;
  if (!s) return;
  if (r.outcome === 'confirmed')
    s.innerHTML = `<span class="rc-ok">${icon('check', 13)} Re-ran just now — still matches</span>`;
  else if (r.outcome === 'refuted')
    s.innerHTML = `<span class="rc-bad">${icon('alert', 13)} Re-ran — the result changed; this claim should be disputed</span>`;
  else
    s.innerHTML = `<span class="rc-muted">${icon('robot', 13)} Can't re-fetch from the server (this source needs an agent or a paid API). Ask an agent to re-run.</span>`;
}

const gsearch = document.getElementById('globalsearch');
if (gsearch) gsearch.addEventListener('input', () => {
  state.query = gsearch.value.trim().toLowerCase();
  if ((location.hash.replace('#/', '') || 'memory') !== 'verifiers') render();
});
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    if (gsearch) gsearch.focus();
  }
});

document.addEventListener('click', (e) => {
  view.querySelectorAll('.sp-menu:not([hidden])').forEach((m) => {
    const pick = m.closest('.spacepick');
    if (pick && !pick.contains(e.target)) m.hidden = true;
  });
});

window.addEventListener('hashchange', render);
load();
