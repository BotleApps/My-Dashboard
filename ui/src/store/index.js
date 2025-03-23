import { createStore } from 'vuex'
import dashboardsModule from './modules/dashboards'
import cardsModule from './modules/cards'
import uiModule from './modules/ui'

const store = createStore({
  modules: {
    dashboards: {
      ...dashboardsModule,
      namespaced: true
    },
    cards: {
      ...cardsModule,
      namespaced: true
    },
    ui: {
      ...uiModule,
      namespaced: true
    }
  }
})

export default store