/* The Scenario Desk: FINAN IV Unit 7 (what if we're wrong? sensitivity, a tornado chart, break-even, scenarios). Config for lib/coursedev/desk-engine.
   Names swept for reuse 2026-11-04 (case_reuse.py): Bexley Courts, Bexley, Thandiwe Lusk, Thandiwe, Lusk, all clean.
   Rework 2026-11-05 (Samuel's Unit 10 review, design/course-principles.md; standards rules 17 to 23):
   - Round seeds. Members are a round hundred (900 to 1,500), so every 5%, 10%, 15% and 20% change is a whole number of members;
     fixed costs are a round $10,000; the tornado's dues row moves a round $5 or $10 each way instead of a percentage.
   - A 2 to 4 line worked `example` on every task. All six use one small club ($350,000 build, 300 members at $40 a month,
     $80 to serve, $60,000 fixed, annuity factor 6.7101), whose numbers differ from the task, the walk, the reading's car wash
     and the exam-style question.
   - `parts` on the four steps that ask two questions (fewer members, tornado chart, accounting break-even, pick the story),
     so each answer field sits under its own numbered question.
   - The tolerance sentence is gone from every value field (each sets its own one-line `help`). Feedback names cells, never rows,
     and the wrong-choice messages quote the student's own numbers.
   - No step here lacks a right answer, so none uses `autosave` (the note keeps the engine's own save button). The desk is
     fictional and cites nothing, so no step needs `sources`.
   seedVersion and version moved to 2, so saved progress and receipts from v1 do not carry over. */
