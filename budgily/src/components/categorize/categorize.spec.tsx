import { createDOM } from '@builder.io/qwik/testing';
import { test, expect } from 'vitest';
import { Categorize } from './categorize';

test(`[Categorize Component]: Should render`, async () => {
  const { screen, render } = await createDOM();
  await render(<Categorize />);
  expect(screen.innerHTML).toContain('Categorize works!');
});
