import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('shows new pilot tabs after starting app', () => {
  render(<App />);

  fireEvent.click(screen.getAllByRole('button', { name: /get started free/i })[0]);

  expect(screen.getAllByText(/verify drug/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/report fake/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/alerts/i).length).toBeGreaterThan(0);
});
