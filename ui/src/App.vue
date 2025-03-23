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

    <!-- Modals are registered here but managed by modalService -->
    <CreateDashboardModal v-if="isModalOpen('createDashboardModal')" @close="closeModal('createDashboardModal')" />
    <AddCardModal v-if="isModalOpen('addCardModal')" @close="closeModal('addCardModal')" />
    <DashboardSettingsModal v-if="isModalOpen('settingsModal')" @close="closeModal('settingsModal')" />
    <!-- Edit card modal is now managed in DashboardView.vue -->
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import CreateDashboardModal from './components/modals/CreateDashboardModal.vue'
import AddCardModal from './components/modals/AddCardModal.vue'
import DashboardSettingsModal from './components/modals/DashboardSettingsModal.vue'
import { useModalService } from '@/services/modalService';

export default {
  name: 'App',
  components: {
    CreateDashboardModal,
    AddCardModal,
    DashboardSettingsModal
  },
  computed: {
    ...mapState({
      dashboards: state => state.dashboards.dashboards,
      currentDashboard: state => state.dashboards.currentDashboard
    }),
    selectedDashboard() {
      return this.$route.params.dashboardSlug || ''
    }
  },
  data() {
    return {
      currentCard: null
    }
  },
  setup() {
    const { openModal, closeModal, isModalOpen } = useModalService();
    return {
      openModal,
      closeModal,
      isModalOpen
    };
  },
  methods: {
    ...mapActions({
      loadDashboards: 'dashboards/loadDashboards'
    }),
    
    onDashboardChange(event) {
      const slug = event.target.value
      if (slug) {
        this.$router.push({ name: 'Dashboard', params: { dashboardSlug: slug } })
      } else {
        this.$router.push({ name: 'Home' })
      }
    },
    
    openCreateDashboardModal() {
      this.openModal('createDashboardModal')
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