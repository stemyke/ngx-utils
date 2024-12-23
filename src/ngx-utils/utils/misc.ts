export function checkTransitions(el: HTMLElement, cb: () => any): void {
    let hasTransitions = false;
    let called = false;
    const end = () => {
        if (called) return;
        called = true;
        cb();
    };
    el.onanimationstart = () => hasTransitions = true;
    el.ontransitionstart = () => hasTransitions = true;
    el.onanimationend = end;
    el.ontransitionend = end;
    setTimeout(() => {
        if (hasTransitions) return;
        end();
    }, 100);
}
