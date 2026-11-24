// ==UserScript==
// @name         unteeco - replace t.co links with the original URLs
// @namespace    https://github.com/unteeco
// @version      1.0.0
// @description  Rewrites t.co tracking links on x.com / twitter.com to their real destination using data X already ships, so t.co is never contacted.
// @icon         data:image/png;base64,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
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
