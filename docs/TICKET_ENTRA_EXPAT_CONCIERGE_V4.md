# Service Request — Microsoft Entra ID App Registration  
## Expat Concierge V4 Pilot (M365 Copilot Chat API)

**Request type:** Identity / Security — App Registration + Admin Consent  
**Priority:** High (blocks user acceptance testing)  
**Environment:** Pilot — local workstations only (no corporate server deploy in this phase)  
**Requested by:** Global Mobility — Expat Concierge Product Team  
**Date:** August 2026  

---

## 1. Executive summary

We are piloting **Expat Concierge V4**, a web application that helps expatriate employees navigate Global Mobility policy (LTA, STA, IA, Commuter) through a conversational concierge experience.

**V3 offline demo was rejected by testers** due to limited, scripted chat responses (~10 keyword topics). **V4 requires real AI** via the **Microsoft 365 Copilot Chat API** (Graph `beta`), using each tester's **individual M365 Copilot license** and corporate identity.

This request asks Identity/Security to register **one Entra ID application** (SPA) and grant **admin consent** for Microsoft Graph delegated permissions. Testers will run a **local installation package** on their laptops — no datacenter hosting required for this pilot.

---

## 2. Project description

| Item | Detail |
|------|--------|
| **Product name** | Expat Concierge V4 |
| **Owner** | Global Mobility (People / HR Tech) |
| **Users** | Internal pilot testers (~5–15 expats, HRBPs, mobility specialists) |
| **Purpose** | Simulate expat profiles and ask natural-language policy questions with AI-quality answers |
| **What it is NOT** | Not a production HR system of record; not storing employee PII beyond what testers voluntarily simulate |
| **Architecture** | Local Node.js server (`localhost:3000`) + browser SPA; chat calls **Microsoft Graph Copilot API** with **delegated user token** |
| **Data residency** | All AI processing stays within **Microsoft 365 tenant** — no external LLM (no OpenAI.com, no GitHub Models) |

### Features in the pilot (for context)

- Simulated user profiles (LTA / STA / IA / Commuter)
- Action log, journey stepper, risk matrix, CSAT check-in
- **AI chat** grounded in M365 enterprise search + mobility context sent per message
- Offline fallback (degraded — not acceptable for UAT; reason for this request)

---

## 3. Business objective

| Goal | Success criteria |
|------|------------------|
| Validate concierge UX with real testers | ≥80% tester satisfaction on chat quality (vs. failed V3 offline UAT) |
| Use existing corporate AI investment | Leverage **M365 Copilot licenses** already assigned to testers |
| Minimize infra scope | **No server deploy** in pilot — local package only |
| Security compliance | Delegated permissions only; user sees only content they already have access to in M365 |
| Path to production | Entra app created once; later add production redirect URI + hosting |

---

## 4. Why Identity involvement is required

The Copilot Chat API **only supports delegated (user) authentication**. Each tester signs in with their ABI Microsoft account via MSAL (OAuth 2.0 + PKCE popup).

However, OAuth requires a registered **Application (Client) ID** in Entra ID. Testers cannot self-register apps in a corporate tenant. **One app registration serves all testers.**

| Per user | One-time (Identity) |
|----------|---------------------|
| Sign in with Microsoft | Entra app registration |
| M365 Copilot license | Admin consent for Graph permissions |
| Run local package | Provide Client ID to product team |

---

## 5. Requested deliverables (Identity / Security)

### 5.1 Create Entra ID App Registration

| Setting | Value |
|---------|-------|
| **Name** | `Expat Concierge V4 (pilot)` |
| **Supported account types** | **Single tenant** — Accounts in this organizational directory only (`{tenant}.onmicrosoft.com`) |
| **Platform** | **Single-page application (SPA)** |
| **Redirect URI (SPA)** | `http://localhost:3000/v4` |
| **Front-channel logout URL** | *(optional)* `http://localhost:3000/v4` |
| **Implicit grant** | **Disabled** (use Auth Code + PKCE — MSAL default) |
| **Allow public client flows** | **Yes** (required for MSAL browser popup on localhost) |
| **Application permissions** | **None** — do not add app-only / client credentials permissions |
| **Client secret** | **Not required** (public SPA client) |

