// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue/dist/vue.esm.browser.min.js'
import MandMobile from "mand-mobile";
import "mand-mobile/lib-vw/mand-mobile.css";
import VeeValidate from "vee-validate";
import App from "./App";

Vue.config.productionTip = false;

Vue.use(MandMobile);
Vue.use(VeeValidate);

/* eslint-disable no-new */
new Vue({
  el: "#app",
  components: { App },
  template: "<App/>"
});