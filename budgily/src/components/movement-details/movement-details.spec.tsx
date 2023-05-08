import { createDOM } from '@builder.io/qwik/testing';
import { test, expect } from 'vitest';
import { MovementDetails } from './movement-details';

test(`[MovementDetails Component]: Should render`, async () => {
  const { screen, render } = await createDOM();
  await render(<MovementDetails />);
  expect(screen.innerHTML).toContain('MovementDetails works!');
});
