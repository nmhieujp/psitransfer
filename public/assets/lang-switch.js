/* Language switch shared by every page. Choice is stored in localStorage.
   A matching cookie lets the server render the same language on the next request.
   No choice yet: the server keeps using the browser Accept-Language header. */
(function () {
  var KEY = 'psitransfer.lang';
  var SUPPORTED = { en: 1, ja: 1, vi: 1 };

  function mark(code) {
    var buttons = document.querySelectorAll('.lang-switch-btn');
    for (var i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute('data-lang') === code;
      if (on) buttons[i].classList.add('is-active');
      else buttons[i].classList.remove('is-active');
      buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function apply(dict) {
    if (!dict) return;
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-i18n');
      if (key && dict[key]) nodes[i].textContent = dict[key];
    }
    if (dict.langCode) {
      document.documentElement.lang = dict.langCode;
      mark(dict.langCode);
    }
  }

  window.psitransferApplyLang = apply;

  document.addEventListener('click', function (e) {
    var node = e.target;
    while (node && node !== document) {
      if (node.classList && node.classList.contains('lang-switch-btn')) {
        var lang = node.getAttribute('data-lang');
        if (!SUPPORTED[lang]) return;
        try { localStorage.setItem(KEY, lang); } catch (err) {}
        document.cookie = 'psitransfer_lang=' + lang + '; Path=/; Max-Age=31536000; SameSite=Lax';
        window.PSITRANSFER_LANG = lang;
        document.documentElement.lang = lang;
        mark(lang);
        var bundled = window.PSITRANSFER_DICTS && window.PSITRANSFER_DICTS[lang];
        if (bundled && window.psitransferApplyLang) window.psitransferApplyLang(bundled);
        else loadPack(lang);
        try {
          window.dispatchEvent(new CustomEvent('psitransfer-lang', { detail: lang }));
        } catch (err2) {
          var legacy = document.createEvent('CustomEvent');
          legacy.initCustomEvent('psitransfer-lang', false, false, lang);
          window.dispatchEvent(legacy);
        }
        return;
      }
      node = node.parentNode;
    }
  });

  function initialCode() {
    if (window.PSITRANSFER_LANG && SUPPORTED[window.PSITRANSFER_LANG]) return window.PSITRANSFER_LANG;
    var htmlLang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    if (htmlLang.indexOf('ja') === 0) return 'ja';
    if (htmlLang.indexOf('vi') === 0) return 'vi';
    if (htmlLang.indexOf('en') === 0) return 'en';
    return '';
  }

  function assetUrl(code) {
    var baseEl = document.querySelector('base');
    var base = baseEl ? baseEl.href : '/';
    return base + 'assets/i18n/' + code + '.json';
  }

  function loadPack(code) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', assetUrl(code));
    xhr.onload = function () {
      if (xhr.status !== 200) return;
      try { apply(JSON.parse(xhr.responseText)); } catch (err) {}
    };
    xhr.send();
  }

  function boot() {
    mark(initialCode());
    if (window.PSITRANSFER_LANG && SUPPORTED[window.PSITRANSFER_LANG]) {
      var bundled = window.PSITRANSFER_DICTS && window.PSITRANSFER_DICTS[window.PSITRANSFER_LANG];
      if (bundled) apply(bundled);
      else loadPack(window.PSITRANSFER_LANG);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}());
