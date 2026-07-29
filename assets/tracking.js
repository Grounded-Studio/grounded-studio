/*
 * Grounded Studio — website tracking
 *
 * Adds Meta Pixel (BuildExact dataset) with:
 *   - GDPR-friendly consent gate (reads localStorage.cookie-consent set by
 *     assets/cookie-banner.js — '1' = accepted, '0' = declined, null = pending)
 *   - PageView on every load once consent is granted
 *   - Lead event fired when a visitor clicks any Play Store install link
 *   - UTM propagation onto Play Store links via Google Play's
 *     `&referrer=` parameter so Play Console can attribute installs back to
 *     the campaign, even for users who decline the pixel
 *
 * Public: window.gsTracking.grantConsent() / revokeConsent() — call these
 * from cookie-banner.js if you extend it, or from the browser console for
 * manual testing.
 */
(function () {
    'use strict';

    var PIXEL_ID = '1032186512845129';
    var PLAY_HOST = 'play.google.com';

    // ---------- UTM handling (safe without consent — no PII) ---------------

    var URL_PARAM_KEYS = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'fbclid',
        'gclid',
    ];

    function readIncomingParams() {
        try {
            var search = new URLSearchParams(window.location.search);
            var out = {};
            URL_PARAM_KEYS.forEach(function (k) {
                var v = search.get(k);
                if (v) out[k] = v;
            });
            return out;
        } catch (e) {
            return {};
        }
    }

    function persistedParams() {
        try {
            var raw = sessionStorage.getItem('gs-attribution');
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    // Merge params from URL with anything we captured earlier in this session.
    // Fresh URL params always win so re-clicked ads update attribution.
    function getAttribution() {
        var incoming = readIncomingParams();
        var stored = persistedParams();
        var merged = Object.assign({}, stored, incoming);
        if (Object.keys(incoming).length) {
            try {
                sessionStorage.setItem('gs-attribution', JSON.stringify(merged));
            } catch (e) { /* ignore */ }
        }
        return merged;
    }

    // Build Play Store `referrer` param from our attribution. Google Play
    // Install Referrer API surfaces this in Play Console + your install
    // events, no SDK required.
    function buildPlayReferrer(attr) {
        var pairs = [];
        Object.keys(attr).forEach(function (k) {
            if (!attr[k]) return;
            pairs.push(encodeURIComponent(k) + '=' + encodeURIComponent(attr[k]));
        });
        // Add a sensible default source if nothing was passed so we can still
        // separate direct traffic from ad traffic in Play Console.
        if (pairs.length === 0) {
            pairs.push('utm_source=direct&utm_medium=website');
        }
        return pairs.join('&');
    }

    function decoratePlayLinks() {
        var attr = getAttribution();
        var referrer = buildPlayReferrer(attr);
        var links = document.querySelectorAll('a[href*="' + PLAY_HOST + '"]');
        links.forEach(function (a) {
            try {
                var url = new URL(a.href);
                if (url.hostname.indexOf(PLAY_HOST) === -1) return;
                url.searchParams.set('referrer', referrer);
                a.href = url.toString();
                if (!a.dataset.gsTracked) {
                    a.addEventListener('click', onPlayLinkClick);
                    a.dataset.gsTracked = '1';
                }
            } catch (e) { /* skip malformed links */ }
        });
    }

    function onPlayLinkClick() {
        // Only fire pixel events after consent — but the click still happens.
        if (!hasConsent()) return;
        if (typeof window.fbq !== 'function') return;
        try {
            window.fbq('track', 'Lead', {
                content_name: 'Play Store install click',
                content_category: 'app_install',
            });
        } catch (e) { /* ignore */ }
    }

    // ---------- Consent ----------------------------------------------------

    function hasConsent() {
        try {
            return localStorage.getItem('cookie-consent') === '1';
        } catch (e) {
            return false;
        }
    }

    function loadPixel() {
        if (window._gsPixelLoaded) return;
        window._gsPixelLoaded = true;
        // Meta's official pixel base code, inlined.
        !function (f, b, e, v, n, t, s) {
            if (f.fbq) return;
            n = f.fbq = function () {
                n.callMethod
                    ? n.callMethod.apply(n, arguments)
                    : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        }(window, document, 'script',
            'https://connect.facebook.net/en_US/fbevents.js');
        window.fbq('init', PIXEL_ID);
        window.fbq('track', 'PageView');
    }

    function unloadPixel() {
        // Once loaded we can't fully unload — the SDK stays in memory — but
        // we can stop it from tracking new events.
        if (typeof window.fbq === 'function') {
            try { window.fbq('consent', 'revoke'); } catch (e) { /* ignore */ }
        }
    }

    // Public API for cookie-banner.js (or manual test in console) to notify
    // us when consent state changes without a full reload.
    window.gsTracking = {
        grantConsent: function () {
            try { localStorage.setItem('cookie-consent', '1'); } catch (e) {}
            loadPixel();
        },
        revokeConsent: function () {
            try { localStorage.setItem('cookie-consent', '0'); } catch (e) {}
            unloadPixel();
        },
        // For debugging: check what referrer will be attached to Play links.
        currentReferrer: function () {
            return buildPlayReferrer(getAttribution());
        },
    };

    // ---------- Boot -------------------------------------------------------

    function boot() {
        decoratePlayLinks();
        if (hasConsent()) loadPixel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
