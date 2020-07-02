import {IGenerator} from "./_types/IGenerator";

/**
 * A class used to extract items from a (custom) generator
 */
export class GeneratorExtractor<T> {
    protected generator: IGenerator<T>;

    protected started: boolean = false;
    protected stopped: boolean = false;

    protected itemCallback: null | ((item: T | undefined) => void);
    protected sentStopSignal: boolean = false;
    protected pausedItem: T | null; // The last item caught after pausing
    protected continueExtraction: ((stopped: boolean) => void) | null; // The function to call to get the next item after pausing

    protected generatorResult: Promise<void>;

    /**
     * Creates a new generator extractor which extract a continuous stream of items
     * @param generator The generator to extract the items from
     * @param itemCallback The callback to forward the extracted items to
     */
    public constructor(generator: IGenerator<T>) {
        this.generator = generator;
    }

    // Controls
    /**
     * Extracts the next item of
     */
    public next(): Promise<T | void> {
        if (this.stopped) return Promise.resolve(undefined);

        const returnPromise = new Promise<T | void>(res => {
            this.itemCallback = res;
        });

        if (!this.started) {
            // If extraction hasn't started yet, start it
            this.started = true;
            this.generatorResult = this.generator(item => {
                if (!this.stopped) {
                    // As long as we haven't stopped, return the item
                    if (this.itemCallback) {
                        this.itemCallback(item);
                        this.itemCallback = null;
                    }
                    return new Promise(res => (this.continueExtraction = res));
                } else if (!this.sentStopSignal) {
                    // When extraction stopped, first send a promise indicating it was stopped
                    return Promise.resolve(true);
                } else {
                    // When extraction stopped and the generator was informed, return a promise that never resolves
                    return new Promise<false>(() => {}); // A promise that never resolves
                }
            }).then(() => {
                this.stopped = true;
                if (this.itemCallback) {
                    this.itemCallback(undefined);
                    this.itemCallback = null;
                }
            });
        } else if (this.continueExtraction) {
            this.continueExtraction(false);
            this.continueExtraction = null;
        }

        return returnPromise;
    }

    /**
     * Stops item extraction, which can't be continued later
     */
    public stop(): void {
        this.stopped = true;
        if (this.continueExtraction) {
            this.sentStopSignal = true;
            this.continueExtraction(true);
            this.continueExtraction = null;
        }
    }

    // State getters
    /**
     * Retrieves whether the item extraction has started
     * @returns Whether started
     */
    public hasStarted(): boolean {
        return this.started;
    }

    /**
     * Retrieves whether all items were extracted from the generator
     * @returns Whether the generator extracted all items, or the extractor was stopped
     */
    public hasFinished(): boolean {
        return this.stopped;
    }
}
