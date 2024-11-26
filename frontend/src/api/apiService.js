import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response ? error.response.data : error);
  }
);

export const register = async (userData) => {
  return await api.post('/api/register', userData);
};

export const login = async (credentials) => {
  return await api.post('/api/login', credentials);
};

export const getUserProfile = () => api.get('/api/me');
export const getFoodEntries = () => api.get('/get_entries');
export const getMigraines = () => api.get('/get_migraines');
export const getCategories = () => api.get('/get_categories');

export const addFoodEntry = (entry) => api.post('/add_entry', entry);
export const addMigraine = (migraine) => api.post('/add_migraine', migraine);

export const deleteMigraine = async (migraineId) => {
  return await api.delete(`/delete_migraine/${migraineId}`);
};

export const deleteFood = async (foodId) => {
  return await api.delete(`/delete_food/${foodId}`);
};
