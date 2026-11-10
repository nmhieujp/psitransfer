import en from '../../../lang/en.js';
import ja from '../../../lang/ja.js';
import vi from '../../../lang/vi.js';
import { httpGet } from './util';

function pack(mod) {
  return mod && mod.default && mod.default.langCode ? mod.default : mod;
}

export const DICTS = {
  en: pack(en),
  ja: pack(ja),
  vi: pack(vi),
};

if (typeof window !== 'undefined') {
  window.PSITRANSFER_DICTS = DICTS;
}

function chosenCode() {
  const code = (typeof window !== 'undefined' && window.PSITRANSFER_LANG) || '';
  return DICTS[code] ? code : '';
}

async function dictionary(code) {
  if (code && DICTS[code]) {
    try {
      const remote = await httpGet(
        'lang.json?lang=' + encodeURIComponent(code),
        { 'Accept-Language': code }
      );
      // Ignore a response negotiated from the browser language. A stock
      // server only reads Accept-Language, and some browsers will not let
      // script replace that header, so the body can be the wrong language.
      if (remote && remote.langCode === code) return remote;
    } catch (e) {}
    return DICTS[code];
  }
  return httpGet('lang.json');
}

export function installLanguage(apply) {
  let generation = 0;
  const show = async (code) => {
    const gen = ++generation;
    if (code && DICTS[code]) apply(DICTS[code]);
    try {
      const dict = await dictionary(code);
      if (gen !== generation) return;
      apply(dict);
    } catch (e) {
      if (gen === generation && !(code && DICTS[code])) alert(e);
    }
  };
  show(chosenCode());
  window.addEventListener('psitransfer-lang', (event) => {
    show(event.detail);
  });
}
