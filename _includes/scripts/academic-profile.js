(function () {
  var navigator = document.querySelector('[data-academic-navigator]');
  if (!navigator) { return; }

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var sectionTrack = navigator.querySelector('[data-academic-section-markers]');
  var sectionLinks = Array.prototype.slice.call(navigator.querySelectorAll('[data-academic-section-link]'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-academic-section]'));
  var activeSectionIndex = -1;
  var ticking = false;

  function revealActiveLink(link) {
    if (!sectionTrack || sectionTrack.scrollWidth <= sectionTrack.clientWidth) { return; }

    var trackRect = sectionTrack.getBoundingClientRect();
    var linkRect = link.getBoundingClientRect();
    var linkLeft = sectionTrack.scrollLeft + linkRect.left - trackRect.left;
    var targetLeft = linkLeft - (sectionTrack.clientWidth - link.offsetWidth) / 2;
    sectionTrack.scrollTo({
      left: Math.max(targetLeft, 0),
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
  }

  function setActiveSection(index) {
    if (index === activeSectionIndex || !sections[index] || !sectionLinks[index]) { return; }

    activeSectionIndex = index;

    sectionLinks.forEach(function (link, linkIndex) {
      link.classList.toggle('is-past', linkIndex < index);
      link.classList.toggle('is-active', linkIndex === index);
      if (linkIndex === index) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    revealActiveLink(sectionLinks[index]);
  }

  function updateActiveSection() {
    if (sections.length === 0) { return; }

    var focusLine = Math.min(window.innerHeight * .32, 300);
    var latestTop = -Infinity;
    var nextIndex = 0;

    sections.forEach(function (section, index) {
      var top = section.getBoundingClientRect().top;
      if (top <= focusLine && top > latestTop + 1) {
        latestTop = top;
        nextIndex = index;
      }
    });

    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      nextIndex = sections.length - 1;
    }

    setActiveSection(nextIndex);
  }

  function prepareNavigator() {
    sectionLinks.forEach(function (link, index) {
      if (!sections[index]) { return; }

      link.addEventListener('click', function (event) {
        event.preventDefault();
        sections[index].scrollIntoView({
          behavior: reducedMotion.matches ? 'auto' : 'smooth',
          block: 'start'
        });
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', link.getAttribute('href'));
        }
      });
    });

    setActiveSection(0);
  }

  function updatePage() {
    updateActiveSection();
    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updatePage);
      ticking = true;
    }
  }

  prepareNavigator();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  updatePage();
}());
