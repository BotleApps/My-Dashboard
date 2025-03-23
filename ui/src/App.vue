<template>
  <div class="app-container" :data-theme="currentTheme">
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
        <button @click="handleThemeToggle" class="btn theme-toggle" :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <i :class="['fas', isDarkMode ? 'fa-sun' : 'fa-moon']"></i>
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
      currentDashboard: state => state.dashboards.currentDashboard,
      isDarkMode: state => state.ui.isDarkMode
    }),
    selectedDashboard() {
      return this.$route.params.dashboardSlug || ''
    },
    currentTheme() {
      return this.isDarkMode ? 'dark' : 'light'
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
      loadDashboards: 'dashboards/loadDashboards',
      toggleTheme: 'ui/toggleTheme',
      initializeTheme: 'ui/initializeTheme'
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
    },
    
    handleThemeToggle() {
      this.toggleTheme()
    }
  },
  created() {
    this.loadDashboards()
    this.initializeTheme()
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

.theme-toggle {
  background: none;
  border: 1px solid var(--border-color);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background-color: var(--border-color);
  transform: scale(1.1);
}

.theme-toggle i {
  font-size: 1.2rem;
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
  border: 1px solid var(--border-color);
  background-color: var(--card-background);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
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
  background-color: var(--primary-color);
  color: white;
}

.btn.secondary {
  background-color: var(--border-color);
  color: var(--text-color);
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
  background-color: var(--card-background);
  box-shadow: var(--shadow);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  color: var(--primary-color);
}

.logo i {
  color: var(--theme-1-highlight);
}

.app-container {
  transition: background-color 0.3s ease, color 0.3s ease;
  background-color: var(--background-color);
  color: var(--text-color);
}
</style>