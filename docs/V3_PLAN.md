# Expat Concierge V3 — Evolution Plan

**Status:** Active development  
**Baseline:** V2.4 (frozen — do not modify for production demos)  
**Effective policy source:** 2024 Global Mobility LTA Policy V3.0 (01/01/2026)

---

## Why V3?

V2.4 validated the product concept with business testers. Feedback showed the architecture works, but AI answers needed:

1. **Real policy content** — not generic "market practice"
2. **Assertive, closed-rule answers** — exact values from policy
3. **Policy section citations** — so expats can verify in the official PDF
4. **No false escalation** — don't suggest GM/K2 for fixed policy items
5. **Profile-aware exclusions** — e.g. schooling subsidy excluded for US host

V3 implements these learnings as the default behaviour and adds room for further feedback without touching the V2.4 demo.

---

## Design system

All V3 UI changes follow **`docs/people-tech-design-guide.md`** (People Tech Design Guide — petrol + yellow, Plus Jakarta Sans, card highlights).

---

## File map (V2 frozen vs V3)

| Area | V2 (frozen) | V3 (evolve here) |
|------|-------------|------------------|
| Standalone demo | `expat-concierge-demo.html` | `expat-concierge-demo-v3.html` |
| API route | `/askV2` | `/askV3` |
| System prompt | `src/prompts/systemV2.js` | `src/prompts/systemV3.js` |
| Policy skills | `src/skills/v2/` | `src/skills/v3/` |
| Portal | `/` and `/v2` | `/v3` |
| Agents / engines | `src/agents/v2/`, `*V2.js` | Reuses V2 agents until V3 specialists needed |

---

## V3 scope (from tester feedback)

### Done in V3 baseline
- [x] Full LTA policy knowledge in prompts (from 2024 Global LTA Policy V3.0)
- [x] Policy section citations (`§9.2 Housing Subsidy`, etc.)
- [x] Assertiveness rules (no "typically/may" for explicit rules)
- [x] Escalation prohibition for closed policy items
- [x] Host-country flags (US schooling exclusion)
- [x] Category browse cards on welcome screen (Policy, Actions, Contacts, Other)

### Next (feedback backlog)

Track all items in **`docs/V3_FEEDBACK.md`** — paste tester comments there each round.

- [ ] STA, IA, Commuter policy ingestion (same depth as LTA)
- [ ] Expand FAQ library from top 30 real expat questions per type
- [ ] Calibrate escalation — reduce false positives from specialist engine
- [ ] LOA-aware answers when LOA values differ from policy defaults
- [ ] Richer onboarding flow per assignment stage
- [ ] Mobile UX polish for corporate-network testers

---

## Running locally

```bash
# V2 (unchanged)
open http://localhost:3000/v2

# V3
open http://localhost:3000/v3

# Standalone demos (GitHub Pages)
# V2: expat-concierge-demo.html
# V3: expat-concierge-demo-v3.html
```

---

## Deployment

- **V2.4 demo URL** stays on `expat-concierge-demo.html` for ongoing comparison
- **V3 demo URL** → `expat-concierge-demo-v3.html`
- Promote V3 to primary only after business sign-off on feedback round 2
