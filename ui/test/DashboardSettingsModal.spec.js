import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DashboardSettingsModal from './DashboardSettingsModal.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('DashboardSettingsModal.vue', () => {
  let actions
  let store
  let wrapper

  beforeEach(() => {
    actions = {
      updateDashboard: jest.fn(),
      deleteDashboard: jest.fn()
    }
    store = new Vuex.Store({
      state: {
        currentDashboard: {
          id: '123',
          name: 'Test Dashboard',
          description: 'Test Description',
          theme: '2'
        }
      },
      actions
    })

    wrapper = shallowMount(DashboardSettingsModal, {
      localVue,
      store,
      mocks: {
        $router: {
          push: jest.fn()
        }
      }
    })
  })

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('initializes form data with current dashboard values', () => {
    expect(wrapper.vm.formData.name).toBe('Test Dashboard')
    expect(wrapper.vm.formData.description).toBe('Test Description')
    expect(wrapper.vm.formData.theme).toBe('2')
  })

  it('emits a close event when the close button is clicked', async () => {
    await wrapper.find('.close-modal').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('calls the updateDashboard action when the form is submitted', async () => {
    await wrapper.find('form').trigger('submit.prevent')
    expect(actions.updateDashboard).toHaveBeenCalled()
  })

  it('calls the deleteDashboard action when the delete button is clicked', async () => {
    global.confirm = () => true // Mock the confirm function
    await wrapper.find('.btn.danger').trigger('click')
    expect(actions.deleteDashboard).toHaveBeenCalledWith('123')
  })

  it('redirects to home after deleting dashboard', async () => {
    global.confirm = () => true
    await wrapper.find('.btn.danger').trigger('click')
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: 'Home' })
  })
})
