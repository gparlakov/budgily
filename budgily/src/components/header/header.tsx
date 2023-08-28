import { component$, useStylesScoped$ } from '@builder.io/qwik';
import styles from './header.scss?inline';


export default component$(() => {
  useStylesScoped$(styles);

  return (
    <header>
      <div class="bg-base-100">
        <h3>Hello and welcome to Budgily DEMO.</h3>
        <p> The app has 1000 demo bank movement records that you can visualize, categorize and see in grid form. </p>
        <p>Categorize by clicking on one of the chart sections or selecting the grid (top right corner) and selecting one or more rows of movements.</p>
        <p>Want to sign up for full version: <a class="link" href="https://docs.google.com/forms/d/1dsxhIgV8Hs2xphy_AxOdDg12iY0qW4GfqMcWafiZ5GE" target="_blank"> Sign up (Google Form)</a></p>
        <p>--&gt; vv Chart Grid view controls</p>
      </div>
    </header>
  );
});
