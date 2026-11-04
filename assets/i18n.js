(() => {
  const dictionary = window.PORTFOLIO_TH || {};
  const folded = new Map(Object.entries(dictionary).map(([en, th]) => [en.toLowerCase(), th]));
  const normalize = text => text.replace(/\s+/g, ' ').trim();
  const nativeThai = location.pathname.endsWith('/resume-graphic-th.html');
  const valid = value => value === 'en' || value === 'th';
  const saved = () => { try { return localStorage.getItem('portfolio-language'); } catch { return null; } };
  const requested = new URLSearchParams(location.search).get('lang');
  let language = valid(requested) ? requested : nativeThai ? 'th' : valid(saved()) ? saved() : 'en';
  if (nativeThai && language === 'en') {
    const target = new URL('resume-graphic.html', location.href); target.searchParams.set('lang', 'en'); location.replace(target); return;
  }
  const stylesheet = new URL('i18n.css', document.currentScript.src).href;
  const originals = new WeakMap();
  const attributeOriginals = new WeakMap();
  const roots = new Set();
  let scheduled = false;
  function translate(text) {
    const value = normalize(text);
    const exact = dictionary[value] ?? folded.get(value.toLowerCase());
    if (exact) return exact;
    let match = value.match(/^(\d+)\s+projects?$/i);
    if (match) return `${match[1]} ผลงาน`;
    match = value.match(/^(Character|Scene|Shot|Render|Project|Forest|Meadow|Mountain|Snow|Lake|Marsh|Shared Mine)\s+(\d+)$/i);
    if (match) return `${({character:'ตัวละคร',scene:'ฉาก',shot:'ภาพ',render:'ภาพเรนเดอร์',project:'ผลงาน',forest:'ป่า',meadow:'ทุ่งหญ้า',mountain:'ภูเขา',snow:'หิมะ',lake:'ทะเลสาบ',marsh:'หนองน้ำ','shared mine':'เหมือง'})[match[1].toLowerCase()]} ${match[2]}`;
    match = value.match(/^(View|Play) (.+)$/);
    if (match) return `${match[1] === 'View' ? 'ดู' : 'เล่น'} ${translate(match[2])}`;
    const parts = value.split(/( · | — | \| | \/ |: )/);
    if (parts.length > 1) return parts.map((part, i) => i % 2 ? part : translate(part)).join('');
    match = value.match(/^(Personal|FanMade) (\d{4})$/);
    if (match) return `${translate(match[1])} ${match[2]}`;
    return value;
  }
  window.PortfolioI18n = { translate, get language() { return language; } };
  function processText(node) {
    if (!node.nodeValue?.trim() || node.parentElement?.closest('script,style,noscript,code,[data-no-translate]')) return;
    const current = node.nodeValue;
    let record = originals.get(node);
    if (!record || (current !== record.last && current !== record.en)) record = { en: current, last: current };
    const normalized = normalize(record.en);
    const translated = language === 'th' ? translate(normalized) : normalized;
    const next = record.en.replace(normalized, translated);
    // Whitespace inside a paragraph may include line breaks, so replace the complete trimmed span.
    const output = next === record.en && translated !== normalized ? record.en.replace(/\S[\s\S]*\S|\S/, translated) : next;
    record.last = output; originals.set(node, record);
    if (current !== output) node.nodeValue = output;
  }
  function processElement(el) {
    if (el.closest('[data-no-translate]') || el.matches('script,style')) return;
    for (const attr of ['aria-label', 'alt', 'title', 'placeholder', ...(el.matches('meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]') ? ['content'] : [])]) {
      const current = el.getAttribute(attr); if (!current) continue;
      let records = attributeOriginals.get(el); if (!records) { records = {}; attributeOriginals.set(el, records); }
      let record = records[attr];
      if (!record || (current !== record.last && current !== record.en)) record = { en: current, last: current };
      const next = language === 'th' ? translate(record.en) : record.en;
      record.last = next; records[attr] = record;
      if (next !== current) el.setAttribute(attr, next);
    }
    if (el.matches('a[href]')) {
      const href = el.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      const url = new URL(href, location.href);
      if (url.origin !== location.origin || !/\.html$/.test(url.pathname)) return;
      const explicit = el.getAttribute('hreflang') || (el.closest('.language-switch') && el.getAttribute('lang'));
      url.searchParams.set('lang', valid(explicit) ? explicit : language);
      if (el.href !== url.href) el.href = url.href;
    }
  }
  function register(root) {
    if (roots.has(root)) return;
    roots.add(root);
    if (root instanceof ShadowRoot) {
      const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = stylesheet; root.append(link);
    }
    new MutationObserver(schedule).observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'alt', 'title', 'placeholder', 'href', 'content'] });
  }
  function update() {
    scheduled = false;
    document.documentElement.lang = language;
    register(document);
    for (const root of roots) {
      if (root instanceof ShadowRoot) root.host.lang = language;
      for (const el of root.querySelectorAll('*')) { if (el.shadowRoot) register(el.shadowRoot); processElement(el); }
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) processText(walker.currentNode);
    }
    switcher.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === language)));
    switcher.setAttribute('aria-label', language === 'th' ? 'เลือกภาษาเว็บไซต์' : 'Website language');
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }
  function setLanguage(next) {
    if (!valid(next)) return;
    if (nativeThai && next === 'en') {
      try { localStorage.setItem('portfolio-language', next); } catch {}
      location.href = new URL('resume-graphic.html?lang=en', location.href).href; return;
    }
    language = next;
    try { localStorage.setItem('portfolio-language', next); } catch {}
    const url = new URL(location.href); url.searchParams.set('lang', next); history.replaceState({}, '', url);
    update(); window.dispatchEvent(new CustomEvent('portfolio-language-change', { detail: next }));
  }
  const switcher = document.createElement('div');
  switcher.className = 'site-language-switch'; switcher.dataset.noTranslate = ''; switcher.setAttribute('role', 'group');
  for (const [value, label] of [['th', 'TH'], ['en', 'EN']]) {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.lang = value; button.lang = value;
    button.textContent = label; button.setAttribute('aria-label', value === 'th' ? 'ใช้ภาษาไทย' : 'Use English');
    button.addEventListener('click', () => setLanguage(value)); switcher.append(button);
  }
  (document.querySelector('nav') || document.body).append(switcher);
  window.addEventListener('popstate', () => { const value = new URLSearchParams(location.search).get('lang'); if (valid(value)) language = value; update(); });
  if (valid(requested) || nativeThai) { try { localStorage.setItem('portfolio-language', language); } catch {} }
  update();
})();
