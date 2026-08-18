# V3 — Tester feedback log

**Design reference:** `docs/people-tech-design-guide.md`  
**Target file:** `expat-concierge-demo-v3.html` (V2.4 frozen)

---

## How to add feedback

Paste each item in this format:

```markdown
### FB-XXX — Short title
- **Source:** tester name / date
- **Area:** UI | AI | Actions | Network | Other
- **Issue:** what happened
- **Expected:** what should happen
- **Status:** open | in_progress | done
```

---

## Round 2 (current)

| ID | Area | Summary | Status |
|----|------|---------|--------|
| FB-01 | UI | Chat sidebar: only name, job, assignment type; full profile on Users tab | done |
| FB-02 | UI | Employee Data: only 7 fields (Assignment + Family) with APRO/Expat sources | done |
| FB-03 | UI | Chat layout: sidebar nav cards, hybrid action log bar, collapsible mobile | done |
| FB-10 | UI (V4) | Journey UX: no icon, bigger flags, phase names, Move Status, slim profile | done |

### FB-04 — Assignment journey stepper
- **Source:** Renato / feedback Aug 2026
- **Area:** UI
- **Issue:** Subtitle text under chat title wasted useful space
- **Expected:** Process stepper from home country flag → 5 major steps → host flag, driven by action log completion
- **Status:** done

### FB-03 — Main page layout (sidebar + action log)
- **Source:** Renato / Aug 2026
- **Area:** UI
- **Issue:** Layout did not match mockup — navigation buried in chat welcome
- **Expected:** Left sidebar with Employee Info + Contacts/MY ACTIONS/DOCUMENTS/FAQ cards; hybrid action log bar above chat; mobile collapsible sidebar
- **Status:** done

### FB-02 — Slim Employee Data fields
- **Source:** Renato / Aug 2026
- **Area:** UI
- **Issue:** Employee Data showed too many fields (Mobility, Immigration, Department, etc.)
- **Expected:** Only Policy Type, Assignment Phase, Home/Host Country, Partner, Children, Pets — with data source hints
- **Status:** done

### FB-01 — Slim chat profile, full profile on Users
- **Source:** Renato / Aug 2026
- **Area:** UI
- **Issue:** Employee profile on chat page was too detailed in the sidebar
- **Expected:** Chat shows name, cargo (department), assignment type only; all other profile sections on Users tab as full card
- **Status:** done

---

## Round 1 (implemented in V3 baseline)

| Item | Status |
|------|--------|
| Real LTA policy in prompts (not market practice) | done |
| Policy section citations (§9.2, etc.) | done |
| Assertive answers — no "typically/may" for fixed rules | done |
| No false escalation to GM/K2 on closed policy items | done |
| US host → schooling subsidy excluded | done |
| Category browse cards (Policy, Actions, Contacts, Other) | done |
| People Tech design tokens + Plus Jakarta Sans | in_progress |
| Network blocked messaging (corporate firewall) | done (message only) |
| Backend mode `/askV3` for local/Azure | planned |
