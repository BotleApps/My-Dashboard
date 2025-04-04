import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/dashboard/:dashboardSlug',
    name: 'Dashboard',
    component: DashboardView,
    props: true
  }
]

const router = createRouter({
  // Using hash mode for GitHub Pages compatibility
  history: createWebHashHistory(),
  routes
})

export default router