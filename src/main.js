import Vue from 'vue'
import App from './App'
import 'babel-polyfill'
import router from './router'
import fastclick from 'fastclick'
import VueLazyLoad from 'vue-lazyload'
import store from './store'
fastclick.attach(document.body)
// import router from './router'

import 'common/stylus/index.styl'
Vue.use(VueLazyLoad, {
    loading: require('common/image/load.gif')
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router,
  store
})
