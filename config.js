/* The Scenario Desk: FINAN IV Unit 7 (base case, one input at a time, worst case, NPV break-even, accounting break-even).
   Config for lib/coursedev/desk-engine. Names swept for reuse 2026-11-04 (case_reuse.py): Bexley Courts, Bexley, Thandiwe Lusk,
   Thandiwe, Lusk, all clean.
   Version 3 (2026-11-12), rebuilt to the Unit 9 pattern (design/ROLLOUT-BRIEF-2026-11-12.md, u07/TEACHING-MAP.md,
   design/scope-2026-11-11.md, process/standards/interactive-assignments.md rules 25 to 39):
   - The reading teaches; the desk has no walkthrough of its own (rule 32).
   - Every task states the problem first, then shows a worked example drawn as the SAME table the student fills (h.ladder, rule 29),
     on one climbing gym ($800,000 build, 400 members paying $840 a year, $140 to serve, $130,000 fixed, annuity factor 6.1446).
     A faded step gives every line but one or two; the next step of the same kind leaves every line blank.
   - Dues are yearly, so a member's contribution is one subtraction.
   - Cut from the desk: the tornado chart (step and check), the walkthrough, the sensitivity-versus-scenario check, the
     pick-the-scenario step, the calculator hint and sender line (rules 33, 34).
   The previous version is in v2-archive/. seedVersion 3 and version 3: progress and receipts from v2 do not carry over. */
