<template>
  <div :class="['dashboard-header', themeClass]">
    <div class="dashboard-info">
      <h2 class="text" >{{ dashboard ? dashboard.name : 'Loading...' }}</h2>
      <p class="text">{{ dashboard ? dashboard.description : '' }}</p>
    </div>
    <div class="dashboard-controls">
      <button @click="openSettingsModal" class="btn icon" title="Settings">
        <i class="fas fa-cog"></i>
      </button>
      <button @click="openAddCardModal" class="btn icon" title="Add Metric">
        <i class="fas fa-plus"></i>
      </button>
      <button @click="exportDashboard" class="btn icon" title="Export Dashboard">
        <i class="fas fa-file-export"></i>
      </button>
      <button @click="openImportModal" class="btn icon" title="Import Dashboard">
        <i class="fas fa-file-import"></i>
      </button>
    </div>
  </div>

  <div 
    class="cards-container" 
    ref="cardsContainer"
    @dragover="onContainerDragOver"
    @drop="onContainerDrop"
  >
    <div v-if="!dashboard || !dashboard.cards || !dashboard.cards.length" class="empty-state">
      <i class="fas fa-chart-bar"></i>
      <p>No cards yet. Add a card to get started!</p>
    </div>
    
    <DashboardCard 
      v-else
      v-for="card in dashboard.cards" 
      :key="card.id" 
      :card="card"
      @dragstart="onDragStart"
      @dragend="onDragEnd"
      @delete-card="handleDeleteCard"
      @open-settings="handleOpenSettings"
    />
  </div>

  <EditCardModal 
    v-if="isModalOpen('editCardModal')" 
    :card="currentCard" 
    @close="closeModal('editCardModal')" 
  />

  <ImportDashboardModal 
    v-if="isModalOpen('importDashboardModal')" 
    @close="closeModal('importDashboardModal')" 
  />
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import DashboardCard from '@/components/dashboard/DashboardCard.vue'
import EditCardModal from '@/components/modals/EditCardModal.vue'
import ImportDashboardModal from '@/components/modals/ImportDashboardModal.vue'
import { useModalService } from '@/services/modalService'; // Fix the import path