> **Future production:** When we host centrally, we will request an additional redirect URI (e.g. `https://expat-concierge.{corporate-domain}/v4`). Not in scope for this pilot ticket.

### 5.2 API permissions — Microsoft Graph (Delegated)

**All seven permissions below are mandatory.** Microsoft documentation states that the Copilot Chat API requires every permission in this set; omitting any will cause `403` errors.

| Permission | Type | Admin consent | Purpose (Copilot Chat API) |
|------------|------|---------------|----------------------------|
| `Sites.Read.All` | Delegated | Yes | Enterprise search / SharePoint grounding |
| `Mail.Read` | Delegated | Yes | Mail context for Copilot retrieval |
| `People.Read.All` | Delegated | Yes | People / org context |
| `OnlineMeetingTranscript.Read.All` | Delegated | Yes | Meeting transcript retrieval |
| `Chat.Read` | Delegated | Yes | Teams chat context |
| `ChannelMessage.Read.All` | Delegated | Yes | Teams channel context |
| `ExternalItem.Read.All` | Delegated | Yes | External connectors / semantic index |

**Also required by MSAL sign-in (usually added automatically):**

| Permission | Type | Notes |
|------------|------|-------|
| `openid` | Delegated | OpenID Connect |
| `profile` | Delegated | User display name |
| `offline_access` | Delegated | Refresh token (stay signed in) |
| `User.Read` | Delegated | Recommended — basic profile |

### 5.3 Admin consent

- [ ] **Grant admin consent** for the organization on all delegated permissions above  
- [ ] Confirm consent status shows green checkmarks in Entra → App → API permissions  
- [ ] *(Optional but recommended)* Assign app to a security group e.g. `SG-Expat-Concierge-V4-Pilot` instead of entire tenant

### 5.4 Provide back to requester

Please send the product team:

| Item | Example |
|------|---------|
| **Application (client) ID** | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| **Directory (tenant) ID** | `yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy` |
| **Confirmed redirect URI** | `http://localhost:3000/v4` |
| **Admin consent completed** | Yes / No |
| **Assigned users/group** | `SG-Expat-Concierge-V4-Pilot` |
| **Any Conditional Access exceptions** | Document if applied |

---

## 6. Network requirements (Security / Network team)

Outbound HTTPS **port 443** must be allowed from **tester workstations** (browser + local Node.js) to:

| Destination | Purpose |
|-------------|---------|
| `login.microsoftonline.com` | Entra ID / MSAL authentication |
| `graph.microsoft.com` | Microsoft Graph + Copilot Chat API (`/beta/copilot/...`) |
| `alcdn.msauth.net` | MSAL browser library (Microsoft CDN) |
| `*.msauth.net` | MSAL auxiliary endpoints (if blocked, sign-in fails) |

**Not required for V4:** `api.openai.com`, `models.inference.ai.azure.com`, GitHub APIs.

### Local-only traffic

| Endpoint | Purpose |
|----------|---------|
| `http://localhost:3000` | Local app server (tester machine only) |

---

## 7. Licensing requirements (IT / Licensing)

Each pilot tester **must** have an active **Microsoft 365 Copilot** license (same as Copilot in Teams/M365).

| Check | Action |
|-------|--------|
| Tester has Copilot license | Verify in M365 admin center |
| No Copilot license | User gets `403 copilot_forbidden` — exclude from pilot or assign license |
| Guest / external accounts | **Not supported** — work/school accounts in ABI tenant only |

---

## 8. Policy content requirement (Global Mobility — parallel track)

Copilot answers quality depends on **policy documents being in the M365 semantic index**.

| Action | Owner | Status |
|--------|-------|--------|
| Publish LTA / STA / mobility policy PDFs to **SharePoint** site indexed by Copilot | Global Mobility | ☐ |
| Confirm testers with Copilot can find policy via Copilot in Teams/Edge | GM + pilot lead | ☐ |
| Document SharePoint location for support | GM | ☐ |

> Without indexed policy, chat will work but answers may be generic. This is **not** an Identity issue — but affects UAT perception.

