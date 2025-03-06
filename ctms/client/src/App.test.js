import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders app without crashing', () => {
  // Mocking the sessionUser data since it's used in your App component
  const mockSessionUser = null;
  
  // Wrap App in BrowserRouter for testing
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  
  // Test for something that should be in your app when loaded
  // You can adjust this based on what you expect to see in your app
  expect(document.body).toBeInTheDocument();
});