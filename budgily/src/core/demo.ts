
let opened: boolean = false;
let subscribers: ((v: boolean) => void) [] = []

let initialTourDone = false;
let gridVisible = false;

const demo = {
    on(ev: 'initialTourDone' | 'gridVisible' | 'gridHidden') {
        if(ev === 'initialTourDone') {
            initialTourDone = true;
        }
        if(ev === 'gridVisible') {
            gridVisible = true;
        }
        if(ev === 'gridHidden') {
            gridVisible = false;
        }
    },
    gridVisible(cb: () => void) {
        if(gridVisible) {
            cb();
        }
        else {
            setTimeout(() => demo.gridVisible(cb), 1000);
        }
    },
    chartVisibleAndInitialTourDone(cb: () => void) {
        if(gridVisible && initialTourDone) {
            cb();
        }
        else {
            setTimeout(() => demo.gridVisible(cb), 1000);
        }
    },
    opened(onNext: (v: boolean) => void) {
        onNext(opened); // call immediately to give the value
        subscribers.push(onNext);
    },
    isOpened() {
        return opened;
    },
    onDetailsId(id?: string | null | string[]) {
        opened = (typeof id === 'string' && id.trim() != '') || Array.isArray(id) && typeof id[0] === 'string' && id[0].trim() != '';
        subscribers.forEach(s => typeof s === 'function' && s(opened))
    }
}

export default demo;
