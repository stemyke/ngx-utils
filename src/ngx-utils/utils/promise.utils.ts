export interface CancelablePromise<T> extends Promise<T> {
    cancel: () => void;
}

export function cancelablePromise<T>(source: Promise<T>): CancelablePromise<T> {
    let isCanceled = false;
    const cancelable = new Promise<T>((resolve, reject) => {
        source.then(res => {
            if (isCanceled) return;
            resolve(res);
        }).catch(reject);
    }) as CancelablePromise<T>;
    cancelable.cancel = () => {
        isCanceled = true;
    };
    return cancelable;
}

export function impatientPromise<T>(factory: () => Promise<T>): () => Promise<T> {
    let lastPromise: CancelablePromise<T> = null;
    return () => {
        lastPromise?.cancel();
        lastPromise = cancelablePromise(factory());
        return lastPromise
    };
}
