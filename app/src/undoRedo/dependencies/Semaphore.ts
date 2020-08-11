// Altered from: https://github.com/DirtyHairy/async-mutex/blob/master/src/Semaphore.ts
import {IDataHook, Field} from "model-react";

export class Semaphore {
    protected maxConcurrency: number;
    protected queue: Array<(lease: [number, () => void]) => void> = [];
    protected currentReleaser: (() => void) | undefined;
    protected value = new Field(0);

    /**
     * Creates a new semaphore
     * @param maxConcurrency The maximum concurrency
     */
    public constructor(maxConcurrency: number) {
        if (maxConcurrency <= 0) {
            throw new Error("semaphore must be initialized to a positive value");
        }
        this.maxConcurrency = maxConcurrency;
        this.value.set(maxConcurrency);
    }

    /**
     * Acquires the semaphore
     * @returns The number of claims remaining and a function that can be used to release the resource
     */
    public acquire(): Promise<[number, () => void]> {
        const locked = this.isLocked();
        const ticket = new Promise<[number, () => void]>(r => this.queue.push(r));

        if (!locked) this._dispatch();

        return ticket;
    }

    /**
     * Runs the given function and makes sure to acquire and release the semaphore
     * @param callback The callback to run
     * @returns The result of the callback
     */
    public async runExclusive<T>(
        callback: (value: number) => Promise<T> | T
    ): Promise<T> {
        const [value, release] = await this.acquire();
        try {
            return await callback(value);
        } finally {
            release();
        }
    }

    /**
     * Checks whether the semaphore is locked
     * @param hook A hook to subscribe to changes
     * @returns Whether the semaphore is locked
     */
    public isLocked(hook: IDataHook = null): boolean {
        return this.value.get(hook) <= 0;
    }

    /**
     * Releases the semaphore if locked.
     * Only available on semaphores with concurrency = 1.
     */
    public release(): void {
        if (this.maxConcurrency > 1) {
            throw new Error(
                "this method is unavailable on semaphores with concurrency > 1; use the scoped release returned by acquire instead"
            );
        }

        if (this.currentReleaser) {
            this.currentReleaser();
            this.currentReleaser = undefined;
        }
    }

    /**
     * Dispatches an update in order to continue with the next consumer if present
     */
    private _dispatch(): void {
        const nextConsumer = this.queue.shift();

        if (!nextConsumer) return;

        let released = false;
        this.currentReleaser = () => {
            if (released) return;

            released = true;
            this.value.set(this.value.get(null) + 1);

            this._dispatch();
        };

        const value = this.value.get(null);
        this.value.set(value - 1);
        nextConsumer([value, this.currentReleaser]);
    }
}
