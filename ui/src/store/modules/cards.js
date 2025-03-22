import Card from '@/models/card';

const cardsModule = {
  namespaced: true,
  state: {},
  
  getters: {},
  
  mutations: {
    ADD_CARD(state, { card, dashboards, currentDashboard }) {
      if (currentDashboard) {
        if (!currentDashboard.cards) {
          currentDashboard.cards = [];
        }
        currentDashboard.cards.push(card);
        
        // Update in dashboards array
        const dashboardIndex = dashboards.findIndex(d => d.id === currentDashboard.id);
        if (dashboardIndex !== -1) {
          dashboards[dashboardIndex] = { ...currentDashboard };
        }
      }
    },
    
    UPDATE_CARDS_ORDER(state, { dashboardIndex, cards, dashboards, currentDashboard }) {
      dashboards[dashboardIndex].cards = cards;
      
      // Update current dashboard if it's the one being modified
      if (currentDashboard && dashboards[dashboardIndex].id === currentDashboard.id) {
        currentDashboard.cards = cards;
      }
    },
    
    UPDATE_CARD(state, { cardId, cardData, dashboards, currentDashboard }) {
      if (currentDashboard && currentDashboard.cards) {
        const cardIndex = currentDashboard.cards.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
          // Update the card in the current dashboard
          currentDashboard.cards[cardIndex] = { ...currentDashboard.cards[cardIndex], ...cardData };
          
          // Also update the card in the dashboards array
          const dashboardIndex = dashboards.findIndex(d => d.id === currentDashboard.id);
          if (dashboardIndex !== -1) {
            dashboards[dashboardIndex] = { ...currentDashboard };
          }
        }
      }
    },
    
    DELETE_CARD(state, { cardId, dashboards, currentDashboard }) {
      if (currentDashboard && currentDashboard.cards) {
        const cardIndex = currentDashboard.cards.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
          currentDashboard.cards.splice(cardIndex, 1);
          
          // Also update the card in the dashboards array
          const dashboardIndex = dashboards.findIndex(d => d.id === currentDashboard.id);
          if (dashboardIndex !== -1) {
            dashboards[dashboardIndex] = { ...currentDashboard };
          }
        }
      }
    }
  },
  
  actions: {
    addCard({ commit, rootState, dispatch }, cardData) {
      return new Promise((resolve, reject) => {
        const newCard = new Card(
          Date.now().toString(),
          cardData.title,
          cardData.description,
          cardData.metricType,
          cardData.value,
          cardData.width,
          cardData.height,
          cardData.theme
        );
        
        commit('ADD_CARD', {
          card: newCard,
          dashboards: rootState.dashboards.dashboards,
          currentDashboard: rootState.dashboards.currentDashboard
        });
        
        // Save changes
        dispatch('dashboards/saveDashboards', null, { root: true })
          .then(() => {
            resolve(newCard);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    
    updateCardsOrder({ commit, rootState, dispatch }, { dashboardIndex, cards }) {
      return new Promise((resolve, reject) => {
        try {
          commit('UPDATE_CARDS_ORDER', {
            dashboardIndex,
            cards,
            dashboards: rootState.dashboards.dashboards,
            currentDashboard: rootState.dashboards.currentDashboard
          });
          
          // Save changes
          dispatch('dashboards/saveDashboards', null, { root: true })
            .then(() => {
              console.log('Cards order updated successfully');
              resolve(cards);
            })
            .catch(error => {
              console.error('Error saving card order:', error);
              reject(error);
            });
        } catch (error) {
          console.error('Error updating card order:', error);
          reject(error);
        }
      });
    },
    
    updateCard({ commit, rootState, dispatch }, { cardId, cardData }) {
      commit('UPDATE_CARD', {
        cardId,
        cardData,
        dashboards: rootState.dashboards.dashboards,
        currentDashboard: rootState.dashboards.currentDashboard
      });
      
      // Save changes
      dispatch('dashboards/saveDashboards', null, { root: true });
    },
    
    deleteCard({ commit, rootState, dispatch }, cardId) {
      commit('DELETE_CARD', {
        cardId,
        dashboards: rootState.dashboards.dashboards,
        currentDashboard: rootState.dashboards.currentDashboard
      });
      
      // Save changes
      dispatch('dashboards/saveDashboards', null, { root: true });
    }
  }
};

export default cardsModule;