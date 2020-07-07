import {IAction} from "./_types/IAction";
import {IActionCore} from "./_types/IActionCore";
import {ITagsOverride} from "./_types/ITagsOverride";
import {IActionBinding} from "./_types/IActionBinding";
import {IMenuItem} from "../items/_types/IMenuItem";
import {IActionInput} from "./_types/IActionInput";

type IActionData = {action: IAction<any, any>; data: any[]; items: IMenuItem[][]};

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
        parent: IAction<O, any>
    );

    /**
     * Creates a new action
     * @param core The action handler core
     * @param defaultTags The default tags for bindings
     */
    public constructor(core: IActionCore<I, O>, defaultTags?: any[]);
    public constructor(
        core: IActionCore<I, O>,
        defaultTags?: any[],
        parent?: IAction<O, any>
    ) {
        this.core = core;
        this.defaultTags = defaultTags || [];
        if (parent) this.ancestors = [...parent.ancestors, parent];
    }

    /** @override */
    public createHandler<T>(
        handlerCore: IActionCore<T, I>,
        defaultTags: ITagsOverride = tags => tags
    ): IAction<T, I> {
        return new Action(
            handlerCore,
            defaultTags instanceof Function ? defaultTags(this.defaultTags) : defaultTags,
            this
        );
    }

    /** @override */
    public createBinding(data: I, tags: ITagsOverride = tags => tags): IActionBinding<I> {
        return {
            action: this,
            data,
            tags: tags instanceof Function ? tags(this.defaultTags) : tags,
        };
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

    /** @override */
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
                for (let i = actionsData.length - 1; i >= 0; i--) {
                    const {action, data, items: sourceItems} = actionsData[i];
                    if (action.ancestors.length == d) {
                        actionsData.splice(i, 1);

                        const output = action.get(data, sourceItems);
                        const items = sourceItems.reduce(
                            (allItems, items) => allItems.concat(items),
                            [] as IMenuItem[]
                        );
                        this.addActionInput(
                            actionsData,
                            action.ancestors[d - 1],
                            output,
                            items
                        );
                    }
                }
            }

            // Retrieve the input data for this action
            items = actionsData[0].data as I[];
            sourceItems = actionsData[0].items;
        }

        // Retrieve the result of this action core
        return this.core(items, sourceItems as IMenuItem[][]);
    }
}
