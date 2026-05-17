const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let googleAccessToken = null;
let googleButtonRendered = false;
let pendingCallback = null;

export function initializeGoogle() {
  if (typeof window === 'undefined' || !GOOGLE_CLIENT_ID) {
    console.warn('VITE_GOOGLE_CLIENT_ID not set in .env');
    return Promise.resolve(false);
  }

  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(true);
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => {
              googleAccessToken = response.credential;
              localStorage.setItem('google_token', response.credential);
              if (pendingCallback) {
                pendingCallback(response);
              }
            },
          });
          resolve(true);
        } else {
          reject(new Error('Google API not loaded'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    }
  });
}

export function onGoogleSuccess(callback) {
  pendingCallback = callback;
  
  const storedToken = localStorage.getItem('google_token');
  if (storedToken && googleAccessToken === storedToken) {
    const googleUser = getUserFromGoogle(storedToken);
    if (googleUser) {
      callback({ credential: storedToken });
    }
  }
}

export function renderGoogleButton(containerId = 'google-button-container') {
  if (!GOOGLE_CLIENT_ID) {
    console.warn('Google Client ID not configured');
    return false;
  }

  if (!window.google?.accounts?.id) {
    console.warn('Google API not loaded yet');
    return false;
  }

  if (googleButtonRendered) {
    return false;
  }

  const container = document.getElementById(containerId);
  if (!container) {
    console.warn('Google button container not found:', containerId);
    return false;
  }

  window.google.accounts.id.renderButton(container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
    width: 280,
  });

  googleButtonRendered = true;
  return true;
}

export function triggerGoogleSignIn() {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.prompt();
  }
}

export function getUserFromGoogle(token = googleAccessToken) {
  if (!token) {
    const stored = localStorage.getItem('google_token');
    if (stored) token = stored;
  }
  
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      google_id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch {
    return null;
  }
}

export function clearGoogleToken() {
  googleAccessToken = null;
  localStorage.removeItem('google_token');
  googleButtonRendered = false;
}

export function hasGoogleToken() {
  return !!localStorage.getItem('google_token');
}