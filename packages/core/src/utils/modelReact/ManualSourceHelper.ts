import {IDataListener, isDataListener, isDataLoadRequest} from "model-react";

/**
 * A class to help with creating advanced manual data sources
 */
export class ManualSourceHelper {
    // Data listeners to notify when data has changed
    protected listeners: IDataListener[] = [];

    // Exceptions to pass to new listeners
    protected exceptions: readonly any[] = [];

    // Whether to pass the loading state to new listeners
    protected loading: boolean = false;

    // A callback to make when a hook requests data (re)load
    protected onLoadRequest?: (time?: number) => void;

    /**
     * Creates a new manual source helper
     * @param onLoadRequest The callback to make when a hook requests a data (re)load
     */
    public constructor(onLoadRequest?: (time?: number) => void) {
        this.onLoadRequest = onLoadRequest;
    }

    /**
     * Sets any exceptions that may have occurred in the source
     * @param exceptions The exceptions to pass to listeners
     * @param suppressUpdate Whether to suppress calling the listeners
     */
    public setExceptions(
        exceptions: any[] | readonly any[],
        suppressUpdate: boolean = this.exceptions == exceptions
    ): void {
        this.exceptions = exceptions;
        if (!suppressUpdate) this.callListeners();
    }

    /**
     * Retrieves the exceptions that the source currently indicate to have
     * @returns The exceptions
     */
    public getExceptions(): readonly any[] {
        return this.exceptions;
    }

    /**
     * Sets whether this source is loading
     * @param loading Whether the source is loading
     * @param suppressUpdate Whether to suppress calling the listeners
     */
    public setLoading(
        loading: boolean,
        suppressUpdate: boolean = this.loading == loading
    ): void {
        this.loading = loading;
        if (!suppressUpdate) this.callListeners();
    }

    /**
     * Retrieves whether the source currently indicates to be loading
     * @returns Whether the source indicates to be loading
     */
    public getLoading(): boolean {
        return this.loading;
    }

    /**
     * Adds a listener for this field
     * @param listener The listener to add
     */
    public addListener(listener?: any): void {
        if (isDataLoadRequest(listener)) {
            if (listener.markIsLoading && this.loading) listener.markIsLoading();
            if (listener.registerException)
                this.exceptions.forEach(ex => listener.registerException?.(ex));
            if (listener.refreshData && this.onLoadRequest)
                this.onLoadRequest(listener.refreshTimestamp);
        }
        if (isDataListener(listener) && this.listeners.indexOf(listener) === -1) {
            this.listeners.push(listener);
            listener.registerRemover(() => {
                const index = this.listeners.indexOf(listener);
                if (index !== -1) this.listeners.splice(index, 1);
            });
        }
    }

    /**
     * Signals all listeners that data has been altered
     */
    public callListeners(): void {
        const listenersCopy = [...this.listeners];
        listenersCopy.forEach(listener => listener.call());
    }
}
