(function () {
  'use strict';

  // Mobile nav toggle
  var toggle = document.getElementById('nav-toggle');
  var navList = document.getElementById('nav-list');
  if (toggle && navList) {
    toggle.addEventListener('click', function () {
      navList.classList.toggle('is-open');
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
    });
  }

  // Set current page in nav
  var currentPath = window.location.pathname.replace(/^\//, '') || 'index.html';
  if (currentPath === '' || currentPath.endsWith('/')) currentPath = 'index.html';
  document.querySelectorAll('.nav-list a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === currentPath || (currentPath === 'index.html' && (href === '/' || href === 'index.html'))) {
      a.setAttribute('aria-current', 'page');
    }
  });

  // Optional: footer year
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Fade-in on scroll
  var fadeEls = document.querySelectorAll('.fade-in');
  if (typeof IntersectionObserver !== 'undefined') {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.01 });
    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }
})();
