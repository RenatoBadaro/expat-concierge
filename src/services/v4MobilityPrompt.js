/**
 * V4 mobility concierge — shared instructions for Copilot API and offline demo.
 * Goal: human, policy-grounded, structured answers (not terse FAQ stubs).
 */

const fs = require("fs");
const path = require("path");
const { findAnswerFromCatalog } = require("./offlineQaCatalog");

const SKILLS_DIR = path.join(__dirname, "..", "skills", "v3");
const MAX_POLICY_CHARS = 14000;

const SKILL_FILES = {
  LTA: "ltaPolicySkill.md",
  STA: "staPolicySkill.md",
  IA: "internationalAppointmentPolicySkill.md",
  COMMUTER: "commuterPolicySkill.md",
};

const RESPONSE_GUIDE = `
You are the ABI Global Mobility Concierge — a senior, warm advisor who knows this assignee's situation.
You are NOT a FAQ bot. Write like a trusted colleague in People / Global Mobility.

════════════════════════════════════════════════════════
RESPONSE FORMAT (MANDATORY — use all sections that add value)
════════════════════════════════════════════════════════
**Answer:**
[3–5 sentences. Open with empathy or acknowledgment when appropriate. Give the direct policy answer first, then nuance. State exact numbers, limits, and rules as facts — no "typically" or "usually" when policy is explicit.]

**What this means for you:**
- [Personal implication tied to THIS assignee's host country, family, or stage]
- [Second implication — practical, not generic]
- [Optional third bullet if helpful]

**Next steps:**
- [Concrete action the assignee can take now]
- [Second action — who to contact only when truly needed]

**📋 Policy reference:** §[section] [name] — 2024 Global Mobility [LTA/STA/IA/Commuter] Policy V3.0
(Cite all relevant sections. Never fabricate section numbers.)

TONE: Professional, warm, direct. Use "you" and "your assignment". No corporate jargon.
LENGTH: Prefer complete guidance over brevity. Do not truncate if the assignee needs clarity.

ESCALATION: Do NOT add a "When to escalate" section for closed policy rules (housing amount, pets USD 2,000 cap, container size, cash in lieu, home leave, Look & See via Egencia, partner income loss, US schooling exclusion, etc.).
Escalate ONLY for: immigration legal edge cases, tax residency complexity, payroll errors, or genuine policy gaps.

NEVER mention EAD for spouse work — not in ABI policy. For US LTA, state L-1 spouse work authorization when relevant.
Where policy and Letter of Assignment (LOA) differ, the LOA governs — say so when relevant.
`.trim();

function isUsHost(hostCountry) {
  const h = (hostCountry || "").toUpperCase();
  return h.includes("UNITED STATES") || h.includes("USA") || h === "US";
}

function loadPolicySkill(assignmentType) {
  const file = SKILL_FILES[(assignmentType || "").toUpperCase()];
  if (!file) return "";
  const full = path.join(SKILLS_DIR, file);
  if (!fs.existsSync(full)) return "";
  const text = fs.readFileSync(full, "utf8");
  return text.length > MAX_POLICY_CHARS ? text.slice(0, MAX_POLICY_CHARS) + "\n\n[…policy excerpt truncated…]" : text;
}

function buildProfileBlock(userContext) {
  const { identity, permissions, corporateContext, profile } = userContext || {};
  const cc = corporateContext || {};
  const fam = profile?.family || {};
  const mob = profile?.mobility || {};
  const tl = profile?.timeline || {};
  const lines = [
    `Name: ${identity?.name || "Unknown"}`,
    `Assignment type: ${permissions?.assignmentType || "unknown"} ONLY — never mix assignment types`,
    `Home country: ${cc.homeCountry || "unknown"}`,
    `Host country: ${cc.hostCountry || "unknown"}`,
    `Department: ${cc.department || "unknown"}`,
    `Stage: ${tl.assignmentStage || "unknown"}`,
  ];
  if (fam.hasPartner) lines.push("Accompanying partner: yes");
  if (fam.hasChildren) lines.push(`Children accompanying: yes (ages ${(fam.childrenAges || []).join(", ") || "unknown"})`);
  if (fam.hasPets) lines.push("Pets: yes");
  if (mob.firstAssignment) lines.push("First international assignment — use slightly more step-by-step guidance");
  if (tl.immigrationInProgress && !tl.visaApproved) {
    lines.push("CRITICAL: Visa not yet approved — mention immigration timing when relevant");
  }
  if (isUsHost(cc.hostCountry)) {
    lines.push("HOST = UNITED STATES: Schooling subsidy does NOT apply (§8.1). Never suggest schooling subsidy eligibility.");
  }
  return lines.map((l) => `• ${l}`).join("\n");
}

