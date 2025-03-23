<template>
  <div 
    :class="['card', cardClasses]" 
    :style="cardStyle"
    :draggable="isDraggable"
    :data-card-id="card && card.id"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div class="card-header">
      <h3 class="card-title">{{ cardTitle }}</h3>
      <p class="card-description">{{ cardDescription }}</p>
      
      <!-- Drag handle for metric cards -->
      <div v-if="isDraggable" class="card-drag-handle" :class="{ 'hidden-handle': !isHovered }">
        <i class="fas fa-grip-horizontal"></i>
      </div>
      <div v-if="isDeletable" class="card-delete-button" :class="{ 'hidden-handle': !isHovered }" @click="deleteCard(card.id)">
        <i class="fas fa-trash-alt"></i>
      </div>
      <div v-if="isEditable" class="card-settings-button" :class="{ 'hidden-handle': !isHovered }" @click="openSettingsModal(card)">
        <i class="fas fa-cog"></i>
      </div>
    </div>
    
    <!-- For dashboard cards (dashboard selector) -->
    <div v-if="isDashboardCard" class="card-content dashboard-card-content">
      <div class="dashboard-bottom-row">
        <div class="dashboard-stats">
          <div class="stat">
            <i class="fas fa-chart-line"></i>
            <span>{{ cardCount }} metrics</span>
          </div>
        </div>
      
      </div>
    </div>
    
    <!-- For metric cards (inside dashboard) -->
    <div v-else class="card-content">
      <div v-if="card.metricType === 'percentage'" class="percentage-value">{{ card.value }}%</div>
      <div v-else-if="card.metricType === 'number'" class="number-value">{{ card.value }}</div>
      <div v-else-if="card.metricType === 'star-rating'" v-html="createStarRating(card.value)" class="star-rating"></div>
      <div v-else-if="card.metricType === 'word-list'" class="word-list">
        <span v-for="(word, index) in card.value" :key="index">{{ word }}</span>
      </div>
      <div v-else-if="card.metricType === 'text'" class="text-value">{{ card.value }}</div>
      <div v-else-if="card.metricType === '10star-rating'" v-html="create10StarRating(card.value)" class="star-rating"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardCard',
  props: {
    dashboard: {
      type: Object,
      default: null
    },
    card: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      isHovered: false,
      themeNumbers: Array.from({ length: 10 }, (_, i) => i + 1) // [1,2,3,...,10]
    }
  },
  computed: {
    isDashboardCard() {
      return this.dashboard !== null
    },
    isDraggable() {
      return !this.isDashboardCard
    },
    isDeletable() {
      return !this.isDashboardCard
    },
    isEditable() {
      return !this.isDashboardCard
    },
    cardTitle() {
      return this.isDashboardCard ? this.dashboard.name : this.card.title
    },
    cardDescription() {
      return this.isDashboardCard ? this.dashboard.description : this.card.description
    },
    cardCount() {
      if (this.isDashboardCard && this.dashboard.cards) {
        return this.dashboard.cards.length
      }
      return 0
    },
    cardClasses() {
      const classes = []
      
      if (this.isDashboardCard) {
        classes.push('dashboard-card', 'w1', 'h1')
        // Use stored theme for dashboard cards, or default to theme-1
        const theme = this.dashboard.theme || '1'
        classes.push(`theme-${theme}`)
      } else {
        // For metric cards
        if (this.card.width) classes.push(`w${this.card.width}`)
        if (this.card.height) classes.push(`h${this.card.height}`)
        if (this.card.theme) {
          classes.push(`theme-${this.card.theme}`)
        } else {
          // Default to theme-1 if no theme specified
          classes.push('theme-1')
        }
      }
      
      return classes
    },
    cardStyle() {
      return {} // No inline styles needed as we're using CSS variables
    }
  },
  methods: {
    createStarRating(rating) {
      let stars = ''
      const fullStars = Math.floor(rating)
      const hasHalfStar = rating % 1 >= 0.5
      const displayRating = rating.toFixed(2)
      
      for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
          stars += '<i class="fas fa-star"></i>'
        } else if (i === fullStars && hasHalfStar) {
          stars += '<i class="fas fa-star-half-alt"></i>'
        } else {
          stars += '<i class="far fa-star"></i>'
        }
      }
      
      return `${stars}<span class="star-value">${displayRating}/5</span>`
    },
    create10StarRating(rating) {
      let stars = ''
      const fullStars = Math.floor(rating)
      const hasHalfStar = rating % 1 >= 0.5
      const displayRating = rating.toFixed(2)
      
      for (let i = 0; i < 10; i++) {
        if (i < fullStars) {
          stars += '<i class="fas fa-star"></i>'
        } else if (i === fullStars && hasHalfStar) {
          stars += '<i class="fas fa-star-half-alt"></i>'
        } else {
          stars += '<i class="far fa-star"></i>'
        }
      }
      
      return `${stars}<span class="star-value">${displayRating}/10</span>`
    },
    openSettingsModal(card) {
      this.$emit('open-settings', card)
    },
    deleteCard(cardId) {
      if (confirm('Are you sure you want to delete this card?')) {
        this.$emit('delete-card', cardId)
      }
    },
    handleDragStart(event) {
      if (!this.isDraggable) return;
      
      // Add dragging class for visual feedback
      event.target.classList.add('dragging');
      
      // Set data for the drag operation
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', this.card.id);
      
      try {
        // Calculate where the mouse is within the card
        const rect = event.target.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        
        // Set the drag image with the correct offset
        event.dataTransfer.setDragImage(event.target, offsetX, offsetY);
      } catch (err) {
        console.warn('Could not set drag image:', err);
      }
      
      // Pass the card directly to the parent as a second parameter
      this.$emit('dragstart', event, this.card);
    },
    handleDragEnd(event) {
      // Remove dragging class
      event.target.classList.remove('dragging');
      
      // Forward the event to parent
      this.$emit('dragend', event);
    }
  },
  mounted() {
    // Add hover event listeners for drag handle visibility
    if (this.$el && !this.isDashboardCard) {
      this.$el.addEventListener('mouseenter', () => {
        this.isHovered = true
      })
      this.$el.addEventListener('mouseleave', () => {
        this.isHovered = false
      })
    }
  },
  beforeUnmount() {
    // Clean up event listeners
    if (this.$el && !this.isDashboardCard) {
      this.$el.removeEventListener('mouseenter', () => {
        this.isHovered = true
      })
      this.$el.removeEventListener('mouseleave', () => {
        this.isHovered = false
      })
    }
  }
}
</script>

