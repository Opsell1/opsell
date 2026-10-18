/* PROTOTYPE, throwaway. Corporate dashboards v2 for "Corporate dashboards" (Opsell1/opsell#29).
   Question: beyond the per-module views, what do Org Admin, Ops and HR see across Locations, over which
   ranges and comparisons, and how do they drill Organization -> Location -> Business Day?
   Home follows the decided anatomy (and the design system's SampleHome) in every variant; the variants
   disagree on the drill model:
     A  Pages: module sections, a Location page, a Business Day page, breadcrumbs.
     B  Scope (chosen direction): a switcher scopes Home and every section; Locations in the sidebar open a
        Location page with tabs (from A); a Business Day opens in a drawer.
     C  Board: Locations x Business Days on one canvas with a metric switcher; details open in a side pane.
   Switch with the bottom bar or the arrow keys; the variant rides in the URL hash (#A, #B, #C).
   Data is mock: the design system's demo figures for the last 14 Business Days, seeded history before. */
(function () {
  const O = window.Opsell, I = O.icon, F = O.fmt;

  /* ───────────── Mock data ───────────── */
  const N = 91, LAST = 90; // 13 weeks of Business Days, LAST = Fri, Oct 16 2026 (yesterday)
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dateOf = i => new Date(2026, 9, 16 - (LAST - i));
  const dTitle = i => { const d = dateOf(i); return `${WD[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}`; };
  const dCol = i => { const d = dateOf(i); return [WD[d.getDay()], d.getDate()]; };
  const dIso = i => { const d = dateOf(i); return `2026-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const ago = i => `${LAST + 1 - i}d`;
  const LOCS = O.LOCATIONS.map(l => l.id);
  const LN = id => O.loc(id).name;

  let seed = 20261017;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pick = a => a[Math.floor(rnd() * a.length)];

  // Last 14 Business Days, exactly as the design system's SampleHome shows them.
  const DEMO_SALES = { valencia: [10008, 9208, 7631, 7558, 8022, 8731, 7901, 9563, 9963, 7830, 7280, 8499, 8600, 8912], lake: [8408, 8365, 6461, 6460, 6622, 7151, 7505, 8977, 7622, 6392, 6751, 7278, 7160, 7640], court: [7716, 7089, 6104, 6305, 6603, 6755, 6197, 7575, 7100, 5854, 6042, 6634, 6350, 6980], mass: [6896, 6650, 5291, 5508, 5655, 5566, 6000, 6964, 6202, 5425, 5160, 5727, 6062, 6215], lamar: [9161, 8887, 7542, null, 7514, 7918, 8577, 10005, 9558, 7097, 7493, 7603, 8241, 8673] };
  const DEMO_LABOR = { valencia: [27.7, 27.3, 26.0, 26.5, 27.5, 27.8, 26.7, 27.0, 27.0, 26.6, 26.9, 27.5, 26.0, 27.1], lake: [26.1, 25.8, 26.3, 26.8, 26.4, 26.6, 25.1, 25.9, 26.0, 26.5, 25.5, 25.4, 26.1, 26.4], court: [27.6, 27.5, 28.5, 27.2, 28.5, 27.8, 27.3, 27.6, 28.4, 28.0, 27.9, 27.5, 27.8, 28.2], mass: [28.0, 28.4, 29.2, 28.0, 33.2, 33.6, 32.2, 33.2, 34.1, 33.7, 33.2, 33.1, 34.1, 33.4], lamar: [28.1, 28.2, 26.8, null, 27.2, 28.2, 25.8, 28.1, 28.0, 27.3, 27.6, 27.1, 27.1, 27.9] };
  const DAYPART = { valencia: [44, 31, 17, 8], lake: [47, 30, 16, 7], court: [39, 34, 18, 9], mass: [42, 33, 15, 10], lamar: [36, 35, 19, 10] };
  const CATS = { valencia: [38, 27, 16, 11, 8], lake: [35, 30, 15, 12, 8], court: [41, 24, 17, 10, 8], mass: [37, 26, 18, 11, 8], lamar: [33, 28, 20, 10, 9] };
  const DAYPART_KEYS = ['Breakfast', 'Lunch', 'Afternoon', 'Evening'], CAT_KEYS = ['Coffee & drinks', 'Pastry', 'Bread', 'Savory', 'Catering'];
  const LABOR_BASE = { valencia: 27.0, lake: 26.0, court: 27.8, mass: 28.3, lamar: 27.4 };
  const CHECK = { valencia: 11.6, lake: 11.2, court: 11.7, mass: 11.3, lamar: 11.2 };
  const STAFF = { valencia: ['Ana Torres', 'Sam Okafor'], lake: ['Lena Park', 'Tom Becker'], court: ['Andre Lewis', 'Rosa Diaz'], mass: ['Jordan Reyes', 'Hannah Cole'], lamar: ['Chris Nguyen', 'Tasha Brooks'] };
  const CREW = ['Devin Shaw', 'Ivy Chen', 'Sofia Rossi', 'Priya Natarajan', 'Eli Ortiz', 'Grace Huang', 'Ben Carter', 'Kara Jensen', 'Maya Kim', 'Nora Bell', 'Omar Haddad', 'Theo Grant', 'Jamal Price', 'Zoe Adams', 'Marco Silva', 'Aisha Bello', 'Leo Martins', 'Luis Romero', 'Ryan Walsh', 'Mia Lopez']; // four per Location, in LOCATIONS order
  const POSITIONS = ['Baker', 'Barista', 'Cashier', 'Line cook', 'Dishwasher'];

  const D = {}; // D[loc][i] = one Business Day at one Location
  LOCS.forEach(l => {
    const wd = {}; DEMO_SALES[l].forEach((v, k) => { if (v != null) { const w = dateOf(77 + k).getDay(); (wd[w] = wd[w] || []).push(v); } });
    D[l] = [];
    for (let i = 0; i < N; i++) {
      const w = dateOf(i).getDay(), k = i - 77;
      let sales, labor;
      if (k >= 0) { sales = DEMO_SALES[l][k]; labor = DEMO_LABOR[l][k]; }
      else { const m = wd[w].reduce((a, b) => a + b, 0) / wd[w].length; sales = Math.round(m * (1 - (77 - i) * 0.0011) * (1 + (rnd() - 0.5) * 0.1)); labor = +(LABOR_BASE[l] + (rnd() - 0.5) * 1.4).toFixed(1); }
      if (sales == null) { D[l].push({ closed: true, sales: null, labor: null, cost: 0, ot: 0, orders: 0, card: 0, jar: 0, hours: 0 }); continue; }
      const cost = Math.round(sales * labor / 100);
      const ot = +(l === 'mass' && i >= 81 ? 1.4 + rnd() * 1.4 : 0.4 + rnd() * 1.6).toFixed(1);
      const card = Math.round(sales * (0.10 + rnd() * 0.012)), jar = Math.round(sales * (0.018 + rnd() * 0.006));
      const jit = a => { const p = a.map(v => v * (1 + (rnd() - 0.5) * 0.12)), t = p.reduce((x, y) => x + y, 0); return p.map(v => Math.round(sales * v / t)); };
      D[l].push({ sales, labor, cost, ot, orders: Math.round(sales / (CHECK[l] + (rnd() - 0.5) * 0.6)), card, jar, hours: Math.round(cost / 19.5), daypart: jit(DAYPART[l]), cats: jit(CATS[l]) });
    }
  });
  D.mass[88].ot = 2.5; D.mass[89].ot = 2.6; D.mass[90].ot = 2.5;

  // Closing Report and Tip Distribution states per Location per Business Day
  LOCS.forEach(l => D[l].forEach((d, i) => {
    const r = rnd();
    d.cr = d.closed ? 'closed' : i === LAST ? (l === 'court' || l === 'mass' ? 'draft' : 'submitted') : r < 0.06 ? 'late' : r < 0.09 ? 'amended' : 'submitted';
    d.tip = d.closed ? 'noPool' : i === LAST ? 'draft' : 'finalized';
    d.author = STAFF[l][rnd() < 0.6 ? 0 : 1];
    d.at = d.cr === 'late' ? `1${Math.floor(rnd() * 2)}:${String(10 + Math.floor(rnd() * 49))}` : `0${7 + Math.floor(rnd() * 2)}:${String(10 + Math.floor(rnd() * 49))}`;
  }));
  D.court[86].cr = 'overdue'; D.court[88].cr = 'overdue'; D.mass[89].cr = 'late'; D.mass[89].at = '11:42'; D.lake[85].cr = 'amended'; D.lamar[86].tip = 'reopened';
  D.lake[87].author = 'Lena Park'; D.court[87].author = 'Andre Lewis'; D.mass[90].author = 'Jordan Reyes'; D.mass[88].author = 'Jordan Reyes';
  D.valencia[90].at = '07:58'; D.lake[90].at = '08:21'; D.lamar[90].at = '08:05';

  const NOTE_LIB = {
    Staffing: ['Ran one short on the line from 11 to 2; Manager covered the register.', 'New barista shadowed the morning shift.', 'Two call-outs covered by swaps, no overtime.', 'Fully staffed. Training on the new espresso grinder for the AM crew.', ''],
    Guests: ['Large school group at 3 pm, 40 covers in 20 minutes.', 'One complaint about wait time at peak; comped a pastry.', 'Steady day, no issues.', 'Catering pickup for 60 left on time.', ''],
    'Facility & Equipment': ['Walk-in running warm at close, logged 41°F; tech booked for 7 am.', 'Dish machine slow to heat in the morning.', '', '', 'Front door closer sticking; placed a work order.'],
    'Product & Inventory': ['Sold out of morning buns by 10:30; adding a second bake.', 'Waste on sourdough higher than usual, 14 loaves.', 'Oat milk delivery short by 2 cases.', '', 'Croissant lamination ran late; first tray out at 7:10.'],
    Other: ['', '', 'Fire inspection passed.', '', 'Deposit dropped at 4:40 pm.']
  };
  const SECTIONS = Object.keys(NOTE_LIB);
  const SPECIAL_NOTES = {
    'mass-88': { Staffing: 'Two bakers stayed late for a catering order; 8 dozen croissants for MIT. 2.5 h overtime.' },
    'lake-87': { 'Facility & Equipment': 'Eli Ortiz burned his forearm on the deck oven during the 6 am bake. First aid on site, sent to urgent care, back on Thursday.' },
    'mass-90': { Staffing: 'Jamal Price 40 min late, third time this month. Overtime again on bake: 2.5 h.' },
    'court-87': { Other: 'Register 2 short $38 at close; recounted twice. Nora Bell on that drawer.' }
  };
  const notesFor = (l, i) => { let s = l.length * 31 + i * 7; const o = {}; SECTIONS.forEach((k, j) => { o[k] = NOTE_LIB[k][(s + j * 3) % NOTE_LIB[k].length]; }); return Object.assign(o, SPECIAL_NOTES[`${l}-${i}`] || {}); };

  // HR Flags: four open (one urgent), history resolved
  const HR_CATS = ['Attendance', 'No-call no-show', 'Conduct', 'Policy violation', 'Cash handling', 'Food safety', 'Workplace injury', 'Harassment or discrimination complaint', 'Other'];
  const FLAGS = [
    { id: 'F-212', cat: 'Workplace injury', emp: 'Eli Ortiz', loc: 'lake', day: 87, state: 'urgent', source: 'Closing Report', by: 'Lena Park', text: 'Burned forearm on the deck oven during the 6 am bake.' },
    { id: 'F-214', cat: 'Attendance', emp: 'Jamal Price', loc: 'mass', day: 90, state: 'open', source: 'Closing Report', by: 'Jordan Reyes', text: '40 min late, third time this month.' },
    { id: 'F-213', cat: 'No-call no-show', emp: 'Devin Shaw', loc: 'valencia', day: 88, state: 'open', source: 'Standalone', by: 'Ana Torres', text: 'Did not show for the 6 am shift, no call.' },
    { id: 'F-211', cat: 'Cash handling', emp: 'Nora Bell', loc: 'court', day: 87, state: 'open', source: 'Closing Report', by: 'Andre Lewis', text: 'Register 2 short $38 at close.' }
  ];
  for (let k = 0; k < 22; k++) {
    const day = Math.floor(rnd() * 80), l = pick(LOCS);
    FLAGS.push({ id: `F-${190 - k}`, cat: pick(['Attendance', 'Attendance', 'No-call no-show', 'Conduct', 'Policy violation', 'Cash handling', 'Food safety', 'Other']), emp: CREW[LOCS.indexOf(l) * 4 + Math.floor(rnd() * 4)], loc: l, day, state: 'resolved', resolved: Math.min(LAST, day + 1 + Math.floor(rnd() * 6)), source: rnd() < 0.7 ? 'Closing Report' : 'Standalone', by: STAFF[l][0], outcome: pick(['Coached', 'Write-up issued', 'No action', 'Coached']) });
  }
  const WRITEUPS = [
    { id: 'W-88', emp: 'Maya Kim', loc: 'court', level: 'Final', cat: 'Attendance', day: 88, state: 'awaiting', by: 'Andre Lewis' },
    { id: 'W-87', emp: 'Devin Shaw', loc: 'valencia', level: 'Written', cat: 'No-call no-show', day: 88, state: 'ready', by: 'Ana Torres' },
    { id: 'W-84', emp: 'Jamal Price', loc: 'mass', level: 'Written', cat: 'Attendance', day: 74, state: 'refused', by: 'Jordan Reyes', rebuttal: true },
    { id: 'W-85', emp: 'Leo Martins', loc: 'lamar', level: 'Verbal', cat: 'Conduct', day: 80, state: 'signed', by: 'Chris Nguyen' },
    { id: 'W-83', emp: 'Grace Huang', loc: 'lake', level: 'Written', cat: 'Food safety', day: 69, state: 'signed', by: 'Lena Park', rebuttal: true },
    { id: 'W-80', emp: 'Omar Haddad', loc: 'court', level: 'Verbal', cat: 'Cash handling', day: 55, state: 'signed', by: 'Rosa Diaz' },
    { id: 'W-78', emp: 'Ivy Chen', loc: 'valencia', level: 'Written', cat: 'Policy violation', day: 41, state: 'voided', by: 'Sam Okafor' },
    { id: 'W-76', emp: 'Marco Silva', loc: 'mass', level: 'Suspension', cat: 'Conduct', day: 30, state: 'signed', by: 'Jordan Reyes' }
  ];

  /* ───────────── Settings, ranges, aggregates ───────────── */
  const PERSONAS = { admin: { name: 'Dana Whitfield', first: 'Dana', title: 'Org Admin' }, ops: { name: 'Marcus Lee', first: 'Marcus', title: 'Ops' }, hr: { name: 'Priya Shah', first: 'Priya', title: 'HR' } };
  const OVER = 2; // labor % this many points over target counts as an exception (open question: per Organization?)
  const ORG_TARGET = 27, LOC_TARGET = { valencia: 27, lake: 26, court: 28, mass: 30, lamar: 26 };
  const RANGES = { yesterday: ['Yesterday', 1], '7d': ['7 days', 7], '28d': ['28 days', 28], '13w': ['13 weeks', 91] };
  const COMPARES = { wow: 'Same weekday last week', prior: 'Prior period', yoy: 'Same period last year' };

  const S = {
    variant: 'A', role: 'admin', page: 'home', loc: null, day: null, tab: 'overview', range: 'yesterday', compare: 'wow',
    scope: 'all', drawer: null, metric: 'cr', paneKind: null, paneLoc: null, paneDay: null, scopeOpen: false, pop: false, navOpen: false,
    opsDiscipline: false, hrSales: true, perLocTarget: true // decided on Corporate dashboards: HR sees Sales & Labor, each Location has its own labor target
  };
  const target = l => S.perLocTarget && l ? LOC_TARGET[l] : ORG_TARGET;
  // Across Locations the target is the sales-weighted blend of each Location's target.
  const blendTarget = (locs, idx) => { if (!S.perLocTarget) return ORG_TARGET; let s = 0, w = 0; locs.forEach(l => idx.forEach(i => { const d = D[l][i]; if (d && !d.closed) { s += d.sales; w += d.sales * target(l); } })); return s ? +(w / s).toFixed(1) : ORG_TARGET; };
  const idxRange = () => { const n = RANGES[S.range][1]; return Array.from({ length: n }, (_, k) => LAST - n + 1 + k); };
  const shift = () => S.compare === 'wow' ? 7 : S.compare === 'prior' ? RANGES[S.range][1] : 364;
  const cmpAvailable = c => c === 'wow' ? S.range !== '13w' || true : c === 'prior' ? S.range !== '13w' : false;
  const agg = (locs, idx) => {
    let sales = 0, cost = 0, ot = 0, orders = 0, card = 0, jar = 0, hours = 0, n = 0;
    idx.forEach(i => { if (i < 0) return; locs.forEach(l => { const d = D[l][i]; if (d.closed) return; sales += d.sales; cost += d.cost; ot += d.ot; orders += d.orders; card += d.card; jar += d.jar; hours += d.hours; n++; }); });
    return { sales, cost, ot, orders, card, jar, hours, n, labor: sales ? cost / sales * 100 : null, check: orders ? sales / orders : null, tips: card + jar };
  };
  const cmpIdx = idx => idx.map(i => i - shift());
  const hasCmp = idx => S.compare !== 'yoy' && cmpIdx(idx)[0] >= 0;
  const orgDay = (i, locs) => { let s = 0, any = false; (locs || LOCS).forEach(l => { const d = D[l][i]; if (d && !d.closed) { s += d.sales; any = true; } }); return any ? s : null; };
  const orgLaborDay = (i, locs) => { const a = agg(locs || LOCS, [i]); return a.labor == null ? null : +a.labor.toFixed(1); };
  const pctChange = (a, b) => b ? (a / b - 1) * 100 : null;
  const scopeLocs = () => S.variant === 'B' && S.scope !== 'all' ? [S.scope] : LOCS;

  /* ───────────── Role rules ───────────── */
  const seesDiscipline = () => S.role !== 'ops' || S.opsDiscipline;
  const seesSales = () => S.role !== 'hr' || S.hrSales;
  const visibleFlags = () => seesDiscipline() ? FLAGS : [];
  const visibleWriteups = () => seesDiscipline() ? WRITEUPS : [];

  function attention(locs) {
    locs = locs || LOCS;
    const items = [];
    FLAGS.filter(f => f.state !== 'resolved').forEach(f => { if (seesDiscipline()) items.push({ sev: f.state === 'urgent' ? 0 : 2, tile: ['hrFlag', f.state], title: f.state === 'urgent' ? f.cat : `${f.cat} · HR Flag open`, detail: `${f.emp} · ${f.text}`, loc: f.loc, day: f.day, go: { page: 'flags' } }); });
    LOCS.forEach(l => D[l].forEach((d, i) => { if (d.cr === 'overdue') items.push({ sev: 1, tile: ['closingReport', 'overdue'], title: 'Closing Report overdue', detail: dTitle(i), loc: l, day: i, go: { day: i, loc: l } }); }));
    LOCS.forEach(l => { const last = D[l][LAST]; if (last.labor > target(l) + OVER) { let k = 0; for (let i = LAST; i >= 0 && D[l][i].labor > target(l) + OVER; i--) k++; const ot = agg([l], idxRange().length > 1 ? idxRange() : Array.from({ length: k }, (_, j) => LAST - j)).ot; items.push({ sev: 2, tile: ['severity', 'warning'], title: `Labor ${F.pct(last.labor)} vs ${target(l)}% target`, detail: `Over target ${k} days · overtime ${ot.toFixed(1)} h`, loc: l, day: LAST - k + 1, go: { page: 'sales', loc: l } }); } });
    LOCS.forEach(l => D[l].forEach((d, i) => { if (d.tip === 'reopened') items.push({ sev: 2, tile: ['tipDistribution', 'reopened'], title: 'Tip Distribution reopened', detail: `${dTitle(i)} · by Marcus Lee`, loc: l, day: i, go: { page: 'tips', loc: l } }); }));
    if (seesDiscipline()) WRITEUPS.forEach(w => { if (w.state === 'awaiting') items.push({ sev: 2, tile: ['writeUp', 'awaiting'], title: `${w.level} Write-up awaiting HR approval`, detail: w.emp, loc: w.loc, day: w.day, go: { page: 'writeups' } }); if (w.state === 'refused') items.push({ sev: 3, tile: ['writeUp', 'refused'], title: 'Write-up refused · Rebuttal attached', detail: `${w.emp} · ${w.level}`, loc: w.loc, day: w.day, go: { page: 'writeups' } }); });
    items.push({ sev: 4, tile: ['dataQuality', 'unapprovedTimesheets'], title: 'Unapproved timesheets', detail: `6 shifts · ${dTitle(89)}`, loc: 'mass', day: 89, go: { page: 'sales', loc: 'mass' } });
    LOCS.forEach(l => D[l].forEach((d, i) => { if (d.cr === 'amended' && i > LAST - 7) items.push({ sev: 5, tile: ['closingReport', 'amended'], title: 'Closing Report amended', detail: `${dTitle(i)} · by ${d.author}`, loc: l, day: i, go: { day: i, loc: l } }); }));
    let out = items.filter(x => locs.includes(x.loc));
    if (S.role === 'hr') out = out.filter(x => ['hrFlag', 'writeUp'].includes(x.tile[0]));
    return out.sort((a, b) => a.sev - b.sev || a.day - b.day);
  }

  /* ───────────── HTML helpers ───────────── */
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const go = patch => `data-go="${esc(JSON.stringify(patch))}"`;
  const post = []; const after = fn => post.push(fn);
  let uid = 0; const cid = p => `${p}${++uid}`;
  const glyphKey = l => O.seriesKey(O.loc(l).color, O.loc(l).glyph);
  const delta = (v, unit, tone, invert) => v == null ? '<span class="op-delta">—</span>' : `<span class="op-delta"${tone ? ` data-tone="${tone}"` : ''}>${I(v >= 0 ? 'arrow-up' : 'arrow-down', 12)}${F.delta(Math.abs(v), unit).replace(/^[+−±]/, '')}</span>`;
  const cmpLabel = () => S.compare === 'wow' ? (S.range === 'yesterday' ? `vs last ${dTitle(LAST).slice(0, 3)}` : 'vs same weekdays last week') : S.compare === 'prior' ? 'vs prior period' : 'vs last year';
  const rangeTitle = () => { const idx = idxRange(); return idx.length === 1 ? dTitle(LAST) : `${dTitle(idx[0])} – ${dTitle(LAST)}`; };

  function kpi(icon, label, num, unit, viz, foot, patch) {
    return `<a class="op-card op-kpi" ${patch ? go(patch) : ''}><span class="op-kpi-h">${I(icon, 16)}${label}${patch ? `<span class="go">${I('arrow-right', 14)}</span>` : ''}</span><span class="op-kpi-v"><span class="op-kpi-n">${num}${unit ? `<small>${unit}</small>` : ''}</span>${viz || ''}</span><span class="op-kpi-f">${foot}</span></a>`;
  }
  const sparkOf = (vals, o) => { const v = vals.filter(x => x != null); return v.length > 1 ? O.spark(v, Object.assign({ width: 96 }, o || {})) : ''; };
  function chartCard(title, sub, draw, extra) {
    const id = cid('c'); after(() => { const el = document.getElementById(id); if (el) draw(el); });
    return `<div class="op-card chart-card"><div class="hd"><div><b class="h3">${title}</b><span class="sub">${sub}</span></div>${extra || ''}</div><div id="${id}"></div></div>`;
  }
  function attnCard(items, max, title) {
    const rows = items.slice(0, max);
    return `<div class="op-card" style="overflow:hidden"><div class="cardh"><span class="t"><b class="h3">${title || 'Needs attention'}</b><span class="op-count">${items.length}</span></span>${items.length > max ? '<a class="op-btn op-btn--ghost op-btn--sm">View all</a>' : ''}</div>
      ${rows.length ? rows.map(r => `<a class="op-row" ${go(r.go)}>${O.tile(r.tile[0], r.tile[1])}<span class="t"><b>${r.title}</b><span>${esc(r.detail)}</span></span>${O.locTag(LN(r.loc))}<span class="age">${ago(r.day)}</span>${I('chevron-right', 16)}</a>`).join('') : `<div class="empty-note">Nothing needs attention.</div>`}</div>`;
  }
  function rangeCtl(opts) {
    opts = opts || {};
    const seg = `<div class="op-seg">${Object.entries(RANGES).map(([k, v]) => `<button aria-pressed="${S.range === k}" ${go({ range: k, compare: k === '13w' && S.compare === 'prior' ? 'wow' : S.compare })}>${v[0]}</button>`).join('')}</div>`;
    if (opts.noCompare) return seg;
    const sel = `<label class="op-compare">vs <select id="cmp-${S.variant}" data-set="compare" style="all:unset;font-weight:500;color:var(--text-primary);cursor:pointer">${Object.entries(COMPARES).map(([k, v]) => `<option value="${k}" ${S.compare === k ? 'selected' : ''} ${cmpAvailable(k) ? '' : 'disabled'}>${v}${k === 'yoy' ? ' (needs a year of history)' : k === 'prior' && S.range === '13w' ? ' (needs 26 weeks)' : ''}</option>`).join('')}</select></label>`;
    return seg + sel;
  }
  function pageHead(title, scope, acts, pre) {
    return `<div class="op-pagehead"><div class="ttl">${pre || ''}<h1>${title}</h1><span class="scope">${scope.join('<span class="dot"></span>')}</span></div><div class="acts">${acts || ''}</div></div>`;
  }
  const crumbs = parts => `<nav class="op-crumbs">${parts.map((p, k) => k === parts.length - 1 ? `<span aria-current="page">${p[0]}</span>` : `<a ${go(p[1])}>${p[0]}</a>${I('chevron-right', 12)}`).join('')}</nav>`;

  /* ───────────── Shell ───────────── */
  function nav(current, items) {
    const locs = scopeLocs(), open = FLAGS.filter(f => f.state !== 'resolved' && locs.includes(f.loc));
    const counts = { reports: [String(locs.reduce((s, l) => s + D[l].filter((d, i) => i > LAST - 14 && (d.cr === 'draft' || d.cr === 'overdue')).length, 0))], flags: [String(open.length), open.some(f => f.state === 'urgent') ? 'u' : ''], writeups: [String(WRITEUPS.filter(w => w.state === 'awaiting' && locs.includes(w.loc)).length)], tips: [String(locs.filter(l => D[l].some(d => d.tip === 'reopened')).length)] };
    Object.keys(counts).forEach(k => { if (counts[k][0] === '0') delete counts[k]; });
    const cnt = c => c ? `<span class="op-count${c[1] === 'u' ? ' op-count--urgent' : ''}">${c[0]}</span>` : '';
    const p = PERSONAS[S.role];
    return `<nav class="op-sidebar"><div class="op-org"><img src="opsell-app-icon.svg" width="24" height="24" alt=""><b>Larkspur Bakehouse</b><span class="op-demo-tag">DEMO</span></div>` +
      items.map(([g, list]) => (g ? `<div class="op-nav-group">${g}</div>` : '') + list.map(([key, ic, label]) => `<a class="op-nav-item" ${key === current ? 'aria-current="page"' : ''} ${go({ page: key, loc: null, day: null, tab: 'overview', paneKind: null })}>${I(ic, 20)}<span>${label}</span>${cnt(counts[key])}</a>`).join('')).join('') +
      `<div class="op-user">${O.avatar(p.name, 28)}<span class="who"><b>${p.name}</b><span>${p.title}</span></span>${I('chevrons-up-down', 16)}</div></nav>`;
  }
  function navItems(variant) {
    const ops = [['reports', 'clipboard-check', 'Closing Reports']]; if (seesSales()) ops.push(['sales', 'chart-column', 'Sales & Labor']);
    const people = []; if (seesDiscipline()) people.push(['flags', 'flag', 'HR Flags'], ['writeups', 'file-pen-line', 'Write-ups']); people.push(['employees', 'users', 'Employees']);
    const tips = S.role === 'hr' ? [] : [['tips', 'hand-coins', 'Tip Distribution']];
    const org = variant !== 'C' ? [['locations', 'store', 'Locations']] : []; if (S.role === 'admin') org.push(['settings', 'settings', 'Settings']);
    const groups = [[null, [['home', 'house', 'Home']]]];
    if (variant === 'C') groups.push(['Operations', [['board', 'chart-column', 'Board']]]); else groups.push(['Operations', ops]);
    groups.push(['People', people]); if (tips.length) groups.push(['Payroll', tips]); if (org.length) groups.push(['Organization', org]);
    return groups;
  }
  function topbar(crumbHtml, extra) {
    return `<div class="op-topbar"><button class="op-btn op-btn--ghost op-icon-btn menu-btn" data-act="nav" aria-label="Open navigation">${I('menu', 20)}</button>${extra || ''}${crumbHtml}<div class="topacts"><div class="op-cmdk">${I('search', 16)}<span>Search Locations, Employees…</span><span class="op-kbd">⌘K</span></div><button class="op-btn op-btn--ghost op-icon-btn op-bell" aria-label="Notifications">${I('bell', 20)}<span class="op-count op-count--accent">3</span></button></div></div>`;
  }

  /* ───────────── Home (decided anatomy, filled per Role) ───────────── */
  function home(locs, onLoc) {
    const p = PERSONAS[S.role], idx = idxRange(), cIdx = cmpIdx(idx), a = agg(locs, idx), c = hasCmp(idx) ? agg(locs, cIdx) : null;
    const spIdx = Array.from({ length: 14 }, (_, k) => LAST - 13 + k);
    const scopeName = locs.length === 1 ? LN(locs[0]) : `${locs.length} Locations`;
    const tgt = locs.length === 1 ? target(locs[0]) : blendTarget(locs, idx);
    const inCount = locs.filter(l => ['submitted', 'late', 'amended'].includes(D[l][LAST].cr)).length;
    const cells = `<span style="display:flex;gap:4px">${locs.map(l => O.cell('closingReport', D[l][LAST].cr, { size: 'sm', title: `${LN(l)} · ${O.STATUS.closingReport[D[l][LAST].cr].label}` })).join('')}</span>`;
    const openFlags = FLAGS.filter(f => f.state !== 'resolved' && locs.includes(f.loc));
    const salesK = kpi('chart-column', 'Net sales', F.money(a.sales), '', sparkOf(spIdx.map(i => orgDay(i, locs)), { compare: spIdx.map(i => orgDay(i - 7, locs)) }), `${delta(c && pctChange(a.sales, c.sales), '%', 'done')}<span>${cmpLabel()}</span>`, { page: 'sales' });
    const laborK = kpi('timer', 'Labor % of sales', a.labor.toFixed(1), '%', sparkOf(spIdx.map(i => orgLaborDay(i, locs)), { color: a.labor > tgt ? 'var(--warning-text)' : undefined }), `${delta(c && a.labor - c.labor, 'pts', a.labor > tgt ? 'warning' : null)}<span>${cmpLabel()} · target ${tgt}%</span>`, { page: 'sales' });
    const crK = kpi('clipboard-check', 'Closing Reports in', String(inCount), `of ${locs.length}`, `<span style="display:grid;gap:4px;justify-items:end">${cells}</span>`, `<span>${dTitle(LAST)} · ${locs.length - inCount ? `${locs.length - inCount} due 10:00` : 'all in'}</span>`, { page: 'reports' });
    const flagK = kpi('flag', 'Open HR Flags', String(openFlags.length), '', sparkOf([2, 2, 3, 3, 2, 3, 4, 4, 3, 3, 4, 4, 4, openFlags.length].slice(-14)), openFlags.some(f => f.state === 'urgent') ? O.chip('hrFlag', 'urgent', { size: 'sm', label: '1 urgent' }) : '<span>none urgent</span>', { page: 'flags' });
    const otK = kpi('timer', 'Overtime', a.ot.toFixed(1), 'h', sparkOf(spIdx.map(i => agg(locs, [i]).ot)), `${delta(c && pctChange(a.ot, c.ot), '%', c && a.ot > c.ot * 1.1 ? 'warning' : null)}<span>${cmpLabel()}</span>`, { page: 'sales' });
    const wAwait = WRITEUPS.filter(w => w.state === 'awaiting' && locs.includes(w.loc)).length, wReady = WRITEUPS.filter(w => w.state === 'ready' && locs.includes(w.loc)).length;
    const awaitK = kpi('file-pen-line', 'Awaiting HR approval', String(wAwait), '', '', `<span>Write-ups · ${wReady} ready to deliver</span>`, { page: 'writeups' });
    const resolved30 = FLAGS.filter(f => f.state === 'resolved' && f.resolved > LAST - 28 && locs.includes(f.loc));
    const resK = kpi('circle-check', 'HR Flags resolved', String(resolved30.length), '', '', `<span>last 28 days · median ${resolved30.length ? Math.round(resolved30.map(f => f.resolved - f.day).sort((x, y) => x - y)[Math.floor(resolved30.length / 2)]) : 0}d to resolve</span>`, { page: 'flags' });
    let kpis, charts;
    const salesChart = () => chartCard('Net sales', `Last 14 Business Days · dashed = same weekday, week before`, el => O.charts.line(el, { labels: spIdx.map(i => String(dCol(i)[1])), tipLabels: spIdx.map(dTitle), height: 168, legend: false, yFormat: v => F.money(v, { compact: true }), pendingFrom: 13, pendingLabel: locs.some(l => D[l][LAST].cr === 'draft') ? 'Drafts until 10:00' : '', series: [{ name: 'Net sales', values: spIdx.map(i => orgDay(i, locs)), color: 'var(--chart-current)', area: true }, { name: 'Week before', values: spIdx.map(i => orgDay(i - 7, locs)), color: 'var(--chart-prior)', dashed: true }], onClick: i => onLoc(null, spIdx[i]) }));
    const laborChart = () => locs.length > 1
      ? chartCard('Labor % by Location', `${rangeTitle()} · ${S.perLocTarget ? 'per-Location targets' : `target ${ORG_TARGET}%`}`, el => O.charts.hbar(el, { target: S.perLocTarget ? undefined : ORG_TARGET, targetLabel: `Target ${ORG_TARGET}%`, max: 36, labelWidth: 96, valueName: 'Labor %', rows: locs.map(l => { const v = agg([l], idx).labor; return { label: LN(l), id: l, value: +v.toFixed(1), tone: v > target(l) + OVER ? 'warning' : null, extra: S.perLocTarget ? [{ name: 'Target', value: target(l) + '%' }] : [] }; }), onClick: r => onLoc(r.id) }))
      : chartCard('Labor % by Business Day', `Last 14 Business Days · target ${tgt}%`, el => O.charts.line(el, { labels: spIdx.map(i => String(dCol(i)[1])), tipLabels: spIdx.map(dTitle), height: 168, legend: false, target: tgt, yFormat: v => F.pct(v, 0), series: [{ name: 'Labor %', values: spIdx.map(i => orgLaborDay(i, locs)), color: 'var(--chart-current)' }], onClick: i => onLoc(locs[0], spIdx[i]) }));
    if (S.role === 'hr') {
      kpis = [flagK, awaitK, resK, crK];
      const weeks = Array.from({ length: 13 }, (_, w) => w);
      charts = [chartCard('HR Flags opened and resolved', 'By week, last 13 weeks', el => O.charts.line(el, { labels: weeks.map(w => MON[dateOf(w * 7).getMonth()] + ' ' + dCol(w * 7)[1]), height: 168, zero: true, yFormat: v => Math.round(v), series: [{ name: 'Opened', values: weeks.map(w => FLAGS.filter(f => locs.includes(f.loc) && Math.floor(f.day / 7) === w).length), color: 'var(--chart-current)' }, { name: 'Resolved', values: weeks.map(w => FLAGS.filter(f => locs.includes(f.loc) && f.resolved != null && Math.floor(f.resolved / 7) === w).length), color: 'var(--chart-prior)', dashed: true }] })),
        locs.length > 1 ? chartCard('Open HR Flags by Location', 'Today', el => O.charts.hbar(el, { labelWidth: 96, format: v => String(v), valueName: 'Open', rows: locs.map(l => ({ label: LN(l), id: l, value: FLAGS.filter(f => f.loc === l && f.state !== 'resolved').length, tone: FLAGS.some(f => f.loc === l && f.state === 'urgent') ? 'critical' : null })), onClick: r => onLoc(r.id) })) : ''];
      if (S.hrSales) kpis[3] = laborK;
    } else if (S.role === 'ops') {
      kpis = [salesK, laborK, crK, seesDiscipline() ? flagK : otK];
      charts = [salesChart(), laborChart()];
    } else {
      kpis = [salesK, laborK, crK, flagK];
      charts = [salesChart(), laborChart()];
    }
    const greet = `Good morning, ${p.first}`;
    return { head: pageHead(greet, [S.range === 'yesterday' ? dTitle(LAST) : rangeTitle(), scopeName], rangeCtl({ noCompare: true })), body: `<div class="g-kpi">${kpis.join('')}</div><div class="g-home">${attnCard(attention(locs), 7)}<div class="stack">${charts.join('')}</div></div>` };
  }

  /* ───────────── Section bodies (shared by A and B; C embeds pieces in its pane) ───────────── */
  function salesBody(locs, onLoc, onDay) {
    const idx = idxRange(), a = agg(locs, idx), c = hasCmp(idx) ? agg(locs, cmpIdx(idx)) : null, many = locs.length > 1;
    const chIdx = idx.length < 14 ? Array.from({ length: 14 }, (_, k) => LAST - 13 + k) : idx;
    const tgt = many ? blendTarget(locs, idx) : target(locs[0]);
    const mini = (label, v, d) => `<div class="op-card op-kpi" style="cursor:default"><span class="op-kpi-h">${label}</span><span class="op-kpi-n" style="font-size:22px;line-height:28px">${v}</span><span class="op-kpi-f">${d}<span>${cmpLabel()}</span></span></div>`;
    let h = `<div class="g-kpi5">${mini('Net sales', F.money(a.sales), delta(c && pctChange(a.sales, c.sales), '%', 'done'))}${mini('Labor % of sales', F.pct(a.labor), delta(c && a.labor - c.labor, 'pts', a.labor > tgt ? 'warning' : null))}${mini('Labor cost', F.money(a.cost), delta(c && pctChange(a.cost, c.cost), '%'))}${mini('Overtime', a.ot.toFixed(1) + ' h', delta(c && pctChange(a.ot, c.ot), '%', c && a.ot > c.ot * 1.1 ? 'warning' : null))}${mini('Avg check', F.money(a.check, { cents: true }), delta(c && pctChange(a.check, c.check), '%'))}</div>`;
    const salesLine = chartCard('Net sales', `${chIdx.length} Business Days · dashed = ${S.compare === 'prior' ? 'prior period' : 'same weekday, week before'}`, el => O.charts.line(el, { labels: chIdx.map(i => String(dCol(i)[1])), tipLabels: chIdx.map(dTitle), height: 220, yFormat: v => F.money(v, { compact: true }), series: [{ name: 'This period', values: chIdx.map(i => orgDay(i, locs)), color: 'var(--chart-current)', area: true }, { name: S.compare === 'prior' ? 'Prior period' : 'Week before', values: chIdx.map(i => orgDay(i - (S.compare === 'prior' ? chIdx.length : 7), locs)), color: 'var(--chart-prior)', dashed: true }], onClick: i => onDay(many ? null : locs[0], chIdx[i]) }));
    if (many) {
      const byLoc = chartCard('Net sales by Location', `${chIdx.length} Business Days · one line per Location`, el => O.charts.line(el, { labels: chIdx.map(i => String(dCol(i)[1])), tipLabels: chIdx.map(dTitle), height: 220, endLabels: true, yFormat: v => F.money(v, { compact: true }), series: locs.map(l => ({ name: LN(l), values: chIdx.map(i => D[l][i].sales), color: O.loc(l).color, glyph: O.loc(l).glyph })), legend: false }));
      h += `<div class="g-2">${salesLine}${byLoc}</div>`;
      const rows = locs.map(l => { const x = agg([l], idx), y = c ? agg([l], cmpIdx(idx)) : null; return { l, x, y }; }).sort((p, q) => q.x.sales - p.x.sales);
      h += `<div class="op-table-wrap"><table class="op-table"><thead><tr><th>Location</th><th>Last 14 days</th><th class="num">Net sales</th><th class="num">${cmpLabel()}</th><th class="num">Labor %</th><th class="num">Target</th><th class="num">Labor cost</th><th class="num">Overtime h</th><th class="num">Orders</th><th class="num">Avg check</th></tr></thead><tbody>` +
        rows.map(({ l, x, y }) => { const over = x.labor > target(l) + OVER; return `<tr ${onLoc ? `data-row-loc="${l}"` : ''} ${onLoc ? 'data-go="{}"' : ''}><td><span class="glyph">${glyphKey(l)}${LN(l)}</span></td><td>${sparkOf(Array.from({ length: 14 }, (_, k) => D[l][LAST - 13 + k].sales), { width: 88, height: 24 })}</td><td class="num">${F.money(x.sales)}</td><td class="num muted">${y ? F.delta(pctChange(x.sales, y.sales)) : '—'}</td><td class="num${over ? ' bad' : ''}">${over ? '▲ ' : ''}${F.pct(x.labor)}</td><td class="num muted">${target(l)}%</td><td class="num">${F.money(x.cost)}</td><td class="num${x.ot > 14 * idx.length / 7 ? ' bad' : ''}">${x.ot.toFixed(1)}</td><td class="num">${F.count(x.orders)}</td><td class="num">${F.money(x.check, { cents: true })}</td></tr>`; }).join('') +
        `</tbody><tfoot><tr><td>All Locations</td><td></td><td class="num">${F.money(a.sales)}</td><td class="num muted">${c ? F.delta(pctChange(a.sales, c.sales)) : '—'}</td><td class="num">${F.pct(a.labor)}</td><td class="num muted">${blendTarget(locs, idx) + '%'}</td><td class="num">${F.money(a.cost)}</td><td class="num">${a.ot.toFixed(1)}</td><td class="num">${F.count(a.orders)}</td><td class="num">${F.money(a.check, { cents: true })}</td></tr></tfoot></table></div>`;
      const hIdx = Array.from({ length: 14 }, (_, k) => LAST - 13 + k);
      h += chartCard('Labor % by Location and Business Day', `Last 14 Business Days · ▲ = ${OVER}+ pts over ${S.perLocTarget ? "the Location's target" : `the ${ORG_TARGET}% target`}`, el => O.charts.heatmap(el, { mode: 'seq', cols: hIdx.map(dCol), colTitles: hIdx.map(dTitle), rows: locs.map(l => ({ label: LN(l), id: l, cells: hIdx.map(i => D[l][i].labor) })), bins: [27, 29, 31, 33], flagAt: 29, target: ORG_TARGET, labelWidth: 110, summary: { title: 'Avg', value: r => F.pct(agg([r.id], hIdx).labor) }, onClick: (r, ci) => onDay(r.id, hIdx[ci]) }));
      h += `<div class="g-2">${chartCard('Sales mix by daypart', rangeTitle(), el => O.charts.stacked(el, { percent: true, inlineLabels: true, labelWidth: 96, keys: DAYPART_KEYS.map((k, j) => ({ name: k, color: `var(--daypart-${j + 1})` })), rows: locs.map(l => ({ label: LN(l), parts: DAYPART_KEYS.map((_, j) => idx.reduce((s, i) => s + (D[l][i].daypart ? D[l][i].daypart[j] : 0), 0)) })) }))}${chartCard('Sales mix by category', rangeTitle(), el => O.charts.stacked(el, { percent: true, inlineLabels: true, labelWidth: 96, keys: CAT_KEYS.map((k, j) => ({ name: k, color: `var(--mix-${j + 1})` })), rows: locs.map(l => ({ label: LN(l), parts: CAT_KEYS.map((_, j) => idx.reduce((s, i) => s + (D[l][i].cats ? D[l][i].cats[j] : 0), 0)) })) }))}</div>`;
    } else {
      const l = locs[0];
      h += `<div class="g-2">${salesLine}${chartCard('Labor % of sales', `${chIdx.length} Business Days · target ${target(l)}%`, el => O.charts.line(el, { labels: chIdx.map(i => String(dCol(i)[1])), tipLabels: chIdx.map(dTitle), height: 220, legend: false, target: target(l), yFormat: v => F.pct(v, 0), series: [{ name: 'Labor %', values: chIdx.map(i => D[l][i].labor), color: 'var(--chart-current)' }], onClick: i => onDay(l, chIdx[i]) }))}</div>`;
      h += dayTable(l, chIdx.slice().reverse(), onDay);
    }
    return h;
  }
  function dayTable(l, idx, onDay) {
    return `<div class="op-table-wrap"><table class="op-table"><thead><tr><th>Business Day</th><th>Closing Report</th><th class="num">Net sales</th><th class="num">vs week before</th><th class="num">Labor %</th><th class="num">Overtime h</th><th class="num">Tip Pool</th><th>Tip Distribution</th></tr></thead><tbody>` +
      idx.map(i => { const d = D[l][i], p = D[l][i - 7]; const over = d.labor > target(l) + OVER; return `<tr data-day="${i}" data-dl="${l}" data-go="{}"><td style="font-weight:500">${dTitle(i)}</td><td>${O.chip('closingReport', d.cr, { size: 'sm' })}</td><td class="num">${d.closed ? '—' : F.money(d.sales)}</td><td class="num muted">${d.closed || !p || p.closed ? '—' : F.delta(pctChange(d.sales, p.sales))}</td><td class="num${over ? ' bad' : ''}">${d.closed ? '—' : (over ? '▲ ' : '') + F.pct(d.labor)}</td><td class="num">${d.closed ? '—' : d.ot.toFixed(1)}</td><td class="num">${d.closed ? '—' : F.money(d.card + d.jar)}</td><td>${O.chip('tipDistribution', d.tip, { size: 'sm' })}</td></tr>`; }).join('') + '</tbody></table></div>';
  }
  function reportsBody(locs, onLoc, onDay) {
    const n = S.range === '28d' || S.range === '13w' ? 28 : 14, idx = Array.from({ length: n }, (_, k) => LAST - n + 1 + k);
    const ex = []; locs.forEach(l => idx.forEach(i => { const s = D[l][i].cr; if (['overdue', 'late', 'amended', 'draft'].includes(s)) ex.push({ l, i, s }); }));
    ex.sort((a, b) => ({ overdue: 0, draft: 1, late: 2, amended: 3 })[a.s] - ({ overdue: 0, draft: 1, late: 2, amended: 3 })[b.s] || b.i - a.i);
    const onTime = idx.reduce((s, i) => s + locs.filter(l => D[l][i].cr === 'submitted' || D[l][i].cr === 'amended').length, 0), expected = idx.reduce((s, i) => s + locs.filter(l => D[l][i].cr !== 'closed').length, 0);
    let h = `<div class="op-filterbar"><span class="op-fchip"><span class="k">Range</span><span class="v">${n} Business Days</span></span><button class="op-fadd">${I('plus', 14)}Filter</button><span class="op-fcount">${Math.round(onTime / expected * 100)}% submitted by 10:00 · ${ex.length} exceptions</span></div>`;
    h += chartCard(locs.length > 1 ? 'Closing Reports by Location and Business Day' : `Closing Reports · ${LN(locs[0])}`, 'Click a cell to open the Closing Report' + (onLoc ? ', a Location to open it' : ''), el => { O.charts.heatmap(el, { mode: 'status', cols: idx.map(dCol), colTitles: idx.map(dTitle), labelWidth: 110, rows: locs.map(l => ({ label: LN(l), id: l, cells: idx.map(i => D[l][i].cr) })), summary: { title: 'On time', value: r => `${idx.filter(i => ['submitted', 'amended'].includes(D[r.id][i].cr)).length}/${idx.filter(i => D[r.id][i].cr !== 'closed').length}` }, onClick: (r, ci) => onDay(r.id, idx[ci]) }); if (onLoc) el.querySelectorAll('.rl').forEach((n2, k) => { n2.style.cursor = 'pointer'; n2.addEventListener('click', () => onLoc(locs[k])); }); });
    h += `<div class="op-card" style="overflow:hidden"><div class="cardh"><span class="t"><b class="h3">Exceptions</b><span class="op-count">${ex.length}</span></span></div>${ex.slice(0, 10).map(x => `<a class="op-row" data-day="${x.i}" data-dl="${x.l}" data-go="{}">${O.tile('closingReport', x.s)}<span class="t"><b>${O.STATUS.closingReport[x.s].label} · ${dTitle(x.i)}</b><span>${x.s === 'late' ? `Submitted ${D[x.l][x.i].at} by ${D[x.l][x.i].author}` : x.s === 'amended' ? `Amended by ${D[x.l][x.i].author} · previous version kept` : x.s === 'draft' ? `Shared draft · due 10:00` : 'Not submitted'}</span></span>${O.locTag(LN(x.l))}<span class="age">${ago(x.i)}</span>${I('chevron-right', 16)}</a>`).join('')}</div>`;
    return h;
  }
  function flagsBody(locs) {
    const list = visibleFlags().filter(f => locs.includes(f.loc)).sort((a, b) => (a.state === 'resolved') - (b.state === 'resolved') || (b.state === 'urgent') - (a.state === 'urgent') || b.day - a.day);
    const open = list.filter(f => f.state !== 'resolved');
    const byCat = HR_CATS.map(c => ({ label: c.replace(' or discrimination complaint', ' complaint'), value: list.filter(f => f.cat === c && f.day > LAST - 91).length })).filter(r => r.value);
    return `<div class="g-21"><div class="op-table-wrap"><table class="op-table"><thead><tr><th>HR Flag</th><th>Employee</th><th>Location</th><th>Raised</th><th>From</th><th>State</th></tr></thead><tbody>${list.slice(0, 14).map(f => `<tr><td style="font-weight:500">${f.cat}</td><td>${f.emp}</td><td>${O.locTag(LN(f.loc))}</td><td class="muted">${dTitle(f.day)}</td><td class="muted">${f.source}</td><td>${O.chip('hrFlag', f.state, { size: 'sm' })}${f.outcome ? ` <span class="tert" style="font-size:12px">${f.outcome}</span>` : ''}</td></tr>`).join('')}</tbody></table></div>
      <div class="stack">${chartCard('HR Flags by category', 'Last 13 weeks', el => O.charts.hbar(el, { labelWidth: 130, format: v => String(v), valueName: 'Flags', rows: byCat }))}${locs.length > 1 ? chartCard('Open by Location', `${open.length} open`, el => O.charts.hbar(el, { labelWidth: 96, format: v => String(v), valueName: 'Open', rows: locs.map(l => ({ label: LN(l), value: open.filter(f => f.loc === l).length, tone: open.some(f => f.loc === l && f.state === 'urgent') ? 'critical' : null })) })) : ''}</div></div>`;
  }
  function writeupsBody(locs) {
    const list = visibleWriteups().filter(w => locs.includes(w.loc));
    return `<div class="op-table-wrap"><table class="op-table"><thead><tr><th>Employee</th><th>Level</th><th>Category</th><th>Location</th><th>Issued by</th><th>Date</th><th>State</th><th>Rebuttal</th></tr></thead><tbody>${list.map(w => `<tr><td style="font-weight:500">${w.emp}</td><td>${w.level}</td><td class="muted">${w.cat}</td><td>${O.locTag(LN(w.loc))}</td><td class="muted">${w.by}</td><td class="muted">${dTitle(w.day)}</td><td>${O.chip('writeUp', w.state, { size: 'sm' })}</td><td class="muted">${w.rebuttal ? 'Attached' : '—'}</td></tr>`).join('') || '<tr><td colspan="8" class="empty-note">No Write-ups in scope.</td></tr>'}</tbody></table></div><p class="section-note">Drafts stay private to their author and never show here.</p>`;
  }
  function tipsBody(locs, onDay) {
    const idx = Array.from({ length: 14 }, (_, k) => LAST - 13 + k);
    const statusGrid = `<div class="op-card" style="padding:var(--space-3) var(--space-4);display:grid;gap:var(--space-2);overflow-x:auto"><b class="h3">${locs.length > 1 ? 'Tip Distribution by Location and Business Day' : 'Tip Distribution by Business Day'}</b><div style="display:grid;grid-template-columns:110px repeat(14, minmax(28px,1fr));gap:4px;align-items:center;font-size:11px;min-width:560px"><span></span>${idx.map(i => `<span class="tert" style="text-align:center">${dCol(i)[0]}<br><b style="color:var(--text-secondary)">${dCol(i)[1]}</b></span>`).join('')}${locs.map(l => `<span style="display:flex;gap:6px;align-items:center;font-size:13px">${glyphKey(l)}${LN(l)}</span>${idx.map(i => `<span style="display:grid;place-items:center;cursor:pointer" data-day="${i}" data-dl="${l}" data-go="{}">${O.cell('tipDistribution', D[l][i].tip, { size: 'sm', title: `${LN(l)} · ${dTitle(i)} · ${O.STATUS.tipDistribution[D[l][i].tip].label}` })}</span>`).join('')}`).join('')}</div></div>`;
    const tIdx = idxRange(), table = `<div class="op-table-wrap"><table class="op-table"><thead><tr><th>Location</th><th class="num">Card tips</th><th class="num">Cash jar</th><th class="num">Tip Pool</th><th class="num">Hours in pool</th><th class="num">Per hour</th><th>Open</th></tr></thead><tbody>${locs.map(l => { const a = agg([l], tIdx); const op = tIdx.filter(i => D[l][i].tip !== 'finalized' && D[l][i].tip !== 'noPool'); return `<tr><td><span class="glyph">${glyphKey(l)}${LN(l)}</span></td><td class="num">${F.money(a.card)}</td><td class="num">${F.money(a.jar)}</td><td class="num" style="font-weight:500">${F.money(a.tips)}</td><td class="num">${F.count(a.hours * 0.62)}</td><td class="num">${F.money(a.tips / (a.hours * 0.62 || 1), { cents: true })}</td><td>${op.length ? op.map(i => O.chip('tipDistribution', D[l][i].tip, { size: 'sm', label: `${O.STATUS.tipDistribution[D[l][i].tip].label} · ${dCol(i)[1]}` })).join(' ') : '<span class="tert">—</span>'}</td></tr>`; }).join('')}</tbody></table></div>`;
    const one = locs.length === 1 ? chartCard(`Tip Pool per Business Day · ${LN(locs[0])}`, 'Hatched = Draft · amber = Reopened', el => O.charts.columns(el, { labels: idx.map(i => String(dCol(i)[1])), tipLabels: idx.map(dTitle), values: idx.map(i => D[locs[0]][i].closed ? null : D[locs[0]][i].card + D[locs[0]][i].jar), states: idx.map(i => ({ draft: 'pending', reopened: 'reopened', noPool: 'none' })[D[locs[0]][i].tip] || null), valueName: 'Tip Pool', average: true, onClick: i => onDay(locs[0], idx[i]) })) : '';
    return statusGrid + one + table + `<p class="section-note">Next payroll export: Pay Period Oct 5 – Oct 18. Opsell computes the split; payment runs through payroll.</p>`;
  }
  function employeesBody(locs) {
    return `<div class="op-card"><div class="empty-note">${I('users', 20)}<br><b style="color:var(--text-primary)">Employees</b><br>Roster for ${locs.length === 1 ? LN(locs[0]) : 'all Locations'}: not part of this prototype's question.</div></div>`;
  }
  function locationsBody(onLoc) {
    const idx = idxRange(), c = hasCmp(idx);
    return `<div class="op-table-wrap"><table class="op-table"><thead><tr><th>Location</th><th>City</th><th>Today</th><th class="num">Net sales</th><th class="num">${cmpLabel()}</th><th class="num">Labor %</th><th>Last 7 Closing Reports</th><th class="num">Open HR Flags</th></tr></thead><tbody>${LOCS.map(l => { const a = agg([l], idx), b = c ? agg([l], cmpIdx(idx)) : null; return `<tr data-row-loc="${l}" data-go="{}"><td><span class="glyph">${glyphKey(l)}${LN(l)}</span></td><td class="muted">${O.loc(l).city}</td><td>${O.chip('closingReport', D[l][LAST].cr, { size: 'sm' })}</td><td class="num">${F.money(a.sales)}</td><td class="num muted">${b ? F.delta(pctChange(a.sales, b.sales)) : '—'}</td><td class="num${a.labor > target(l) + OVER ? ' bad' : ''}">${F.pct(a.labor)}</td><td><span style="display:flex;gap:3px">${Array.from({ length: 7 }, (_, k) => O.cell('closingReport', D[l][LAST - 6 + k].cr, { size: 'sm', title: dTitle(LAST - 6 + k) })).join('')}</span></td><td class="num">${seesDiscipline() ? FLAGS.filter(f => f.loc === l && f.state !== 'resolved').length : '—'}</td></tr>`; }).join('')}</tbody></table></div>`;
  }

  /* Business Day: the Closing Report snapshot plus what happened that day */
  function dayBody(l, i) {
    const d = D[l][i], p = D[l][i - 7], st = O.STATUS.closingReport[d.cr];
    if (d.closed) return `<div class="op-card"><div class="empty-note">${O.chip('closingReport', 'closed')}<br><br>${LN(l)} was closed on ${dTitle(i)}. No Closing Report expected.</div></div>`;
    const notes = notesFor(l, i), flags = visibleFlags().filter(f => f.loc === l && f.day === i);
    const top = Array.from({ length: 5 }, (_, k) => { const n = k === 4 ? STAFF[l][1] : CREW[(LOCS.indexOf(l) * 4 + (k + i) % 4) % CREW.length]; const h = (9.5 - k * 0.6 + (k === 0 && l === 'mass' && i >= 81 ? 2.5 : 0)); return [n, POSITIONS[(k + i) % 5], h, Math.round(h * (19 + (4 - k)))]; });
    const header = `<div class="dayhead">${O.chip('closingReport', d.cr)}<span class="tert" style="font-size:13px">${d.cr === 'overdue' ? 'Not submitted · due 10:00 the next morning' : d.cr === 'draft' ? `Shared draft · last edit 23:40 by ${d.author}` : `Submitted ${d.at} by ${d.author}`}</span></div>`;
    const figures = `<div class="op-card" style="padding:var(--space-4);display:grid;gap:var(--space-2)"><b class="h3">Figures</b><span class="section-note">${['overdue', 'draft'].includes(d.cr) ? 'Live from the data source; snapshotted when submitted.' : 'Snapshotted at submit · vs ' + dTitle(i - 7)}</span>
      <div class="kv"><span>Net sales</span><span>${F.money(d.sales)} <span class="tert" style="font-weight:400">${p && !p.closed ? F.delta(pctChange(d.sales, p.sales)) : ''}</span></span><span>Orders</span><span>${F.count(d.orders)}</span><span>Avg check</span><span>${F.money(d.sales / d.orders, { cents: true })}</span><span>Labor cost</span><span>${F.money(d.cost)}</span><span>Labor % of sales</span><span class="${d.labor > target(l) + OVER ? 'bad' : ''}">${d.labor > target(l) + OVER ? '▲ ' : ''}${F.pct(d.labor)} <span class="tert" style="font-weight:400">target ${target(l)}%</span></span><span>Hours</span><span>${F.count(d.hours)}</span><span>Overtime</span><span class="${d.ot > 2 ? 'bad' : ''}">${d.ot.toFixed(1)} h</span><span>Card tips</span><span>${F.money(d.card)}</span><span>Cash jar</span><span>${F.money(d.jar)}</span><span>Tip Distribution</span><span>${O.chip('tipDistribution', d.tip, { size: 'sm' })}</span></div></div>`;
    const mix = chartCard('Sales by daypart', `vs ${dTitle(i - 7)}`, el => O.charts.stacked(el, { percent: true, inlineLabels: true, labelWidth: 72, keys: DAYPART_KEYS.map((k, j) => ({ name: k, color: `var(--daypart-${j + 1})` })), rows: [{ label: dTitle(i).slice(0, 3) + ' ' + dCol(i)[1], parts: d.daypart }].concat(p && !p.closed ? [{ label: dTitle(i - 7).slice(0, 3) + ' ' + dCol(i - 7)[1], parts: p.daypart }] : []) }));
    const topT = `<div class="op-card" style="overflow:hidden"><div class="cardh"><b class="h3">Top 5 by labor cost</b></div><table class="op-table"><tbody>${top.map(r => `<tr><td>${r[0]}</td><td class="muted">${r[1]}</td><td class="num">${r[2].toFixed(1)} h</td><td class="num">${F.money(r[3])}</td></tr>`).join('')}</tbody></table></div>`;
    const notesC = d.cr === 'overdue' ? `<div class="op-card" style="padding:var(--space-4);display:grid;gap:var(--space-2)"><b class="h3">Notes</b><p class="muted" style="margin:0">No Closing Report was submitted for this Business Day, so there are no notes. ${STAFF[l][0]} (GM) and ${STAFF[l][1]} were notified.</p></div>` : `<div class="op-card" style="padding:var(--space-4);display:grid;gap:var(--space-3)"><b class="h3">Notes</b><div class="notes">${SECTIONS.map(k => `<div class="note"><b>${k}</b><p class="${notes[k] ? '' : 'none'}">${notes[k] || 'Nothing noted'}</p></div>`).join('')}</div>${flags.length ? `<div style="display:grid;gap:var(--space-2)"><b class="h3">HR Flags raised from this report</b>${flags.map(f => `<div style="display:flex;gap:8px;align-items:center">${O.chip('hrFlag', f.state, { size: 'sm' })}<span>${f.cat} · ${f.emp}</span></div>`).join('')}</div>` : ''}</div>`;
    return { header, figures, mix, topT, notesC };
  }

  /* ───────────── Location page with tabs: shared by A (a day opens as a page) and B (a day opens in the drawer) ───────────── */
  function locationPage(l, toDay, keys) {
    const names = { overview: 'Overview', sales: 'Sales & Labor', reports: 'Closing Reports', people: 'HR Flags & Write-ups', tips: 'Tip Distribution' };
    const tabs = keys.filter(k => (k !== 'sales' || seesSales()) && (k !== 'people' || seesDiscipline()) && (k !== 'tips' || S.role !== 'hr'));
    const tab = tabs.includes(S.tab) ? S.tab : 'overview';
    const crumb = crumbs([['Locations', { page: 'locations' }], [LN(l)]]);
    const head = pageHead(LN(l), [O.loc(l).city, `GM ${STAFF[l][0]}`, rangeTitle()], rangeCtl(), `<span class="tert" style="display:flex;gap:6px;align-items:center;font-size:12px">${glyphKey(l)}Location</span>`) + `<div class="op-tabs" role="tablist">${tabs.map(k => `<button class="op-tab" role="tab" aria-selected="${tab === k}" ${go({ tab: k })}>${names[k]}</button>`).join('')}</div>`;
    let body;
    if (tab === 'overview') {
      const hm = home([l], (ll, day) => toDay(l, day));
      const strip = Array.from({ length: 14 }, (_, k) => LAST - 13 + k);
      body = hm.body.replace('<div class="g-home">', `<div class="op-card" style="padding:var(--space-3) var(--space-4);display:grid;gap:var(--space-2)"><div style="display:flex;justify-content:space-between;align-items:baseline"><b class="h3">Business Days</b><span class="section-note">Click a day to open its Closing Report</span></div><div class="daystrip">${strip.map(i => { const d = D[l][i]; return `<a data-day="${i}" data-dl="${l}" data-go="{}">${dCol(i)[0]} ${dCol(i)[1]}${O.cell('closingReport', d.cr, { size: 'sm' })}<b>${d.closed ? '—' : F.money(d.sales, { compact: true })}</b><span class="${d.labor > target(l) + OVER ? 'bad' : ''}">${d.closed ? '' : F.pct(d.labor)}</span></a>`; }).join('')}</div></div><div class="g-home">`);
    } else if (tab === 'sales') body = salesBody([l], null, toDay);
    else if (tab === 'reports') body = reportsBody([l], null, toDay);
    else if (tab === 'people') body = flagsBody([l]) + writeupsBody([l]);
    else body = tipsBody([l], toDay);
    return { crumb, head, body };
  }

  /* ───────────── Variant A: module pages, Location page, Business Day page ───────────── */
  function VariantA() {
    const toLoc = (l, day) => set(day != null && l ? { page: 'day', loc: l, day } : l ? { page: 'location', loc: l, tab: 'overview' } : day != null ? { page: 'reports' } : {});
    const toDay = (l, day) => set(l ? { page: 'day', loc: l, day, from: S.page } : { page: 'reports' });
    let title, crumb, head = '', body = '';
    const secHead = (t, extra) => pageHead(t, [rangeTitle(), `${LOCS.length} Locations`], extra === false ? '' : rangeCtl());
    switch (S.page) {
      case 'home': { const hm = home(LOCS, toLoc); crumb = crumbs([['Home']]); head = hm.head; body = hm.body; break; }
      case 'sales': crumb = crumbs([['Sales & Labor']]); head = secHead('Sales & Labor'); body = salesBody(LOCS, l => set({ page: 'location', loc: l, tab: 'sales' }), toDay); break;
      case 'reports': crumb = crumbs([['Closing Reports']]); head = pageHead('Closing Reports', [`Last ${S.range === '28d' || S.range === '13w' ? 28 : 14} Business Days`, `${LOCS.length} Locations`], `<div class="op-seg">${[['14 days', '7d'], ['28 days', '28d']].map(([t, k]) => `<button aria-pressed="${(S.range === '28d' || S.range === '13w') === (k === '28d')}" ${go({ range: k })}>${t}</button>`).join('')}</div>`); body = reportsBody(LOCS, l => set({ page: 'location', loc: l, tab: 'reports' }), toDay); break;
      case 'flags': crumb = crumbs([['HR Flags']]); head = pageHead('HR Flags', ['All Locations', `${FLAGS.filter(f => f.state !== 'resolved').length} open`]); body = flagsBody(LOCS); break;
      case 'writeups': crumb = crumbs([['Write-ups']]); head = pageHead('Write-ups', ['All Locations']); body = writeupsBody(LOCS); break;
      case 'tips': crumb = crumbs([['Tip Distribution']]); head = pageHead('Tip Distribution', [rangeTitle(), `${LOCS.length} Locations`], rangeCtl({ noCompare: true })); body = tipsBody(LOCS, toDay); break;
      case 'employees': crumb = crumbs([['Employees']]); head = pageHead('Employees', ['All Locations']); body = employeesBody(LOCS); break;
      case 'settings': crumb = crumbs([['Settings']]); head = pageHead('Settings', ['Organization']); body = settingsBody(); break;
      case 'locations': crumb = crumbs([['Locations']]); head = pageHead('Locations', [rangeTitle(), `${LOCS.length} Locations`], rangeCtl()); body = locationsBody(); break;
      case 'location': ({ crumb, head, body } = locationPage(S.loc, toDay, ['overview', 'sales', 'reports', 'people', 'tips'])); break;
      case 'day': {
        const l = S.loc, i = S.day, dd = dayBody(l, i);
        crumb = crumbs([['Locations', { page: 'locations' }], [LN(l), { page: 'location', loc: l, tab: 'overview' }], [dTitle(i)]]);
        head = pageHead(dTitle(i), [LN(l), 'Closing Report'], `<span class="stepper"><button class="op-btn op-btn--secondary op-btn--sm op-icon-btn" aria-label="Previous Business Day" ${i > 0 ? go({ day: i - 1 }) : 'disabled'}>${I('chevron-left', 16)}</button><button class="op-btn op-btn--secondary op-btn--sm op-icon-btn" aria-label="Next Business Day" ${i < LAST ? go({ day: i + 1 }) : 'disabled'}>${I('chevron-right', 16)}</button></span><div class="op-menu" style="position:static;display:flex;padding:2px;gap:2px;min-width:0;width:auto;box-shadow:none;border:1px solid var(--border-default)">${LOCS.map(x => `<button class="op-btn op-btn--sm ${x === l ? 'op-btn--secondary' : 'op-btn--ghost'}" title="${LN(x)}" ${go({ loc: x })}>${glyphKey(x)}</button>`).join('')}</div>`);
        body = dd.header ? `${dd.header}<div class="g-21"><div class="stack">${dd.notesC}${dd.mix}${dd.topT}</div><div class="stack">${dd.figures}</div></div>` : dd;
        break;
      }
    }
    title = S.page;
    const navKey = S.page === 'location' || S.page === 'day' ? 'locations' : S.page;
    return `<div class="app${S.navOpen ? ' nav-open' : ''}">${nav(navKey, navItems('A'))}<div class="col">${topbar(crumb)}<div class="scroll"><main class="page${S.page === 'home' ? ' page--home' : ''}">${head}${body}</main></div></div></div>`;
  }

  /* ───────────── Variant B: one scope switcher, Location pages with tabs, drawer for the Business Day ───────────── */
  function VariantB() {
    const onLocPage = S.page === 'location';
    const locs = scopeLocs(), one = locs.length === 1;
    const toDay = (l, day) => { if (day == null) return; if (!l && one) l = locs[0]; if (!l) { set({ page: 'reports' }); return; } set({ drawer: { loc: l, day } }); };
    const toLoc = (l, day) => set(day != null && l ? { drawer: { loc: l, day } } : l ? { page: 'location', loc: l, tab: 'overview' } : day != null ? { page: 'reports' } : {});
    const toLocTab = tab => l => set({ page: 'location', loc: l, tab });
    // On a Location page the switcher swaps the Location; everywhere else it scopes the page.
    const current = onLocPage ? S.loc : S.scope;
    const pick = l => onLocPage ? (l === 'all' ? { page: 'locations', scopeOpen: false } : { loc: l, scopeOpen: false }) : { scope: l, scopeOpen: false };
    const scopeName = current === 'all' ? 'All Locations' : LN(current);
    const scopeBtn = `<div class="scope-wrap"><button class="scope-btn" data-act="scope" aria-expanded="${S.scopeOpen}"><span class="k">${onLocPage ? 'Location' : 'Scope'}</span>${current === 'all' ? I('store', 16) : glyphKey(current)}${scopeName}${I('chevron-down', 16)}</button>${S.scopeOpen ? `<div class="op-menu" role="menu"><div class="op-menu-label">Organization</div><button class="op-menu-item" ${go(pick('all'))}>${I('store', 16)}All Locations${current === 'all' ? I('check', 16) : ''}</button><div class="op-menu-sep"></div><div class="op-menu-label">Location</div>${LOCS.map(l => `<button class="op-menu-item" ${go(pick(l))}>${glyphKey(l)}${LN(l)}<span class="tert" style="margin-left:auto;font-size:12px">${O.loc(l).city.split(',')[1]}</span>${current === l ? I('check', 16) : ''}</button>`).join('')}</div>` : ''}</div>`;
    const titles = { home: 'Home', sales: 'Sales & Labor', reports: 'Closing Reports', flags: 'HR Flags', writeups: 'Write-ups', tips: 'Tip Distribution', employees: 'Employees', settings: 'Settings', locations: 'Locations' };
    let crumb = onLocPage ? '' : crumbs(one ? [[titles[S.page], { scope: 'all' }], [LN(locs[0])]] : [[titles[S.page]]]);
    let head, body;
    const scopeLine = [rangeTitle(), scopeName];
    if (onLocPage) ({ crumb, head, body } = locationPage(S.loc, toDay, ['overview', 'sales', 'reports', 'people', 'tips']));
    else if (S.page === 'locations') { crumb = crumbs([['Locations']]); head = pageHead('Locations', [rangeTitle(), `${LOCS.length} Locations`], rangeCtl()); body = locationsBody(); }
    else if (S.page === 'home') { const hm = home(locs, toLoc); head = hm.head; body = hm.body;
      if (!one) body = body.replace('<div class="g-home">', `${scorecard()}<div class="g-home">`);
    } else if (S.page === 'sales') { head = pageHead('Sales & Labor', scopeLine, rangeCtl()); body = salesBody(locs, one ? null : toLocTab('sales'), toDay); }
    else if (S.page === 'reports') { head = pageHead('Closing Reports', [`Last ${S.range === '28d' || S.range === '13w' ? 28 : 14} Business Days`, scopeName], `<div class="op-seg">${[['14 days', '7d'], ['28 days', '28d']].map(([t, k]) => `<button aria-pressed="${(S.range === '28d' || S.range === '13w') === (k === '28d')}" ${go({ range: k })}>${t}</button>`).join('')}</div>`); body = reportsBody(locs, one ? null : toLocTab('reports'), toDay) + (one ? dayTable(locs[0], Array.from({ length: 14 }, (_, k) => LAST - k), toDay) : ''); }
    else if (S.page === 'flags') { head = pageHead('HR Flags', [scopeName]); body = flagsBody(locs); }
    else if (S.page === 'writeups') { head = pageHead('Write-ups', [scopeName]); body = writeupsBody(locs); }
    else if (S.page === 'tips') { head = pageHead('Tip Distribution', scopeLine, rangeCtl({ noCompare: true })); body = tipsBody(locs, toDay); }
    else if (S.page === 'settings') { head = pageHead('Settings', ['Organization']); body = settingsBody(); }
    else { head = pageHead('Employees', [scopeName]); body = employeesBody(locs); }
    const dr = S.drawer ? drawer(S.drawer.loc, S.drawer.day) : '';
    return `<div class="app${S.navOpen ? ' nav-open' : ''}">${nav(onLocPage ? 'locations' : S.page, navItems('B'))}<div class="col">${topbar(crumb, scopeBtn)}<div class="scroll"><main class="page${S.page === "home" ? " page--home" : ""}">${head}${body}</main></div></div>${dr}</div>`;
  }
  function scorecard() {
    const idx = idxRange(), c = hasCmp(idx);
    return `<div class="op-table-wrap"><table class="op-table"><thead><tr><th>Location</th><th class="num">Net sales</th><th class="num">${cmpLabel()}</th><th>Labor % vs target</th><th>Closing Reports, last 7</th>${seesDiscipline() ? '<th class="num">Open HR Flags</th>' : ''}${S.role !== 'hr' ? '<th>Tip Distribution</th>' : ''}<th class="num">Needs attention</th></tr></thead><tbody>${LOCS.map(l => { const a = agg([l], idx), b = c ? agg([l], cmpIdx(idx)) : null, t = target(l), over = a.labor > t + OVER, w = Math.min(100, a.labor / 36 * 100), tw = t / 36 * 100; const tipOpen = D[l].slice(LAST - 13).filter(d => d.tip === 'reopened').length; return `<tr data-row-loc="${l}" data-go="{}"><td><span class="glyph">${glyphKey(l)}${LN(l)}</span></td><td class="num">${F.money(a.sales)}</td><td class="num muted">${b ? F.delta(pctChange(a.sales, b.sales)) : '—'}</td><td><span style="display:flex;align-items:center;gap:8px"><span style="position:relative;width:96px;height:8px;border-radius:4px;background:var(--surface-hover)"><span style="position:absolute;left:0;top:0;bottom:0;width:${w}%;border-radius:4px;background:${over ? 'var(--warning-solid)' : 'var(--neutral-400)'}"></span><span style="position:absolute;left:${tw}%;top:-3px;bottom:-3px;width:2px;background:var(--chart-target)"></span></span><span class="num${over ? ' bad' : ''}">${over ? '▲ ' : ''}${F.pct(a.labor)}</span></span></td><td><span style="display:flex;gap:3px">${Array.from({ length: 7 }, (_, k) => O.cell('closingReport', D[l][LAST - 6 + k].cr, { size: 'sm', title: dTitle(LAST - 6 + k) })).join('')}</span></td>${seesDiscipline() ? `<td class="num">${FLAGS.filter(f => f.loc === l && f.state !== 'resolved').length}</td>` : ''}${S.role !== 'hr' ? `<td>${tipOpen ? O.chip("tipDistribution", "reopened", { size: "sm" }) : `<span class="tert" style="font-size:13px">Finalized through ${dTitle(LAST - 1).slice(5)}</span>`}</td>` : ''}<td class="num">${attention([l]).length}</td></tr>`; }).join('')}</tbody></table></div>`;
  }
  function drawer(l, i) {
    const dd = dayBody(l, i);
    return `<div class="drawer-layer"><div class="op-scrim" data-act="close"></div><aside class="op-drawer" role="dialog" aria-label="Business Day"><div class="op-drawer-h">${glyphKey(l)}<b class="h3" style="flex:1">${LN(l)} · ${dTitle(i)}</b><button class="op-btn op-btn--secondary op-btn--sm op-icon-btn" aria-label="Previous Business Day" ${i > 0 ? go({ drawer: { loc: l, day: i - 1 } }) : 'disabled'}>${I('chevron-left', 16)}</button><button class="op-btn op-btn--secondary op-btn--sm op-icon-btn" aria-label="Next Business Day" ${i < LAST ? go({ drawer: { loc: l, day: i + 1 } }) : 'disabled'}>${I('chevron-right', 16)}</button><button class="op-btn op-btn--ghost op-btn--sm op-icon-btn" aria-label="Close" data-act="close">${I('x', 16)}</button></div><div class="op-drawer-b">${dd.header ? dd.header + dd.notesC + dd.figures + dd.mix + dd.topT : dd}</div>${S.page === 'location' && S.loc === l ? '' : `<div class="op-drawer-f"><button class="op-btn op-btn--secondary op-btn--sm" ${go({ page: 'location', loc: l, tab: 'overview', drawer: null })}>${I('store', 16)}Open ${LN(l)}</button></div>`}</aside></div>`;
  }

  /* ───────────── Variant C: Board (Locations x Business Days), side pane ───────────── */
  const METRICS = {
    cr: ['Closing Reports', 'Status per Business Day'],
    sales: ['Net sales', 'Change vs same weekday last week'],
    labor: ['Labor %', 'Against target'],
    ot: ['Overtime', 'Hours per Business Day'],
    tips: ['Tip Distribution', 'Status and Tip Pool'],
    flags: ['HR Flags', 'Raised per Business Day']
  };
  function boardCell(l, i) {
    const d = D[l][i], m = S.metric;
    if (m === 'cr') return { html: O.cell('closingReport', d.cr, { size: 'sm' }), bg: 'transparent', title: O.STATUS.closingReport[d.cr].label };
    if (m === 'tips') return { html: O.cell('tipDistribution', d.tip, { size: 'sm' }), bg: 'transparent', title: `${O.STATUS.tipDistribution[d.tip].label}${d.closed ? '' : ' · ' + F.money(d.card + d.jar)}` };
    if (d.closed) return { na: true, html: '—', title: 'Closed' };
    if (m === 'sales') { const p = D[l][i - 7]; if (!p || p.closed) return { na: true, html: '—', title: 'No comparison' }; const v = pctChange(d.sales, p.sales), a = Math.min(1, Math.abs(v) / 12); return { html: Math.abs(v) < 0.5 ? '0' : (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(0), bg: v >= 0 ? `color-mix(in srgb, var(--chart-current) ${Math.round(a * 55)}%, var(--surface-card))` : v <= -6 ? 'var(--warning-bg)' : `color-mix(in srgb, var(--neutral-400) ${Math.round(a * 60)}%, var(--surface-card))`, fg: v <= -6 ? 'var(--warning-text)' : a > 0.6 && v > 0 ? 'var(--accent-on-solid)' : 'var(--text-primary)', title: `${F.money(d.sales)} · ${F.delta(v)} vs ${dTitle(i - 7)}` }; }
    if (m === 'labor') { const t = target(l), v = d.labor, b = v < t ? 1 : v < t + 1 ? 2 : v < t + 3 ? 3 : v < t + 5 ? 4 : 5; return { html: (v > t + OVER ? '▲' : '') + v.toFixed(0), bg: `var(--seq-${b})`, fg: b >= 4 ? 'var(--text-inverse)' : 'var(--text-primary)', title: `${F.pct(v)} · target ${t}%` }; }
    if (m === 'ot') { const v = d.ot, b = v < 1 ? 1 : v < 1.6 ? 2 : v < 2.2 ? 3 : v < 2.6 ? 4 : 5; return { html: v.toFixed(1), bg: `var(--seq-${b})`, fg: b >= 4 ? 'var(--text-inverse)' : 'var(--text-primary)', title: `${v.toFixed(1)} h overtime` }; }
    const n = visibleFlags().filter(f => f.loc === l && f.day === i); return n.length ? { html: n.some(f => f.state === 'urgent') ? O.cell('hrFlag', 'urgent', { size: 'sm' }) : String(n.length), bg: n.some(f => f.state === 'urgent') ? 'transparent' : 'var(--warning-bg)', fg: 'var(--warning-text)', title: n.map(f => f.cat + ' · ' + f.emp).join(', ') } : { html: '', bg: 'var(--surface-hover)', title: 'None' };
  }
  function VariantC() {
    if (S.page !== 'home' && S.page !== 'board' && !['flags', 'writeups', 'tips', 'employees', 'settings'].includes(S.page)) S.page = 'board';
    const toBoard = (l, day) => set({ page: 'board', paneKind: l && day != null ? 'cell' : l ? 'loc' : day != null ? 'day' : null, paneLoc: l, paneDay: day });
    let head, body, crumb;
    if (S.page === 'home') { const hm = home(LOCS, (l, day) => { if (!l && day == null) return; toBoard(l, day); }); head = hm.head; body = hm.body; crumb = crumbs([['Home']]); }
    else if (S.page === 'board') {
      const n = S.range === '28d' ? 28 : S.range === '13w' ? 28 : 14, idx = Array.from({ length: n }, (_, k) => LAST - n + 1 + k);
      const metrics = Object.entries(METRICS).filter(([k]) => (k !== 'flags' || seesDiscipline()) && (k !== 'tips' || S.role !== 'hr') && (!['sales', 'labor', 'ot'].includes(k) || seesSales()));
      if (!metrics.some(m => m[0] === S.metric)) S.metric = 'cr';
      crumb = crumbs(S.paneKind ? [['Board', { paneKind: null }], [S.paneKind === 'loc' ? LN(S.paneLoc) : S.paneKind === 'day' ? dTitle(S.paneDay) : `${LN(S.paneLoc)} · ${dTitle(S.paneDay)}`]] : [['Board']]);
      head = pageHead('Board', [`${LOCS.length} Locations`, `Last ${n} Business Days`, METRICS[S.metric][1]], `<div class="op-seg">${[['14 days', '7d'], ['28 days', '28d']].map(([t, k]) => `<button aria-pressed="${(n === 28) === (k === '28d')}" ${go({ range: k })}>${t}</button>`).join('')}</div>`) +
        `<div class="op-tabs" role="tablist">${metrics.map(([k, v]) => `<button class="op-tab" role="tab" aria-selected="${S.metric === k}" ${go({ metric: k })}>${v[0]}</button>`).join('')}</div>`;
      const sumFor = l => { const a = agg([l], idx); return S.metric === 'cr' ? `${idx.filter(i => ['submitted', 'amended'].includes(D[l][i].cr)).length}/${idx.filter(i => D[l][i].cr !== 'closed').length} on time` : S.metric === 'sales' ? F.money(a.sales, { compact: true }) : S.metric === 'labor' ? F.pct(a.labor) : S.metric === 'ot' ? a.ot.toFixed(1) + ' h' : S.metric === 'tips' ? F.money(a.tips, { compact: true }) : visibleFlags().filter(f => f.loc === l && idx.includes(f.day)).length + ' raised'; };
      const colSum = i => { const a = agg(LOCS, [i]); return S.metric === 'sales' ? F.money(a.sales, { compact: true }) : S.metric === 'labor' ? F.pct(a.labor, 0) : S.metric === 'ot' ? a.ot.toFixed(0) + 'h' : S.metric === 'cr' ? LOCS.filter(l => ['submitted', 'amended', 'late'].includes(D[l][i].cr)).length + '/' + LOCS.filter(l => D[l][i].cr !== 'closed').length : ''; };
      const table = `<div class="op-card" style="padding:var(--space-3);min-width:0"><div class="board"><table><thead><tr><th class="rh"></th>${idx.map(i => `<th class="${S.paneKind === 'day' && S.paneDay === i ? 'sel' : ''}"><button ${go({ paneKind: 'day', paneDay: i, paneLoc: null })} title="Compare all Locations on ${dTitle(i)}">${dCol(i)[0]}<b>${dCol(i)[1]}</b></button></th>`).join('')}<th class="sum"></th></tr></thead><tbody>${LOCS.map(l => `<tr><td class="rh${S.paneKind === 'loc' && S.paneLoc === l ? ' sel' : ''}"><button ${go({ paneKind: 'loc', paneLoc: l, paneDay: null })}>${glyphKey(l)}${LN(l)}</button></td>${idx.map(i => { const c = boardCell(l, i), sel = S.paneKind === 'cell' && S.paneLoc === l && S.paneDay === i; return `<td><button class="bc${c.na ? ' na' : ''}${sel ? ' sel' : ''}" title="${esc(LN(l) + ' · ' + dTitle(i) + ' · ' + c.title)}" style="${c.na ? '' : `background:${c.bg};color:${c.fg || 'inherit'}`}" ${go({ paneKind: 'cell', paneLoc: l, paneDay: i })}>${c.html}</button></td>`; }).join('')}<td class="sum">${sumFor(l)}</td></tr>`).join('')}${['sales', 'labor', 'ot', 'cr'].includes(S.metric) ? `<tr><td class="rh" style="font-size:12px;color:var(--text-tertiary);padding-left:4px">All Locations</td>${idx.map(i => `<td style="text-align:center;font-size:11px;color:var(--text-secondary)">${colSum(i)}</td>`).join('')}<td></td></tr>` : ''}</tbody></table></div>
        <div class="board-legend" style="margin-top:var(--space-2)">${legendFor()}<span style="margin-left:auto">Click a cell for that Business Day · a Location for its trend · a date to compare Locations</span></div></div>`;
      const pane = S.paneKind ? paneHtml(idx) : '';
      after(() => { const b = document.querySelector('.board'); if (b) b.scrollLeft = b.scrollWidth; }); // newest Business Days stay in view
      body = `<div class="board-wrap${pane ? ' has-pane' : ''}"><div class="stack">${table}${S.paneKind ? '' : boardCharts(idx)}</div>${pane}</div>`;
    } else {
      const map = { flags: ['HR Flags', () => flagsBody(LOCS)], writeups: ['Write-ups', () => writeupsBody(LOCS)], tips: ['Tip Distribution', () => tipsBody(LOCS, (l, day) => toBoard(l, day))], employees: ['Employees', () => employeesBody(LOCS)], settings: ['Settings', settingsBody] };
      crumb = crumbs([[map[S.page][0]]]); head = pageHead(map[S.page][0], ['All Locations']); body = map[S.page][1]();
    }
    return `<div class="app${S.navOpen ? ' nav-open' : ''}">${nav(S.page, navItems('C'))}<div class="col">${topbar(crumb)}<div class="scroll"><main class="page${S.page === 'home' ? ' page--home' : ''}">${head}${body}</main></div></div></div>`;
  }
  function legendFor() {
    const sw = (bg, t) => `<span><i style="background:${bg}"></i>${t}</span>`;
    if (S.metric === 'sales') return sw('var(--chart-current)', 'Up vs last week') + sw('var(--neutral-400)', 'Down') + sw('var(--warning-bg)', 'Down 6% or more') + '<span>Numbers are % change</span>';
    if (S.metric === 'labor') return sw('var(--seq-1)', 'Under target') + sw('var(--seq-3)', 'Up to 3 pts over') + sw('var(--seq-5)', '5+ pts over') + `<span>▲ ${OVER}+ pts over ${S.perLocTarget ? "its Location target" : `the ${ORG_TARGET}% target`}</span>`;
    if (S.metric === 'ot') return sw('var(--seq-1)', '< 1 h') + sw('var(--seq-3)', '1.6–2.2 h') + sw('var(--seq-5)', '2.6 h+');
    if (S.metric === 'flags') return sw('var(--warning-bg)', 'Flags raised that day');
    return ['submitted', 'late', 'overdue', 'amended', 'draft', 'closed'].filter(s => S.metric === 'cr' || ['draft'].includes(s)).map(s => `<span style="display:inline-flex;gap:4px;align-items:center">${O.cell(S.metric === 'tips' ? 'tipDistribution' : 'closingReport', S.metric === 'tips' ? ({ submitted: 'finalized', draft: 'draft', late: 'reopened' })[s] || 'noPool' : s, { size: 'sm' })}${S.metric === 'tips' ? '' : O.STATUS.closingReport[s].label}</span>`).join('') + (S.metric === 'tips' ? '<span>Finalized · Reopened · Draft · No pool</span>' : '');
  }
  function boardCharts(idx) {
    if (!seesSales()) return '';
    return `<div class="g-2">${chartCard('Net sales by Location', `${idx.length} Business Days`, el => O.charts.line(el, { labels: idx.map(i => String(dCol(i)[1])), tipLabels: idx.map(dTitle), height: 200, endLabels: true, legend: false, yFormat: v => F.money(v, { compact: true }), series: LOCS.map(l => ({ name: LN(l), values: idx.map(i => D[l][i].sales), color: O.loc(l).color, glyph: O.loc(l).glyph })), onClick: i => set({ paneKind: 'day', paneDay: idx[i], paneLoc: null }) }))}${chartCard('Net sales change by Location', `${rangeTitleN(idx)} vs the week before`, el => O.charts.diverging(el, { unit: '%', threshold: 3, labelWidth: 96, rows: LOCS.map(l => ({ label: LN(l), id: l, value: +pctChange(agg([l], idx).sales, agg([l], idx.map(i => i - 7)).sales).toFixed(1) })), onClick: r => set({ paneKind: 'loc', paneLoc: r.id }) }))}</div>`;
  }
  const rangeTitleN = idx => `${dTitle(idx[0])} – ${dTitle(idx[idx.length - 1])}`;
  function paneHtml(idx) {
    const close = `<button class="op-btn op-btn--ghost op-btn--sm op-icon-btn" aria-label="Close" ${go({ paneKind: null })}>${I('x', 16)}</button>`;
    if (S.paneKind === 'cell') {
      const l = S.paneLoc, i = S.paneDay, dd = dayBody(l, i);
      return `<aside class="op-card pane"><div class="cardh"><span class="t">${glyphKey(l)}<b class="h3">${LN(l)} · ${dTitle(i)}</b></span><span style="display:flex;gap:2px"><button class="op-btn op-btn--secondary op-btn--sm op-icon-btn" aria-label="Previous Business Day" ${i > 0 ? go({ paneDay: i - 1 }) : 'disabled'}>${I('chevron-left', 16)}</button><button class="op-btn op-btn--secondary op-btn--sm op-icon-btn" aria-label="Next Business Day" ${i < LAST ? go({ paneDay: i + 1 }) : 'disabled'}>${I('chevron-right', 16)}</button>${close}</span></div><div class="pane-b">${dd.header ? dd.header + dd.notesC + dd.figures + dd.topT : dd}</div></aside>`;
    }
    if (S.paneKind === 'loc') {
      const l = S.paneLoc, a = agg([l], idx), b = agg([l], idx.map(i => i - 7));
      return `<aside class="op-card pane"><div class="cardh"><span class="t">${glyphKey(l)}<b class="h3">${LN(l)}</b><span class="tert" style="font-size:12px">${O.loc(l).city}</span></span>${close}</div><div class="pane-b">
        <div class="kv">${seesSales() ? `<span>Net sales</span><span>${F.money(a.sales)} <span class="tert" style="font-weight:400">${F.delta(pctChange(a.sales, b.sales))}</span></span><span>Labor %</span><span class="${a.labor > target(l) + OVER ? 'bad' : ''}">${F.pct(a.labor)} <span class="tert" style="font-weight:400">target ${target(l)}%</span></span><span>Overtime</span><span>${a.ot.toFixed(1)} h</span>` : ''}<span>Closing Reports on time</span><span>${idx.filter(i => ['submitted', 'amended'].includes(D[l][i].cr)).length}/${idx.filter(i => D[l][i].cr !== 'closed').length}</span>${seesDiscipline() ? `<span>Open HR Flags</span><span>${FLAGS.filter(f => f.loc === l && f.state !== 'resolved').length}</span>` : ''}<span>GM</span><span>${STAFF[l][0]}</span></div>
        ${seesSales() ? chartCard('Net sales', 'dashed = week before', el => O.charts.line(el, { labels: idx.map(i => String(dCol(i)[1])), tipLabels: idx.map(dTitle), height: 150, legend: false, yFormat: v => F.money(v, { compact: true }), series: [{ name: 'Net sales', values: idx.map(i => D[l][i].sales), color: O.loc(l).color, area: true }, { name: 'Week before', values: idx.map(i => D[l][i - 7] ? D[l][i - 7].sales : null), color: 'var(--chart-prior)', dashed: true }], onClick: k => set({ paneKind: 'cell', paneDay: idx[k] }) })) + chartCard('Labor %', `target ${target(l)}%`, el => O.charts.line(el, { labels: idx.map(i => String(dCol(i)[1])), tipLabels: idx.map(dTitle), height: 130, legend: false, target: target(l), yFormat: v => F.pct(v, 0), series: [{ name: 'Labor %', values: idx.map(i => D[l][i].labor), color: 'var(--chart-current)' }], onClick: k => set({ paneKind: 'cell', paneDay: idx[k] }) })) : ''}
        ${attnCard(attention([l]), 5, 'Needs attention here')}</div></aside>`;
    }
    const i = S.paneDay;
    return `<aside class="op-card pane"><div class="cardh"><span class="t"><b class="h3">${dTitle(i)}</b><span class="tert" style="font-size:12px">All Locations</span></span><span style="display:flex;gap:2px"><button class="op-btn op-btn--secondary op-btn--sm op-icon-btn" aria-label="Previous Business Day" ${go({ paneDay: i - 1 })}>${I('chevron-left', 16)}</button><button class="op-btn op-btn--secondary op-btn--sm op-icon-btn" aria-label="Next Business Day" ${i < LAST ? go({ paneDay: i + 1 }) : 'disabled'}>${I('chevron-right', 16)}</button>${close}</span></div><div class="pane-b">
      <table class="op-table"><thead><tr><th>Location</th><th>Report</th>${seesSales() ? '<th class="num">Sales</th><th class="num">vs wk</th><th class="num">Labor</th>' : ''}</tr></thead><tbody>${LOCS.map(l => { const d = D[l][i], p = D[l][i - 7]; return `<tr ${go({ paneKind: 'cell', paneLoc: l })}><td><span class="glyph">${glyphKey(l)}${LN(l)}</span></td><td>${O.cell('closingReport', d.cr, { size: 'sm', title: O.STATUS.closingReport[d.cr].label })}</td>${seesSales() ? `<td class="num">${d.closed ? '—' : F.money(d.sales, { compact: true })}</td><td class="num muted">${d.closed || !p || p.closed ? '—' : F.delta(pctChange(d.sales, p.sales), '%', 0)}</td><td class="num${d.labor > target(l) + OVER ? ' bad' : ''}">${d.closed ? '—' : F.pct(d.labor)}</td>` : ''}</tr>`; }).join('')}</tbody></table>
      ${seesSales() ? chartCard('Labor % by Location', `${dTitle(i)}`, el => O.charts.hbar(el, { target: S.perLocTarget ? undefined : ORG_TARGET, max: 36, labelWidth: 90, valueName: 'Labor %', rows: LOCS.filter(l => !D[l][i].closed).map(l => ({ label: LN(l), id: l, value: D[l][i].labor, tone: D[l][i].labor > target(l) + OVER ? 'warning' : null })), onClick: r => set({ paneKind: 'cell', paneLoc: r.id }) })) : ''}
      <div class="op-card" style="padding:var(--space-4);display:grid;gap:var(--space-3)"><b class="h3">Notes across Locations</b>${LOCS.filter(l => !D[l][i].closed && !['overdue'].includes(D[l][i].cr)).map(l => { const n = notesFor(l, i), first = SECTIONS.map(k => [k, n[k]]).filter(x => x[1]).slice(0, 2); return `<div class="note"><b style="display:flex;gap:6px;align-items:center">${glyphKey(l)}${LN(l)}</b>${first.map(x => `<p><span class="tert">${x[0]}:</span> ${x[1]}</p>`).join('') || '<p class="none">Nothing noted</p>'}</div>`; }).join('')}</div></div></aside>`;
  }

  function settingsBody() {
    return `<div class="op-card" style="padding:var(--space-5);display:grid;gap:var(--space-4);max-width:640px"><b class="h3">Organization settings that change these dashboards</b>
      <div class="section-note">Mirrors the prototype bar's toggles so the founder can see where they would live.</div>
      ${`<div style="display:grid;gap:var(--space-2)"><b style="font-weight:500">Labor % target per Location</b><span class="muted" style="font-size:13px">A day ${OVER}+ points over its Location's target is an exception. Across Locations, the target is the sales-weighted blend.</span><table class="op-table" style="width:auto"><tbody>${LOCS.map(l => `<tr><td><span class="glyph">${glyphKey(l)}${LN(l)}</span></td><td class="num">${LOC_TARGET[l]}%</td></tr>`).join('')}</tbody></table></div>` + [['opsDiscipline', 'Ops reads discipline', 'Off by default. On: Ops sees HR Flags and Write-ups.']].map(([k, t, d]) => `<label style="display:flex;gap:12px;align-items:flex-start;cursor:pointer"><input type="checkbox" class="op-toggle" id="set-${k}" data-toggle="${k}" ${S[k] ? 'checked' : ''}><span style="display:grid"><b style="font-weight:500">${t}</b><span class="muted" style="font-size:13px">${d}</span></span></label>`).join('')}</div>`;
  }

  /* ───────────── Prototype bar ───────────── */
  const VARIANTS = [['A', 'Pages', 'Sections, a Location page and a Business Day page'], ['B', 'Scope', 'Scope switcher, Location pages with tabs, days in a drawer'], ['C', 'Board', 'Locations x Business Days on one canvas, details in a side pane']];
  function protoBar() {
    const v = VARIANTS.find(x => x[0] === S.variant);
    const bar = `<div class="proto" role="toolbar" aria-label="Prototype controls"><button class="arrow" data-act="prev" title="Previous variant (←)" aria-label="Previous variant">‹</button><span class="lbl"><b>${v[0]}</b>${v[1]}<span class="tert" style="color:var(--proto-dim)"> · ${v[2]}</span></span><button class="arrow" data-act="next" title="Next variant (→)" aria-label="Next variant">›</button><span class="sep"></span><select id="proto-role" data-set="role" aria-label="View as">${Object.entries(PERSONAS).map(([k, p]) => `<option value="${k}" ${S.role === k ? 'selected' : ''}>As ${p.title}</option>`).join('')}</select><button data-act="pop" aria-expanded="${S.pop}">Org toggles</button></div>`;
    const pop = S.pop ? `<div class="proto-pop"><h4>Organization toggle</h4>${[['opsDiscipline', 'Ops reads discipline', 'Org Admin toggle, off by default. Off: Ops sees no HR Flags or Write-ups (switch to "As Ops").']].map(([k, t, d]) => `<label><input type="checkbox" id="pop-${k}" data-toggle="${k}" ${S[k] ? 'checked' : ''}><span><b>${t}</b><small>${d}</small></span></label>`).join('')}<div class="about">Decided: each Location has its own labor % target (exception at ${OVER}+ pts over), and HR sees Sales & Labor. Year-over-year comparison is listed but disabled: the demo has 13 weeks of history. Keys: ← → change variant.</div></div>` : '';
    return bar + pop;
  }

  /* ───────────── Render loop ───────────── */
  function set(patch) {
    if ('scope' in patch || 'page' in patch) patch = Object.assign({ drawer: null }, patch);
    Object.assign(S, patch);
    render();
  }
  function render() {
    post.length = 0; uid = 0;
    const scroll = document.querySelector('.scroll'), y = scroll ? scroll.scrollTop : 0, keep = render.lastKey === S.variant + S.page + S.loc + S.tab + S.scope;
    const html = ({ A: VariantA, B: VariantB, C: VariantC })[S.variant]();
    document.getElementById('app').innerHTML = html;
    document.getElementById('proto').innerHTML = protoBar();
    post.forEach(fn => fn());
    const sc = document.querySelector('.scroll'); if (sc && keep) sc.scrollTop = y;
    render.lastKey = S.variant + S.page + S.loc + S.tab + S.scope;
    if (location.hash.slice(1) !== S.variant) history.replaceState(null, '', '#' + S.variant);
    document.title = `Opsell corporate dashboards · ${S.variant}`;
  }
  function cycle(dir) { const k = VARIANTS.findIndex(v => v[0] === S.variant); set({ variant: VARIANTS[(k + dir + VARIANTS.length) % VARIANTS.length][0], page: 'home', loc: null, day: null, drawer: null, paneKind: null, scopeOpen: false }); }

  document.addEventListener('click', e => {
    const act = e.target.closest('[data-act]');
    if (act) { const a = act.dataset.act; if (a === 'prev') cycle(-1); else if (a === 'next') cycle(1); else if (a === 'pop') set({ pop: !S.pop }); else if (a === 'scope') set({ scopeOpen: !S.scopeOpen }); else if (a === 'close') set({ drawer: null }); else if (a === 'nav') set({ navOpen: !S.navOpen }); return; }
    const el = e.target.closest('[data-go]');
    if (!el) { if (S.scopeOpen && !e.target.closest('.scope-wrap')) set({ scopeOpen: false }); return; }
    e.preventDefault();
    const patch = JSON.parse(el.dataset.go);
    if (el.dataset.rowLoc) Object.assign(patch, S.variant === 'C' ? { page: 'board', paneKind: 'loc', paneLoc: el.dataset.rowLoc } : { page: 'location', loc: el.dataset.rowLoc, tab: S.page === 'sales' ? 'sales' : 'overview' });
    if (el.dataset.day) { const l = el.dataset.dl, i = +el.dataset.day; Object.assign(patch, S.variant === 'A' ? { page: 'day', loc: l, day: i } : S.variant === 'B' ? { drawer: { loc: l, day: i } } : { page: 'board', paneKind: 'cell', paneLoc: l, paneDay: i }); }
    if (patch.day != null && patch.loc && !patch.page && S.variant !== 'A' && S.page !== 'day') { Object.assign(patch, S.variant === 'B' ? { drawer: { loc: patch.loc, day: patch.day } } : { page: 'board', paneKind: 'cell', paneLoc: patch.loc, paneDay: patch.day }); delete patch.loc; delete patch.day; }
    if (patch.day != null && patch.loc && !patch.page && S.variant === 'A') patch.page = 'day';
    if (S.variant === 'C' && patch.page && ['sales', 'reports', 'locations'].includes(patch.page)) { Object.assign(patch, { page: 'board', metric: patch.page === 'sales' ? 'sales' : 'cr', paneKind: patch.loc ? 'loc' : null, paneLoc: patch.loc || null }); }
    if (S.variant !== 'C' && patch.loc && ['sales', 'reports', 'tips'].includes(patch.page)) Object.assign(patch, { page: 'location', tab: patch.page });
    patch.navOpen = false;
    set(patch);
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.set) set({ [t.dataset.set]: t.value });
    if (t.dataset.toggle) set({ [t.dataset.toggle]: t.checked });
  });
  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (e.key === 'ArrowLeft') cycle(-1); else if (e.key === 'ArrowRight') cycle(1); else if (e.key === 'Escape') set({ drawer: null, paneKind: null, scopeOpen: false, pop: false });
  });
  window.addEventListener('hashchange', () => { const v = location.hash.slice(1).toUpperCase(); if (VARIANTS.some(x => x[0] === v) && v !== S.variant) set({ variant: v, page: 'home', drawer: null, paneKind: null }); });

  const h = location.hash.slice(1).toUpperCase(), q = new URLSearchParams(location.search).get('variant');
  S.variant = VARIANTS.some(x => x[0] === h) ? h : VARIANTS.some(x => x[0] === q) ? q : 'A';
  try { Object.assign(S, JSON.parse(new URLSearchParams(location.search).get('state') || '{}')); } catch (e) { /* ?state= is a local screenshot aid only */ }
  render();
})();
