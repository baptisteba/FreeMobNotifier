import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Settings API
export const getSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

export const updateSettings = async (settings) => {
  try {
    const response = await api.put('/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

// Messages API
export const getMessages = async () => {
  try {
    const response = await api.get('/messages');
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const getMessage = async (id) => {
  try {
    const response = await api.get(`/messages/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching message ${id}:`, error);
    throw error;
  }
};

export const sendMessage = async (content) => {
  try {
    const response = await api.post('/messages/send', { content });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const scheduleMessage = async (messageData) => {
  try {
    const response = await api.post('/messages/schedule', messageData);
    return response.data;
  } catch (error) {
    console.error('Error scheduling message:', error);
    throw error;
  }
};

export const updateMessage = async (id, messageData) => {
  try {
    const response = await api.put(`/messages/${id}`, messageData);
    return response.data;
  } catch (error) {
    console.error(`Error updating message ${id}:`, error);
    throw error;
  }
};

export const deleteMessage = async (id) => {
  try {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting message ${id}:`, error);
    throw error;
  }
}; 