/* Kwispelboek is called Wagbook in English.
   On pages shown in English (html lang not "nl") this swaps the visible name, the
   kwispelboek.app links and the Dutch blog hub link to their Wagbook versions.
   Switching back to Dutch restores the original text. Runs again after every
   language switch, because the i18n code rewrites the text. */
(function () {
  var TEXT = [
    [/Kwispelboek\s*\(Wagbook in English\)/g, 'Wagbook'],
    [/Kwispelboek\s*[—–-]\s*called Wagbook in English\s*[—–-]\s*/g, 'Wagbook '],
    [/Kwispelboek\s*\(Wagbook\)/g, 'Wagbook'],
    [/Kwispelboek\s*\/\s*Wagbook/g, 'Wagbook'],
    [/kwispelboek\.app/g, 'wagbook.app'],
    [/Kwispelboek(?! in Dutch)/g, 'Wagbook']
  ];
  var ATTRS = ['alt', 'title', 'aria-label'];
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, INPUT: 1 };
  var orig = new WeakMap();   // node -> { value, swapped } for text nodes
  var origAttr = new WeakMap(); // element -> { attr: [original, swapped] }
  var busy = false;

  function isEnglish() { return !/^nl/i.test(document.documentElement.lang || ''); }

  function swap(s) {
    for (var i = 0; i < TEXT.length; i++) s = s.replace(TEXT[i][0], TEXT[i][1]);
    return s;
  }

  function swapHref(h) {
    if (/^https?:\/\/(www\.)?kwispelboek\.app\/privacy\/?$/i.test(h)) return 'https://wagbook.app/privacy/';
    if (/^https?:\/\/(www\.)?kwispelboek\.app\/?$/i.test(h)) return 'https://wagbook.app/';
    if (/(^|\/)blog\/kwispelboek\.html$/.test(h) || (h === 'kwispelboek.html' && /\/blog\//.test(location.pathname)))
      return 'https://wagbook.app/blog/';
    return null;
  }

  function run() {
    if (busy || !document.body) return;
    busy = true;
    var en = isEnglish();
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = w.nextNode())) {
      if (n.parentNode && SKIP[n.parentNode.nodeName]) continue;
      var rec = orig.get(n);
      if (en) {
        if (rec && n.nodeValue === rec.swapped) continue;
        if (!/wispelboek/.test(n.nodeValue)) continue;
        var s = swap(n.nodeValue);
        if (s !== n.nodeValue) { orig.set(n, { value: n.nodeValue, swapped: s }); n.nodeValue = s; }
      } else if (rec && n.nodeValue === rec.swapped) {
        n.nodeValue = rec.value;
        orig.delete(n);
      }
    }
    var els = document.body.querySelectorAll('[alt],[title],[aria-label],a[href]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i], r = origAttr.get(el) || {};
      var names = ATTRS.concat(el.tagName === 'A' ? ['href'] : []);
      for (var j = 0; j < names.length; j++) {
        var a = names[j], v = el.getAttribute(a);
        if (v == null) continue;
        if (en) {
          if (r[a] && v === r[a][1]) continue;
          var nv = a === 'href' ? swapHref(v) : (/wispelboek/.test(v) ? swap(v) : null);
          if (nv && nv !== v) { r[a] = [v, nv]; el.setAttribute(a, nv); origAttr.set(el, r); }
        } else if (r[a] && v === r[a][1]) {
          el.setAttribute(a, r[a][0]);
          delete r[a];
        }
      }
    }
    busy = false;
  }

  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    (window.requestAnimationFrame || setTimeout)(function () { queued = false; run(); });
  }

  function start() {
    run();
    new MutationObserver(schedule).observe(document.documentElement, {
      subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['lang']
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
