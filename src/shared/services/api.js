const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

export async function request(endpoint, data = null) {
  const payload = {
    endpoint,
    ...data,
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return { success: true, mode: 'no-cors' };
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export const api = {
  get: (endpoint, data) => request(endpoint, data),
  post: (endpoint, data) => request(endpoint, data),
  put: (endpoint, data) => request(endpoint, data),
  delete: (endpoint, data) => request(endpoint, data),
};

export default api;