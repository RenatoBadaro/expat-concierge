/* eslint-disable */
function htmlV2() {
  return /* html */`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Expat Concierge V2 | Global Mobility</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --yellow:#f2c100;--yellow-dk:#d4a900;--yellow-lt:rgba(242,193,0,.12);
      --teal:#0f3d4c;--teal-lt:#174f62;--teal-dim:rgba(15,61,76,.07);--teal-xlt:rgba(15,61,76,.04);
      --bg:#f0f2f5;--white:#fff;
      --g1:#f7f8fa;--g2:#e8eaed;--g3:#c4c8ce;--g5:#6b7280;--g8:#1f2937;
      --red:#e53935;--green:#2e7d32;--amber:#b45309;--blue:#1565c0;
      --r:10px;--sw:64px;--hh:58px;--shadow:0 2px 8px rgba(0,0,0,.08);
    }
    html,body{height:100%;font-family:Arial,"Helvetica Neue",sans-serif;background:var(--bg);color:var(--g8);font-size:14px}

    /* ── Shell ── */
    .shell{display:flex;height:100vh;overflow:hidden}

    /* ── Sidebar ── */
    .sidebar{width:var(--sw);background:var(--teal);display:flex;flex-direction:column;align-items:center;padding:12px 0;gap:4px;flex-shrink:0;z-index:100}
    .sb-logo{width:40px;height:40px;margin-bottom:8px;background:var(--yellow);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;color:var(--teal);letter-spacing:-1px;flex-shrink:0}
    .nav-item{width:44px;height:44px;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:background .15s;gap:3px;color:rgba(255,255,255,.55);font-size:9px;text-align:center;border:none;background:transparent}
    .nav-item svg{width:20px;height:20px}
    .nav-item:hover{background:rgba(255,255,255,.1);color:rgba(255,255,255,.9)}
    .nav-item.active{background:var(--yellow);color:var(--teal)}
    .sb-spacer{flex:1}
    .v2-badge{font-size:8px;font-weight:900;color:var(--yellow);letter-spacing:.5px;text-transform:uppercase;margin-bottom:4px}

    /* ── Page ── */
    .page{flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0}

    /* ── Header ── */
    .header{height:var(--hh);background:var(--white);border-bottom:1px solid var(--g2);display:flex;align-items:center;padding:0 24px;gap:12px;flex-shrink:0;box-shadow:var(--shadow)}
    .header-logo{display:flex;align-items:center;gap:10px;font-weight:900;font-size:15px;letter-spacing:.5px;color:var(--teal);text-transform:uppercase}
    .header-bar{width:3px;height:22px;background:var(--yellow);border-radius:2px}
    .header-v2{font-size:10px;font-weight:900;color:var(--white);background:var(--teal);padding:2px 6px;border-radius:4px;letter-spacing:.5px}
    .header-spacer{flex:1}

    /* User selector in header */
    .user-selector-wrap{display:flex;align-items:center;gap:8px}
    .user-selector-label{font-size:11px;color:var(--g5);font-weight:600;white-space:nowrap}
    .user-selector{border:1.5px solid var(--g2);border-radius:8px;padding:6px 10px;font-size:12px;font-family:inherit;outline:none;color:var(--g8);background:var(--white);cursor:pointer;transition:border-color .2s;min-width:180px}
    .user-selector:focus{border-color:var(--teal)}
    .user-av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--teal-lt));color:#fff;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;border:2px solid var(--yellow)}

    /* ── Pages container ── */
    .pg{display:none;flex:1;flex-direction:column;overflow:hidden;min-height:0}
    .pg.active{display:flex}

    /* ── Chat page layout ── */
    #pgChat{flex-direction:row;overflow:hidden}
    .chat-sidebar{width:300px;min-width:260px;background:var(--white);border-right:1px solid var(--g2);display:flex;flex-direction:column;overflow:hidden;flex-shrink:0}
    .chat-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0}

    /* Profile panel */
    .profile-panel{padding:20px;overflow-y:auto;flex:1}
    .profile-panel::-webkit-scrollbar{width:5px}
    .profile-panel::-webkit-scrollbar-thumb{background:var(--g2);border-radius:4px}
    .profile-header{display:flex;flex-direction:column;align-items:center;text-align:center;padding:20px 16px;border-bottom:1px solid var(--g2);background:var(--teal-xlt)}
    .profile-av{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--teal-lt));color:#fff;font-weight:700;font-size:20px;display:flex;align-items:center;justify-content:center;border:3px solid var(--yellow);margin-bottom:10px}
    .profile-name{font-size:15px;font-weight:700;color:var(--teal)}
    .profile-role{font-size:11px;color:var(--g5);margin-top:2px}
    .profile-tags{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin-top:8px}
    .ptag{padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700}
    .ptag.type{background:var(--teal);color:#fff}
    .ptag.stage{background:var(--yellow-lt);color:var(--teal)}
    .ptag.risk{background:rgba(229,57,53,.1);color:var(--red)}
    .ptag.ok{background:rgba(46,125,50,.1);color:var(--green)}

    .profile-section{margin-bottom:16px}
    .profile-section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--g5);margin-bottom:8px;display:flex;align-items:center;gap:5px}
    .profile-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--g2)}
    .profile-row:last-child{border-bottom:none}
    .pr-label{font-size:12px;color:var(--g5)}
    .pr-value{font-size:12px;font-weight:600;color:var(--g8);text-align:right;max-width:55%}
    .pr-value.warn{color:var(--red)}
    .pr-value.ok{color:var(--green)}

    /* Suggested questions */
    .suggestions{padding:12px 16px;border-top:1px solid var(--g2);background:var(--g1)}
    .sug-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--g5);margin-bottom:8px}
    .sug-chip{display:block;width:100%;text-align:left;padding:7px 10px;background:var(--white);border:1.5px solid var(--g2);border-radius:8px;font-size:12px;color:var(--teal);cursor:pointer;transition:all .15s;margin-bottom:6px;font-family:inherit}
    .sug-chip:hover{border-color:var(--teal);background:var(--teal-xlt)}
    .sug-chip:last-child{margin-bottom:0}

    /* Chat area */
    .chat-area{flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;padding:16px 20px}
    .chat-topbar{display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-shrink:0;flex-wrap:wrap}
    .chat-topbar-icon{width:32px;height:32px;background:var(--teal);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .chat-topbar-icon svg{width:16px;height:16px}
    .chat-topbar-text h3{font-size:14px;font-weight:700;color:var(--teal)}
    .chat-topbar-text p{font-size:11px;color:var(--g5)}
    .chat-meta-badges{margin-left:auto;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
    .meta-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:12px;font-size:10px;font-weight:700}
    .mb-conf-high{background:rgba(46,125,50,.1);color:var(--green)}
    .mb-conf-med{background:var(--yellow-lt);color:var(--amber)}
    .mb-conf-low{background:rgba(229,57,53,.1);color:var(--red)}
    .mb-risk-low{background:rgba(46,125,50,.1);color:var(--green)}
    .mb-risk-med{background:var(--yellow-lt);color:var(--amber)}
    .mb-risk-high{background:rgba(229,57,53,.1);color:var(--red)}
    .mb-policy{background:var(--teal-dim);color:var(--teal)}

    .chat-container{background:var(--white);border-radius:var(--r);box-shadow:var(--shadow);overflow:hidden;border:1px solid var(--g2);display:flex;flex-direction:column;flex:1;min-height:0}
    .chat-messages{flex:1;min-height:0;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:14px;background:var(--g1)}
    .chat-messages::-webkit-scrollbar{width:5px}
    .chat-messages::-webkit-scrollbar-thumb{background:var(--g2);border-radius:4px}
    .chat-empty{margin:auto;text-align:center;color:var(--g5);padding:24px}
    .chat-empty-icon{font-size:38px;margin-bottom:10px}
    .chat-empty h4{font-size:15px;font-weight:700;color:var(--teal);margin-bottom:6px}
    .chat-empty p{font-size:12px;line-height:1.6}

    .msg{display:flex;gap:10px;max-width:88%}
    .msg.user{align-self:flex-end;flex-direction:row-reverse}
    .msg.bot{align-self:flex-start}
    .msg-av{width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px}
    .msg.user .msg-av{background:var(--teal);color:#fff;font-weight:700;font-size:10px}
    .msg.bot .msg-av{background:var(--yellow);color:var(--teal);font-size:15px}
    .msg-bub{padding:11px 15px;border-radius:10px;font-size:13px;line-height:1.65;max-width:100%}
    .msg.user .msg-bub{background:var(--teal);color:#fff;border-bottom-right-radius:3px}
    .msg.bot .msg-bub{background:var(--white);color:var(--g8);border:1px solid var(--g2);border-bottom-left-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.05)}
    .msg.bot .msg-bub h1,.msg.bot .msg-bub h2{font-size:13px;font-weight:700;color:var(--teal);margin:10px 0 4px}
    .msg.bot .msg-bub h1:first-child,.msg.bot .msg-bub h2:first-child{margin-top:0}
    .msg.bot .msg-bub h3{font-size:12px;font-weight:700;color:var(--teal);margin:8px 0 3px}
    .msg.bot .msg-bub p{margin-bottom:6px}
    .msg.bot .msg-bub p:last-child{margin-bottom:0}
    .msg.bot .msg-bub ul,.msg.bot .msg-bub ol{padding-left:18px;margin-bottom:6px}
    .msg.bot .msg-bub li{margin-bottom:3px}
    .msg.bot .msg-bub strong{color:var(--teal)}
    .msg.bot .msg-bub hr{border:none;border-top:1px solid var(--g2);margin:10px 0}
    .msg.bot .msg-bub blockquote{border-left:3px solid var(--yellow);padding-left:10px;color:var(--g5);margin:6px 0}

    .msg-meta{margin-top:6px;display:flex;gap:5px;flex-wrap:wrap}
    .msg-meta-badge{font-size:10px;font-weight:700;padding:2px 7px;border-radius:8px;display:inline-flex;align-items:center;gap:3px}
    .mmb-conf{background:var(--teal-dim);color:var(--teal)}
    .mmb-risk-low{background:rgba(46,125,50,.1);color:var(--green)}
    .mmb-risk-med{background:var(--yellow-lt);color:var(--amber)}
    .mmb-risk-high{background:rgba(229,57,53,.1);color:var(--red)}
    .mmb-escalate{background:rgba(229,57,53,.1);color:var(--red)}
    .mmb-policy{background:var(--teal-dim);color:var(--teal)}
    .mmb-missing{background:var(--yellow-lt);color:var(--amber)}

    .typing{display:flex;align-items:center;gap:4px;padding:2px 0}
    .typing span{width:6px;height:6px;background:var(--g3);border-radius:50%;animation:bob 1.2s infinite}
    .typing span:nth-child(2){animation-delay:.2s}
    .typing span:nth-child(3){animation-delay:.4s}
    @keyframes bob{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}

    .chat-input-row{display:flex;align-items:flex-end;gap:10px;padding:14px;background:var(--white);border-top:1px solid var(--g2)}
    .chat-input{flex:1;border:1.5px solid var(--g2);border-radius:8px;padding:10px 14px;font-size:13px;font-family:inherit;resize:none;outline:none;min-height:42px;max-height:120px;line-height:1.5;transition:border-color .2s;color:var(--g8);background:var(--g1)}
    .chat-input:focus{border-color:var(--teal);background:var(--white)}
    .chat-input::placeholder{color:var(--g3)}
    .send-btn{width:42px;height:42px;background:var(--teal);border:none;border-radius:8px;color:#fff;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:background .15s,transform .1s}
    .send-btn:hover{background:var(--teal-lt)}
    .send-btn:active{transform:scale(.95)}
    .send-btn:disabled{opacity:.4;cursor:not-allowed;transform:none}
    .send-btn svg{width:18px;height:18px}

    /* ── Users management page ── */
    .users-page{flex:1;overflow-y:auto;padding:28px 32px}
    .users-page::-webkit-scrollbar{width:6px}
    .users-page::-webkit-scrollbar-thumb{background:var(--g2);border-radius:4px}
    .page-title{font-size:22px;font-weight:900;color:var(--teal);margin-bottom:4px}
    .page-subtitle{font-size:13px;color:var(--g5);margin-bottom:24px}
    .users-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap}
    .btn-primary{padding:9px 20px;background:var(--teal);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:background .15s;font-family:inherit;display:inline-flex;align-items:center;gap:6px}
    .btn-primary:hover{background:var(--teal-lt)}
    .btn-sm{padding:6px 12px;font-size:12px;border-radius:7px}
    .btn-outline{padding:7px 14px;background:transparent;color:var(--teal);border:1.5px solid var(--teal);border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;font-family:inherit;display:inline-flex;align-items:center;gap:5px}
    .btn-outline:hover{background:var(--teal);color:#fff}
    .btn-danger{padding:6px 12px;background:transparent;color:var(--red);border:1.5px solid var(--red);border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;font-family:inherit}
    .btn-danger:hover{background:var(--red);color:#fff}
    .btn-yellow{padding:8px 18px;background:var(--yellow);color:var(--teal);border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:background .15s;font-family:inherit;display:inline-flex;align-items:center;gap:6px}
    .btn-yellow:hover{background:var(--yellow-dk)}

    .users-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
    .user-card{background:var(--white);border-radius:var(--r);box-shadow:var(--shadow);padding:20px;border-top:4px solid var(--g2);cursor:pointer;transition:transform .15s,box-shadow .15s,border-color .15s;position:relative}
    .user-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.1)}
    .user-card.selected{border-top-color:var(--yellow)}
    .uc-head{display:flex;align-items:center;gap:12px;margin-bottom:14px}
    .uc-av{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--teal-lt));color:#fff;font-weight:700;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .uc-name{font-size:14px;font-weight:700;color:var(--teal)}
    .uc-type{font-size:11px;font-weight:700;color:var(--g5)}
    .uc-rows{display:flex;flex-direction:column;gap:5px;margin-bottom:14px}
    .uc-row{display:flex;justify-content:space-between;font-size:12px}
    .uc-row span:first-child{color:var(--g5)}
    .uc-row span:last-child{font-weight:600;color:var(--g8)}
    .uc-actions{display:flex;gap:6px;flex-wrap:wrap}
    .uc-badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:var(--teal-dim);color:var(--teal);margin-bottom:6px}

    /* ── Profile Wizard / Edit Modal ── */
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:40px 20px;overflow-y:auto}
    .modal-overlay.hidden{display:none}
    .modal{background:var(--white);border-radius:12px;width:100%;max-width:680px;box-shadow:0 12px 48px rgba(0,0,0,.2);overflow:hidden}
    .modal-header{padding:20px 24px 16px;border-bottom:1px solid var(--g2);display:flex;align-items:center;justify-content:space-between}
    .modal-title{font-size:18px;font-weight:800;color:var(--teal)}
    .modal-close{background:none;border:none;cursor:pointer;color:var(--g3);font-size:22px;line-height:1;padding:0 2px;transition:color .15s}
    .modal-close:hover{color:var(--g8)}
    .modal-body{padding:24px;overflow-y:auto;max-height:65vh}
    .modal-body::-webkit-scrollbar{width:5px}
    .modal-body::-webkit-scrollbar-thumb{background:var(--g2);border-radius:4px}
    .modal-footer{padding:16px 24px;border-top:1px solid var(--g2);display:flex;justify-content:flex-end;gap:10px}

    /* Wizard steps */
    .wizard-steps{display:flex;gap:0;margin-bottom:24px;border-bottom:2px solid var(--g2)}
    .wstep{padding:8px 16px;font-size:12px;font-weight:700;color:var(--g5);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .15s;white-space:nowrap}
    .wstep.active{color:var(--teal);border-bottom-color:var(--teal)}
    .wstep.done{color:var(--green)}
    .wizard-pane{display:none}
    .wizard-pane.active{display:block}

    /* Form elements */
    .form-section{margin-bottom:20px}
    .form-section-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--g5);margin-bottom:12px}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .form-group{display:flex;flex-direction:column;gap:5px}
    .form-group.full{grid-column:1/-1}
    .form-group label{font-size:11px;font-weight:700;color:var(--g5);text-transform:uppercase;letter-spacing:.6px}
    .form-control{border:1.5px solid var(--g2);border-radius:8px;padding:9px 12px;font-size:13px;font-family:inherit;outline:none;transition:border-color .2s;color:var(--g8);background:var(--white)}
    .form-control:focus{border-color:var(--teal)}
    .form-control.sm{padding:7px 10px;font-size:12px}
    .toggle-row{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--g2)}
    .toggle-row:last-child{border-bottom:none}
    .toggle-label{font-size:13px;color:var(--g8)}
    .toggle-sub{font-size:11px;color:var(--g5)}
    .toggle{position:relative;display:inline-block;width:38px;height:22px;flex-shrink:0}
    .toggle input{opacity:0;width:0;height:0}
    .toggle-slider{position:absolute;inset:0;background:var(--g3);border-radius:22px;cursor:pointer;transition:.2s}
    .toggle-slider:before{position:absolute;content:"";height:16px;width:16px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.2s}
    .toggle input:checked+.toggle-slider{background:var(--teal)}
    .toggle input:checked+.toggle-slider:before{transform:translateX(16px)}
    .pills-wrap{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
    .pill{padding:5px 12px;border-radius:20px;border:1.5px solid var(--g2);font-size:12px;cursor:pointer;transition:all .15s;color:var(--g5);font-weight:600;user-select:none}
    .pill.active{border-color:var(--teal);background:var(--teal);color:#fff}

    /* ── Toast ── */
    #toasts{position:fixed;bottom:20px;right:20px;display:flex;flex-direction:column;gap:8px;z-index:9999}
    .toast{padding:10px 16px;border-radius:8px;font-size:13px;font-weight:600;color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.15);animation:tslide .2s ease}
    .toast.ok{background:var(--green)}.toast.err{background:var(--red)}.toast.info{background:var(--teal)}
    @keyframes tslide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

    /* ── Escalation banner ── */
    .escalate-banner{background:rgba(229,57,53,.07);border:1.5px solid rgba(229,57,53,.3);border-radius:8px;padding:10px 14px;margin-top:10px;font-size:12px;color:var(--red);display:flex;align-items:flex-start;gap:8px}
    .escalate-banner svg{flex-shrink:0;margin-top:1px}

    @media(max-width:900px){#pgChat{flex-direction:column}.chat-sidebar{width:100%;height:auto;max-height:200px}.profile-panel{display:none}.users-grid{grid-template-columns:1fr}}
    @media(max-width:600px){.users-page{padding:16px}.form-grid{grid-template-columns:1fr}.wizard-steps{overflow-x:auto}}
  </style>
</head>
<body>
<div class="shell">

  <!-- Sidebar -->
  <nav class="sidebar">
    <div class="sb-logo">EC</div>
    <div class="v2-badge">V2.4</div>

    <button class="nav-item active" id="navChat" onclick="showPage('chat')" title="Concierge Chat">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>Chat
    </button>

    <button class="nav-item" id="navUsers" onclick="showPage('users')" title="User Management">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>Users
    </button>

    <div class="sb-spacer"></div>

    <button class="nav-item" title="Settings">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
      </svg>Config
    </button>
  </nav>

  <!-- Page -->
  <div class="page">

    <!-- Header -->
    <header class="header">
      <div class="header-logo">
        <div class="header-bar"></div>
        EXPAT CONCIERGE
        <span class="header-v2">V2.4</span>
      </div>
      <div class="header-spacer"></div>
      <div class="user-selector-wrap">
        <span class="user-selector-label">Active user:</span>
        <select class="user-selector" id="userSelector" onchange="switchUser(this.value)">
          <option value="">Loading users…</option>
        </select>
      </div>
      <div class="user-av" id="headerAv" title="Current user">?</div>
    </header>

    <!-- ════ CHAT PAGE ════ -->
    <div class="pg active" id="pgChat">

      <!-- Left: Profile panel -->
      <aside class="chat-sidebar">
        <div class="profile-header">
          <div class="profile-av" id="profileAv">?</div>
          <div class="profile-name" id="profileName">Select a user</div>
          <div class="profile-role" id="profileRole">—</div>
          <div class="profile-tags" id="profileTags"></div>
        </div>
        <div class="profile-panel" id="profilePanel">
          <div id="profileDetails" style="color:var(--g5);font-size:12px;text-align:center;padding:20px 0">
            Select a user to see their profile.
          </div>
        </div>
        <div class="suggestions" id="suggestionsPanel" style="display:none">
          <div class="sug-title">Suggested questions</div>
          <div id="suggestionChips"></div>
        </div>
      </aside>

      <!-- Right: Chat -->
      <div class="chat-main">
        <div class="chat-area">
          <div class="chat-topbar">
            <div class="chat-topbar-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#f2c100" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </div>
            <div class="chat-topbar-text">
              <h3>Global Mobility Concierge</h3>
              <p>Secure · Policy-scoped · Profile-aware</p>
            </div>
            <div class="chat-meta-badges" id="chatMetaBadges"></div>
          </div>

          <div class="chat-container">
            <div class="chat-messages" id="chatMessages">
              <div class="chat-empty" id="chatEmpty">
                <div class="chat-empty-icon">🌍</div>
                <h4>Welcome to Expat Concierge V2</h4>
                <p>Select a user profile above, then ask any question about your global mobility assignment.</p>
              </div>
            </div>
            <div class="chat-input-row">
              <textarea id="chatInput" class="chat-input" rows="1"
                placeholder="Ask about your relocation… e.g. What housing support am I entitled to?"></textarea>
              <button class="send-btn" id="sendBtn" onclick="send()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div><!-- /pgChat -->

    <!-- ════ USERS PAGE ════ -->
    <div class="pg" id="pgUsers">
      <div class="users-page">
        <div class="page-title">User Management</div>
        <div class="page-subtitle">Manage expat user profiles, permissions, and simulate scenarios.</div>
        <div class="users-toolbar">
          <button class="btn-primary" onclick="openWizard(null)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New User
          </button>
          <button class="btn-outline" onclick="loadUsers()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            Refresh
          </button>
        </div>
        <div class="users-grid" id="usersGrid">
          <div style="color:var(--g5);font-size:13px">Loading users…</div>
        </div>
      </div>
    </div><!-- /pgUsers -->

  </div><!-- /page -->
</div><!-- /shell -->

<div id="toasts"></div>

<!-- ════ PROFILE WIZARD / EDIT MODAL ════ -->
<div class="modal-overlay hidden" id="wizardOverlay">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title" id="wizardTitle">New User Profile</div>
      <button class="modal-close" onclick="closeWizard()">×</button>
    </div>
    <div class="modal-body">
      <!-- Wizard step tabs -->
      <div class="wizard-steps" id="wizardSteps">
        <div class="wstep active" data-step="0" onclick="goStep(0)">Identity</div>
        <div class="wstep" data-step="1" onclick="goStep(1)">Permissions</div>
        <div class="wstep" data-step="2" onclick="goStep(2)">Family</div>
        <div class="wstep" data-step="3" onclick="goStep(3)">Relocation</div>
        <div class="wstep" data-step="4" onclick="goStep(4)">Timeline</div>
        <div class="wstep" data-step="5" onclick="goStep(5)">Preferences</div>
      </div>

      <!-- Step 0: Identity -->
      <div class="wizard-pane active" id="wPane0">
        <div class="form-section">
          <div class="form-section-title">Identity</div>
          <div class="form-grid">
            <div class="form-group full">
              <label>User ID</label>
              <input type="text" class="form-control" id="wId" placeholder="e.g. u_lta_john"/>
            </div>
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" class="form-control" id="wName" placeholder="John Doe"/>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" class="form-control" id="wEmail" placeholder="john@company.com"/>
            </div>
            <div class="form-group">
              <label>Avatar (2 letters)</label>
              <input type="text" class="form-control" id="wAvatar" maxlength="2" placeholder="JD"/>
            </div>
          </div>
        </div>
        <div class="form-section">
          <div class="form-section-title">Corporate Context</div>
          <div class="form-grid">
            <div class="form-group">
              <label>Home Country</label>
              <input type="text" class="form-control" id="wHomeCountry" placeholder="Brazil"/>
            </div>
            <div class="form-group">
              <label>Host Country</label>
              <input type="text" class="form-control" id="wHostCountry" placeholder="United States"/>
            </div>
            <div class="form-group">
              <label>Department</label>
              <input type="text" class="form-control" id="wDept" placeholder="Supply Chain"/>
            </div>
            <div class="form-group">
              <label>Manager</label>
              <input type="text" class="form-control" id="wManager" placeholder="Sarah Chen"/>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 1: Permissions -->
      <div class="wizard-pane" id="wPane1">
        <div class="form-section">
          <div class="form-section-title">Assignment Type</div>
          <div class="pills-wrap" id="wAssignmentType">
            <div class="pill active" onclick="togglePill(this,'assignmentType')">LTA</div>
            <div class="pill" onclick="togglePill(this,'assignmentType')">STA</div>
            <div class="pill" onclick="togglePill(this,'assignmentType')">IA</div>
            <div class="pill" onclick="togglePill(this,'assignmentType')">COMMUTER</div>
            <div class="pill" onclick="togglePill(this,'assignmentType')">LOCALIZATION</div>
            <div class="pill" onclick="togglePill(this,'assignmentType')">PERMANENT</div>
          </div>
        </div>
        <div class="form-section">
          <div class="form-section-title">Allowed Policies (comma-separated)</div>
          <div class="form-group">
            <label>Policy IDs</label>
            <input type="text" class="form-control" id="wPolicies" placeholder="lta-global-2026-v3, lta-latam-2026-v1"/>
            <span style="font-size:11px;color:var(--g5);margin-top:3px">Separate multiple policy IDs with commas.</span>
          </div>
        </div>
      </div>

      <!-- Step 2: Family -->
      <div class="wizard-pane" id="wPane2">
        <div class="form-section">
          <div class="form-section-title">Family Situation</div>
          <div class="toggle-row">
            <div><div class="toggle-label">Has Partner</div><div class="toggle-sub">Partner relocating together</div></div>
            <label class="toggle"><input type="checkbox" id="wHasPartner"><span class="toggle-slider"></span></label>
          </div>
          <div class="toggle-row">
            <div><div class="toggle-label">Has Children</div></div>
            <label class="toggle"><input type="checkbox" id="wHasChildren" onchange="toggleChildrenAges()"><span class="toggle-slider"></span></label>
          </div>
          <div class="form-group" id="childrenAgesGroup" style="display:none;margin-top:10px">
            <label>Children Ages (comma-separated)</label>
            <input type="text" class="form-control" id="wChildrenAges" placeholder="5, 10"/>
          </div>
          <div class="toggle-row">
            <div><div class="toggle-label">Has Pets</div><div class="toggle-sub">Pet relocation logistics apply</div></div>
            <label class="toggle"><input type="checkbox" id="wHasPets"><span class="toggle-slider"></span></label>
          </div>
        </div>
      </div>

      <!-- Step 3: Relocation -->
      <div class="wizard-pane" id="wPane3">
        <div class="form-section">
          <div class="form-section-title">Mobility & Move Complexity</div>
          <div class="toggle-row">
            <div><div class="toggle-label">First Assignment</div><div class="toggle-sub">No prior relocation experience</div></div>
            <label class="toggle"><input type="checkbox" id="wFirstAssignment"><span class="toggle-slider"></span></label>
          </div>
          <div class="toggle-row">
            <div><div class="toggle-label">Language Barrier</div><div class="toggle-sub">Limited proficiency in host country language</div></div>
            <label class="toggle"><input type="checkbox" id="wLanguageBarrier"><span class="toggle-slider"></span></label>
          </div>
          <div class="toggle-row">
            <div><div class="toggle-label">Needs School Search</div></div>
            <label class="toggle"><input type="checkbox" id="wNeedsSchool"><span class="toggle-slider"></span></label>
          </div>
          <div class="toggle-row">
            <div><div class="toggle-label">Needs Temporary Housing</div></div>
            <label class="toggle"><input type="checkbox" id="wNeedsTempHousing"><span class="toggle-slider"></span></label>
          </div>
        </div>
        <div class="form-section" style="margin-top:16px">
          <div class="form-section-title">Experience Level</div>
          <div class="pills-wrap" id="wExpLevel">
            <div class="pill active" onclick="togglePill(this,'expLevel')">low</div>
            <div class="pill" onclick="togglePill(this,'expLevel')">medium</div>
            <div class="pill" onclick="togglePill(this,'expLevel')">high</div>
          </div>
        </div>
      </div>

      <!-- Step 4: Timeline -->
      <div class="wizard-pane" id="wPane4">
        <div class="form-section">
          <div class="form-section-title">Assignment Stage</div>
          <div class="pills-wrap" id="wStage">
            <div class="pill active" onclick="togglePill(this,'stage')">pre-assignment</div>
            <div class="pill" onclick="togglePill(this,'stage')">mid-assignment</div>
            <div class="pill" onclick="togglePill(this,'stage')">post-assignment</div>
          </div>
        </div>
        <div class="form-section" style="margin-top:16px">
          <div class="form-section-title">Immigration &amp; Tax</div>
          <div class="toggle-row">
            <div><div class="toggle-label">Immigration In Progress</div></div>
            <label class="toggle"><input type="checkbox" id="wImmigration"><span class="toggle-slider"></span></label>
          </div>
          <div class="toggle-row">
            <div><div class="toggle-label">Visa Approved</div></div>
            <label class="toggle"><input type="checkbox" id="wVisaApproved"><span class="toggle-slider"></span></label>
          </div>
          <div class="toggle-row">
            <div><div class="toggle-label">Concerned About Taxes</div></div>
            <label class="toggle"><input type="checkbox" id="wTaxConcern"><span class="toggle-slider"></span></label>
          </div>
          <div class="toggle-row">
            <div><div class="toggle-label">Wants Benefit Details</div></div>
            <label class="toggle"><input type="checkbox" id="wWantsBenefits"><span class="toggle-slider"></span></label>
          </div>
        </div>
      </div>

      <!-- Step 5: Preferences -->
      <div class="wizard-pane" id="wPane5">
        <div class="form-section">
          <div class="form-section-title">Response Style</div>
          <div class="pills-wrap" id="wRespStyle">
            <div class="pill active" onclick="togglePill(this,'respStyle')">detailed</div>
            <div class="pill" onclick="togglePill(this,'respStyle')">concise</div>
          </div>
        </div>
        <div class="form-section" style="margin-top:16px">
          <div class="toggle-row">
            <div><div class="toggle-label">Step-by-Step Guidance</div><div class="toggle-sub">Concierge will always provide numbered steps</div></div>
            <label class="toggle"><input type="checkbox" id="wStepByStep"><span class="toggle-slider"></span></label>
          </div>
        </div>
      </div>

    </div><!-- /modal-body -->
    <div class="modal-footer">
      <button class="btn-outline" id="wizPrevBtn" onclick="wizardNav(-1)" style="display:none">← Back</button>
      <button class="btn-primary" id="wizNextBtn" onclick="wizardNav(1)">Next →</button>
      <button class="btn-yellow" id="wizSaveBtn" onclick="saveUser()" style="display:none">Save Profile</button>
    </div>
  </div>
</div>

<script>
  marked.setOptions({ breaks: true, gfm: true });

  // ── State ─────────────────────────────────────────────────────────────────
  const USE_V2 = true;  // This portal is always V2
  let activeUserId = null;
  let activeUserCtx = null;
  let chatBusy = false;
  let emptyCleared = false;
  let lastMeta = null;
  let wizardStep = 0;
  let wizardEditId = null;
  const WIZARD_STEPS = 6;

  // Pill state trackers
  const pillState = {
    assignmentType: "LTA",
    expLevel: "low",
    stage: "pre-assignment",
    respStyle: "detailed",
  };

  let sessionId = sessionStorage.getItem("sessionIdV2") ||
    (() => {
      const id = (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36));
      sessionStorage.setItem("sessionIdV2", id);
      return id;
    })();

  const chatMessages = document.getElementById("chatMessages");
  const chatInput    = document.getElementById("chatInput");
  const sendBtn      = document.getElementById("sendBtn");

  // ── Navigation ─────────────────────────────────────────────────────────────
  function showPage(page) {
    document.querySelectorAll(".pg").forEach(p => p.classList.remove("active"));
    document.getElementById("pg" + page.charAt(0).toUpperCase() + page.slice(1)).classList.add("active");
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    document.getElementById("nav" + page.charAt(0).toUpperCase() + page.slice(1)).classList.add("active");
    if (page === "users") loadUsers();
  }

  // ── Toast ──────────────────────────────────────────────────────────────────
  function toast(msg, type = "info") {
    const el = document.createElement("div");
    el.className = "toast " + type;
    el.textContent = msg;
    document.getElementById("toasts").appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  // ── Load users into selector ───────────────────────────────────────────────
  async function loadUserSelector() {
    try {
      const r = await fetch("/v2/users");
      const users = await r.json();
      const sel = document.getElementById("userSelector");
      sel.innerHTML = '<option value="">— Select user —</option>' +
        users.map(u =>
          '<option value="' + u.id + '">' + u.name + ' (' + u.assignmentType + ' · ' + u.homeCountry + ' → ' + u.hostCountry + ')</option>'
        ).join("");
      if (users.length > 0) {
        sel.value = users[0].id;
        switchUser(users[0].id);
      }
    } catch(e) {
      console.error("Could not load users:", e);
    }
  }

  // ── Switch active user ─────────────────────────────────────────────────────
  async function switchUser(userId) {
    if (!userId) return;
    activeUserId = userId;

    // Reset chat for new user
    chatMessages.innerHTML = '<div class="chat-empty" id="chatEmpty"><div class="chat-empty-icon">⏳</div><h4>Loading profile…</h4></div>';
    emptyCleared = false;
    lastMeta = null;
    document.getElementById("chatMetaBadges").innerHTML = "";

    try {
      const r = await fetch("/v2/users/" + userId);
      if (!r.ok) throw new Error("User not found");
      activeUserCtx = await r.json();
      renderProfile(activeUserCtx);
      updateHeaderAv(activeUserCtx);
      clearChatEmpty("Ready. Ask me anything about your assignment.");
    } catch(e) {
      toast("Could not load user: " + e.message, "err");
    }
  }

  function updateHeaderAv(ctx) {
    const av = document.getElementById("headerAv");
    av.textContent = ctx.identity?.avatar || "?";
    av.title = ctx.identity?.name || "Unknown";
  }

  function clearChatEmpty(msg) {
    const el = document.getElementById("chatEmpty");
    if (el) {
      el.innerHTML =
        '<div class="chat-empty-icon">🌍</div>' +
        '<h4>Hello, ' + (activeUserCtx?.identity?.name?.split(" ")[0] || "there") + '!</h4>' +
        '<p>' + msg + '</p>';
    }
  }

  // ── Render profile panel ───────────────────────────────────────────────────
  function renderProfile(ctx) {
    const { identity, permissions, corporateContext, profile } = ctx;
    const p   = profile || {};
    const fam = p.family || {};
    const mob = p.mobility || {};
    const tl  = p.timeline || {};
    const fin = p.financial || {};

    // Header
    document.getElementById("profileAv").textContent   = identity?.avatar || "?";
    document.getElementById("profileName").textContent = identity?.name || "Unknown";
    document.getElementById("profileRole").textContent =
      (permissions?.assignmentType || "—") + " · " + (corporateContext?.homeCountry || "?") + " → " + (corporateContext?.hostCountry || "?");

    const tagsEl = document.getElementById("profileTags");
    const tags = [];
    tags.push({ cls: "type",  label: permissions?.assignmentType || "?" });
    tags.push({ cls: "stage", label: tl.assignmentStage || "?" });
    if (tl.immigrationInProgress && !tl.visaApproved) tags.push({ cls: "risk", label: "⚠ Visa pending" });
    if (mob.firstAssignment) tags.push({ cls: "stage", label: "1st assignment" });
    if (tl.visaApproved) tags.push({ cls: "ok", label: "✓ Visa approved" });
    tagsEl.innerHTML = tags.map(t => '<span class="ptag ' + t.cls + '">' + t.label + '</span>').join("");

    // Details
    const rows = [
      { section: "Assignment", rows: [
        ["Type", permissions?.assignmentType || "—"],
        ["Stage", tl.assignmentStage || "—"],
        ["Home", corporateContext?.homeCountry || "—"],
        ["Host", corporateContext?.hostCountry || "—"],
        ["Department", corporateContext?.department || "—"],
      ]},
      { section: "Family", rows: [
        ["Partner", fam.hasPartner ? "Yes" : "No"],
        ["Children", fam.hasChildren ? "Yes (ages " + (fam.childrenAges || []).join(", ") + ")" : "No"],
        ["Pets", fam.hasPets ? "Yes" : "No"],
        ["School search", (p.move?.needsSchoolSearch) ? "Needed" : "Not needed"],
      ]},
      { section: "Mobility", rows: [
        ["Experience", mob.relocationExperienceLevel || "—"],
        ["First assignment", mob.firstAssignment ? "Yes" : "No"],
        ["Language barrier", mob.languageBarrier ? "Yes" : "No"],
        ["Temp housing", (p.move?.needsTempHousing) ? "Needed" : "Not needed"],
      ]},
      { section: "Immigration", rows: [
        ["In progress", tl.immigrationInProgress ? { v: "Yes", warn: true } : "No"],
        ["Visa approved", tl.visaApproved ? { v: "Yes", ok: true } : { v: "No", warn: !tl.immigrationInProgress ? false : true }],
        ["Tax concerns", fin.concernedAboutTaxes ? "Yes" : "No"],
      ]},
    ];

    let html = "";
    for (const block of rows) {
      html += '<div class="profile-section">';
      html += '<div class="profile-section-title">' + block.section + '</div>';
      for (const [label, val] of block.rows) {
        const vObj = typeof val === "object" ? val : { v: val };
        const cls  = vObj.warn ? " warn" : vObj.ok ? " ok" : "";
        html += '<div class="profile-row"><span class="pr-label">' + label + '</span><span class="pr-value' + cls + '">' + (vObj.v || vObj) + '</span></div>';
      }
      html += '</div>';
    }

    document.getElementById("profileDetails").innerHTML = html;

    // Suggested questions based on profile
    const chips = [];
    if (fam.hasChildren) chips.push("What schooling support am I entitled to?");
    if (tl.immigrationInProgress) chips.push("What is the current status of my visa process?");
    if (mob.firstAssignment) chips.push("What are the key steps in my relocation process?");
    if (p.move?.needsTempHousing) chips.push("How does temporary housing work for my assignment?");
    if (fin.concernedAboutTaxes) chips.push("How does tax equalization work for " + permissions?.assignmentType + "?");
    if (!chips.length) chips.push("What benefits am I entitled to?", "What are my next steps?");

    document.getElementById("suggestionChips").innerHTML =
      chips.slice(0, 4).map(q => '<button class="sug-chip" onclick="askQuestion(' + JSON.stringify(q) + ')">' + q + '</button>').join("");
    document.getElementById("suggestionsPanel").style.display = "block";
  }

  // ── Ask via chip ───────────────────────────────────────────────────────────
  function askQuestion(q) {
    chatInput.value = q;
    send();
  }

  // ── Chat ───────────────────────────────────────────────────────────────────
  chatInput.addEventListener("input", () => {
    chatInput.style.height = "auto";
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
  });
  chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!chatBusy) send(); }
  });

  function appendMsg(role, html, meta) {
    if (!emptyCleared) {
      const el = document.getElementById("chatEmpty");
      if (el) { el.remove(); emptyCleared = true; }
    }
    const wrap = document.createElement("div"); wrap.className = "msg " + role;
    const av   = document.createElement("div"); av.className   = "msg-av";
    av.textContent = role === "user" ? (activeUserCtx?.identity?.avatar || "U") : "🤖";
    const bub  = document.createElement("div"); bub.className  = "msg-bub";
    bub.innerHTML  = role === "bot" ? html : escHtml(html);


    wrap.appendChild(av); wrap.appendChild(bub);
    chatMessages.appendChild(wrap);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return bub;
  }

  function buildMetaBadges(meta) {
    let html = "";
    if (meta.confidence) {
      const cls = meta.confidence === "high" ? "mmb-conf" : meta.confidence === "medium" ? "mmb-conf" : "mmb-risk-high";
      html += '<span class="msg-meta-badge ' + cls + '">Confidence: ' + meta.confidence + '</span>';
    }
    if (meta.riskLevel) {
      const cls = { low: "mmb-risk-low", medium: "mmb-risk-med", high: "mmb-risk-high" }[meta.riskLevel] || "mmb-conf";
      html += '<span class="msg-meta-badge ' + cls + '">Risk: ' + meta.riskLevel + '</span>';
    }
    if (meta.policiesUsed?.length) {
      html += '<span class="msg-meta-badge mmb-policy">Policy: ' + meta.policiesUsed.join(", ") + '</span>';
    }
    if (meta.chunksRetrieved) {
      html += '<span class="msg-meta-badge mmb-conf">' + meta.chunksRetrieved + ' source(s)</span>';
    }
    if (meta.escalationRequired && meta.escalationTeam) {
      html += '<span class="msg-meta-badge mmb-escalate">⚠ Escalate to: ' + meta.escalationTeam + '</span>';
    }
    if (meta.missingInformation?.length) {
      html += '<span class="msg-meta-badge mmb-missing">Missing info: ' + meta.missingInformation.length + ' item(s)</span>';
    }
    return html;
  }

  function updateHeaderBadges(meta) {
    if (!meta) return;
    const el = document.getElementById("chatMetaBadges");
    el.innerHTML = "";
    if (meta.assignmentType) {
      const span = document.createElement("span");
      span.className = "meta-badge mb-policy";
      span.textContent = meta.assignmentType;
      el.appendChild(span);
    }
    if (meta.confidence) {
      const span = document.createElement("span");
      span.className = "meta-badge mb-conf-" + meta.confidence;
      span.textContent = "Conf: " + meta.confidence;
      el.appendChild(span);
    }
    if (meta.riskLevel) {
      const span = document.createElement("span");
      span.className = "meta-badge mb-risk-" + meta.riskLevel;
      span.textContent = "Risk: " + meta.riskLevel;
      el.appendChild(span);
    }
  }

  function escHtml(s) {
    return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  function showTyping() {
    if (!emptyCleared) {
      const el = document.getElementById("chatEmpty");
      if (el) { el.remove(); emptyCleared = true; }
    }
    const wrap = document.createElement("div"); wrap.className = "msg bot"; wrap.id = "typing";
    const av   = document.createElement("div"); av.className   = "msg-av"; av.textContent = "🤖";
    const bub  = document.createElement("div"); bub.className  = "msg-bub";
    bub.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    wrap.appendChild(av); wrap.appendChild(bub);
    chatMessages.appendChild(wrap);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  function removeTyping() { document.getElementById("typing")?.remove(); }

  async function send() {
    const question = chatInput.value.trim();
    if (!question || chatBusy) return;
    if (!activeUserId) { toast("Please select a user first.", "err"); return; }

    chatBusy = true; sendBtn.disabled = true;
    chatInput.value = ""; chatInput.style.height = "auto";

    appendMsg("user", question);
    showTyping();

    try {
      const res = await fetch("/askV2?stream=true", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ question, userId: activeUserId, sessionId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        // Out-of-scope questions return a friendly answer instead of a generic error
        if (err.error === "out_of_scope" && err.answer) {
          removeTyping();
          appendMsg("bot", marked.parse(err.answer));
        } else {
          throw new Error(err.error || "Request failed");
        }
        return;
      }

      removeTyping();
      const botBub = appendMsg("bot", "");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let full = ""; let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\\n"); buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const p = JSON.parse(line.slice(6));
            if (p.delta) {
              full += p.delta;
              botBub.innerHTML = marked.parse(full);
              chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            if (p.done && p.meta) {
              lastMeta = p.meta;
              updateHeaderBadges(p.meta);
            }
            if (p.error) {
              botBub.innerHTML += '<p style="color:var(--red);font-size:12px">⚠ ' + escHtml(p.error) + '</p>';
            }
          } catch(_) {}
        }
      }
    } catch(err) {
      removeTyping();
      appendMsg("bot", '<p style="color:var(--red)">⚠ ' + escHtml(err.message) + '</p>');
    } finally {
      chatBusy = false; sendBtn.disabled = false;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  // ── Users page ─────────────────────────────────────────────────────────────
  async function loadUsers() {
    const grid = document.getElementById("usersGrid");
    grid.innerHTML = '<div style="color:var(--g5);font-size:13px">Loading…</div>';
    try {
      const r = await fetch("/v2/users");
      const users = await r.json();
      if (users.length === 0) {
        grid.innerHTML = '<div style="color:var(--g5);font-size:13px">No users found.</div>';
        return;
      }
      grid.innerHTML = users.map(u => renderUserCard(u)).join("");
    } catch(e) {
      grid.innerHTML = '<div style="color:var(--red);font-size:13px">Error loading users.</div>';
    }
  }

  function renderUserCard(u) {
    const selected = u.id === activeUserId ? " selected" : "";
    return \`<div class="user-card\${selected}" onclick="selectUserFromCard('\${u.id}')">
      <div class="uc-head">
        <div class="uc-av">\${u.avatar || u.name.slice(0,2).toUpperCase()}</div>
        <div>
          <div class="uc-name">\${u.name}</div>
          <div class="uc-type">\${u.assignmentType}</div>
        </div>
      </div>
      <div class="uc-badge">\${u.assignmentStage || "unknown stage"}</div>
      <div class="uc-rows">
        <div class="uc-row"><span>Home</span><span>\${u.homeCountry}</span></div>
        <div class="uc-row"><span>Host</span><span>\${u.hostCountry}</span></div>
      </div>
      <div class="uc-actions">
        <button class="btn-outline btn-sm" onclick="event.stopPropagation();openWizard('\${u.id}')">Edit</button>
        <button class="btn-primary btn-sm" onclick="event.stopPropagation();simulateUser('\${u.id}')">Simulate</button>
        <button class="btn-danger" onclick="event.stopPropagation();deleteUser('\${u.id}')">Delete</button>
      </div>
    </div>\`;
  }

  function selectUserFromCard(id) {
    document.getElementById("userSelector").value = id;
    switchUser(id);
  }

  function simulateUser(id) {
    document.getElementById("userSelector").value = id;
    switchUser(id);
    showPage("chat");
    toast("Simulating as user: " + id, "info");
  }

  async function deleteUser(id) {
    if (!confirm("Delete user " + id + "?")) return;
    try {
      const r = await fetch("/v2/users/" + id, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
      toast("User deleted.", "ok");
      loadUsers();
      loadUserSelector();
      if (activeUserId === id) { activeUserId = null; activeUserCtx = null; }
    } catch(e) {
      toast("Error: " + e.message, "err");
    }
  }

  // ── Profile Wizard ─────────────────────────────────────────────────────────
  async function openWizard(userId) {
    wizardEditId = userId;
    wizardStep   = 0;
    document.getElementById("wizardTitle").textContent = userId ? "Edit User Profile" : "New User Profile";

    if (userId) {
      try {
        const r = await fetch("/v2/users/" + userId);
        const ctx = await r.json();
        fillWizard(ctx);
      } catch(e) { toast("Could not load user for editing.", "err"); return; }
    } else {
      resetWizard();
    }

    goStep(0);
    document.getElementById("wizardOverlay").classList.remove("hidden");
  }

  function closeWizard() {
    document.getElementById("wizardOverlay").classList.add("hidden");
  }

  function resetWizard() {
    document.getElementById("wId").value = "";
    document.getElementById("wName").value = "";
    document.getElementById("wEmail").value = "";
    document.getElementById("wAvatar").value = "";
    document.getElementById("wHomeCountry").value = "";
    document.getElementById("wHostCountry").value = "";
    document.getElementById("wDept").value = "";
    document.getElementById("wManager").value = "";
    document.getElementById("wPolicies").value = "";
    document.getElementById("wHasPartner").checked = false;
    document.getElementById("wHasChildren").checked = false;
    document.getElementById("wChildrenAges").value = "";
    document.getElementById("childrenAgesGroup").style.display = "none";
    document.getElementById("wHasPets").checked = false;
    document.getElementById("wFirstAssignment").checked = false;
    document.getElementById("wLanguageBarrier").checked = false;
    document.getElementById("wNeedsSchool").checked = false;
    document.getElementById("wNeedsTempHousing").checked = false;
    document.getElementById("wImmigration").checked = false;
    document.getElementById("wVisaApproved").checked = false;
    document.getElementById("wTaxConcern").checked = false;
    document.getElementById("wWantsBenefits").checked = false;
    document.getElementById("wStepByStep").checked = false;
    pillState.assignmentType = "LTA";
    pillState.expLevel = "low";
    pillState.stage = "pre-assignment";
    pillState.respStyle = "detailed";
    syncPills();
  }

  function fillWizard(ctx) {
    const { identity, permissions, corporateContext, profile } = ctx;
    const p   = profile || {};
    const fam = p.family || {};
    const mob = p.mobility || {};
    const mv  = p.move || {};
    const fin = p.financial || {};
    const tl  = p.timeline || {};
    const pr  = p.preferences || {};

    document.getElementById("wId").value          = ctx.id || "";
    document.getElementById("wName").value        = identity?.name || "";
    document.getElementById("wEmail").value       = identity?.email || "";
    document.getElementById("wAvatar").value      = identity?.avatar || "";
    document.getElementById("wHomeCountry").value = corporateContext?.homeCountry || "";
    document.getElementById("wHostCountry").value = corporateContext?.hostCountry || "";
    document.getElementById("wDept").value        = corporateContext?.department || "";
    document.getElementById("wManager").value     = corporateContext?.manager || "";
    document.getElementById("wPolicies").value    = (permissions?.policiesAllowed || []).join(", ");
    document.getElementById("wHasPartner").checked    = !!fam.hasPartner;
    document.getElementById("wHasChildren").checked   = !!fam.hasChildren;
    document.getElementById("wChildrenAges").value    = (fam.childrenAges || []).join(", ");
    document.getElementById("wHasPets").checked        = !!fam.hasPets;
    document.getElementById("wFirstAssignment").checked = !!mob.firstAssignment;
    document.getElementById("wLanguageBarrier").checked  = !!mob.languageBarrier;
    document.getElementById("wNeedsSchool").checked      = !!mv.needsSchoolSearch;
    document.getElementById("wNeedsTempHousing").checked = !!mv.needsTempHousing;
    document.getElementById("wImmigration").checked    = !!tl.immigrationInProgress;
    document.getElementById("wVisaApproved").checked   = !!tl.visaApproved;
    document.getElementById("wTaxConcern").checked     = !!fin.concernedAboutTaxes;
    document.getElementById("wWantsBenefits").checked  = !!fin.wantsBenefitDetails;
    document.getElementById("wStepByStep").checked     = !!pr.wantsStepByStep;

    pillState.assignmentType = permissions?.assignmentType || "LTA";
    pillState.expLevel       = mob.relocationExperienceLevel || "low";
    pillState.stage          = tl.assignmentStage || "pre-assignment";
    pillState.respStyle      = pr.preferredResponseStyle || "detailed";
    syncPills();

    if (fam.hasChildren) document.getElementById("childrenAgesGroup").style.display = "block";
  }

  function syncPills() {
    ["wAssignmentType", "wExpLevel", "wStage", "wRespStyle"].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const key = { wAssignmentType:"assignmentType", wExpLevel:"expLevel", wStage:"stage", wRespStyle:"respStyle" }[id];
      el.querySelectorAll(".pill").forEach(p => {
        p.classList.toggle("active", p.textContent.trim() === pillState[key]);
      });
    });
  }

  function togglePill(el, key) {
    const parent = el.closest(".pills-wrap");
    parent.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
    el.classList.add("active");
    pillState[key] = el.textContent.trim();
  }

  function toggleChildrenAges() {
    document.getElementById("childrenAgesGroup").style.display =
      document.getElementById("wHasChildren").checked ? "block" : "none";
  }

  function goStep(n) {
    wizardStep = n;
    document.querySelectorAll(".wizard-pane").forEach((p, i) =>
      p.classList.toggle("active", i === n));
    document.querySelectorAll(".wstep").forEach((s, i) => {
      s.classList.toggle("active", i === n);
    });
    document.getElementById("wizPrevBtn").style.display = n > 0 ? "" : "none";
    document.getElementById("wizNextBtn").style.display = n < WIZARD_STEPS - 1 ? "" : "none";
    document.getElementById("wizSaveBtn").style.display = n === WIZARD_STEPS - 1 ? "" : "none";
  }

  function wizardNav(dir) {
    const next = wizardStep + dir;
    if (next >= 0 && next < WIZARD_STEPS) goStep(next);
  }

  async function saveUser() {
    const id = document.getElementById("wId").value.trim();
    if (!id) { toast("User ID is required.", "err"); goStep(0); return; }

    const childrenAgesRaw = document.getElementById("wChildrenAges").value;
    const childrenAges = childrenAgesRaw
      ? childrenAgesRaw.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
      : [];

    const policiesRaw = document.getElementById("wPolicies").value;
    const policiesAllowed = policiesRaw
      ? policiesRaw.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    const userData = {
      id,
      identity: {
        name:   document.getElementById("wName").value.trim(),
        email:  document.getElementById("wEmail").value.trim(),
        avatar: document.getElementById("wAvatar").value.trim().toUpperCase().slice(0,2) ||
                document.getElementById("wName").value.trim().slice(0,2).toUpperCase(),
      },
      permissions: {
        assignmentType:  pillState.assignmentType,
        policiesAllowed,
      },
      corporateContext: {
        homeCountry: document.getElementById("wHomeCountry").value.trim(),
        hostCountry: document.getElementById("wHostCountry").value.trim(),
        department:  document.getElementById("wDept").value.trim(),
        manager:     document.getElementById("wManager").value.trim(),
      },
      profile: {
        family: {
          hasPartner:   document.getElementById("wHasPartner").checked,
          hasChildren:  document.getElementById("wHasChildren").checked,
          childrenAges,
          hasPets:      document.getElementById("wHasPets").checked,
        },
        mobility: {
          firstAssignment:            document.getElementById("wFirstAssignment").checked,
          relocationExperienceLevel:  pillState.expLevel,
          languageBarrier:            document.getElementById("wLanguageBarrier").checked,
        },
        move: {
          moveComplexity:   document.getElementById("wHasChildren").checked ? "family" : "individual",
          needsSchoolSearch: document.getElementById("wNeedsSchool").checked,
          needsTempHousing:  document.getElementById("wNeedsTempHousing").checked,
        },
        financial: {
          concernedAboutTaxes:  document.getElementById("wTaxConcern").checked,
          wantsBenefitDetails:  document.getElementById("wWantsBenefits").checked,
        },
        timeline: {
          assignmentStage:       pillState.stage,
          immigrationInProgress: document.getElementById("wImmigration").checked,
          visaApproved:          document.getElementById("wVisaApproved").checked,
        },
        preferences: {
          preferredResponseStyle: pillState.respStyle,
          wantsStepByStep:        document.getElementById("wStepByStep").checked,
        },
      },
    };

    try {
      const r = await fetch("/v2/users/" + id, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(userData),
      });
      if (!r.ok) throw new Error("Save failed");
      toast("Profile saved.", "ok");
      closeWizard();
      loadUsers();
      loadUserSelector();
    } catch(e) {
      toast("Error saving profile: " + e.message, "err");
    }
  }

  // ── Boot ───────────────────────────────────────────────────────────────────
  loadUserSelector();
</script>
</body>
</html>`;
}

module.exports = { htmlV2 };
