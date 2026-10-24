(function () {
    if (localStorage.getItem('cookie-consent')) return;
    // Same language rule as the site: saved choice, else browser language.
    var saved = null;
    try { saved = localStorage.getItem('gs-lang'); } catch (e) {}
    var nl = (saved || ((navigator.language || '').toLowerCase().indexOf('nl') === 0 ? 'nl' : 'en')) === 'nl';
    var t = nl ? {
        text: 'We willen Google Analytics en de Meta Pixel gebruiken om bezoeken en klikken naar de app te meten — alleen als je akkoord gaat. Weigeren verandert niets aan hoe de site werkt.',
        more: 'Meer info', accept: 'Akkoord', decline: 'Weigeren'
    } : {
        text: 'We’d like to use Google Analytics and the Meta Pixel to measure visits and app-install clicks — only if you accept. Declining changes nothing about how the site works.',
        more: 'More info', accept: 'Accept', decline: 'Decline'
    };
    var btn = 'padding:10px 22px;border-radius:10px;border:none;color:#fff;font-size:.85rem;font-weight:600;cursor:pointer;';
    var b = document.createElement('div');
    b.id = 'cookie-banner';
    b.innerHTML = '<div role="dialog" aria-live="polite" style="position:fixed;bottom:0;left:0;right:0;z-index:99999;padding:16px 24px;background:rgba(10,10,18,.97);border-top:1px solid rgba(255,255,255,.08);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;font-family:Inter,system-ui,sans-serif;">'
        + '<p style="margin:0;font-size:.85rem;color:#94a3b8;line-height:1.6;flex:1;min-width:220px;">' + t.text
        + ' <a href="/privacy.html" style="color:#818cf8;text-decoration:none;">' + t.more + '</a></p>'
        + '<div style="display:flex;gap:10px;flex-shrink:0;">'
        + '<button id="cb-decline" style="' + btn + 'background:#334155;">' + t.decline + '</button>'
        + '<button id="cb-accept" style="' + btn + 'background:#6366f1;">' + t.accept + '</button>'
        + '</div></div>';
    document.body.appendChild(b);
    document.getElementById('cb-accept').onclick = function () {
        localStorage.setItem('cookie-consent', '1');
        if (window.gsTracking && window.gsTracking.grantConsent) window.gsTracking.grantConsent();
        b.remove();
    };
    document.getElementById('cb-decline').onclick = function () {
        localStorage.setItem('cookie-consent', '0');
        if (window.gsTracking && window.gsTracking.revokeConsent) window.gsTracking.revokeConsent();
        b.remove();
    };
})();
