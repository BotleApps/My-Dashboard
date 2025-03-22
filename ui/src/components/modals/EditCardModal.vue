<template>
  <div class="modal show">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Edit Card</h3>
        <span class="close-modal" @click="$emit('close')">&times;</span>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="card-title">Title</label>
            <input type="text" id="card-title" v-model="formData.title" required>
          </div>
          <div class="form-group">
            <label for="card-description">Description</label>
            <textarea id="card-description" v-model="formData.description" required></textarea>
          </div>
          <div class="form-group">
            <label for="metric-type">Metric Type</label>
            <select id="metric-type" v-model="formData.metricType" @change="updateMetricFields" required>
              <option value="">Select a type</option>
              <option value="percentage">Percentage</option>
              <option value="number">Number</option>
              <option value="star-rating">Star Rating</option>
              <option value="word-list">List of Words</option>
              <option value="text">Text</option>
              <option value="10star-rating">10 Star Rating</option>
            </select>
          </div>
          <!-- Dynamic fields based on metric type -->
          <div v-if="formData.metricType === 'percentage'" class="form-group">
            <label for="percentage-value">Percentage Value</label>
            <input type="number" id="percentage-value" v-model.number="formData.value" min="0" max="100" required>
          </div>
          <div v-else-if="formData.metricType === 'number'" class="form-group">
            <label for="number-value">Number Value</label>
            <input type="number" id="number-value" v-model.number="formData.value" required>
          </div>
          <div v-else-if="formData.metricType === 'star-rating'" class="form-group">
            <label for="star-value">Star Rating (0-5)</label>
            <input type="number" id="star-value" v-model.number="formData.value" min="0" max="5" step="0.01" required>
            <small>You can enter up to two decimal places (e.g., 4.36)</small>
          </div>
          <div v-else-if="formData.metricType === 'word-list'" class="form-group">
            <label for="word-list">Words (comma separated)</label>
            <input type="text" id="word-list" v-model="wordListInput" placeholder="word1, word2, word3" required>
          </div>
          <div v-else-if="formData.metricType === 'text'" class="form-group">
            <label for="text-value">Text Value</label>
            <input type="text" id="text-value" v-model="formData.value" required>
          </div>
          <div v-else-if="formData.metricType === '10star-rating'" class="form-group">
            <label for="10star-value">10 Star Rating (0-10)</label>
            <input type="number" id="10star-value" v-model.number="formData.value" min="0" max="10" step="0.01" required>
            <small>You can enter up to two decimal places (e.g., 8.75)</small>
          </div>
          <!-- Card Layout Options -->
          <div class="form-section">
            <h4>Card Layout and Theme</h4>
            <div class="form-group">
              <label for="card-theme">Card Theme</label>
              <div class="color-palette">
                <div v-for="theme in themes" :key="theme.value" :style="{ backgroundColor: theme.color }" @click="selectTheme(theme.value)" :class="{ selected: theme.value === formData.theme }" class="color-box"></div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group half">
                <label for="card-width">Width (1-5 columns)</label>
                <select id="card-width" v-model.number="formData.width">
                  <option value="1">1 Column</option>
                  <option value="2">2 Columns</option>
                  <option value="3" selected>3 Columns</option>
                  <option value="4">4 Columns</option>
                  <option value="5">5 Columns</option>
                </select>
              </div>
              <div class="form-group half">
                <label for="card-height">Height (1-4 rows)</label>
                <select id="card-height" v-model.number="formData.height">
                  <option value="1" selected>1 Row</option>
                  <option value="2">2 Rows</option>
                  <option value="3">3 Rows</option>
                  <option value="4">4 Rows</option>
                </select>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn primary">Save Changes</button>
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

export default {
  name: 'EditCardModal',
  props: {
    card: {
      type: Object,
      required: true
    }
  },
  data() {
    // Create default empty card if not provided
    const defaultFormData = {
      title: '',
      description: '',
      metricType: '',
      value: null,
      width: 3,
      height: 1,
      theme: '1'
    };
    
    // Only spread the card properties if the card exists
    const formData = this.card ? { ...defaultFormData, ...this.card } : defaultFormData;
    
    return {
      formData,
      wordListInput: this.card && this.card.metricType === 'word-list' && Array.isArray(this.card.value) 
        ? this.card.value.join(', ') 
        : '',
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
      updateCard: 'cards/updateCard'
    }),
    updateMetricFields() {
      // Reset value when metric type changes
      this.formData.value = null
      this.wordListInput = ''
    },
    handleSubmit() {
      try {
        if (!this.currentDashboard) {
          throw new Error('No dashboard selected')
        }
        if (!this.formData.title || !this.formData.metricType) {
          throw new Error('Title and metric type are required')
        }
        // Process value based on metric type
        if (this.formData.metricType === 'percentage') {
          const value = this.formData.value
          if (isNaN(value) || value < 0 || value > 100) {
            throw new Error('Percentage must be a number between 0 and 100')
          }
        } else if (this.formData.metricType === 'number') {
          if (isNaN(this.formData.value)) {
            throw new Error('Please enter a valid number')
          }
        } else if (this.formData.metricType === 'star-rating') {
          const value = this.formData.value
          if (isNaN(value) || value < 0 || value > 5) {
            throw new Error('Star rating must be between 0 and 5')
          }
          // Restrict to two decimal places
          this.formData.value = Math.round(value * 100) / 100
        } else if (this.formData.metricType === 'word-list') {
          // Process comma-separated words
          const words = this.wordListInput
            .split(',')
            .map(word => word.trim())
            .filter(word => word.length > 0)
          if (words.length === 0) {
            throw new Error('Please enter at least one word')
          }
          this.formData.value = words
        } else if (this.formData.metricType === '10star-rating') {
          const value = this.formData.value
          if (isNaN(value) || value < 0 || value > 10) {
            throw new Error('10 Star rating must be between 0 and 10')
          }
          // Restrict to two decimal places
          this.formData.value = Math.round(value * 100) / 100
        } else if (this.formData.metricType === 'text') {
          if (!this.formData.value) {
            throw new Error('Text value cannot be empty')
          }
        }
        // Update the card
        this.updateCard({ cardId: this.card.id, cardData: this.formData })
        // Close the modal
        this.$emit('close')
      } catch (error) {
        alert(error.message)
      }
    },
    selectTheme(theme) {
      this.formData.theme = theme
    }
  }
}
</script>

<style scoped>
@import '../../assets/css/colors.css';

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
</style>
