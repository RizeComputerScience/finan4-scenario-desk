/* The Scenario Desk: FINAN IV Unit 7 (what if we're wrong? sensitivity, a tornado chart, break-even, scenarios). Config for lib/coursedev/desk-engine.
   Names swept for reuse 2026-11-04 (case_reuse.py): Bexley Courts, Bexley, Thandiwe Lusk, Thandiwe, Lusk, all clean. */
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

  function buildTasks(rng, h) {
    const T = []; let M, D, v, I, F, r, AF, c, CF;
    for (let tries = 0; tries < 50; tries++) {   // keep drawing until the base case is comfortably positive
      r = h.pick(rng, [0.08, 0.09, 0.10]); AF = Math.round(h.annuityFactor(r, N) * 1e4) / 1e4;
      M = h.between(rng, 900, 1500, 50); D = h.between(rng, 45, 70, 5); v = h.between(rng, 100, 180, 20); I = h.between(rng, 1200000, 2000000, 100000);
      c = 12 * D - v; F = h.round(M * c - (I / AF) * (1.06 + 0.10 * rng()), 5000); CF = M * c - F;
      if (F > 150000 && CF * AF - I > 0.04 * I) break; }
    const npv = (m, d, f, i) => (m * (12 * d - v) - f) * AF - i;
    const base = { M, D, v, I, F, r, AF, c };
    T.push(Object.assign({ id: 't1', CF, PV: CF * AF, answer: CF * AF - I }, base));
    const p = h.pick(rng, [0.05, 0.10]); const M2 = Math.round(M * (1 - p)); const CF2 = M2 * c - F;
    T.push(Object.assign({ id: 't2', p, M2, CF2, answer: CF2 * AF - I, base0: CF * AF - I, decision: CF2 * AF - I > 0 ? 'build' : 'pass' }, base));
    let pm, pd, sw;
    for (let tries = 0; tries < 50; tries++) {   // keep drawing until the widest bar clearly beats the next one
      pm = h.pick(rng, [0.10, 0.15, 0.20]); pd = h.pick(rng, [0.05, 0.10]);
      sw = { members: 2 * pm * M * c * AF, dues: 2 * pd * M * 12 * D * AF, fixed: 2 * 0.1 * F * AF, build: 2 * 0.1 * I };
      const s = Object.values(sw).sort((a, b) => b - a); if (s[0] > 1.15 * s[1]) break; }
    const Ml = Math.round(M * (1 - pm)), Mh = Math.round(M * (1 + pm));
    const tor = {
      members: { lo: Ml, hi: Mh, nLo: npv(Ml, D, F, I), nHi: npv(Mh, D, F, I) },
      dues: { lo: D * (1 - pd), hi: D * (1 + pd), nLo: npv(M, D * (1 - pd), F, I), nHi: npv(M, D * (1 + pd), F, I) },
      fixed: { lo: F * 1.1, hi: F * 0.9, nLo: npv(M, D, F * 1.1, I), nHi: npv(M, D, F * 0.9, I) },
      build: { lo: I * 1.1, hi: I * 0.9, nLo: npv(M, D, F, I * 1.1), nHi: npv(M, D, F, I * 0.9) } };
    const widest = INPUTS.map((x) => x[0]).sort((a, b) => (tor[b].nHi - tor[b].nLo) - (tor[a].nHi - tor[a].nLo))[0];
    T.push(Object.assign({ id: 't3', pm, pd, tor, decision: widest, base0: CF * AF - I }, base));
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
  const facts = (t, opts) => {
    opts = opts || {};
    const rows = [['Members', n0(opts.M || t.M)], ['Monthly dues per member', m(opts.D || t.D, (opts.D || t.D) % 1 ? 1 : 0)], ['Yearly cost to serve each member (balls, towels, card fees)', m(t.v)],
      ['Fixed costs a year (rent, staff, utilities)', m(t.F)], ['Build cost, paid today', m(t.I)], ['Life of the club', N + ' years'], ['Discount rate', pc(t.r)], [`Annuity factor (${pc(t.r)}, ${N} years)`, af(t)]];
    return `<div class="tw"><table class="cf"><caption>${opts.caption || 'The new club, base case'}</caption><tbody>${rows.map((x) => `<tr><td class="lbl">${x[0]}</td><td>${x[1]}</td></tr>`).join('')}</tbody></table></div>`;
  };
  const bar = (w, id) => `<div style="background:var(--panel);border-radius:3px;height:.9rem"><div ${id ? `id="${id}" ` : ''}style="background:var(--brand);height:100%;border-radius:3px;width:${Math.max(0, Math.min(100, w)).toFixed(1)}%"></div></div>`;

  function taskView(t, L, h) {
    if (t.id === 't1') {
      return { title: 'The base case', place: 'Bexley wants to open a new club in a converted warehouse on the edge of town.',
        body: `<p>Thandiwe’s base case uses her best guess for every input. Ignore taxes in this desk.</p>${facts(t)}<p>Fill in the three rows. Yearly cash flow = members × (12 × monthly dues − cost to serve a member) − fixed costs.</p>`,
        table: `<div class="tw"><table class="cf"><caption>The base case NPV</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col">Amount</th></tr></thead><tbody>
          <tr><td class="lbl">Yearly cash flow</td><td>${cell(L, 1, 'Yearly cash flow')}</td></tr>
          <tr><td class="lbl">Value today of ${N} years of that cash (cash flow × annuity factor)</td><td>${cell(L, 2, 'Value today of the cash coming in')}</td></tr>
          <tr class="total hl"><td class="lbl"><b>NPV</b> (value today − build cost)</td><td>${cell(L, 3, 'NPV')}</td></tr></tbody></table></div>`,
        helpLabels: ['Show me the yearly cash flow', 'Show me every row'] };
    }
    if (t.id === 't2') return { title: 'What if fewer members join?', place: 'A board member asks what happens if the member forecast is too high.',
      body: `<p>Keep every other input at its base value and lower only the members, by <b>${pc(t.p)}</b>, from ${n0(t.M)} to <b>${n0(t.M2)}</b>. Each member still contributes 12 × ${m(t.D)} − ${m(t.v)} = <b>${m(t.c)}</b> a year, fixed costs stay <b>${m(t.F)}</b>, the build cost stays <b>${m(t.I)}</b>, and the annuity factor stays <b>${af(t)}</b>.</p><p>What is the new NPV? Then say whether the club still passes the NPV test.</p>`,
      value: { label: `NPV with ${n0(t.M2)} members` },
      choice: { legend: 'With this many members, the club should', options: [['build', 'Be built (NPV above zero)'], ['pass', 'Be passed on (NPV below zero)']] } };
    if (t.id === 't3') {
      const order = INPUTS.map((x) => x[0]);
      const maxSw = Math.max(...order.map((k) => t.tor[k].nHi - t.tor[k].nLo));
      const range = { members: `${n0(t.tor.members.lo)} to ${n0(t.tor.members.hi)} (±${pc(t.pm)})`, dues: `${m(t.tor.dues.lo, 1)} to ${m(t.tor.dues.hi, 1)} (±${pc(t.pd)})`,
        fixed: `${m(t.tor.fixed.lo)} to ${m(t.tor.fixed.hi)} (±10%)`, build: `${m(t.tor.build.lo)} to ${m(t.tor.build.hi)} (±10%)` };
      const rows = INPUTS.map(([k, lab]) => {
        const x = t.tor[k]; const mine = k === 'members';
        const narrow = (y, lab2) => cell({ rows: L.rows }, y, lab2);
        return `<tr><td class="lbl" style="border-bottom:0"><b>${lab}</b><span class="ex">${range[k]}</span></td>
          <td style="border-bottom:0">${mine ? narrow(1, 'NPV with the low member count') : sgn(x.nLo)}</td><td style="border-bottom:0">${mine ? narrow(2, 'NPV with the high member count') : sgn(x.nHi)}</td></tr>
          <tr><td colspan="3" aria-hidden="true" style="padding-top:0">${mine ? bar(0, 'myBar') : bar(100 * (x.nHi - x.nLo) / maxSw)}</td></tr>`; }).join('');
      return { title: 'The tornado chart', place: 'Thandiwe wants one picture that shows which guess matters most.',
        body: `<p>A <b>tornado chart</b> moves each input to the bad and the good end of its range, one at a time, and draws a bar from the lower NPV to the higher one. The base case NPV is <b>${sgn(t.base0)}</b>. Thandiwe has done three rows.</p><p>Fill in the members row: the NPV at ${n0(t.tor.members.lo)} members and at ${n0(t.tor.members.hi)} members, with everything else at its base value. Each member contributes <b>${m(t.c)}</b> a year, fixed costs are <b>${m(t.F)}</b>, the build cost is <b>${m(t.I)}</b> and the annuity factor is <b>${af(t)}</b>. Then pick the input with the widest bar.</p>`,
        table: `<div class="tw"><table class="cf"><caption>Tornado chart: the NPV at the bad end and the good end of each input’s range</caption><thead><tr><th scope="col" style="text-align:left">Input and its range</th><th scope="col">Bad end</th><th scope="col">Good end</th></tr></thead><tbody>${rows}</tbody></table></div><p class="small">The bar under each input shows how far the NPV moves across its range.</p>`,
        onRows: (rs, $) => { const a = h.parseMoney(rs[1]), b = h.parseMoney(rs[2]); const el = $('#myBar'); if (el) el.style.width = (isFinite(a) && isFinite(b) ? Math.max(0, Math.min(100, 100 * Math.abs(b - a) / maxSw)) : 0).toFixed(1) + '%'; },
        choice: { legend: 'Which input has the widest bar?', options: INPUTS },
        helpLabels: ['Show me the bad end', 'Show me both ends'] };
    }
    if (t.id === 't4') return { title: 'The NPV break-even', place: 'The board asks the question every board asks: how many members does it take?',
      body: `<p>The <b>NPV break-even</b> is the number of members that makes the NPV exactly zero. Work backward from the build cost.</p>
        <div class="tw"><table class="cf"><caption>The inputs you need</caption><tbody><tr><td class="lbl">Build cost</td><td>${m(t.I)}</td></tr><tr><td class="lbl">Annuity factor (${pc(t.r)}, ${N} years)</td><td>${af(t)}</td></tr><tr><td class="lbl">Fixed costs a year</td><td>${m(t.F)}</td></tr><tr><td class="lbl">Each member contributes a year (12 × ${m(t.D)} − ${m(t.v)})</td><td>${m(t.c)}</td></tr></tbody></table></div>
        <p>First find the yearly cash flow that makes NPV zero (build cost ÷ annuity factor). Then find how many members produce that cash flow after fixed costs.</p>`,
      value: { label: 'Members for an NPV of exactly zero', placeholder: '0', help: 'Give the number of members to one decimal place, or round to a whole member. Answers within 1 member count as correct.' } };
    if (t.id === 't5') return { title: 'Accounting break-even', place: 'The club’s accountant has a different break-even number, and the board wants to know why.',
      body: `<p>The <b>accounting break-even</b> is the number of members at which the club’s yearly profit is zero. Profit subtracts <b>depreciation</b>, the build cost spread evenly over the ${N} years, as well as fixed costs. It does not discount anything.</p>
        <div class="tw"><table class="cf"><caption>The inputs you need</caption><tbody><tr><td class="lbl">Build cost</td><td>${m(t.I)}</td></tr><tr><td class="lbl">Life of the club</td><td>${N} years</td></tr><tr><td class="lbl">Fixed costs a year</td><td>${m(t.F)}</td></tr><tr><td class="lbl">Each member contributes a year</td><td>${m(t.c)}</td></tr></tbody></table></div><p>Fill in both rows, then compare your answer with the NPV break-even from the last step.</p>`,
      table: `<div class="tw"><table class="cf"><caption>Accounting break-even</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col">Amount</th></tr></thead><tbody>
        <tr><td class="lbl">Depreciation a year (build cost ÷ ${N})</td><td>${cell(L, 1, 'Depreciation a year')}</td></tr>
        <tr><td class="lbl">Members for zero profit: (fixed costs + depreciation) ÷ contribution per member</td><td>${cell(L, 2, 'Members for zero profit')}</td></tr></tbody></table></div>`,
      choice: { legend: 'If the club has exactly the accounting break-even number of members, its NPV is', options: [['neg', 'Below zero'], ['zero', 'Exactly zero'], ['pos', 'Above zero']] },
      helpLabels: ['Show me the depreciation', 'Show me both rows'] };
    if (t.id === 't6') {
      const S = { rival: 'A rival club is opening two miles away. Thandiwe expects fewer people to join, and Bexley will have to cut its dues to keep the members it has.',
        boom: 'Pickleball leagues in town have waitlists. Thandiwe expects more people to join, and Bexley can charge more and still fill its courts.' };
      const rows = t.order.map((k, i) => `<tr><td class="lbl"><b>Scenario ${'ABC'[i]}</b></td><td>${n0(t.cards[k].M)}</td><td>${m(t.cards[k].D)}</td><td>${m(t.cards[k].F)}</td></tr>`).join('');
      return { title: 'Pick the scenario that fits the story', place: 'A scenario changes several inputs together, so they tell one consistent story.',
        body: `<p>Thandiwe has written up three scenarios. Each changes the members and the dues together. The cost to serve a member (${m(t.v)} a year), the build cost (${m(t.I)}) and the annuity factor (${af(t)}) are the same in all three.</p>
          <div class="tw"><table class="cf"><caption>Three scenarios</caption><thead><tr><th scope="col" style="text-align:left">Scenario</th><th scope="col">Members</th><th scope="col">Monthly dues</th><th scope="col">Fixed costs</th></tr></thead><tbody>${rows}</tbody></table></div>
          <p class="place" style="font-style:normal"><b>The story:</b> ${S[t.story]}</p><p>Pick the scenario that matches the story, then work out its NPV.</p>`,
        value: { label: 'NPV of the scenario you picked' },
        choice: { legend: 'Which scenario matches the story?', options: [['A', 'Scenario A'], ['B', 'Scenario B'], ['C', 'Scenario C']] } };
    }
  }

  function judgeTask(t, e, h) {
    const v = h.parseMoney(e.value);
    if (t.id === 't1') {
      const rows = e.rows || []; const rr = [];
      rr[1] = h.judgeNumber(h.parseMoney(rows[1]), t.CF, [[t.M * 12 * t.D - t.F, 'nov', `Subtract the cost to serve each member too: each member contributes 12 × ${m(t.D)} − ${m(t.v)} = ${m(t.c)}.`],
        [t.M * (t.D - t.v) - t.F, 'no12', 'Dues are monthly. Multiply them by 12 before subtracting the yearly cost to serve a member.'], [t.M * t.c, 'nofixed', `Subtract the fixed costs of ${m(t.F)} as well.`]],
        { otherMsg: `${n0(t.M)} × (12 × ${m(t.D)} − ${m(t.v)}) − ${m(t.F)}.` });
      rr[2] = h.judgeNumber(h.parseMoney(rows[2]), t.PV, [[t.CF * N, 'nodisc', `That adds up ${N} years without discounting. Multiply the yearly cash flow by the annuity factor, ${af(t)}.`]],
        { otherMsg: `Yearly cash flow × ${af(t)}.` });
      rr[3] = h.judgeNumber(h.parseMoney(rows[3]), t.answer, [[t.PV, 'nocost', `Subtract the build cost of ${m(t.I)}.`], [t.CF * N - t.I, 'nodisc', 'Use the value today of the cash, not the undiscounted total.']],
        { scale: t.I, otherMsg: `Value today − build cost = row 2 − ${m(t.I)}.` });
      const bad = [1, 2, 3].find((y) => !rr[y].ok);
      if (bad) return { ok: false, rowRes: rr, msg: `${['', 'Yearly cash flow', 'Value today', 'NPV'][bad]}: ${rr[bad].msg}` };
      return { ok: true, rowRes: rr };
    }
    if (t.id === 't2') {
      const n = h.judgeNumber(v, t.answer, [[t.base0, 'base', `That is the base case NPV. Use ${n0(t.M2)} members.`], [(t.M2 * t.c - t.F) * N - t.I, 'nodisc', `Multiply the new yearly cash flow by the annuity factor, ${af(t)}, not by ${N}.`],
        [t.M2 * t.c * t.AF - t.I, 'nofixed', `Subtract the fixed costs of ${m(t.F)} from the yearly cash flow first.`], [t.answer - t.base0, 'change', 'That is the change in NPV. Give the new NPV itself.']],
        { scale: t.I, otherMsg: `New yearly cash flow = ${n0(t.M2)} × ${m(t.c)} − ${m(t.F)}. NPV = that × ${af(t)} − ${m(t.I)}.` });
      if (!n.ok) return n;
      if (e.choice !== t.decision) return { ok: false, code: 'decision', msg: !e.choice ? 'Say whether the club should still be built as well.' : 'Build when the NPV is above zero; pass when it is below zero.' };
      return { ok: true };
    }
    if (t.id === 't3') {
      const rows = e.rows || []; const x = t.tor.members; const rr = [];
      rr[1] = h.judgeNumber(h.parseMoney(rows[1]), x.nLo, [[(x.lo * t.c - t.F) * N - t.I, 'nodisc', `Multiply the yearly cash flow by the annuity factor, ${af(t)}.`], [x.lo * t.c * t.AF - t.I, 'nofixed', `Subtract the fixed costs of ${m(t.F)} first.`]],
        { scale: t.I, otherMsg: `(${n0(x.lo)} × ${m(t.c)} − ${m(t.F)}) × ${af(t)} − ${m(t.I)}.` });
      rr[2] = h.judgeNumber(h.parseMoney(rows[2]), x.nHi, [[(x.hi * t.c - t.F) * N - t.I, 'nodisc', `Multiply the yearly cash flow by the annuity factor, ${af(t)}.`], [x.hi * t.c * t.AF - t.I, 'nofixed', `Subtract the fixed costs of ${m(t.F)} first.`]],
        { scale: t.I, otherMsg: `(${n0(x.hi)} × ${m(t.c)} − ${m(t.F)}) × ${af(t)} − ${m(t.I)}.` });
      const bad = [1, 2].find((y) => !rr[y].ok);
      if (bad) return { ok: false, rowRes: rr, msg: `${bad === 1 ? 'Bad end' : 'Good end'}: ${rr[bad].msg}` };
      if (e.choice !== t.decision) return { ok: false, rowRes: rr, msg: !e.choice ? 'Pick the input with the widest bar as well.' : 'Compare the bar lengths: for each input, subtract the bad-end NPV from the good-end NPV, and pick the biggest gap.' };
      return { ok: true, rowRes: rr };
    }
    if (t.id === 't4') return h.judgeNumber(v, t.answer, [[(t.F + t.I / N) / t.c, 'acct', 'That spreads the build cost evenly over the years without discounting, which gives the accounting break-even. Divide the build cost by the annuity factor instead.'],
      [t.need / t.c, 'nofixed', `Add the fixed costs of ${m(t.F)} to the yearly cash flow the club needs before dividing.`], [(t.need + t.F) / (12 * t.D), 'nov', `Divide by what each member contributes, ${m(t.c)}, not by the dues alone.`], [t.need, 'cash', 'That is the yearly cash flow the club needs. Now turn it into members.']],
      { tol: Math.max(1, 0.001 * t.answer), unreadable: 'Type a number of members, like 1,050.', otherMsg: `Needed cash flow = ${m(t.I)} ÷ ${af(t)}. Members = (needed cash flow + ${m(t.F)}) ÷ ${m(t.c)}.` });
    if (t.id === 't5') {
      const rows = e.rows || []; const rr = [];
      rr[1] = h.judgeNumber(h.parseMoney(rows[1]), t.dep, [[t.I / t.AF, 'af', `That is the NPV-style yearly amount. Depreciation simply divides the build cost by ${N} years.`]], { otherMsg: `${m(t.I)} ÷ ${N}.` });
      rr[2] = h.judgeNumber(h.parseMoney(rows[2]), t.acct, [[t.F / t.c, 'nodep', 'Add the depreciation to the fixed costs before dividing.'], [(t.F + t.dep) / (12 * t.D), 'nov', `Divide by what each member contributes, ${m(t.c)}.`], [t.npvBE, 'npv', 'That is the NPV break-even. Accounting break-even uses depreciation, not the annuity factor.']],
        { tol: Math.max(1, 0.001 * t.acct), otherMsg: `(${m(t.F)} + depreciation) ÷ ${m(t.c)}.` });
      const bad = [1, 2].find((y) => !rr[y].ok);
      if (bad) return { ok: false, rowRes: rr, msg: `${bad === 1 ? 'Depreciation' : 'Members for zero profit'}: ${rr[bad].msg}` };
      if (e.choice !== t.decision) return { ok: false, rowRes: rr, msg: !e.choice ? 'Answer the question about the NPV as well.' : 'Compare the two break-evens. At the accounting break-even the club has fewer members than the NPV break-even needs, so it falls short of the return Bexley requires.' };
      return { ok: true, rowRes: rr };
    }
    if (t.id === 't6') {
      if (e.choice !== t.decision) return { ok: false, code: 'decision', msg: !e.choice ? 'Pick the scenario that matches the story first.' : 'Read the story again. It says which way members move and which way dues move. Find the scenario where both move that way.' };
      const diag = t.order.filter((k) => k !== t.story).map((k) => [t.cardNPV[k], 'other', `That is the NPV of scenario ${'ABC'[t.order.indexOf(k)]}. Work out the scenario you picked.`]);
      const cd = t.cards[t.story];
      return h.judgeNumber(v, t.answer, diag.concat([[(cd.M * (12 * cd.D - t.v) - cd.F) * N - t.I, 'nodisc', `Multiply the yearly cash flow by the annuity factor, ${af(t)}.`]]),
        { scale: t.I, otherMsg: `Contribution per member = 12 × ${m(cd.D)} − ${m(t.v)}. NPV = (${n0(cd.M)} × contribution − ${m(cd.F)}) × ${af(t)} − ${m(t.I)}.` });
    }
  }

  function helpText(t, lvl, h) {
    if (t.id === 't1') return lvl === 1 ? `${n0(t.M)} × (12 × ${m(t.D)} − ${m(t.v)}) − ${m(t.F)} = ${n0(t.M)} × ${m(t.c)} − ${m(t.F)} = ${m(t.CF)}.`
      : `Yearly cash flow: ${m(t.CF)}. Value today: ${m(t.CF)} × ${af(t)} = ${m(t.PV)}. NPV: ${m(t.PV)} − ${m(t.I)} = ${sgn(t.answer)}.`;
    if (t.id === 't2') return lvl === 1 ? `New yearly cash flow: ${n0(t.M2)} × ${m(t.c)} − ${m(t.F)} = ${m(t.CF2)}.`
      : `${m(t.CF2)} × ${af(t)} − ${m(t.I)} = ${sgn(t.answer)}, so the club should be ${t.decision === 'build' ? 'built' : 'passed on'}. A ${pc(t.p)} miss on members moved the NPV by ${sgn(t.answer - t.base0)}.`;
    if (t.id === 't3') { const x = t.tor.members;
      if (lvl === 1) return `Bad end: (${n0(x.lo)} × ${m(t.c)} − ${m(t.F)}) × ${af(t)} − ${m(t.I)} = ${sgn(x.nLo)}.`;
      return `Bad end: ${sgn(x.nLo)}. Good end: (${n0(x.hi)} × ${m(t.c)} − ${m(t.F)}) × ${af(t)} − ${m(t.I)} = ${sgn(x.nHi)}.<br>` + INPUTS.map(([k, lab]) => `${lab}: the bar runs ${m(t.tor[k].nHi - t.tor[k].nLo)}`).join('<br>') + `<br>The widest bar is ${INPUTS.find((z) => z[0] === t.decision)[1].toLowerCase()}.`; }
    if (t.id === 't4') return lvl === 1 ? `The club needs ${m(t.I)} ÷ ${af(t)} = ${m(t.need)} of cash a year to make NPV zero.`
      : `(${m(t.need)} + ${m(t.F)}) ÷ ${m(t.c)} = ${n1(t.answer)} members. In the calculator: <code>(${t.I}/${t.AF}+${t.F})/${t.c}</code>.`;
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
    if (t.id === 't3') return { rows: [null, String(Math.round((t.tor.members.lo * t.c - t.F) * N - t.I)), String(Math.round(t.tor.members.nHi))], choice: t.decision };
    if (t.id === 't4') return { value: ((t.F + t.I / N) / t.c).toFixed(1) };
    if (t.id === 't5') return { rows: [null, String(Math.round(t.dep)), t.acct.toFixed(1)], choice: 'zero' };
    if (t.id === 't6') { const other = t.order.find((k) => k !== t.story); return { value: String(Math.round(t.cardNPV[other])), choice: t.decision }; }
    return { value: String(Math.round(t.answer + 0.05 * t.I)), choice: t.decision || null };
  }

  const WALK = {
    title: 'How Thandiwe tests one small club',
    intro: '<p>Here is Bexley’s smallest club, worked from start to finish. It costs <b>$600,000</b> to build and lasts <b>10 years</b> at a <b>9%</b> discount rate, so the annuity factor is <b>6.4177</b>. The base case has <b>500 members</b> paying <b>$50 a month</b>. Each member costs <b>$100 a year</b> to serve, and fixed costs are <b>$140,000 a year</b>.</p>',
    render(stage) {
      if (stage < 3) {
        const rows = [['Base case: 500 × ($600 − $100) − $140,000', '$110,000', '$110,000 × 6.4177 − $600,000', '+$105,947', 0],
          ['Members 10% lower: 450 × $500 − $140,000', '$85,000', '$85,000 × 6.4177 − $600,000', '−$54,496', 1],
          ['Build cost 10% higher, members back to 500', '$110,000', '$110,000 × 6.4177 − $660,000', '+$45,947', 2]];
        return `<div class="tw"><table class="cf"><caption>Changing one input at a time</caption><thead><tr><th scope="col" style="text-align:left">Case</th><th scope="col">Yearly cash flow</th><th scope="col" style="text-align:left">NPV</th><th scope="col">NPV</th></tr></thead><tbody>${rows.filter((r) => r[4] <= stage).map((r) => `<tr class="${r[4] === stage ? 'reveal' : ''}"><td class="lbl">${r[0]}</td><td>${r[1]}</td><td class="lbl">${r[2]}</td><td class="${r[3][0] === '−' ? 'neg' : ''}">${r[3]}</td></tr>`).join('')}</tbody></table></div>`;
      }
      if (stage === 3) {
        const rows = [['Monthly dues, $45 to $55', '−$86,584', '+$298,478', 385062], ['Members, 450 to 550', '−$54,496', '+$266,390', 320885], ['Fixed costs, $154,000 to $126,000', '+$16,099', '+$195,795', 179696], ['Build cost, $660,000 to $540,000', '+$45,947', '+$165,947', 120000]];
        return `<div class="tw"><table class="cf"><caption>Tornado chart, every input moved 10% each way</caption><thead><tr><th scope="col" style="text-align:left">Input</th><th scope="col">Bad end</th><th scope="col">Good end</th></tr></thead><tbody>${rows.map((r) => `<tr><td class="lbl" style="border-bottom:0">${r[0]}</td><td class="${r[1][0] === '−' ? 'neg' : ''}" style="border-bottom:0">${r[1]}</td><td style="border-bottom:0">${r[2]}</td></tr><tr><td colspan="3" aria-hidden="true" style="padding-top:0">${bar(100 * r[3] / 385062)}</td></tr>`).join('')}</tbody></table></div>`;
      }
      const rows = [['Yearly cash flow that makes NPV zero', '$600,000 ÷ 6.4177', '$93,491'], ['Add the fixed costs', '$93,491 + $140,000', '$233,491'], ['Members needed', '$233,491 ÷ $500', '467.0'], ['Room for error against 500 members', '500 − 467', '33 members']];
      return `<div class="tw"><table class="cf"><caption>The NPV break-even for members</caption><thead><tr><th scope="col" style="text-align:left">Line</th><th scope="col" style="text-align:left">Working</th><th scope="col">Result</th></tr></thead><tbody>${rows.map((r, i) => `<tr class="${i === 3 ? 'hl' : ''}"><td class="lbl">${r[0]}</td><td class="lbl">${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>`;
    },
    stages: [
      { t: 'The base case', p: 'Each member pays 12 × $50 = $600 a year and costs $100 to serve, so each one contributes $500. The yearly cash flow is 500 × $500 − $140,000 = $110,000, and the NPV is $110,000 × 6.4177 − $600,000 = +$105,947. Build it.' },
      { t: 'Change one input', p: 'Thandiwe is unsure about the 500 members. She lowers only that input by 10%, to 450, and keeps everything else the same. The NPV falls to −$54,496. A 10% miss on members flips the answer. This is <b>sensitivity analysis</b>: one input at a time, everything else at its base value.' },
      { t: 'Change a different input', p: 'Members go back to 500. Now she raises the build cost by 10%, to $660,000. The NPV falls only to +$45,947, still a build. The club is far more sensitive to members than to its build cost.' },
      { t: 'Rank the inputs', p: 'A <b>tornado chart</b> repeats that test for every input and sorts the bars from widest to narrowest, so it looks like a funnel. Dues and members sit at the top. Those are the guesses worth checking hardest, for example with a survey of local players.' },
      { t: 'Find the break-even', p: 'The <b>NPV break-even</b> asks how low one input can go before NPV hits zero. The club needs $600,000 ÷ 6.4177 = $93,491 of cash a year. Adding the $140,000 of fixed costs and dividing by the $500 each member contributes gives about 467 members. The base case has only 33 members of room for error.' },
    ],
  };

  root.DESK = {
    app: 'finan4-u7-scenario-desk', version: 1, seedVersion: 1, salt: 'rize-finan4-u7-scenario:7b2e95', points: 20,
    storageKey: 'rize-finan4-u7-scenario-v1', filePrefix: 'ScenarioDesk',
    verifyUrl: 'https://rizecomputerscience.github.io/finan4-scenario-desk/verify.html',
    calcPlaceholder: '(1200*520-380000)*6.4177-1400000',
    calcHint: 'Type or tap. Use * to multiply and parentheses to group, so (500*500-140000)*6.4177-600000 is the NPV of the worked example’s club.',
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
