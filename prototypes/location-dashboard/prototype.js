/* PROTOTYPE, throwaway. Location dashboard for "Location dashboard for GM, Manager and Senior-sup" (Opsell1/opsell#41).
   Question: what do a GM, Manager and Senior-sup see and do at their own Locations: what Home shows, how Closing Notes
   go into a Closing Report and are submitted with the HR Flag suggestion review, and how a Tip Distribution is
   built, checked and finalized. Raising a standalone HR Flag and starting a Write-up draft are shown lightly.
   The variants disagree on where the work lives:
     A  Inbox: Home is a to-do list; each flow is a full page with explicit steps.
     B  Dashboard: Home follows the corporate anatomy (KPIs, Needs attention, charts); flows are single pages, Submit and
        Finalize open modals.
     C  Business Day: no dashboard; the landing page is the Business Day itself, Closing Notes and the Tip Distribution
        side by side; people open a popover to raise an HR Flag or start a Write-up.
   The prototype bar switches variant, persona (GM with two Locations, Manager, Senior-sup) and the clock (closing on
   Friday night vs the morning after). All state is in memory; reload resets it.
   Data is mock: Larkspur Bakehouse, Mass Ave (Cambridge, MA) and Court St (Brooklyn, NY). HR Flag extraction is faked with
   keyword rules so it reacts to notes typed in the prototype; the real one is an AI call (see AI extraction of HR Flags). */
