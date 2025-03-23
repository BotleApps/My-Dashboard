import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'

const routes = [
  {
    path: '/my-dashboard',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/my-dashboard/dashboard/:dashboardSlug',
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