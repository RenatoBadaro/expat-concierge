# Communication — Expat Concierge V3 Tester Package (standalone)

**Subject:** Invitation to test — Expat Concierge V3 (offline demo, no firewall dependency)

---

Hello,

We are evolving **Expat Concierge V3** — the Global Mobility concierge with policy-aware chat, action log, risk matrix, and assignee profiles.

Because the corporate network blocks direct access to the external AI API, we prepared a **standalone package** so you can test **without installing anything** and **without an access code**.

## What to test

- **Chat** — LTA policy questions (housing, benefits, Look & See, expatriation steps, etc.)
- **Action Log** — 34 journey tasks, filters, and completion tracking
- **Risk Matrix** — assignment risk score
- **Users** — assignee profiles and new profile creation (wizard)
- **MY JOURNEY** — employee context sidebar and journey stepper
- **▶ Demo** — automated tour (~90 sec) via the header button

## How to install and open

1. Download **`expat-concierge-v3-tester.zip`** (attachment / SharePoint link)
2. **Extract** the ZIP to any folder on your computer
3. Open **`expat-concierge-demo-v3.html`** in **Chrome** or **Safari** (double-click)

**Important:** distribute and use the **full ZIP**, not the HTML file alone. The demo requires the `assets/` folder alongside the HTML.

## What is NOT required

- ❌ Access code / GitHub token  
- ❌ Running `node server.js` or installing dependencies  
- ❌ Firewall whitelist to test chat (responses are **offline**, based on LTA Policy V3.0)

## Users available for simulation

| User | Assignment | Route |
|------|------------|-------|
| **John Doe** (default) | LTA | Brazil → United States |
| Ana Ferreira | STA | Mexico → Germany |
| David Park | IA | South Korea → United Kingdom |
| Maria Santos | Commuter | Portugal → Spain |

Use the **Active user** selector in the header or **Users → Simulate**.

## Suggested chat questions

- *What are the key steps in my expatriation process?*
- *What housing support is offered?*
- *What benefits are offered to me during my assignment?*
- *What can I expect from my Look & See visit?*
- *Can my spouse work in the United States?*
- *How is my housing subsidy determined?*

## Limitations of this test build

| Feature | Standalone (ZIP) | With local server* |
|---------|------------------|---------------------|
| Offline policy chat | ✅ | ✅ |
| Actions / Risk / Users | ✅ | ✅ |
| Live AI chat (GitHub Models) | ❌ blocked by firewall | ⚠️ depends on network |

\* Server version is optional for the development team; **not required for this test**.

## Feedback we need

Please capture:

1. **Answer quality** — accurate? complete? anything confusing?
2. **Usability** — navigation, action log, risk, profile creation
3. **Bugs** — on-screen errors, broken layout, features that don’t load
4. **Gaps** — questions the chat handles poorly or should escalate

Send comments via **[channel: Teams / email / form]** by **[date TBD]**.

## Common issues

| Issue | Solution |
|-------|----------|
| Chat asks for access code | Open the HTML **from the extracted ZIP**, not a standalone `.html` copy |
| Map icon or tour doesn’t work | Confirm the `assets/` folder sits next to the HTML file |
| Red chat error (`404`, `out_of_scope`) | Old build — request the updated ZIP |
| Blank page | Use Chrome or Safari; don’t open a link without extracting the ZIP |

## Contact

Questions or issues opening the package: **[your name / email]**

Thank you for supporting the test.

---

**Expat Concierge V3.0** · Offline demo · LTA Policy 2024 V3.0  
Package file: `docs/expat-concierge-v3-tester.zip`
