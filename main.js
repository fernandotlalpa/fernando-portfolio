'use strict';

// The page content is rendered in HTML. JavaScript only enhances navigation and media previews.
document.documentElement.classList.add('js');
const nav = document.querySelector('#site-nav');
const menu = document.querySelector('.menu-button');
menu.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(expanded));
  nav.classList.toggle('is-open', expanded);
});
nav.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  menu.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
});

const collections = [...document.querySelectorAll('[data-collection]')];
const filters = [...document.querySelectorAll('[data-filter]')];
const more = document.querySelector('#more');
const status = document.querySelector('#gallery-status');
let activeCategory = 'recent';
let visibleCount = 6;

function updateGallery() {
  for (const collection of collections) {
    const active = collection.dataset.collection === activeCategory;
    collection.hidden = !active;
    const items = [...collection.querySelectorAll('.project')];
    items.forEach((item, index) => { item.hidden = active && index >= visibleCount; });
    if (active) {
      const name = filters.find(button => button.dataset.filter === activeCategory).textContent;
      status.textContent = `${name} · Mostrando ${Math.min(visibleCount, items.length)} de ${items.length} ${activeCategory === 'tutorials' ? 'videos' : 'piezas'}`;
      more.hidden = visibleCount >= items.length;
      more.textContent = activeCategory === 'tutorials' ? 'Ver más videos' : 'Ver más proyectos';
    }
  }
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeCategory)));
}

function selectCategory(category) {
  if (!collections.some(collection => collection.dataset.collection === category)) return;
  activeCategory = category;
  visibleCount = 6;
  updateGallery();
}
filters.forEach(button => button.addEventListener('click', () => selectCategory(button.dataset.filter)));
document.querySelectorAll('[data-select]').forEach(link => {
  link.addEventListener('click', () => selectCategory(link.dataset.select));
});
more.addEventListener('click', () => {
  const previousCount = visibleCount;
  visibleCount += 6;
  updateGallery();
  const active = collections.find(collection => collection.dataset.collection === activeCategory);
  active.querySelectorAll('.project')[previousCount]?.querySelector('a').focus();
});
document.querySelector('.filters').hidden = false;
document.querySelector('.gallery-footer').hidden = false;
status.hidden = false;
updateGallery();

const viewer = document.querySelector('#viewer');
const image = document.querySelector('#viewer-image');
const video = document.querySelector('#viewer-video');
let lastMediaTrigger;

if (typeof viewer.showModal === 'function') {
  document.querySelectorAll('[data-media]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      lastMediaTrigger = link;
      const isVideo = link.dataset.kind === 'video';
      document.querySelector('#viewer-title').textContent = link.dataset.title;
      document.querySelector('#viewer-caption').textContent = `${link.dataset.brand} · Trabajo de Fernando Tlalpa Acuña.`;
      image.hidden = isVideo;
      video.hidden = !isVideo;
      if (isVideo) {
        image.removeAttribute('src');
        video.poster = link.dataset.poster;
        video.src = link.href;
        video.setAttribute('aria-label', link.dataset.title);
        video.load();
      } else {
        image.src = link.href;
        image.alt = link.dataset.title;
      }
      viewer.showModal();
    });
  });
  document.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const bounds = viewer.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close();
  });
  viewer.addEventListener('close', () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
    lastMediaTrigger?.focus();
  });
}
