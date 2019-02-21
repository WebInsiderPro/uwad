// Import Vue
import Vue from 'vue'
import App from './App.vue'


// Import framework javascript libraries
import { MainNavigation, YT, AutoExpandTextarea, Declension, Ripple } from './modules/uwad.js'

// Import static files
import './img/apple-touch-icon.png'
import './img/favicon-32x32.png'
import './img/favicon-16x16.png'
import './img/site.webmanifest'
import './img/safari-pinned-tab.svg'
import './img/favicon.ico'
import './img/browserconfig.xml'
import './img/mstile-150x150.png'
import './img/android-chrome-192x192.png'
import './img/android-chrome-512x512.png'
import './img/share.jpg'


// Import styles
import './scss/main.scss'


// These imports are needed to automatically reload page after changes saved
// Templates
import '../templates/base.html'
// Blog Templates
import '../blog/templates/blog/home.html'


// Vue components initialize
if (document.getElementById('app'))
  new Vue({
    el: '#app',
    render: h => h(App)
  })



