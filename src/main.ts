import { createApp } from 'vue'
import './css/global.css'
import App from './App.vue'
import { router } from './router'

createApp(App).use(router).mount('#app')
