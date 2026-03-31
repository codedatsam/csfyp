// ==========================================
// CYPRESS SUPPORT FILE
// ==========================================
// Author: Samson Fabiyi
// Description: Custom commands and global config
// ==========================================

// Import commands
import './commands';

// Hide fetch/XHR requests from command log (cleaner output)
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.setAttribute('data-hide-command-log-request', '');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  app.document.head.appendChild(style);
}
