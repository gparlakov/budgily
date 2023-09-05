import { component$, useComputed$, useSignal, useStyles$, useStylesScoped$, useVisibleTask$ } from '@builder.io/qwik';
import Shepherd from 'shepherd.js';

import demo from '../../core/demo';

import styles from './header.scss?inline';
import shepherdStyles from 'shepherd.js/dist/css/shepherd.css?inline'

export const md = {
  fn: function x(...args: unknown[]) {
    console.log(args)
  },
  name: 'test'
};

export default component$(() => {
  useStylesScoped$(styles);
  useStyles$(shepherdStyles);

  useTour();

  return (
    <header>
      <div class="bg-base-100">
        <h3>Hello and welcome to Budgily DEMO.</h3>
        <p> The app has 1000 demo bank movement records that you can visualize, categorize and see in grid form. </p>
        <p>Categorize by clicking on one of the chart sections or selecting the grid (top right corner) and selecting one or more rows of movements.</p>
        <p>Want to sign up for full version: <a class="link" href="https://docs.google.com/forms/d/1dsxhIgV8Hs2xphy_AxOdDg12iY0qW4GfqMcWafiZ5GE" target="_blank"> Sign up (Google Form)</a></p>
      </div>
    </header>
  );
});
function useTour() {
  useVisibleTask$(() => {
    const initialTour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shadow-md bg-purple-dark',
        scrollTo: true
      }
    });

    initialTour.addStep({
      id: 'example-step',
      text: 'View controls - change between Chart and Grid views. And can reload the data too.',
      attachTo: {
        element: '[data-tour="grid-chart-controls"]',
        on: 'bottom'
      },
      buttons: [
        {
          text: 'Next',
          action: initialTour.next,
        }
      ]
    });

    initialTour.addStep({
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
            initialTour.next();
          },
        }
      ]
    });


    initialTour.addStep({
      id: 'show chart details',
      text: 'Click to open details',
      attachTo: {
        element: '#movements > rect:first-of-type ',
        on: 'right'
      },
      showOn: () => {
        return document.querySelector('#movements') != null;
      }
    });

    initialTour.start();


    demo.opened((isOpen) => {
      if (isOpen && initialTour.isActive()) {
        initialTour.complete();

        setTimeout(() => {
          debugger;
          const detailsTour = new Shepherd.Tour({
            // useModalOverlay: false,
            defaultStepOptions: {
              classes: 'shadow-md bg-purple-dark',
              scrollTo: true
            },
            modalContainer: document.querySelector('dialog>div') as HTMLElement ?? undefined

          })

          detailsTour.addStep({
            id: 'Show details',
            text: 'The details of a movement',
            attachTo: {
              element: '[data-tour="details-rows"]',
              // on: 'top',

            },
            floatingUIOptions: {
              // middleware: [md]
            },
            buttons: [{
              text: 'Next',
              action: () => {
                initialTour.next();
              },
            }]
          });


          detailsTour.addStep({
            id: 'Show categorization - new ',
            text: 'Create a new category by typing and hitting Enter',
            attachTo: {
              element: '[data-tour="details-new-category"]',
              on: 'top'
            },
            buttons: [{
              text: 'Next',
              action: () => {
                initialTour.next();
              },
            }]
          });

          detailsTour.addStep({
            id: 'Show categorization - existing',
            text: 'Or select from the dropdown',
            attachTo: {
              element: '[data-tour="details-existing-category"]',
              on: 'top'
            },
            buttons: [{
              text: 'Next',
              action: () => {
                initialTour.next();
              },
            }]
          });

          // detailsTour.start();
        }, 2500);
      };
    });



  }, { strategy: 'document-idle' });
}

