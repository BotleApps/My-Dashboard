import { modalService } from '@/services/modalService'; // Adjust path as needed

describe('modalService', () => {
  beforeEach(() => {
    // Reset modal states before each test
    for (const modal in modalService.modals) {
      modalService.closeModal(modal);
    }
  });

  it('should have no modals open initially', () => {
    expect(modalService.isModalOpen('anyModal')).toBe(false);
  });

  it('openModal() should set a modal state to true', () => {
    modalService.openModal('testModal');
    expect(modalService.isModalOpen('testModal')).toBe(true);
  });

  it('closeModal() should set a modal state to false', () => {
    modalService.openModal('testModal'); // Open it first
    modalService.closeModal('testModal');
    expect(modalService.isModalOpen('testModal')).toBe(false);
  });

  it('isModalOpen() should return correct state for opened, closed, and unhandled modals', () => {
    expect(modalService.isModalOpen('neverOpenedModal')).toBe(false);

    modalService.openModal('openedModal');
    expect(modalService.isModalOpen('openedModal')).toBe(true);

    modalService.openModal('closedModal');
    modalService.closeModal('closedModal');
    expect(modalService.isModalOpen('closedModal')).toBe(false);
  });

  it('isModalOpen() should return false for a non-existent modal name', () => {
    expect(modalService.isModalOpen('nonExistentModal123')).toBe(false);
  });

  it('openModal() should correctly update the reactive modals object', () => {
    modalService.openModal('reactiveTestModal');
    expect(modalService.modals.reactiveTestModal).toBe(true);
  });

  it('closeModal() should correctly update the reactive modals object', () => {
    modalService.openModal('reactiveTestModalToClose');
    modalService.closeModal('reactiveTestModalToClose');
    expect(modalService.modals.reactiveTestModalToClose).toBe(false);
  });
});