(function (root) {
  'use strict';
  const QUIZ = [
    { title: 'Quick check: a bad worst case',
      q: 'The new club’s base case NPV is positive, but its worst case NPV is negative. What should Thandiwe tell the board?',
      options: ['Weigh how likely and how bad the worst case is, and whether Bexley can learn more before spending the full amount', 'Reject the club, because it can lose money', 'Ignore the worst case, because the base case is positive', 'The base case must be wrong'],
      answer: 0,
      why: ['Right. Almost every project can lose money. The board weighs how likely the worst case is, how bad it would be, and whether a smaller first step could test the guesses.',
        'Almost every project has a worst case below zero. Rejecting all of them would mean never building anything.',
        'The worst case is information about risk. The board should weigh it, not ignore it.',
        'A worst case is a deliberate what-if, built by moving inputs against the project. It does not show that the base case is wrong.'] },
    { title: 'Exam-style question',
      q: 'A new club costs $900,000 and lasts 10 years at a 10% required return, so the annuity factor is 6.1446. Each member pays $600 a year and costs $120 a year to serve. Fixed costs are $180,000 a year. About how many members make the NPV exactly zero?',
      options: ['About 680 members', 'About 563 members', 'About 305 members', 'About 544 members'],
      answer: 0,
      why: ['Right. $900,000 ÷ 6.1446 = $146,470 a year. Add the $180,000 of fixed costs: $326,470. Each member contributes $600 − $120 = $480, so $326,470 ÷ $480 ≈ 680 members. Exam questions look like this one.',
        '563 is the accounting break-even: ($180,000 + $90,000 of depreciation) ÷ $480. It earns nothing on the $900,000, so it is too low.',
        '305 is $146,470 ÷ $480. Add the $180,000 of fixed costs before dividing.',
        '544 divides by the full $600 of dues. Each member also costs $120 to serve, so each contributes $480.'] },
  ];

  const STEPS = [
    { id: 'base1', label: 'The smaller club', kind: 'task' },
    { id: 'base2', label: 'The new club', kind: 'task' },
    { id: 'sens1', label: 'Fewer members', kind: 'task' },
    { id: 'sens2', label: 'Higher fixed costs', kind: 'task' },
    { id: 'scen', label: 'The worst case', kind: 'task' },
    { id: 'q1', label: 'Quick check', kind: 'check', quiz: 0 },
    { id: 'be1', label: 'How few members?', kind: 'task' },
    { id: 'be2', label: 'Your own break-even', kind: 'task' },
    { id: 'acc', label: 'Zero profit', kind: 'task' },
    { id: 'q2', label: 'Exam-style question', kind: 'check', quiz: 1 },
    { id: 'note', label: 'Your note', kind: 'note' },
  ];

  const YEARS = 10, CUT = 60;   // the worst case cuts dues by $60 a year
  const RATES = [0.08, 0.09, 0.10];
  const af4 = (h, r) => Math.round(h.annuityFactor(r, YEARS) * 1e4) / 1e4;

  // One club's inputs: members M, yearly dues Y, yearly cost to serve a member v, fixed costs F, build cost I, annuity factor AF.
  // F is set so the base case NPV is comfortably positive, then rounded to $10,000.
  function club(rng, h, o) {
    for (let k = 0; k < 400; k++) {
      const r = h.pick(rng, RATES), AF = af4(h, r), M = h.pick(rng, o.M), Y = h.pick(rng, o.Y), v = h.pick(rng, o.v);
      const I = h.between(rng, o.I[0], o.I[1], 100000), c = Y - v;
      const F = h.round(M * c - (I / AF) * (1.06 + o.k * rng()), 10000), CF = M * c - F, npv = CF * AF - I;
      const s = { r, AF, M, Y, v, I, c, F, CF, npv };
      if (F >= o.minF && npv > 0.04 * I && o.ok(s)) return s;
    }
    throw new Error('no club found');
  }
  const npvOf = (s, M, c, F) => (M * c - F) * s.AF - s.I;

  // Answers in the worked examples (the desk's climbing gym, the reading's car wash, the exam-style check). No student answer may
  // fall within the judging tolerance of one, so copying an example never passes.
  const READING = [10, 220000, 1351812, 151812, 36000, 180000, -93972, 198000, 202000, 41209, 9, 144000, -315178, 260000, 397596,
    195293, 375293, 37529, 120000, 300000, 30000, 146470, 326470, 480, 680];
  const tolFor = (l) => (l.fmt === 'num' ? 1.01 : Math.max(10, 0.001 * Math.abs(l.num)));
  let SEEN = null;
  function clashes(T) {
    const seen = SEEN || (SEEN = READING.concat(...Object.values(EXAMPLES()).map((E) => E.lines.map((l) => l.num))));
    return T.some((t) => linesFor(t).some((l) => l.input && seen.some((a) => Math.abs(a - l.num) <= tolFor(l))));
  }

  function buildTasks(rng, h) {
    for (let k = 0; k < 60; k++) { const T = draw(rng, h); if (!clashes(T)) return T; }
    throw new Error('no clash-free draw');
  }
  function draw(rng, h) {
    // The new club: every step but base1 and be1 uses it. Its 10%-fewer-members NPV is never close to zero and its worst case is
    // always below zero.
    const main = club(rng, h, { M: [900, 1000, 1100, 1200, 1300, 1400, 1500], Y: [540, 600, 660, 720], v: [100, 120, 140, 160], I: [1200000, 2000000], minF: 100000, k: 0.24,
      ok: (s) => Math.abs(npvOf(s, 0.9 * s.M, s.c, s.F)) >= 10000 && npvOf(s, 0.8 * s.M, s.c - CUT, s.F) < -10000 });
    // The smaller club in the suburbs: base1 (faded) and be1 (faded).
    const small = club(rng, h, { M: [600, 700, 800], Y: [540, 600, 660], v: [100, 120, 140], I: [900000, 1100000], minF: 60000, k: 0.10, ok: () => true });
    const T = [];
    T.push({ id: 'base1', s: small, answer: small.npv });
    T.push({ id: 'base2', s: main, answer: main.npv });
    { const M1 = 0.9 * main.M, npv = npvOf(main, M1, main.c, main.F);
      T.push({ id: 'sens1', s: main, M1, answer: npv, decision: npv > 0 ? 'build' : 'pass' }); }
    { const F1 = 1.1 * main.F, npv = npvOf(main, main.M, main.c, F1), npvM = npvOf(main, 0.9 * main.M, main.c, main.F);
      T.push({ id: 'sens2', s: main, F1, npvM, answer: npv, decision: npvM < npv ? 'members' : 'fixed' }); }
    { const Mw = 0.8 * main.M, Yw = main.Y - CUT, cw = Yw - main.v;
      T.push({ id: 'scen', s: main, Mw, Yw, cw, answer: npvOf(main, Mw, cw, main.F) }); }
    for (const [id, s] of [['be1', small], ['be2', main]]) T.push({ id, s, answer: (s.I / s.AF + s.F) / s.c });
    { const dep = main.I / YEARS, acm = (main.F + dep) / main.c, npvAt = npvOf(main, acm, main.c, main.F);
      T.push({ id: 'acc', s: main, dep, answer: acm, npvAt, decision: npvAt < 0 ? 'below' : 'above' }); }
    return T;
  }

  const money = (x) => root.DeskEngine.h.money(x);
  const n0 = (x) => Math.round(x).toLocaleString('en-US');
  const af = (s) => s.AF.toFixed(4);
  const pc = (r) => Math.round(r * 100) + '%';

  /* Lines for each kind of task. mode: 'example' (every result shown), 'faded' (the lines named in `given` shown) or 'own'
     (every line blank). A calculation names a number only when the reader can see it; otherwise it names the line in words.
     Member counts carry `num` (the exact value judged) and show with commas. */
  function mk(rows, mode, given) {
    const shown = (i) => mode === 'example' || (mode === 'faded' && given.includes(i));
    return rows.map((r, i) => {
      const calc = typeof r.calc === 'function' ? r.calc((j, words) => (shown(j) ? r.refs[j] : words)) : r.calc;
      const vis = shown(i), mem = r.kind === 'members';
      return { key: r.key, label: r.label, calc, input: !vis, num: r.value,
        value: mem && vis ? n0(r.value) : r.value, fmt: mem ? (vis ? 'text' : 'num') : 'money' };
    });
  }
  const LINES = {
    base: (s, mode) => { const CF = s.M * s.c - s.F, PV = CF * s.AF;
      return mk([
        { key: 'c', label: 'Contribution per member', calc: `${money(s.Y)} − ${money(s.v)}`, value: s.c },
        { key: 'cf', label: 'Yearly cash flow', refs: { 0: money(s.c) }, calc: (ref) => `${n0(s.M)} × ${ref(0, 'contribution')} − ${money(s.F)}`, value: CF },
        { key: 'pv', label: 'Value today of the cash', refs: { 1: money(CF) }, calc: (ref) => `${ref(1, 'yearly cash flow')} × ${af(s)}`, value: PV },
        { key: 'npv', label: 'NPV', refs: { 2: money(PV) }, calc: (ref) => `${ref(2, 'value today')} − ${money(s.I)}`, value: PV - s.I }], mode, [0, 1]); },
    sens: (s, M1, mode) => { const CF = M1 * s.c - s.F;
      return mk([
        { key: 'm', kind: 'members', label: 'Members', calc: `${n0(s.M)} × 0.90`, value: M1 },
        { key: 'cf', label: 'Yearly cash flow', refs: { 0: n0(M1) }, calc: (ref) => `${ref(0, 'members')} × ${money(s.c)} − ${money(s.F)}`, value: CF },
        { key: 'npv1', label: 'NPV', refs: { 1: money(CF) }, calc: (ref) => `${ref(1, 'yearly cash flow')} × ${af(s)} − ${money(s.I)}`, value: CF * s.AF - s.I }], mode, [0]); },
    fix: (s, F1, mode) => { const CF = s.M * s.c - F1;
      return mk([
        { key: 'f', label: 'Fixed costs', calc: `${money(s.F)} × 1.10`, value: F1 },
        { key: 'cf', label: 'Yearly cash flow', refs: { 0: money(F1) }, calc: (ref) => `${n0(s.M)} × ${money(s.c)} − ${ref(0, 'fixed costs')}`, value: CF },
        { key: 'npv1', label: 'NPV', refs: { 1: money(CF) }, calc: (ref) => `${ref(1, 'yearly cash flow')} × ${af(s)} − ${money(s.I)}`, value: CF * s.AF - s.I }], mode, [0]); },
    scen: (s, Mw, Yw, mode) => { const cw = Yw - s.v, CF = Mw * cw - s.F;
      return mk([
        { key: 'c', label: 'Contribution per member', calc: `${money(Yw)} − ${money(s.v)}`, value: cw },
        { key: 'cf', label: 'Yearly cash flow', refs: { 0: money(cw) }, calc: (ref) => `${n0(Mw)} × ${ref(0, 'contribution')} − ${money(s.F)}`, value: CF },
        { key: 'npv1', label: 'NPV', refs: { 1: money(CF) }, calc: (ref) => `${ref(1, 'yearly cash flow')} × ${af(s)} − ${money(s.I)}`, value: CF * s.AF - s.I }], mode, []); },
    be: (s, mode) => { const cf0 = s.I / s.AF, need = cf0 + s.F;
      return mk([
        { key: 'cf0', label: 'Yearly cash flow for an NPV of zero', calc: `${money(s.I)} ÷ ${af(s)}`, value: cf0 },
        { key: 'need', label: 'Add the fixed costs', refs: { 0: money(cf0) }, calc: (ref) => `${ref(0, 'that cash flow')} + ${money(s.F)}`, value: need },
        { key: 'bem', kind: 'members', label: 'Members needed', refs: { 1: money(need) }, calc: (ref) => `${ref(1, 'that total')} ÷ ${money(s.c)}`, value: need / s.c }], mode, [0]); },
    acc: (s, mode) => { const dep = s.I / YEARS, fd = s.F + dep;
      return mk([
        { key: 'dep', label: 'Depreciation a year', calc: `${money(s.I)} ÷ ${YEARS}`, value: dep },
        { key: 'fd', label: 'Fixed costs + depreciation', refs: { 0: money(dep) }, calc: (ref) => `${money(s.F)} + ${ref(0, 'depreciation')}`, value: fd },
        { key: 'acm', kind: 'members', label: 'Members for zero profit', refs: { 1: money(fd) }, calc: (ref) => `${ref(1, 'that total')} ÷ ${money(s.c)}`, value: fd / s.c }], mode, [0]); },
  };

  // The worked example: one climbing gym, its numbers different from every student's.
  const GYM = { r: 0.10, AF: 6.1446, M: 400, Y: 840, v: 140, I: 800000, c: 700, F: 130000 };
  const EXAMPLES = () => ({
    base1: { cap: 'A climbing gym costs $800,000. Its 400 members each pay $840 a year and cost $140 to serve. Fixed costs are $130,000 a year, and the annuity factor is 6.1446.', lines: LINES.base(GYM, 'example') },
    sens1: { cap: 'The same gym with 10% fewer members', lines: LINES.sens(GYM, 360, 'example'),
      after: 'With 360 members the gym’s NPV is below zero, so it would not be worth building.' },
    sens2: { cap: 'The same gym with fixed costs 10% higher', lines: LINES.fix(GYM, 143000, 'example'),
      after: 'Ten percent fewer members cut the gym’s NPV from $121,690 to −$50,359. Ten percent higher fixed costs cut it only to $41,810, so members are the guess to check hardest.' },
    scen: { cap: 'The gym’s worst case: a rival gym opens, members fall 20% to 320, and dues are cut by $60 to $780', lines: LINES.scen(GYM, 320, 780, 'example') },
    be1: { cap: 'The climbing gym: it costs $800,000, each member contributes $700, fixed costs are $130,000, and the annuity factor is 6.1446', lines: LINES.be(GYM, 'example') },
    acc: { cap: 'The climbing gym’s $800,000 build cost, depreciated evenly over 10 years', lines: LINES.acc(GYM, 'example'),
      after: 'At 300 members the gym’s profit is zero, but it needs 372 members for an NPV of zero. At its accounting break-even, its NPV is below zero.' },
  });
  const EXAMPLE_FOR = { base1: 'base1', base2: 'base1', sens1: 'sens1', sens2: 'sens2', scen: 'scen', be1: 'be1', be2: 'be1', acc: 'acc' };

  function linesFor(t) {
    if (t.id === 'base1') return LINES.base(t.s, 'faded');
    if (t.id === 'base2') return LINES.base(t.s, 'own');
    if (t.id === 'sens1') return LINES.sens(t.s, t.M1, 'faded');
    if (t.id === 'sens2') return LINES.fix(t.s, t.F1, 'own');
    if (t.id === 'scen') return LINES.scen(t.s, t.Mw, t.Yw, 'own');
    if (t.id === 'be1') return LINES.be(t.s, 'faded');
    if (t.id === 'be2') return LINES.be(t.s, 'own');
    if (t.id === 'acc') return LINES.acc(t.s, 'faded');
  }

  const b = (x) => `<b>${x}</b>`;
  const PROBLEM = {
    base1: (t) => ({ title: 'Is the smaller club worth building?', place: 'Thandiwe starts with a smaller club in the suburbs.',
      body: `<p>It would cost ${b(money(t.s.I))}. Its ${b(n0(t.s.M))} members would each pay ${b(money(t.s.Y))} a year and cost ${b(money(t.s.v))} to serve. Fixed costs are ${b(money(t.s.F))} a year, and the annuity factor is ${b(af(t.s))}. What is its NPV? The first two lines are done for you.</p>` }),
    base2: (t) => ({ title: 'Is the new club worth building?', place: 'Now the club the board will vote on.',
      body: `<p>It would cost ${b(money(t.s.I))}. Thandiwe expects ${b(n0(t.s.M))} members, each paying ${b(money(t.s.Y))} a year and costing ${b(money(t.s.v))} to serve. Fixed costs are ${b(money(t.s.F))} a year, and the annuity factor (10 years at ${pc(t.s.r)}) is ${b(af(t.s))}. What is its NPV?</p>` }),
    sens1: (t) => ({ title: 'What if fewer members join?', place: 'The board asks what happens if members come in low.',
      body: `<p>Suppose the new club gets 10% fewer members than the ${b(n0(t.s.M))} Thandiwe expects, and every other input stays at its base case value. What is the NPV, and should Bexley still build? The members line is done for you.</p>`,
      choice: { legend: 'With 10% fewer members, should Bexley build the new club?', options: [['build', 'Build: the NPV is still above zero'], ['pass', 'Pass: the NPV is below zero']] } }),
    sens2: (t) => ({ title: 'What if fixed costs run high?', place: 'Now test a different guess.',
      body: `<p>Members go back to ${b(n0(t.s.M))}. Suppose the new club’s fixed costs come in 10% higher than ${b(money(t.s.F))}, and every other input stays at its base case value. What is the NPV? Then compare the two misses.</p>`,
      choice: { legend: 'Which 10% miss lowers the new club’s NPV more?', options: [['members', '10% fewer members'], ['fixed', '10% higher fixed costs']] } }),
    scen: (t) => ({ title: 'What if a rival club opens?', place: 'Thandiwe builds one scenario that tells a story.',
      body: `<p>A rival club opens nearby. The new club would get 20% fewer members, ${b(n0(t.Mw))}, and would have to cut dues by $60, to ${b(money(t.Yw))} a year. Fixed costs stay at ${b(money(t.s.F))}. What is this worst case NPV?</p>` }),
    be1: (t) => ({ title: 'How few members can the smaller club take?', place: 'Back to the smaller club in the suburbs.',
      body: `<p>It costs ${b(money(t.s.I))}, each member contributes ${b(money(t.s.c))}, fixed costs are ${b(money(t.s.F))} a year, and the annuity factor is ${b(af(t.s))}. How many members make its NPV exactly zero? The first line is done for you.</p>` }),
    be2: (t) => ({ title: 'How few members can the new club take?', place: 'Now the new club.',
      body: `<p>It costs ${b(money(t.s.I))}, each member contributes ${b(money(t.s.c))}, fixed costs are ${b(money(t.s.F))} a year, and the annuity factor is ${b(af(t.s))}. How many members make its NPV exactly zero?</p>` }),
    acc: (t) => ({ title: 'Where does the new club make zero profit?', place: 'A board member asks about the accounting break-even.',
      body: `<p>The ${b(money(t.s.I))} build cost is depreciated evenly over 10 years. Fixed costs are ${b(money(t.s.F))} a year, and each member contributes ${b(money(t.s.c))}. How many members give zero profit? Depreciation is done for you.</p>`,
      choice: { legend: 'At that many members, the new club’s NPV is', options: [['below', 'Below zero'], ['above', 'Above zero']] } }),
  };

  function taskView(t, L, h) {
    const P = PROBLEM[t.id](t), E = EXAMPLES()[EXAMPLE_FOR[t.id]];
    const example = h.ladder(E.lines, { filled: true, caption: E.cap }) + (E.after ? `<p>${E.after}</p>` : '');
    const table = h.ladder(linesFor(t), { rows: L.rows, caption: 'Your turn' });
    const parts = [{ html: '', field: 'table' }];
    if (P.choice) parts.push({ html: '', field: 'choice' });
    return { title: P.title, place: P.place, body: P.body, example, table, parts, choice: P.choice,
      helpLabels: ['Show me the first blank', 'Show me every line'] };
  }

  // Common slips, per line, phrased with the student's own numbers.
  function diagFor(t, l) {
    const s = t.s, D = [], AF = af(s);
    const c = t.id === 'scen' ? t.cw : s.c, M = t.id === 'sens1' ? t.M1 : t.id === 'scen' ? t.Mw : s.M, F = t.id === 'sens2' ? t.F1 : s.F;
    const Y = t.id === 'scen' ? t.Yw : s.Y;
    if (l.key === 'c') { D.push([Y + s.v, 'plus', `Subtract the cost to serve a member from the dues: ${money(Y)} − ${money(s.v)}.`],
      [Y, 'dues', `That is the full dues. Subtract the ${money(s.v)} it costs to serve a member.`]);
      if (t.id === 'scen') D.push([s.c, 'old', `That uses the base case dues. In the worst case, dues are ${money(t.Yw)}.`]); }
    if (l.key === 'cf') { D.push([M * c, 'nofixed', `Subtract the fixed costs, ${money(F)}.`], [M * c + F, 'plusF', 'Subtract the fixed costs, don’t add them.'],
      [M * Y - F, 'dues', `Multiply by the contribution per member, ${money(c)}, not the full dues.`]);
      if (t.id === 'sens1') D.push([s.M * s.c - s.F, 'base', `That uses the base case members. Use the new count, ${n0(t.M1)}.`]);
      if (t.id === 'sens2') D.push([s.M * s.c - s.F, 'oldF', `That uses the old fixed costs. Use ${money(t.F1)}.`]);
      if (t.id === 'scen') D.push([s.M * c - s.F, 'basem', `Use the worst case members, ${n0(t.Mw)}.`], [M * s.c - s.F, 'basec', `Use the worst case contribution, ${money(t.cw)}, with dues of ${money(t.Yw)}.`]); }
    if (l.key === 'pv') { const CF = s.M * s.c - s.F;
      D.push([CF / s.AF, 'div', `Multiply the yearly cash flow by the annuity factor, ${AF}, don’t divide.`], [CF * YEARS, 'nodisc', `That adds up 10 years with no discounting. Multiply by the annuity factor, ${AF}, instead.`],
        [CF, 'cf', `That is one year’s cash flow. Multiply it by ${AF}.`]); }
    if (l.key === 'npv') { const PV = (s.M * s.c - s.F) * s.AF;
      D.push([PV, 'nocost', `Subtract the build cost, ${money(s.I)}.`], [PV + s.I, 'plus', 'Subtract the build cost, don’t add it.']); }
    if (l.key === 'npv1') { const CF = M * c - F;
      D.push([CF * s.AF, 'nocost', `That is the value today of the cash. Subtract the build cost, ${money(s.I)}.`], [CF * YEARS - s.I, 'nodisc', `Multiply the yearly cash flow by the annuity factor, ${AF}, not by 10.`],
        [s.npv, 'base', 'That is the base case NPV. Rebuild the yearly cash flow with the changed numbers first.']);
      if (t.id === 'sens1') D.push([s.npv * 0.9, 'cutnpv', 'That cuts the NPV by 10%. Cut the members instead, then rebuild the yearly cash flow.']); }
    if (l.key === 'f') D.push([s.F * 0.1, 'inc', `That is the increase alone. Add it to ${money(s.F)}: ${money(s.F)} × 1.10.`], [s.F * 0.9, 'lower', `Fixed costs go up 10%: ${money(s.F)} × 1.10.`]);
    if (l.key === 'cf0') D.push([s.I * s.AF, 'times', `Divide the build cost by the annuity factor, don’t multiply: ${money(s.I)} ÷ ${AF}.`],
      [s.I / YEARS, 'nodisc', `That spreads the cost over 10 years and earns nothing on it. Divide by the annuity factor, ${AF}, instead.`]);
    if (l.key === 'need') D.push([s.I / s.AF - s.F, 'minusF', 'Add the fixed costs, don’t subtract them.'], [s.I / s.AF, 'nofixed', `Add the fixed costs, ${money(s.F)}.`]);
    if (l.key === 'bem') D.push([(s.I / s.AF + s.F) / s.Y, 'dues', `Divide by the contribution per member, ${money(s.c)}, not the full dues of ${money(s.Y)}.`],
      [s.I / s.AF / s.c, 'nofixed', 'Add the fixed costs before you divide.'],
      [(s.F + s.I / YEARS) / s.c, 'acct', 'That is the accounting break-even. For the NPV break-even, start from the build cost ÷ the annuity factor.']);
    if (l.key === 'fd') D.push([s.F, 'nodep', `Add the depreciation, ${money(t.dep)}, to the fixed costs.`], [t.dep, 'nofixed', `Add the fixed costs, ${money(s.F)}.`],
      [s.F + s.I, 'cost', `Add one year of depreciation, ${money(t.dep)}, not the whole build cost.`]);
    if (l.key === 'acm') D.push([(s.F + t.dep) / s.Y, 'dues', `Divide by the contribution per member, ${money(s.c)}, not the full dues of ${money(s.Y)}.`],
      [s.F / s.c, 'nodep', 'Add the depreciation to the fixed costs before you divide.'],
      [(s.I / s.AF + s.F) / s.c, 'npvbe', 'That is the NPV break-even. For zero profit, use depreciation instead of the build cost ÷ the annuity factor.']);
    return D;
  }

  const plain = (s) => String(s).replace(/<[^>]+>/g, '');
  function judgeTask(t, e, h) {
    const lines = linesFor(t), rows = e.rows || [], rowRes = [];
    lines.forEach((l, i) => {
      if (!l.input) return;
      const exact = l.num, v = h.parseMoney(rows[i]);
      const opts = l.fmt === 'num'
        ? { tol: 1.01, scale: exact, unreadable: 'Type a number of members, like 1,050.', closeMsg: 'Close. Keep every dollar until the last line, then round to the nearest whole member.', otherMsg: `${plain(l.calc)}.` }
        : { tol: Math.max(10, 0.001 * Math.abs(exact)), scale: Math.abs(exact), unreadable: 'Type a dollar amount, like 250,000 or −45,000.', closeMsg: 'Close. Keep four decimal places in the annuity factor and round only at the end.',
          signMsg: 'The size is right, but the sign is flipped. An NPV below zero starts with a minus sign.', otherMsg: `${plain(l.calc)}.` };
      rowRes[i] = h.judgeNumber(v, exact, diagFor(t, l), opts);
    });
    const bad = rowRes.findIndex((x) => x && !x.ok);
    if (bad >= 0) return { ok: false, rowRes, msg: `${plain(lines[bad].label)}: ${rowRes[bad].msg}` };
    if (t.decision && e.choice !== t.decision) {
      if (!e.choice) return { ok: false, rowRes, msg: 'Now answer the question under the table.' };
      if (t.id === 'sens1') return { ok: false, rowRes, msg: `Look at the sign of your NPV, ${money(t.answer)}. Build only when the NPV is above zero.` };
      if (t.id === 'sens2') return { ok: false, rowRes, msg: `From the base case NPV of ${money(t.s.npv)}, 10% fewer members took it to ${money(t.npvM)}, and 10% higher fixed costs took it to ${money(t.answer)}. Which fell further?` };
      if (t.id === 'acc') return { ok: false, rowRes, msg: `At ${n0(t.answer)} members, the yearly cash flow is ${money(t.answer * t.s.c - t.s.F)}, worth ${money((t.answer * t.s.c - t.s.F) * t.s.AF)} today against the ${money(t.s.I)} build cost.` };
    }
    return { ok: true, rowRes };
  }

  const showVal = (l) => (l.fmt === 'num' || l.fmt === 'text' ? n0(l.num) : money(l.value));
  function helpText(t, lvl) {
    const lines = linesFor(t), blanks = lines.filter((l) => l.input);
    const say = (l) => `${l.label}: ${l.calc} = ${showVal(l)}`;
    return lvl === 1 ? say(blanks[0]) : lines.map(say).join('<br>');
  }
  function praise(t) {
    const s = t.s;
    if (t.id === 'base1') return `The smaller club adds ${money(t.answer)} of value on Thandiwe’s best guesses.`;
    if (t.id === 'base2') return `On its base case, the new club adds ${money(t.answer)} of value. Every input behind that number is a guess, so the next steps test them.`;
    if (t.id === 'sens1') return `A 10% miss on members moves the NPV from ${money(s.npv)} to ${money(t.answer)}. ${t.decision === 'pass' ? 'A modest miss flips the decision.' : 'The club survives this miss, with much less room to spare.'}`;
    if (t.id === 'sens2') return `Higher fixed costs leave an NPV of ${money(t.answer)}, against ${money(t.npvM)} for fewer members. Members are the guess to check hardest.`;
    if (t.id === 'scen') return `If a rival opens, the new club’s NPV is ${money(t.answer)}. Fewer members and lower dues together hurt far more than either one alone.`;
    if (t.id === 'be1') return `The smaller club needs about ${n0(t.answer)} members for an NPV of zero, against the ${n0(s.M)} Thandiwe expects.`;
    if (t.id === 'be2') return `The new club needs about ${n0(t.answer)} members, against a base case of ${n0(s.M)}. Members can fall about ${Math.round(100 * (1 - t.answer / s.M))}% before the NPV turns negative.`;
    if (t.id === 'acc') return `The club makes zero profit at about ${n0(t.answer)} members, but its NPV there is ${money(t.npvAt)}. Use the NPV break-even, about ${n0((s.I / s.AF + s.F) / s.c)} members, to decide.`;
  }
  function selfAnswer(t) {
    const rows = []; linesFor(t).forEach((l, i) => { if (l.input) rows[i] = String(Math.round(l.num)); });
    return { rows, choice: t.decision || null };
  }
  function selfWrong(t) {
    const rows = []; linesFor(t).forEach((l, i) => { if (l.input) rows[i] = String(Math.round(l.num * 1.3 + 50)); });
    return { rows, choice: t.decision || null };
  }

  root.DESK = {
    app: 'finan4-u7-scenario-desk', version: 3, seedVersion: 3, salt: 'rize-finan4-u7-scenario:e41c07', points: 20,
    storageKey: 'rize-finan4-u7-scenario-v3', filePrefix: 'ScenarioDesk',
    verifyUrl: 'https://rizecomputerscience.github.io/finan4-scenario-desk/verify.html',
    calcPlaceholder: '1500000/6.4177',
    story: { title: 'The Scenario Desk', kicker: 'Corporate Finance, Unit 7', company: 'Bexley Courts', team: 'Finance Team',
      dek: 'Bexley Courts runs indoor pickleball clubs and wants to build a new one. On its best guesses the club is worth building, but every guess could be wrong. Before the board votes, Thandiwe Lusk, the head of finance, needs to know how far the guesses can miss before the club stops paying off. You work through the numbers with her.',
      whatBox: '',
      stepsLine: 'Eleven short steps. Each shows a worked example in the same table you fill in, then you do the same calculation with your own numbers.' },
    steps: STEPS, quiz: QUIZ, walk: null, buildTasks, taskView, judgeTask, helpText, praise, selfAnswer, selfWrong,
    note: { title: 'A note for the board', label: 'Your note to Thandiwe', minWords: 30, receiptHeading: 'Note to the head of finance',
      prompt: 'Should Bexley build the new club? Tell Thandiwe what your base case NPV, your worst case and your NPV break-even each say, and name one thing Bexley could check before the board votes.' },
  };
})(typeof window !== 'undefined' ? window : globalThis);
