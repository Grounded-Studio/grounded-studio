(function () {
    if (localStorage.getItem('cookie-consent')) return;
    var b = document.createElement('div');
    b.id = 'cookie-banner';
    b.innerHTML = '<div style="position:fixed;bottom:0;left:0;right:0;z-index:99999;padding:16px 24px;background:rgba(10,10,18,.97);border-top:1px solid rgba(255,255,255,.08);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;font-family:Inter,system-ui,sans-serif;"><p style="margin:0;font-size:.85rem;color:#94a3b8;line-height:1.6;flex:1;min-width:220px;">We use cookies to improve your browsing experience. By continuing to use this site you agree to our <a href="/privacy.html" style="color:#818cf8;text-decoration:none;">privacy policy</a>.</p><div style="display:flex;gap:10px;flex-shrink:0;"><button id="cb-accept" style="padding:10px 22px;border-radius:10px;background:#6366f1;border:none;color:#fff;font-size:.85rem;font-weight:600;cursor:pointer;">Accept</button><button id="cb-decline" style="padding:10px 22px;border-radius:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#94a3b8;font-size:.85rem;font-weight:600;cursor:pointer;">Decline</button></div></div>';
    document.body.appendChild(b);
    document.getElementById('cb-accept').onclick = function () { localStorage.setItem('cookie-consent', '1'); b.remove(); };
    document.getElementById('cb-decline').onclick = function () { localStorage.setItem('cookie-consent', '0'); b.remove(); };
})();
