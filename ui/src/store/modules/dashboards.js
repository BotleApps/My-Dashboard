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
      state.dashboards = dashboards
    },
    
    SET_CURRENT_DASHBOARD(state, dashboard) {
      state.currentDashboard = dashboard
    },
    
    ADD_DASHBOARD(state, dashboard) {
      state.dashboards.push(dashboard)
      state.currentDashboard = dashboard
    },
    
    UPDATE_DASHBOARD(state, dashboard) {
      const dashboardIndex = state.dashboards.findIndex(d => d.id === dashboard.id)
      if (dashboardIndex !== -1) {
        state.dashboards[dashboardIndex] = { ...dashboard }
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
        const newDashboard = new Dashboard(
          Date.now().toString(),
          dashboardData.name,
          dashboardData.description,
          dashboardData.slug,
          dashboardData.theme
        );
        
        commit('ADD_DASHBOARD', newDashboard);
        dispatch('saveDashboards');
        resolve(newDashboard);
      });
    },
    
    updateDashboard({ commit, dispatch }, dashboard) {
      return new Promise((resolve) => {
        commit('SET_CURRENT_DASHBOARD', dashboard)
        commit('UPDATE_DASHBOARD', dashboard)
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
    }
  }
};

export default dashboardsModule;