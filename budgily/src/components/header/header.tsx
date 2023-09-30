import { component$, useSignal, useStyles$, useStylesScoped$, useVisibleTask$ } from '@builder.io/qwik';

import Shepherd from 'shepherd.js';

import demo from '../../core/demo';

import { Button } from '@qwik-ui/tailwind';
import shepherdStyles from 'shepherd.js/dist/css/shepherd.css?inline';
import styles from './header.scss?inline';
import { gtag as tag } from '@codedoc1/analytics';

export const md = {
  fn: function x(...args: unknown[]) {
    console.log(args)
  },
  name: 'test'
};

export default component$(() => {
  useStylesScoped$(styles);
  useStyles$(shepherdStyles);
  useStyles$('.pad-down {transform: translateY(10px);} .mute-button { background-color: lightgray; }');

  const tour = useTour();

  return (
    <header>
      <div class="bg-base-100">
        <h3>Hello and welcome to Budgily DEMO.</h3>
        <p>The app can visualize, categorize and see bank account movements in grid form.</p>
        <p>This is the demo version with a 1000 randomly generated movements. Import your own is coming soon.</p>
        <p>Want to sign up for full version: <a class="link" href="https://docs.google.com/forms/d/1dsxhIgV8Hs2xphy_AxOdDg12iY0qW4GfqMcWafiZ5GE" target="_blank"> Sign up (Google Form)</a></p>
        <Button onClick$={() => {tour.value += 1}}>Want a tour?</Button>
      </div>
    </header>
  );
});

