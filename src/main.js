import Vue from 'vue'
import App from './App.vue'

import './img/favicon.ico'
import './img/android-chrome-192x192.png'
import './img/apple-touch-icon.png'
import './img/favicon-16x16.png'
import './img/favicon-32x32.png'
import './img/mstile-150x150.png'
import './img/safari-pinned-tab.svg'

import './scss/main.scss'

if (document.getElementById('app'))
  new Vue({
    el: '#app',
    render: h => h(App)
  })
