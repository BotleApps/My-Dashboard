<template>
  <div :class="['dashboard-header', themeClass]">
    <div class="dashboard-info">
      <h2>{{ dashboard ? dashboard.name : 'Loading...' }}</h2>
      <p>{{ dashboard ? dashboard.description : '' }}</p>
    </div>
    <div class="dashboard-settings">
      <button @click="openSettingsModal" class="btn icon">
        <i class="fas fa-cog"></i>
      </button>
    </div>
  </div>

  <div class="dashboard-actions">
    <button @click="openAddCardModal" class="btn primary">
      <i class="fas fa-plus"></i> Add Card
    </button>
  </div>

  <div class="cards-container" ref="cardsContainer">
    <div v-if="!dashboard || !dashboard.cards || !dashboard.cards.length" class="empty-state">
      <i class="fas fa-chart-bar"></i>
      <p>No cards yet. Add a card to get started!</p>
    </div>
    
    <DashboardCard 
      v-else
      v-for="card in dashboard.cards" 
      :key="card.id" 
      :card="card"
      draggable
      @dragstart="onDragStart($event, card)"
      @dragend="onDragEnd"
      @dragover.prevent
      @drop.prevent="onDrop($event, card)"
    />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import DashboardCard from '@/components/DashboardCard.vue'

export default {
  name: 'DashboardView',
  components: {
    DashboardCard
  },
  props: {
    dashboardSlug: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      draggedCard: null,
      draggedIndex: null
    }
  },
  computed: {
    ...mapState(['dashboards', 'currentDashboard']),
    ...mapGetters(['getDashboardBySlug']),
    dashboard() {
      return this.getDashboardBySlug(this.dashboardSlug)
    },
    dashboardIndex() {
      return this.dashboards.findIndex(d => d.slug === this.dashboardSlug)
    },
    themeClass() {
      const theme = this.dashboard ? this.dashboard.theme : '1'
      return `theme-${theme}`
    }
  },
  methods: {
    ...mapActions(['loadDashboard', 'updateCardsOrder']),
    ...mapMutations(['SET_SHOW_ADD_CARD_MODAL', 'SET_SHOW_SETTINGS_MODAL', 'SET_CURRENT_DASHBOARD']),
    
    openAddCardModal() {
      // Set the current dashboard before opening modal
      this.SET_CURRENT_DASHBOARD(this.dashboard)
      this.SET_SHOW_ADD_CARD_MODAL(true)
    },
    
    openSettingsModal() {
      // Set the current dashboard before opening modal
      this.SET_CURRENT_DASHBOARD(this.dashboard)
      this.SET_SHOW_SETTINGS_MODAL(true)
    },
    
    onDragStart(event, card) {
      this.draggedCard = card
      this.draggedIndex = this.dashboard.cards.indexOf(card)
      event.target.classList.add('dragging')
      
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', card.id)
      
      try {
        event.dataTransfer.setDragImage(event.target, 20, 20)
      } catch (err) {
        console.warn('Could not set drag image:', err)
      }
    },
    
    onDragEnd(event) {
      event.target.classList.remove('dragging')
      this.draggedCard = null
      this.draggedIndex = null
    },
    
    onDrop(event, targetCard) {
      if (!this.draggedCard) return

      const cards = [...this.dashboard.cards]
      const currentIndex = this.draggedIndex
      const targetIndex = cards.indexOf(targetCard)
      
      if (currentIndex !== targetIndex) {
        cards.splice(currentIndex, 1)
        cards.splice(targetIndex, 0, this.draggedCard)
        
        this.updateCardsOrder({
          dashboardIndex: this.dashboardIndex,
          cards
        })
      }
    }
  },
  created() {
    // Set current dashboard when component is created
    if (this.dashboard) {
      this.SET_CURRENT_DASHBOARD(this.dashboard)
    }
    this.loadDashboard(this.dashboardSlug)
  },
  watch: {
    dashboardSlug(newSlug) {
      this.loadDashboard(newSlug)
      const dashboard = this.getDashboardBySlug(newSlug)
      if (dashboard) {
        this.SET_CURRENT_DASHBOARD(dashboard)
      }
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/colors.css';

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  position: relative;
}

.dashboard-info {
  flex: 1;
}

.dashboard-settings {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.btn.icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: inherit;
}

.theme-1 { background-color: var(--theme-1-bg); color: var(--theme-1-text); }
.theme-2 { background-color: var(--theme-2-bg); color: var(--theme-2-text); }
.theme-3 { background-color: var(--theme-3-bg); color: var(--theme-3-text); }
.theme-4 { background-color: var(--theme-4-bg); color: var(--theme-4-text); }
.theme-5 { background-color: var(--theme-5-bg); color: var(--theme-5-text); }
.theme-6 { background-color: var(--theme-6-bg); color: var(--theme-6-text); }
.theme-7 { background-color: var(--theme-7-bg); color: var(--theme-7-text); }
.theme-8 { background-color: var(--theme-8-bg); color: var(--theme-8-text); }
.theme-9 { background-color: var(--theme-9-bg); color: var(--theme-9-text); }
.theme-10 { background-color: var(--theme-10-bg); color: var(--theme-10-text); }
</style>