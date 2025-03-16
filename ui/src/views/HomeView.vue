<template>
  <div class="dashboard-info">
    <h2>Welcome to My Dashboard</h2>
    <p>A customizable space to visualize your metrics and data.</p>
  </div>
  
  <div class="cards-container">
    <div v-if="!dashboards.length" class="empty-state">
      <i class="fas fa-chart-line"></i>
      <h3>Get Started with Your First Dashboard</h3>
      <p>Create a dashboard to start organizing your metrics and visualizations in one place.</p>
      <button @click="openCreateDashboardModal" class="btn primary">
        <i class="fas fa-plus"></i> Create Your First Dashboard
      </button>
    </div>
    
    <DashboardCard 
      v-else
      v-for="dashboard in dashboards" 
      :key="dashboard.id" 
      :dashboard="dashboard" 
      @click="navigateToDashboard(dashboard)" 
    />
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import DashboardCard from '@/components/DashboardCard.vue'

export default {
  name: 'HomeView',
  components: {
    DashboardCard
  },
  computed: {
    ...mapState(['dashboards'])
  },
  methods: {
    ...mapMutations(['SET_SHOW_CREATE_DASHBOARD_MODAL']),
    navigateToDashboard(dashboard) {
      this.$router.push({ 
        name: 'Dashboard', 
        params: { dashboardSlug: dashboard.slug || this.generateSlug(dashboard.name) }
      })
    },
    generateSlug(text) {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    },
    openCreateDashboardModal() {
      this.SET_SHOW_CREATE_DASHBOARD_MODAL(true)
    }
  }
}
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem;
}

.empty-state i {
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.empty-state .btn {
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
}
</style>