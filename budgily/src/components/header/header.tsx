import { component$, useStyles$, useStylesScoped$, useVisibleTask$ } from '@builder.io/qwik';
import Shepherd from 'shepherd.js';
import styles from './header.scss?inline';
import shepherdStyles from 'shepherd.js/dist/css/shepherd.css?inline'


export default component$(() => {
  useStylesScoped$(styles);
  useStyles$(shepherdStyles)

  useVisibleTask$(() => {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shadow-md bg-purple-dark',
        scrollTo: true
      }
    });

    tour.addStep({
      id: 'example-step',
      text: 'View controls - change between Chart and Grid views. And can reload the data too.',
      attachTo: {
        element: '[data-tour="grid-chart-controls"]',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Next',
          action: tour.next,
        }
      ]
    });

    tour.addStep({
      id: 'show top controls',
      text: 'Filter by category, time range or search by description',
      attachTo: {
        element: '[data-tour="grid-filter-and-search"]',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Next',
          action: () => {

            tour.next();
          },
        }
      ]
    })


    tour.addStep({
      id: 'show chart details',
      text: 'Click to open details',
      attachTo: {
        element: '#movements > rect:first-of-type ',
        on: 'right'
      },
      // buttons: [
      //   {
      //     text: 'Next',
      //     action: () => {

      //       tour.next();
      //     },
      //   }
      // ]
    })

    tour.start();
  }, {strategy: 'document-idle'})

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
