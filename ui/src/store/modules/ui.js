const uiModule = {
  namespaced: true,
  state: () => ({
    showCreateDashboardModal: false,
    showAddCardModal: false,
    showSettingsModal: false,
    showEditCardModal: false,
    isDarkMode: false
  }),
  
  getters: {
    currentTheme: state => state.isDarkMode ? 'dark' : 'light'
  },
  
  mutations: {
    SET_SHOW_CREATE_DASHBOARD_MODAL(state, value) {
      state.showCreateDashboardModal = value
    },
    
    SET_SHOW_ADD_CARD_MODAL(state, value) {
      state.showAddCardModal = value
    },
    
    SET_SHOW_SETTINGS_MODAL(state, value) {
      state.showSettingsModal = value
    },
    
    SET_SHOW_EDIT_CARD_MODAL(state, value) {
      state.showEditCardModal = value
    },
    
    SET_DARK_MODE(state, value) {
      state.isDarkMode = value
      document.documentElement.setAttribute('data-theme', value ? 'dark' : 'light')
      localStorage.setItem('darkMode', value)
    }
  },
  
  actions: {
    initializeTheme({ commit }) {
      const savedTheme = localStorage.getItem('darkMode')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const isDarkMode = savedTheme !== null ? savedTheme === 'true' : prefersDark
      commit('SET_DARK_MODE', isDarkMode)
    },
    
    toggleTheme({ commit, state }) {
      commit('SET_DARK_MODE', !state.isDarkMode)
    }
  }
}

export default uiModule