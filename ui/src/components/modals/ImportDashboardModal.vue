<template>
  <div class="modal show">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Import Dashboard</h3>
        <span class="close-modal" @click="$emit('close')">&times;</span>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleImport">
          <div class="form-group">
            <label for="dashboard-file">Select Dashboard JSON File</label>
            <input 
              type="file" 
              id="dashboard-file" 
              accept=".json,application/json" 
              @change="handleFileChange" 
              required
            >
            <p class="import-hint">
              Select a previously exported dashboard JSON file to import.
            </p>
          </div>
          
          <div v-if="fileContent" class="import-preview">
            <h4>Preview:</h4>
            <div class="preview-data">
              <p><strong>Name:</strong> {{ parsedData.name }}</p>
              <p><strong>Description:</strong> {{ parsedData.description }}</p>
              <p><strong>Cards:</strong> {{ parsedData.cards ? parsedData.cards.length : 0 }} items</p>
            </div>
            
            <div class="form-group">
              <label>
                <input type="checkbox" v-model="createNew">
                Import as a new dashboard (will create a copy)
              </label>
            </div>
          </div>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn primary" 
              :disabled="!fileContent || loading"
            >
              <i class="fas fa-file-import"></i> 
              {{ loading ? 'Importing...' : 'Import Dashboard' }}
            </button>
            <button type="button" class="btn secondary" @click="$emit('close')">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { generateSlug } from '@/utils/slugify';

export default {
  name: 'ImportDashboardModal',
  data() {
    return {
      fileContent: null,
      parsedData: {},
      error: null,
      loading: false,
      createNew: true
    };
  },
  methods: {
    ...mapActions({
      createDashboard: 'dashboards/createDashboard',
      updateDashboard: 'dashboards/updateDashboard'
    }),
    
    handleFileChange(event) {
      const file = event.target.files[0];
      if (!file) {
        this.fileContent = null;
        this.parsedData = {};
        this.error = null;
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          this.fileContent = e.target.result;
          this.parsedData = JSON.parse(this.fileContent);
          
          // Basic validation
          if (!this.parsedData.name || !this.parsedData.description) {
            this.error = 'Invalid dashboard file format. Missing required fields.';
            return;
          }
          
          this.error = null;
        } catch (err) {
          this.error = 'Failed to parse JSON file. Please select a valid dashboard export file.';
          this.fileContent = null;
          this.parsedData = {};
        }
      };
      
      reader.onerror = () => {
        this.error = 'Error reading file. Please try again.';
      };
      
      reader.readAsText(file);
    },
    
    async handleImport() {
      if (!this.fileContent || this.loading) return;
      
      this.loading = true;
      this.error = null;
      
      try {
        if (this.createNew) {
          // Create a new dashboard with the imported data
          const newDashboard = { 
            ...this.parsedData,
            // Ensure we preserve the cards array
            cards: Array.isArray(this.parsedData.cards) ? [...this.parsedData.cards] : []
          };
          
          // Generate a new ID and slug
          newDashboard.id = Date.now().toString();
          
          // Append "copy" to the name and regenerate the slug
          newDashboard.name = `${newDashboard.name} (Copy)`;
          newDashboard.slug = generateSlug(newDashboard.name);
          
          await this.createDashboard(newDashboard);
          
          // Navigate to the new dashboard
          this.$router.push({ 
            name: 'Dashboard', 
            params: { dashboardSlug: newDashboard.slug }
          });
        } else {
          // Update existing dashboard
          const updatedDashboard = {
            ...this.parsedData,
            // Ensure we preserve the cards array
            cards: Array.isArray(this.parsedData.cards) ? [...this.parsedData.cards] : []
          };
          
          await this.updateDashboard(updatedDashboard);
          
          // Refresh the current view
          window.location.reload();
        }
        
        this.$emit('close');
      } catch (err) {
        this.error = `Import failed: ${err.message}`;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.import-hint {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.import-preview {
  margin: 1rem 0;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: var(--border-radius);
}

.preview-data {
  margin: 0.5rem 0;
}

.preview-data p {
  margin: 0.25rem 0;
}

.error-message {
  padding: 0.75rem;
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
}
</style>