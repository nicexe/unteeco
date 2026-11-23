// ==UserScript==
// @name         unteeco - replace t.co links with the original URLs
// @namespace    https://github.com/unteeco
// @version      1.0.0
// @description  Rewrites t.co tracking links on x.com / twitter.com to their real destination using data X already ships, so t.co is never contacted.
// @match        https://x.com/*
// @match        https://twitter.com/*
// @match        https://mobile.twitter.com/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

/*
 * unteeco core: replace t.co tracking links on x.com / twitter.com with the
 * original URLs, without ever contacting t.co.
 *
 * X already ships the real destination of every t.co link inside its own API
 * responses (`entities.urls[]` = { url: "https://t.co/xxx", expanded_url: "..." }).
 * We watch those JSON responses (fetch + XHR), remember the mapping, and rewrite
 * the `href` of every t.co anchor to its expanded URL.
 *
 * This file must run in the PAGE's JS context (not an isolated world) and as
 * early as possible (document-start) so the network hooks see every response.
 */
(() => {
  'use strict';

  if (window.__unteeco) return;

  const TCO_RE = /^https?:\/\/(?:www\.)?t\.co\/([A-Za-z0-9]+)\/?(?:[?#].*)?$/i;
  const HTTP_RE = /^https?:\/\//i;
  const noop = () => {};

  /** t.co short id -> expanded url */
  const known = new Map();

  const keyOf = (url) => {
    const m = TCO_RE.exec(url);
    return m ? m[1] : null;
  };

  // ---------------------------------------------------------------- learning

  /** Walk any parsed JSON and record every { url: t.co/*, expanded_url } pair. */
  function learn(root) {
    let added = 0;
    const stack = [root];
    while (stack.length) {
      const o = stack.pop();
      if (!o || typeof o !== 'object') continue;
      if (typeof o.url === 'string' && typeof o.expanded_url === 'string') {
        const k = keyOf(o.url);
        if (k && !known.has(k) && HTTP_RE.test(o.expanded_url) && !keyOf(o.expanded_url)) {
          known.set(k, o.expanded_url);
          added++;
        }
      }
      const children = Array.isArray(o) ? o : Object.values(o);
      for (const v of children) if (v && typeof v === 'object') stack.push(v);
    }
    return added;
  }

  function ingestText(text) {
    // Cheap pre-check so we don't JSON.parse every response X makes.
    if (typeof text !== 'string' || text.indexOf('expanded_url') === -1) return;
    try {
      if (learn(JSON.parse(text))) scan(document);
    } catch (_) { /* not JSON */ }
  }

  // ------------------------------------------------------------ network hooks

  const origFetch = window.fetch;
  if (typeof origFetch === 'function') {
    window.fetch = function (...args) {
      const p = origFetch.apply(this, args);
      p.then((res) => {
        try {
          const type = res.headers.get('content-type') || '';
          if (/json/i.test(type)) res.clone().text().then(ingestText, noop);
        } catch (_) { /* ignore */ }
      }, noop);
      return p; // untouched: the page gets the original promise
    };
  }

  const xhrSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (...args) {
    this.addEventListener('load', () => {
      try {
        const t = this.responseType;
        if (t === '' || t === 'text') ingestText(this.responseText);
        else if (t === 'json' && this.response && learn(this.response)) scan(document);
      } catch (_) { /* ignore */ }
    });
    return xhrSend.apply(this, args);
  };

  // ---------------------------------------------------------------- rewriting

  /**
   * X puts the full destination in `title` (the hover tooltip) of the text link
   * inside a tweet. Other anchors for the same t.co id (e.g. the link-preview
   * card) have no title, so remember it by id and reuse it for them.
   */
  function harvestTitles() {
    for (const a of document.querySelectorAll('a[href*="t.co/" i][title]')) {
      const k = keyOf(a.getAttribute('href'));
      const title = a.getAttribute('title');
      if (k && !known.has(k) && HTTP_RE.test(title) && !keyOf(title)) known.set(k, title);
    }
  }

  function fix(a) {
    const href = a.getAttribute('href');
    if (!href) return;
    const k = keyOf(href);
    if (!k) return;

    if (!known.has(k)) harvestTitles();
    const target = known.get(k);
    if (!target) return;

    // Some links display the raw t.co URL as text; swap the text node in place
    // (not textContent) so React's reconciliation keeps working.
    const first = a.firstChild;
    if (first && first.nodeType === 3 && !first.nextSibling && keyOf(first.nodeValue.trim()) === k) {
      first.nodeValue = target;
    }

    a.setAttribute('href', target);
    a.setAttribute('data-unteeco-from', href);
  }

  function scan(root) {
    if (root.nodeType === 1 && root.matches('a[href]')) fix(root);
    if (root.querySelectorAll) root.querySelectorAll('a[href*="t.co/" i]').forEach(fix);
  }

  // Newly rendered / re-rendered anchors.
  new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'attributes') fix(r.target);
      else for (const n of r.addedNodes) if (n.nodeType === 1) scan(n);
    }
  }).observe(document, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['href'],
  });

  // Last line of defence: make sure the href is clean right before the browser
  // acts on it (open, middle-click, context menu -> copy link).
  const guard = (e) => {
    const el = e.target;
    const a = el && el.closest ? el.closest('a[href]') : null;
    if (a) fix(a);
  };
  for (const type of ['pointerdown', 'mousedown', 'click', 'auxclick', 'contextmenu']) {
    document.addEventListener(type, guard, true);
  }

  document.addEventListener('DOMContentLoaded', () => scan(document));

  Object.defineProperty(window, '__unteeco', { value: { known, scan }, configurable: true });
})();
