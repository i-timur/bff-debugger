// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    chrome.devtools.panels.create(
      'BFF Debugger',
      '/assets/icon.png', // Updated path to be relative to extension root
      'index.html',
      (panel) => {
        if (chrome.runtime.lastError) {
          console.error('Error creating panel:', chrome.runtime.lastError);
          return;
        }
        console.log('BFF Debugger panel created successfully');

        // Optional: Add panel events
        panel.onShown.addListener(() => {
          console.log('Panel shown');
        });

        panel.onHidden.addListener(() => {
          console.log('Panel hidden');
        });
      }
    );
  } catch (error) {
    console.error('Failed to create DevTools panel:', error);
  }
});
