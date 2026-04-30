(function () {
  var valid = { en: true, zh: true };
  var menus = document.querySelectorAll('[data-home-lang-menu]');
  var toggles = document.querySelectorAll('[data-home-lang-toggle]');
  var optionButtons = document.querySelectorAll('[data-home-lang-value]');
  var localized = document.querySelectorAll('.navigation [data-home-lang], .home-language-switch [data-home-lang], .article-list--home-lang [data-home-lang]');
  var currentLang = null;

  if (!menus.length && !optionButtons.length && !localized.length) {
    return;
  }

  function getInitialLang() {
    return valid[document.documentElement.getAttribute('lang')] ? document.documentElement.getAttribute('lang') : 'en';
  }

  function applyLang(lang) {
    lang = valid[lang] ? lang : 'en';
    document.documentElement.setAttribute('data-home-lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.lang = lang;

    optionButtons.forEach(function (button) {
      var active = button.getAttribute('data-home-lang-value') === lang;
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    localized.forEach(function (node) {
      node.hidden = node.getAttribute('data-home-lang') !== lang;
    });
    currentLang = lang;
  }

  function closeMenus() {
    menus.forEach(function (menu) {
      var options = menu.querySelector('[data-home-lang-options]');
      var toggle = menu.querySelector('[data-home-lang-toggle]');
      if (options) {
        options.hidden = true;
      }
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  toggles.forEach(function (toggle) {
    toggle.addEventListener('click', function (event) {
      var menu = toggle.closest('[data-home-lang-menu]');
      var options = menu ? menu.querySelector('[data-home-lang-options]') : null;
      if (!options) {
        return;
      }
      event.stopPropagation();
      var willOpen = options.hidden;
      closeMenus();
      options.hidden = !willOpen;
      toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });

  optionButtons.forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      applyLang(button.getAttribute('data-home-lang-value'));
      closeMenus();
    });
  });

  document.addEventListener('click', closeMenus);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMenus();
    }
  });

  applyLang(getInitialLang());

  if (window.MutationObserver) {
    new MutationObserver(function () {
      var lang = getInitialLang();
      if (lang !== currentLang) {
        applyLang(lang);
      }
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang']
    });
  }
})();
