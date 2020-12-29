/** A class to allow to wait for all promises to resolve, where promises can be added asynchronously */
export class PromiseAll {
    /**
     * The promise that resolves once all currently added promises resolved
     */
    public promise: Promise<void> = Promise.resolve();
    protected resolve: () => void;
    protected count = 0;

    /**
     * Adds a new promise that should be waited on
     * @param promise The promise to be added
     * @returns The passed promise, for inline usage
     */
    public add<T>(promise: Promise<T>): Promise<T> {
        if (this.count == 0) this.reset();

        this.count++;
        let p = () => {
            this.count--;
            if (this.count == 0) this.resolve();
        };
        promise.then(p).catch(p);
        return promise;
    }

    /**
     * Resets the promise
     */
    protected reset() {
        this.promise = new Promise(res => {
            this.resolve = res;
        });
        this.count = 0;
    }
}
