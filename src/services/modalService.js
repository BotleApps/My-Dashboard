import { reactive } from 'vue';

const modalState = reactive({
  modals: {}
});

export const useModalService = () => {
  const openModal = (modalName) => {
    modalState.modals[modalName] = true;
  };

  const closeModal = (modalName) => {
    modalState.modals[modalName] = false;
  };

  const isModalOpen = (modalName) => {
    return !!modalState.modals[modalName];
  };

  return {
    openModal,
    closeModal,
    isModalOpen
  };
};
