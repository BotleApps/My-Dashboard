import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Import global styles
import './assets/css/styles.css'
import './assets/css/colors.css'

const app = createApp(App)

app.use(store)
app.use(router)

app.mount('#app')