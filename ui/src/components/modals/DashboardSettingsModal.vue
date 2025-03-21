<template>
  <div class="modal show">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Edit Dashboard</h3>
        <span class="close-modal" @click="$emit('close')">&times;</span>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="dashboard-name">Dashboard Name</label>
            <input type="text" id="dashboard-name" v-model="formData.name" required maxlength="50">
            <span v-if="formData.name.length > 50" class="error">Name cannot exceed 50 characters</span>
          </div>
          <div class="form-group">
            <label for="dashboard-desc">Description</label>
            <textarea id="dashboard-desc" v-model="formData.description" required maxlength="200"></textarea>
            <span v-if="formData.description.length > 200" class="error">Description cannot exceed 200 characters</span>
          </div>
          <div class="form-group">
            <label for="dashboard-theme">Dashboard Theme</label>
            <div class="color-palette">
              <div v-for="theme in themes" :key="theme.value" :style="{ backgroundColor: theme.color }" @click="selectTheme(theme.value)" :class="{ selected: theme.value === formData.theme }" class="color-box"></div>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn primary" :disabled="formData.name.length > 50 || formData.description.length > 200">Save Changes</button>
            <button type="button" class="btn danger" @click="confirmDelete">Delete Dashboard</button>
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
  name: 'EditDashboardModal',
  data() {
    return {
      formData: {
        name: '',
        description: '',
        theme: 0
      },
      themes
    }
  },
  computed: {
    ...mapState(['currentDashboard'])
  },
  methods: {
    ...mapActions(['updateDashboard', 'deleteDashboard']),
    async handleSubmit() {
      if (this.formData.name.length > 50 || this.formData.description.length > 200) {
        console.log('Validation failed')
        return
      }
      try {
        await this.updateDashboard({
          id: this.currentDashboard.id,
          slug: this.currentDashboard.slug,
          name: this.formData.name,
          description: this.formData.description,
          theme: this.formData.theme,
          cards: this.currentDashboard.cards // Retain existing cards
        })
        this.$emit('close')
      } catch (error) {
        console.error('Error updating dashboard:', error)
      }
    },
    confirmDelete() {
      if (confirm('Are you sure you want to delete this dashboard? This action cannot be undone.')) {
        this.deleteDashboard(this.currentDashboard.id)
          .then(() => {
            this.$emit('close')
            this.$router.push({ name: 'Home' })
          })
          .catch(error => {
            console.error('Error deleting dashboard:', error)
          })
      }
    },
    selectTheme(theme) {
      this.formData.theme = theme
    }
  },
  created() {
    // Initialize form data with current dashboard values
    if (this.currentDashboard) {
      this.formData = {
        name: this.currentDashboard.name,
        description: this.currentDashboard.description,
        theme: this.currentDashboard.theme || 0
      }
    }
  },
  mounted() {
    console.log('EditDashboardModal mounted')
  }
}
</script>

<style scoped>
@import '../../assets/css/colors.css';

.btn.danger {
  background-color: #dc3545;
  color: white;
}

.btn.danger:hover {
  background-color: #c82333;
}

.color-palette {
  display: flex;
  gap: 0.5rem;
}

.color-palette div {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
}

.color-palette div.selected {
  border-color: #000;
}

.error {
  color: red;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
</style>