(function () {
  const O = window.Opsell, I = O.icon, F = O.fmt;
  Object.assign(O.ICONS, {
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
    'eye-off': '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
    banknote: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
    'list-checks': '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    'calendar-days': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
    'user-round': '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>'
  });

  /* ───────────── Dates ───────────── */
  const LAST = 90; // Fri, Oct 16 2026
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dateOf = i => new Date(2026, 9, 16 - (LAST - i));
  const dTitle = i => { const d = dateOf(i); return `${WD[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}`; };
  const dCol = i => { const d = dateOf(i); return [WD[d.getDay()], d.getDate()]; };

  /* ───────────── Locations and figures (same demo figures as the corporate prototype) ───────────── */
  const LOCS = ['mass', 'court'];
  const LN = id => O.loc(id).name;
  const STATE = { mass: 'MA', court: 'NY' };
  const TARGET = { mass: 30, court: 28 }, OVER = 2;
  let seed = 20261041;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const DEMO_SALES = { court: [7716, 7089, 6104, 6305, 6603, 6755, 6197, 7575, 7100, 5854, 6042, 6634, 6350, 6980], mass: [6896, 6650, 5291, 5508, 5655, 5566, 6000, 6964, 6202, 5425, 5160, 5727, 6062, 6215] };
  const DEMO_LABOR = { court: [27.6, 27.5, 28.5, 27.2, 28.5, 27.8, 27.3, 27.6, 28.4, 28.0, 27.9, 27.5, 27.8, 28.2], mass: [28.0, 28.4, 29.2, 28.0, 33.2, 33.6, 32.2, 33.2, 34.1, 33.7, 33.2, 33.1, 34.1, 33.4] };
  const D = {};
  LOCS.forEach(l => {
    D[l] = [];
    for (let i = 0; i <= LAST; i++) {
      const k = i - 77, base = DEMO_SALES[l][((i % 7) + 7) % 7];
      const sales = k >= 0 ? DEMO_SALES[l][k] : Math.round(base * (1 + (rnd() - 0.5) * 0.1));
      const labor = k >= 0 ? DEMO_LABOR[l][k] : +(28 + (rnd() - 0.5) * 1.4).toFixed(1);
      const cost = Math.round(sales * labor / 100);
      D[l].push({ sales, labor, cost, hours: Math.round(cost / 19.5), ot: +(l === 'mass' && i >= 81 ? 1.4 + rnd() * 1.4 : 0.4 + rnd() * 1.6).toFixed(1), guests: Math.round(sales / (11.3 + (rnd() - 0.5) * 0.6)), card: Math.round(sales * (0.10 + rnd() * 0.012) * 100), declared: Math.round(sales * (0.004 + rnd() * 0.002) * 100) });
    }
  });
  D.mass[LAST].ot = 2.5; D.mass[LAST].card = 68420; D.court[LAST].card = 71135; D.mass[LAST].declared = 2000; D.court[LAST].declared = 3150;
  const live = l => ({ sales: Math.round(D[l][LAST - 6].sales * 0.17), guests: Math.round(D[l][LAST - 6].guests * 0.19) }); // Saturday 8:12 am so far

  /* ───────────── People ───────────── */
  const RANK = { GM: 3, Manager: 2, 'Senior-sup': 1, 'Team Member': 0 };
  const POS = { Barista: 'FOH', Cashier: 'FOH', 'Shift lead': 'FOH', Baker: 'BOH', Manager: 'FOH' };
  const PEOPLE = [
    ['jr', 'Jordan Reyes', 'GM', ['mass', 'court'], 'Manager'], ['hc', 'Hannah Cole', 'Manager', ['mass'], 'Manager'], ['ab', 'Aisha Bello', 'Senior-sup', ['mass'], 'Shift lead'],
    ['za', 'Zoe Adams', 'Team Member', ['mass'], 'Barista'], ['km', 'Kofi Mensah', 'Team Member', ['mass'], 'Barista'], ['lt', 'Lucy Tran', 'Team Member', ['mass'], 'Cashier'], ['jp', 'Jamal Price', 'Team Member', ['mass'], 'Cashier'],
    ['rp', 'Ravi Patel', 'Team Member', ['mass'], 'Cashier'], ['ms', 'Marco Silva', 'Team Member', ['mass'], 'Baker'], ['da', 'Diego Alvarez', 'Team Member', ['mass'], 'Baker'],
    ['rd', 'Rosa Diaz', 'Manager', ['court'], 'Manager'], ['oh', 'Omar Haddad', 'Senior-sup', ['court'], 'Shift lead'], ['mz', 'Ming Zhao', 'Team Member', ['court'], 'Barista'], ['nb', 'Nora Bell', 'Team Member', ['court'], 'Cashier'],
    ['mk', 'Maya Kim', 'Team Member', ['court'], 'Barista'], ['tg', 'Theo Grant', 'Team Member', ['court'], 'Baker'], ['kj', 'Kara Jensen', 'Team Member', ['court'], 'Cashier']
  ].map(([id, name, role, locs, pos], k) => ({ id, name, role, locs, pos, pid: 1001 + k, first: name.split(' ')[0] }));
  const P = id => PEOPLE.find(p => p.id === id);
  const PN = id => id ? P(id).name : '';
  const PERSONAS = { gm: 'jr', mgr: 'hc', ss: 'ab' };
  const staffAt = l => PEOPLE.filter(p => p.locs.includes(l));

  /* ───────────── Prototype state ───────────── */
  const S = {
    variant: 'A', persona: 'gm', clock: 'morning', page: 'home', loc: 'mass', day: null, scope: 'all', step: null,
    modal: null, drawer: null, pop: false, scopeOpen: false, toast: null, editNote: null, review: null, editHours: null, addLine: null,
    person: null, composeSec: 'Staffing', mgrFlags: true, aiInjury: true, navOpen: false
  };
  const me = () => P(PERSONAS[S.persona]);
  const myLocs = () => me().locs;
  const isLead = () => me().role === 'GM' || me().role === 'Manager';
  const isSS = () => me().role === 'Senior-sup';
  const CUR = () => S.clock === 'closing' ? LAST : LAST + 1;    // Business Day in progress
  const PREV = () => S.clock === 'closing' ? LAST - 1 : LAST;   // most recent finished Business Day
  const nowLabel = () => S.clock === 'closing' ? 'Fri 9:40 pm' : 'Sat 8:12 am';
  const nowTime = () => S.clock === 'closing' ? '21:41' : '08:14';
  const greet = () => `${S.clock === 'closing' ? 'Good evening' : 'Good morning'}, ${me().first}`;

  /* ───────────── Closing Reports ───────────── */
  const SECTIONS = ['Staffing', 'Guests', 'Facility & Equipment', 'Product & Inventory', 'Other'];
  const NOTE_LIB = {
    Staffing: ['Ran one short on the line from 11 to 2; covered the register myself.', 'New barista shadowed the morning shift.', 'Two call-outs covered by swaps, no overtime.', 'Fully staffed.'],
    Guests: ['Large school group at 3 pm, 40 covers in 20 minutes.', 'One complaint about wait time at peak; comped a pastry.', 'Steady day, no issues.', 'Catering pickup for 60 left on time.'],
    'Facility & Equipment': ['Dish machine slow to heat in the morning.', 'Front door closer sticking; placed a work order.', 'Walk-in logged 39°F at close.'],
    'Product & Inventory': ['Sold out of morning buns by 10:30.', 'Waste on sourdough higher than usual, 14 loaves.', 'Oat milk delivery short by 2 cases.'],
    Other: ['Deposit dropped at 4:40 pm.', 'Fire inspection passed.']
  };
  let nid = 0;
  const note = (by, text, extra) => Object.assign({ id: 'n' + (++nid), by, text }, extra || {});
  const REP = {};
  function rep(l, i) {
    const key = `${l}-${i}`;
    if (REP[key]) return REP[key];
    const writers = staffAt(l).filter(p => p.role !== 'Team Member' && p.role !== 'GM').map(p => p.id);
    const r = { l, i, state: 'submitted', notes: {}, photos: {}, pending: [], dismissed: [], author: pick(writers), at: `0${7 + Math.floor(rnd() * 2)}:${10 + Math.floor(rnd() * 49)}`, touched: false };
    SECTIONS.forEach(s => { r.notes[s] = []; r.photos[s] = []; if (rnd() < 0.7) r.notes[s].push(note(pick(writers), pick(NOTE_LIB[s]))); if (rnd() < 0.25) r.notes[s].push(note(pick(writers), pick(NOTE_LIB[s]))); });
    if (rnd() < 0.07) { r.state = 'late'; r.at = `1${Math.floor(rnd() * 2)}:${10 + Math.floor(rnd() * 49)}`; }
    return (REP[key] = r);
  }
  const blank = (l, i, state) => { const r = rep(l, i); r.state = state; r.author = null; r.at = null; SECTIONS.forEach(s => { r.notes[s] = []; r.photos[s] = []; }); return r; };
  // Fri, Oct 16 at Mass Ave: a shared draft with three writers, the case the founder amendment is about
  (() => {
    const r = blank('mass', LAST, 'draft');
    r.notes.Staffing = [note('ab', 'Jamal Price 40 min late, third time this month.'), note('hc', 'Marco and Diego stayed for the MIT catering order (8 dozen croissants), 2.5 h overtime.'), note('ab', 'Kofi and Sam swapped the 2 pm break without asking.')];
    r.notes.Guests = [note('ab', 'Steady day. One complaint about the wait at noon; comped a pastry.')];
    r.notes['Facility & Equipment'] = [note('hc', 'HVAC tech came in to fix the ice machine; back to normal by 3 pm.')];
    r.photos['Facility & Equipment'] = ['IMG_2041.jpg'];
    r.notes['Product & Inventory'] = [note('ab', 'Sold out of morning buns by 10:30; asking for a second bake on Fridays.')];
    r.lastEdit = ['ab', '21:12'];
    // Court St: still drafting on Friday night, submitted by Rosa Diaz before the morning
    const c = blank('court', LAST, 'draft');
    c.notes.Staffing = [note('oh', 'Fully staffed. Ming covered the afternoon at Mass Ave.')];
    c.notes.Guests = [note('oh', 'Catering pickup for 60 left on time.')];
    c.morning = { state: 'submitted', author: 'rd', at: '07:41', notes: { 'Product & Inventory': [note('rd', 'Oat milk delivery short by 2 cases.')] } };
    c.lastEdit = ['oh', '21:05'];
    blank('court', LAST - 2, 'overdue');
    // Thu at Mass Ave: Hannah submitted, the AI extraction timed out, two suggestions wait for her
    const t = rep('mass', LAST - 1); t.author = 'hc'; t.at = '07:52'; t.state = 'submitted';
    t.notes.Staffing = [note('hc', "Lucy Tran's drawer was $22 short at close; recounted twice."), note('ab', 'Zoe Adams cut her finger slicing bread; bandaged on site and finished her shift.')];
    t.pending = null; // filled by extraction below, once the helpers exist
    // Wed at Mass Ave: Aisha submitted late, one suggestion waits for her
    const w = rep('mass', LAST - 2); w.author = 'ab'; w.at = '11:42'; w.state = 'late';
    w.notes.Other = [note('ab', 'Ravi Patel on the phone at the register during the lunch rush, against policy.')];
    w.pending = null;
  })();
  const crView = (l, i) => { const r = rep(l, i); return S.clock === 'morning' && r.morning && !r.touched ? Object.assign({}, r, r.morning, { notes: Object.assign({}, r.notes, ...Object.keys(r.morning.notes).map(k => ({ [k]: r.notes[k].concat(r.morning.notes[k]) }))) }) : r; };
  const crState = (l, i) => i > CUR() ? null : i === CUR() && i > LAST ? 'draft' : crView(l, i).state;
  const noteCount = r => SECTIONS.reduce((s, k) => s + r.notes[k].length, 0);
  const writersOf = r => [...new Set(SECTIONS.flatMap(k => r.notes[k].map(n => n.by)))];
  const canDraft = l => myLocs().includes(l);
  const editable = (l, i) => canDraft(l) && ['draft', 'overdue'].includes(crState(l, i)) && i <= LAST;

  /* ───────────── HR Flag extraction (faked: keyword rules + roster matching) ───────────── */
  const HR_CATS = ['Attendance', 'No-call no-show', 'Conduct', 'Policy violation', 'Cash handling', 'Food safety', 'Workplace injury', 'Harassment or discrimination complaint', 'Other'];
  const RULES = [
    [/\b(no[- ]call|no[- ]show|didn'?t show|never showed)\b/i, 'No-call no-show'],
    [/\b(\d+ ?min(utes)? late|came in late|was late|late again|left early|tardy)\b/i, 'Attendance'],
    [/\b(short|drawer was|missing cash|over by)\b/i, 'Cash handling'],
    [/\b(burn(ed|t)?|cut (her|his|their)|fell|slipped|injur\w*|hurt)\b/i, 'Workplace injury'],
    [/\b(harass\w*|discriminat\w*|inappropriate comment)\b/i, 'Harassment or discrimination complaint'],
    [/\b(yell\w*|rude|argu\w*|fight\w*|swore|threat\w*)\b/i, 'Conduct'],
    [/\b(without asking|on the phone|uniform|against policy)\b/i, 'Policy violation'],
    [/\b(expired|undercooked|cross[- ]contam\w*|no gloves|left out)\b/i, 'Food safety']
  ];
  const COMMON = ['Sam', 'Alex', 'Chris', 'Jess', 'Mike', 'Kate', 'Tony', 'Dan', 'Nick', 'Max'];
  let sid = 0;
  function extract(l, notes, author) {
    const roster = staffAt(l).concat(P('mz')); // covering shifts count as people at the Location
    const out = [];
    notes.forEach(n => {
      n.text.split(/(?<=[.;!?])\s+/).forEach(sent => {
        RULES.forEach(([re, cat]) => {
          if (!re.test(sent) || (cat === 'Workplace injury' && !S.aiInjury)) return;
          const found = roster.filter((p, k, a) => a.indexOf(p) === k && p.id !== n.by && (sent.includes(p.name) || new RegExp(`\\b${p.first}\\b`).test(sent)));
          found.forEach(p => out.push({ k: 's' + (++sid), cat, emp: p.id, name: p.name, noteId: n.id, by: n.by, evidence: sent, note: n.text, text: sent, status: 'pending' }));
          COMMON.filter(c => new RegExp(`\\b${c}\\b`).test(sent) && !roster.some(p => p.first === c)).forEach(c => out.push({ k: 's' + (++sid), cat, emp: null, name: c, noteId: n.id, by: n.by, evidence: sent, note: n.text, text: sent, status: 'pending' }));
        });
      });
    });
    return out.filter(s => s.emp !== author);
  }
  const allNotes = r => SECTIONS.flatMap(k => r.notes[k]);
  rep('mass', LAST - 1).pending = extract('mass', allNotes(rep('mass', LAST - 1)), 'hc');
  rep('mass', LAST - 2).pending = extract('mass', allNotes(rep('mass', LAST - 2)), 'ab');

  /* ───────────── HR Flags and Write-ups ───────────── */
  const FLAGS = [
    { id: 'F-211', cat: 'Cash handling', emp: 'nb', loc: 'court', day: 87, state: 'open', source: 'Closing Report', by: 'rd', text: 'Register 2 short $38 at close.' },
    { id: 'F-208', cat: 'Attendance', emp: 'jp', loc: 'mass', day: 84, state: 'open', source: 'Closing Report', by: 'hc', text: '35 min late for the 6 am bake.', wu: 'W-89' },
    { id: 'F-207', cat: 'Attendance', emp: 'ab', loc: 'mass', day: 79, state: 'resolved', outcome: 'Coached', source: 'Standalone', by: 'hc', text: 'Left 45 min early without cover.' },
    { id: 'F-209', cat: 'Conduct', emp: 'hc', loc: 'mass', day: 82, state: 'open', source: 'Standalone', by: 'jr', text: 'Raised voice at a Team Member in front of guests.' },
    { id: 'F-201', cat: 'Food safety', emp: 'da', loc: 'mass', day: 70, state: 'resolved', outcome: 'Coached', source: 'Closing Report', by: 'ab', text: 'Cream left out of the walk-in over the afternoon.' },
    { id: 'F-196', cat: 'Conduct', emp: 'ms', loc: 'mass', day: 28, state: 'resolved', outcome: 'Write-up', source: 'Standalone', by: 'jr', text: 'Argument with a coworker on the line.' }
  ];
  const WRITEUPS = [
    { id: 'W-89', emp: 'jp', loc: 'mass', level: 'Final written warning', cat: 'Attendance', day: 86, state: 'ready', by: 'jr', flags: ['F-208'] },
    { id: 'W-90', emp: 'km', loc: 'mass', level: 'Documented verbal warning', cat: 'Policy violation', day: 89, state: 'draft', by: 'hc', flags: [] },
    { id: 'W-84', emp: 'jp', loc: 'mass', level: 'Written warning', cat: 'Attendance', day: 74, state: 'refused', by: 'hc', rebuttal: true },
    { id: 'W-82', emp: 'hc', loc: 'mass', level: 'Documented verbal warning', cat: 'Conduct', day: 60, state: 'signed', by: 'jr' },
    { id: 'W-76', emp: 'ms', loc: 'mass', level: 'Suspension', cat: 'Conduct', day: 30, state: 'signed', by: 'jr' },
    { id: 'W-80', emp: 'nb', loc: 'court', level: 'Documented verbal warning', cat: 'Cash handling', day: 55, state: 'signed', by: 'rd' }
  ];
  const LEVELS = ['Documented verbal warning', 'Written warning', 'Final written warning', 'Suspension'];
  const WU_CATS = ['Attendance/Tardiness', 'No-call no-show', 'Conduct', 'Policy violation', 'Food safety', 'Cash handling', 'Performance', 'Safety', 'Other'];
  // Visibility (HR Flag workflow, Write-up workflow): GM/Manager see Roles below theirs at their Locations, plus what they raised; never about themselves
  const below = id => RANK[P(id).role] < RANK[me().role];
  const seesFlag = f => isLead() && (me().role === 'GM' || S.mgrFlags) && myLocs().includes(f.loc) && f.emp !== me().id && (below(f.emp) || f.by === me().id);
  const seesWU = w => w.state === 'draft' ? w.by === me().id : isLead() && myLocs().includes(w.loc) && w.emp !== me().id && (below(w.emp) || w.by === me().id);
  const byRank = (a, b) => RANK[a.role] - RANK[b.role] || a.name.localeCompare(b.name);
  const flagTargets = () => PEOPLE.filter(p => p.id !== me().id && p.locs.some(l => myLocs().includes(l))).sort(byRank);
  const wuTargets = () => PEOPLE.filter(p => below(p.id) && p.locs.some(l => myLocs().includes(l))).sort(byRank);
  // Delivered Write-ups (signed or refused) in the 12-month lookback drive the ladder; one waiting for delivery is shown but not counted
  const activeWU = id => WRITEUPS.filter(w => w.emp === id && ['signed', 'refused'].includes(w.state) && w.day > LAST - 365);
  const onFileWU = id => WRITEUPS.filter(w => w.emp === id && ['signed', 'refused', 'ready'].includes(w.state) && w.day > LAST - 365);
  const nextLevel = id => { const a = activeWU(id); if (!a.length) return LEVELS[0]; const top = Math.max(...a.map(w => LEVELS.indexOf(w.level))); return LEVELS[Math.min(top + 1, LEVELS.length - 1)]; };

  /* ───────────── Tip Distribution ───────────── */
  const POLICY = {
    mass: { weights: { Barista: 1.0, Cashier: 0.9, 'Shift lead': 1.0 }, since: 'Sep 1, 2026', by: 'Marcus Lee (Ops)', credit: 'No tip credit', version: 3 },
    court: { weights: { Barista: 1.0, Cashier: 1.0, 'Shift lead': 1.1 }, since: 'Aug 15, 2026', by: 'Marcus Lee (Ops)', credit: 'No tip credit', version: 2 }
  };
  let lid = 0;
  const line = (emp, pos, hours, extra) => Object.assign({ id: 'L' + (++lid), emp, pos, hours, status: 'approved', declared: 0 }, extra || {});
  const TIP = {};
  function tip(l, i) {
    const key = `${l}-${i}`;
    if (TIP[key]) return TIP[key];
    const lines = staffAt(l).filter(p => rnd() < 0.8 || p.role === 'Senior-sup').map(p => { const ran = p.role === 'Senior-sup' && rnd() < 0.7; return line(p.id, ran || p.role !== 'Senior-sup' ? p.pos : 'Barista', +(4 + Math.round(rnd() * 9) / 2).toFixed(1), { ranShift: ran, declared: POS[p.pos] === 'FOH' ? Math.round(rnd() * 12) * 100 : 0 }); });
    const t = { l, i, state: 'finalized', card: D[l][i].card, cash: Math.round(D[l][i].sales * (0.018 + rnd() * 0.006)) * 100, lines, by: pick(staffAt(l).filter(p => isLeadRole(p)).map(p => p.id)), at: `1${Math.floor(rnd() * 3)}:${10 + Math.floor(rnd() * 49)}`, version: 1 };
    return (TIP[key] = t);
  }
  const isLeadRole = p => p.role === 'GM' || p.role === 'Manager';
  (() => {
    const m = tip('mass', LAST);
    Object.assign(m, { state: 'draft', cash: null, by: null, at: null, lines: [
      line('za', 'Barista', 7.5, { declared: 1200 }), line('km', 'Barista', 6.0), line('lt', 'Cashier', 8.0, { declared: 800 }), line('jp', 'Cashier', 5.5),
      line('mz', 'Barista', 4.0, { covering: 'court' }), line('rp', 'Cashier', 5.0, { status: 'unapproved' }), line('ab', 'Shift lead', 8.5, { ranShift: true }),
      line('ms', 'Baker', 7.0), line('da', 'Baker', 6.5), line('hc', 'Manager', 9.0)] });
    const c = tip('court', LAST);
    Object.assign(c, { state: 'draft', cash: null, by: null, at: null, lines: [
      line('oh', 'Shift lead', 8.0, { ranShift: true, declared: 600 }), line('mk', 'Barista', 7.0, { declared: 900 }), line('nb', 'Cashier', 6.5), line('kj', 'Cashier', 5.0), line('tg', 'Baker', 7.5), line('rd', 'Manager', 8.5)] });
    const th = tip('mass', LAST - 1); th.by = 'hc'; th.at = '11:02';
  })();
  const tipState = (l, i) => i > LAST ? null : i === LAST && S.clock === 'closing' ? 'pending' : tip(l, i).state;
  const hoursOf = x => x.adj ? x.adj.hours : x.hours;
  function elig(x, l) {
    const p = P(x.emp), pol = POLICY[l];
    if (p.role === 'GM' || p.role === 'Manager') return { ok: false, why: `${p.role}s never share in tips`, kind: 'law' };
    if (p.role === 'Senior-sup' && STATE[l] === 'MA' && x.ranShift) return { ok: false, why: 'Massachusetts: a Senior-sup who ran the shift never shares', kind: 'law' };
    if (POS[x.pos] === 'BOH' && ['MA', 'NY'].includes(STATE[l])) return { ok: false, why: `Back-of-house never shares in ${STATE[l]}`, kind: 'law' };
    if (!pol.weights[x.pos]) return { ok: false, why: 'Position not eligible under the Tip Policy', kind: 'policy' };
    if (x.status === 'unapproved' && !x.adj) return { ok: false, why: 'Timesheet not approved: left out until it is approved in the time clock, or add the hours by hand', kind: 'data' };
    return { ok: true };
  }
  // pool x (hours x weight) / sum(hours x weight); largest remainder to the cent, ties to most hours then payroll ID
  function shares(pool, rows) {
    const tot = rows.reduce((s, r) => s + r.pts, 0), out = {};
    if (!tot || !pool) { rows.forEach(r => { out[r.id] = 0; }); return out; }
    const raw = rows.map(r => ({ r, v: pool * r.pts / tot }));
    raw.forEach(x => { out[x.r.id] = Math.floor(x.v); });
    let left = pool - raw.reduce((s, x) => s + Math.floor(x.v), 0);
    raw.slice().sort((a, b) => (b.v - Math.floor(b.v)) - (a.v - Math.floor(a.v)) || b.r.h - a.r.h || P(a.r.emp).pid - P(b.r.emp).pid).forEach(x => { if (left > 0) { out[x.r.id]++; left--; } });
    return out;
  }
  function split(l, i) {
    const t = tip(l, i), pol = POLICY[l];
    const rows = t.lines.map(x => { const e = elig(x, l), h = hoursOf(x), w = pol.weights[x.pos] || 0; return Object.assign({}, x, { h, w, ok: e.ok, why: e.why, kind: e.kind, pts: e.ok ? h * w : 0 }); });
    const ok = rows.filter(r => r.ok), cash = t.cash || 0;
    const cs = shares(t.card, ok), ks = shares(cash, ok);
    rows.forEach(r => { r.cardShare = r.ok ? cs[r.id] : 0; r.cashShare = r.ok ? ks[r.id] : 0; r.total = r.cardShare + r.cashShare; });
    const pts = ok.reduce((s, r) => s + r.pts, 0), hrs = ok.reduce((s, r) => s + r.h, 0);
    return { t, rows, ok, out: rows.filter(r => !r.ok), pool: t.card + cash, pts, hrs, perHour: hrs ? (t.card + cash) / hrs : 0, blocked: t.card + cash > 0 && !pts, needsCash: t.cash == null };
  }
  const $ = c => F.money(c / 100, { cents: true });

  /* ───────────── What is due (feeds every variant's Home) ───────────── */
  function dueItems(locs) {
    locs = locs || myLocs();
    const u = me(), out = [];
    locs.forEach(l => {
      const i = LAST, st = crState(l, i);
      if (st === 'draft') { const r = crView(l, i); out.push({ sev: 1, tile: ['closingReport', 'draft'], title: `Closing Report · ${dTitle(i)}`, detail: `${S.clock === 'closing' ? 'Due tomorrow 10:00' : 'Due 10:00 today'} · shared draft, ${noteCount(r)} Closing Notes by ${writersOf(r).length}`, loc: l, act: { kind: 'report', l, i }, due: S.clock === 'closing' ? 'Sat 10:00' : '10:00' }); }
      for (let d = LAST - 13; d < LAST; d++) if (crState(l, d) === 'overdue') out.push({ sev: 0, tile: ['closingReport', 'overdue'], title: `Closing Report overdue · ${dTitle(d)}`, detail: 'Not submitted. Submit it late, or mark the Business Day closed.', loc: l, act: { kind: 'report', l, i: d }, due: 'Overdue' });
      for (let d = LAST - 6; d <= LAST; d++) { const r = rep(l, d); if (r.pending && r.pending.length && r.author === u.id && r.pending.some(s => s.status === 'pending')) out.push({ sev: 1, tile: ['hrFlag', 'open'], title: `Review ${r.pending.filter(s => s.status === 'pending').length} HR Flag suggestions · ${dTitle(d)}`, detail: 'You submitted this Closing Report; the AI check timed out, so the suggestions wait for you.', loc: l, act: { kind: 'later', l, i: d }, due: 'Today' }); }
      if (isLead()) {
        for (let d = LAST - 6; d <= LAST; d++) { const ts = tipState(l, d); if (ts === 'draft') { const sp = split(l, d); out.push({ sev: 2, tile: ['tipDistribution', 'draft'], title: `Tip Distribution · ${dTitle(d)}`, detail: `${sp.needsCash ? 'Count the cash jar, ' : ''}check hours and finalize · card tips ${$(sp.t.card)}`, loc: l, act: { kind: 'tips', l, i: d }, due: 'Pay Period ends Oct 18' }); } }
        if (S.clock === 'closing') out.push({ sev: 4, tile: ['tipDistribution', 'draft'], title: `Tip Distribution · ${dTitle(LAST)}`, detail: 'Generates automatically after the 4:00 am cutoff', loc: l, act: null, due: 'Tomorrow' });
        out.push(...[[l === 'mass' ? 'rp' : null]].filter(x => x[0] && tipState(l, LAST) === 'draft').map(([id]) => ({ sev: 3, tile: ['dataQuality', 'unapprovedTimesheets'], title: 'Unapproved timesheet', detail: `${PN(id)} · ${dTitle(LAST)} · left out of the Tip Distribution until approved in the time clock`, loc: l, act: { kind: 'tips', l, i: LAST }, due: 'Before finalizing' })));
      }
    });
    if (isLead()) {
      WRITEUPS.filter(w => locs.includes(w.loc) && seesWU(w)).forEach(w => {
        if (w.state === 'ready') out.push({ sev: 2, tile: ['writeUp', 'ready'], title: `Write-up ready to deliver · ${PN(w.emp)}`, detail: `${w.level} · ${w.cat} · ready ${LAST + (S.clock === 'morning' ? 1 : 0) - w.day} days (MA: deliver within 10)`, loc: w.loc, act: { kind: 'wu', id: w.id }, due: 'This week' });
        if (w.state === 'draft') out.push({ sev: 4, tile: ['writeUp', 'draft'], title: `Write-up draft · ${PN(w.emp)}`, detail: `${w.level} · private to you until you submit it`, loc: w.loc, act: { kind: 'wu', id: w.id }, due: '' });
      });
      FLAGS.filter(f => locs.includes(f.loc) && f.state !== 'resolved' && seesFlag(f)).forEach(f => out.push({ sev: 5, tile: ['hrFlag', f.state], title: `HR Flag open with HR · ${PN(f.emp)}`, detail: `${f.cat} · raised ${dTitle(f.day)} by ${PN(f.by)}${f.wu ? ` · linked ${f.wu}` : ''}`, loc: f.loc, act: { kind: 'flag', id: f.id }, due: 'FYI' }));
    }
    return out.sort((a, b) => a.sev - b.sev);
  }

  /* ───────────── HTML helpers ───────────── */
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const go = patch => `data-go="${esc(JSON.stringify(patch))}"`;
  const act = (name, arg) => `data-act="${name}"${arg != null ? ` data-arg="${esc(typeof arg === 'string' ? arg : JSON.stringify(arg))}"` : ''}`;
  const post = []; const after = fn => post.push(fn);
  let uid = 0; const cid = p => `${p}${++uid}`;
  const glyphKey = l => O.seriesKey(O.loc(l).color, O.loc(l).glyph);
  const pctChange = (a, b) => b ? (a / b - 1) * 100 : null;
  const deltaHtml = (v, unit, tone) => v == null ? '' : `<span class="op-delta"${tone ? ` data-tone="${tone}"` : ''}>${I(v >= 0 ? 'arrow-up' : 'arrow-down', 12)}${F.delta(Math.abs(v), unit).replace(/^[+−±]/, '')}</span>`;
  const pageHead = (title, scope, acts, pre) => `<div class="op-pagehead"><div class="ttl">${pre || ''}<h1>${title}</h1><span class="scope">${scope.filter(Boolean).join('<span class="dot"></span>')}</span></div><div class="acts">${acts || ''}</div></div>`;
  const crumbs = parts => `<nav class="op-crumbs">${parts.map((p, k) => k === parts.length - 1 ? `<span aria-current="page">${p[0]}</span>` : `<a ${go(p[1])}>${p[0]}</a>${I('chevron-right', 12)}`).join('')}</nav>`;
  const btn = (label, a, kind, icon, extra) => `<button class="op-btn op-btn--${kind || 'secondary'}${extra && extra.sm ? ' op-btn--sm' : ''}" ${a}${extra && extra.disabled ? ' disabled' : ''}${extra && extra.title ? ` title="${esc(extra.title)}"` : ''}>${icon ? I(icon, 16) : ''}${label}</button>`;
  const sparkOf = (vals, o) => { const v = vals.filter(x => x != null); return v.length > 1 ? O.spark(v, Object.assign({ width: 96 }, o || {})) : ''; };
  function kpi(icon, label, num, unit, viz, foot, patch) {
    return `<a class="op-card op-kpi" ${patch ? go(patch) : ''}><span class="op-kpi-h">${I(icon, 16)}${label}${patch ? `<span class="go">${I('arrow-right', 14)}</span>` : ''}</span><span class="op-kpi-v"><span class="op-kpi-n">${num}${unit ? `<small>${unit}</small>` : ''}</span>${viz || ''}</span><span class="op-kpi-f">${foot}</span></a>`;
  }
  function chartCard(title, sub, draw) {
    const id = cid('c'); after(() => { const el = document.getElementById(id); if (el) draw(el); });
    return `<div class="op-card chart-card"><div class="hd"><div><b class="h3">${title}</b><span class="sub">${sub}</span></div></div><div id="${id}"></div></div>`;
  }
  const alert = (tone, icon, title, body, actHtml) => `<div class="op-alert" data-tone="${tone}">${I(icon, 16)}<div class="body">${title ? `<b>${title}</b>` : ''}<span>${body}</span></div>${actHtml ? `<div class="act">${actHtml}</div>` : ''}</div>`;
  const who = id => `<button class="who-btn" ${act('person', id)}>${PN(id)}</button>`;
  const opener = a => !a ? '' : a.kind === 'report' ? act('open-report', [a.l, a.i]) : a.kind === 'later' ? act('later-review', [a.l, a.i]) : a.kind === 'tips' ? act('open-tips', [a.l, a.i]) : a.kind === 'wu' ? act('wu-open', a.id) : act('flag-open', a.id);
  function dueRow(x) {
    return `<a class="op-row" ${opener(x.act)}>${O.tile(x.tile[0], x.tile[1])}<span class="t"><b>${x.title}</b><span>${esc(x.detail)}</span></span>${myLocs().length > 1 ? O.locTag(LN(x.loc)) : '<span></span>'}<span class="age">${x.due}</span>${x.act ? I('chevron-right', 16) : '<span></span>'}</a>`;
  }

  /* ───────────── Shell ───────────── */
  function navItems() {
    const groups = [[null, [[S.variant === 'C' ? 'day' : 'home', S.variant === 'C' ? 'calendar-days' : 'house', S.variant === 'C' ? 'Business Day' : 'Home']]]];
    const ops = [['reports', 'clipboard-check', 'Closing Reports']]; if (isLead()) ops.push(['sales', 'chart-column', 'Sales & Labor']);
    groups.push(['Operations', ops]);
    const people = []; if (isLead() && (me().role === 'GM' || S.mgrFlags)) people.push(['flags', 'flag', 'HR Flags']); if (isLead()) people.push(['writeups', 'file-pen-line', 'Write-ups']); people.push(['employees', 'users', 'Employees']);
    groups.push(['People', people]);
    if (isLead()) groups.push(['Tips', [['tips', 'hand-coins', 'Tip Distribution']]]);
    groups.push(['Me', [['me', 'user-round', 'My records']]]);
    return groups;
  }
  function nav(current) {
    const u = me(), counts = {};
    const due = dueItems();
    counts.reports = due.filter(x => x.tile[0] === 'closingReport' || x.act && x.act.kind === 'later').length;
    if (isLead()) { counts.tips = due.filter(x => x.tile[0] === 'tipDistribution' && x.act).length; counts.writeups = WRITEUPS.filter(w => seesWU(w) && w.state === 'ready').length; counts.flags = FLAGS.filter(f => seesFlag(f) && f.state !== 'resolved').length; }
    const cnt = n => n ? `<span class="op-count">${n}</span>` : '';
    return `<nav class="op-sidebar"><div class="op-org"><img src="opsell-app-icon.svg" width="24" height="24" alt=""><b>Larkspur Bakehouse</b><span class="op-demo-tag">DEMO</span></div>` +
      navItems().map(([g, list]) => (g ? `<div class="op-nav-group">${g}</div>` : '') + list.map(([key, ic, label]) => `<a class="op-nav-item" ${key === current ? 'aria-current="page"' : ''} ${go({ page: key, step: null, review: null })}>${I(ic, 20)}<span>${label}</span>${cnt(counts[key])}</a>`).join('')).join('') +
      `<div class="op-user">${O.avatar(u.name, 28)}<span class="who"><b>${u.name}</b><span>${u.role} · ${u.locs.map(LN).join(', ')}</span></span>${I('chevrons-up-down', 16)}</div></nav>`;
  }
  function scopeBtn(allowAll) {
    if (myLocs().length < 2) return `<span class="scope-static">${glyphKey(myLocs()[0])}${LN(myLocs()[0])}<span class="tert">${O.loc(myLocs()[0]).city}</span></span>`;
    const cur = allowAll ? S.scope : (S.scope === 'all' ? S.loc : S.scope);
    return `<div class="scope-wrap"><button class="scope-btn" ${act('scope')} aria-expanded="${S.scopeOpen}"><span class="k">Location</span>${cur === 'all' ? I('store', 16) : glyphKey(cur)}${cur === 'all' ? 'My Locations' : LN(cur)}${I('chevron-down', 16)}</button>${S.scopeOpen ? `<div class="op-menu" role="menu">${allowAll ? `<button class="op-menu-item" ${go({ scope: 'all', scopeOpen: false })}>${I('store', 16)}My Locations${cur === 'all' ? I('check', 16) : ''}</button><div class="op-menu-sep"></div>` : ''}${myLocs().map(l => `<button class="op-menu-item" ${go({ scope: l, loc: l, scopeOpen: false })}>${glyphKey(l)}${LN(l)}<span class="tert" style="margin-left:auto;font-size:12px">${STATE[l]}</span>${cur === l ? I('check', 16) : ''}</button>`).join('')}</div>` : ''}</div>`;
  }
  const scopeLocs = () => S.scope === 'all' || !myLocs().includes(S.scope) ? myLocs() : [S.scope];
  function topbar(crumbHtml, extra) {
    return `<div class="op-topbar"><button class="op-btn op-btn--ghost op-icon-btn menu-btn" ${act('nav')} aria-label="Open navigation">${I('menu', 20)}</button>${extra || ''}${crumbHtml || ''}<div class="topacts"><span class="clock">${I('timer', 14)}${nowLabel()}</span><button class="op-btn op-btn--ghost op-icon-btn op-bell" aria-label="Notifications">${I('bell', 20)}${dueItems().filter(x => x.sev <= 1).length ? `<span class="op-count op-count--accent">${dueItems().filter(x => x.sev <= 1).length}</span>` : ''}</button></div></div>`;
  }
  const shell = (navKey, crumbHtml, extra, main, cls) => `<div class="app${S.navOpen ? ' nav-open' : ''}">${nav(navKey)}<div class="col">${topbar(crumbHtml, extra)}<div class="scroll"><main class="page${cls ? ' ' + cls : ''}">${main}</main></div></div></div>`;

  /* ───────────── Closing Report pieces ───────────── */
  const noteLine = (n, l, i, opts) => {
    opts = opts || {};
    const mine = n.by === me().id, can = mine && editable(l, i) && !opts.readonly;
    if (S.editNote === n.id) return `<li class="cn editing"><span class="cn-by">[${PN(n.by)}]</span><div class="op-input op-input--area"><textarea id="edit-${n.id}" rows="2">${esc(n.text)}</textarea></div><span class="cn-acts">${btn('Save', act('note-save', n.id), 'primary', null, { sm: 1 })}${btn('Cancel', act('note-cancel'), 'ghost', null, { sm: 1 })}</span></li>`;
    return `<li class="cn${mine ? ' mine' : ''}"><p><span class="cn-by">[${PN(n.by)}]</span>${n.amend ? '<span class="tert"> (amendment)</span>' : ''}: ${esc(n.text)}</p>${can ? `<span class="cn-acts">${btn('Edit', act('note-edit', n.id), 'ghost', 'pen-line', { sm: 1 })}${btn('', act('note-del', n.id), 'ghost', 'trash-2', { sm: 1, title: 'Delete your Closing Note' })}</span>` : (!opts.readonly && editable(l, i) ? `<span class="cn-lock" title="Only ${PN(n.by)} can edit or delete this Closing Note">${I('lock', 12)}</span>` : '')}</li>`;
  };
  const photosHtml = (r, sec, canAdd) => (r.photos[sec].length || canAdd) ? `<div class="photos">${r.photos[sec].map(p => `<span class="ph" title="${p}">${I('camera', 16)}<span>${p}</span></span>`).join('')}${canAdd ? `<button class="ph add" ${act('photo-add', sec)}>${I('plus', 16)}<span>Photo</span></button>` : ''}</div>` : '';
  const composer = (sec, l, i) => editable(l, i) ? `<div class="composer"><span class="cn-by tert">[${me().name}]:</span><div class="op-input"><input id="cmp-${SECTIONS.indexOf(sec)}" placeholder="Add a Closing Note to ${sec}" data-enter="note-add" data-arg="${esc(sec)}"></div>${btn('Add', act('note-add', sec), 'secondary', null, { sm: 1 })}</div>` : '';
  function sectionCard(r, sec, l, i, opts) {
    const can = editable(l, i) && !(opts && opts.readonly);
    return `<div class="op-card sec"><div class="sec-h"><b class="h3">${sec}</b><span class="tert">${r.notes[sec].length ? `${r.notes[sec].length} Closing Note${r.notes[sec].length > 1 ? 's' : ''}` : 'Nothing noted yet'}</span></div>${r.notes[sec].length ? `<ul class="cns">${r.notes[sec].map(n => noteLine(n, l, i, opts)).join('')}</ul>` : ''}${photosHtml(r, sec, can)}${can ? composer(sec, l, i) : ''}</div>`;
  }
  function figures(l, i, opts) {
    opts = opts || {};
    const d = D[l][i], p = D[l][i - 7], st = crState(l, i), liveFig = ['draft', 'overdue'].includes(st);
    const dl = (a, b) => p ? `<span class="tert" style="font-weight:400"> ${F.delta(pctChange(a, b))}</span>` : '';
    const over = d.labor > TARGET[l] + OVER;
    let kv = `<span>Net sales</span><span>${F.money(d.sales)}${dl(d.sales, p.sales)}</span><span>Guests</span><span>${F.count(d.guests)}${dl(d.guests, p.guests)}</span><span>Hours</span><span>${F.count(d.hours)}${dl(d.hours, p.hours)}</span><span>Overtime</span><span class="${d.ot > 2 ? 'bad' : ''}">${d.ot.toFixed(1)} h</span>`;
    if (!isSS()) kv += `<span>Labor cost</span><span>${F.money(d.cost)}${dl(d.cost, p.cost)}</span><span>Labor % of sales</span><span class="${over ? 'bad' : ''}">${over ? '▲ ' : ''}${F.pct(d.labor)}<span class="tert" style="font-weight:400"> vs ${F.pct(p.labor)}</span></span>`;
    kv += `<span>Card tips</span><span>${$(d.card)}</span><span>Declared cash tips</span><span>${$(d.declared)}</span>`;
    const warn = l === 'mass' && i === LAST ? alert('info', 'file-clock', '1 timesheet unapproved', 'Ravi Patel, 5.0 h. Figures may change once it is approved.') : '';
    const top = isSS() ? '' : `<div class="top5"><b class="h3" style="font-size:13px">Top 5 by labor cost</b><table class="op-table op-table--tight"><tbody>${(l === 'mass' ? [['hc', 9.0, 0, 252], ['ab', 8.5, 0.5, 187], ['ms', 7.0, 1.3, 176], ['lt', 8.0, 0, 152], ['za', 7.5, 0, 143]] : [['rd', 8.5, 0, 238], ['oh', 8.0, 0, 176], ['tg', 7.5, 0.4, 171], ['mk', 7.0, 0, 133], ['nb', 6.5, 0, 124]]).map(r => `<tr><td>${PN(r[0])}</td><td class="num">${r[1].toFixed(1)} h</td><td class="num muted">${r[2] ? r[2].toFixed(1) + ' OT' : ''}</td><td class="num">${F.money(r[3])}</td></tr>`).join('')}</tbody></table></div>`;
    return `<div class="op-card figs"><div class="sec-h"><b class="h3">Figures</b>${liveFig ? '<span class="op-chip op-chip--sm" data-tone="info">Live</span>' : '<span class="op-chip op-chip--sm" data-tone="quiet">Snapshot</span>'}</div><span class="section-note">${liveFig ? 'From the data source, read-only. Snapshotted when the report is submitted.' : `Snapshotted at submit, ${dTitle(i)}.`} Deltas vs ${dTitle(i - 7)}.</span><div class="kv">${kv}</div>${warn}${opts.noTop ? '' : top}${isSS() ? '<span class="section-note">Senior-sups see hours, not labor dollars.</span>' : ''}${isLead() && i <= LAST ? `<a class="op-btn op-btn--ghost op-btn--sm" ${act('open-tips', [l, i])} style="justify-self:start">${I('hand-coins', 16)}Tip Distribution · ${O.STATUS.tipDistribution[tipState(l, i) === 'pending' ? 'draft' : tipState(l, i)].label}</a>` : ''}</div>`;
  }
  function reportHeader(l, i, noChip) {
    const r = crView(l, i), st = crState(l, i);
    const line1 = st === 'draft' ? `Shared draft · autosaved · last edit ${r.lastEdit ? `${r.lastEdit[1]} by ${PN(r.lastEdit[0])}` : 'just now'}` : st === 'overdue' ? 'Not submitted · past the 10:00 deadline · you can still submit it (recorded as Late)' : `Submitted ${r.at} by ${PN(r.author)} (author)`;
    const ws = writersOf(r);
    return `<div class="dayhead">${noChip ? '' : O.chip('closingReport', st)}<span class="tert" style="font-size:13px">${line1}</span>${ws.length ? `<span class="writers">${ws.map(id => O.avatar(PN(id), 22)).join('')}<span class="tert" style="font-size:12px">${ws.length} writer${ws.length > 1 ? 's' : ''}</span></span>` : ''}</div>`;
  }
  // Suggestion review: shared logic, each variant places it differently
  function sgCard(s, l) {
    const done = s.status !== 'pending';
    if (s.editing) {
      const opts = staffAt(l).concat(P('mz')).filter((p, k, a) => a.indexOf(p) === k && p.id !== me().id);
      return `<div class="op-card sg editing"><div class="sg-h">${I('sparkles', 16)}<b>Edit suggestion</b></div><div class="g-form"><label class="op-field"><span class="op-label">Employee</span><select class="op-input op-input--select" id="sge-emp">${s.emp ? '' : `<option value="">Who is ${esc(s.name)}?</option>`}${opts.map(p => `<option value="${p.id}" ${s.emp === p.id ? 'selected' : ''}>${p.name} · ${p.role}</option>`).join('')}</select></label><label class="op-field"><span class="op-label">Category</span><select class="op-input op-input--select" id="sge-cat">${HR_CATS.map(c => `<option ${c === s.cat ? 'selected' : ''}>${c}</option>`).join('')}</select></label><label class="op-field" style="grid-column:1/-1"><span class="op-label">Description</span><div class="op-input op-input--area"><textarea id="sge-text" rows="2">${esc(s.text)}</textarea></div></label></div><div class="sg-acts">${btn('Save and confirm', act('sg-save', s.k), 'primary', 'check', { sm: 1 })}${btn('Cancel', act('sg-cancel', s.k), 'ghost', null, { sm: 1 })}</div></div>`;
    }
    const hl = esc(s.note).replace(esc(s.evidence), `<mark>${esc(s.evidence)}</mark>`);
    const unmatched = !s.emp;
    return `<div class="op-card sg${done ? ' done' : ''}" data-status="${s.status}"><div class="sg-h">${s.manual ? I('flag', 16) : I('sparkles', 16)}<b>${s.cat}</b><span class="tert">·</span>${unmatched ? `<span class="op-chip op-chip--sm" data-tone="warning">${I('circle-alert', 12)}Who is ${esc(s.name)}?</span>` : `<span>${PN(s.emp)}</span><span class="tert" style="font-size:12px">${P(s.emp).role}</span>`}<span class="sg-st">${s.status === 'confirmed' ? O.chip('hrFlag', 'open', { size: 'sm', label: 'Confirmed' }) : s.status === 'dismissed' ? '<span class="op-chip op-chip--sm" data-tone="quiet">Dismissed</span>' : ''}</span></div>${s.manual ? `<p class="sg-q">${esc(s.text)}</p>` : `<blockquote class="sg-q"><span class="cn-by">[${PN(s.by)}]</span>: ${hl}</blockquote>`}${done ? `<div class="sg-acts">${btn('Undo', act('sg-undo', s.k), 'ghost', 'rotate-ccw', { sm: 1 })}</div>` : `<div class="sg-acts">${btn('Confirm', act('sg-confirm', s.k), 'primary', 'check', { sm: 1, disabled: unmatched, title: unmatched ? `Pick who ${s.name} is first (Edit), or dismiss` : '' })}${btn(unmatched ? 'Pick Employee' : 'Edit', act('sg-edit', s.k), 'secondary', 'pen-line', { sm: 1 })}${btn('Dismiss', act('sg-dismiss', s.k), 'ghost', 'x', { sm: 1 })}</div>`}</div>`;
  }
  function reviewBody(rv) {
    const left = rv.items.filter(s => s.status === 'pending').length, conf = rv.items.filter(s => s.status === 'confirmed').length;
    return `<div class="rv-intro">${I('sparkles', 16)}<span>${rv.items.length ? `Opsell read the Closing Notes and suggests ${rv.items.length} HR Flag${rv.items.length > 1 ? 's' : ''}. Confirm, edit or dismiss each one${rv.later ? '' : ' before the report submits'}. Confirmed flags go to HR; dismissed ones are kept for audit only.` : 'Opsell found nothing that looks like an HR Flag in these Closing Notes.'}</span></div>
      ${rv.items.map(s => sgCard(s, rv.l)).join('')}
      <div class="rv-foot"><span class="tert">${left ? `${left} to review` : 'All reviewed'} · ${conf} to HR</span>${left > 1 ? btn('Dismiss all remaining', act('sg-dismiss-all'), 'ghost', null, { sm: 1 }) : ''}${btn('Add a flag Opsell missed', act('sg-add-manual'), 'ghost', 'plus', { sm: 1 })}</div>
      ${rv.adding ? manualFlagForm(rv.l) : ''}`;
  }
  function manualFlagForm(l) {
    return `<div class="op-card sg editing"><div class="sg-h">${I('flag', 16)}<b>Add an HR Flag</b></div><div class="g-form"><label class="op-field"><span class="op-label">Employee</span><select class="op-input op-input--select" id="mf-emp">${staffAt(l).filter(p => p.id !== me().id).map(p => `<option value="${p.id}">${p.name} · ${p.role}</option>`).join('')}</select></label><label class="op-field"><span class="op-label">Category</span><select class="op-input op-input--select" id="mf-cat">${HR_CATS.map(c => `<option>${c}</option>`).join('')}</select></label><label class="op-field" style="grid-column:1/-1"><span class="op-label">What happened</span><div class="op-input op-input--area"><textarea id="mf-text" rows="2"></textarea></div></label></div><div class="sg-acts">${btn('Add and confirm', act('mf-save'), 'primary', 'check', { sm: 1 })}${btn('Cancel', act('mf-cancel'), 'ghost', null, { sm: 1 })}</div></div>`;
  }
  const reviewReady = rv => rv && rv.items.every(s => s.status !== 'pending');
  const submitLabel = rv => rv.later ? 'Done reviewing' : `Submit Closing Report${rv.items.some(s => s.status === 'confirmed') ? ` · ${rv.items.filter(s => s.status === 'confirmed').length} HR Flag${rv.items.filter(s => s.status === 'confirmed').length > 1 ? 's' : ''} to HR` : ''}`;

  /* ───────────── Tip Distribution pieces ───────────── */
  function tipPolicyLine(l) { const p = POLICY[l]; return `Tip Policy v${p.version}, effective ${p.since} (${p.by}): ${Object.entries(p.weights).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', ')} · ${p.credit} · back-of-house not eligible (${STATE[l]})`; }
  function hoursCell(r, l, i, locked) {
    if (S.editHours === r.id) return `<span class="hrs-edit"><span class="op-input" style="width:76px;height:28px"><input id="hrs-v" value="${r.h}" inputmode="decimal"></span><span class="op-input" style="width:220px;height:28px"><input id="hrs-r" placeholder="Reason (required)" value="${esc(r.adj ? r.adj.reason : '')}"></span>${btn('Save', act('hrs-save', r.id), 'primary', null, { sm: 1 })}${btn('', act('hrs-cancel'), 'ghost', 'x', { sm: 1 })}</span>`;
    const adj = r.adj ? `<span class="adj" title="Adjusted from ${r.hours.toFixed(1)} h by ${PN(r.adj.by)}: ${esc(r.adj.reason)}">${I('pen-line', 12)}${r.status === 'unapproved' || r.added ? 'by hand' : `was ${r.hours.toFixed(1)}`}</span>` : '';
    return locked ? `${r.h.toFixed(2)}${adj}` : `<button class="hrs-btn" ${act('hrs-edit', r.id)} title="Adjust hours (reason required)">${r.h.toFixed(2)}${I('pen-line', 12)}</button>${adj}`;
  }
  function linesTable(sp, l, i, opts) {
    opts = opts || {};
    const locked = sp.t.state === 'finalized' || !isLead();
    const rowHtml = r => `<tr class="${r.ok ? '' : 'out'}"><td><span class="op-emp">${O.avatar(PN(r.emp), 24)}<span class="who"><b>${opts.whoBtn ? who(r.emp) : PN(r.emp)}</b><span>${P(r.emp).role}${r.covering ? ` · covering from ${LN(r.covering)}` : ''}</span></span></span></td><td>${r.pos}<span class="tert" style="font-size:12px"> ${POS[r.pos]}</span></td><td class="num">${r.ok || r.kind === 'data' ? hoursCell(r, l, i, locked) : `<span class="tert">${r.h.toFixed(2)}</span>`}</td><td class="num">${r.ok ? r.w.toFixed(1) : '<span class="tert">—</span>'}</td><td class="num">${r.ok ? (r.pts).toFixed(2) : '<span class="tert">—</span>'}</td>${opts.noShares ? '' : `<td class="num">${r.ok ? $(r.cardShare) : ''}</td><td class="num">${r.ok ? (sp.needsCash ? '<span class="tert">—</span>' : $(r.cashShare)) : ''}</td><td class="num" style="font-weight:600">${r.ok ? $(r.total) : ''}</td>`}<td class="num muted">${r.declared ? $(r.declared) : ''}</td></tr>${!r.ok ? `<tr class="why"><td colspan="${opts.noShares ? 6 : 9}">${I(r.kind === 'data' ? 'file-clock' : 'ban', 12)}${r.why}${r.kind === 'data' && !locked ? ` · <a ${act('hrs-edit', r.id)}>Add the hours by hand</a>` : ''}</td></tr>` : ''}`;
    return `<div class="op-table-wrap"><table class="op-table tips-t"><thead><tr><th>Employee</th><th>Position</th><th class="num">Approved hours</th><th class="num">Weight</th><th class="num">Points</th>${opts.noShares ? '' : '<th class="num">Card share</th><th class="num">Cash share</th><th class="num">Total</th>'}<th class="num" title="Cash an Employee declared as received directly stays theirs; shown for the record">Declared, kept</th></tr></thead><tbody>${sp.ok.map(rowHtml).join('')}${sp.out.length ? `<tr class="grp"><td colspan="${opts.noShares ? 6 : 9}">Not in the pool · ${sp.out.length}</td></tr>${sp.out.map(rowHtml).join('')}` : ''}</tbody>${opts.noShares ? '' : `<tfoot><tr><td>${sp.ok.length} sharing</td><td></td><td class="num">${sp.hrs.toFixed(2)}</td><td></td><td class="num">${sp.pts.toFixed(2)}</td><td class="num">${$(sp.t.card)}</td><td class="num">${sp.needsCash ? '—' : $(sp.t.cash)}</td><td class="num">${$(sp.pool)}</td><td></td></tr></tfoot>`}</table></div>${!locked ? (S.addLine && S.addLine.l === l ? addLineForm(l) : `<div>${btn('Add a missing shift', act('line-add', [l, i]), 'ghost', 'plus', { sm: 1 })}</div>`) : ''}`;
  }
  function addLineForm(l) {
    return `<div class="op-card" style="padding:var(--space-3) var(--space-4);display:grid;gap:var(--space-3)"><b class="h3">Add a missing shift</b><div class="g-form g-form--4"><label class="op-field"><span class="op-label">Employee</span><select class="op-input op-input--select" id="al-emp">${PEOPLE.filter(p => p.role !== 'GM' && p.role !== 'Manager').map(p => `<option value="${p.id}">${p.name}${p.locs.includes(l) ? '' : ` · covering from ${LN(p.locs[0])}`}</option>`).join('')}</select></label><label class="op-field"><span class="op-label">Position</span><select class="op-input op-input--select" id="al-pos">${Object.keys(POS).filter(x => x !== 'Manager').map(x => `<option>${x}</option>`).join('')}</select></label><label class="op-field"><span class="op-label">Hours</span><span class="op-input"><input id="al-h" inputmode="decimal" placeholder="0.0"></span></label><label class="op-field"><span class="op-label">Reason (required)</span><span class="op-input"><input id="al-r" placeholder="e.g. forgot to clock in"></span></label></div><span class="section-note">Lives only in Opsell and is audited; never written back to the time clock.</span><div class="sg-acts">${btn('Add shift', act('line-add-save', l), 'primary', null, { sm: 1 })}${btn('Cancel', act('line-add-cancel'), 'ghost', null, { sm: 1 })}</div></div>`;
  }
  const cashInput = (sp, big) => `<label class="cash${big ? ' cash--big' : ''}"><span class="op-input"><span class="tert">$</span><input id="cash" data-live="cash" inputmode="decimal" placeholder="0.00" value="${sp.t.cashRaw != null ? esc(sp.t.cashRaw) : sp.t.cash == null ? '' : (sp.t.cash / 100).toFixed(2)}" ${sp.t.state === 'finalized' || !isLead() ? 'disabled' : ''}></span></label>`;
  function finalizeIssues(sp) {
    const out = [];
    if (sp.needsCash) out.push('Enter the counted cash jar (0 if empty).');
    if (sp.blocked) out.push('The pool has tips but nobody eligible worked: add the missing eligible shift, or ask Ops to fix the Tip Policy.');
    return out;
  }
  const tipBanners = (l, sp) => (STATE[l] === 'MA' ? alert('info', 'info', 'Massachusetts Location', 'State rules on when pooled tips must be paid apply. Opsell computes the split; payment and its timing stay with payroll.') : '') + (sp.t.lines.some(x => x.status === 'unapproved' && !x.adj) ? alert('info', 'file-clock', 'Unapproved timesheet', 'Ravi Patel, 5.0 h, is left out until it is approved in the time clock. The draft refreshes from the source until you finalize.') : '');
  function finalizedNote(sp) { return `${O.chip('tipDistribution', 'finalized')}<span class="tert" style="font-size:13px">Finalized ${sp.t.at} by ${PN(sp.t.by)} · version ${sp.t.version} · Tip Policy v${POLICY[sp.t.l].version} · only Ops or the Org Admin can reopen it</span>`; }

  /* ───────────── Light-touch forms: standalone HR Flag, Write-up draft (shared modals) ───────────── */
  function flagModal(m) {
    const t = flagTargets();
    return modal('flag', 'Raise an HR Flag', 'Goes straight to HR. You cannot edit or retract it once raised.', `<div class="g-form"><label class="op-field"><span class="op-label">Employee</span><select class="op-input op-input--select" id="fl-emp">${t.map(p => `<option value="${p.id}" ${m.emp === p.id ? 'selected' : ''}>${p.name} · ${p.role} · ${p.locs.map(LN).join(', ')}</option>`).join('')}</select></label><label class="op-field"><span class="op-label">Category</span><select class="op-input op-input--select" id="fl-cat">${HR_CATS.map(c => `<option>${c}</option>`).join('')}</select></label><label class="op-field"><span class="op-label">Incident date</span><select class="op-input op-input--select" id="fl-day">${[0, 1, 2, 3].map(k => `<option value="${CUR() - k}">${dTitle(CUR() - k)}</option>`).join('')}</select></label><label class="op-field"><span class="op-label">Location</span><select class="op-input op-input--select" id="fl-loc">${myLocs().map(l => `<option value="${l}" ${l === S.loc ? 'selected' : ''}>${LN(l)}</option>`).join('')}</select></label><label class="op-field" style="grid-column:1/-1"><span class="op-label">What happened</span><div class="op-input op-input--area"><textarea id="fl-text" rows="3" placeholder="Facts only: what, when, who saw it"></textarea></div></label><span class="ph add" style="grid-column:1/-1;justify-self:start">${I('plus', 16)}<span>Attachment</span></span></div><span class="section-note">Anyone at your Locations except yourself. Not AI-assisted. Not part of a Closing Report.</span>`, btn('Cancel', act('modal-close'), 'ghost') + btn('Send to HR', act('flag-save'), 'primary', 'flag'));
  }
  function wuModal(m) {
    const t = wuTargets(), emp = m.emp || (t[0] && t[0].id), a = onFileWU(emp), lvl = nextLevel(emp), openF = FLAGS.filter(f => f.emp === emp && f.state !== 'resolved' && seesFlag(f));
    return modal('wu', 'Start a Write-up', 'A private draft: nobody else sees it until you submit it.', `<div class="g-form"><label class="op-field" style="grid-column:1/-1"><span class="op-label">Employee</span><select class="op-input op-input--select" id="wu-emp" data-live="wu-emp">${t.map(p => `<option value="${p.id}" ${emp === p.id ? 'selected' : ''}>${p.name} · ${p.role}</option>`).join('')}</select><span class="help">Strictly downward: Roles below yours at your Locations.</span></label>
      <div class="ladder" style="grid-column:1/-1"><b>Write-ups on file, last 12 months (delivered ones set the suggested level)</b>${a.length ? a.map(w => `<span>${O.chip('writeUp', w.state, { size: 'sm' })} ${w.level} · ${w.cat} · ${dTitle(w.day)}</span>`).join('') : '<span class="tert">None</span>'}</div>
      <label class="op-field"><span class="op-label">Level</span><select class="op-input op-input--select" id="wu-lvl">${LEVELS.map(x => `<option ${x === lvl ? 'selected' : ''}>${x}${x === lvl ? ' (suggested)' : ''}</option>`).join('')}</select><span class="help">Suggested from the ladder, never enforced.</span></label><label class="op-field"><span class="op-label">Category</span><select class="op-input op-input--select" id="wu-cat">${WU_CATS.map(c => `<option>${c}</option>`).join('')}</select></label>
      <label class="op-field" style="grid-column:1/-1"><span class="op-label">Description</span><div class="op-input op-input--area"><textarea rows="2" placeholder="What happened, when"></textarea></div></label>
      ${openF.length ? `<div class="ladder" style="grid-column:1/-1"><b>Link HR Flags</b>${openF.map(f => `<label class="op-choice"><input type="checkbox" ${m.flag === f.id ? 'checked' : ''}> ${f.cat} · ${dTitle(f.day)} · ${esc(f.text)}</label>`).join('')}</div>` : ''}</div><span class="section-note">Policy violated, corrective action and consequence follow on the full form (Write-up workflow).</span>`, btn('Cancel', act('modal-close'), 'ghost') + btn('Save draft', act('wu-save'), 'primary', 'file-pen-line'));
  }
  function wuDetail(w) {
    const canDeliver = isLead() && w.state === 'ready';
    return modal('wud', `${w.level} · ${PN(w.emp)}`, `${w.cat} · ${LN(w.loc)} · drafted by ${PN(w.by)} · ${dTitle(w.day)}`, `<div class="dayhead">${O.chip('writeUp', w.state)}</div>${(w.flags || []).length ? `<span class="tert" style="font-size:13px">Linked HR Flags: ${w.flags.join(', ')}</span>` : ''}${canDeliver ? alert('info', 'send', 'Deliver in a meeting', 'Start the meeting with the Employee; they sign in their own session (account or one-time code) or on paper. Refusing needs a witness. Delivery is the Write-up workflow, out of this prototype.') : ''}${w.state === 'draft' ? alert('info', 'eye-off', 'Private draft', 'Only you can see it. Submit makes it Ready to deliver (or sends it to HR when HR approval is on).') : ''}`, btn('Close', act('modal-close'), 'ghost') + (canDeliver ? btn('Start delivery meeting', act('toast', 'Delivery meeting: see the Write-up workflow'), 'primary', 'send') : w.state === 'draft' ? btn('Open draft', act('toast', 'Full Write-up form: see the Write-up workflow'), 'primary', 'pen-line') : ''));
  }
  function flagDetail(f) {
    const canWU = isLead() && below(f.emp);
    return modal('fd', `${f.cat} · ${PN(f.emp)}`, `${LN(f.loc)} · ${dTitle(f.day)} · ${f.source} · raised by ${PN(f.by)}`, `<div class="dayhead">${O.chip('hrFlag', f.state)}${f.outcome ? `<span class="tert">${f.outcome}</span>` : ''}</div><blockquote class="sg-q">${esc(f.text)}</blockquote><span class="section-note">HR resolves it. Confirmed flags are immutable for their author.</span>`, btn('Close', act('modal-close'), 'ghost') + (canWU && f.state !== 'resolved' ? btn(f.wu ? `Linked to ${f.wu}` : 'Start a Write-up from this flag', f.wu ? act('wu-open', f.wu) : act('wu-new', { emp: f.emp, flag: f.id }), 'primary', 'file-pen-line') : ''));
  }
  const modal = (k, title, sub, body, foot, wide) => `<div class="modal-layer"><div class="op-scrim" ${act('modal-close')}></div><div class="op-modal${wide ? ' op-modal--wide' : ''}" role="dialog" aria-label="${esc(title)}"><div class="op-modal-h"><div style="flex:1;min-width:0"><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div><button class="op-btn op-btn--ghost op-btn--sm op-icon-btn" ${act('modal-close')} aria-label="Close">${I('x', 16)}</button></div><div class="op-modal-b">${body}</div>${foot ? `<div class="op-modal-f">${foot}</div>` : ''}</div></div>`;

  /* ───────────── Shared section pages ───────────── */
  function reportsList(locs) {
    const days = Array.from({ length: 14 }, (_, k) => Math.min(CUR(), LAST) - k);
    return `<div class="op-table-wrap"><table class="op-table"><thead><tr><th>Business Day</th>${locs.length > 1 ? '<th>Location</th>' : ''}<th>Closing Report</th><th>Author</th><th class="num">Closing Notes</th><th>Writers</th><th class="num">Net sales</th></tr></thead><tbody>${days.flatMap(i => locs.map(l => { const r = crView(l, i), st = crState(l, i); return `<tr ${act('open-report', [l, i])} data-go="{}"><td style="font-weight:500">${dTitle(i)}</td>${locs.length > 1 ? `<td><span class="glyph">${glyphKey(l)}${LN(l)}</span></td>` : ''}<td>${O.chip('closingReport', st, { size: 'sm' })}${r.pending && r.pending.some(s => s.status === 'pending') && r.author === me().id ? ` <span class="op-chip op-chip--sm" data-tone="warning">${I('sparkles', 12)}Review suggestions</span>` : ''}</td><td class="muted">${r.author && !['draft', 'overdue'].includes(st) ? `${PN(r.author)} · ${r.at}` : '—'}</td><td class="num">${noteCount(r)}</td><td>${writersOf(r).map(id => O.avatar(PN(id), 20)).join('')}</td><td class="num">${F.money(D[l][i].sales)}</td></tr>`; })).join('')}</tbody></table></div>`;
  }
  function tipsList(locs) {
    const days = Array.from({ length: 14 }, (_, k) => LAST - k);
    return `<div class="op-table-wrap"><table class="op-table"><thead><tr><th>Business Day</th>${locs.length > 1 ? '<th>Location</th>' : ''}<th>Tip Distribution</th><th class="num">Card tips</th><th class="num">Cash jar</th><th class="num">Tip Pool</th><th class="num">Sharing</th><th>Finalized by</th></tr></thead><tbody>${days.flatMap(i => locs.map(l => { const ts = tipState(l, i); if (ts === 'pending') return `<tr><td style="font-weight:500">${dTitle(i)}</td>${locs.length > 1 ? `<td><span class="glyph">${glyphKey(l)}${LN(l)}</span></td>` : ''}<td><span class="op-chip op-chip--sm" data-tone="quiet">${I('hourglass', 12)}After 4:00 am cutoff</span></td><td colspan="5" class="muted">The Draft generates automatically after the Business Day cutoff.</td></tr>`; const sp = split(l, i); return `<tr ${act('open-tips', [l, i])} data-go="{}"><td style="font-weight:500">${dTitle(i)}</td>${locs.length > 1 ? `<td><span class="glyph">${glyphKey(l)}${LN(l)}</span></td>` : ''}<td>${O.chip('tipDistribution', ts, { size: 'sm' })}</td><td class="num">${$(sp.t.card)}</td><td class="num">${sp.needsCash ? '<span class="tert">not counted</span>' : $(sp.t.cash)}</td><td class="num" style="font-weight:500">${$(sp.pool)}</td><td class="num">${sp.ok.length}</td><td class="muted">${sp.t.by ? `${PN(sp.t.by)} · ${sp.t.at}` : '—'}</td></tr>`; })).join('')}</tbody></table></div><p class="section-note">Pay Period Oct 5 – Oct 18 · export after the last day is finalized. Opsell computes the split; payment runs through payroll.</p>`;
  }
  function flagsList(locs) {
    const list = FLAGS.filter(f => locs.includes(f.loc) && seesFlag(f)).sort((a, b) => (a.state === 'resolved') - (b.state === 'resolved') || b.day - a.day);
    return `<div class="op-table-wrap"><table class="op-table"><thead><tr><th>HR Flag</th><th>Employee</th><th>Location</th><th>Raised</th><th>From</th><th>By</th><th>State</th></tr></thead><tbody>${list.map(f => `<tr ${act('flag-open', f.id)} data-go="{}"><td style="font-weight:500">${f.cat}</td><td>${PN(f.emp)} <span class="tert" style="font-size:12px">${P(f.emp).role}</span></td><td>${O.locTag(LN(f.loc))}</td><td class="muted">${dTitle(f.day)}</td><td class="muted">${f.source}</td><td class="muted">${PN(f.by)}</td><td>${O.chip('hrFlag', f.state, { size: 'sm' })}${f.outcome ? ` <span class="tert" style="font-size:12px">${f.outcome}</span>` : ''}</td></tr>`).join('') || '<tr><td colspan="7" class="empty">No HR Flags you can see.</td></tr>'}</tbody></table></div><p class="section-note">You see flags on Roles below yours at your Locations, and flags you raised. Never flags about yourself.</p>`;
  }
  function wuList(locs) {
    const list = WRITEUPS.filter(w => locs.includes(w.loc) && seesWU(w)).sort((a, b) => b.day - a.day);
    return `<div class="op-table-wrap"><table class="op-table"><thead><tr><th>Employee</th><th>Level</th><th>Category</th><th>Location</th><th>Drafted by</th><th>Date</th><th>State</th></tr></thead><tbody>${list.map(w => `<tr ${act('wu-open', w.id)} data-go="{}"><td style="font-weight:500">${PN(w.emp)}</td><td>${w.level}</td><td class="muted">${w.cat}</td><td>${O.locTag(LN(w.loc))}</td><td class="muted">${PN(w.by)}</td><td class="muted">${dTitle(w.day)}</td><td>${O.chip('writeUp', w.state, { size: 'sm' })}${w.rebuttal ? ' <span class="tert" style="font-size:12px">Rebuttal</span>' : ''}</td></tr>`).join('')}</tbody></table></div><p class="section-note">Drafts are private to their author. You see Write-ups for Roles below yours at your Locations.</p>`;
  }
  function salesPage(locs) {
    const idx = Array.from({ length: 14 }, (_, k) => LAST - 13 + k), l = locs[0];
    const sum = i => locs.reduce((s, x) => s + D[x][i].sales, 0), lab = i => { const c = locs.reduce((s, x) => s + D[x][i].cost, 0); return +(c / sum(i) * 100).toFixed(1); };
    return `<div class="g-2">${chartCard('Net sales', 'Last 14 Business Days · dashed = week before', el => O.charts.line(el, { labels: idx.map(i => String(dCol(i)[1])), tipLabels: idx.map(dTitle), height: 200, legend: false, yFormat: v => F.money(v, { compact: true }), series: [{ name: 'Net sales', values: idx.map(sum), color: 'var(--chart-current)', area: true }, { name: 'Week before', values: idx.map(i => sum(i - 7)), color: 'var(--chart-prior)', dashed: true }] }))}${chartCard('Labor % of sales', `Last 14 Business Days · target ${locs.length > 1 ? 'per Location' : TARGET[l] + '%'}`, el => O.charts.line(el, { labels: idx.map(i => String(dCol(i)[1])), tipLabels: idx.map(dTitle), height: 200, legend: false, target: locs.length > 1 ? undefined : TARGET[l], yFormat: v => F.pct(v, 0), series: [{ name: 'Labor %', values: idx.map(lab), color: 'var(--chart-current)' }] }))}</div><p class="section-note">Same Sales & Labor section as corporate, scoped to your Locations. Not this prototype's question.</p>`;
  }
  function myRecords() {
    const u = me(), rows = [];
    if (!isLead()) for (let i = LAST - 13; i <= LAST; i++) u.locs.forEach(l => { if (tipState(l, i) !== 'finalized') return; const sp = split(l, i), r = sp.rows.find(x => x.emp === u.id); if (r) rows.push({ i, l, r }); });
    const own = WRITEUPS.filter(w => w.emp === u.id && w.state !== 'draft');
    return `<div class="g-2"><div class="op-card" style="overflow:hidden"><div class="cardh"><b class="h3">My tips</b><span class="tert" style="font-size:12px">Finalized only</span></div><table class="op-table"><thead><tr><th>Business Day</th><th class="num">Hours</th><th class="num">Total</th></tr></thead><tbody>${rows.length ? rows.reverse().map(({ i, r }) => `<tr><td>${dTitle(i)}</td><td class="num">${r.h.toFixed(2)}</td><td class="num">${r.ok ? $(r.total) : `<span class="tert" title="${esc(r.why)}">Not in the pool</span>`}</td></tr>`).join('') : `<tr><td colspan="3" class="empty">${isLead() ? `${u.role}s never share in tips.` : 'No finalized tips yet.'}</td></tr>`}</tbody></table></div><div class="op-card" style="overflow:hidden"><div class="cardh"><b class="h3">My Write-ups</b></div><table class="op-table"><tbody>${own.length ? own.map(w => `<tr><td>${w.level}</td><td class="muted">${w.cat}</td><td>${O.chip('writeUp', w.state, { size: 'sm' })}</td><td>${btn('Download', '', 'ghost', 'download', { sm: 1 })}</td></tr>`).join('') : '<tr><td class="empty">None</td></tr>'}</tbody></table></div></div><p class="section-note">Everyone at a Location is also an Employee: own tips and own documents, nothing about anyone else.</p>`;
  }
  const employeesPage = () => `<div class="op-card"><div class="empty-note">${I('users', 20)}<br><b style="color:var(--text-primary)">Employees</b><br>${isSS() ? 'Names only for Senior-sups.' : 'Roster at your Locations.'} Not part of this prototype's question.</div></div>`;
  function sectionPage(key, locs) {
    const titles = { reports: 'Closing Reports', sales: 'Sales & Labor', flags: 'HR Flags', writeups: 'Write-ups', employees: 'Employees', tips: 'Tip Distribution', me: 'My records' };
    const scope = [locs.map(LN).join(', ')];
    const acts = key === 'flags' ? btn('Raise an HR Flag', act('flag-new'), 'secondary', 'flag') : key === 'writeups' ? btn('Start a Write-up', act('wu-new'), 'secondary', 'file-pen-line') : '';
    const body = { reports: () => reportsList(locs), sales: () => salesPage(locs), flags: () => flagsList(locs), writeups: () => wuList(locs), employees: employeesPage, tips: () => tipsList(locs), me: myRecords }[key]();
    return { crumb: crumbs([[titles[key]]]), main: pageHead(titles[key], key === 'me' ? [me().name] : scope, acts) + body };
  }

  /* ════════════════ Variant A: Inbox. Home is a to-do list; flows are full pages with steps ════════════════ */
  function VariantA() {
    const locs = scopeLocs();
    if (S.page === 'home') {
      const due = dueItems(locs), now = due.filter(x => x.sev <= 2), later = due.filter(x => x.sev > 2);
      const today = locs.map(l => { const st = crState(l, LAST), ts = tipState(l, LAST); return `<div class="today"><span class="glyph">${glyphKey(l)}<b>${LN(l)}</b></span><span class="tert">${S.clock === 'closing' ? `${dTitle(LAST)} · closed 8:00 pm · closing now` : `${dTitle(CUR())} · open since 6:00 · ${F.money(live(l).sales)} so far`}</span><span class="today-st">${O.chip('closingReport', st, { size: 'sm', label: `Fri report · ${O.STATUS.closingReport[st].label}` })}${isLead() ? (ts === 'pending' ? '<span class="op-chip op-chip--sm" data-tone="quiet">Fri tips · after 4:00 am</span>' : O.chip('tipDistribution', ts, { size: 'sm', label: `Fri tips · ${O.STATUS.tipDistribution[ts].label}` })) : ''}</span></div>`; }).join('');
      const glance = locs.map(l => { const d = D[l][PREV()]; return `<div class="kv"><span>${LN(l)} · ${dTitle(PREV())}</span><span></span><span>Net sales</span><span>${F.money(d.sales)}</span><span>${isSS() ? 'Hours' : 'Labor %'}</span><span class="${!isSS() && d.labor > TARGET[l] + OVER ? 'bad' : ''}">${isSS() ? F.count(d.hours) : F.pct(d.labor)}</span><span>Overtime</span><span>${d.ot.toFixed(1)} h</span></div>`; }).join('');
      const quick = [btn('Add a Closing Note', act('open-report', [locs[0], LAST]), 'secondary', 'pen-line')].concat(isLead() ? [btn('Raise an HR Flag', act('flag-new'), 'secondary', 'flag'), btn('Start a Write-up', act('wu-new'), 'secondary', 'file-pen-line')] : []).join('');
      const main = pageHead(greet(), [nowLabel(), locs.map(LN).join(', ')]) + `<div class="op-card today-card">${today}</div><div class="g-home"><div class="stack"><div class="op-card" style="overflow:hidden"><div class="cardh"><span class="t"><b class="h3">To do</b><span class="op-count">${now.length}</span></span><span class="tert" style="font-size:12px">Oldest deadline first</span></div>${now.map(dueRow).join('') || '<div class="empty-note">Nothing due. Nice.</div>'}</div>${later.length ? `<div class="op-card" style="overflow:hidden"><div class="cardh"><span class="t"><b class="h3">Also on your Locations</b><span class="op-count">${later.length}</span></span></div>${later.map(dueRow).join('')}</div>` : ''}</div><div class="stack"><div class="op-card quick"><b class="h3">Quick actions</b>${quick}</div><div class="op-card" style="padding:var(--space-3) var(--space-4)"><b class="h3">Yesterday at a glance</b>${glance}</div></div></div>`;
      return shell('home', crumbs([['Home']]), scopeBtn(true), main, 'page--home');
    }
    if (S.page === 'report') return shell('reports', crumbs([['Closing Reports', { page: 'reports' }], [`${LN(S.loc)} · ${dTitle(S.day)}`]]), '', reportA(S.loc, S.day));
    if (S.page === 'tipday') return shell('tips', crumbs([['Tip Distribution', { page: 'tips' }], [`${LN(S.loc)} · ${dTitle(S.day)}`]]), '', tipsA(S.loc, S.day));
    const sp = sectionPage(S.page, locs);
    return shell(S.page, sp.crumb, scopeBtn(true), sp.main);
  }
  const stepper = (steps, cur) => `<ol class="stepper-a">${steps.map((s, k) => `<li class="${k < cur ? 'done' : k === cur ? 'cur' : ''}"><span class="n">${k < cur ? I('check', 12) : k + 1}</span>${s}</li>`).join('')}</ol>`;
  function reportA(l, i) {
    const r = crView(l, i), st = crState(l, i), rv = S.review && S.review.l === l && S.review.i === i ? S.review : null;
    const head = pageHead(`Closing Report · ${dTitle(i)}`, [LN(l), STATE[l]], '', `<span class="tert" style="display:flex;gap:6px;align-items:center;font-size:12px">${glyphKey(l)}${LN(l)}</span>`);
    if (S.step === 'done') return head + stepper(['Write Closing Notes', 'Review HR Flags', 'Submitted'], 3) + `<div class="op-card done-card">${O.tile('closingReport', 'submitted')}<div><b class="h3">${S.doneMsg}</b><p class="muted">Figures are snapshotted. You are the author. ${isLead() ? 'Corporate sees it in the Closing Reports grid.' : ''}</p></div><div class="acts">${isLead() && tipState(l, i) === 'draft' ? btn(`Next: Tip Distribution for ${dTitle(i)}`, act('open-tips', [l, i]), 'primary', 'hand-coins') : ''}${btn('Back to Home', go({ page: 'home', step: null }), 'secondary', 'house')}</div></div>`;
    if (rv) return head + stepper(['Write Closing Notes', 'Review HR Flags', 'Submitted'], 1) + `<div class="narrow">${reviewBody(rv)}</div><div class="footbar">${btn('Back to notes', act('review-cancel'), 'ghost', 'arrow-left')}<span class="tert">${rv.later ? 'The report is already submitted; this only records your review.' : 'Submitting snapshots the figures and makes you the author.'}</span>${btn(submitLabel(rv), act('submit-finish'), 'primary', 'check', { disabled: !reviewReady(rv) })}</div>`;
    const can = editable(l, i);
    const later = r.pending && r.author === me().id && r.pending.some(s => s.status === 'pending') ? alert('warning', 'sparkles', `${r.pending.filter(s => s.status === 'pending').length} HR Flag suggestions wait for you`, 'The AI check timed out when you submitted, so the report went through without it.', btn('Review now', act('later-review', [l, i]), 'secondary', null, { sm: 1 })) : '';
    return head + (can ? stepper(['Write Closing Notes', 'Review HR Flags', 'Submitted'], 0) : '') + reportHeader(l, i) + later + `<details class="figs-strip" data-open="figsOpen" ${S.figsOpen ? 'open' : ''}><summary>${I('chart-column', 16)}<b>Figures</b><span class="tert">${F.money(D[l][i].sales)} net sales · ${F.count(D[l][i].guests)} guests · ${isSS() ? `${F.count(D[l][i].hours)} h` : `labor ${F.pct(D[l][i].labor)}`} · tips ${$(D[l][i].card + D[l][i].declared)}</span>${I('chevron-down', 16)}</summary>${figures(l, i)}</details><div class="narrow stack">${SECTIONS.map(s => sectionCard(r, s, l, i)).join('')}</div>` + (can ? `<div class="footbar"><span class="tert">${I('circle-check', 14)} Autosaved · anyone at ${LN(l)} who can submit can add Closing Notes; only the writer edits their own.</span>${btn('Continue to review', act('submit-start', [l, i]), 'primary', 'arrow-right')}</div>` : (isLead() && !['draft', 'overdue'].includes(st) && me().role === 'GM' ? `<div>${btn('Amend (with reason)', act('toast', 'Amendment: new version with reason; out of this prototype'), 'secondary', 'pen-line')}</div>` : ''));
  }
  const notYet = (l, i) => `<div class="op-card"><div class="empty-note">${I('hourglass', 20)}<br><b style="color:var(--text-primary)">${LN(l)} · ${dTitle(i)}</b><br>The Tip Distribution Draft generates automatically after the 4:00 am cutoff, from approved hours.</div></div>`;
  function tipsA(l, i) {
    if (tipState(l, i) === 'pending') return pageHead(`Tip Distribution · ${dTitle(i)}`, [LN(l)]) + notYet(l, i);
    const sp = split(l, i), t = sp.t, fin = t.state === 'finalized';
    const step = fin ? 3 : S.tipStep || 0;
    const head = pageHead(`Tip Distribution · ${dTitle(i)}`, [LN(l), `Tip Pool ${$(sp.pool)}`], '', `<span class="tert" style="display:flex;gap:6px;align-items:center;font-size:12px">${glyphKey(l)}${LN(l)}</span>`);
    const steps = ['Count the cash jar', 'Check hours', 'Finalize'];
    if (fin) return head + `<div class="dayhead">${finalizedNote(sp)}</div>` + poolCards(sp) + linesTable(sp, l, i);
    let body;
    if (step === 0) body = `<div class="narrow stack"><div class="op-card step-card"><b class="h3">How much cash is in the tip jar?</b><p class="muted">Count it at close and enter the total. Cash an Employee declares as received directly is not pooled; it stays theirs.</p>${cashInput(sp, true)}<div class="pool-sum"><span>Card tips and auto-gratuities from the POS</span><b>${$(t.card)}</b><span>Counted cash jar</span><b>${sp.needsCash ? '—' : $(t.cash)}</b><span>Tip Pool</span><b class="big">${$(sp.pool)}</b></div></div></div><div class="footbar"><span></span><span class="tert">${tipPolicyLine(l)}</span>${btn('Next: check hours', act('tip-step', 1), 'primary', 'arrow-right', { disabled: sp.needsCash, title: sp.needsCash ? 'Enter the cash count first (0 if empty)' : '' })}</div>`;
    else if (step === 1) body = tipBanners(l, sp) + `<p class="muted" style="margin:0">Approved hours from the time clock. Adjust a line or add a missing shift with a reason; the change stays in Opsell and is audited.</p>` + linesTable(sp, l, i, { noShares: true }) + `<div class="footbar">${btn('Back', act('tip-step', 0), 'ghost', 'arrow-left')}<span class="tert">${sp.ok.length} sharing · ${sp.hrs.toFixed(2)} h · ${sp.pts.toFixed(2)} points</span>${btn('Next: review shares', act('tip-step', 2), 'primary', 'arrow-right')}</div>`;
    else { const iss = finalizeIssues(sp); body = poolCards(sp) + (iss.length ? alert('critical', 'ban', 'Cannot finalize yet', iss.join(' ')) : '') + linesTable(sp, l, i) + `<div class="footbar">${btn('Back', act('tip-step', 1), 'ghost', 'arrow-left')}<span class="tert">Finalizing locks this version. Only Ops or the Org Admin can reopen it.</span>${btn(`Finalize ${$(sp.pool)}`, act('finalize', [l, i]), 'primary', 'lock', { disabled: iss.length > 0 })}</div>`; }
    return head + stepper(steps, step) + body;
  }
  const poolCards = sp => `<div class="pool-cards"><div class="op-card"><span class="op-kpi-h">${I('coins', 16)}Card tips</span><b>${$(sp.t.card)}</b><span class="tert">POS, incl. auto-gratuities</span></div><div class="op-card"><span class="op-kpi-h">${I('banknote', 16)}Cash jar</span><b>${sp.needsCash ? '—' : $(sp.t.cash)}</b><span class="tert">Counted by ${sp.t.by ? PN(sp.t.by) : 'GM or Manager'}</span></div><div class="op-card"><span class="op-kpi-h">${I('hand-coins', 16)}Tip Pool</span><b>${$(sp.pool)}</b><span class="tert">${$(Math.round(sp.perHour))}/h over ${sp.hrs.toFixed(1)} h</span></div><div class="op-card policy"><span class="op-kpi-h">${I('settings', 16)}Tip Policy v${POLICY[sp.t.l].version}</span><span class="tert" style="font-size:12px">${tipPolicyLine(sp.t.l).replace(/^Tip Policy v\d+, /, '')}</span></div></div>`;

  /* ════════════════ Variant B: Dashboard. Corporate Home anatomy; flows are single pages with modals ════════════════ */
  function VariantB() {
    const locs = scopeLocs();
    let main, crumb, navKey = S.page;
    if (S.page === 'home') {
      const prev = PREV(), spIdx = Array.from({ length: 14 }, (_, k) => prev - 13 + k);
      const sum = (f, i) => locs.reduce((s, l) => s + f(D[l][i]), 0);
      const sales = sum(d => d.sales, prev), salesW = sum(d => d.sales, prev - 7), cost = sum(d => d.cost, prev), costW = sum(d => d.cost, prev - 7), lab = cost / sales * 100, labW = costW / salesW * 100, tgt = locs.length > 1 ? 29 : TARGET[locs[0]];
      const k1 = kpi('chart-column', 'Net sales', F.money(sales), '', sparkOf(spIdx.map(i => sum(d => d.sales, i)), { compare: spIdx.map(i => sum(d => d.sales, i - 7)) }), `${deltaHtml(pctChange(sales, salesW), '%', 'done')}<span>vs last ${dTitle(prev).slice(0, 3)}</span>`, isLead() ? { page: 'sales' } : null);
      const k2 = isSS() ? kpi('timer', 'Hours', F.count(sum(d => d.hours, prev)), 'h', sparkOf(spIdx.map(i => sum(d => d.hours, i))), `<span>overtime ${sum(d => d.ot, prev).toFixed(1)} h</span>`) : kpi('timer', 'Labor % of sales', lab.toFixed(1), '%', sparkOf(spIdx.map(i => +(sum(d => d.cost, i) / sum(d => d.sales, i) * 100).toFixed(1)), { color: lab > tgt + OVER ? 'var(--warning-text)' : undefined }), `${deltaHtml(lab - labW, 'pts', lab > tgt + OVER ? 'warning' : null)}<span>vs last ${dTitle(prev).slice(0, 3)} · target ${tgt}%</span>`, { page: 'sales' });
      const k3 = kpi('clipboard-check', 'Closing Report', `${locs.filter(l => !['draft', 'overdue'].includes(crState(l, LAST))).length}`, `of ${locs.length} in`, `<span style="display:flex;gap:4px">${locs.map(l => O.cell('closingReport', crState(l, LAST), { size: 'sm', title: `${LN(l)} · ${O.STATUS.closingReport[crState(l, LAST)].label}` })).join('')}</span>`, `<span>${dTitle(LAST)} · ${S.clock === 'closing' ? 'due tomorrow 10:00' : 'due 10:00'}</span>`, { page: 'reports' });
      const k4 = isLead() ? kpi('hand-coins', 'Tip Pool', $(locs.reduce((s, l) => s + D[l][prev].card, 0) + locs.reduce((s, l) => s + (tip(l, prev).cash || 0), 0)), '', sparkOf(spIdx.map(i => locs.reduce((s, l) => s + D[l][i].card, 0))), `<span>${dTitle(prev)} · ${(n => n ? `${n} to finalize` : 'all finalized')(locs.filter(l => tipState(l, prev) === 'draft').length)}${locs.some(l => tip(l, prev).cash == null) ? ' · cash not counted' : ''}</span>`, { page: 'tips' }) : kpi('users', 'Guests', F.count(sum(d => d.guests, prev)), '', sparkOf(spIdx.map(i => sum(d => d.guests, i))), `${deltaHtml(pctChange(sum(d => d.guests, prev), sum(d => d.guests, prev - 7)), '%', 'done')}<span>vs last ${dTitle(prev).slice(0, 3)}</span>`);
      const due = dueItems(locs);
      const attn = `<div class="op-card" style="overflow:hidden"><div class="cardh"><span class="t"><b class="h3">Needs attention</b><span class="op-count">${due.length}</span></span>${isLead() ? `<span style="display:flex;gap:4px">${btn('HR Flag', act('flag-new'), 'ghost', 'plus', { sm: 1 })}${btn('Write-up', act('wu-new'), 'ghost', 'plus', { sm: 1 })}</span>` : ''}</div>${due.map(dueRow).join('') || '<div class="empty-note">Nothing needs attention.</div>'}</div>`;
      const c1 = chartCard('Net sales', 'Last 14 Business Days · dashed = same weekday, week before', el => O.charts.line(el, { labels: spIdx.map(i => String(dCol(i)[1])), tipLabels: spIdx.map(dTitle), height: 168, legend: false, yFormat: v => F.money(v, { compact: true }), series: [{ name: 'Net sales', values: spIdx.map(i => sum(d => d.sales, i)), color: 'var(--chart-current)', area: true }, { name: 'Week before', values: spIdx.map(i => sum(d => d.sales, i - 7)), color: 'var(--chart-prior)', dashed: true }], onClick: k => set({ drawer: { l: locs[0], i: spIdx[k] } }) }));
      const c2 = isSS() ? chartCard('Hours by Business Day', 'Last 14 Business Days', el => O.charts.line(el, { labels: spIdx.map(i => String(dCol(i)[1])), tipLabels: spIdx.map(dTitle), height: 168, legend: false, yFormat: v => Math.round(v) + ' h', series: [{ name: 'Hours', values: spIdx.map(i => sum(d => d.hours, i)), color: 'var(--chart-current)' }] })) : chartCard('Labor % by Business Day', `Last 14 Business Days · target ${tgt}%`, el => O.charts.line(el, { labels: spIdx.map(i => String(dCol(i)[1])), tipLabels: spIdx.map(dTitle), height: 168, legend: false, target: tgt, yFormat: v => F.pct(v, 0), series: [{ name: 'Labor %', values: spIdx.map(i => +(sum(d => d.cost, i) / sum(d => d.sales, i) * 100).toFixed(1)), color: 'var(--chart-current)' }], onClick: k => set({ drawer: { l: locs[0], i: spIdx[k] } }) }));
      main = pageHead(greet(), [`${S.clock === 'morning' ? 'Yesterday' : 'Last closed Business Day'}, ${dTitle(prev)}`, locs.length > 1 ? `${locs.length} Locations` : LN(locs[0])]) + `<div class="g-kpi">${k1}${k2}${k3}${k4}</div><div class="g-home">${attn}<div class="stack">${c1}${c2}</div></div>`;
      crumb = crumbs([['Home']]);
    } else if (S.page === 'report') { main = reportB(S.loc, S.day); crumb = crumbs([['Closing Reports', { page: 'reports' }], [`${LN(S.loc)} · ${dTitle(S.day)}`]]); navKey = 'reports'; }
    else if (S.page === 'tipday') { main = tipsB(S.loc, S.day); crumb = crumbs([['Tip Distribution', { page: 'tips' }], [`${LN(S.loc)} · ${dTitle(S.day)}`]]); navKey = 'tips'; }
    else { const sp = sectionPage(S.page, locs); main = sp.main; crumb = sp.crumb; }
    return shell(navKey, crumb, ['report', 'tipday'].includes(S.page) ? '' : scopeBtn(true), main, S.page === 'home' ? 'page--home' : '');
  }
  function reportB(l, i) {
    const r = crView(l, i), st = crState(l, i), can = editable(l, i);
    const later = r.pending && r.author === me().id && r.pending.some(s => s.status === 'pending') ? alert('warning', 'sparkles', `${r.pending.filter(s => s.status === 'pending').length} HR Flag suggestions wait for you`, 'The AI check timed out when you submitted.', btn('Review now', act('later-review', [l, i]), 'secondary', null, { sm: 1 })) : '';
    const acts = can ? btn('Submit', act('submit-start', [l, i]), 'primary', 'send') : (me().role === 'GM' && !['draft', 'overdue'].includes(st) ? btn('Amend', act('toast', 'Amendment: new version with reason; out of this prototype'), 'secondary', 'pen-line') : '');
    const stepperDays = `<span class="stepper">${btn('', go({ day: i - 1 }), 'secondary', 'chevron-left', { sm: 1 })}${btn('', go({ day: i + 1 }), 'secondary', 'chevron-right', { sm: 1, disabled: i >= LAST })}</span>`;
    return pageHead(`Closing Report · ${dTitle(i)}`, [LN(l), `Business Day ends 4:00 am`], stepperDays + acts) + reportHeader(l, i) + later + `<div class="g-21"><div class="stack">${SECTIONS.map(s => sectionCard(r, s, l, i)).join('')}</div><div class="stack sticky-col">${figures(l, i)}</div></div>`;
  }
  function tipsB(l, i) {
    if (tipState(l, i) === 'pending') return pageHead(`Tip Distribution · ${dTitle(i)}`, [LN(l)]) + notYet(l, i);
    const sp = split(l, i), t = sp.t, fin = t.state === 'finalized', iss = finalizeIssues(sp);
    const acts = fin ? '' : btn(`Finalize ${$(sp.pool)}`, act('finalize', [l, i]), 'primary', 'lock', { disabled: iss.length > 0, title: iss.join(' ') });
    const cash = `<div class="op-card"><span class="op-kpi-h">${I('banknote', 16)}Cash jar</span>${fin ? `<b>${$(t.cash)}</b>` : cashInput(sp)}<span class="tert">${fin ? `Counted by ${PN(t.by)}` : 'Counted at close, 0 if empty'}</span></div>`;
    return pageHead(`Tip Distribution · ${dTitle(i)}`, [LN(l), STATE[l]], acts) + `<div class="dayhead">${fin ? finalizedNote(sp) : `${O.chip('tipDistribution', 'draft')}<span class="tert" style="font-size:13px">Auto Draft · refreshes from the source until finalized</span>`}</div>` + (fin ? '' : tipBanners(l, sp)) +
      `<div class="pool-cards"><div class="op-card"><span class="op-kpi-h">${I('coins', 16)}Card tips</span><b>${$(t.card)}</b><span class="tert">POS, incl. auto-gratuities</span></div>${cash}<div class="op-card"><span class="op-kpi-h">${I('hand-coins', 16)}Tip Pool</span><b>${$(sp.pool)}</b><span class="tert">${$(Math.round(sp.perHour))}/h over ${sp.hrs.toFixed(1)} h</span></div><div class="op-card policy"><span class="op-kpi-h">${I('settings', 16)}Tip Policy v${POLICY[l].version}</span><span class="tert" style="font-size:12px">${tipPolicyLine(l).replace(/^Tip Policy v\d+, /, '')}</span></div></div>` +
      (!fin && iss.length ? alert('warning', 'circle-alert', 'Before you can finalize', iss.join(' ')) : '') + linesTable(sp, l, i);
  }

  /* ════════════════ Variant C: Business Day. The day is the workspace; notes, tips and figures side by side ════════════════ */
  function VariantC() {
    if (S.page !== 'day') { const sp = sectionPage(S.page, scopeLocs()); return shell(S.page, sp.crumb, scopeBtn(true), sp.main); }
    const l = myLocs().includes(S.loc) ? S.loc : myLocs()[0], i = S.day == null ? LAST : S.day;
    const r = crView(l, i), st = crState(l, i), rv = S.review && S.review.l === l && S.review.i === i ? S.review : null;
    const strip = Array.from({ length: 10 }, (_, k) => LAST - 9 + k).concat(S.clock === 'morning' ? [LAST + 1] : []).map(d => { const cs = crState(l, d), ts = d <= LAST ? tipState(l, d) : null; return `<a class="${d === i ? 'sel' : ''}" ${d > LAST ? '' : go({ day: d, review: null, editHours: null })}><span>${dCol(d)[0]} ${dCol(d)[1]}</span><span class="cells">${O.cell('closingReport', cs, { size: 'sm', title: `Report ${O.STATUS.closingReport[cs].label}` })}${isLead() && ts && ts !== 'pending' ? O.cell('tipDistribution', ts, { size: 'sm', title: `Tips ${O.STATUS.tipDistribution[ts].label}` }) : ''}</span>${d > LAST ? '<span class="tert">today</span>' : ''}</a>`; }).join('');
    const due = dueItems([l]).filter(x => x.sev <= 2);
    const dueStrip = due.length ? `<div class="due-strip">${I('list-checks', 16)}<b>${due.length} to do${S.clock === 'morning' ? ' before 10:00' : ''}</b>${due.map(x => `<button class="due-pill" ${opener(x.act)}>${O.tile(x.tile[0], x.tile[1]).replace('op-tile', 'op-tile op-tile--xs')}${x.title}</button>`).join('')}</div>` : '';
    const can = editable(l, i);
    const log = SECTIONS.map(s => r.notes[s].length || r.photos[s].length ? `<div class="log-sec"><span class="log-h">${s}</span><ul class="cns">${r.notes[s].map(n => noteLine(n, l, i)).join('')}</ul>${photosHtml(r, s, false)}</div>` : `<div class="log-sec empty"><span class="log-h">${s}</span><span class="tert">Nothing noted</span></div>`).join('');
    const comp = can && !rv ? `<div class="composer-c"><div class="op-seg">${SECTIONS.map(s => `<button aria-pressed="${S.composeSec === s}" ${go({ composeSec: s })}>${s.replace(' & ', ' & ')}</button>`).join('')}</div><div class="composer"><span class="cn-by tert">[${me().name}]:</span><div class="op-input"><input id="cmp-c" placeholder="Add a Closing Note to ${S.composeSec}" data-enter="note-add" data-arg="${esc(S.composeSec)}"></div>${btn('', act('photo-add', S.composeSec), 'ghost', 'camera', { sm: 1, title: 'Attach a photo to ' + S.composeSec })}${btn('Add', act('note-add', S.composeSec), 'primary', null, { sm: 1 })}</div></div>` : '';
    const later = r.pending && r.author === me().id && r.pending.some(s => s.status === 'pending') ? alert('warning', 'sparkles', `${r.pending.filter(s => s.status === 'pending').length} HR Flag suggestions wait for you`, 'The AI check timed out when you submitted.', btn('Review', act('later-review', [l, i]), 'secondary', null, { sm: 1 })) : '';
    const notesCol = `<section class="op-card wcol"><div class="wcol-h"><b class="h3">Closing Report</b>${O.chip('closingReport', st, { size: 'sm' })}<span style="margin-left:auto">${can && !rv ? btn('Submit', act('submit-start', [l, i]), 'primary', 'send', { sm: 1 }) : ''}</span></div><div class="wcol-b">${reportHeader(l, i, true)}${later}<div class="log">${log}</div></div>${comp}</section>`;
    let tipCol = '';
    if (isLead()) {
      const ts = tipState(l, i);
      if (ts === 'pending') tipCol = `<section class="op-card wcol"><div class="wcol-h"><b class="h3">Tip Distribution</b></div><div class="wcol-b"><div class="empty-note">${I('hourglass', 20)}<br>The Draft generates automatically after the 4:00 am cutoff, from approved hours.</div></div></section>`;
      else {
        const sp = split(l, i), fin = sp.t.state === 'finalized', iss = finalizeIssues(sp), max = Math.max(1, ...sp.ok.map(x => x.total || x.pts));
        const bars = sp.ok.map(x => `<div class="bar-row"><span class="nm">${who(x.emp)}<span class="tert">${x.pos} · ${x.w.toFixed(1)}${x.covering ? ` · from ${LN(x.covering)}` : ''}</span></span><span class="hr">${hoursCell(x, l, i, fin)}</span><span class="bar"><i style="width:${((sp.needsCash ? x.pts / Math.max(...sp.ok.map(y => y.pts)) : x.total / max) * 100).toFixed(1)}%"></i></span><b class="amt">${sp.needsCash ? $(x.cardShare) : $(x.total)}</b></div>`).join('');
        const outs = sp.out.map(x => `<div class="bar-row out"><span class="nm">${who(x.emp)}<span class="tert">${x.pos}</span></span><span class="hr">${x.kind === 'data' && !fin ? hoursCell(x, l, i, fin) : `<span class="tert">${x.h.toFixed(2)}</span>`}</span><span class="why-c">${I(x.kind === 'data' ? 'file-clock' : 'ban', 12)}${x.why}</span></div>`).join('');
        tipCol = `<section class="op-card wcol"><div class="wcol-h"><b class="h3">Tip Distribution</b>${O.chip('tipDistribution', ts, { size: 'sm' })}<span style="margin-left:auto">${fin ? '' : btn('Finalize', act('finalize', [l, i]), 'primary', 'lock', { sm: 1, disabled: iss.length > 0, title: iss.join(' ') })}</span></div><div class="wcol-b">${fin ? `<span class="tert" style="font-size:12px">Finalized ${sp.t.at} by ${PN(sp.t.by)} · v${sp.t.version}</span>` : ''}<div class="pool-eq"><span><small>Card</small>${$(sp.t.card)}</span><span class="op">+</span><span><small>Cash jar</small>${fin ? $(sp.t.cash) : cashInput(sp)}</span><span class="op">=</span><span><small>Tip Pool</small><b>${$(sp.pool)}</b></span></div>${fin ? '' : tipBanners(l, sp)}${iss.length && !fin ? `<span class="section-note warn">${iss.join(' ')}</span>` : ''}<div class="bars">${bars}</div>${sp.out.length ? `<details class="outs" data-open="outsOpen" ${S.outsOpen ? 'open' : ''}><summary>Not in the pool · ${sp.out.length}</summary>${outs}</details>` : ''}${!fin ? (S.addLine && S.addLine.l === l ? addLineForm(l) : btn('Add a missing shift', act('line-add', [l, i]), 'ghost', 'plus', { sm: 1 })) : ''}<span class="section-note">${tipPolicyLine(l)}</span></div></section>`;
      }
    }
    const side = rv ? `<section class="op-card wcol wcol--review"><div class="wcol-h"><b class="h3">${rv.later ? 'Review HR Flag suggestions' : 'Before you submit'}</b><span style="margin-left:auto">${btn('', act('review-cancel'), 'ghost', 'x', { sm: 1 })}</span></div><div class="wcol-b">${reviewBody(rv)}</div><div class="wcol-f">${btn(submitLabel(rv), act('submit-finish'), 'primary', 'check', { disabled: !reviewReady(rv) })}</div></section>` : `<section class="wcol wcol--figs">${figures(l, i, { noTop: true })}</section>`;
    const tabs = myLocs().length > 1 ? `<div class="op-tabs" role="tablist">${myLocs().map(x => `<button class="op-tab" role="tab" aria-selected="${x === l}" ${go({ loc: x, review: null, editHours: null })}>${glyphKey(x)}${LN(x)}</button>`).join('')}</div>` : '';
    const main = pageHead(i === LAST && S.clock === 'closing' ? `Tonight · ${dTitle(i)}` : dTitle(i), [LN(l), i === LAST && S.clock === 'closing' ? 'Business Day ends 4:00 am' : i === LAST ? 'Yesterday' : ''], `<span class="stepper">${btn('', go({ day: i - 1, review: null }), 'secondary', 'chevron-left', { sm: 1 })}${btn('', go({ day: Math.min(LAST, i + 1), review: null }), 'secondary', 'chevron-right', { sm: 1, disabled: i >= LAST })}</span>`) + tabs + dueStrip + `<div class="daystrip-c">${strip}</div><div class="work${isLead() ? '' : ' work--2'}${rv ? ' work--review' : ''}">${notesCol}${tipCol}${side}</div>` + (S.person ? personPop() : '');
    return shell('day', crumbs([['Business Day'], [`${LN(l)} · ${dTitle(i)}`]]), '', main, 'page--wide');
  }
  function personPop() {
    const p = P(S.person), canF = isLead() && p.id !== me().id, canW = isLead() && below(p.id);
    const fl = FLAGS.filter(f => f.emp === p.id && seesFlag(f) && f.state !== 'resolved').length, wu = WRITEUPS.filter(w => w.emp === p.id && seesWU(w) && w.state !== 'draft').length;
    return `<div class="person-pop op-card"><div class="op-emp">${O.avatar(p.name, 32)}<span class="who"><b>${p.name}</b><span>${p.role} · ${p.pos} · ${p.locs.map(LN).join(', ')}</span></span>${btn('', go({ person: null }), 'ghost', 'x', { sm: 1 })}</div>${isLead() && below(p.id) ? `<span class="tert" style="font-size:12px">${fl} open HR Flag${fl === 1 ? '' : 's'} · ${wu} Write-up${wu === 1 ? '' : 's'} on file</span>` : ''}<div class="pp-acts">${canF ? btn('Raise an HR Flag', act('flag-new', { emp: p.id }), 'secondary', 'flag', { sm: 1 }) : ''}${canW ? btn('Start a Write-up', act('wu-new', { emp: p.id }), 'secondary', 'file-pen-line', { sm: 1 }) : ''}${!canF && !canW ? '<span class="tert" style="font-size:12px">No discipline actions for your Role.</span>' : ''}</div></div>`;
  }

  /* ───────────── Actions ───────────── */
  const val = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  let tst;
  const toast = msg => { S.toast = msg; clearTimeout(tst); tst = setTimeout(() => { S.toast = null; render(); }, 3600); };
  const openReport = (l, i) => set(S.variant === 'C' ? { page: 'day', loc: l, day: i, review: null, person: null } : { page: 'report', loc: l, day: i, step: null, review: null });
  const touch = (r, l, i) => { if (r.morning && S.clock === 'closing') { /* keep Rosa's morning submission for the other clock */ } r.touched = r.touched || (S.clock === 'morning' && !!r.morning); r.lastEdit = [me().id, nowTime()]; };
  const ACT = {
    prev: () => cycle(-1), next: () => cycle(1), pop: () => set({ pop: !S.pop }), scope: () => set({ scopeOpen: !S.scopeOpen }), nav: () => set({ navOpen: !S.navOpen }),
    'modal-close': () => set({ modal: null }), toast: m => { toast(m); render(); },
    'open-report': ([l, i]) => openReport(l, i),
    'open-tips': ([l, i]) => set(S.variant === 'C' ? { page: 'day', loc: l, day: i, review: null } : { page: 'tipday', loc: l, day: i, tipStep: 0, editHours: null, addLine: null }),
    'note-add': sec => {
      const el = document.getElementById(S.variant === 'C' ? 'cmp-c' : `cmp-${SECTIONS.indexOf(sec)}`), text = el ? el.value.trim() : '';
      if (!text) return;
      const l = S.variant === 'C' ? (myLocs().includes(S.loc) ? S.loc : myLocs()[0]) : S.loc, i = S.day == null ? LAST : S.day, r = rep(l, i);
      r.notes[sec].push(note(me().id, text)); touch(r, l, i); el.value = ''; S.refocus = el.id; render();
    },
    'note-edit': id => set({ editNote: id }), 'note-cancel': () => set({ editNote: null }),
    'note-save': id => { const t = val('edit-' + id).trim(); SECTIONS.forEach(s => { Object.values(REP).forEach(r => r.notes[s].forEach(n => { if (n.id === id && t) n.text = t; })); }); set({ editNote: null }); },
    'note-del': id => { Object.values(REP).forEach(r => SECTIONS.forEach(s => { r.notes[s] = r.notes[s].filter(n => n.id !== id); })); render(); },
    'photo-add': sec => { const r = rep(S.variant === 'C' ? (myLocs().includes(S.loc) ? S.loc : myLocs()[0]) : S.loc, S.day == null ? LAST : S.day); r.photos[sec].push(`IMG_${2042 + Math.floor(Math.random() * 900)}.jpg`); toast(`Photo attached to ${sec}`); render(); },
    'submit-start': ([l, i]) => { const r = rep(l, i); const items = extract(l, allNotes(crView(l, i)), me().id); set({ review: { l, i, items, later: false }, step: 'review', modal: S.variant === 'B' ? 'review' : null, editNote: null }); },
    'later-review': ([l, i]) => { if (S.variant === 'C') { S.page = 'day'; S.loc = l; S.day = i; } else if (S.variant === 'A') { S.page = 'report'; S.loc = l; S.day = i; } set({ review: { l, i, items: rep(l, i).pending, later: true }, modal: S.variant === 'B' ? 'review' : null }); },
    'review-cancel': () => set({ review: null, step: null, modal: null }),
    'sg-confirm': k => { S.review.items.find(s => s.k === k).status = 'confirmed'; render(); },
    'sg-dismiss': k => { S.review.items.find(s => s.k === k).status = 'dismissed'; render(); },
    'sg-undo': k => { S.review.items.find(s => s.k === k).status = 'pending'; render(); },
    'sg-edit': k => { S.review.items.forEach(s => { s.editing = s.k === k; }); render(); },
    'sg-cancel': k => { S.review.items.find(s => s.k === k).editing = false; render(); },
    'sg-save': k => { const s = S.review.items.find(x => x.k === k), e = val('sge-emp'); if (!e) { toast('Pick the Employee, or dismiss the suggestion'); render(); return; } Object.assign(s, { emp: e, cat: val('sge-cat'), text: val('sge-text'), editing: false, status: 'confirmed' }); render(); },
    'sg-dismiss-all': () => { S.review.items.forEach(s => { if (s.status === 'pending') s.status = 'dismissed'; }); render(); },
    'sg-add-manual': () => { S.review.adding = true; render(); }, 'mf-cancel': () => { S.review.adding = false; render(); },
    'mf-save': () => { const t = val('mf-text').trim(); if (!t) { toast('Describe what happened'); render(); return; } S.review.items.push({ k: 's' + (++sid), cat: val('mf-cat'), emp: val('mf-emp'), name: PN(val('mf-emp')), text: t, evidence: '', note: '', status: 'confirmed', manual: true }); S.review.adding = false; render(); },
    'submit-finish': () => {
      const rv = S.review, r = rep(rv.l, rv.i), conf = rv.items.filter(s => s.status === 'confirmed');
      conf.forEach(s => FLAGS.unshift({ id: `F-${300 + FLAGS.length}`, cat: s.cat, emp: s.emp, loc: rv.l, day: rv.i, state: s.cat === 'Workplace injury' ? 'urgent' : 'open', source: s.manual ? 'Closing Report (added)' : 'Closing Report', by: me().id, text: s.text }));
      r.dismissed = r.dismissed.concat(rv.items.filter(s => s.status === 'dismissed'));
      let msg;
      if (rv.later) { r.pending = []; msg = `Review recorded · ${conf.length} HR Flag${conf.length === 1 ? '' : 's'} sent to HR`; }
      else { const wasOverdue = crState(rv.l, rv.i) === 'overdue'; touch(r, rv.l, rv.i); Object.assign(r, { state: wasOverdue ? 'late' : 'submitted', author: me().id, at: nowTime() }); if (r.morning) r.touched = true; msg = `Closing Report submitted${wasOverdue ? ' late' : ''} · ${conf.length} HR Flag${conf.length === 1 ? '' : 's'} sent to HR${isSS() && conf.length ? ' (you will not see them afterwards)' : ''}`; }
      if (S.variant === 'A' && !rv.later) set({ review: null, step: 'done', doneMsg: msg, modal: null });
      else { toast(msg); set({ review: null, step: null, modal: null }); }
    },
    'tip-step': n => set({ tipStep: n, editHours: null }),
    'hrs-edit': id => set({ editHours: id }), 'hrs-cancel': () => set({ editHours: null }),
    'hrs-save': id => {
      const h = parseFloat(val('hrs-v')), reason = val('hrs-r').trim();
      if (!(h >= 0) || !reason) { toast('Hours and a reason are both required'); render(); return; }
      Object.values(TIP).forEach(t => t.lines.forEach(x => { if (x.id === id) x.adj = { hours: +h.toFixed(2), reason, by: me().id }; }));
      set({ editHours: null });
    },
    'line-add': ([l]) => set({ addLine: { l } }), 'line-add-cancel': () => set({ addLine: null }),
    'line-add-save': l => {
      const h = parseFloat(val('al-h')), reason = val('al-r').trim(), emp = val('al-emp');
      if (!(h > 0) || !reason) { toast('Hours and a reason are both required'); render(); return; }
      const t = tip(l, S.day == null ? LAST : S.day), p = P(emp);
      t.lines.push(line(emp, val('al-pos'), 0, { adj: { hours: h, reason, by: me().id }, covering: p.locs.includes(l) ? null : p.locs[0], added: true }));
      set({ addLine: null });
    },
    finalize: ([l, i]) => { if (S.variant === 'B') set({ modal: 'finalize', fin: [l, i] }); else doFinalize(l, i); },
    'finalize-confirm': () => doFinalize(S.fin[0], S.fin[1]),
    'flag-new': a => set({ modal: 'flag', m: a || {} }),
    'flag-save': () => { const t = val('fl-text').trim(); if (!t) { toast('Describe what happened'); render(); return; } FLAGS.unshift({ id: `F-${300 + FLAGS.length}`, cat: val('fl-cat'), emp: val('fl-emp'), loc: val('fl-loc'), day: +val('fl-day'), state: val('fl-cat') === 'Workplace injury' ? 'urgent' : 'open', source: 'Standalone', by: me().id, text: t }); toast(`HR Flag sent to HR · ${PN(val('fl-emp'))}`); set({ modal: null, person: null }); },
    'wu-new': a => set({ modal: 'wu', m: a || {}, person: null }),
    'wu-save': () => { const emp = val('wu-emp'); WRITEUPS.unshift({ id: `W-${100 + WRITEUPS.length}`, emp, loc: P(emp).locs.find(l => myLocs().includes(l)), level: val('wu-lvl').replace(' (suggested)', ''), cat: val('wu-cat'), day: Math.min(CUR(), LAST), state: 'draft', by: me().id, flags: S.m && S.m.flag ? [S.m.flag] : [] }); toast(`Write-up draft saved · private to you · ${PN(emp)}`); set({ modal: null }); },
    'wu-open': id => set({ modal: 'wud', m: { id } }), 'flag-open': id => set({ modal: 'fd', m: { id } }),
    person: id => set({ person: S.person === id ? null : id })
  };
  function doFinalize(l, i) {
    const sp = split(l, i); if (finalizeIssues(sp).length) return;
    Object.assign(sp.t, { state: 'finalized', by: me().id, at: nowTime(), version: sp.t.version || 1 });
    toast(`Tip Distribution finalized · ${$(sp.pool)} to ${sp.ok.length} Employees · ${LN(l)} ${dTitle(i)}`);
    set({ modal: null, editHours: null, addLine: null, tipStep: 3 });
  }

  /* ───────────── Layer: modals, drawers, toasts ───────────── */
  function layer() {
    let h = '';
    if (S.modal === 'review' && S.review) { const rv = S.review; h += modal('review', rv.later ? `Review HR Flag suggestions · ${dTitle(rv.i)}` : `Submit Closing Report · ${dTitle(rv.i)}`, `${LN(rv.l)} · ${rv.later ? 'already submitted' : 'you become the author'}`, reviewBody(rv), btn('Back', act('review-cancel'), 'ghost') + btn(submitLabel(rv), act('submit-finish'), 'primary', 'check', { disabled: !reviewReady(rv) }), true); }
    if (S.modal === 'finalize') { const [l, i] = S.fin, sp = split(l, i); h += modal('fin', `Finalize ${LN(l)} · ${dTitle(i)}?`, 'This version locks. Only Ops or the Org Admin can reopen it, with a reason.', `<div class="kv"><span>Tip Pool</span><span>${$(sp.pool)}</span><span>Card tips</span><span>${$(sp.t.card)}</span><span>Cash jar</span><span>${$(sp.t.cash)}</span><span>Employees sharing</span><span>${sp.ok.length}</span><span>Hours in the pool</span><span>${sp.hrs.toFixed(2)}</span><span>Adjusted or added lines</span><span>${sp.rows.filter(r => r.adj).length}</span><span>Not in the pool</span><span>${sp.out.length}</span></div><span class="section-note">${tipPolicyLine(l)}</span>`, btn('Cancel', act('modal-close'), 'ghost') + btn('Finalize', act('finalize-confirm'), 'primary', 'lock')); }
    if (S.modal === 'flag') h += flagModal(S.m || {});
    if (S.modal === 'wu') h += wuModal(S.m || {});
    if (S.modal === 'wud') { const w = WRITEUPS.find(x => x.id === S.m.id); if (w) h += wuDetail(w); }
    if (S.modal === 'fd') { const f = FLAGS.find(x => x.id === S.m.id); if (f) h += flagDetail(f); }
    if (S.drawer) { const { l, i } = S.drawer; h += `<div class="drawer-layer"><div class="op-scrim" ${go({ drawer: null })}></div><aside class="op-drawer" role="dialog"><div class="op-drawer-h">${glyphKey(l)}<b class="h3" style="flex:1">${LN(l)} · ${dTitle(i)}</b>${btn('', go({ drawer: { l, i: i - 1 } }), 'secondary', 'chevron-left', { sm: 1 })}${btn('', go({ drawer: { l, i: Math.min(LAST, i + 1) } }), 'secondary', 'chevron-right', { sm: 1 })}${btn('', go({ drawer: null }), 'ghost', 'x', { sm: 1 })}</div><div class="op-drawer-b">${reportHeader(l, i)}${SECTIONS.map(s => sectionCard(crView(l, i), s, l, i, { readonly: true })).join('')}${figures(l, i)}</div><div class="op-drawer-f">${btn('Open the Closing Report', act('open-report', [l, i]), 'secondary', 'clipboard-check')}</div></aside></div>`; }
    if (S.toast) h += `<div class="toast-wrap"><div class="op-toast">${I('circle-check', 16)}<span>${esc(S.toast)}</span></div></div>`;
    return h;
  }

  /* ───────────── Prototype bar ───────────── */
  const VARIANTS = [['A', 'Inbox', 'Home is a to-do list; flows are full pages with steps'], ['B', 'Dashboard', 'Corporate Home anatomy; flows are pages, Submit and Finalize in modals'], ['C', 'Business Day', 'The day is the workspace: notes, tips and figures side by side']];
  const PERSONA_LABEL = { gm: 'GM · Jordan Reyes (2 Locations)', mgr: 'Manager · Hannah Cole', ss: 'Senior-sup · Aisha Bello' };
  function protoBar() {
    const v = VARIANTS.find(x => x[0] === S.variant);
    const bar = `<div class="proto" role="toolbar" aria-label="Prototype controls"><button class="arrow" data-act="prev" aria-label="Previous variant">‹</button><span class="lbl"><b>${v[0]}</b>${v[1]}<span class="tert" style="color:var(--proto-dim)"> · ${v[2]}</span></span><button class="arrow" data-act="next" aria-label="Next variant">›</button><span class="sep"></span><select data-set="persona" aria-label="View as">${Object.entries(PERSONA_LABEL).map(([k, t]) => `<option value="${k}" ${S.persona === k ? 'selected' : ''}>${t}</option>`).join('')}</select><select data-set="clock" aria-label="Clock"><option value="closing" ${S.clock === 'closing' ? 'selected' : ''}>Fri 9:40 pm, closing</option><option value="morning" ${S.clock === 'morning' ? 'selected' : ''}>Sat 8:12 am, morning after</option></select><button data-act="pop" aria-expanded="${S.pop}">Org toggles</button></div>`;
    const pop = S.pop ? `<div class="proto-pop"><h4>Organization toggles</h4>${[['mgrFlags', 'Managers see HR Flags', 'On by default. Off: Hannah loses the HR Flags section (she still confirms suggestions on her own reports).'], ['aiInjury', 'AI suggests injury flags', 'On by default. Off: Workplace injury is never suggested; authors add it themselves.']].map(([k, t, d]) => `<label><input type="checkbox" data-toggle="${k}" ${S[k] ? 'checked' : ''}><span><b>${t}</b><small>${d}</small></span></label>`).join('')}<div class="about">Switching persona keeps the shared draft: add a Closing Note as Aisha, switch to Hannah and it is locked to Aisha. State is in memory; reload resets it. Keys: ← → change variant.</div></div>` : '';
    return bar + pop;
  }

  /* ───────────── Render loop ───────────── */
  function set(patch) {
    if ('page' in patch && patch.page !== S.page) patch = Object.assign({ drawer: null, review: null, step: null, editNote: null, editHours: null, addLine: null, person: null }, patch);
    Object.assign(S, patch);
    render();
  }
  function render() {
    post.length = 0; uid = 0;
    const kept = {}; document.querySelectorAll('input[id], textarea[id]').forEach(el => { if (/^(cmp-|edit-|fl-text|mf-text|al-)/.test(el.id)) kept[el.id] = el.value; });
    const ae = document.activeElement, focusId = S.refocus || (ae && ae.id), sel = ae && ae.selectionStart != null ? [ae.selectionStart, ae.selectionEnd] : null; S.refocus = null;
    const scroll = document.querySelector('.scroll'), y = scroll ? scroll.scrollTop : 0, key = S.variant + S.page + S.loc + S.day + S.persona + S.step + S.tipStep, keep = render.lastKey === key;
    document.getElementById('app').innerHTML = ({ A: VariantA, B: VariantB, C: VariantC })[S.variant]();
    document.getElementById('layer').innerHTML = layer();
    document.getElementById('proto').innerHTML = protoBar();
    post.forEach(fn => fn());
    Object.entries(kept).forEach(([id, v]) => { const el = document.getElementById(id); if (el && !el.value) el.value = v; });
    const sc = document.querySelector('.scroll'); if (sc && keep) sc.scrollTop = y;
    render.lastKey = key;
    if (focusId) { const el = document.getElementById(focusId); if (el && !el.disabled) { el.focus(); if (sel && el.setSelectionRange && el.id !== S.lastRefocus) try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* number inputs */ } } }
    if (location.hash.slice(1) !== S.variant) history.replaceState(null, '', '#' + S.variant);
    document.title = `Opsell Location dashboard · ${S.variant}`;
  }
  function cycle(dir) { const k = VARIANTS.findIndex(v => v[0] === S.variant); const v = VARIANTS[(k + dir + VARIANTS.length) % VARIANTS.length][0]; set({ variant: v, page: v === 'C' ? 'day' : 'home', day: null, drawer: null, review: null, step: null, modal: null, scopeOpen: false, person: null }); }

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-act]');
    if (a) { e.preventDefault(); const fn = ACT[a.dataset.act]; if (!fn) return; let arg = a.dataset.arg; try { arg = arg != null && /^([[{]|-?\d+$)/.test(arg) ? JSON.parse(arg) : arg; } catch (x) { /* plain string */ } S.navOpen = false; fn(arg); return; }
    const el = e.target.closest('[data-go]');
    if (!el) { if (S.scopeOpen && !e.target.closest('.scope-wrap')) set({ scopeOpen: false }); if (S.person && !e.target.closest('.person-pop')) set({ person: null }); return; }
    e.preventDefault();
    const patch = JSON.parse(el.dataset.go);
    if (patch.page === 'home' && S.variant === 'C') patch.page = 'day';
    if (patch.page === 'day' && S.variant !== 'C') patch.page = 'home';
    patch.navOpen = false;
    set(patch);
  });
  document.addEventListener('keydown', e => {
    const t = e.target;
    if (e.key === 'Enter' && t.dataset && t.dataset.enter) { e.preventDefault(); ACT[t.dataset.enter](t.dataset.arg); return; }
    if (e.key === 'Enter' && t.id === 'hrs-v' || e.key === 'Enter' && t.id === 'hrs-r') { e.preventDefault(); ACT['hrs-save'](S.editHours); return; }
    if (t.closest('input, textarea, select, [contenteditable]')) return;
    if (e.key === 'ArrowLeft') cycle(-1); else if (e.key === 'ArrowRight') cycle(1); else if (e.key === 'Escape') set({ modal: null, drawer: null, scopeOpen: false, pop: false, person: null, editNote: null, editHours: null });
  });
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.live === 'cash') {
      const v = t.value.trim(), n = parseFloat(v.replace(/[$,]/g, ''));
      const l = S.variant === 'C' ? (myLocs().includes(S.loc) ? S.loc : myLocs()[0]) : S.loc, tp = tip(l, S.day == null ? LAST : S.day);
      tp.cash = v === '' || isNaN(n) ? null : Math.round(n * 100); tp.cashRaw = t.value;
      clearTimeout(document.cashT); document.cashT = setTimeout(render, 350);
    }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.set) { const patch = { [t.dataset.set]: t.value }; if (t.dataset.set === 'persona') Object.assign(patch, { page: S.variant === 'C' ? 'day' : 'home', scope: 'all', loc: 'mass', day: null, review: null, modal: null, person: null }); if (t.dataset.set === 'clock') Object.assign(patch, { review: null, modal: null }); set(patch); }
    if (t.dataset.toggle) set({ [t.dataset.toggle]: t.checked });
    if (t.dataset.live === 'wu-emp') { S.m = Object.assign({}, S.m, { emp: t.value }); render(); }
  });
  document.addEventListener('toggle', e => { if (e.target.dataset && e.target.dataset.open) S[e.target.dataset.open] = e.target.open; }, true);
  window.addEventListener('hashchange', () => { const v = location.hash.slice(1).toUpperCase(); if (VARIANTS.some(x => x[0] === v) && v !== S.variant) set({ variant: v, page: v === 'C' ? 'day' : 'home', review: null, modal: null }); });

  const h = location.hash.slice(1).toUpperCase(), q = new URLSearchParams(location.search);
  S.variant = VARIANTS.some(x => x[0] === h) ? h : VARIANTS.some(x => x[0] === q.get('variant')) ? q.get('variant') : 'A';
  if (S.variant === 'C') S.page = 'day';
  try { Object.assign(S, JSON.parse(q.get('state') || '{}')); } catch (e) { /* ?state= is a local screenshot aid only */ }
  render();
})();