function useTour() {
  const startTour = useSignal(0)

  useVisibleTask$(({ track, cleanup }) => {
    let cleanupFn = () => { return; };
    if (track(() => startTour.value)) {
      demo.init();

      const chartTour = chartTourInit();
      const gridTour = gridTourInit();

      const cancelNavigationDemo = demo.readyToShowNavigationTour(() => {
        const nav = navigationTourInit()
        nav.start();
        nav.on('cancel', () => cleanupFn());
      })

      const cancelGridDemo = demo.gridVisible(() => {
        gridTour.start();
        gridTour.on('cancel', () => cleanupFn());
      })

      const cancelChartDemo = demo.chartVisible(() => {
        setTimeout(() => {
          chartTour.start();
          chartTour.on('cancel', () => cleanupFn())
        }, 500) // wait for content
      })

      const cancelDetailsDemo = demo.detailsOpenedAndChart(() => {
        chartTour.complete();

        setTimeout(() => {
          const detailsTour = chartMovementDetailsTourInit();
          detailsTour.start();
          detailsTour.once('complete', () => demo.on('chartDone'));
          detailsTour.on('cancel', () => cleanupFn());
        }, 300);
      });

      gridTour.once('complete', () => {
        demo.on('gridDone');
      });

      cleanupFn = () => {
        cancelDetailsDemo();
        cancelChartDemo();
        cancelGridDemo();
        cancelNavigationDemo();

        gridTour.off('complete')
        gridTour.complete();
        chartTour.off('complete');
        chartTour.complete();
      }

      cleanup(cleanupFn)
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
    buttons: [{ text: 'Cancel tour', action: function () { this.cancel() }, classes: 'mute-button' }, {
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
    buttons: [{ text: 'Cancel tour', action: function () { this.cancel() }, classes: 'mute-button' }, {
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
    buttons: [{ text: 'Cancel tour', action: function () { this.cancel() }, classes: 'mute-button' }, {
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
    buttons: [{ text: 'Cancel tour', action: function () { this.cancel() }, classes: 'mute-button' }, {
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
    buttons: [{ text: 'Cancel tour', action: function () { this.cancel() }, classes: 'mute-button' }, {
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
    buttons: [{ text: 'Cancel tour', action: function () { this.cancel() }, classes: 'mute-button' }, {
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
    buttons: [{ text: 'Cancel tour', action: function () { this.cancel() }, classes: 'mute-button' }, {
      text: 'Next',
      action: function () { this.next(); },
    }]
  });


  chartTour.addStep({
    id: 'show chart details',
    text: 'Click to open details',
    attachTo: {
      element: '#movements > rect:first-of-type ',
      on: 'top-start'
    },
    showOn: () => {
      return document.querySelector('#movements') != null;
    },
    // don't want users to accidentally click on this button as it appears where the next button does usually
    // buttons: [{ text: 'Cancel tour', action: function () { this.cancel() }, classes: 'mute-button' }]
  });


  wireUpAnalytics(chartTour, 'chart-tour');
  return chartTour;
}

function gridTourInit() {
  const grid = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'shadow-md bg-purple-dark',
      scrollTo: false
    }
  });

  grid.addStep({
    id: 'show grid total',
    text: 'The movements as individual lines in the grid.',
    attachTo: {
      element: '[data-tour="table"]',
      on: 'right'
    },
    buttons: [{ text: 'Cancel tour', action: function () { this.cancel() }, classes: 'mute-button' }, {
      text: 'Next',
      action: function () { this.next(); },
    }],
    modalOverlayOpeningPadding: 15
  });

  grid.addStep({
    id: 'show grid row',
    text: 'Each row shows a credit(green)',
    attachTo: {
      element: document.querySelectorAll('[data-tour="table-row"][data-type="credit"]')[3] as HTMLElement,
      on: 'bottom'
    },
    buttons: [{ text: 'Cancel tour', action: function () { this.cancel() }, classes: 'mute-button' }, {
      text: 'Next',
      action: function () { this.next(); },
    }]
  });

  grid.addStep({
    id: 'show grid row - debit',
    text: 'Or debit(red)',
    attachTo: {
      element: document.querySelectorAll('[data-tour="table-row"][data-type="debit"]')[3] as HTMLElement,
      on: 'bottom'
    },
    buttons: [{ text: 'Cancel tour', action: function () { this.cancel() }, classes: 'mute-button' }, {
      text: 'Next',
      action: function () { this.next(); },
    }]
  });

  grid.addStep({
    id: 'show grid select row',
    text: 'You can select individual rows',
    classes: 'pad-down',
    attachTo: {
      element: document.querySelectorAll('[data-tour="table-row-checkbox"]')[4] as HTMLElement,
      on: 'bottom',
    },
    buttons: [{ text: 'Cancel tour', action: function () { this.cancel() }, classes: 'mute-button' }, {
      text: 'Next',
      action: function () { this.next(); },
    }],
    modalOverlayOpeningPadding: 15,
  });

  grid.addStep({
    id: 'show grid select row',
    text: 'Or all rows at once',
    classes: 'pad-down',
    modalOverlayOpeningPadding: 15,
    attachTo: {
      element: '[data-tour="table-row-all-checkbox"]',
      on: 'bottom'
    },
    buttons: [{ text: 'Cancel tour', action: function () { this.cancel() }, classes: 'mute-button' }, {
      text: 'Next',
      action: function () { this.next(); },
    }]
  });

  grid.addStep({
    id: 'show grid categorize',
    text: 'And categorize using this control. Click to toggle open/closed.',
    classes: 'pad-down',
    modalOverlayOpeningPadding: 15,
    attachTo: {
      element: '[data-tour="categorize-control"]',
      on: 'bottom'
    },
    buttons: [{ text: 'Cancel tour', action: function () { this.cancel() }, classes: 'mute-button' }, {
      text: 'Next',
      action: function () { this.next(); },
    }]
  });

  grid.addStep({
    id: 'show grid categorize - new ',
    text: 'Type in here to create a new category.',
    classes: 'pad-down',
    modalOverlayOpeningPadding: 15,
    attachTo: {
      element: '[data-tour="categorize-control-new"]',
      on: 'bottom'
    },
    buttons: [{ text: 'Cancel tour', action: function () { this.cancel() }, classes: 'mute-button' }, {
      text: 'Next',
      action: function () { this.next(); },
    }],
    showOn: () => document.querySelector('[data-tour="categorize-control-new"]')?.checkVisibility() ?? false
  });

  grid.addStep({
    id: 'show grid categorize - new ',
    text: 'Or use dropdown to see your created categories.',
    classes: 'pad-down',
    modalOverlayOpeningPadding: 15,
    attachTo: {
      element: '[data-tour="categorize-control-existing"]',
      on: 'bottom'
    },
    buttons: [{ text: 'Cancel tour', action: function () { this.cancel() }, classes: 'mute-button' }, {
      text: 'Next',
      action: function () { this.next(); },
    }],
    showOn: () => document.querySelector('[data-tour="categorize-control-existing"]')?.checkVisibility() ?? false
  });

  wireUpAnalytics(grid, 'grid-tour');

  return grid;
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
    text: 'Import or change between Chart and Grid views. And can reload the data too.',
    attachTo: {
      element: '[data-tour="grid-chart-controls"]',
      on: 'bottom'
    },
    buttons: [
      { text: 'Cancel tour', action: function () { this.cancel() }, classes: 'mute-button' }, {
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
      { text: 'Cancel tour', action: function () { this.cancel() }, classes: 'mute-button' }, {
        text: 'Next',
        action: () => {
          navigationTour.next();
        },
      }
    ]
  });

  wireUpAnalytics(navigationTour, 'navigation-tour');
  return navigationTour;
}

function wireUpAnalytics(tour: Shepherd.Tour, name: string): void {
  tour.once('start', () => tag({event: 'start-tour', name}))
  tour.once('complete', () => tag({event: 'complete-tour', name}))
  tour.once('cancel', () => tag({event: 'cancel-tour', name}))
}
