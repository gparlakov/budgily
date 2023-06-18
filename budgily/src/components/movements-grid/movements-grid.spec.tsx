import { createDOM } from '@builder.io/qwik/testing';
import { test, expect } from 'vitest';
import { MovementsGrid } from './movements-grid';

test(`[MovementsGrid Component]: Should render`, async () => {
  const { screen, render } = await createDOM();
  await render(<MovementsGrid />);
  expect(screen.innerHTML).toContain('MovementsGrid works!');
});
