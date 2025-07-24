import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API functions
export const pollsAPI = {
  // Get all polls
  getAllPolls: async () => {
    try {
      const response = await api.get('/api/polls');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch polls');
    }
  },

  // Get single poll
  getPoll: async (pollId) => {
    try {
      const response = await api.get(`/api/polls/${pollId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch poll');
    }
  },

  // Create new poll
  createPoll: async (pollData) => {
    try {
      const response = await api.post('/api/polls', pollData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to create poll');
    }
  },

  // Cast vote
  castVote: async (voteData) => {
    try {
      const response = await api.post('/api/votes', voteData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to cast vote');
    }
  },

  // Get poll results
  getPollResults: async (pollId) => {
    try {
      const response = await api.get(`/api/polls/${pollId}/results`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch results');
    }
  },

  // Delete poll
  deletePoll: async (pollId) => {
    try {
      const response = await api.delete(`/api/polls/${pollId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete poll');
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Health check failed');
    }
  }
};

export default api;