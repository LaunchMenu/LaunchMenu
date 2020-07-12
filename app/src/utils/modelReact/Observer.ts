import {IDataRetriever, IDataSource} from "model-react";
import {IObserverListener} from "./_types/IObserverListener";

/**
 * A data hook to listen to a stream of changes
 */
export class Observer<T> {
    protected getter: IDataRetriever<T>;
    protected debounce: number;
    protected refreshData: boolean;

    protected listeners: IObserverListener<T>[] = [];
    protected callListenersTimeout: undefined | NodeJS.Timeout;

    protected isDestroyed = false;
    protected isDirty = true;

    protected hookListenerRemovers: (() => void)[] = [];
    protected value: T;
    protected exceptions: any[] = [];
    protected isLoading: boolean = false;

    /**
     * Creates a new observer
     * @param getter The target data to observe
     * @param debounce The number of milliseconds to debounce updates, -1 to forward changes synchronously, defaults to 0
     * @param refreshData Whether to force data to load if it's not present yet (won't load E.G. data loaders if false), defaults to true
     */
    public constructor(
        getter: IDataRetriever<T> | IDataSource<T>,
        debounce: number = 0,
        refreshData: boolean = true
    ) {
        this.getter = "get" in getter ? getter.get.bind(getter) : getter;
        this.debounce = debounce;
        this.refreshData = refreshData;
    }

    /**
     * Gets the data and sets up the listener for the target
     */
    protected getData(): void {
        if (this.listeners.length == 0) return;

        this.isLoading = false;
        this.exceptions = [];
        this.value = this.getter({
            call: () => {
                this.removeHookListeners();
                this.isDirty = true;

                // Setup the listener again, and call all our listeners
                this.getData();
                this.callListeners();
            },
            registerRemover: (remover: () => void) => {
                this.hookListenerRemovers.push(remover);
            },
            markIsLoading: () => {
                this.isLoading = true;
            },
            refreshData: this.refreshData,
            registerException: (exception: any) => {
                this.exceptions.push(exception);
            },
        });
        this.isDirty = false;
    }

    /**
     * Gets rid of all listeners
     */
    protected removeHookListeners(): void {
        this.hookListenerRemovers.forEach(remove => remove());
        this.hookListenerRemovers = [];
    }

    /**
     * Destroys the observer, preventing it from listening to the target
     */
    public destroy(): void {
        this.isDestroyed = true;
        this.removeHookListeners();
        this.isDirty = false;
    }

    // Listener management
    /**
     * Calls all the listeners with the loaded data
     */
    protected callListeners(): void {
        if (this.debounce == -1) {
            const meta = {isLoading: this.isLoading, exceptions: this.exceptions};
            this.listeners.forEach(listener => listener(this.value, meta));
        }
        // If the call should be debounced, only add a timer if none is present already
        else if (!this.callListenersTimeout) {
            this.callListenersTimeout = setTimeout(() => {
                this.callListenersTimeout = undefined;
                const meta = {isLoading: this.isLoading, exceptions: this.exceptions};
                this.listeners.forEach(listener => listener(this.value, meta));
            }, this.debounce);
        }
    }

    /**
     * Adds a listener to the observer
     * @param listener The listener to add
     * @param initCall Whether to call the listener with the initial value
     * @returns This, for method chaining
     */
    public listen(listener: IObserverListener<T>, initCall?: boolean): this {
        if (this.isDestroyed)
            throw Error("Listeners can't be added once the observer is destroyed");
        this.listeners.push(listener);

        if (this.isDirty) this.getData();
        if (initCall) {
            listener(this.value, {
                isLoading: this.isLoading,
                exceptions: this.exceptions,
            });
        }
        return this;
    }

    /**
     * Removes a listener from the observer
     * @param listener The listener to remove
     * @returns Whether the listener was removed
     */
    public removeListener(listener: IObserverListener<T>): boolean {
        if (this.isDestroyed)
            throw Error("Listeners can't be removed once the observer is destroyed");
        const index = this.listeners.indexOf(listener);
        if (index != -1) {
            this.listeners.splice(index, 1);
            return true;
        }
        return false;
    }
}