import {IGenerator} from "./_types/IGenerator";
import {Field, IDataHook} from "model-react";

/**
 * A class used to extract items from a (custom) generator
 */
export class GeneratorStreamExtractor<T> {
    protected generator: IGenerator<T>;
    protected itemCallback: (item: T) => void;

    protected started = new Field(false);
    protected paused = new Field(false);
    protected stopped = new Field(false);

    protected sentStopSignal: boolean = false;
    protected pausedItem: T | null; // The last item caught after pausing
    protected continueExtraction: ((stopped: boolean) => void) | null; // The function to call to get the next item after pausing

    protected resolveStart: null | (() => void);
    protected generatorResult: Promise<void>;

    /**
     * Creates a new generator extractor which extract a continuous stream of items
     * @param generator The generator to extract the items from
     * @param itemCallback The callback to forward the extracted items to
     */
    public constructor(generator: IGenerator<T>, itemCallback: (item: T) => void) {
        this.generator = generator;
        this.itemCallback = itemCallback;
    }

    // Controls
    /**
     * Starts extracting items from the generator, or continues when paused
     * @returns A promise that resolves when extraction finished or was stopped
     */
    public start(): Promise<void> {
        if (this.stopped.get())
            throw Error(
                "Item extraction can't continue after having finished or been stopped"
            );

        if (!this.started.get()) {
            // If extraction hasn't started yet, start it
            this.started.set(true);
            this.generatorResult = new Promise(res => (this.resolveStart = res));
            this.generator(item => {
                if (this.paused.get()) {
                    // Don't pass item to callback since generation was already paused
                    this.pausedItem = item;
                    return new Promise(res => (this.continueExtraction = res));
                } else if (!this.stopped.get()) {
                    // On standard stream mode, forward the item and return a resolved promise
                    this.itemCallback(item);
                    return Promise.resolve(false);
                } else if (!this.sentStopSignal) {
                    // When extraction stopped, first send a promise indicating it was stopped
                    this.sentStopSignal = true;
                    return Promise.resolve(true);
                } else {
                    // When extraction stopped and the generator was informed, return a promise that never resolves
                    return new Promise<false>(() => {}); // A promise that never resolves
                }
            }).then(() => {
                this.stopped.set(true);
                if (this.resolveStart) {
                    this.resolveStart();
                    this.resolveStart = null;
                }
            });
        } else if (this.paused.get()) {
            // Continue execution
            this.paused.set(false);

            if (this.pausedItem) this.itemCallback(this.pausedItem);
            if (this.continueExtraction) {
                this.continueExtraction(false);
                this.continueExtraction = null;
            }
        }

        return this.generatorResult;
    }

    /**
     * Pauses item extraction, which may be continued later
     */
    public pause(): void {
        if (this.started.get() && !this.stopped.get()) this.paused.set(true);
    }

    /**
     * Stops item extraction, which can't be continued later
     */
    public stop(): void {
        this.stopped.set(true);
        if (this.resolveStart) {
            this.resolveStart();
            this.resolveStart = null;
        }
        if (this.paused.get()) {
            this.paused.set(false);
            if (this.continueExtraction) {
                this.sentStopSignal = true;
                this.continueExtraction(true);
                this.continueExtraction = null;
            }
        }
    }

    // State getters
    /**
     * Retrieves whether the item extraction has started
     * @param hook The hook to subscribe to changes
     * @returns Whether started
     */
    public hasStarted(hook?: IDataHook): boolean {
        return this.started.get(hook);
    }

    /**
     * Retrieves whether item extraction has been paused
     * @param hook The hook to subscribe to changes
     * @returns Whether paused
     */
    public isPaused(hook?: IDataHook): boolean {
        return this.paused.get(hook);
    }

    /**
     * Retrieves whether all items were extracted from the generator
     * @param hook The hook to subscribe to changes
     * @returns Whether the generator extracted all items, or the extractor was stopped
     */
    public hasFinished(hook?: IDataHook): boolean {
        return this.stopped.get(hook);
    }
}