---

## 9. Technical architecture (for security review)

```
┌─────────────────────────────────────────────────────────────┐
│  Tester laptop                                              │
│  ┌──────────────┐    MSAL popup     ┌─────────────────────┐ │
│  │ Browser      │ ───────────────►  │ login.microsoft     │ │
│  │ localhost:   │                   │ online.com          │ │
│  │ 3000/v4      │ ◄── user token ── │ (Entra ID)          │ │
│  └──────┬───────┘                   └─────────────────────┘ │
│         │ Bearer token (delegated)                          │
│         ▼                                                   │
│  ┌──────────────┐    proxy + token   ┌─────────────────────┐ │
│  │ node server  │ ───────────────►  │ graph.microsoft.com │ │
│  │ :3000/askV4  │                   │ /beta/copilot/...   │ │
│  └──────────────┘                   └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Graph API endpoints used

| Method | Endpoint |
|--------|----------|
| `POST` | `https://graph.microsoft.com/beta/copilot/conversations` |
| `POST` | `https://graph.microsoft.com/beta/copilot/conversations/{id}/chatOverStream` |
| `POST` | `https://graph.microsoft.com/beta/copilot/conversations/{id}/chat` |

### Authentication flow

1. Browser loads app from `http://localhost:3000/v4`
2. App fetches public config from `http://localhost:3000/askV4/config` (returns `clientId`, `tenantId`, `scopes` — **no secrets**)
3. User clicks **Sign in with Microsoft**
4. MSAL `loginPopup` with Auth Code + PKCE
5. User's Graph access token sent to local server in `Authorization: Bearer` header
6. Local server forwards requests to Graph Copilot API **on behalf of that user**
7. Token cached in browser `localStorage` (MSAL) — user stays signed in until logout or expiry

### What the app sends to Copilot (per message)

Simulation context only — not real employee HR data unless tester creates a demo profile:

- Simulated employee name
- Assignment type (LTA / STA / IA / Commuter)
- Host / home country
- Department
- Instruction to answer from mobility policy and escalate edge cases to HRBP

---

## 10. Tester package requirements (Product team — post-Identity)

After receiving Client ID, product team will distribute:

```
expat-concierge-v4-pilot/
  start.sh / start.bat       → runs: node server.js
  .env                       → AZURE_CLIENT_ID=<from Identity>
  expat-concierge-demo-v4.html
  assets/
  server.js
  package.json
```

**Tester prerequisites:**

| Requirement | Version / notes |
|-------------|-----------------|
| Node.js | v18+ LTS recommended |
| Browser | Chrome or Edge (latest); Safari supported |
| Popups | Allow popups for `localhost` (MSAL sign-in) |
| OS | Windows 10/11 or macOS |

**Tester instructions (summary):**

1. Extract ZIP  
2. Run `start.bat` (Windows) or `./start.sh` (Mac)  
3. Open `http://localhost:3000/v4`  
4. Click **Sign in with Microsoft** (ABI account with Copilot license)  
5. Settings → **Test Copilot** → send a chat message  

---

## 11. Configuration handed to product team

Identity provides Client ID → product team sets in `.env`:

```env
AZURE_CLIENT_ID=<Application-client-ID-from-Entra>
AZURE_TENANT_ID=<Directory-tenant-ID>
# Optional — only if redirect differs:
# AZURE_REDIRECT_URI=http://localhost:3000/v4
PORT=3000
```

Restart local server after any `.env` change.

---

## 12. Acceptance criteria (definition of done)

Identity / Security work is **complete** when all items pass:

| # | Test | Expected result |
|---|------|-----------------|
| 1 | `GET http://localhost:3000/askV4/health` | `"copilot": { "configured": true }` |
| 2 | `GET http://localhost:3000/askV4/config` | HTTP 200 with `clientId`, `tenantId`, `scopes` |
| 3 | Sign in with Microsoft (licensed tester) | Popup succeeds, no consent error |
| 4 | Settings → Test Copilot | Green success message |
| 5 | Chat: "What housing support is offered?" | Streaming AI response (not offline generic fallback) |
| 6 | Sign out + sign in again | Session restores without re-consent |
| 7 | Tester **without** Copilot license | Clear `403` message (expected — not an Identity bug) |
| 8 | Unlicensed / non-assigned user | Blocked at Entra or consent (per app assignment policy) |

