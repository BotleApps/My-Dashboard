// src/utils/storage.js

const STORAGE_KEY = 'dashboard_app_data';

export const loadDashboards = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return [];
  } catch (error) {
    console.error('Error loading dashboards:', error);
    return [];
  }
};

export const saveDashboards = (dashboards) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
    // Show a success notification
    const saveNotification = document.createElement('div');
    saveNotification.className = 'save-notification';
    saveNotification.textContent = 'Dashboard saved successfully!';
    document.body.appendChild(saveNotification);
    setTimeout(() => {
      saveNotification.remove();
    }, 2000);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    alert('Could not save dashboard data. Please try again.');
  }
};
