import { loadDashboards, saveDashboards } from '@/utils/storage';
import Dashboard from '@/models/dashboard';

const dashboardsModule = {
  namespaced: true,
  state: {
    dashboards: [],
    currentDashboard: null,
  },
  
  getters: {
    getDashboardBySlug: (state) => (slug) => {
      return state.dashboards.find(dashboard => dashboard.slug === slug)
    }
  },
  
  mutations: {
    SET_DASHBOARDS(state, dashboards) {
      state.dashboards = dashboards.map(dashboard => ({
        ...dashboard,
        cards: Array.isArray(dashboard.cards) ? dashboard.cards : []
      }))
    },
    
    SET_CURRENT_DASHBOARD(state, dashboard) {
      if (dashboard) {
        state.currentDashboard = {
          ...dashboard,
          cards: Array.isArray(dashboard.cards) ? dashboard.cards : []
        }
      } else {
        state.currentDashboard = null
      }
    },
    
    ADD_DASHBOARD(state, dashboard) {
      state.dashboards.push({
        ...dashboard,
        cards: Array.isArray(dashboard.cards) ? dashboard.cards : []
      })
      state.currentDashboard = dashboard
    },
    
    UPDATE_DASHBOARD(state, dashboard) {
      const dashboardIndex = state.dashboards.findIndex(d => d.id === dashboard.id)
      if (dashboardIndex !== -1) {
        state.dashboards[dashboardIndex] = {
          ...dashboard,
          cards: Array.isArray(dashboard.cards) ? dashboard.cards : []
        }
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
        // Ensure we have a proper cards array
        const cards = Array.isArray(dashboardData.cards) ? dashboardData.cards : []
        
        // If dashboardData already has all required properties, create a new object with guaranteed cards array
        if (dashboardData.id && dashboardData.name && dashboardData.description && dashboardData.slug) {
          const dashboard = {
            ...dashboardData,
            cards: cards
          }
          commit('ADD_DASHBOARD', dashboard)
          dispatch('saveDashboards')
          resolve(dashboard)
          return
        }
        
        // Otherwise create a new Dashboard with provided data
        const newDashboard = new Dashboard(
          dashboardData.id || Date.now().toString(),
          dashboardData.name,
          dashboardData.description,
          dashboardData.slug,
          dashboardData.theme,
          cards
        )
        
        commit('ADD_DASHBOARD', newDashboard)
        dispatch('saveDashboards')
        resolve(newDashboard)
      })
    },
    
    updateDashboard({ commit, dispatch }, dashboard) {
      return new Promise((resolve) => {
        // Ensure cards array exists
        const updatedDashboard = {
          ...dashboard,
          cards: Array.isArray(dashboard.cards) ? dashboard.cards : []
        }
        
        commit('SET_CURRENT_DASHBOARD', updatedDashboard)
        commit('UPDATE_DASHBOARD', updatedDashboard)
        dispatch('saveDashboards')
        resolve(updatedDashboard)
      })
    },
    
    deleteDashboard({ state, commit, dispatch }, dashboardId) {
      state.dashboards = state.dashboards.filter(d => d.id !== dashboardId)
      if (state.currentDashboard && state.currentDashboard.id === dashboardId) {
        commit('SET_CURRENT_DASHBOARD', null)
      }
      dispatch('saveDashboards')
    }
  }
};

export default dashboardsModule;