---

## 13. Known limitations & risks (acknowledge in pilot)

| Item | Detail |
|------|--------|
| **API status** | Copilot Chat API is **`/beta`** — subject to change; not GA |
| **No app-only auth** | Cannot run Copilot without a signed-in user |
| **No personal Microsoft accounts** | Work/school ABI accounts only |
| **Localhost only** | Pilot uses `http://localhost:3000` — not HTTPS (acceptable for local dev per Microsoft SPA guidance) |
| **Conditional Access** | MFA policies apply; ensure testers can complete MFA in popup |
| **Popup blockers** | Corporate browser policies may block MSAL popup — allow `localhost` |
| **Answer quality** | Depends on policy being in M365 index (GM responsibility) |

---

## 14. Troubleshooting guide (for Identity / support desk)

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `not_configured` / missing Client ID | `.env` not set | Product team embeds `AZURE_CLIENT_ID` |
| `AADSTS50011` redirect URI mismatch | URI not registered exactly | Add `http://localhost:3000/v4` as SPA redirect |
| `AADSTS65001` consent | Admin consent not granted | Grant org-wide admin consent |
| `403 copilot_forbidden` | No Copilot license | Assign M365 Copilot to user |
| `403` after consent | Missing one of 7 Graph permissions | Add all permissions from §5.2 |
| `401 copilot_auth` | Token expired | User signs out and signs in again |
| MSAL popup blocked | Browser policy | Allow popups for localhost |
| `Failed to fetch` / network | Firewall | Whitelist §6 destinations |
| Generic / empty answers | Policy not in Copilot index | GM publishes to SharePoint |

---

## 15. Security & privacy notes

- **No passwords** are collected or stored by the application  
- **No client secret** in the browser (public SPA + PKCE)  
- Tokens remain in tester browser (MSAL cache) and are sent only to `graph.microsoft.com` via local proxy  
- Application respects **Microsoft 365 permissions model** — users only retrieve content they already have access to  
- Pilot uses **simulated** employee profiles; testers should not enter real sensitive employee data  
- Logging: local server logs Copilot errors to console only — no central telemetry in pilot phase  

---

## 16. Out of scope (this ticket)

- Production hosting / Azure App Service / internal DNS  
- Application Insights / central logging  
- Copilot Studio agent  
- Azure OpenAI deployment  
- GitHub Models / external LLM  
- Mobile app  
- Integration with Workday / SAP  

---

## 17. References (Microsoft)

- [Copilot Chat API overview](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/api/ai-services/chat/overview)  
- [Create conversation](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/api/ai-services/chat/copilotroot-post-conversations)  
- [Chat over stream](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/api/ai-services/chat/copilotconversation-chatoverstream)  
- [Synchronous chat](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/api/ai-services/chat/copilotconversation-chat)  
- Internal setup doc: `docs/COPILOT_V4_SETUP.md` (repository)  

---

## 18. Contacts

| Role | Name | Email |
|------|------|-------|
| Product owner | _[fill in]_ | _[fill in]_ |
| Technical lead | _[fill in]_ | _[fill in]_ |
| Identity / Security | _[fill in]_ | _[fill in]_ |
| Pilot testers (group) | _[fill in]_ | _[fill in]_ |

---

## 19. Approval checklist (Identity team)

- [ ] App registration created: `Expat Concierge V4 (pilot)`  
- [ ] Platform: SPA  
- [ ] Redirect URI: `http://localhost:3000/v4`  
- [ ] All 7 Graph delegated permissions added  
- [ ] Admin consent granted  
- [ ] App assigned to pilot security group _(recommended)_  
- [ ] Client ID and Tenant ID sent to product team  
- [ ] Conditional Access reviewed — no block on localhost MSAL popup  
- [ ] Network team notified of §6 whitelist _(if required at ABI)_  

---

*Document version: 1.0 — Expat Concierge V4 Pilot — August 2026*
