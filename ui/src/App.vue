<template>
  <div class="app-container">
    <header>
      <div class="logo">
        <i class="fas fa-chart-line"></i>
        <router-link to="/" class="home-link">
          <h3>My Dashboard</h3>
        </router-link>
      </div>
      <div class="dashboard-controls">
        <select :value="selectedDashboard" @change="onDashboardChange">
          <option value="">Select Dashboard</option>
          <option v-for="dashboard in dashboards" :key="dashboard.id" :value="dashboard.slug">
            {{ dashboard.name }}
          </option>
        </select>
        <button @click="openImportModal" class="btn secondary">
          <i class="fas fa-file-import"></i> Import Dashboard
        </button>
        <button @click="openCreateDashboardModal" class="btn primary">
          <i class="fas fa-plus"></i> New Dashboard
        </button>
      </div>
    </header>

    <main>
      <router-view />
    </main>

    <!-- Modals are registered here but managed by modalService -->
    <CreateDashboardModal v-if="isModalOpen('createDashboardModal')" @close="closeModal('createDashboardModal')" />
    <AddCardModal v-if="isModalOpen('addCardModal')" @close="closeModal('addCardModal')" />
    <DashboardSettingsModal v-if="isModalOpen('settingsModal')" @close="closeModal('settingsModal')" />
    <ImportDashboardModal v-if="isModalOpen('importDashboardModal')" @close="closeModal('importDashboardModal')" />
    <!-- Edit card modal is now managed in DashboardView.vue -->
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import CreateDashboardModal from './components/modals/CreateDashboardModal.vue'
import AddCardModal from './components/modals/AddCardModal.vue'
import DashboardSettingsModal from './components/modals/DashboardSettingsModal.vue'
import ImportDashboardModal from './components/modals/ImportDashboardModal.vue'
import { useModalService } from '@/services/modalService';

export default {
  name: 'App',
  components: {
    CreateDashboardModal,
    AddCardModal,
    DashboardSettingsModal,
    ImportDashboardModal
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
    },
    
    openImportModal() {
      this.openModal('importDashboardModal')
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

.dashboard-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard-controls select {
  min-width: 200px;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: white;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn.primary {
  background-color: var(--theme-1-btn-primary-bg);
  color: var(--theme-1-btn-primary-text);
}

.btn.secondary {
  background-color: var(--theme-1-btn-secondary-bg);
  color: var(--theme-1-btn-secondary-text);
}

.btn:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
}

.logo i {
  color: var(--theme-1-highlight);
}
</style>