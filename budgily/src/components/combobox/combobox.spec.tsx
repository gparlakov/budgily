import { createDOM } from '@builder.io/qwik/testing';
import { test, expect } from 'vitest';
import { Combobox } from './combobox';

test(`[Combobox Component]: Should render`, async () => {
  const { screen, render } = await createDOM();
  await render(<Combobox />);
  expect(screen.innerHTML).toContain('Combobox works!');
});
