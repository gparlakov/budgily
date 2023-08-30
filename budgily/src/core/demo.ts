
let opened: boolean = false;
let subscribers: ((v: boolean) => void) [] = []
const demo = {
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
