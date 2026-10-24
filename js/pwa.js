// Register service worker for PWA
if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
  window.addEventListener('load', () => {
    try {
      navigator.serviceWorker.register('sw.js');
    } catch (err) {
      console.warn('Service worker registration failed:', err);
    }
  });
}