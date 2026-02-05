import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/app.scss';
import App from './App';

console.log('main.tsx loaded');

const appElement = document.getElementById('app');

if (!appElement) {
  console.error('App element not found!');
} else {
  console.log('App element found, creating root...');
  try {
    const rootNode = createRoot(appElement);
    console.log('Root created, rendering App...');
    rootNode.render(<App />);
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering App:', error);
  }
}

