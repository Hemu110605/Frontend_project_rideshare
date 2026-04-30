// Add token to all requests
const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const [url, options] = args;
  const token = localStorage.getItem('token');
  
  if (token && !url.includes('/auth/')) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
  }
  
  return originalFetch.apply(this, args);
};