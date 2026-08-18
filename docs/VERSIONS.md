# Expat Concierge — Versions & Folders

Reference map of UI versions, URLs, backend routes, and repository folders.

**Server:** `node server.js` → default `http://localhost:3000`

---

## Overview

| Version | URL | Status | Chat / LLM |
|---------|-----|--------|------------|
| **V2** | `http://localhost:3000/` or `/v2` | Frozen (baseline) | `/askV2` → Azure OpenAI or GitHub Models (retired July 2026) |
| **V3** | `http://localhost:3000/v3` | Tester demo + LLM path | `/askV3` via `llmClient.js` (Azure) + `/demo/chat` offline |
| **V4** | `http://localhost:3000/v4` | Current (design + Copilot) | `/askV4` → M365 Copilot Graph API + `/demo/chat` offline |
| **V4.1** | `http://localhost:3000/v41` | Shared-provider pilot | `/askV41` → server-side Azure/OpenAI-compatible provider + `/demo/chat` offline |
| **V5** | `http://localhost:3000/v5` | Orchestrated provider pilot | `/askV5` → Policy Agent + Decision Engine + Confidence Engine → Copilot/OpenAI/local |

---

## Per version — folders and files

| Area | V2 | V3 | V4 |
|------|----|----|-----|
| **UI (served)** | `src/frontend/portalV2.js` (`htmlV2()`) | `expat-concierge-demo-v3.html` | `expat-concierge-demo-v4.html` (shared by V4.1 with path-aware mode) |
| **UI (standalone / backup)** | `expat-concierge-demo.html` | `expat-concierge-demo-v3-snapshot-2026-08-06.html` | — |
| **UI (reference, not served)** | — | `src/frontend/portalV3.js` | — |
| **API routes** | `src/routes/askV2.js` | `src/routes/askV3.js` | `src/routes/askV4.js`; V4.1: `src/routes/askV41.js`; V5: `src/routes/askV5.js` |
| **Users API** | `src/routes/usersV2.js` → `/v2/users` | Reuses `/v2/users` (via `portalV3.js` if used) | Reuses V2 user context (`userContextServiceV2`) |
| **Agents** | `src/agents/v2/` | Reuses `src/agents/v2/` | Does not use V2 agent pipeline |
| **Skills (markdown)** | `src/skills/v2/` | `src/skills/v3/` | — (prompt in `v4MobilityPrompt.js`) |
| **System prompts** | `src/prompts/systemV2.js` | `src/prompts/systemV3.js` | `src/services/v4MobilityPrompt.js` |
| **V2 services** | `src/services/*V2.js`, `policyAgentRegistryV2.js`, etc. | Reuses same | Reuses `policyAccessControlV2`, `userContextServiceV2` |
| **LLM client** | Inline in `askV2` | `src/services/llmClient.js` | — |
| **Copilot** | — | — | `src/services/copilotChatClient.js`, `assets/copilot-v4-auth.js` |
| **Offline demo** | — | `/demo/*` (V3 HTML calls it) | `/demo/*` (V4 HTML calls it) |
| **Offline route** | — | `src/routes/demoOffline.js` | `src/routes/demoOffline.js` |
| **Offline Q&A source** | — | — | `docs/V4_Offline_QA_Catalog.xlsx` → `src/services/offlineQaCatalog.js` |
| **Action log source** | Embedded in HTML | Embedded in HTML | `docs/V4_Action_Log_Tasks.xlsx` → `src/services/actionLogTasks.js` |
| **Action log fallback** | — | — | `assets/action-log-tasks-v4.json` |
| **Risk matrix** | — | Embedded `RISK_MATRIX` in HTML | `data/risk-matrix.json` → `assets/risk-matrix.json` |
| **Risk matrix ingest** | — | — | `scripts/ingest_risk_matrix.py`, `docs/RISK_MATRIX_INGEST.md` |
| **Contacts** | Embedded in HTML | Embedded in HTML | `assets/contacts-v4.json` |
| **Shared assets** | `assets/marked.min.js`, `journey-flight-map.svg`, `demo-presentation.js` | same | same + `*-v4.*` files |
| **Docs** | `docs/V3_PLAN.md` (V2 history) | `docs/V3_PLAN.md`, `V3_FEEDBACK.md`, `COMUNICADO_TESTERS_V3.md`, `V3_Assignment_Risk_Matrix_v1.0.xlsx`, `expat-concierge-v3-tester.zip`, demo video/screenshots | `docs/COPILOT_V4_SETUP.md`, `TICKET_ENTRA_EXPAT_CONCIERGE_V4.md`, `V4_*.xlsx`, `offline-qa-catalog-v4.json` |
| **Scripts** | — | `scripts/build-demo-video.mjs`, `record-demo-video.mjs`, etc. (V3 demo) | `scripts/ingest_risk_matrix.py`, `export_*_xlsx.py`, `export_offline_qa_catalog.mjs` |
| **Health checks** | — | `/askV3/health` | `/askV4/health`, `/askV4/config`, `/askV41/health`, `/risk-matrix/health`, `/demo/health` |

