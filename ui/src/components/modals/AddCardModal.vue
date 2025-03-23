<template>
  <div class="modal show">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Add New Metric</h3>
        <span class="close-modal" @click="$emit('close')">&times;</span>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitCard">
          <div class="form-group">
            <label for="card-title">Title</label>
            <input type="text" id="card-title" v-model="cardData.title" required>
            <small>Title will be wrapped after 2 lines</small>
          </div>
          <div class="form-group">
            <label for="card-description">Description</label>
            <textarea id="card-description" v-model="cardData.description" required></textarea>
            <small>Description will be wrapped after 3 lines</small>
          </div>
          <div class="form-group">
            <label for="metric-type">Metric Type</label>
            <select id="metric-type" v-model="cardData.metricType" @change="updateMetricFields" required>
              <option value="">Select a type</option>
              <option value="text">Text</option>
              <option value="percentage">Percentage</option>
              <option value="number">Number</option>              
              <option value="word-list">List of Words</option>              
              <option value="star-rating">5 Star Rating</option>
              <option value="10star-rating">10 Star Rating</option>
            </select>
          </div>
          
          <!-- Dynamic fields based on metric type -->
          <div v-if="cardData.metricType === 'percentage'" class="form-group">
            <label for="percentage-value">Percentage Value</label>
            <input type="number" id="percentage-value" v-model.number="cardData.value" min="0" max="100" required>
          </div>
          
          <div v-else-if="cardData.metricType === 'number'" class="form-group">
            <label for="number-value">Number Value</label>
            <input type="number" id="number-value" v-model.number="cardData.value" required>
          </div>
          
          <div v-else-if="cardData.metricType === 'star-rating'" class="form-group">
            <label for="star-value">Star Rating (0-5)</label>
            <input type="number" id="star-value" v-model.number="cardData.value" min="0" max="5" step="0.01" required>
            <small>You can enter up to two decimal places (e.g., 4.36)</small>
          </div>
          
          <div v-else-if="cardData.metricType === 'word-list'" class="form-group">
            <label for="word-list">Words (comma separated)</label>
            <input type="text" id="word-list" v-model="wordListInput" placeholder="word1, word2, word3" required>
          </div>

          <div v-else-if="cardData.metricType === 'text'" class="form-group">
            <label for="text-value">Text Value</label>
            <input type="text" id="text-value" v-model="cardData.value" required>
          </div>
          <div v-else-if="cardData.metricType === '10star-rating'" class="form-group">
            <label for="10star-value">10 Star Rating (0-10)</label>
            <input type="number" id="10star-value" v-model.number="cardData.value" min="0" max="10" step="0.01" required>
            <small>You can enter up to two decimal places (e.g., 8.75)</small>
          </div>
          
          <!-- Card Layout Options -->
          <div class="form-section">
            <h4>Card Layout and Theme</h4>
            <div class="form-group">
              <label for="card-theme">Card Theme</label>
              <div class="color-palette">
                <div v-for="theme in themes" :key="theme.value" :style="{ backgroundColor: theme.color }" @click="selectTheme(theme.value)" :class="{ selected: theme.value === cardData.theme }" class="color-box"></div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label for="card-width">Width (1-5 columns)</label>
                <select id="card-width" v-model.number="cardData.width">
                  <option value="1">1 Column</option>
                  <option value="2">2 Columns</option>
                  <option value="3" selected>3 Columns</option>
                  <option value="4">4 Columns</option>
                  <option value="5">5 Columns</option>
                </select>
              </div>
              <div class="form-group half">
                <label for="card-height">Height (1-4 rows)</label>
                <select id="card-height" v-model.number="cardData.height">
                  <option value="1" selected>1 Row</option>
                  <option value="2">2 Rows</option>
                  <option value="3">3 Rows</option>
                  <option value="4">4 Rows</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn primary">Add Metric</button>
            <button type="button" class="btn secondary" @click="$emit('close')">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { themes } from '@/constants/themes'
