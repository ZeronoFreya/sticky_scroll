import 'normalize.css'
import './assets/main.css'

import 'highlight.js/styles/atom-one-dark.css'

import StickyScroll from '../lib/sticky_scroll/index.vue'

import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App).component('StickyScroll', StickyScroll).mount('#app')
