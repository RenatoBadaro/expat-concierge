# Expat Concierge V4 — Microsoft 365 Copilot Setup

V4 uses the **Microsoft 365 Copilot Chat API** (Graph `beta`) instead of Azure OpenAI or GitHub Models.

## URLs

| Resource | URL |
|----------|-----|
| App | `http://localhost:3000/v4` |
| Health | `http://localhost:3000/askV4/health` |
| MSAL config | `http://localhost:3000/askV4/config` |

## Prerequisites

1. **Microsoft 365 Copilot license** for each tester (same as Teams Copilot).
2. **Entra ID app registration** (single-page application).
3. **Admin consent** for Graph delegated permissions (all required for Chat API).

## 1. Entra app registration

1. Azure Portal → Microsoft Entra ID → App registrations → New registration.
2. Name: `Expat Concierge V4 (pilot)`.
3. Supported account types: **Accounts in this organizational directory only**.
4. Redirect URI: **Single-page application** → `http://localhost:3000/v4`.
5. Copy **Application (client) ID** → `AZURE_CLIENT_ID` in `.env`.

### API permissions (delegated — all required)

Add Microsoft Graph **delegated** permissions:

- `Sites.Read.All`
- `Mail.Read`
- `People.Read.All`
- `OnlineMeetingTranscript.Read.All`
- `Chat.Read`
- `ChannelMessage.Read.All`
- `ExternalItem.Read.All`
- `openid`, `profile` (usually default)

Click **Grant admin consent** for the organization.

### Authentication

- Platform: SPA with redirect `http://localhost:3000/v4`.
- Enable **Allow public client flows** if using popup login.

## 2. Server `.env`

```env
AZURE_CLIENT_ID=<application-client-id>
AZURE_TENANT_ID=organizations
# or your tenant ID: 12345678-1234-1234-1234-123456789abc
# AZURE_REDIRECT_URI=http://localhost:3000/v4
# COPILOT_TIMEZONE=America/Sao_Paulo
PORT=3000
```

Restart: `node server.js`

## 3. Network whitelist (corporate)

Outbound HTTPS **443** from user workstations and Node server:

| Destination | Purpose |
|-------------|---------|
| `login.microsoftonline.com` | MSAL sign-in |
| `graph.microsoft.com` | Copilot Chat API |
| `alcdn.msauth.net` | MSAL browser library (CDN) |

No `models.inference.ai.azure.com` or `api.openai.com` required for V4.

## 4. Test flow

1. Open `http://localhost:3000/v4`.
2. Click **Sign in with Microsoft**.
3. Accept permissions (first time).
4. Settings → **Test Copilot**.
5. Chat as a simulated user (e.g. John Doe LTA).

## 5. Policy grounding

Copilot answers use **Microsoft 365 enterprise search** (SharePoint, OneDrive, semantic index). For LTA policy accuracy:

- Publish mobility policy documents to SharePoint indexed by Copilot, **or**
- Use Copilot Studio agent (future enhancement) with explicit knowledge.

V4 also sends **simulation context** (assignment type, host country) via `additionalContext` on each message.

## 6. Troubleshooting

| Error | Likely cause |
|-------|----------------|
| `not_configured` | Missing `AZURE_CLIENT_ID` in `.env` |
| `403 copilot_forbidden` | No M365 Copilot license or missing admin consent |
| `401 copilot_auth` | Token expired — sign out and sign in again |
| MSAL popup blocked | Allow popups for localhost |
| Empty / generic answers | Policy not in M365 semantic index |

## References

- [Copilot Chat API overview](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/api/ai-services/chat/overview)
- [Create conversation](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/api/ai-services/chat/copilotroot-post-conversations)
- [Chat over stream](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/api/ai-services/chat/copilotconversation-chatoverstream)
