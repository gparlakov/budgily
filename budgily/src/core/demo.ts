let gridVisible: boolean | undefined = undefined;
let chartDone = false;
let gridDone = false;
let detailsOpened = false;

const demo = {
  init() {
    chartDone = false;
    gridDone = false;
    detailsOpened = false;
  },
  on(ev: 'gridVisible' | 'gridHidden' | 'chartDone' | 'gridDone') {
    if (ev === 'chartDone') {
      chartDone = true;
    }
    if (ev === 'gridDone') {
      gridDone = true;
    }
    if (ev === 'gridVisible') {
      gridVisible = true;
    }
    if (ev === 'gridHidden') {
      gridVisible = false;
    }
  },
  gridVisible(cb: () => void) {
    callWhen(cb, () => Boolean(gridVisible));
  },
  chartVisible(cb: () => void) {
    callWhen(cb, () => gridVisible === false);
  },
  firstTourDone(cb: () => void) {
    callWhen(cb, () => chartDone || gridDone);
  },
  onDetailsId(id?: string | null | string[]) {
    const opened =
      (typeof id === 'string' && id.trim() != '') ||
      (Array.isArray(id) && typeof id[0] === 'string' && id[0].trim() != '');

    detailsOpened = opened;
    console.log('--- details', detailsOpened);
  },
  detailsOpened(cb: () => void) {
    callWhen(cb, () => detailsOpened);
  },
  readyToShowNavigationTour(cb: () => void) {
    callWhen(cb, () => !detailsOpened && (chartDone || gridDone));
  },
};

export default demo;
function callWhen(cb: () => void, whenCb: () => boolean) {
  const fn = () => {
    if (whenCb()) {
      cb();
    } else {
      setTimeout(fn, 1000);
    }
  };
  fn();
}
