import "regenerator-runtime/runtime.js";

import Vue from 'vue';
import Upload from './Upload.vue';
import store from './Upload/store.js';
import Icon from 'vue-awesome/components/Icon'
import { installLanguage } from "./common/i18n";

Vue.component('icon', Icon);

new Vue({
  el: '#upload',
  data: {
    baseURI: document.head.getElementsByTagName('base')[0].href.replace(/\/$/),
    configFetched: false,
    lang: {},
    langReady: false,
  },
  store,
  render: h => h(Upload),
  created() {
    installLanguage((dict) => {
      this.lang = dict;
      this.$store.commit('LANG', dict);
      this.langReady = true;
      if (window.psitransferApplyLang) window.psitransferApplyLang(dict);
    });

    // Fetch config. The password panel is already in the chosen language.
    this.$store.dispatch('config/fetch').catch((e) => {
      if (e.code !== 'PWDREQ') console.error(e);
    }).then(() => {
      this.configFetched = true;
    });
  }
});

window.PSITRANSFER_VERSION = PSITRANSFER_VERSION;
