import { createDOM } from '@builder.io/qwik/testing';
import { test, expect } from 'vitest';
import { Movement } from './movement';

test(`[Movement Component]: Should render`, async () => {
  const { screen, render } = await createDOM();
  await render(<Movement />);
  expect(screen.innerHTML).toContain('Movement works!');
});
