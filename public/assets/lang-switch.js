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
        location.reload();
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

  function boot() {
    mark(initialCode());
    var hasApp = document.getElementById('upload')
      || document.getElementById('download')
      || document.getElementById('admin');
    if (hasApp) return;
    var baseEl = document.querySelector('base');
    var base = baseEl ? baseEl.href : '/';
    var url = base + 'lang.json';
    if (window.PSITRANSFER_LANG && SUPPORTED[window.PSITRANSFER_LANG]) {
      url += '?lang=' + encodeURIComponent(window.PSITRANSFER_LANG);
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    if (window.PSITRANSFER_LANG && SUPPORTED[window.PSITRANSFER_LANG]) {
      xhr.setRequestHeader('Accept-Language', window.PSITRANSFER_LANG);
    }
    xhr.onload = function () {
      if (xhr.status !== 200) return;
      try { apply(JSON.parse(xhr.responseText)); } catch (err) {}
    };
    xhr.send();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}());
