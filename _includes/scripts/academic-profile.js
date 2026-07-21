(function () {
  var profile = document.querySelector('[data-academic-profile]');
  if (!profile) { return; }

  var desktop = window.matchMedia('(min-width: 1024px)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var navigator = profile.querySelector('[data-academic-navigator]');
  var sectionLabel = profile.querySelector('[data-academic-section-label]');
  var sectionCurrent = profile.querySelector('[data-academic-section-current]');
  var sectionTotal = profile.querySelector('[data-academic-section-total]');
  var markerContainer = profile.querySelector('[data-academic-section-markers]');
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-academic-section]'));
  var markers = [];
  var activeSectionIndex = -1;
  var lastScrollY = Math.max(window.scrollY, 0);
  var travel = 0;
  var lastDirection = 0;
  var ticking = false;

  function twoDigits(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function setExpanded() {
    profile.classList.remove('is-compact');
  }

  function setActiveSection(index) {
    if (!navigator || index === activeSectionIndex || !sections[index]) { return; }

    activeSectionIndex = index;
    sectionLabel.textContent = sections[index].getAttribute('data-academic-section');
    sectionCurrent.textContent = twoDigits(index + 1);

    markers.forEach(function (marker, markerIndex) {
      marker.classList.toggle('is-past', markerIndex < index);
      marker.classList.toggle('is-active', markerIndex === index);
      if (markerIndex === index) {
        marker.setAttribute('aria-current', 'location');
      } else {
        marker.removeAttribute('aria-current');
      }
    });

    if (!reducedMotion.matches && sectionLabel.animate) {
      sectionLabel.animate([
        { opacity: .2, transform: 'translate3d(.5rem, 0, 0)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0)' }
      ], {
        duration: 280,
        easing: 'cubic-bezier(.22, 1, .36, 1)'
      });
    }
  }

  function updateActiveSection() {
    if (!navigator || sections.length === 0) { return; }

    var focusLine = Math.min(window.innerHeight * .38, 360);
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

  function buildNavigator() {
    if (!navigator || !markerContainer || sections.length === 0) { return; }

    sectionTotal.textContent = twoDigits(sections.length);
    sections.forEach(function (section, index) {
      var label = section.getAttribute('data-academic-section');
      var marker = document.createElement('button');
      marker.type = 'button';
      marker.className = 'academic-profile__section-marker';
      marker.setAttribute('aria-label', 'Go to ' + label);
      marker.title = label;
      marker.addEventListener('click', function () {
        section.scrollIntoView({
          behavior: reducedMotion.matches ? 'auto' : 'smooth',
          block: 'start'
        });
      });
      markerContainer.appendChild(marker);
      markers.push(marker);
    });

    navigator.hidden = false;
    setActiveSection(0);
  }

  function updateProfile() {
    var scrollY = Math.max(window.scrollY, 0);
    var delta = scrollY - lastScrollY;
    var direction = delta === 0 ? 0 : delta > 0 ? 1 : -1;

    if (!desktop.matches || scrollY < 96) {
      setExpanded();
      travel = 0;
      lastDirection = direction;
    } else if (direction !== 0) {
      if (direction !== lastDirection) {
        travel = 0;
      }

      travel += Math.abs(delta);
      if (travel >= 24) {
        profile.classList.toggle('is-compact', direction > 0);
        travel = 0;
      }
      lastDirection = direction;
    }

    updateActiveSection();
    lastScrollY = scrollY;
    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updateProfile);
      ticking = true;
    }
  }

  buildNavigator();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });

  if (desktop.addEventListener) {
    desktop.addEventListener('change', requestUpdate);
  } else {
    desktop.addListener(requestUpdate);
  }

  updateProfile();
}());
