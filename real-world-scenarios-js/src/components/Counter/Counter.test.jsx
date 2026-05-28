import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Counter } from './Counter';

describe('Counter Component', () => {
  it('should render the component', () => {
    render(<Counter />);
  });

  it('should increase the counter value when increment button is clicked', async () => {
    // userEvent simulates real user interactions and returns async helpers for
    // events that may trigger React state updates.
    const user = userEvent.setup();
    render(<Counter />);

    // Verify the initial state before clicking so the test proves the button
    // changes the count from 0 to 1.
    expect(screen.getByText('Counter: 0')).toBeInTheDocument();
    screen.debug();
    await user.click(screen.getByRole('button', { name: 'Increment' }));
    screen.debug();
    expect(screen.getByText('Counter: 1')).toBeInTheDocument();
  });
});