---

## Shared folders (all versions)

| Folder | Role |
|--------|------|
| `server.js` | Routes: `/`, `/v2`, `/v3`, `/v4`, `/askV2`, `/askV3`, `/askV4`, `/demo`, `/assets`, `/docs` |
| `assets/` | Static files served at `/assets/*` |
| `data/` | Risk matrix source (`data/risk-matrix.json`) |
| `docs/` | Documentation, business Excel files, tester package, demo materials |
| `scripts/` | Ingest, XLSX export, demo video recording |
| `src/data/usersV2.js` | Demo profiles (V2 users API) |
| `src/services/policyStore.js`, `retrieval.js` | Policy stub / retrieval (V2/V3 pipeline) |

---

## `src/` folder map

```
src/
├── agents/v2/          → V2 (V3 reuses)
├── frontend/
│   ├── portalV2.js     → V2 UI (/, /v2)
│   └── portalV3.js     → V3 reference (not served by default)
├── prompts/
│   ├── systemV2.js     → V2
│   └── systemV3.js     → V3
├── routes/
│   ├── askV2.js        → V2
│   ├── askV3.js        → V3
│   ├── askV4.js        → V4
│   ├── usersV2.js      → V2
│   └── demoOffline.js  → V3/V4 offline
├── services/
│   ├── *V2.js          → V2 + shared
│   ├── llmClient.js    → V3
│   ├── copilotChatClient.js → V4
│   ├── v4MobilityPrompt.js  → V4 + offline
│   ├── offlineQaCatalog.js  → V4 offline
│   └── actionLogTasks.js    → V4 action log
└── skills/
    ├── v2/             → V2 skills
    └── v3/             → V3 skills
```

---

## Root HTML files

| File | Version | Served by `server.js`? |
|------|---------|------------------------|
| `expat-concierge-demo.html` | V2 | No (standalone export; app uses `portalV2.js`) |
| `expat-concierge-demo-v3.html` | V3 | Yes → `/v3` |
| `expat-concierge-demo-v3-snapshot-2026-08-06.html` | V3 snapshot | No |
| `expat-concierge-demo-v4.html` | V4 | Yes → `/v4` |

---

## Environment variables (by version)

| Variable | V2 | V3 | V4 |
|----------|----|----|-----|
| `AZURE_OPENAI_*` | Live chat | Live chat | Fallback if Copilot unavailable |
| `GITHUB_TOKEN` | Legacy (retired) | Legacy (retired) | — |
| `AZURE_CLIENT_ID` | — | — | MSAL sign-in (required for Copilot) |
| `AZURE_TENANT_ID` | — | — | Optional (default `organizations`) |
| `OFFLINE_QA_XLSX` | — | — | Optional override for offline catalog |
| `ACTION_LOG_TASKS_XLSX` | — | — | Optional override for action log tasks |

See also: `docs/COPILOT_V4_SETUP.md`, `docs/RISK_MATRIX_INGEST.md`, `.env.example`.

---

## Quick links (local)

| Resource | URL |
|----------|-----|
| V2 | http://localhost:3000/v2 |
| V3 | http://localhost:3000/v3 |
| V4 | http://localhost:3000/v4 |
| V4.1 | http://localhost:3000/v41 |
| V5 | http://localhost:3000/v5 |
| LLM health | http://localhost:3000/askV3/health |
| Copilot health | http://localhost:3000/askV4/health |
| V4.1 shared provider health | http://localhost:3000/askV41/health |
| V5 orchestrator health | http://localhost:3000/askV5/health |
| Copilot MSAL config | http://localhost:3000/askV4/config |
| Risk matrix health | http://localhost:3000/risk-matrix/health |
| Offline demo health | http://localhost:3000/demo/health |
