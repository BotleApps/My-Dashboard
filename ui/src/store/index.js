import { createStore } from 'vuex'
import dashboardsModule from './modules/dashboards'
import cardsModule from './modules/cards'
import uiModule from './modules/ui'

export default createStore({
  modules: {
    dashboards: dashboardsModule,
    cards: cardsModule,
    ui: uiModule
  }
})