<style>
@import '../../assets/css/colors.css';

/* Theme-based card styles */
.card {
  --card-bg: var(--theme-1-bg);
  --card-highlight: var(--theme-1-highlight);
  --card-text: var(--theme-1-text);
  --btn-primary-bg: var(--theme-1-btn-primary-bg);
  --btn-primary-text: var(--theme-1-btn-primary-text);
  --btn-secondary-bg: var(--theme-1-btn-secondary-bg);
  --btn-secondary-text: var(--theme-1-btn-secondary-text);
  --stat-bg: var(--theme-1-stat-bg);
  --stat-text: var(--theme-1-stat-text);
}

/* Generate theme classes */
.card.theme-1 {
  --card-bg: var(--theme-1-bg);
  --card-highlight: var(--theme-1-highlight);
  --card-text: var(--theme-1-text);
  --btn-primary-bg: var(--theme-1-btn-primary-bg);
  --btn-primary-text: var(--theme-1-btn-primary-text);
  --btn-secondary-bg: var(--theme-1-btn-secondary-bg);
  --btn-secondary-text: var(--theme-1-btn-secondary-text);
  --stat-bg: var(--theme-1-stat-bg);
  --stat-text: var(--theme-1-stat-text);
}

.card.theme-2 {
  --card-bg: var(--theme-2-bg);
  --card-highlight: var(--theme-2-highlight);
  --card-text: var(--theme-2-text);
  --btn-primary-bg: var(--theme-2-btn-primary-bg);
  --btn-primary-text: var(--theme-2-btn-primary-text);
  --btn-secondary-bg: var(--theme-2-btn-secondary-bg);
  --btn-secondary-text: var(--theme-2-btn-secondary-text);
  --stat-bg: var(--theme-2-stat-bg);
  --stat-text: var(--theme-2-stat-text);
}

