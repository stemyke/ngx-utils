import {computed, untracked, type Signal, DestroyRef, inject, signal} from "@angular/core";
import {isBrowser} from "./misc";

/**
 * Returns a signal that emits the previous value of the given signal.
 * The first time the signal is emitted, the previous value will be the same as the current value.
 *
 * @param s Signal to compute previous value for
 * @returns Signal that emits previous value of `s`
 */
export function computedPrevious<T>(s: Signal<T>): Signal<T> {
    let current = null as T;
    let previous = untracked(() => s()); // initial value is the current value

    return computed(() => {
        current = s();
        const result = previous;
        previous = current;
        return result;
    });
}

/**
 * Returns a signal that emits css styles form an element when it gets resized
 *
 * @param elem Element to compute styles for
 * @returns Signal that emits the calculated styles
 */
export function cssStyles<T>(elem: HTMLElement): Signal<CSSStyleDeclaration> {
    const styles = signal<CSSStyleDeclaration>({
        length: 0,
        getPropertyValue: () => null
    } as any);
    if (!elem || !isBrowser()) return styles;
    styles.set(getComputedStyle(elem));
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(() => {
        requestAnimationFrame(() => {
            styles.set(getComputedStyle(elem));
        });
    }) : null;
    const destroyRef = inject(DestroyRef, { optional: true });
    destroyRef?.onDestroy(() => {
        observer?.unobserve(elem);
    });
    observer?.observe(elem);
    return styles;
}

/**
 * Returns a signal that emits css variables form an element when it gets resized
 *
 * @param elem Element to compute variables for
 * @returns Signal that emits the calculated properties
 */
export function cssVariables<T>(elem: HTMLElement) {
    const styleSource = cssStyles(elem);
    return computed(() => {
       const styles = styleSource();
        const res = {} as Record<string, string>;
        for (let i = 0; i < styles.length; i++) {
            const propertyName = styles[i];
            if (propertyName.startsWith("--")) {
                res[propertyName] = styles.getPropertyValue(propertyName);
            }
        }
        return res;
    });
}