(function (root) {
  'use strict';
  const QUIZ = [
    { title: 'Quick win: one input at a time',
      q: 'Thandiwe changes only the number of members, keeps every other input at its base value, and watches the NPV move. What is this called?',
      options: ['Sensitivity analysis', 'Scenario analysis', 'Payback', 'Accounting break-even'],
      answer: 0,
      why: ['Right. Sensitivity analysis moves one input at a time while holding the rest at their base values, so you can see how much that one input matters.',
        'Scenario analysis changes several inputs together to tell one consistent story, such as a rival club opening nearby. Here only one input moves.',
        'Payback counts how long it takes to earn back the cost. Here Thandiwe is moving one input and watching the NPV.',
        'Accounting break-even is the sales level where profit is zero. Here Thandiwe is moving one input and watching the NPV.'] },
    { title: 'Quick win: where to dig',
      q: 'A 10% drop in members turned the club’s NPV negative, but a 10% rise in the build cost barely moved it. Where should Thandiwe spend her research time before the board meets?',
      options: ['On the member forecast', 'On the build cost estimate', 'On both equally', 'On neither, because the base case NPV is positive'],
      answer: 0,
      why: ['Right. The input that moves NPV the most is the one worth checking hardest, for example with a survey of local players or the waitlist at nearby clubs.',
        'The build cost barely moves the NPV, so a better estimate of it would hardly change the decision. The member forecast is where an error is expensive.',
        'Research time is limited. Spend it where an error changes the answer, which here is the member forecast.',
        'A positive base case is only as good as its inputs. A small miss on members flips the answer, so that forecast needs checking.'] },
    { title: 'Quick win: reading a bad scenario',
      q: 'The club’s worst case has a negative NPV. What does that tell the board?',
      options: ['The project can lose money, so weigh how likely the worst case is against the others', 'The project should be rejected', 'The base case must be wrong', 'The worst case is the most likely outcome'],
      answer: 0,
      why: ['Right. Almost every project has a worst case below zero. The questions are how likely it is, how bad it is, and whether the company could test the idea before committing fully.',
        'Almost every project has a worst case below zero. Rejecting all of them would mean never building anything.',
        'A worst case is a deliberate what-if, built by moving the inputs against the project. It says nothing about whether the base case is wrong.',
        'The worst case is built from the bad end of every range at once. It is usually less likely than the base case, not more.'] },
    { title: 'Exam-style question',
      q: 'A new club costs $900,000 and lasts 10 years at a 10% discount rate (annuity factor 6.1446). Each member pays $50 a month and costs $120 a year to serve. Fixed costs are $180,000 a year. About how many members make the NPV exactly zero?',
      options: ['About 680 members', 'About 563 members', 'About 305 members', 'About 544 members'],
      answer: 0,
      why: ['Right. The club needs $900,000 ÷ 6.1446 = $146,469 of cash a year. Each member contributes $600 − $120 = $480, so (146,469 + 180,000) ÷ 480 ≈ 680 members. Questions on the exams look like this one.',
        '563 is the accounting break-even: (180,000 + 90,000 of depreciation) ÷ 480. It ignores the time value of money, so it is too low.',
        '305 covers the yearly cash the cost requires but forgets the $180,000 of fixed costs. Add them before dividing by $480.',
        '544 divides by the full $600 of dues. Each member also costs $120 a year to serve, so each one contributes only $480.'] },
  ];

  const STEPS = [
    { id: 'walk', label: 'Worked example', kind: 'walk' },
    { id: 'q1', label: 'Check 1', kind: 'check', quiz: 0 },
    { id: 't1', label: 'The base case', kind: 'task' },
    { id: 't2', label: 'Fewer members', kind: 'task' },
    { id: 'q2', label: 'Check 2', kind: 'check', quiz: 1 },
    { id: 't3', label: 'Tornado chart', kind: 'task' },
    { id: 't4', label: 'NPV break-even', kind: 'task' },
    { id: 'q3', label: 'Check 3', kind: 'check', quiz: 2 },
    { id: 't5', label: 'Accounting break-even', kind: 'task' },
    { id: 't6', label: 'Pick the story', kind: 'task' },
    { id: 'q4', label: 'Exam-style question', kind: 'check', quiz: 3 },
    { id: 'note', label: 'Your note', kind: 'note' },
  ];
  const N = 10;
  const INPUTS = [['members', 'Members'], ['dues', 'Monthly dues'], ['fixed', 'Fixed costs'], ['build', 'Build cost']];
  // Round seed sets (the tests read these).
  const ROUND = { M: [900, 1000, 1100, 1200, 1300, 1400, 1500], p: [0.05, 0.10], pm: [0.10, 0.15, 0.20], dd: [5, 10] };

  function buildTasks(rng, h) {
    const T = []; let M, D, v, I, F, r, AF, c, CF;
    for (let tries = 0; tries < 50; tries++) {   // keep drawing until the base case is comfortably positive
      r = h.pick(rng, [0.08, 0.09, 0.10]); AF = Math.round(h.annuityFactor(r, N) * 1e4) / 1e4;
      M = h.pick(rng, ROUND.M); D = h.between(rng, 45, 70, 5); v = h.between(rng, 100, 180, 20); I = h.between(rng, 1200000, 2000000, 100000);
      c = 12 * D - v; F = h.round(M * c - (I / AF) * (1.06 + 0.10 * rng()), 10000); CF = M * c - F;
      if (F > 150000 && CF * AF - I > 0.04 * I) break; }
    const npv = (m, d, f, i) => (m * (12 * d - v) - f) * AF - i;
    const base = { M, D, v, I, F, r, AF, c };
    T.push(Object.assign({ id: 't1', CF, PV: CF * AF, answer: CF * AF - I }, base));
    const p = h.pick(rng, ROUND.p); const M2 = Math.round(M * (1 - p)); const CF2 = M2 * c - F;
    T.push(Object.assign({ id: 't2', p, M2, CF2, answer: CF2 * AF - I, base0: CF * AF - I, decision: CF2 * AF - I > 0 ? 'build' : 'pass' }, base));
    let pm, dd, sw;
    for (let tries = 0; tries < 50; tries++) {   // keep drawing until the widest bar clearly beats the next one
      pm = h.pick(rng, ROUND.pm); dd = h.pick(rng, ROUND.dd);
      sw = { members: 2 * pm * M * c * AF, dues: 2 * dd * 12 * M * AF, fixed: 2 * 0.1 * F * AF, build: 2 * 0.1 * I };
      const s = Object.values(sw).sort((a, b) => b - a); if (s[0] > 1.15 * s[1]) break; }
    const Ml = Math.round(M * (1 - pm)), Mh = Math.round(M * (1 + pm));
    const tor = {
      members: { lo: Ml, hi: Mh, nLo: npv(Ml, D, F, I), nHi: npv(Mh, D, F, I) },
      dues: { lo: D - dd, hi: D + dd, nLo: npv(M, D - dd, F, I), nHi: npv(M, D + dd, F, I) },
      fixed: { lo: F * 1.1, hi: F * 0.9, nLo: npv(M, D, F * 1.1, I), nHi: npv(M, D, F * 0.9, I) },
      build: { lo: I * 1.1, hi: I * 0.9, nLo: npv(M, D, F, I * 1.1), nHi: npv(M, D, F, I * 0.9) } };
    const widest = INPUTS.map((x) => x[0]).sort((a, b) => (tor[b].nHi - tor[b].nLo) - (tor[a].nHi - tor[a].nLo))[0];
    T.push(Object.assign({ id: 't3', pm, dd, tor, decision: widest, base0: CF * AF - I }, base));
    const need = I / AF;
    T.push(Object.assign({ id: 't4', need, answer: (need + F) / c }, base));
    const dep = I / N;
    T.push(Object.assign({ id: 't5', dep, acct: (F + dep) / c, npvBE: (need + F) / c, decision: 'neg' }, base));
    const cards = { rival: { M: Math.round(M * 0.85), D: D - 5, F }, boom: { M: Math.round(M * 1.10), D: D + 5, F }, mixed: { M: Math.round(M * 0.85), D: D + 5, F } };
    const order = h.pick(rng, [['rival', 'boom', 'mixed'], ['boom', 'mixed', 'rival'], ['mixed', 'rival', 'boom'], ['rival', 'mixed', 'boom'], ['boom', 'rival', 'mixed'], ['mixed', 'boom', 'rival']]);
    const story = h.pick(rng, ['rival', 'boom']);
    const letter = (k) => 'ABC'[order.indexOf(k)];
    const cardNPV = {}; for (const k of order) cardNPV[k] = npv(cards[k].M, cards[k].D, cards[k].F, I);
    T.push(Object.assign({ id: 't6', cards, order, story, cardNPV, answer: cardNPV[story], decision: letter(story) }, base));
    return T;
  }

  const m = (x, dp) => root.DeskEngine.h.money(x, dp);
  const sgn = (x) => (x >= 0 ? '+' : '−') + m(Math.abs(x));
  const n0 = (x) => Math.round(x).toLocaleString('en-US');
  const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString('en-US');
  const pc = (x) => Math.round(x * 100) + '%';
  const af = (t) => t.AF.toFixed(4);
  const cell = (L, y, label) => `<label class="sr-only" for="r${y}">${label}</label><input id="r${y}" class="rowin" data-row="${y}" inputmode="decimal" autocomplete="off" value="${(L.rows || [])[y] ? String(L.rows[y]).replace(/"/g, '') : ''}"><span class="mark" id="mk${y}"></span>`;
  const kv = (rows, caption) => `<div class="tw"><table class="cf"><caption>${caption}</caption><tbody>${rows.map((x) => `<tr><td class="lbl">${x[0]}</td><td>${x[1]}</td></tr>`).join('')}</tbody></table></div>`;
  const facts = (t) => kv([['Members', n0(t.M)], ['Monthly dues per member', m(t.D)], ['Yearly cost to serve each member (balls, towels, card fees)', m(t.v)],
    ['Fixed costs a year (rent, staff, utilities)', m(t.F)], ['Build cost, paid today', m(t.I)], ['Life of the club', N + ' years'], ['Discount rate', pc(t.r)], [`Annuity factor (${pc(t.r)}, ${N} years)`, af(t)]], 'The new club, base case');
  const bar = (w, id) => `<div style="background:var(--panel);border-radius:3px;height:.9rem"><div ${id ? `id="${id}" ` : ''}style="background:var(--brand);height:100%;border-radius:3px;width:${Math.max(0, Math.min(100, w)).toFixed(1)}%"></div></div>`;
  const MONEY_HELP = 'Round to the nearest dollar. Start a negative NPV with a minus sign.';

  // One small club for every worked example: $350,000 to build, 300 members at $40 a month, $80 a year to serve each,
  // $60,000 of fixed costs, annuity factor 6.7101 (8%, 10 years). Each member contributes 12 × $40 − $80 = $400.
  const EX = {
    t1: `<p>A small club: 300 members, $40 a month each, $80 a year to serve each, $60,000 of fixed costs, $350,000 to build, annuity factor 6.7101.</p>
      <p>Yearly cash flow = 300 × (12 × $40 − $80) − $60,000 = 300 × $400 − $60,000 = $60,000.</p>
      <p>Value today = $60,000 × 6.7101 = $402,606.</p>
      <p>NPV = $402,606 − $350,000 = +$52,606.</p>`,
    t2: `<p>The same small club with 10% fewer members: 300 × 0.9 = 270 members.</p>
      <p>Yearly cash flow = 270 × $400 − $60,000 = $48,000.</p>
      <p>NPV = $48,000 × 6.7101 − $350,000 = −$27,915. Below zero, so pass.</p>`,
    t3: `<p>The small club’s members row, 20% each way: 240 to 360 members.</p>
      <p>Bad end = (240 × $400 − $60,000) × 6.7101 − $350,000 = −$108,436.</p>
      <p>Good end = (360 × $400 − $60,000) × 6.7101 − $350,000 = +$213,648.</p>
      <p>Bar length = good end − bad end = $213,648 − (−$108,436) = $322,084.</p>`,
    t4: `<p>The small club: cash a year for an NPV of zero = $350,000 ÷ 6.7101 = $52,160.</p>
      <p>Add the fixed costs: $52,160 + $60,000 = $112,160.</p>
      <p>Members = $112,160 ÷ $400 per member = 280.4.</p>`,
    t5: `<p>The small club: depreciation = $350,000 ÷ 10 years = $35,000 a year.</p>
      <p>Members for zero profit = ($60,000 + $35,000) ÷ $400 per member = 237.5.</p>`,
    t6: `<p>The small club’s story: it adds a café and raises dues by $5, to $45. Members stay at 300.</p>
      <p>Each member now contributes 12 × $45 − $80 = $460.</p>
      <p>NPV = (300 × $460 − $60,000) × 6.7101 − $350,000 = +$173,388.</p>`,
  };

  function taskView(t, L, h) {
    if (t.id === 't1') {
      return { title: 'The base case', place: 'Bexley wants to open a new club in a converted warehouse on the edge of town.',
        body: `<p>Thandiwe’s base case uses her best guess for every input. Ignore taxes in this desk.</p>${facts(t)}`,
        example: EX.t1,
        table: `<div class="tw"><table class="cf"><caption>The base case NPV</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col">Amount</th></tr></thead><tbody>
          <tr><td class="lbl">Yearly cash flow (members × (12 × monthly dues − cost to serve a member) − fixed costs)</td><td>${cell(L, 1, 'Yearly cash flow')}</td></tr>
          <tr><td class="lbl">Value today (yearly cash flow × annuity factor)</td><td>${cell(L, 2, 'Value today of the cash coming in')}</td></tr>
          <tr class="total hl"><td class="lbl"><b>NPV</b> (value today − build cost)</td><td>${cell(L, 3, 'NPV')}</td></tr></tbody></table></div>
          <p class="small">${MONEY_HELP}</p>`,
        helpLabels: ['Show me the yearly cash flow', 'Show me every line'] };
    }
    if (t.id === 't2') return { title: 'What if fewer members join?', place: 'A board member asks what happens if the member forecast is too high.',
      body: `<p>Lower only the members, by <b>${pc(t.p)}</b>: from ${n0(t.M)} to <b>${n0(t.M2)}</b>. Every other input stays at its base value.</p>
        ${kv([['Members', `<b>${n0(t.M2)}</b>`], [`Each member contributes a year (12 × ${m(t.D)} − ${m(t.v)})`, m(t.c)], ['Fixed costs a year', m(t.F)], ['Build cost', m(t.I)], [`Annuity factor (${pc(t.r)}, ${N} years)`, af(t)]], 'The club with fewer members')}`,
      example: EX.t2,
      parts: [{ html: '', field: 'value' }, { html: '', field: 'choice' }],
      value: { label: `1. What is the NPV with ${n0(t.M2)} members?`, help: MONEY_HELP },
      choice: { legend: '2. With this many members, should Bexley build the club?', options: [['build', 'Build it (NPV above zero)'], ['pass', 'Pass (NPV below zero)']] } };
    if (t.id === 't3') {
      const order = INPUTS.map((x) => x[0]);
      const maxSw = Math.max(...order.map((k) => t.tor[k].nHi - t.tor[k].nLo));
      const range = { members: `${n0(t.tor.members.lo)} to ${n0(t.tor.members.hi)}`, dues: `${m(t.tor.dues.lo)} to ${m(t.tor.dues.hi)}`,
        fixed: `${m(t.tor.fixed.lo)} to ${m(t.tor.fixed.hi)}`, build: `${m(t.tor.build.lo)} to ${m(t.tor.build.hi)}` };
      const rows = INPUTS.map(([k, lab]) => {
        const x = t.tor[k]; const mine = k === 'members';
        return `<tr><td class="lbl" style="border-bottom:0"><b>${lab}</b><span class="ex">${range[k]}</span></td>
          <td style="border-bottom:0">${mine ? cell(L, 1, 'NPV with the low member count') : sgn(x.nLo)}</td><td style="border-bottom:0">${mine ? cell(L, 2, 'NPV with the high member count') : sgn(x.nHi)}</td></tr>
          <tr><td colspan="3" aria-hidden="true" style="padding-top:0">${mine ? bar(0, 'myBar') : bar(100 * (x.nHi - x.nLo) / maxSw)}</td></tr>`; }).join('');
      return { title: 'The tornado chart', place: 'Thandiwe wants one picture that shows which guess matters most.',
        body: `<p>A <b>tornado chart</b> moves each input to the bad end and the good end of its range, one at a time, and draws a bar from the lower NPV to the higher one. The base case NPV is <b>${sgn(t.base0)}</b>. Thandiwe has done three rows.</p>
          ${kv([[`Each member contributes a year (12 × ${m(t.D)} − ${m(t.v)})`, m(t.c)], ['Fixed costs a year', m(t.F)], ['Build cost', m(t.I)], [`Annuity factor (${pc(t.r)}, ${N} years)`, af(t)]], 'Base case inputs for the members row')}`,
        example: EX.t3,
        parts: [{ html: `<p>1. Fill in the members row: the NPV at ${n0(t.tor.members.lo)} members (${pc(t.pm)} fewer) and at ${n0(t.tor.members.hi)} members (${pc(t.pm)} more). NPV = (members × contribution per member − fixed costs) × annuity factor − build cost.</p>`, field: 'table' },
          { html: '', field: 'choice' }],
        table: `<div class="tw"><table class="cf"><caption>Tornado chart: the NPV at the bad end and the good end of each input’s range</caption><thead><tr><th scope="col" style="text-align:left">Input and its range</th><th scope="col">Bad end</th><th scope="col">Good end</th></tr></thead><tbody>${rows}</tbody></table></div><p class="small">The bar under each input shows how far the NPV moves across its range.</p>`,
        onRows: (rs, $) => { const a = h.parseMoney(rs[1]), b = h.parseMoney(rs[2]); const el = $('#myBar'); if (el) el.style.width = (isFinite(a) && isFinite(b) ? Math.max(0, Math.min(100, 100 * Math.abs(b - a) / maxSw)) : 0).toFixed(1) + '%'; },
        choice: { legend: '2. Which input has the widest bar?', options: INPUTS },
        helpLabels: ['Show me the bad end', 'Show me both ends'] };
    }
    if (t.id === 't4') return { title: 'The NPV break-even', place: 'The board asks the question every board asks: how many members does it take?',
      body: `<p>The <b>NPV break-even</b> is the number of members that makes the NPV exactly zero. Work backward from the build cost.</p>
        ${kv([['Build cost', m(t.I)], [`Annuity factor (${pc(t.r)}, ${N} years)`, af(t)], ['Fixed costs a year', m(t.F)], [`Each member contributes a year (12 × ${m(t.D)} − ${m(t.v)})`, m(t.c)]], 'The inputs you need')}
        <p>Cash a year for an NPV of zero = build cost ÷ annuity factor. Members = (that cash + fixed costs) ÷ contribution per member.</p>`,
      example: EX.t4,
      value: { label: 'Members for an NPV of exactly zero', placeholder: '0', help: 'Give one decimal place, or round to a whole member.' } };
    if (t.id === 't5') return { title: 'Accounting break-even', place: 'The club’s accountant has a different break-even number, and the board wants to know why.',
      body: `<p>The <b>accounting break-even</b> is the number of members at which the club’s yearly profit is zero. Profit subtracts <b>depreciation</b>, the build cost spread evenly over the ${N} years, as well as fixed costs. Nothing is discounted.</p>
        ${kv([['Build cost', m(t.I)], ['Life of the club', N + ' years'], ['Fixed costs a year', m(t.F)], [`Each member contributes a year (12 × ${m(t.D)} − ${m(t.v)})`, m(t.c)]], 'The inputs you need')}`,
      example: EX.t5,
      parts: [{ html: '<p>1. Fill in both lines.</p>', field: 'table' },
        { html: '<p>Compare your answer with the members you found on the NPV break-even step.</p>', field: 'choice' }],
      table: `<div class="tw"><table class="cf"><caption>Accounting break-even</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col">Amount</th></tr></thead><tbody>
        <tr><td class="lbl">Depreciation a year (build cost ÷ ${N} years)</td><td>${cell(L, 1, 'Depreciation a year')}</td></tr>
        <tr><td class="lbl">Members for zero profit ((fixed costs + depreciation) ÷ contribution per member)</td><td>${cell(L, 2, 'Members for zero profit')}</td></tr></tbody></table></div>`,
      choice: { legend: '2. If the club has exactly the accounting break-even number of members, its NPV is', options: [['neg', 'Below zero'], ['zero', 'Exactly zero'], ['pos', 'Above zero']] },
      helpLabels: ['Show me the depreciation', 'Show me both lines'] };
    if (t.id === 't6') {
      const S = { rival: 'A rival club is opening two miles away. Thandiwe expects fewer people to join, and Bexley will have to cut its dues to keep the members it has.',
        boom: 'Pickleball leagues in town have waitlists. Thandiwe expects more people to join, and Bexley can charge more and still fill its courts.' };
      const rows = t.order.map((k, i) => `<tr><td class="lbl"><b>Scenario ${'ABC'[i]}</b></td><td>${n0(t.cards[k].M)}</td><td>${m(t.cards[k].D)}</td></tr>`).join('');
      return { title: 'Pick the scenario that fits the story', place: 'A scenario changes several inputs together, so they tell one consistent story.',
        body: `<p>The base case has <b>${n0(t.M)}</b> members paying <b>${m(t.D)}</b> a month. Thandiwe’s three scenarios change both. In all three, a member costs ${m(t.v)} a year to serve, fixed costs are ${m(t.F)}, the build cost is ${m(t.I)} and the annuity factor is ${af(t)}.</p>
          <div class="tw"><table class="cf"><caption>Three scenarios</caption><thead><tr><th scope="col" style="text-align:left">Scenario</th><th scope="col">Members</th><th scope="col">Monthly dues</th></tr></thead><tbody>${rows}</tbody></table></div>
          <p class="place" style="font-style:normal"><b>The story:</b> ${S[t.story]}</p>`,
        example: EX.t6,
        parts: [{ html: '', field: 'choice' }, { html: '<p>Contribution per member = 12 × monthly dues − cost to serve a member.</p>', field: 'value' }],
        value: { label: '2. What is the NPV of the scenario you picked?', help: MONEY_HELP },
        helpLabels: ['Show me which scenario', 'Show me the NPV'],
        choice: { legend: '1. Which scenario matches the story?', options: [['A', 'Scenario A'], ['B', 'Scenario B'], ['C', 'Scenario C']] } };
    }
  }

  function judgeTask(t, e, h) {
    const v = h.parseMoney(e.value);
    if (t.id === 't1') {
      const rows = e.rows || []; const rr = [];
      rr[1] = h.judgeNumber(h.parseMoney(rows[1]), t.CF, [[t.M * 12 * t.D - t.F, 'nov', `Subtract the cost to serve each member too: each member contributes 12 × ${m(t.D)} − ${m(t.v)} = ${m(t.c)}.`],
        [t.M * (t.D - t.v) - t.F, 'no12', 'Dues are monthly. Multiply them by 12 before subtracting the yearly cost to serve a member.'], [t.M * t.c, 'nofixed', `Subtract the fixed costs of ${m(t.F)} as well.`]],
        { otherMsg: `${n0(t.M)} × (12 × ${m(t.D)} − ${m(t.v)}) − ${m(t.F)}.` });
      const cfIn = h.parseMoney(rows[1]); const cfUse = isFinite(cfIn) ? cfIn : t.CF;
      rr[2] = h.judgeNumber(h.parseMoney(rows[2]), t.PV, [[t.CF * N, 'nodisc', `That adds up ${N} years without discounting. Multiply the yearly cash flow by the annuity factor, ${af(t)}.`], [t.CF / t.AF, 'divaf', `Multiply the yearly cash flow by the annuity factor, ${af(t)}; do not divide.`]],
        { otherMsg: `Value today = yearly cash flow × annuity factor = ${m(cfUse)} × ${af(t)}.` });
      const pvIn = h.parseMoney(rows[2]); const pvUse = isFinite(pvIn) ? pvIn : t.PV;
      rr[3] = h.judgeNumber(h.parseMoney(rows[3]), t.answer, [[t.PV, 'nocost', `Subtract the build cost of ${m(t.I)}.`], [t.CF * N - t.I, 'nodisc', 'Use the value today of the cash, not the undiscounted total.']],
        { scale: t.I, otherMsg: `NPV = value today − build cost = ${m(pvUse)} − ${m(t.I)}.` });
      const bad = [1, 2, 3].find((y) => !rr[y].ok);
      if (bad) return { ok: false, rowRes: rr, msg: `${['', 'Yearly cash flow', 'Value today', 'NPV'][bad]}: ${rr[bad].msg}` };
      return { ok: true, rowRes: rr };
    }
    if (t.id === 't2') {
      const n = h.judgeNumber(v, t.answer, [[t.base0, 'base', `That is the base case NPV. Use ${n0(t.M2)} members.`], [(t.M2 * t.c - t.F) * N - t.I, 'nodisc', `Multiply the new yearly cash flow by the annuity factor, ${af(t)}, not by ${N}.`],
        [t.M2 * t.c * t.AF - t.I, 'nofixed', `Subtract the fixed costs of ${m(t.F)} from the yearly cash flow first.`], [t.answer - t.base0, 'change', 'That is the change in NPV. Give the new NPV itself.'],
        [t.base0 * (1 - t.p), 'npvpct', `That cuts the NPV by ${pc(t.p)}. Cut the members by ${pc(t.p)} instead, to ${n0(t.M2)}, and work the NPV out again.`]],
        { scale: t.I, otherMsg: `Yearly cash flow = ${n0(t.M2)} × ${m(t.c)} − ${m(t.F)}. NPV = yearly cash flow × ${af(t)} − ${m(t.I)}.` });
      if (!n.ok) return n;
      if (e.choice !== t.decision) return { ok: false, code: 'decision', msg: !e.choice ? 'Answer question 2 as well: build or pass?' : `Your NPV is ${sgn(v)}, which is ${v > 0 ? 'above zero, so build it' : 'below zero, so pass'}.` };
      return { ok: true };
    }
    if (t.id === 't3') {
      const rows = e.rows || []; const x = t.tor.members; const rr = [];
      rr[1] = h.judgeNumber(h.parseMoney(rows[1]), x.nLo, [[(x.lo * t.c - t.F) * N - t.I, 'nodisc', `Multiply the yearly cash flow by the annuity factor, ${af(t)}.`], [x.lo * t.c * t.AF - t.I, 'nofixed', `Subtract the fixed costs of ${m(t.F)} first.`],
        [x.nHi, 'swap', `That is the NPV at ${n0(x.hi)} members. The bad end has fewer members, ${n0(x.lo)}.`], [t.base0, 'base', `That is the base case NPV. Use ${n0(x.lo)} members.`]],
        { scale: t.I, otherMsg: `(${n0(x.lo)} × ${m(t.c)} − ${m(t.F)}) × ${af(t)} − ${m(t.I)}.` });
      rr[2] = h.judgeNumber(h.parseMoney(rows[2]), x.nHi, [[(x.hi * t.c - t.F) * N - t.I, 'nodisc', `Multiply the yearly cash flow by the annuity factor, ${af(t)}.`], [x.hi * t.c * t.AF - t.I, 'nofixed', `Subtract the fixed costs of ${m(t.F)} first.`],
        [x.nLo, 'swap', `That is the NPV at ${n0(x.lo)} members. The good end has more members, ${n0(x.hi)}.`], [t.base0, 'base', `That is the base case NPV. Use ${n0(x.hi)} members.`]],
        { scale: t.I, otherMsg: `(${n0(x.hi)} × ${m(t.c)} − ${m(t.F)}) × ${af(t)} − ${m(t.I)}.` });
      const bad = [1, 2].find((y) => !rr[y].ok);
      if (bad) return { ok: false, rowRes: rr, msg: `${bad === 1 ? 'Bad end' : 'Good end'}: ${rr[bad].msg}` };
      if (e.choice !== t.decision) {
        const lo = h.parseMoney(rows[1]), hi = h.parseMoney(rows[2]);
        return { ok: false, rowRes: rr, msg: !e.choice ? 'Answer question 2 as well: which input has the widest bar?' : `Bar length = good-end NPV − bad-end NPV. Your members bar is ${sgn(hi)} − (${sgn(lo)}) = ${m(hi - lo)}. Do the same for the other three rows and pick the longest.` };
      }
      return { ok: true, rowRes: rr };
    }
    if (t.id === 't4') return h.judgeNumber(v, t.answer, [[(t.F + t.I / N) / t.c, 'acct', `That divides the build cost by ${N} years, which gives the accounting break-even. Divide the build cost by the annuity factor, ${af(t)}, instead.`],
      [t.need / t.c, 'nofixed', `Add the fixed costs of ${m(t.F)} to the cash a year before dividing by ${m(t.c)}.`], [(t.need + t.F) / (12 * t.D), 'nov', `Divide by what each member contributes, ${m(t.c)}, not by the dues alone.`], [t.need, 'cash', `That is the cash a year the club needs. Add ${m(t.F)} of fixed costs and divide by ${m(t.c)} per member.`],
      [(t.I * t.AF + t.F) / t.c, 'mulaf', `Divide the build cost by the annuity factor, ${af(t)}; do not multiply.`]],
      { tol: Math.max(1, 0.001 * t.answer), unreadable: 'Type a number of members, like 1,050.', otherMsg: `Cash a year for an NPV of zero = ${m(t.I)} ÷ ${af(t)}. Members = (that cash + ${m(t.F)}) ÷ ${m(t.c)}.` });
    if (t.id === 't5') {
      const rows = e.rows || []; const rr = [];
      rr[1] = h.judgeNumber(h.parseMoney(rows[1]), t.dep, [[t.I / t.AF, 'af', `That divides by the annuity factor. Depreciation simply divides the build cost by ${N} years: ${m(t.I)} ÷ ${N}.`]], { otherMsg: `${m(t.I)} ÷ ${N}.` });
      rr[2] = h.judgeNumber(h.parseMoney(rows[2]), t.acct, [[t.F / t.c, 'nodep', `Add the depreciation of ${m(t.dep)} to the fixed costs of ${m(t.F)} before dividing.`], [(t.F + t.dep) / (12 * t.D), 'nov', `Divide by what each member contributes, ${m(t.c)}.`], [t.npvBE, 'npv', 'That is the NPV break-even. Accounting break-even uses depreciation, not the annuity factor.']],
        { tol: Math.max(1, 0.001 * t.acct), otherMsg: `(${m(t.F)} + depreciation) ÷ ${m(t.c)}.` });
      const bad = [1, 2].find((y) => !rr[y].ok);
      if (bad) return { ok: false, rowRes: rr, msg: `${bad === 1 ? 'Depreciation' : 'Members for zero profit'}: ${rr[bad].msg}` };
      if (e.choice !== t.decision) return { ok: false, rowRes: rr, msg: !e.choice ? 'Answer question 2 as well.' : `At ${n1(t.acct)} members the club covers its depreciation, but the NPV break-even needs about ${n1(t.npvBE)} members. ${n1(t.acct)} is fewer, so the club falls short of the return Bexley requires.` };
      return { ok: true, rowRes: rr };
    }
    if (t.id === 't6') {
      if (e.choice !== t.decision) {
        if (!e.choice) return { ok: false, code: 'decision', msg: 'Answer question 1 first: which scenario matches the story?' };
        const k = t.order['ABC'.indexOf(e.choice)]; const cd = t.cards[k]; const way = (a, b) => (a > b ? 'rise' : 'fall');
        const want = t.story === 'rival' ? 'fall' : 'rise';
        if (!cd) return { ok: false, code: 'decision', msg: `The story says members and dues both ${want}. Find the scenario where both move that way.` };
        return { ok: false, code: 'decision', msg: `In scenario ${e.choice}, members ${way(cd.M, t.M)} (${n0(t.M)} to ${n0(cd.M)}) and dues ${way(cd.D, t.D)} (${m(t.D)} to ${m(cd.D)}). The story says both ${want}.` };
      }
      const diag = t.order.filter((k) => k !== t.story).map((k) => [t.cardNPV[k], 'other', `That is the NPV of scenario ${'ABC'[t.order.indexOf(k)]}. Work out the scenario you picked.`]);
      const cd = t.cards[t.story];
      return h.judgeNumber(v, t.answer, diag.concat([[(cd.M * (12 * cd.D - t.v) - cd.F) * N - t.I, 'nodisc', `Multiply the yearly cash flow by the annuity factor, ${af(t)}.`],
        [(cd.M * t.c - cd.F) * t.AF - t.I, 'olddues', `Dues changed to ${m(cd.D)}, so each member now contributes 12 × ${m(cd.D)} − ${m(t.v)} = ${m(12 * cd.D - t.v)}, not ${m(t.c)}.`]]),
        { scale: t.I, otherMsg: `Contribution per member = 12 × ${m(cd.D)} − ${m(t.v)}. NPV = (${n0(cd.M)} × contribution − ${m(cd.F)}) × ${af(t)} − ${m(t.I)}.` });
    }
  }

  function helpText(t, lvl, h) {
    if (t.id === 't1') return lvl === 1 ? `${n0(t.M)} × (12 × ${m(t.D)} − ${m(t.v)}) − ${m(t.F)} = ${n0(t.M)} × ${m(t.c)} − ${m(t.F)} = ${m(t.CF)}.`
      : `Yearly cash flow: ${m(t.CF)}. Value today: ${m(t.CF)} × ${af(t)} = ${m(t.PV)}. NPV: ${m(t.PV)} − ${m(t.I)} = ${sgn(t.answer)}.`;
    if (t.id === 't2') return lvl === 1 ? `Yearly cash flow: ${n0(t.M2)} × ${m(t.c)} − ${m(t.F)} = ${m(t.CF2)}.`
      : `${m(t.CF2)} × ${af(t)} − ${m(t.I)} = ${sgn(t.answer)}, so the club should be ${t.decision === 'build' ? 'built' : 'passed on'}. A ${pc(t.p)} miss on members moved the NPV by ${sgn(t.answer - t.base0)}.`;
    if (t.id === 't3') { const x = t.tor.members;
      if (lvl === 1) return `Bad end: (${n0(x.lo)} × ${m(t.c)} − ${m(t.F)}) × ${af(t)} − ${m(t.I)} = ${sgn(x.nLo)}.`;
      return `Bad end: ${sgn(x.nLo)}. Good end: (${n0(x.hi)} × ${m(t.c)} − ${m(t.F)}) × ${af(t)} − ${m(t.I)} = ${sgn(x.nHi)}.<br>` + INPUTS.map(([k, lab]) => `${lab}: the bar runs ${m(t.tor[k].nHi - t.tor[k].nLo)}`).join('<br>') + `<br>The widest bar is ${INPUTS.find((z) => z[0] === t.decision)[1].toLowerCase()}.`; }
    if (t.id === 't4') return lvl === 1 ? `The club needs ${m(t.I)} ÷ ${af(t)} = ${m(t.need)} of cash a year to make NPV zero.`
      : `(${m(t.need)} + ${m(t.F)}) ÷ ${m(t.c)} = ${n1(t.answer)} members. In Desmos, three lines: <code>${t.I}/${t.AF}</code>, then <code>ans+${t.F}</code>, then <code>ans/${t.c}</code>.`;
    if (t.id === 't5') return lvl === 1 ? `Depreciation: ${m(t.I)} ÷ ${N} = ${m(t.dep)} a year.`
      : `Depreciation: ${m(t.dep)}. Members for zero profit: (${m(t.F)} + ${m(t.dep)}) ÷ ${m(t.c)} = ${n1(t.acct)}. That is below the NPV break-even of ${n1(t.npvBE)}, so at ${n1(t.acct)} members the NPV is below zero.`;
    if (t.id === 't6') { const cd = t.cards[t.story];
      return lvl === 1 ? `The story says members ${t.story === 'rival' ? 'fall' : 'rise'} and dues ${t.story === 'rival' ? 'fall' : 'rise'}. That is scenario ${t.decision}.`
        : `Scenario ${t.decision}: contribution = 12 × ${m(cd.D)} − ${m(t.v)} = ${m(12 * cd.D - t.v)}. NPV = (${n0(cd.M)} × ${m(12 * cd.D - t.v)} − ${m(cd.F)}) × ${af(t)} − ${m(t.I)} = ${sgn(t.answer)}.`; }
  }
  function praise(t) {
    if (t.id === 't1') return `The base case adds ${sgn(t.answer)} of value. Every input behind it is a guess, so the next steps test the guesses.`;
    if (t.id === 't2') return `A ${pc(t.p)} miss on members moves the NPV by ${sgn(t.answer - t.base0)}, to ${sgn(t.answer)}. ${t.decision === 'pass' ? 'A modest miss flips the decision.' : 'The club survives this miss, but with much less room to spare.'}`;
    if (t.id === 't3') return `The widest bar is ${INPUTS.find((z) => z[0] === t.decision)[1].toLowerCase()}. That is the guess to check hardest before the board votes.`;
    if (t.id === 't4') return `The club needs about ${n0(Math.ceil(t.answer))} members, against a base case of ${n0(t.M)}. That gap of ${n0(t.M - Math.ceil(t.answer))} members is the room for error.`;
    if (t.id === 't5') return `Accounting break-even is about ${n0(Math.ceil(t.acct))} members, but the NPV break-even is about ${n0(Math.ceil(t.npvBE))}. A club that only covers its depreciation never earns the return Bexley requires on the money it spent.`;
    if (t.id === 't6') return `Scenario ${t.decision} tells the story: members and dues both ${t.story === 'rival' ? 'fall' : 'rise'}, for an NPV of ${sgn(t.answer)}.`;
  }
  function selfAnswer(t) {
    if (t.id === 't1') return { rows: [null, String(Math.round(t.CF)), String(Math.round(t.PV)), String(Math.round(t.answer))] };
    if (t.id === 't3') return { rows: [null, String(Math.round(t.tor.members.nLo)), String(Math.round(t.tor.members.nHi))], choice: t.decision };
    if (t.id === 't4') return { value: t.answer.toFixed(1) };
    if (t.id === 't5') return { rows: [null, String(Math.round(t.dep)), t.acct.toFixed(1)], choice: t.decision };
    return { value: String(Math.round(t.answer)), choice: t.decision || null };
  }
  function selfWrong(t) {
    if (t.id === 't1') return { rows: [null, String(Math.round(t.CF)), String(Math.round(t.CF * N)), String(Math.round(t.CF * N - t.I))] };
    if (t.id === 't3') return { rows: [null, String(Math.round(t.tor.members.lo * t.c * t.AF - t.I)), String(Math.round(t.tor.members.nHi))], choice: t.decision };
    if (t.id === 't4') return { value: ((t.F + t.I / N) / t.c).toFixed(1) };
    if (t.id === 't5') return { rows: [null, String(Math.round(t.dep)), t.acct.toFixed(1)], choice: 'zero' };
    if (t.id === 't6') { const other = t.order.find((k) => k !== t.story); return { value: String(Math.round(t.cardNPV[other])), choice: t.decision }; }
    return { value: String(Math.round(t.answer + 0.05 * t.I)), choice: t.decision || null };
  }

  const WALK = {
    title: 'How Thandiwe tests one small club',
    intro: `<p>Here is Bexley’s smallest club. Click through to see how Thandiwe tests her guesses.</p>
      ${kv([['Build cost, paid today', '$600,000'], ['Life of the club', '10 years'], ['Discount rate', '9%'], ['Annuity factor (9%, 10 years)', '6.4177'], ['Members', '500'], ['Monthly dues', '$50'], ['Yearly cost to serve each member', '$100'], ['Fixed costs a year', '$140,000']], 'The small club, base case')}`,
    render(stage) {
      if (stage < 3) {
        const rows = [['Base case: 500 members', '$110,000', '$110,000 × 6.4177 − $600,000', '+$105,947', 0],
          ['Members 10% lower: 450', '$85,000', '$85,000 × 6.4177 − $600,000', '−$54,496', 1],
          ['Build cost 10% higher: $660,000', '$110,000', '$110,000 × 6.4177 − $660,000', '+$45,947', 2]];
        return `<div class="tw"><table class="cf"><caption>Changing one input at a time</caption><thead><tr><th scope="col" style="text-align:left">Case</th><th scope="col">Yearly cash flow</th><th scope="col" style="text-align:left">Working</th><th scope="col">NPV</th></tr></thead><tbody>${rows.filter((r) => r[4] <= stage).map((r) => `<tr class="${r[4] === stage ? 'reveal' : ''}"><td class="lbl">${r[0]}</td><td>${r[1]}</td><td class="lbl">${r[2]}</td><td class="${r[3][0] === '−' ? 'neg' : ''}">${r[3]}</td></tr>`).join('')}</tbody></table></div>`;
      }
      if (stage === 3) {
        const rows = [['Monthly dues, $45 to $55', '−$86,584', '+$298,478', 385062], ['Members, 450 to 550', '−$54,496', '+$266,390', 320885], ['Fixed costs, $154,000 to $126,000', '+$16,099', '+$195,795', 179696], ['Build cost, $660,000 to $540,000', '+$45,947', '+$165,947', 120000]];
        return `<div class="tw"><table class="cf"><caption>Tornado chart, every input moved 10% each way</caption><thead><tr><th scope="col" style="text-align:left">Input</th><th scope="col">Bad end</th><th scope="col">Good end</th></tr></thead><tbody>${rows.map((r) => `<tr><td class="lbl" style="border-bottom:0">${r[0]}</td><td class="${r[1][0] === '−' ? 'neg' : ''}" style="border-bottom:0">${r[1]}</td><td style="border-bottom:0">${r[2]}</td></tr><tr><td colspan="3" aria-hidden="true" style="padding-top:0">${bar(100 * r[3] / 385062)}</td></tr>`).join('')}</tbody></table></div>`;
      }
      const rows = [['Cash a year for an NPV of zero', '$600,000 ÷ 6.4177', '$93,491'], ['Add the fixed costs', '$93,491 + $140,000', '$233,491'], ['Members needed', '$233,491 ÷ $500', '467.0'], ['Room for error against 500 members', '500 − 467', '33 members']];
      return `<div class="tw"><table class="cf"><caption>The NPV break-even for members</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col" style="text-align:left">Working</th><th scope="col">Result</th></tr></thead><tbody>${rows.map((r, i) => `<tr class="${i === 3 ? 'hl' : ''}"><td class="lbl">${r[0]}</td><td class="lbl">${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>`;
    },
    stages: [
      { t: 'The base case', p: 'Each member pays 12 × $50 = $600 a year and costs $100 to serve, so each one contributes $500. Yearly cash flow = 500 × $500 − $140,000 = $110,000. NPV = $110,000 × 6.4177 − $600,000 = +$105,947.' },
      { t: 'Change one input', p: 'Thandiwe lowers only the members, by 10%, to 450. The NPV falls to −$54,496, so a 10% miss flips the answer. This is <b>sensitivity analysis</b>: one input moves and the rest stay at their base values.' },
      { t: 'Change a different input', p: 'Members go back to 500, and the build cost rises 10%. The NPV is still +$45,947. The club cares far more about members than about its build cost.' },
      { t: 'Rank the inputs', p: 'A <b>tornado chart</b> runs that test for every input and sorts the bars, widest first. The top bars are the guesses to check hardest.' },
      { t: 'Find the break-even', p: 'The <b>NPV break-even</b> is the member count that makes the NPV exactly zero: about 467. The base case has 33 members of room for error.' },
    ],
  };

  root.DESK = {
    app: 'finan4-u7-scenario-desk', version: 2, seedVersion: 2, salt: 'rize-finan4-u7-scenario:7b2e95', points: 20,
    storageKey: 'rize-finan4-u7-scenario-v2', filePrefix: 'ScenarioDesk', round: ROUND,
    verifyUrl: 'https://rizecomputerscience.github.io/finan4-scenario-desk/verify.html',
    calcPlaceholder: '(1200*520-380000)*6.4177-1400000',
    calcHint: 'Type or tap. Use * to multiply and parentheses to group, so (500*500-140000)*6.4177-600000 is the NPV of a $600,000 club whose 500 members each contribute $500 a year, with $140,000 of fixed costs and an annuity factor of 6.4177.',
    story: { title: 'The Scenario Desk', kicker: 'Corporate Finance, Unit 7', company: 'Bexley Courts', team: 'Finance Team',
      from: 'Thandiwe Lusk', fromTitle: 'head of finance, Bexley Courts',
      dek: 'You have joined the finance team at Bexley Courts, a chain of indoor pickleball clubs. Thandiwe Lusk, the head of finance, has a positive NPV for a new club. Before the board votes, she wants to know what happens if her guesses are wrong.',
      whatBox: '<b>Every NPV is built on guesses.</b> Testing one input at a time shows which guesses matter, a break-even shows how far a guess can miss, and scenarios show what happens when several things go wrong or right together.',
      stepsLine: 'There are twelve steps: a worked example, six problems with three one-question checks between them, one exam-style question, and a short note to Thandiwe.' },
    steps: STEPS, quiz: QUIZ, walk: WALK, buildTasks, taskView, judgeTask, helpText, praise, selfAnswer, selfWrong,
    note: { title: 'A note for the board', label: 'Your note to Thandiwe', minWords: 30, receiptHeading: 'Note to the head of finance',
      prompt: 'The board votes next week. Should Bexley build this club? Name the input that worries you most and why, say what the NPV break-even tells the board, and suggest one thing Bexley could check before signing the lease.' },
  };
})(typeof window !== 'undefined' ? window : globalThis);