.card.theme-3 {
  --card-bg: var(--theme-3-bg);
  --card-highlight: var(--theme-3-highlight);
  --card-text: var(--theme-3-text);
  --btn-primary-bg: var(--theme-3-btn-primary-bg);
  --btn-primary-text: var(--theme-3-btn-primary-text);
  --btn-secondary-bg: var(--theme-3-btn-secondary-bg);
  --btn-secondary-text: var(--theme-3-btn-secondary-text);
  --stat-bg: var(--theme-3-stat-bg);
  --stat-text: var(--theme-3-stat-text);
}

.card.theme-4 {
  --card-bg: var(--theme-4-bg);
  --card-highlight: var(--theme-4-highlight);
  --card-text: var(--theme-4-text);
  --btn-primary-bg: var(--theme-4-btn-primary-bg);
  --btn-primary-text: var(--theme-4-btn-primary-text);
  --btn-secondary-bg: var(--theme-4-btn-secondary-bg);
  --btn-secondary-text: var(--theme-4-btn-secondary-text);
  --stat-bg: var(--theme-4-stat-bg);
  --stat-text: var(--theme-4-stat-text);
}

.card.theme-5 {
  --card-bg: var(--theme-5-bg);
  --card-highlight: var(--theme-5-highlight);
  --card-text: var(--theme-5-text);
  --btn-primary-bg: var(--theme-5-btn-primary-bg);
  --btn-primary-text: var(--theme-5-btn-primary-text);
  --btn-secondary-bg: var(--theme-5-btn-secondary-bg);
  --btn-secondary-text: var(--theme-5-btn-secondary-text);
  --stat-bg: var(--theme-5-stat-bg);
  --stat-text: var(--theme-5-stat-text);
}

.card.theme-6 {
  --card-bg: var(--theme-6-bg);
  --card-highlight: var(--theme-6-highlight);
  --card-text: var(--theme-6-text);
  --btn-primary-bg: var(--theme-6-btn-primary-bg);
  --btn-primary-text: var(--theme-6-btn-primary-text);
  --btn-secondary-bg: var(--theme-6-btn-secondary-bg);
  --btn-secondary-text: var(--theme-6-btn-secondary-text);
  --stat-bg: var(--theme-6-stat-bg);
  --stat-text: var(--theme-6-stat-text);
}

.card.theme-7 {
  --card-bg: var(--theme-7-bg);
  --card-highlight: var(--theme-7-highlight);
  --card-text: var(--theme-7-text);
  --btn-primary-bg: var(--theme-7-btn-primary-bg);
  --btn-primary-text: var(--theme-7-btn-primary-text);
  --btn-secondary-bg: var(--theme-7-btn-secondary-bg);
  --btn-secondary-text: var(--theme-7-btn-secondary-text);
  --stat-bg: var(--theme-7-stat-bg);
  --stat-text: var(--theme-7-stat-text);
}

.card.theme-8 {
  --card-bg: var(--theme-8-bg);
  --card-highlight: var(--theme-8-highlight);
  --card-text: var(--theme-8-text);
  --btn-primary-bg: var(--theme-8-btn-primary-bg);
  --btn-primary-text: var(--theme-8-btn-primary-text);
  --btn-secondary-bg: var(--theme-8-btn-secondary-bg);
  --btn-secondary-text: var(--theme-8-btn-secondary-text);
  --stat-bg: var(--theme-8-stat-bg);
  --stat-text: var(--theme-8-stat-text);
}

