<template>
  <div class="app-container">
    <header>
      <div class="logo">
        <i class="fas fa-chart-line"></i>
        <router-link to="/" class="home-link">
          <h1>My Dashboard</h1>
        </router-link>
      </div>
      <div class="dashboard-controls">
        <select :value="selectedDashboard" @change="onDashboardChange">
          <option value="">Select Dashboard</option>
          <option v-for="dashboard in dashboards" :key="dashboard.id" :value="dashboard.slug">
            {{ dashboard.name }}
          </option>
        </select>
        <button @click="openCreateDashboardModal" class="btn primary">+ New Dashboard</button>
      </div>
    </header>

    <main>
      <router-view />
    </main>

    <!-- Modals are registered here but managed by Vuex state -->
    <CreateDashboardModal v-if="showCreateDashboardModal" @close="closeCreateDashboardModal" />
    <AddCardModal v-if="showAddCardModal" @close="closeAddCardModal" />
    <DashboardSettingsModal v-if="showSettingsModal" @close="closeSettingsModal" />
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import CreateDashboardModal from './components/modals/CreateDashboardModal.vue'
import AddCardModal from './components/modals/AddCardModal.vue'
import DashboardSettingsModal from './components/modals/DashboardSettingsModal.vue'

export default {
  name: 'App',
  components: {
    CreateDashboardModal,
    AddCardModal,
    DashboardSettingsModal
  },
  computed: {
    ...mapState(['dashboards', 'showCreateDashboardModal', 'showAddCardModal', 'showSettingsModal']),
    selectedDashboard() {
      return this.$route.params.dashboardSlug || ''
    }
  },
  methods: {
    ...mapActions(['loadDashboards']),
    ...mapMutations(['SET_SHOW_CREATE_DASHBOARD_MODAL', 'SET_SHOW_ADD_CARD_MODAL', 'SET_SHOW_SETTINGS_MODAL']),
    
    onDashboardChange(event) {
      const slug = event.target.value
      if (slug) {
        this.$router.push({ name: 'Dashboard', params: { dashboardSlug: slug } })
      } else {
        this.$router.push({ name: 'Home' })
      }
    },
    
    openCreateDashboardModal() {
      this.SET_SHOW_CREATE_DASHBOARD_MODAL(true)
    },
    
    closeCreateDashboardModal() {
      this.SET_SHOW_CREATE_DASHBOARD_MODAL(false)
    },
    
    openAddCardModal() {
      this.SET_SHOW_ADD_CARD_MODAL(true)
    },
    
    closeAddCardModal() {
      this.SET_SHOW_ADD_CARD_MODAL(false)
    },

    openSettingsModal() {
      this.SET_SHOW_SETTINGS_MODAL(true)
    },

    closeSettingsModal() {
      this.SET_SHOW_SETTINGS_MODAL(false)
    }
  },
  created() {
    this.loadDashboards()
  }
}
</script>

<style>
/* Move your existing global styles to assets/css/styles.css */
/* You can also add component-specific styles here */

/* Add styles for the home link */
.home-link {
  text-decoration: none;
  color: inherit;
}

.home-link:hover {
  opacity: 0.8;
}
</style>