export default {
  name: 'DashboardView',
  components: {
    DashboardCard,
    EditCardModal,
    ImportDashboardModal
  },
  props: {
    dashboardSlug: {
      type: String,
      required: true
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
  data() {
    return {
      draggedCard: null,
      draggedIndex: null,
      currentCard: null,
      draggedCardId: null
    }
  },
  computed: {
    ...mapState({
      dashboards: state => state.dashboards.dashboards,
      currentDashboard: state => state.dashboards.currentDashboard
    }),
    dashboard() {
      return this.$store.getters['dashboards/getDashboardBySlug'](this.dashboardSlug);
    },
    dashboardIndex() {
      return this.dashboards.findIndex(d => d.slug === this.dashboardSlug);
    },
    themeClass() {
      const theme = this.dashboard ? this.dashboard.theme : '1';
      return `theme-${theme}`;
    }
  },
  methods: {
    ...mapActions({
      loadDashboard: 'dashboards/loadDashboard',
      updateCardsOrder: 'cards/updateCardsOrder',
      deleteCard: 'cards/deleteCard'
    }),
    ...mapMutations({
      SET_CURRENT_DASHBOARD: 'dashboards/SET_CURRENT_DASHBOARD'
    }),
    
    openAddCardModal() {
      // Set the current dashboard before opening modal
      this.SET_CURRENT_DASHBOARD(this.dashboard)
      this.openModal('addCardModal')
    },
    
    openSettingsModal() {
      // Set the current dashboard before opening modal
      this.SET_CURRENT_DASHBOARD(this.dashboard)
      this.openModal('settingsModal')
    },
    
    onDragStart(event, card) {
      console.log('Drag start with card:', card ? card.id : 'undefined', card);
      this.draggedCard = card;
      this.draggedIndex = this.dashboard.cards.indexOf(card);
      
      // Use event to add visual feedback
      event.target.classList.add('dragging');
      
      // Store card ID as fallback mechanism
      if (card && card.id) {
        this.draggedCardId = card.id;
      }
    },
    
    onDragEnd(event) {
      console.log('Drag ended');
      // Use event to remove visual feedback
      event.target.classList.remove('dragging');
      
      // Reset drag state
      this.draggedCard = null;
      this.draggedIndex = -1;
      this.draggedCardId = null;
    },
    
    onDrop(targetCard) {
      if (!this.draggedCard) return;
      
      const cards = [...this.dashboard.cards];
      const currentIndex = this.draggedIndex;
      const targetIndex = cards.indexOf(targetCard);
      
      if (currentIndex !== targetIndex && currentIndex !== -1 && targetIndex !== -1) {
        // Remove the card from the current position
        cards.splice(currentIndex, 1);
        // Add it at the new position
        cards.splice(targetIndex, 0, this.draggedCard);
        
        // Update the store
        this.updateCardsOrder({
          dashboardIndex: this.dashboardIndex,
          cards: cards
        });
      }
    },
    
    onContainerDragOver(event) {
      // Necessary to allow dropping
      event.preventDefault();
      
      // Add a visual indicator for the container as a drop target
      event.currentTarget.classList.add('drag-over');
      
      // Remove any individual card drop-target classes to avoid confusion
      document.querySelectorAll('.card.drop-target').forEach(el => {
        el.classList.remove('drop-target');
      });
    },

    onContainerDrop(event) {
      // Prevent default browser behavior
      event.preventDefault();
      
      // Remove the drag-over class
      event.currentTarget.classList.remove('drag-over');
      
      console.log('Container drop detected', this.draggedCard ? this.draggedCard.id : 'none');
      
      // Get card ID from dataTransfer if available
      const cardId = event.dataTransfer.getData('text/plain');
      console.log('Card ID from dataTransfer:', cardId);
      
      // If draggedCard is not set but we have a card ID from dataTransfer, try to recover
      if (!this.draggedCard && cardId && this.dashboard && this.dashboard.cards) {
        this.draggedCard = this.dashboard.cards.find(c => c.id === cardId);
        if (this.draggedCard) {
          this.draggedIndex = this.dashboard.cards.indexOf(this.draggedCard);
          console.log('Recovered dragged card from ID:', this.draggedCard.id);
        }
      }
      
      // Final check if we have the required data
      if (!this.draggedCard || !this.dashboard || !this.dashboard.cards) {
        console.log('Missing required data for drop, even after recovery attempt');
        return;
      }
      
      // Get the mouse position relative to the container
      const containerRect = this.$refs.cardsContainer.getBoundingClientRect();
      const mouseX = event.clientX - containerRect.left;
      const mouseY = event.clientY - containerRect.top;
      
      // Find the closest card to the drop position
      let closestCard = null;
      let minDistance = Infinity;
      
      // Get all card elements
      const cardElements = Array.from(this.$refs.cardsContainer.querySelectorAll('.card'));
      console.log('Found', cardElements.length, 'card elements');
      
      // Find the closest card to the drop position
      cardElements.forEach(cardEl => {
        const rect = cardEl.getBoundingClientRect();
        const cardX = rect.left + rect.width / 2 - containerRect.left;
        const cardY = rect.top + rect.height / 2 - containerRect.top;
        
        // Calculate distance to card center
        const distance = Math.sqrt(
          Math.pow(mouseX - cardX, 2) + 
          Math.pow(mouseY - cardY, 2)
        );
        
        // Skip the dragged card itself
        const elCardId = cardEl.dataset.cardId;
        if (elCardId === this.draggedCard.id) return;
        
        // Update closest card if this one is closer
        if (distance < minDistance) {
          minDistance = distance;
          closestCard = cardEl;
        }
      });
      
      // If no card was found, append to the end
      if (!closestCard) {
        console.log('No closest card found, moving to end');
        // Move card to the end
        const cards = [...this.dashboard.cards];
        const currentIndex = this.draggedIndex;
        
        // Only proceed if we have a valid index
        if (currentIndex !== -1) {
          // Remove the card from its current position
          cards.splice(currentIndex, 1);
          // Add it to the end
          cards.push(this.draggedCard);
          
          console.log('Updating card order - moving to end');
          // Update the store
          this.updateCardsOrder({
            dashboardIndex: this.dashboardIndex,
            cards: cards
          });
        }
        return;
      }
      
      // Identify the target card from the element
      const targetCardId = closestCard.dataset.cardId;
      console.log('Target card ID:', targetCardId);
      const targetCard = this.dashboard.cards.find(c => c.id === targetCardId);
      
      if (!targetCard) {
        console.log('Target card not found in dashboard');
        return;
      }
      
      // Calculate target position
      const targetIndex = this.dashboard.cards.indexOf(targetCard);
      const cards = [...this.dashboard.cards];
      const currentIndex = this.draggedIndex;
      
      console.log('Current index:', currentIndex, 'Target index:', targetIndex);
      
      // Only proceed if we have valid indices and they're different
      if (currentIndex !== targetIndex && currentIndex !== -1 && targetIndex !== -1) {
        // Remove card from current position
        cards.splice(currentIndex, 1);
        
        // Insert at new position
        cards.splice(targetIndex, 0, this.draggedCard);
        
        console.log('Updating card order - repositioning');
        // Update the store
        this.updateCardsOrder({
          dashboardIndex: this.dashboardIndex,
          cards: cards
        });
      } else {
        console.log('No need to reorder, positions are the same or invalid');
      }
    },
    
    handleOpenSettings(card) {
      this.SET_CURRENT_DASHBOARD(this.dashboard);
      this.currentCard = card;
      this.openModal('editCardModal');
    },

    handleDeleteCard(cardId) {
      this.deleteCard(cardId)
    },
    
    exportDashboard() {
      if (!this.dashboard) return;
      
      // Prepare the JSON data
      const dashboardData = JSON.stringify(this.dashboard, null, 2);
      
      // Create a blob with the data
      const blob = new Blob([dashboardData], { type: 'application/json' });
      
      // Create a temporary URL to the blob
      const url = URL.createObjectURL(blob);
      
      // Create a link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-${this.dashboard.slug}-${new Date().toISOString().slice(0, 10)}.json`;
      
      // Append to the body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Release the blob URL
      URL.revokeObjectURL(url);
    },
    
    openImportModal() {
      this.openModal('importDashboardModal');
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
      // Use the getter from the store instead of trying to call it as a local method
      const dashboard = this.$store.getters['dashboards/getDashboardBySlug'](newSlug)
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

.text {
  color : inherit;
}

.dashboard-controls {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

.btn.icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: inherit;
  padding: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  opacity: 0.4;
}

.btn.icon:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
  opacity: 1;
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

.cards-container.drag-over {
  background-color: rgba(0, 0, 0, 0.05);
  outline: 2px dashed var(--primary-color);
}
</style>