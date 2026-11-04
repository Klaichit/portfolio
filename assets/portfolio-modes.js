(() => {
  const buttons = [...document.querySelectorAll('[data-portfolio-mode]')];
  const panels = { '3d': document.getElementById('portfolio-3d'), graphic: document.getElementById('graphic-portfolio') };
  const nav = document.getElementById('nav-links');
  const links = [...nav.querySelectorAll('a')];
  const originalLinks = links.map(a => ({ href: a.getAttribute('href'), text: a.textContent }));
  const originalTitle = document.title;
  let current = '3d';
  function setMode(mode, push = false) {
    const graphic = mode === 'graphic';
    current = graphic ? 'graphic' : '3d';
    panels['3d'].hidden = graphic;
    panels.graphic.hidden = !graphic;
    document.body.dataset.mode = current;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.portfolioMode === current)));
    links.forEach((a, i) => { a.setAttribute('href', originalLinks[i].href); a.textContent = originalLinks[i].text; });
    if (graphic) {
      links[0].href = '#graphic-work'; links[0].textContent = 'Selected Work';
      links[1].href = '#graphic-top'; links[1].textContent = 'Overview';
      links.find(a => a.getAttribute('href') === 'resume.html').href = 'resume-graphic.html';
      document.querySelectorAll('#portfolio-3d iframe').forEach(frame => frame.contentWindow?.postMessage({ method: 'pause' }, 'https://player.vimeo.com'));
    }
    document.querySelector('.nav-logo').href = graphic ? '#graphic-top' : '#hero';
    document.title = graphic ? 'Klaichit Kaeoman | Graphic, Motion & Web' : originalTitle;
    nav.classList.remove('open');
    document.getElementById('nav-toggle').setAttribute('aria-expanded', 'false');
    document.getElementById('nav-toggle').setAttribute('aria-label', 'Open menu');
    if (push) {
      const url = new URL(location.href); url.searchParams.set('mode', current); url.hash = '';
      history.pushState({}, '', url);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.dispatchEvent(new Event('resize'));
  }
  buttons.forEach(b => b.addEventListener('click', () => { if (b.dataset.portfolioMode !== current) setMode(b.dataset.portfolioMode, true); }));
  window.addEventListener('popstate', () => setMode(new URLSearchParams(location.search).get('mode')));
  setMode(new URLSearchParams(location.search).get('mode'));

  const viewer = document.getElementById('work-viewer');
  const content = viewer.querySelector('.viewer-content');
  viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', e => { if (e.target === viewer) { const r = viewer.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) viewer.close(); } });
  viewer.addEventListener('close', () => { content.querySelector('video')?.pause(); content.replaceChildren(); });
  const projects = window.GRAPHIC_PROJECTS || [];
  const grid = document.getElementById('graphic-grid');
  const categories = {
    graphic: ['01', 'Graphic & campaigns', 'PRODUCT STORIES / SOCIAL DESIGN'],
    website: ['02', 'Digital experiences', 'WEBSITE / RESPONSIVE DESIGN'],
    video: ['03', 'In motion', 'PRODUCT / EVENTS / TRAVEL FILMS']
  };
  const counts = {};
  projects.forEach(project => {
    counts[project.type] = (counts[project.type] || 0) + 1;
    if (counts[project.type] === 1) {
      const divider = document.createElement('div'); divider.className = 'project-divider'; divider.dataset.category = project.type;
      const heading = document.createElement('h3');
      const number = document.createElement('span'); number.textContent = categories[project.type][0];
      heading.append(number, categories[project.type][1]);
      const description = document.createElement('p'); description.textContent = categories[project.type][2];
      divider.append(heading, description); grid.append(divider);
    }
    const button = document.createElement('button');
    button.className = 'graphic-card'; button.type = 'button'; button.dataset.type = project.type;
    button.dataset.slug = project.slug;
    if (counts[project.type] <= 2) button.classList.add('featured');
    button.setAttribute('aria-label', `${project.type === 'video' ? 'Play' : 'View'} ${project.title}`);
    const media = document.createElement('div'); media.className = 'graphic-card-media';
    const img = document.createElement('img'); img.src = project.image; img.alt = project.title; img.loading = 'lazy';
    const tag = document.createElement('span'); tag.className = 'graphic-card-tag'; tag.textContent = '▶'; tag.setAttribute('aria-hidden', 'true');
    const title = document.createElement('h3'); title.textContent = project.title.replace(' / ', ' — ');
    const label = document.createElement('p'); label.textContent = project.label;
    media.append(img);
    if (project.type === 'video') media.append(tag);
    button.append(media, title, label); grid.append(button);
    button.addEventListener('click', () => {
      document.getElementById('viewer-title').textContent = project.title;
      const asset = document.createElement(project.video ? 'video' : 'img');
      asset.src = project.video || project.image;
      if (project.video) { asset.controls = true; asset.playsInline = true; asset.preload = 'metadata'; asset.poster = project.image; }
      else asset.alt = project.title;
      content.replaceChildren(asset);
      if (project.slug === 'website') { const mobile = document.createElement('img'); mobile.src = 'assets/graphic/website-mobile.webp'; mobile.alt = '24S Energy website mobile layout'; mobile.className = 'mobile-preview'; content.append(mobile); }
      viewer.showModal();
    });
  });
  document.querySelectorAll('.graphic-filter').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.graphic-filter').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    grid.querySelectorAll('.graphic-card').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.type !== button.dataset.filter; });
    grid.querySelectorAll('.project-divider').forEach(divider => { divider.hidden = button.dataset.filter !== 'all' && divider.dataset.category !== button.dataset.filter; });
    document.getElementById('graphic-count').textContent = `${[...grid.querySelectorAll('.graphic-card')].filter(c => !c.hidden).length} projects`;
  }));
  document.getElementById('graphic-count').textContent = `${projects.length} projects`;
  document.querySelectorAll('[data-open-project]').forEach(trigger => trigger.addEventListener('click', () => {
    const card = [...grid.querySelectorAll('.graphic-card')].find(card => card.dataset.slug === trigger.dataset.openProject);
    card?.click();
    viewer.addEventListener('close', () => trigger.focus({ preventScroll: true }), { once: true });
  }));
})();
