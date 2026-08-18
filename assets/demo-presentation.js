/**
 * Expat Concierge V5 — automated demo presentation for screen recording / sharing.
 * Load with ?demo=1 or ?autoplay=1 on the V5 demo page.
 */
(function () {
  "use strict";

  let active = false;
  let stepIndex = 0;
  let abortController = null;

  const DEMO_MOCK_RESPONSES = {
    steps: `**Answer:** Your LTA assignment follows five phases: Offer & LOA → Immigration → Pre-Move → Travel → Arrival. You are in pre-assignment with visa still in progress.

**What this means for you:**
- Immigration and Look & See are your immediate priorities before the move date.
- Overdue actions in your log should be completed before HHG packing.

**Next steps:**
- Complete pending immigration document submission.
- Plan your Look & See trip with K2 and book flights via Egencia.

**📋 Policy reference:** §3.4 Pre-Assignment Trip (Look & See) — 2024 Global Mobility LTA Policy V3.0`,

    benefits: `**Answer:** Your LTA package includes Housing Subsidy, Integration Allowance (1 month net salary, max USD 10,000), household goods shipment, Look & See trip, Partner Support, and tax assistance via Vialto. Schooling subsidy does **not** apply — your host is the United States (§8.1).

**What this means for you:**
- Housing is a fixed subsidy in your LOA — you may top up personally if rent is higher.
- Childcare Allowance applies for your children (US net rates).

**Next steps:**
- Review your Letter of Assignment for exact subsidy amounts.
- Connect with K2 for housing search and Net Expat for partner support.

**📋 Policy reference:** §9.2 Housing Subsidy, §9.3 Integration Allowance — 2024 Global Mobility LTA Policy V3.0`,

    looksee: `**Answer:** You are entitled to up to 5 days for you and your partner. Book round-trip airfare via **Egencia** following the Global ZBB Travel Policy. Coordinate dates with Global Mobility, your host PBP, and K2 for housing and school search.

**What this means for you:**
- K2 accompanies you for home search, school enrollment, and settling-in orientation.
- Do not sign a lease without consulting Global Mobility on timing.

**Next steps:**
- Align Look & See dates with K2.
- Book flights in Egencia per ZBB Travel Policy.

**📋 Policy reference:** §3.4 Pre-Assignment Trip (Look & See) — 2024 Global Mobility LTA Policy V3.0`,

    housing: `**Answer:** Your Housing Subsidy is a **fixed amount set by ABI** in your Letter of Assignment, based on job level, family size, and third-party market data for unfurnished expat housing. K2 assists with search — they do not set the budget.

**What this means for you:**
- You may choose any housing and personally top up above the subsidy.
- If rent is below the subsidy, only actual rent is paid — you do not keep the difference.

**Next steps:**
- Confirm your subsidy amount in the LOA.
- Work with K2 to shortlist neighborhoods and properties.

**📋 Policy reference:** §9.2 Housing Subsidy — 2024 Global Mobility LTA Policy V3.0`,
  };

  const DEMO_STEPS = [
    {
      page: "overview",
      title: "Expat Concierge V5.0",
      body: "AI-powered global mobility concierge — policy-scoped, profile-aware, from offer to repatriation.",
      duration: 4500,
    },
    {
      page: "users",
      title: "Employee profiles",
      body: "Full profiles per assignee — assignment type, family, timeline, and action progress.",
      highlight: "#usersGrid",
      duration: 4000,
    },
    {
      action: () => {
        if (typeof simulateUser === "function") simulateUser("u_lta_family");
      },
      title: "Simulate as John Doe",
      body: "LTA assignment Brazil → United States — first assignment, family, pets, visa in progress.",
      duration: 3500,
    },
    {
      page: "chat",
      highlight: "#chatSidebar",
      title: "MY JOURNEY sidebar",
      body: "Employee context, contacts, quick links to actions and documents — tailored to this assignee.",
      duration: 4000,
    },
    {
      action: () => demoTypeAndSend("What are the key steps in my expatriation process?"),
      title: "Policy-aware chat",
      body: "Answers grounded in the 2024 LTA Policy with citations and next steps.",
      waitMs: 5500,
    },
    {
      page: "actions",
      highlight: "#actionsList",
      title: "Action log — 34 tasks",
      body: "Journey tasks with deadlines, owners, and completion tracking synced to the assignee profile.",
      duration: 4000,
    },
    {
      action: () => {
        const tasks = typeof getUserTasks === "function" ? getUserTasks(activeUserId) : [];
        const pending = tasks.find((t) => t.status === "pending" || t.status === "overdue");
        if (pending && typeof toggleTask === "function") toggleTask(pending.id);
      },
      title: "Mark tasks complete",
      body: "Expats and coordinators track progress — overdue items surface in the header.",
      duration: 3000,
    },
    {
      page: "risk",
      highlight: "#riskPageContent",
      title: "Assignment risk matrix",
      body: "Weighted risk score from 34 action-log tasks — gates, blockers, and tier rationale.",
      duration: 4500,
    },
    {
      page: "users",
      action: () => openProfileWizard(),
      title: "Create a profile",
      body: "Add a new assignee with assignment type, countries, and family situation.",
      duration: 2500,
    },
    {
      action: () => fillDemoProfileWizard(),
      waitMs: 3500,
    },
    {
      action: () => saveProfileWizard(),
      title: "Profile saved",
      body: "New user appears in the grid — simulate chat instantly with their context.",
      waitMs: 2000,
    },
    {
      action: () => {
        const id = window.__demoCreatedUserId;
        if (id && typeof simulateUser === "function") simulateUser(id);
      },
      title: "Chat with new profile",
      body: "Each profile drives personalized policy answers and action recommendations.",
      duration: 3000,
    },
    {
      action: () => demoTypeAndSend("What housing support is offered?"),
      waitMs: 5500,
    },
    {
      page: "overview",
      title: "Ready to share",
      body: "Run this tour anytime via ▶ Demo in the header or ?autoplay=1 on the URL.",
      duration: 5000,
      end: true,
    },
  ];

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function pickMockResponse(question, hostCountry) {
    const q = (question || "").toLowerCase();
    const usHost =
      (hostCountry || "").toUpperCase().includes("UNITED STATES") ||
      (hostCountry || "").toUpperCase().includes("USA") ||
      (hostCountry || "").toUpperCase() === "US";

    if (/^(hi|hello|hey)[!.?\s]*$/.test(q.trim())) {
      return `**Answer:** Hello! I'm your Global Mobility concierge for your **LTA** assignment.

**Next steps:**
- Ask about housing, Look & See, benefits, or your action log tasks.

**📋 Policy reference:** 2024 Global Mobility LTA Policy V3.0`;
    }
    if (q.includes("step") || q.includes("process") || q.includes("expatriation") || q.includes("journey")) return DEMO_MOCK_RESPONSES.steps;
    if (q.includes("benefit")) return DEMO_MOCK_RESPONSES.benefits;
    if (q.includes("look") || q.includes("see")) return DEMO_MOCK_RESPONSES.looksee;
    if (q.includes("housing")) return DEMO_MOCK_RESPONSES.housing;
    if (q.includes("pet")) return "**Answer:** Up to USD 2,000 total reimbursement for pets (not a spending cap). Assignee manages logistics.\n\n**📋 Policy reference:** §6.3.5 Pet Shipment — 2024 Global Mobility LTA Policy V3.0";
    return DEMO_MOCK_RESPONSES.looksee;
  }

  function ensureOverlay() {
    if (document.getElementById("demoOverlay")) return;
    const el = document.createElement("div");
    el.id = "demoOverlay";
    el.className = "demo-overlay hidden";
    el.innerHTML =
      '<div class="demo-backdrop" id="demoBackdrop"></div>' +
      '<div class="demo-spotlight" id="demoSpotlight"></div>' +
      '<div class="demo-card" id="demoCard">' +
        '<div class="demo-badge">LIVE DEMO</div>' +
        '<div class="demo-card-title" id="demoCardTitle"></div>' +
        '<div class="demo-card-body" id="demoCardBody"></div>' +
        '<div class="demo-card-foot">' +
          '<button type="button" class="demo-stop-btn" id="demoStopBtn">Stop demo</button>' +
          '<span class="demo-progress" id="demoProgress"></span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    document.getElementById("demoStopBtn").addEventListener("click", stopDemoPresentation);
  }

  function showOverlay(show) {
    ensureOverlay();
    const ov = document.getElementById("demoOverlay");
    ov.classList.toggle("hidden", !show);
    if (!show) {
      document.getElementById("demoSpotlight").style.cssText = "";
    }
  }

  function positionSpotlight(selector) {
    const spot = document.getElementById("demoSpotlight");
    if (!selector || !spot) {
      spot.style.cssText = "opacity:0";
      return;
    }
    const el = document.querySelector(selector);
    if (!el) {
      spot.style.cssText = "opacity:0";
      return;
    }
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    const r = el.getBoundingClientRect();
    const pad = 8;
    spot.style.cssText =
      "opacity:1;top:" + (r.top - pad) + "px;left:" + (r.left - pad) + "px;" +
      "width:" + (r.width + pad * 2) + "px;height:" + (r.height + pad * 2) + "px;";
  }

  function setCard(title, body, progress) {
    document.getElementById("demoCardTitle").textContent = title || "";
    document.getElementById("demoCardBody").textContent = body || "";
    document.getElementById("demoProgress").textContent = progress || "";
  }

  async function demoTypeAndSend(text) {
    const input = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendBtn");
    if (!input || !activeUserId) return;
    if (typeof showPage === "function") showPage("chat");
    input.value = "";
    input.focus();
    for (let i = 0; i < text.length; i++) {
      if (!active) return;
      input.value += text[i];
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 120) + "px";
      await sleep(28);
    }
    await sleep(600);
    await demoSendMessage(text);
    sendBtn.disabled = false;
  }

  async function demoSendMessage(question) {
    if (!activeUserId) return;
    const sendBtn = document.getElementById("sendBtn");
    const chatInput = document.getElementById("chatInput");
    if (chatBusy) {
      if (typeof removeTyping === "function") removeTyping();
      chatBusy = false;
    }
    chatBusy = true;
    if (sendBtn) sendBtn.disabled = true;
    chatInput.value = "";
    chatInput.style.height = "auto";

    try {
      if (typeof appendMsg === "function") appendMsg("user", question);
      if (typeof showTyping === "function") showTyping();
      await sleep(900);

      const host = (typeof USERS !== "undefined" && USERS[activeUserId])
        ? USERS[activeUserId].corporateContext.hostCountry : "";
      const mock = pickMockResponse(question, host);
      if (typeof removeTyping === "function") removeTyping();
      const html = typeof safeMarkdown === "function" ? safeMarkdown(mock)
        : (typeof marked !== "undefined" ? marked.parse(mock) : mock);
      if (typeof appendMsg === "function") appendMsg("bot", html);
      if (typeof chatHistory !== "undefined") {
        chatHistory.push({ user: question, assistant: mock });
      }
    } catch (e) {
      if (typeof removeTyping === "function") removeTyping();
      if (typeof appendMsg === "function") {
        appendMsg("bot", "<p style=\"color:var(--red)\">⚠ Could not render answer. Please refresh and try again.</p>");
      }
      console.error("[demo chat]", e);
    } finally {
      chatBusy = false;
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  async function runStep(step, index) {
    if (!active) return;
    stepIndex = index;
    setCard(step.title, step.body, "Step " + (index + 1) + " / " + DEMO_STEPS.length);

    if (step.page && typeof showPage === "function") {
      showPage(step.page);
      await sleep(400);
    }

    if (step.highlight) positionSpotlight(step.highlight);
    else positionSpotlight(null);

    if (step.action) {
      try {
        step.action();
      } catch (e) {
        console.warn("[demo]", e);
      }
    }

    if (step.waitMs) await sleep(step.waitMs);
    else if (step.duration) await sleep(step.duration);
  }

  async function startDemoPresentation() {
    if (active) return;
    active = true;
    window.demoPresentationActive = true;
    if (window.location.pathname === "/v5") document.body.classList.add("v5-demo-active");
    abortController = { aborted: false };

    document.getElementById("accessModal").style.display = "none";
    showOverlay(true);
    toast("Demo presentation started — use Stop to exit.", "info");

    for (let i = 0; i < DEMO_STEPS.length; i++) {
      if (!active) break;
      await runStep(DEMO_STEPS[i], i);
    }

    stopDemoPresentation(false);
    toast("Demo presentation complete.", "ok");
  }

  function stopDemoPresentation(manual) {
    active = false;
    window.demoPresentationActive = false;
    document.body.classList.remove("v5-demo-active");
    showOverlay(false);
    positionSpotlight(null);
    if (manual) toast("Demo stopped.", "info");
  }

  // ── Profile wizard (local demo — no backend) ───────────────────────────────
  function ensureProfileWizard() {
    if (document.getElementById("profileWizardOverlay")) return;
    const el = document.createElement("div");
    el.id = "profileWizardOverlay";
    el.className = "modal-overlay hidden";
    el.innerHTML =
      '<div class="modal-box profile-wizard-box">' +
        '<div class="modal-head"><div class="modal-title">New employee profile</div>' +
        '<button type="button" class="modal-close" onclick="closeProfileWizard()">×</button></div>' +
        '<div class="modal-body">' +
          '<div class="form-grid">' +
            '<div class="form-group"><label>Full name</label><input class="form-control" id="pwName" /></div>' +
            '<div class="form-group"><label>Email</label><input class="form-control" id="pwEmail" type="email" /></div>' +
            '<div class="form-group"><label>Assignment type</label>' +
              '<select class="form-control" id="pwType"><option>LTA</option><option>STA</option><option>IA</option><option>COMMUTER</option></select></div>' +
            '<div class="form-group"><label>Home country</label><input class="form-control" id="pwHome" /></div>' +
            '<div class="form-group"><label>Host country</label><input class="form-control" id="pwHost" /></div>' +
            '<div class="form-group"><label>Department</label><input class="form-control" id="pwDept" /></div>' +
          '</div>' +
          '<div class="pw-toggles">' +
            '<label><input type="checkbox" id="pwPartner" /> Partner relocating</label>' +
            '<label><input type="checkbox" id="pwChildren" /> Children relocating</label>' +
            '<label><input type="checkbox" id="pwPets" /> Pets</label>' +
            '<label><input type="checkbox" id="pwFirst" checked /> First assignment</label>' +
          '</div>' +
        '</div>' +
        '<div class="modal-foot">' +
          '<button type="button" class="btn-outline" onclick="closeProfileWizard()">Cancel</button>' +
          '<button type="button" class="btn-primary" onclick="saveProfileWizard()">Create profile</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
  }

  function openProfileWizard() {
    ensureProfileWizard();
    document.getElementById("profileWizardOverlay").classList.remove("hidden");
  }

  function closeProfileWizard() {
    const el = document.getElementById("profileWizardOverlay");
    if (el) el.classList.add("hidden");
  }

  function fillDemoProfileWizard() {
    openProfileWizard();
    document.getElementById("pwName").value = "Elena Martins";
    document.getElementById("pwEmail").value = "elena.martins@company.com";
    document.getElementById("pwType").value = "LTA";
    document.getElementById("pwHome").value = "Brazil";
    document.getElementById("pwHost").value = "United States";
    document.getElementById("pwDept").value = "Marketing";
    document.getElementById("pwPartner").checked = true;
    document.getElementById("pwChildren").checked = false;
    document.getElementById("pwPets").checked = false;
    document.getElementById("pwFirst").checked = true;
  }

  function avatarFromName(name) {
    const parts = (name || "").trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (name || "U").slice(0, 2).toUpperCase();
  }

  function refreshUserSelector() {
    const sel = document.getElementById("userSelector");
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = Object.values(USERS)
      .map((u) => {
        const label =
          u.identity.name +
          " (" +
          u.permissions.assignmentType +
          " · " +
          u.corporateContext.homeCountry +
          " → " +
          u.corporateContext.hostCountry +
          ")";
        return '<option value="' + u.id + '">' + label + "</option>";
      })
      .join("");
    if (USERS[cur]) sel.value = cur;
  }

  function saveProfileWizard() {
    const name = document.getElementById("pwName").value.trim();
    const email = document.getElementById("pwEmail").value.trim();
    if (!name || !email) {
      toast("Name and email are required.", "err");
      return;
    }
    const type = document.getElementById("pwType").value;
    const home = document.getElementById("pwHome").value.trim() || "Brazil";
    const host = document.getElementById("pwHost").value.trim() || "United States";
    const dept = document.getElementById("pwDept").value.trim() || "General";
    const hasPartner = document.getElementById("pwPartner").checked;
    const hasChildren = document.getElementById("pwChildren").checked;
    const hasPets = document.getElementById("pwPets").checked;
    const firstAssignment = document.getElementById("pwFirst").checked;

    const id = "u_demo_" + Date.now().toString(36);
    const policyMap = {
      LTA: ["lta-global-2026-v3"],
      STA: ["sta-latam-2026-v2"],
      IA: ["ia-apac-2026-v1"],
      COMMUTER: ["commuter-emea-2026-v1"],
    };

    USERS[id] = {
      id,
      identity: { name, email, avatar: avatarFromName(name) },
      permissions: { assignmentType: type, policiesAllowed: policyMap[type] || ["lta-global-2026-v3"] },
      corporateContext: { homeCountry: home, hostCountry: host, department: dept, manager: "—" },
      profile: {
        family: {
          hasPartner,
          hasChildren,
          childrenAges: hasChildren ? [8] : [],
          hasPets,
          petsDeclared: true,
        },
        mobility: {
          firstAssignment,
          relocationExperienceLevel: firstAssignment ? "low" : "medium",
          languageBarrier: firstAssignment,
        },
        move: { needsSchoolSearch: hasChildren, needsTempHousing: true },
        financial: { concernedAboutTaxes: true, wantsBenefitDetails: true },
        timeline: {
          assignmentStage: "pre-assignment",
          immigrationInProgress: true,
          visaApproved: false,
        },
        preferences: { preferredResponseStyle: "detailed", wantsStepByStep: true },
      },
    };

    USER_ACTIONS[id] = { moveDate: "2026-10-01", completedIds: [1, 2] };
    window.__demoCreatedUserId = id;

    refreshUserSelector();
    closeProfileWizard();
    if (typeof renderUsersGrid === "function") renderUsersGrid();
    toast("Profile created: " + name, "ok");
  }

  // Expose globals for HTML hooks
  window.demoPresentationActive = false;
  window.startDemoPresentation = startDemoPresentation;
  window.stopDemoPresentation = () => stopDemoPresentation(true);
  window.openProfileWizard = openProfileWizard;
  window.closeProfileWizard = closeProfileWizard;
  window.saveProfileWizard = saveProfileWizard;
  window.fillDemoProfileWizard = fillDemoProfileWizard;
  window.demoTypeAndSend = demoTypeAndSend;
  window.pickDemoMockResponse = pickMockResponse;
  window.demoSendMessage = demoSendMessage;

  function initDemoFromUrl() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1" || params.get("autoplay") === "1") {
      const modal = document.getElementById("accessModal");
      if (modal) modal.style.display = "none";
      if (params.get("autoplay") === "1") {
        setTimeout(() => startDemoPresentation(), 1500);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDemoFromUrl);
  } else {
    initDemoFromUrl();
  }
})();
