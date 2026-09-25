const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('careerbridge_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  // Cleanly handle unauthorized responses by throwing or returning a consistent format
  if (!response.ok) {
    throw new Error(data.message || 'API Request Failed');
  }

  return data;
};

export const login = (email, password) => {
  return api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const getMe = () => {
  return api('/auth/me');
};
