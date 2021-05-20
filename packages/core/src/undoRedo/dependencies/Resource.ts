import {Semaphore} from "./Semaphore";
import {IDataHook} from "model-react";

/**
 * A semaphore that can be watched for unlocks, representing resources that could be locked.
 */
export class Resource {
    protected semaphore: Semaphore;
    protected name?: string;

    /**
     * Creates a new resource
     * @param name A name that can be used for debugging
     * @param concurrency The number of processes that may use the resource at a given time
     */
    public constructor(name?: string, concurrency: number = 1) {
        this.name = name;
        this.semaphore = new Semaphore(concurrency);
    }

    /**
     * Acquires the resource once it's available
     * @returns The release function to unlock the resource
     */
    public async acquire(): Promise<() => void> {
        const [, releaser] = await this.semaphore.acquire();

        return releaser;
    }

    /**
     * Checks whether the resource is currently locked
     * @param hook A hook to subscribe to changes
     * @returns Whether the resource is locked
     */
    public isLocked(hook?: IDataHook): boolean {
        return this.semaphore.isLocked(hook);
    }

    /**
     * Releases the resource
     */
    public release(): void {
        this.semaphore.release();
    }
}
