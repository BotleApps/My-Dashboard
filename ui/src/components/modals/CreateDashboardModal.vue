<template>
  <div class="modal show">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Create New Dashboard</h3>
        <span class="close-modal" @click="$emit('close')">&times;</span>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="dashboard-name">Dashboard Name</label>
            <input type="text" id="dashboard-name" v-model="name" required maxlength="50">
            <span v-if="name.length > 50" class="error">Name cannot exceed 50 characters</span>
          </div>
          <div class="form-group">
            <label for="dashboard-desc">Description</label>
            <textarea id="dashboard-desc" v-model="description" required maxlength="200"></textarea>
            <span v-if="description.length > 200" class="error">Description cannot exceed 200 characters</span>
          </div>
          <div class="form-group">
            <label for="dashboard-theme">Dashboard Theme</label>
            <div class="color-palette">
              <div v-for="theme in themes" :key="theme.value" :style="{ backgroundColor: theme.color }" @click="selectTheme(theme.value)" :class="{ selected: theme.value === selectedTheme }" class="color-box"></div>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn primary" :disabled="name.length > 50 || description.length > 200">Create Dashboard</button>
            <button type="button" class="btn secondary" @click="$emit('close')">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { themes } from '@/constants/themes'

export default {
  name: 'CreateDashboardModal',
  data() {
    return {
      name: '',
      description: '',
      selectedTheme: '1',
      themes
    }
  },
  methods: {
    ...mapActions(['createDashboard']),
    generateSlug(text) {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    },
    async handleSubmit() {
      if (this.name.length > 50 || this.description.length > 200) {
        return
      }
      try {
        const slug = this.generateSlug(this.name)
        await this.createDashboard({
          name: this.name,
          description: this.description,
          slug,
          theme: this.selectedTheme
        })
        this.name = ''
        this.description = ''
        this.selectedTheme = '1'
        this.$emit('close')
        this.$router.push({
          name: 'Dashboard',
          params: { dashboardSlug: slug }
        })
      } catch (error) {
        console.error('Error creating dashboard:', error)
      }
    },
    selectTheme(theme) {
      this.selectedTheme = theme
    }
  },
  mounted() {
    console.log('CreateDashboardModal mounted')
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

.error {
  color: red;
  font-size: 0.875rem;
}
</style>