/**
 * MSAL sign-in for Expat Concierge V4 (M365 Copilot Chat API).
 * Loads config from /askV4/config — requires AZURE_CLIENT_ID in server .env.
 */
(function () {
  let msalApp = null;
  let authConfig = null;
  let initPromise = null;

  async function loadMsal() {
    if (window.msal && window.msal.PublicClientApplication) return window.msal;
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://alcdn.msauth.net/browser/2.39.0/js/msal-browser.min.js";
      s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Failed to load MSAL from Microsoft CDN"));
      document.head.appendChild(s);
    });
    return window.msal;
  }

  async function initCopilotAuth() {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      try {
        const res = await fetch("/askV4/config");
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || err.detail || "Copilot auth not configured on server (AZURE_CLIENT_ID).");
        }
        authConfig = await res.json();
        const msal = await loadMsal();
        msalApp = new msal.PublicClientApplication({
          auth: {
            clientId: authConfig.clientId,
            authority: authConfig.authority || `https://login.microsoftonline.com/${authConfig.tenantId}`,
            redirectUri: authConfig.redirectUri || window.location.origin + window.location.pathname,
            navigateToLoginRequestUrl: false,
          },
          cache: { cacheLocation: "localStorage", storeAuthStateInCookie: false },
        });
        await msalApp.handleRedirectPromise();
        return authConfig;
      } catch (e) {
        initPromise = null;
        throw e;
      }
    })();
    return initPromise;
  }

  function getScopes() {
    return (authConfig && authConfig.scopes) || [];
  }

  function getAccount() {
    if (!msalApp) return null;
    const accounts = msalApp.getAllAccounts();
    return accounts[0] || null;
  }

  function isSignedIn() {
    return Boolean(getAccount());
  }

  function getAccountLabel() {
    const acc = getAccount();
    if (!acc) return "";
    return acc.name || acc.username || "Signed in";
  }

  async function getGraphAccessToken() {
    await initCopilotAuth();
    const account = getAccount();
    const scopes = getScopes();
    if (!account) throw new Error("NOT_SIGNED_IN");

    try {
      const result = await msalApp.acquireTokenSilent({ scopes, account });
      return result.accessToken;
    } catch (silentErr) {
      const result = await msalApp.acquireTokenPopup({ scopes, account });
      return result.accessToken;
    }
  }

  async function signIn() {
    await initCopilotAuth();
    const scopes = getScopes();
    const result = await msalApp.loginPopup({ scopes });
    return result;
  }

  async function signOut() {
    if (!msalApp) return;
    const account = getAccount();
    if (account) {
      await msalApp.logoutPopup({ account });
    }
  }

  window.CopilotV4Auth = {
    initCopilotAuth,
    getGraphAccessToken,
    signIn,
    signOut,
    isSignedIn,
    getAccountLabel,
    getScopes,
  };
})();
