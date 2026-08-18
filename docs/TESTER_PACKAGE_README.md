# Expat Concierge V3 — Tester Package (standalone)

## What to send

Send the full ZIP **`expat-concierge-v3-tester.zip`** — **not** the HTML file alone.

Required structure:

```
expat-concierge-v3-tester/
  expat-concierge-demo-v3.html
  assets/
    demo-presentation.js
    journey-flight-map.svg
```

## How to open

1. Extract the ZIP to any folder
2. Open `expat-concierge-demo-v3.html` in **Chrome** or **Safari** (double-click)
3. **No** access code and **no** `node server.js` required

## What works offline (no firewall)

| Feature | Status |
|---------|--------|
| Chat (LTA policy answers) | ✅ Built-in offline |
| Action Log + mark tasks | ✅ |
| Risk Matrix | ✅ |
| Users + New Profile | ✅ |
| Journey stepper / sidebar | ✅ |
| ▶ Demo (automated tour) | ✅ |

## What does NOT work without a server

- Live AI chat (GitHub Models) — blocked by corporate firewall
- Backend sync via `/askV3`

## Optional — full experience with server

```bash
cd expat-concierge-v3-tester
# use full repo with server.js, or:
node server.js
# open http://localhost:3000/v3
```

## Test users

- John Doe (LTA · Brazil → US) — default
- Ana Ferreira (STA), David Park (IA), Maria Santos (Commuter)

## Suggested chat questions

- What are the key steps in my expatriation process?
- What housing support is offered?
- What benefits are offered to me during my assignment?
- What can I expect from my Look & See visit?
