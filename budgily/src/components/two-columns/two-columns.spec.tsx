import { createDOM } from '@builder.io/qwik/testing';
import { test, expect } from 'vitest';
import { TwoColumns } from './two-columns';

test(`[TwoColumns Component]: Should render`, async () => {
  const { screen, render } = await createDOM();
  await render(<TwoColumns />);
  expect(screen.innerHTML).toContain('TwoColumns works!');
});
