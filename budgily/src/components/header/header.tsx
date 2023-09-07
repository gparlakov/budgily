import { component$, useComputed$, useSignal, useStyles$, useStylesScoped$, useVisibleTask$ } from '@builder.io/qwik';
import Shepherd from 'shepherd.js';

import demo from '../../core/demo';

import styles from './header.scss?inline';
import shepherdStyles from 'shepherd.js/dist/css/shepherd.css?inline'
import { Button } from '@qwik-ui/tailwind';

export const md = {
  fn: function x(...args: unknown[]) {
    console.log(args)
  },
  name: 'test'
};

export default component$(() => {
  useStylesScoped$(styles);
  useStyles$(shepherdStyles);

  const tour = useTour();

  return (
    <header>
      <div class="bg-base-100">
        <h3>Hello and welcome to Budgily DEMO.</h3>
        <p> The app has 1000 demo bank movement records that you can visualize, categorize and see in grid form. </p>
        <p>Categorize by clicking on one of the chart sections or selecting the grid (top right corner) and selecting one or more rows of movements.</p>
        <p>Want to sign up for full version: <a class="link" href="https://docs.google.com/forms/d/1dsxhIgV8Hs2xphy_AxOdDg12iY0qW4GfqMcWafiZ5GE" target="_blank"> Sign up (Google Form)</a></p>
        <Button onClick$={() => tour.value = true}>Want a tour?</Button>
      </div>
    </header>
  );
});
function useTour() {
  const startTour = useSignal(false)

  useVisibleTask$(({ track }) => {

    if (track(() => startTour.value)) {
      demo.init();

      const chartTour = chartTourInit();

      demo.readyToShowNavigationTour(() => {
        navigationTourInit().start();
      })

      demo.gridVisible(() => {
        console.log('grid visible')
      })

      demo.chartVisible(() => {
        setTimeout(() => {
          chartTour.start();
        }, 500) // wait for content
      })

      demo.detailsOpened(() => {
        chartTour.complete();

        setTimeout(() => {
          const detailsTour = chartMovementDetailsTourInit();
          detailsTour.start();
          detailsTour.once('complete', () => demo.on('chartDone'));
        }, 300);
      });

      chartTour.once('complete', () => startTour.value = false);
    }

  }, { strategy: 'document-idle' });

  return startTour;
}

function chartMovementDetailsTourInit() {
  const detailDialog = document.querySelector('dialog') as HTMLElement ?? undefined;
  const detailsTour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'shadow-md bg-purple-dark',
      scrollTo: true
    },
    modalContainer: detailDialog,
    stepsContainer: detailDialog,
  });

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
      action: detailsTour.next
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
      action: detailsTour.next
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
      action: detailsTour.next,
    }]
  });

  detailsTour.addStep({
    id: 'Demo move adjacent movement',
    text: 'Use buttons for quick select of next movement',
    attachTo: {
      element: '[data-tour="select-next-movement"]',
      on: 'top'
    },
    buttons: [{
      text: 'Next',
      action: detailsTour.next,
    }]
  });

  detailsTour.addStep({
    id: 'Demo move adjacent movement',
    text: 'Use buttons for quick select of previous movement',
    attachTo: {
      element: '[data-tour="select-previous-movement"]',
      on: 'top'
    },
    buttons: [{
      text: 'Next',
      action: detailsTour.complete,
    }]
  });
  return detailsTour;
}

function chartTourInit() {
  const chartTour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'shadow-md bg-purple-dark',
      scrollTo: true
    }
  });

  chartTour.addStep({
    id: 'show chart total',
    text: 'The movements as columns of individual credits or debits stacked on top of each other. Each box represents a single movement.',
    attachTo: {
      element: '#movements',
      on: 'top'
    },
    showOn: () => {
      return document.querySelector('#movements') != null;
    },
    buttons: [{
      text: 'Next',
      action: function () { this.next(); },
    }]
  });

  chartTour.addStep({
    id: 'show chart months',
    text: 'Each month worth of data is represented by a the Credit (green) and Debit (red) columns.',
    attachTo: {
      element: '[data-tour="months-axis"]',
      on: 'right'
    },
    buttons: [{
      text: 'Next',
      action: function () { this.next(); },
    }]
  });


  chartTour.addStep({
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
  return chartTour;
}

function navigationTourInit() {
  const navigationTour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'shadow-md bg-purple-dark',
      scrollTo: true
    }
  });

  navigationTour.addStep({
    id: 'example-step',
    text: 'View controls - change between Chart and Grid views. And can reload the data too.',
    attachTo: {
      element: '[data-tour="grid-chart-controls"]',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Next',
        action: navigationTour.next,
      }
    ]
  });

  navigationTour.addStep({
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
          navigationTour.next();
        },
      }
    ]
  });
  return navigationTour;
}

