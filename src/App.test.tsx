import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the application', () => {
    render(<App />);
    expect(document.body).toBeTruthy();
  });
});
