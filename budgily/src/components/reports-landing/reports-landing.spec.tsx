import { createDOM } from '@builder.io/qwik/testing';
import { test, expect } from 'vitest';
import { ReportsLanding } from './reports-landing';

test(`[ReportsLanding Component]: Should render`, async () => {
  const { screen, render } = await createDOM();
  await render(<ReportsLanding />);
  expect(screen.innerHTML).toContain('ReportsLanding works!');
});
