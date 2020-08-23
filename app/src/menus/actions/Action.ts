import {IAction} from "./_types/IAction";
import {IActionCore} from "./_types/IActionCore";
import {ITagsOverride} from "./_types/ITagsOverride";
import {IActionBinding} from "./_types/IActionBinding";
import {IMenuItem} from "../items/_types/IMenuItem";
import {IActionParent} from "./_types/IActionParent";
import {IActionMultiResult} from "./_types/IActionMultiResult";

/** A symbol that can act as a key in a core return object to pass multiple results */
export const results = Symbol("Multiple results");

/** A symbol that can act as a key in a core return object to specify where the results came from */
export const sources = Symbol("Multiple result sources");

/** The action data type used by the action getter */
export type IActionData = {action: IAction<any, any>; data: any[]; items: IMenuItem[][]};

/**
 * A class to get action executers of a certain type for a list of items
 */
export class Action<I, O> implements IAction<I, O> {
    protected core: IActionCore<I, O>;
    protected defaultTags: any[];

    /** @override */
    public ancestors: IAction<any, any>[] = [];

    /**
     * Creates a sub action for a given action
     * @param core The action handler core
     * @param defaultTags The default tags for bindings, inherited from the parent if left out
     * @param parent The action to create the sub action for
     */
    public constructor(
        core: IActionCore<I, O>,
        defaultTags: any[],
        parent: IActionParent<O>
    );

    /**
     * Creates a new action
     * @param core The action handler core
     * @param defaultTags The default tags for bindings, defaults to ["context"] (making it a context menu action)
     */
    public constructor(core: IActionCore<I, O>, defaultTags?: any[]);
    public constructor(
        core: IActionCore<I, O>,
        defaultTags?: any[],
        parent?: IActionParent<O>
    ) {
        this.core = core;
        this.defaultTags = defaultTags || [];
        if (parent) this.ancestors = [...parent.ancestors, parent];
        else if (!defaultTags) this.defaultTags.push("context");
    }

    /**
     * Creates a new handler for this action, specifying how this action can be executed
     * @param handlerCore The function describing the execution process
     * @param defaultTags The default tags that bindings of these handlers should have, this action's default tags are inherited if left out
     * @returns The created action handler
     */
    public createHandler<T, P extends I | IActionMultiResult<AI>, AI extends I>(
        handlerCore: IActionCore<T, P>,
        defaultTags: ITagsOverride = tags => tags
    ): IAction<T, P> {
        return new Action(
            handlerCore,
            defaultTags instanceof Function ? defaultTags(this.defaultTags) : defaultTags,
            this as any
        ) as any;
    }

    /**
     * Creates a binding for this action
     * @param data The data to bind
     * @param tags The tags for the binding, inherited from the action if left out
     * @returns The binding
     */
    public createBinding<P extends I>(
        data: P,
        tags: ITagsOverride = tags => tags
    ): IActionBinding<P> {
        return {
            action: this,
            data,
            tags: tags instanceof Function ? tags(this.defaultTags) : tags,
        };
    }

    /**
     * Checks whether the item contains a direct or indirect binding for this action
     * @param item The item to check
     * @returns Whether it contains a binding
     */
    public canBeAppliedTo(item: IMenuItem): boolean {
        return !!item.actionBindings.find(
            ({action}) =>
                action == this || action.ancestors[this.ancestors.length] == this
        );
    }

    /**
     * Checks whether the given array is an items array
     * @param array The array to check
     * @returns Whether the given array is an items array
     */
    protected isItemArray(array: any[]): array is IMenuItem[] {
        return array[0] && array[0] instanceof Object && "view" in array[0];
    }

    /**
     * Adds an action input to the actions data array
     * @param actionsData The data to add the input to
     * @param action The action to add the input to
     * @param data The data to add
     * @param sourceItems The items the data came from
     */
    protected addActionInput(
        actionsData: IActionData[],
        action: IAction<any, any>,
        data: any[],
        sourceItems: IMenuItem[]
    ): void {
        let actionData = actionsData.find(({action: a}) => a == action);

        if (!actionData) {
            actionData = {action: action, data: [], items: []};
            actionsData.push(actionData);
        }

        actionData.data.push(data);
        actionData.items.push(sourceItems);
    }

    /**
     * Handlers the result of applying an action
     * @param actionsData The action data to store the results in
     * @param action The action that was executed
     * @param output The output of the execution
     * @param sourceItems The source items that were executed
     */
    protected addActionResult(
        actionsData: IActionData[],
        action: IAction<any, any>,
        output: any,
        sourceItems: IMenuItem[][]
    ): void {
        // Handle multiple results being returned
        if (typeof output == "object" && results in output) {
            const outputs = output[results] as any[];
            let items = output[sources] as IMenuItem[][];
            if (!items) {
                if (outputs.length == sourceItems.length) {
                    items = sourceItems;
                } else if (outputs.length == 1) {
                    items = [sourceItems.flat()];
                } else {
                    throw Error(
                        action.toString() +
                            " returned multiple results that don't one to one map to their sources. Therefore sources mapping should've been included: {[sources]: MenuItem[][]}"
                    );
                }
            }
            if (items.length != outputs.length) {
                throw Error(
                    action.toString() + " did not return the correct number of sources"
                );
            }
            outputs.forEach((output, i) => {
                this.addActionInput(
                    actionsData,
                    action.ancestors[action.ancestors.length - 1],
                    output,
                    items[i]
                );
            });
        }
        // Handle one result being returned
        else {
            const items = sourceItems.flat();
            this.addActionInput(
                actionsData,
                action.ancestors[action.ancestors.length - 1],
                output,
                items
            );
        }
    }

    /**
     * Retrieves the action data for a set of items, in order to be executed
     * @param items The items to get the data for
     * @returns The action execution functions
     */
    public get(items: IMenuItem[]): O;

    /**
     * Retrieves the action data for the given input data
     * @param data The data to run the core on
     * @param items The item array that the data was retrieved from, indices correspond to data indices
     * @returns The action execution functions or other data
     */
    public get(data: I[], items: IMenuItem[][]): O;
    public get(items: IMenuItem[] | I[], sourceItems?: IMenuItem[][]): O {
        // Obtain the input data from all the items
        if (this.isItemArray(items)) {
            const depth = this.ancestors.length;
            let actionsData = [] as IActionData[];

            // Collect all binding and actions
            items.forEach(item => {
                item.actionBindings.forEach(binding => {
                    if (binding.action.ancestors[depth] == this || binding.action == this)
                        this.addActionInput(actionsData, binding.action, binding.data, [
                            item,
                        ]);
                });
            });

            // Find max depth
            let greatestDepth = 0;
            actionsData.forEach(
                ({
                    action: {
                        ancestors: {length: depth},
                    },
                }) => {
                    if (depth > greatestDepth) greatestDepth = depth;
                }
            );

            // Reduce all actions to the output data
            for (let d = greatestDepth; d > depth; d--) {
                for (let i = 0; i < actionsData.length; i++) {
                    const {action, data, items: sourceItems} = actionsData[i];
                    if (action.ancestors.length == d) {
                        const output = action.get(data, sourceItems);
                        this.addActionResult(actionsData, action, output, sourceItems);
                    }
                }
            }

            // Retrieve the input data for this action
            const action = actionsData.find(
                ({action: {ancestors}}) => ancestors.length == depth
            );
            items = (action?.data || []) as I[];
            sourceItems = action?.items || [];
        }

        // Retrieve the result of this action core
        return this.core(items, sourceItems as IMenuItem[][]);
    }
}
