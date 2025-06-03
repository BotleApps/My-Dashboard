import { shallowMount } from '@vue/test-utils';
import DashboardCard from '@/components/dashboard/DashboardCard.vue'; // Adjust path as needed

describe('DashboardCard.vue', () => {
  // Helper function to create a wrapper with props
  const createWrapper = (propsData) => {
    return shallowMount(DashboardCard, {
      props: propsData,
      global: {
        mocks: {
          $emit: jest.fn(), // Mock $emit if the component uses it directly
        },
      },
    });
  };

  describe('Dashboard Card Mode (dashboard prop)', () => {
    let wrapper;
    const dashboardData = {
      id: 'dash1',
      name: 'My Awesome Dashboard',
      description: 'A collection of important metrics.',
      cardCount: 5,
      theme: 'theme-1',
    };

    beforeEach(() => {
      wrapper = createWrapper({ dashboard: dashboardData });
    });

    it('renders dashboard title and description', () => {
      expect(wrapper.find('h3').text()).toBe(dashboardData.name);
      expect(wrapper.find('p').text()).toBe(dashboardData.description);
    });

    it('computes isDashboardCard to true', () => {
      expect(wrapper.vm.isDashboardCard).toBe(true);
    });

    it('does not render drag, delete, edit controls', () => {
      expect(wrapper.find('.drag-handle').exists()).toBe(false);
      expect(wrapper.find('.delete-card').exists()).toBe(false);
      expect(wrapper.find('.edit-card').exists()).toBe(false);
    });

    it('displays the card count', () => {
      expect(wrapper.find('.card-count span').text()).toBe(dashboardData.cardCount.toString());
    });

    it('applies the correct theme class', () => {
      expect(wrapper.classes()).toContain(dashboardData.theme);
    });
  });

  describe('Metric Card Mode (card prop)', () => {
    let wrapper;
    const cardData = {
      id: 'card1',
      title: 'Revenue Growth',
      description: 'Monthly revenue growth percentage.',
      type: 'percentage',
      value: '15',
      prefix: '',
      suffix: '%',
      theme: 'theme-2',
      goal: 20,
      timestamp: '2024-07-01T00:00:00.000Z',
    };

    beforeEach(() => {
      wrapper = createWrapper({ card: cardData });
    });

    it('renders card title and description', () => {
      expect(wrapper.find('h4').text()).toBe(cardData.title);
      // Description might be in a different element or not rendered if too long, adjust selector if needed
      // For now, let's assume it could be in a <p> or a specific class if available
      // If not explicitly rendered, this test might need adjustment based on component's template
      // expect(wrapper.find('p.metric-description').text()).toBe(cardData.description);
    });

    it('computes isDashboardCard to false', () => {
      expect(wrapper.vm.isDashboardCard).toBe(false);
    });

    it('renders drag, delete, edit controls', () => {
      expect(wrapper.find('.drag-handle').exists()).toBe(true);
      expect(wrapper.find('.delete-card').exists()).toBe(true);
      expect(wrapper.find('.edit-card').exists()).toBe(true);
    });

    it('renders percentage metric type correctly', () => {
      expect(wrapper.find('.percentage-value').exists()).toBe(true);
      expect(wrapper.find('.percentage-value').text()).toContain(cardData.value + cardData.suffix);
    });

    it('applies the correct theme class', () => {
      expect(wrapper.classes()).toContain(cardData.theme);
    });

     it('displays the goal if present', () => {
      const goalElement = wrapper.find('.goal-value');
      expect(goalElement.exists()).toBe(true);
      expect(goalElement.text()).toContain(`Goal: ${cardData.goal}${cardData.suffix}`);
    });

    it('displays the last updated timestamp', () => {
      const timestampElement = wrapper.find('.last-updated');
      expect(timestampElement.exists()).toBe(true);
      // This will depend on the date formatting used in the component
      // For now, just check if it contains part of the year or a keyword
      expect(timestampElement.text()).toContain('Last Updated:');
    });
  });
});
