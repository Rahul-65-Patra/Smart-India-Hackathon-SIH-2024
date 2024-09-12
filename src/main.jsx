import React from 'react';
import ReactDOM from 'react-dom/client';  // or `react-dom` depending on your setup
import App from './App';  // Assuming App component is in the same directory

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