function buildCopilotInstructions(userContext) {
  const assignmentType = userContext?.permissions?.assignmentType || "LTA";
  const policySkill = loadPolicySkill(assignmentType);
  const specialistRules = fs.existsSync(path.join(SKILLS_DIR, "policySpecialistAgentRules.md"))
    ? fs.readFileSync(path.join(SKILLS_DIR, "policySpecialistAgentRules.md"), "utf8").slice(0, 4000)
    : "";

  return [
    RESPONSE_GUIDE,
    "",
    "════════════════════════════════════════════════════════",
    `ASSIGNEE PROFILE (${assignmentType})`,
    "════════════════════════════════════════════════════════",
    buildProfileBlock(userContext),
    "",
    "════════════════════════════════════════════════════════",
    `AUTHORIZED POLICY KNOWLEDGE — ${assignmentType}`,
    "════════════════════════════════════════════════════════",
    policySkill || "Use ABI Global Mobility policy documents available in Microsoft 365 enterprise search.",
    specialistRules ? `\n\nSPECIALIST RULES:\n${specialistRules}` : "",
    "",
    "Ground answers in the policy above and M365 enterprise search. If a detail is only in the LOA, say so.",
  ].join("\n");
}

function wrapAnswer(parts) {
  return parts.filter(Boolean).join("\n\n");
}

function followups(...questions) {
  const valid = questions.filter(Boolean).slice(0, 3);
  if (!valid.length) return "";
  return "\n---\n" + valid.map((q) => `?? ${q}`).join("\n");
}

function hasWord(q, word) {
  return new RegExp(`\\b${word}\\b`, "i").test(q);
}

function answerEducationSupport(userContext) {
  const cc = userContext?.corporateContext || {};
  const perm = userContext?.permissions || {};
  const type = perm.assignmentType || "LTA";
  const host = cc.hostCountry || "your host country";
  const usHost = isUsHost(host);
  const fam = userContext?.profile?.family || {};
  const ages = fam.childrenAges || [];
  const hasChildren = fam.hasChildren || ages.length > 0;
  const childLine = hasChildren
    ? ` You have ${ages.length} accompanying child${ages.length > 1 ? "ren" : ""} (ages ${ages.join(" and ")}).`
    : "";

  if (usHost) {
    const childcareNote = hasChildren
      ? ` **Childcare Allowance** (§8.2) may apply only for children aged **0–4** or until compulsory school age in your US location (up to **USD 10,000 net/year** per child outside NYC; **USD 15,000** in NYC) — it does not replace schooling costs for school-age children.`
      : "";
    return wrapAnswer([
      `**Answer:**\nFor your **${type}** assignment to the **United States**, ABI does **not** provide a **Schooling Subsidy** — US host locations are **explicitly excluded** from this benefit (§8.1).${childLine} All schooling-related costs are your responsibility: tuition (if you choose private/international school), **uniforms**, meals, books, transport, and exam fees. ABI **recommends public school** where practical. You still receive practical support: **K2** assists with school research and enrollment during **Look & See**, and eligible family members may use up to **60 hours of language training** over 4 years (§3.6).${childcareNote}`,
      `**What this means for you:**\n- There is no LOA schooling cap to claim — budget schooling as a personal relocation cost.\n- School search should be part of your Look & See planning with K2 before you sign a lease in the right school district.`,
      `**Next steps:**\n- Discuss school districts and enrollment steps with K2 during Look & See.\n- Confirm any **Childcare Allowance** eligibility for younger children in your LOA.\n- Complete school-related tasks in your **Action Log** if pending.`,
      `**📋 Policy reference:** §8.1 Schooling Subsidy, §8.2 Childcare Allowance, §3.4 Look & See, §3.6 Language Training — 2024 Global Mobility LTA Policy V3.0`,
    ]) + followups("What can I expect from my Look & See visit?", "Is childcare allowance available for my children?", "What language training am I entitled to?");
  }

  return wrapAnswer([
    `**Answer:**\nFor your **${type}** assignment in **${host}**, ABI **recommends local public school** first. A **Schooling Subsidy** for private/international school may apply **only if** at least one condition is met: language barrier and public school not in English/home language; home address does not guarantee admission (excluding US); or public school quality is unreasonably low.${childLine} If eligible, the **amount is capped in your LOA** — actual costs are reimbursed up to that cap; you pay any excess. **Uniforms, meals, books, transport, and exam fees** remain your responsibility even when subsidy applies. **K2** supports school search during Look & See.`,
    `**What this means for you:**\n- Subsidy starts only after your family arrives in host with all compliant permits.\n- **Childcare Allowance** (§8.2) is separate: up to **USD 10,000 gross/year** per child aged 0–4 (or until compulsory school age) for non-US locations.`,
    `**Next steps:**\n- Confirm schooling subsidy cap and eligibility in your LOA.\n- Plan school visits with K2 during Look & See.\n- Submit school applications per your Action Log tasks.`,
    `**📋 Policy reference:** §8.1 Schooling Subsidy, §8.2 Childcare Allowance — 2024 Global Mobility ${type} Policy V3.0`,
  ]) + followups("What schooling costs are not covered?", "What is childcare allowance?", "What can I expect from Look & See for schools?");
}

