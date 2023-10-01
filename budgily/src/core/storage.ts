export function store(key: string, value: string) : void {
    window.localStorage.setItem(key, value);
}

export function fetch(key: string): string | null {
    return window.localStorage.getItem(key);
}
