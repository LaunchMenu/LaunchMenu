import {AbstractDataSource, IDataHook, IDataSource, isDataLoadRequest} from "model-react";

export class DataCacher<T> extends AbstractDataSource<T> implements IDataSource<T> {
    // The source of the data
    protected source: (params: IDataHook, current: T | undefined) => T;

    // The function to remove the dependency hook
    protected dependencyRemovers: (() => void)[] = [];

    // The currently cached data
    protected cached: T;

    // Status variables
    protected loading: boolean = false;
    protected exceptions: any[];
    protected lastLoadTime: number = 0;
    protected isDirty = true;

    // A function to execute when the data is changed, but after it finished computing (and once stored)
    protected onUpdate?: (value: T, previous: T | undefined) => void;

    /**
     * Creates a new data cache, used to reduce number of calls to complex data transformers
     * @param source The function to use to compute the value
     * @param config Any additional optional configuration
     */
    constructor(
        source: (
            /** The data hook to forward the sources */
            hook: IDataHook,
            /** The currently cached value */
            current: T | undefined
        ) => T,
        {
            onUpdate,
        }: {
            /** A side effect to perform after updating the now newly cached value */
            onUpdate?: (value: T, previous: T | undefined) => void;
        } = {}
    ) {
        super();
        this.source = source;
        this.onUpdate = onUpdate;
    }

    /**
     * Updates the data if there is no dependency yet, or if a newer freshTimestamp is supplied
     * @param hook Data to know whether to reload
     */
    protected updateIfRequired(params?: IDataHook): void {
        // Make sure we don't have a dependency already, unless we want to force reload
        const refreshTimestamp =
            isDataLoadRequest(params) && params.refreshData
                ? params.refreshTimestamp !== undefined &&
                  params.refreshTimestamp > this.lastLoadTime
                    ? params.refreshTimestamp
                    : undefined
                : undefined;
        if (!(this.isDirty || refreshTimestamp)) return;

        // Remove the old dependency listeners if there are any
        this.dependencyRemovers.forEach(remove => remove());
        const dependencyRemoves = (this.dependencyRemovers = [] as (() => void)[]);

        // Reset the state data
        this.exceptions = [];
        this.loading = false;
        this.lastLoadTime = Date.now();

        // If a change occurs, remove the previous dependency listener and call own listeners
        const onChange = () => {
            // Make sure this isn't an outdated dependency listener
            if (dependencyRemoves !== this.dependencyRemovers) return;

            // Remove the currently dependencies, allowing for reload
            this.dependencyRemovers.forEach(remove => remove());
            this.dependencyRemovers = [];

            // Inform our listeners
            this.isDirty = true;
            this.callListeners();
        };

        // Retrieve the new value and setup the new listener
        const prev = this.cached;
        this.isDirty = false;
        this.cached = this.source(
            {
                refreshData: true,
                refreshTimestamp,
                call: onChange,
                markIsLoading: () => {
                    this.loading = true;
                },
                registerException: exception => {
                    this.exceptions.push(exception);
                },
                registerRemover: remover => {
                    dependencyRemoves.push(remover);
                },
            },
            prev
        );

        // Perform any side effects
        this.onUpdate?.(this.cached, prev);
    }

    /**
     * Forwards the state of the retriever being cached
     * @param hook Data used to notify about state changes
     */
    protected forwardState(hook: IDataHook): void {
        if (isDataLoadRequest(hook)) {
            if (hook.registerException)
                this.exceptions.forEach(exception => hook.registerException?.(exception));
            if (this.loading && hook.markIsLoading) hook.markIsLoading();
        }
    }

    /**
     * Retrieves the value of a source
     * @param hook Data to hook into the meta state and to notify about state changes
     * @returns The value that's currently available
     */
    public get(hook: IDataHook): T {
        super.addListener(hook);
        this.updateIfRequired(hook);
        this.forwardState(hook);
        return this.cached;
    }
}