import Card from '@/models/card';
import { generateUniqueId } from '@/utils/idGenerator';

export default {
  name: 'AddCardModal',
  data() {
    return {
      cardData: {
        title: '',
        description: '',
        metricType: '',
        value: null,
        width: 3,
        height: 1,
        color: 'default',
        theme: '1' // Default to theme 1
      },
      wordListInput: '',
      themes
    }
  },
  computed: {
    ...mapState({
      currentDashboard: state => state.dashboards.currentDashboard
    })
  },
  methods: {
    ...mapActions({
      addCard: 'cards/addCard'
    }),
    updateMetricFields() {
      // Reset value when metric type changes
      this.cardData.value = null
      this.wordListInput = ''
    },
    submitCard() {
      try {
        if (!this.currentDashboard) {
          throw new Error('No dashboard selected')
        }
        
        if (!this.cardData.title || !this.cardData.metricType) {
          throw new Error('Title and metric type are required')
        }
        
        // Process value based on metric type
        if (this.cardData.metricType === 'percentage') {
          const value = this.cardData.value
          if (isNaN(value) || value < 0 || value > 100) {
            throw new Error('Percentage must be a number between 0 and 100')
          }
        } else if (this.cardData.metricType === 'number') {
          if (isNaN(this.cardData.value)) {
            throw new Error('Please enter a valid number')
          }
        } else if (this.cardData.metricType === 'star-rating') {
          const value = this.cardData.value
          if (isNaN(value) || value < 0 || value > 5) {
            throw new Error('Star rating must be between 0 and 5')
          }
          // Restrict to two decimal places
          this.cardData.value = Math.round(value * 100) / 100
        } else if (this.cardData.metricType === 'word-list') {
          // Process comma-separated words
          const words = this.wordListInput
            .split(',')
            .map(word => word.trim())
            .filter(word => word.length > 0)
            
          if (words.length === 0) {
            throw new Error('Please enter at least one word')
          }
          
          this.cardData.value = words
        } else if (this.cardData.metricType === '10star-rating') {
          const value = this.cardData.value
          if (isNaN(value) || value < 0 || value > 10) {
            throw new Error('10 Star rating must be between 0 and 10')
          }
          // Restrict to two decimal places
          this.cardData.value = Math.round(value * 100) / 100
        } else if (this.cardData.metricType === 'text') {
          if (!this.cardData.value) {
            throw new Error('Text value cannot be empty')
          }
        }
        
        // Create new card instance
        const newCard = new Card(
          generateUniqueId(),
          this.cardData.title,
          this.cardData.description,
          this.cardData.metricType,
          this.cardData.value,
          this.cardData.width,
          this.cardData.height,
          this.cardData.theme
        );
        
        // Add the card without using Promise chaining
        this.addCard(newCard);
        
        // Reset form and close modal
        this.resetForm();
        this.$emit('close');
        
      } catch (error) {
        alert(error.message)
      }
    },
    resetForm() {
      this.cardData = {
        title: '',
        description: '',
        metricType: '',
        value: null,
        width: 3,
        height: 1,
        color: 'default',
        theme: '1'
      }
      this.wordListInput = ''
    },
    selectTheme(theme) {
      this.cardData.theme = theme
    }
  }
}
</script>

<style scoped>
@import '../../assets/css/colors.css';

/* Modal-specific styles can go here */

/* Add preview styles for theme selection */
.color-palette {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.color-box {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
}

.color-box.selected {
  border-color: #000;
}

.form-group {
    margin-bottom: 1.25rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.form-group small {
    display: block;
    color: var(--text-secondary);
    font-size: 0.75rem;
    margin-top: 0.25rem;
}

/* Add after the title input */
#card-title + small {
    content: "Title will be wrapped after 2 lines";
}

/* Add after the description textarea */
#card-description + small {
    content: "Description will be wrapped after 3 lines";
}
</style>