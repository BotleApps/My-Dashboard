const uiModule = {
  state: {
    showCreateDashboardModal: false,
    showAddCardModal: false,
    showSettingsModal: false,
    showEditCardModal: false
  },
  
  getters: {},
  
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
    }
  },
  
  actions: {}
};

export default uiModule;