async function pickOfflineAnswer(question, userContext) {
  const fromCatalog = await findAnswerFromCatalog(question, userContext);
  if (fromCatalog) return fromCatalog;

  return legacyPickOfflineAnswer(question, userContext);
}

/** @deprecated Fallback when Excel catalog is missing — keep in sync via export scripts. */
function legacyPickOfflineAnswer(question, userContext) {
  const q = (question || "").toLowerCase().trim();
  const cc = userContext?.corporateContext || {};
  const perm = userContext?.permissions || {};
  const type = perm.assignmentType || "LTA";
  const host = cc.hostCountry || "";
  const usHost = isUsHost(host);
  const name = userContext?.identity?.name?.split(" ")[0] || "there";

  if (/^(hi|hello|hey|ola|olá)[!.?\s]*$/.test(q)) {
    return wrapAnswer([
      `**Answer:**\nHi ${name} — I'm your Global Mobility concierge for your **${type}** assignment (${cc.homeCountry || "home"} → ${host || "host"}). I can walk you through benefits, housing, immigration timing, Look & See, your relocation package, and what to prioritize before move day.`,
      `**What this means for you:**\n- I'm grounded in the 2024 Global Mobility policy for your assignment type.\n- Your **Letter of Assignment (LOA)** governs if anything differs from standard policy.`,
      `**Next steps:**\n- Ask a specific question, or open **My Actions** to see pending tasks.\n- Try: housing support, Look & See booking, or benefits in your package.`,
      `**📋 Policy reference:** 2024 Global Mobility ${type} Policy V3.0`,
    ]) + followups("What are the key steps in my expatriation process?", "What housing support is offered?", "What benefits are in my package?");
  }

  if (/need more|what if|more than|exceed|additional|extra|top up|above the subsidy/.test(q)) {
    if (/housing|rent|subsidy|apartment|home/.test(q)) {
      return wrapAnswer([
        `**Answer:**\nIf your chosen home costs **more than your Housing Subsidy**, that is expected and allowed — the subsidy is a **fixed LOA amount**, not a cap on what you may rent. You **personally top up** the difference. ABI does not negotiate the subsidy upward for a more expensive property; K2 helps you search within your budget, but you may select any home and pay the gap yourself. If rent is **below** the subsidy, only actual rent is paid — you do not keep the unused balance.`,
        `**What this means for you:**\n- The subsidy amount was set using market data for your job level and family size — it is not recalculated because you prefer a pricier neighborhood.\n- Integration Allowance (up to one month net host salary, max USD 10,000) can help with setup costs, but it does not replace housing top-up.`,
        `**Next steps:**\n- Confirm your exact Housing Subsidy in your LOA before signing a lease.\n- Shortlist properties with K2 and budget for personal top-up if needed.`,
        `**📋 Policy reference:** §9.2 Housing Subsidy, §9.3 Integration Allowance — 2024 Global Mobility LTA Policy V3.0`,
      ]) + followups("How is my housing subsidy calculated?", "Can I choose cash in lieu of shipping furniture?", "What does temporary living cover?");
    }
    return wrapAnswer([
      `**Answer:**\nFor most benefits, the policy sets a **fixed entitlement** in your LOA — going "above" that usually means **personal top-up** (housing) or **reimbursement up to a cap** (pets USD 2,000, excess baggage USD 200/person). ABI does not typically expand caps for preference alone; exceptions are rare and only where policy marks a topic as case-by-case.`,
      `**What this means for you:**\n- Tell me the specific benefit (housing, shipment, schooling, etc.) so I can give exact limits.\n- Your LOA is the financial source of truth for amounts.`,
      `**Next steps:**\n- Re-read the relevant section in your LOA.\n- Ask a focused follow-up (e.g. "more housing budget" vs "more pet reimbursement").`,
      `**📋 Policy reference:** 2024 Global Mobility ${type} Policy V3.0`,
    ]) + followups("What housing support is offered?", "What is the pet shipment cap?", "What is cash in lieu of shipment?");
  }

  if (q.includes("step") || q.includes("process") || q.includes("expatriation") || q.includes("journey")) {
    return wrapAnswer([
      `**Answer:**\nYour ${type} journey typically moves through **Offer & LOA → Immigration → Pre-Move preparation → Travel → Arrival & settling-in**. You are in **pre-assignment**, which means immigration and planning (Look & See, housing search, school research if applicable) come before household goods shipment and the final move.`,
      `**What this means for you:**\n- Assignment start should not be assumed until **work authorization** is in place.\n- Overdue action-log items (documents, bookings) can delay later steps — clear blockers early.`,
      `**Next steps:**\n- Submit any pending immigration documents.\n- Coordinate Look & See dates with K2 and book flights via **Egencia** (ZBB Travel Policy).\n- Review **My Actions** for overdue tasks.`,
      `**📋 Policy reference:** §3 Pre-Assignment, §4 Final Move — 2024 Global Mobility LTA Policy V3.0`,
    ]) + followups("What can I expect from my Look & See visit?", "What housing support is offered?", "When can I ship household goods?");
  }

  if (q.includes("benefit") || q.includes("package") || q.includes("allowance")) {
    const schooling = usHost
      ? "Schooling subsidy **does not apply** — US locations are excluded (§8.1)."
      : "Schooling subsidy may apply per LOA for eligible children (private/international up to LOA cap).";
    return wrapAnswer([
      `**Answer:**\nYour ${type} package typically includes: **Housing Subsidy** (fixed LOA amount), **Integration Allowance** (one month net host base salary, max USD 10,000), **household goods shipment** (or cash in lieu), **Look & See** (up to 5 days for you and partner), **Partner Support** via RMC, **tax assistance** through Vialto, **home leave** travel, and relocation support from K2. ${schooling}`,
      `**What this means for you:**\n- Amounts and eligibility are confirmed in your **LOA** — policy sets the rules, LOA sets your numbers.\n- Partner Support is advisory (career counselling, settling-in) — **not** replacement for partner income.`,
      `**Next steps:**\n- Review your LOA benefit table with your host PBP or Global Mobility contact.\n- Book Look & See via Egencia once dates align with K2.`,
      `**📋 Policy reference:** §9 Benefits, §8 Family Support — 2024 Global Mobility LTA Policy V3.0`,
    ]) + followups("How is housing subsidy calculated?", "What is integration allowance used for?", "How do I book Look & See?");
  }

  if (q.includes("look") || q.includes("see") || (q.includes("book") && q.includes("ticket"))) {
    return wrapAnswer([
      `**Answer:**\nYou are entitled to up to **5 days** on a pre-assignment **Look & See** trip for you and your partner. Flights are booked as **round-trip airfare via Egencia**, following the **Global ZBB Travel Policy**. K2 (DSP) typically joins you for housing search, school visits, and orientation — coordinate dates with Global Mobility, your host PBP, and K2 before booking.`,
      `**What this means for you:**\n- This is not a vacation — it is a structured scouting trip before the final move.\n- You **must not sign a lease** without Global Mobility approval on **timing** (e.g. relative to visa status). GM does not review lease terms — K2 handles substance.`,
      `**Next steps:**\n- Align dates with K2 and host PBP.\n- Book in Egencia; keep hotels/ground transport within ZBB rules.`,
      `**📋 Policy reference:** §3.4 Pre-Assignment Trip (Look & See) — 2024 Global Mobility LTA Policy V3.0`,
    ]) + followups("What housing support is offered?", "Can my children join the Look & See trip?", "What documents do I need for immigration?");
  }

  if (q.includes("housing") || q.includes("rent") || q.includes("subsidy") || q.includes("apartment")) {
    return wrapAnswer([
      `**Answer:**\nYour **Housing Subsidy** is a **fixed amount in your LOA**, based on job level, family size, and third-party market data for expatriate housing in ${host || "the host location"}. **K2** helps you find and secure a home — they do **not** set or increase the subsidy. You may rent above the subsidy and pay the difference personally; if rent is lower, only actual rent is reimbursed.`,
      `**What this means for you:**\n- Security deposits, utilities, and telephone are generally **not** covered.\n- ABI discourages purchasing property in the host country during assignment.`,
      `**Next steps:**\n- Confirm subsidy amount in your LOA.\n- Work with K2 on neighborhoods and viewings during Look & See.`,
      `**📋 Policy reference:** §9.2 Housing Subsidy — 2024 Global Mobility LTA Policy V3.0`,
    ]) + followups("What if I need a more expensive apartment?", "What is temporary living?", "What is integration allowance?");
  }

  if (/education|schooling|school support|childcare|child care|tuition|enrollment/.test(q) || q.includes("school") || q.includes("uniform")) {
    return answerEducationSupport(userContext);
  }

  if (hasWord(q, "pet") || hasWord(q, "dog") || hasWord(q, "cat")) {
    return wrapAnswer([
      `**Answer:**\nABI reimburses up to **USD 2,000 total** for **all pets combined** — covering transport, quarantine, documents, and vaccinations. This is a **reimbursement cap**, not a spending limit: you may spend more, but only eligible costs up to USD 2,000 are reimbursed. There is **no cash in lieu** for pets. You manage airlines and logistics; pet costs cannot be applied to family flights.`,
      `**What this means for you:**\n- Keep receipts for host-country expense submission or RMC.\n- Plan pet travel timing with K2 alongside your move schedule.`,
      `**Next steps:**\n- Get quotes from pet shippers early.\n- Submit reimbursement with documentation after eligible expenses.`,
      `**📋 Policy reference:** §6.3.5 Pet Shipment — 2024 Global Mobility LTA Policy V3.0`,
    ]) + followups("What container size am I entitled to?", "What is excess baggage allowance?", "When should I book the final move?");
  }

  if (q.includes("spouse") || q.includes("partner") || q.includes("wife") || q.includes("husband")) {
    const workNote = usHost
      ? " For typical US LTA (L-1), an accompanying spouse is generally authorized to work without a separate application process described in policy."
      : "";
    return wrapAnswer([
      `**Answer:**\n**Partner Support** includes job search, career counselling, education planning, wellness, and social connection — delivered through RMC / Net Expat throughout the assignment. ABI **does not compensate loss of partner income**; support is advisory, not financial replacement.${workNote}`,
      `**What this means for you:**\n- Your partner's career transition is supported, but household income drop is not reimbursed.\n- Immigration nuances beyond policy → Vialto or immigration counsel.`,
      `**Next steps:**\n- Connect with Net Expat / RMC after LOA signing.\n- Confirm visa-dependent work rules with Vialto if needed.`,
      `**📋 Policy reference:** §3.7 Partner Support — 2024 Global Mobility LTA Policy V3.0`,
    ]) + followups("Can my partner work in the host country?", "What benefits cover my family?", "What is Look & See for partners?");
  }

  if (q.includes("bonus") || q.includes("tax") || q.includes("rsu") || q.includes("equity")) {
    return wrapAnswer([
      `**Answer:**\nYour **cash bonus** generally follows the home-country scheme and is **tax equalized** under the assignment. **RSUs, PSUs, and stock options are not tax equalized** — tax on long-term incentives remains your personal responsibility. **Vialto** is mandatory for tax equalization, exit/entrance briefings, and equity consultations.`,
      `**What this means for you:**\n- Do not use non-designated tax advisors for assignment tax returns.\n- Personal income (e.g. spousal salary, dividends) stays your responsibility.`,
      `**Next steps:**\n- Schedule Tax & Equity briefing with Vialto before move.\n- Bring LOA and equity grant documents to the session.`,
      `**📋 Policy reference:** §5.4 Bonus, §5.5 Long-Term Incentives — 2024 Global Mobility LTA Policy V3.0`,
    ]) + followups("What relocation costs are tax equalized?", "Who is Vialto and when do I contact them?", "What is integration allowance?");
  }

  if (q.includes("immigration") || q.includes("visa") || q.includes("work permit") || q.includes("document")) {
    return wrapAnswer([
      `**Answer:**\nYour assignment should not commence until proper **work authorization** is in place. ABI's immigration provider (often coordinated via Vialto) guides the host-country process; ABI covers standard documentation costs (visa fees, translations, consulate travel where policy applies). You are responsible for **timely submission** of documents — delays can delay your start date.`,
      `**What this means for you:**\n- Consulate appointments are typically **unaccompanied** — personal accompaniment costs are yours.\n- Passport renewal is covered only when required for immigration compliance.`,
      `**Next steps:**\n- Complete outstanding Action Log immigration tasks.\n- Upload requested documents to the immigration portal and confirm appointments.`,
      `**📋 Policy reference:** §3.2 Immigration — 2024 Global Mobility LTA Policy V3.0`,
    ]) + followups("What documents are usually required?", "Can I travel before visa approval?", "What is Look & See timing vs visa?");
  }

  if (q.includes("container") || q.includes("shipment") || q.includes("hhg") || q.includes("household") || q.includes("furniture")) {
    return wrapAnswer([
      `**Answer:**\n**Surface shipment** container size is fixed by family size: assignee only or +1 → **20ft**; assignee +2 or more → **40ft**. Size is **not negotiable**. Alternatively, **cash in lieu of surface shipment** is a **standard option** (no GM approval) — a net allowance to furnish the host home, but storage and furniture rental are then not covered. **Excess baggage**: USD 200 per accompanying family member.`,
      `**What this means for you:**\n- One main shipment; split only if total cost ≤ full shipment.\n- Vehicles, pianos, and alcohol are not covered in surface shipment.`,
      `**Next steps:**\n- Decide surface vs cash in lieu with K2 before packing.\n- Declare high-value items for insurance (coverage up to USD 250,000 combined).`,
      `**📋 Policy reference:** §6.3 Household Goods, §6.3.3 Cash in Lieu — 2024 Global Mobility LTA Policy V3.0`,
    ]) + followups("What is cash in lieu exactly?", "What is the pet reimbursement cap?", "When should I schedule packing?");
  }

  if (q.includes("home leave") || q.includes("vacation") || q.includes("visit home") || q.includes("fly home")) {
    return wrapAnswer([
      `**Answer:**\nYou receive **one round-trip ticket per accompanying family member per 12 months** on assignment for **home leave**. Book via company travel process (**Egencia** / ZBB Travel Policy). Hotel, meals, and local transport during home leave are **not** covered. Unused entitlement in a 12-month period may be forfeited or transferable per travel policy — confirm before booking.`,
      `**What this means for you:**\n- This is a defined entitlement — not an open-ended travel budget.\n- Children not accompanying may have separate visit entitlements per policy.`,
      `**Next steps:**\n- Plan annual home leave dates with your manager where needed.\n- Book through Egencia to stay within policy.`,
      `**📋 Policy reference:** §8.3.1 Home Leave — 2024 Global Mobility LTA Policy V3.0`,
    ]) + followups("What travel class is allowed?", "Are hotels covered on home leave?", "What is emergency leave?");
  }

  if (q.includes("temp") || q.includes("temporary living") || q.includes("hotel")) {
    return wrapAnswer([
      `**Answer:**\n**Temporary living** is capped at **45 days combined** (home and host). ABI provides a furnished apartment when available; otherwise hotel per **ZBB Travel Policy**. Meals are reimbursed at reduced per diem only when cooking facilities are unavailable. Temporary living must **not overlap** with the start of your long-term lease.`,
      `**What this means for you:**\n- Plan lease start dates with K2 to avoid overlap charges.\n- Keep receipts for any eligible meal per diem.`,
      `**Next steps:**\n- Confirm temp housing dates with K2 before final move.\n- Align lease commencement after temp period ends.`,
      `**📋 Policy reference:** Temporary Living — 2024 Global Mobility LTA Policy V3.0`,
    ]) + followups("What is housing subsidy vs temporary living?", "What does ZBB Travel Policy mean for hotels?", "When can I sign a lease?");
  }

  if (q.includes("language") || q.includes("cultural")) {
    return wrapAnswer([
      `**Answer:**\nYou receive up to **60 hours** of **language training** per person over age 4, spread over 4 years, for the host country's primary language only. Hours are **not transferable** between family members. Cultural training is provided via an online tool; extra in-person cultural training needs Global Mobility approval.`,
      `**What this means for you:**\n- You may use an alternative language vendor up to the amount ABI would have paid, with proof of payment.\n- Plan hours early if multiple family members need training.`,
      `**Next steps:**\n- Enroll via the program K2 / GM provides after LOA signing.\n- Track remaining hours over the assignment.`,
      `**📋 Policy reference:** §3.6 Language & Cultural Training — 2024 Global Mobility LTA Policy V3.0`,
    ]);
  }

  if (q.includes("integration")) {
    return wrapAnswer([
      `**Answer:**\nThe **Integration Allowance** is a **one-time net payment** of up to **one month of host base salary**, capped at **USD 10,000**, paid via host payroll. It covers miscellaneous settling costs: painting, minor appliances, climate-appropriate clothing, bank fees, cable/internet setup, disposal of goods, and similar — not housing top-up.`,
      `**What this means for you:**\n- It complements but does not replace Housing Subsidy.\n- Timing is typically early in assignment — confirm payroll schedule in host country.`,
      `**Next steps:**\n- Confirm eligibility and amount in LOA.\n- Keep receipts if local process requires substantiation.`,
      `**📋 Policy reference:** §9.3 Integration Allowance — 2024 Global Mobility LTA Policy V3.0`,
    ]);
  }

  return wrapAnswer([
    `**Answer:**\nI can help with **${type}** topics: housing and subsidies, Look & See and Egencia booking, household goods / cash in lieu, pets, schooling and childcare, partner support, immigration timing, tax & bonus treatment, home leave, temporary living, and language training. Ask a specific question — for example "what if my rent is above the subsidy?" or "how do I book Look & See?" — and I'll answer from policy with your ${host || "host"} context.`,
    `**What this means for you:**\n- Answers follow **2024 Global Mobility ${type} Policy V3.0**; your **LOA** governs amounts.\n- For live Copilot mode, sign in with Microsoft for richer search across company knowledge.`,
    `**Next steps:**\n- Pick a topic above or check **My Actions** for pending tasks.\n- Contact your host PBP or Global Mobility for LOA-specific figures.`,
    `**📋 Policy reference:** 2024 Global Mobility ${type} Policy V3.0`,
  ]) + followups("What housing support is offered?", "What benefits are in my package?", "What are the key expatriation steps?");
}

module.exports = {
  buildCopilotInstructions,
  pickOfflineAnswer,
  legacyPickOfflineAnswer,
  answerEducationSupport,
  RESPONSE_GUIDE,
};
