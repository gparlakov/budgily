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
    return callWhen(cb, () => Boolean(gridVisible));
  },
  chartVisible(cb: () => void) {
    return callWhen(cb, () => gridVisible === false);
  },
  firstTourDone(cb: () => void) {
    return callWhen(cb, () => chartDone || gridDone);
  },
  onDetailsId(id?: string | null | string[]) {
    const opened =
      (typeof id === 'string' && id.trim() != '') ||
      (Array.isArray(id) && typeof id[0] === 'string' && id[0].trim() != '');

    detailsOpened = opened;
  },
  detailsOpenedAndChart(cb: () => void): () => void {
    return callWhen(cb, () => detailsOpened && !gridVisible);
  },
  readyToShowNavigationTour(cb: () => void) {
    return callWhen(cb, () => !detailsOpened && (chartDone || gridDone));
  },
};

export default demo;
function callWhen(cb: () => void, whenCb: () => boolean) {
    let cancelled = false;
    const cancel = () => cancelled = true;

  const fn = () => {
    if(cancelled) {
        return; // stop this
    }
    if (whenCb()) {
      cb();
    } else {
      setTimeout(fn, 1000);
    }
  };
  fn();
  return cancel;
}
