import { reactive } from 'vue';

// Store modal states
const modalStates = reactive({});

/**
 * Modal service to handle modal visibility across the application
 */
export function useModalService() {
  // Open a modal by setting its state to true
  const openModal = (modalName) => {
    modalStates[modalName] = true;
  };

  // Close a modal by setting its state to false
  const closeModal = (modalName) => {
    modalStates[modalName] = false;
  };

  // Check if a modal is open
  const isModalOpen = (modalName) => {
    return !!modalStates[modalName];
  };

  return {
    openModal,
    closeModal,
    isModalOpen
  };
}
