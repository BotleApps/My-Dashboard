import { createStore } from 'vuex'
import { loadDashboards, saveDashboards } from '@/utils/storage';

export default createStore({
  state: {
    dashboards: [],
    currentDashboard: null,
    showCreateDashboardModal: false,
    showAddCardModal: false,
    showSettingsModal: false,
    showEditCardModal: false
  },
  getters: {
    getDashboardBySlug: (state) => (slug) => {
      return state.dashboards.find(dashboard => dashboard.slug === slug)
    }
  },
  mutations: {
    SET_DASHBOARDS(state, dashboards) {
      state.dashboards = dashboards
    },
    SET_CURRENT_DASHBOARD(state, dashboard) {
      state.currentDashboard = dashboard
    },
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
    ADD_DASHBOARD(state, dashboard) {
      state.dashboards.push(dashboard)
      state.currentDashboard = dashboard
    },
    ADD_CARD(state, card) {
      if (state.currentDashboard) {
        if (!state.currentDashboard.cards) {
          state.currentDashboard.cards = []
        }
        state.currentDashboard.cards.push(card)
        // Also update the card in the dashboards array
        const dashboardIndex = state.dashboards.findIndex(d => d.id === state.currentDashboard.id)
        if (dashboardIndex !== -1) {
          state.dashboards[dashboardIndex] = { ...state.currentDashboard }
        }
      }
    },
    UPDATE_CARDS_ORDER(state, { dashboardIndex, cards }) {
      state.dashboards[dashboardIndex].cards = cards
      // Update current dashboard if it's the one being modified
      if (state.currentDashboard && state.dashboards[dashboardIndex].id === state.currentDashboard.id) {
        state.currentDashboard.cards = cards
      }
    }
  },
  actions: {
    loadDashboards({ commit }) {
      const dashboards = loadDashboards();
      commit('SET_DASHBOARDS', dashboards);
    },
    loadDashboard({ commit, getters }, slug) {
      const dashboard = getters.getDashboardBySlug(slug)
      commit('SET_CURRENT_DASHBOARD', dashboard)
    },
    saveDashboards({ state }) {
      saveDashboards(state.dashboards);
    },
    createDashboard({ commit, dispatch }, dashboardData) {
      return new Promise((resolve) => {
        const newDashboard = {
          id: Date.now().toString(),
          name: dashboardData.name,
          description: dashboardData.description,
          slug: dashboardData.slug,
          cards: [],
          theme: dashboardData.theme || '1'
        }
        
        commit('ADD_DASHBOARD', newDashboard)
        dispatch('saveDashboards')
        resolve(newDashboard)
      })
    },
    
    addCard({ commit, dispatch }, cardData) {
      const newCard = {
        id: Date.now().toString(),
        ...cardData
      }
      
      commit('ADD_CARD', newCard)
      dispatch('saveDashboards')
      return true
    },
    
    updateCardsOrder({ commit, dispatch }, { dashboardIndex, cards }) {
      commit('UPDATE_CARDS_ORDER', { dashboardIndex, cards })
      dispatch('saveDashboards')
    },
    updateDashboard({ state, commit, dispatch }, dashboard) {
      return new Promise((resolve) => {
        commit('SET_CURRENT_DASHBOARD', dashboard)
        const dashboardIndex = state.dashboards.findIndex(d => d.id === dashboard.id)
        if (dashboardIndex !== -1) {
          state.dashboards[dashboardIndex] = { ...dashboard }
        }
        dispatch('saveDashboards')
        resolve(dashboard)
      })
    },
    deleteDashboard({ state, commit, dispatch }, dashboardId) {
      state.dashboards = state.dashboards.filter(d => d.id !== dashboardId)
      if (state.currentDashboard && state.currentDashboard.id === dashboardId) {
        commit('SET_CURRENT_DASHBOARD', null)
      }
      dispatch('saveDashboards')
    },
    deleteCard({ state, dispatch }, cardId) {
      const dashboardIndex = state.dashboards.findIndex(d => d.id === state.currentDashboard.id)
      if (dashboardIndex !== -1) {
        const cardIndex = state.dashboards[dashboardIndex].cards.findIndex(c => c.id === cardId)
        if (cardIndex !== -1) {
          state.dashboards[dashboardIndex].cards.splice(cardIndex, 1)
          dispatch('saveDashboards')
        }
      }
    }
  }
})