.card.theme-9 {
  --card-bg: var(--theme-9-bg);
  --card-highlight: var(--theme-9-highlight);
  --card-text: var(--theme-9-text);
  --btn-primary-bg: var(--theme-9-btn-primary-bg);
  --btn-primary-text: var(--theme-9-btn-primary-text);
  --btn-secondary-bg: var(--theme-9-btn-secondary-bg);
  --btn-secondary-text: var(--theme-9-btn-secondary-text);
  --stat-bg: var(--theme-9-stat-bg);
  --stat-text: var(--theme-9-stat-text);
}

.card.theme-10 {
  --card-bg: var(--theme-10-bg);
  --card-highlight: var(--theme-10-highlight);
  --card-text: var(--theme-10-text);
  --btn-primary-bg: var(--theme-10-btn-primary-bg);
  --btn-primary-text: var(--theme-10-btn-primary-text);
  --btn-secondary-bg: var(--theme-10-btn-secondary-bg);
  --btn-secondary-text: var(--theme-10-btn-secondary-text);
  --stat-bg: var(--theme-10-stat-bg);
  --stat-text: var(--theme-10-stat-text);
}

/* Apply theme variables to card elements */
.card {
  background-color: var(--card-bg);
  border-left: 4px solid var(--card-highlight);
}

.card-title {
  color: var(--card-text);
}

.card .percentage-value,
.card .number-value {
  color: var(--card-text);
}

.card .star-rating {
  color: var(--card-highlight);
}

.card .star-value {
  color: var(--card-text);
}

.card .word-list span {
  background-color: var(--btn-primary-bg);
  color: var(--btn-primary-text);
}

.card .stat {
  background-color: var(--stat-bg);
  color: var(--stat-text);
}

.dashboard-open-btn {
  background-color: var(--btn-secondary-bg);
  color: var(--btn-secondary-text);
}

.dashboard-open-btn:hover {
  background-color: var(--btn-primary-bg);
  color: var(--btn-primary-text);
}

.card-drag-handle,
.card-delete-button,
.card-settings-button {
  position: absolute;
  top: 8px;  /* Reduced from 10px */
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.08);
  width: 28px;  /* Reduced from 30px */
  height: 28px;  /* Reduced from 30px */
  opacity: 0;
  transition: opacity 0.2s ease, background-color 0.2s ease;
  z-index: 10;
}

.card-drag-handle {
  right: 8px;  /* Reduced from 10px */
  cursor: grab;
}

.card-delete-button {
  right: 44px;  /* Adjusted spacing */
}

.card-settings-button {
  right: 80px;  /* Adjusted spacing */
}

.card:hover .card-delete-button {
  opacity: 1;
}
.card-delete-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}
.card-delete-button:active {
  background-color: rgba(0, 0, 0, 0.15);
}

.card:hover .card-settings-button {
  opacity: 1;
}
.card-settings-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}
.card-settings-button:active {
  background-color: rgba(0, 0, 0, 0.15);
}

.card:hover .card-drag-handle {
  opacity: 1;
}

.card-drag-handle:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.card-drag-handle:active {
  cursor: grabbing;
  background-color: rgba(0, 0, 0, 0.15);
}

.card-drag-handle.hidden-handle {
  opacity: 0;
  pointer-events: none;
}

/* Add drag-specific styles */
.card[draggable=true] {
  cursor: grab;
}

.card.dragging {
  opacity: 0.6;
  cursor: grabbing;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
  z-index: 100;
}

/* Add drop target indicator styles */
.card.drop-target {
  box-shadow: 0 0 0 2px var(--primary-color);
  transform: translateY(-2px);
}

.percentage-value,
.number-value {
  font-size: 2.25rem;  /* Reduced from 2.5rem */
}

.star-rating {
  font-size: 1.25rem;  /* Reduced from 1.5rem */
}

.word-list span {
  padding: 0.2rem 0.6rem;  /* Reduced from 0.25rem 0.75rem */
  margin: 0.2rem;  /* Reduced from 0.25rem */
}

.dashboard-card .card-title {
  -webkit-line-clamp: 2;
  line-height: 1.3;
  max-height: 2.6em;
}

.dashboard-card .card-description {
  -webkit-line-clamp: 3;
  line-height: 1.4;
  max-height: 4.2em;
  margin-bottom: 0.5rem;
}
</style>