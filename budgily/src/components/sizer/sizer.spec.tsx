import { createDOM } from '@builder.io/qwik/testing';
import { test, expect } from 'vitest';
import { Sizer } from './sizer';

test(`[Sizer Component]: Should render`, async () => {
  const { screen, render } = await createDOM();
  await render(<Sizer />);
  expect(screen.innerHTML).toContain('Sizer works!');
});
